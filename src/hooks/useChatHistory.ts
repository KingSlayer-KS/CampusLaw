// src/hooks/useChatHistory.ts
"use client";

import { useEffect, useMemo, useState } from "react";

export type Confidence = "high" | "medium" | "low";

export interface LegalResponse {
  traceId: string;
  question: string;
  jurisdiction: string;
  short_answer: string[];
  what_the_law_says: {
    act: string;
    section: string;
    url: string;
    quote: string;
  }[];
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
  id: string; // local id
  backendId?: string; // server id
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
  return {
    id,
    title: "New chat",
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
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
        const token =
          typeof window !== "undefined" ? localStorage.getItem("jwt") : null;
        const refresh =
          typeof window !== "undefined"
            ? localStorage.getItem("refreshToken")
            : null;
        console.log(token);
        console.log(refresh);
        if (!token) return;

        // Use the same apiFetch logic from ChatInterface with token refresh
        try {
          const r = await fetch(`${API_URL}/history`, {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          });

          if (!r.ok) {
            // If 401, try to refresh token once
            if (r.status === 401) {
              const refreshToken =
                typeof window !== "undefined"
                  ? localStorage.getItem("refreshToken")
                  : null;
              if (refreshToken) {
                try {
                  const refreshResponse = await fetch(
                    `${API_URL}/auth/refresh`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ refreshToken }),
                    }
                  );

                  if (refreshResponse.ok) {
                    const refreshData = await refreshResponse.json();
                    if (refreshData.token)
                      localStorage.setItem("jwt", refreshData.token);
                    if (refreshData.refreshToken)
                      localStorage.setItem(
                        "refreshToken",
                        refreshData.refreshToken
                      );

                    // Retry with new token
                    const retryResponse = await fetch(`${API_URL}/history`, {
                      headers: { Authorization: `Bearer ${refreshData.token}` },
                      credentials: "include",
                    });

                    if (!retryResponse.ok) return;
                    const retryData = (await retryResponse.json()) as {
                      sessions: {
                        id: string;
                        title: string;
                        createdAt: string;
                        updatedAt: string;
                      }[];
                    };

                    // Process the data (moved below)
                    // Merge: if a server session isn't in local, add it.
                    setSessions((prev) => {
                      const existingByBackend = new Map(
                        prev.map((s) => [s.backendId, s])
                      );
                      const merged: ChatSession[] = [...prev];

                      for (const s of retryData.sessions) {
                        if (existingByBackend.has(s.id)) continue;
                        merged.push({
                          id: `srv-${s.id}`, // local wrapper id
                          backendId: s.id,
                          title: s.title || "Untitled",
                          createdAt: s.createdAt,
                          updatedAt: s.updatedAt,
                          messages: [], // you can lazy-load messages when user opens
                        });
                      }

                      // Sort newest first like the backend
                      merged.sort((a, b) =>
                        b.updatedAt > a.updatedAt ? 1 : -1
                      );
                      return merged;
                    });

                    // Optionally pick the newest server session as active if none
                    setActiveId(
                      (cur) => cur ?? `srv-${retryData.sessions[0]?.id}`
                    );
                    return; // Success, exit early
                  }
                } catch (refreshError) {
                  console.warn(
                    "[useChatHistory] Token refresh failed:",
                    refreshError
                  );
                }
              }

              // Clear invalid tokens
              localStorage.removeItem("jwt");
              localStorage.removeItem("refreshToken");
            }
            return; // Failed to authenticate
          }

          // Process successful response
          const responseData = (await r.json()) as {
            sessions: {
              id: string;
              title: string;
              createdAt: string;
              updatedAt: string;
            }[];
          };

          // Merge: if a server session isn't in local, add it.
          setSessions((prev) => {
            const existingByBackend = new Map(
              prev.map((s) => [s.backendId, s])
            );
            const merged: ChatSession[] = [...prev];

            for (const s of responseData.sessions) {
              if (existingByBackend.has(s.id)) continue;
              merged.push({
                id: `srv-${s.id}`, // local wrapper id
                backendId: s.id,
                title: s.title || "Untitled",
                createdAt: s.createdAt,
                updatedAt: s.updatedAt,
                messages: [], // you can lazy-load messages when user opens
              });
            }

            // Sort newest first like the backend
            merged.sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1));
            return merged;
          });

          // Optionally pick the newest server session as active if none
          setActiveId((cur) => cur ?? `srv-${responseData.sessions[0]?.id}`);
        } catch (fetchError) {
          console.warn("[useChatHistory] Failed to fetch history:", fetchError);
          return;
        }
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
    console.log("[useChatHistory] creating new session:", s);
    setSessions((prev) => [s, ...prev]);
    setActiveId(s.id);
    return s.id;
  }

  function selectSession(id: string) {
    setActiveId(id);
  }

  function deleteSession(id: string) {
    const sessionToDelete = sessions.find((s) => s.id === id);

    // Delete from local state
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeId === id) {
      const next = sessions.find((s) => s.id !== id)?.id ?? null;
      setActiveId(next);
    }

    // Also delete from backend if we have a backendId
    if (sessionToDelete?.backendId) {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("jwt") : null;
      fetch(`${API_URL}/history/${sessionToDelete.backendId}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }).catch((err) =>
        console.warn("[useChatHistory] delete from backend failed", err)
      );
    }
  }

  function renameSession(id: string, title: string) {
    const session = sessions.find((s) => s.id === id);

    setSessions((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              title: title || "Untitled",
              updatedAt: new Date().toISOString(),
            }
          : s
      )
    );

    // Also sync with backend if we have a backendId
    if (session?.backendId) {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("jwt") : null;
      fetch(`${API_URL}/history/${session.backendId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ title }),
      }).catch((err) =>
        console.warn("[useChatHistory] sync rename to backend failed", err)
      );
    }
  }

  // bind the server id once the backend creates/returns it
  function bindBackendId(localId: string, backendId: string) {
    setSessions((prev) =>
      prev.map((s) => (s.id === localId ? { ...s, backendId } : s))
    );
  }

  // safer: add message by explicit session id (avoids "active is null" race)
  function addMessageById(
    sessionId: string,
    msg: Omit<Message, "id" | "timestamp">
  ) {
    const m: Message = {
      id: `${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...msg,
    };
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, messages: [...s.messages, m], updatedAt: m.timestamp }
          : s
      )
    );
  }

  // legacy helper if you already set activeId
  function addMessageToActive(msg: Omit<Message, "id" | "timestamp">) {
    if (!active) return;

    // Check if this is the first user message and we should auto-title
    const shouldAutoTitle =
      (msg as any).type === "user" &&
      active.messages.length === 0 &&
      (active.title === "New chat" || !active.title);

    console.log("[addMessageToActive] auto-title check:", {
      isUser: (msg as any).type === "user",
      messageCount: active.messages.length,
      currentTitle: active.title,
      shouldAutoTitle,
      content: (msg as any).content,
    });

    addMessageById(active.id, msg);

    // auto-title on first user msg
    if (shouldAutoTitle) {
      const title = ((msg as any).content || "New chat").slice(0, 40);
      console.log("[addMessageToActive] auto-titling with:", title);
      renameSession(active.id, title);

      // Also sync with backend if we have a backendId
      if (active.backendId) {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("jwt") : null;
        fetch(`${API_URL}/history/${active.backendId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ title }),
        }).catch((err) =>
          console.warn("[useChatHistory] sync title to backend failed", err)
        );
      }
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
