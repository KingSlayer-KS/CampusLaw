// src/hooks/useChatHistory.ts
"use client";

import { useEffect, useMemo, useState } from "react";

export type Confidence = "high" | "medium" | "low";

export interface LegalResponse {
  traceId: string;
  question: string;
  jurisdiction: string;
  short_answer: string[];
  what_the_law_says: { act: string; section: string; url: string; quote: string }[];
  caveats: string[];
  sources: string[];
  followups: string[];
  confidence: Confidence;
}

export interface Message {
  id: string;
  type: "user" | "assistant" | "error";
  content: string;
  legalResponse?: LegalResponse;
  timestamp: string;
}

export interface ChatSession {
  id: string;           // local id
  backendId?: string;   // server id
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

const STORAGE_KEY = "lc.sessions.v1";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

function load(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  return [];
}

function save(sessions: ChatSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function newBlankSession(): ChatSession {
  const id = `${Date.now()}`;
  const now = new Date().toISOString();
  return { id, title: "New chat", createdAt: now, updatedAt: now, messages: [] };
}

export function useChatHistory() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // 1) Load local cache
  useEffect(() => {
    const s = load();
    setSessions(s);
    setActiveId(s[0]?.id ?? null);
  }, []);

  // 2) Hydrate from server (if logged in)
  useEffect(() => {
    (async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("jwt") : null;
        const refresh = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;
        console.log(token)
        console.log(refresh)
        if (!token) return;
        const r = await fetch(`${API_URL}/history`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
       
        if (!r.ok) return; // not logged in or server empty
        const data = await r.json() as {
          sessions: { id: string; title: string; createdAt: string; updatedAt: string }[];
        };

        // Merge: if a server session isn’t in local, add it.
        setSessions((prev) => {
          const existingByBackend = new Map(prev.map(s => [s.backendId, s]));
          const merged: ChatSession[] = [...prev];

          for (const s of data.sessions) {
            if (existingByBackend.has(s.id)) continue;
            merged.push({
              id: `srv-${s.id}`,        // local wrapper id
              backendId: s.id,
              title: s.title || "Untitled",
              createdAt: s.createdAt,
              updatedAt: s.updatedAt,
              messages: [],             // you can lazy-load messages when user opens
            });
          }

          // Sort newest first like the backend
          merged.sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1));
          return merged;
        });

        // Optionally pick the newest server session as active if none
        setActiveId((cur) => cur ?? `srv-${data.sessions[0]?.id}`);
      } catch {
        // ignore hydration errors in early dev
      }
    })();
  }, []);

  // persist local store
  useEffect(() => save(sessions), [sessions]);

  const active = useMemo(
    () => sessions.find((s) => s.id === activeId) ?? null,
    [sessions, activeId]
  );

  function createSession(): string {
    const s = newBlankSession();
    setSessions((prev) => [s, ...prev]);
    setActiveId(s.id);
    return s.id;
  }

  function selectSession(id: string) {
    setActiveId(id);
  }

  function deleteSession(id: string) {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeId === id) {
      const next = sessions.find((s) => s.id !== id)?.id ?? null;
      setActiveId(next);
    }
  }

  function renameSession(id: string, title: string) {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, title: title || "Untitled", updatedAt: new Date().toISOString() } : s
      )
    );
  }

  // bind the server id once the backend creates/returns it
  function bindBackendId(localId: string, backendId: string) {
    setSessions((prev) =>
      prev.map((s) => (s.id === localId ? { ...s, backendId } : s))
    );
  }

  // safer: add message by explicit session id (avoids "active is null" race)
  function addMessageById(sessionId: string, msg: Omit<Message, "id" | "timestamp">) {
    const m: Message = { id: `${Date.now()}`, timestamp: new Date().toISOString(), ...msg };
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, messages: [...s.messages, m], updatedAt: m.timestamp } : s
      )
    );
  }

  // legacy helper if you already set activeId
  function addMessageToActive(msg: Omit<Message, "id" | "timestamp">) {
    if (!active) return;
    addMessageById(active.id, msg);
    // auto-title on first user msg
    if (active.messages.length === 0 && (msg as any).type === "user") {
      const title = ((msg as any).content || "New chat").slice(0, 40);
      renameSession(active.id, title);
    }
  }

  return {
    sessions,
    activeId,
    active,
    setActiveId: selectSession,
    createSession,
    deleteSession,
    renameSession,
    addMessageToActive,
    addMessageById,
    bindBackendId,
  };
}
