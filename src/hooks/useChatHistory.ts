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

  // Small wrapper: fetch with Authorization + 401 refresh retry
  async function fetchWithRefresh(path: string, init: RequestInit = {}) {
    const doFetch = async (): Promise<Response> => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("jwt") : null;
      const headers = new Headers(init.headers as HeadersInit | undefined);
      if (token) headers.set("Authorization", `Bearer ${token}`);
      if (!headers.has("Content-Type") && init.body)
        headers.set("Content-Type", "application/json");
      return fetch(`${API_URL}${path}`, { ...init, headers });
    };

    let res = await doFetch();
    if (res.status === 401) {
      try {
        const refreshToken =
          typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;
        if (refreshToken) {
          const rr = await fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          });
          if (rr.ok) {
            const data = await rr.json();
            if (data.token) localStorage.setItem("jwt", data.token);
            if (data.refreshToken)
              localStorage.setItem("refreshToken", data.refreshToken);
            res = await doFetch();
          }
        }
      } catch {}
    }
    return res;
  }

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
        if (!token) return;

        // Use the same apiFetch logic from ChatInterface with token refresh
        try {
          console.log("[history] load sessions →");
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
                    console.log("[history] retry load sessions ←", { status: retryResponse.status });
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
          console.log("[history] load sessions ←", { status: r.status });
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

  // 3) When switching to a server-backed session with no local messages, fetch them
  useEffect(() => {
    const s = sessions.find((x) => x.id === activeId);
    if (!s || !s.backendId) return;
    if (s.messages && s.messages.length > 0) return;

    (async () => {
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("jwt") : null;
        console.log("[history] load messages →", { backendId: s.backendId });
        const r = await fetch(`${API_URL}/history/${s.backendId}/messages`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!r.ok) {
          console.warn("[history] load messages failed", { status: r.status });
          return; // silent fail in UI
        }
        const data = (await r.json()) as {
          messages: Array<{
            id: string;
            role: string;
            content: string;
            legalResponse?: any;
            createdAt?: string;
          }>;
        };
        console.log("[history] load messages ←", { count: data.messages?.length ?? 0 });
        const msgs = (data.messages || []).map((m) => ({
          id: m.id,
          type:
            m.role === "user" || m.role === "assistant" || m.role === "error"
              ? (m.role as Message["type"])
              : ("assistant" as Message["type"]),
          content: m.content ?? "",
          legalResponse: m.legalResponse ?? undefined,
          timestamp: m.createdAt || new Date().toISOString(),
        }));
        setSessions((prev) =>
          prev.map((ss) => (ss.id === s.id ? { ...ss, messages: msgs } : ss))
        );
      } catch (e) {
        console.warn("[useChatHistory] load messages failed", e);
      }
    })();
  }, [activeId, sessions]);

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
      fetchWithRefresh(`/history/${sessionToDelete.backendId}`, {
        method: "DELETE",
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
      fetchWithRefresh(`/history/${session.backendId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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
        fetchWithRefresh(`/history/${active.backendId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
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
