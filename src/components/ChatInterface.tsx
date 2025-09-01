// src/components/ChatInterface.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Send,
  Scale,
  AlertTriangle,
  ExternalLink,
  MessageSquare,
  Loader2,
  Sun,
  Moon,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import HistorySidebar, { HistoryHamburger } from "@/components/HistorySidebar";
import { UserMenu } from "@/components/UserMenu";
import { logoutDirect } from "@/lib/logout";

/** IMPORTANT: use the hook’s types to avoid drift */
import {
  useChatHistory,
  type Confidence,
  type LegalResponse,
} from "@/hooks/useChatHistory";

/* ────────────────────────────────────────────────────────────────────────────
   Tiny auth-aware fetch helper for talking to the Express backend directly.
   If you later add Next.js API proxies, you can swap API_URL to "" and keep code.
   ──────────────────────────────────────────────────────────────────────────── */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

/** Calls backend with JSON + Authorization header when jwt exists. Throws on !ok. */
// ChatInterface.tsx (or your api utils)
async function apiFetch(path: string, init: RequestInit = {}) {
  // Helper to perform a fetch and parse response as JSON or text
  async function doFetch(withAuth = true): Promise<{ ok: boolean; status: number; data: any }> {
    const token = typeof window !== "undefined" ? localStorage.getItem("jwt") : null;
    const hdrs = new Headers(init.headers as HeadersInit | undefined);
    if (!hdrs.has("Content-Type")) hdrs.set("Content-Type", "application/json");
    if (withAuth && token) hdrs.set("Authorization", `Bearer ${token}`);

    console.log("[apiFetch] →", { path, method: init.method ?? "GET" });
    const res = await fetch(`${API_URL}${path}`, { ...init, headers: hdrs });
    const raw = await res.text();
    let data: any = null;
    try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }
    console.log("[apiFetch] ←", { path, status: res.status });
    return { ok: res.ok, status: res.status, data };
  }

  let { ok, status, data } = await doFetch(true);

  // If unauthorized, attempt refresh once
  if (!ok && status === 401) {
    try {
      const refreshToken =
        typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;
      if (!refreshToken) throw new Error("No refresh token");

      const r = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      const t = await r.text();
      const refData = (() => { try { return JSON.parse(t); } catch { return {}; } })();
      if (!r.ok || !refData?.token) {
        console.warn("[apiFetch] refresh failed", { status: r.status, body: t });
        throw new Error("Refresh failed");
      }

      // persist
      localStorage.setItem("jwt", refData.token);
      if (refData.refreshToken) localStorage.setItem("refreshToken", refData.refreshToken);

      // retry original once with new token
      console.log("[apiFetch] retrying after refresh", { path });
      ({ ok, status, data } = await doFetch(true));
    } catch (e) {
      // clear tokens on hard failures
      console.error("[apiFetch] refresh error", e);
      localStorage.removeItem("jwt");
      // do not remove refreshToken to allow manual retry on next action if desired
    }
  }

  if (!ok) {
    const message =
      data && typeof data === "object" && ("message" in data || "error" in data)
        ? (data.message ?? data.error)
        : `HTTP ${status}`;
    console.warn("[apiFetch] request failed", { path, status, message });
    const err: any = new Error(message);
    err.status = status;
    err.data = data;
    throw err;
  }

  return data;
}

/* ────────────────────────────────────────────────────────────────────────────
   Small helpers
   ──────────────────────────────────────────────────────────────────────────── */
type FeedbackReason =
  | "notAccurate"
  | "missingCitation"
  | "unclear"
  | "wrongJurisdiction"
  | "offTopic"
  | "other";

type FeedbackPayload = {
  traceId: string;
  topic?: "tenancy" | "traffic";
  question: string;
  helpful: boolean;
  reasons?: FeedbackReason[];
  comment?: string;
  answerSummary?: string;
  uiVersion?: string;
  sessionId?: string;
};

async function sendFeedback(payload: FeedbackPayload) {
  return apiFetch(`/feedback`, {
    method: "POST",
    body: JSON.stringify(payload),
  }) as Promise<{ ok: true }>;
}

function shortLabel(url: string) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    const parts = u.pathname.split("/").filter(Boolean);
    const tail = parts.at(-1) ?? "";
    const shortTail = tail.length > 32 ? tail.slice(0, 29) + "…" : tail;
    return shortTail ? `${host}/${shortTail}` : host;
  } catch {
    return url;
  }
}

/* ────────────────────────────────────────────────────────────────────────────
   Theme toggle (unchanged)
   ──────────────────────────────────────────────────────────────────────────── */
function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const saved =
      typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    const prefers =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const enable = saved ? saved === "dark" : prefers;
    document.documentElement.classList.toggle("dark", enable);
    setIsDark(enable);
  }, []);
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => {
        const root = document.documentElement;
        const next = !root.classList.contains("dark");
        root.classList.toggle("dark", next);
        localStorage.setItem("theme", next ? "dark" : "light");
        setIsDark(next);
      }}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   Feedback bar (unchanged logic; uses sendFeedback)
   ──────────────────────────────────────────────────────────────────────────── */
function FeedbackBar({
  traceId,
  topic,
  question,
  summary,
  sessionId,
}: {
  traceId: string;
  topic: "tenancy" | "traffic";
  question: string;
  summary?: string;
  sessionId?: string;
}) {
  const [state, setState] = useState<"idle" | "down" | "sent">("idle");
  const [reasons, setReasons] = useState<FeedbackReason[]>([]);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);

  const toggle = (k: FeedbackReason) =>
    setReasons((xs) =>
      xs.includes(k) ? xs.filter((x) => x !== k) : [...xs, k]
    );

  const submit = async (helpful: boolean) => {
    setSending(true);
    try {
      await sendFeedback({
        traceId,
        topic,
        question,
        helpful,
        reasons: helpful ? [] : reasons,
        comment: helpful ? undefined : comment.trim() || undefined,
        answerSummary: summary,
        uiVersion: "chat-1",
        sessionId,
      });
      setState("sent");
    } catch {
      alert("Could not send feedback. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (state === "sent")
    return (
      <p className="text-xs text-muted-foreground">Thanks for the feedback!</p>
    );

  return (
    <div className="mt-3 rounded-lg border border-border p-3">
      <div className="flex items-center gap-2">
        <span className="text-sm">Was this helpful?</span>
        <button
          className="text-xs rounded-full px-2 py-1 bg-primary text-primary-foreground"
          disabled={sending}
          onClick={() => submit(true)}
        >
          👍 Yes
        </button>
        <button
          className="text-xs rounded-full px-2 py-1 bg-muted text-foreground"
          disabled={sending}
          onClick={() => setState("down")}
        >
          👎 No
        </button>
      </div>
      {state === "down" && (
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap gap-2">
            {[
              ["notAccurate", "Not accurate"],
              ["missingCitation", "Missing citation"],
              ["unclear", "Unclear"],
              ["wrongJurisdiction", "Wrong jurisdiction"],
              ["offTopic", "Off-topic"],
              ["other", "Other"],
            ].map(([k, label]) => (
              <button
                key={k}
                className={`text-xs rounded-full px-2 py-1 border ${
                  reasons.includes(k as FeedbackReason)
                    ? "bg-primary text-primary-foreground border-transparent"
                    : "bg-muted/40 text-muted-foreground border-border"
                }`}
                onClick={() => toggle(k as FeedbackReason)}
              >
                {label}
              </button>
            ))}
          </div>
          <textarea
            rows={3}
            placeholder="Optional: what should be improved?"
            className="w-full rounded-md border border-border bg-background p-2 text-sm"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="flex justify-end">
            <button
              className="text-xs rounded-md px-3 py-2 bg-primary text-primary-foreground"
              disabled={sending}
              onClick={() => submit(false)}
            >
              {sending ? "Sending..." : "Send feedback"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   Main Chat UI
   ──────────────────────────────────────────────────────────────────────────── */
export function ChatInterface() {
  const [inputValue, setInputValue] = useState("");
  const [topic] = useState<"tenancy" | "traffic">("tenancy");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // History hook is the single source of truth for local sessions/messages
  const {
    sessions,
    activeId,
    active,
    setActiveId,
    createSession,
    deleteSession,
    renameSession,
    addMessageToActive,
    /** Make sure your hook includes this; we guard below if not present */
    // @ts-ignore
    bindBackendId,
  } = useChatHistory() as any;

  // Get user info from localStorage
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("legalAssistantUser");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.warn("Failed to parse user data", e);
      }
    }
  }, []);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    try {
      if (refreshToken) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (e) {
      console.warn("[logout] backend call failed", e);
    }

    // Clear local storage
    ["jwt", "refreshToken", "currentSessionId", "legalAssistantUser"].forEach(
      (k) => localStorage.removeItem(k)
    );

    // Clear backend session IDs
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i)!;
      if (k.startsWith("backendId:")) localStorage.removeItem(k);
    }

    // Reset chat state by clearing all sessions
    sessions.forEach((session: any) => {
      if (session.id) {
        deleteSession(session.id);
      }
    });

    // Redirect to login
    window.location.href = "/";
  };

  const messages = active?.messages ?? [];
  const hasHistory = messages.length > 0;

  function ensureLocalId(): string {
    let id = localStorage.getItem("currentSessionId");
    if (!id) {
      id = crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
      localStorage.setItem("currentSessionId", id);
    }
    return id;
  }

  type Session = {
    id: string;
    title: string;
    backendId?: string;
    messages: any[];
  };

  // ensureLocalSession is not needed - useChatHistory hook handles session creation

  /* ──────────────────────────────────────────────────────────────────────────
     Utilities to map raw API result to the UI LegalResponse type
     ────────────────────────────────────────────────────────────────────────── */
  function toLegalResponse(question: string, raw: any): LegalResponse {
    if (
      Array.isArray(raw.short_answer) ||
      Array.isArray(raw.what_the_law_says)
    ) {
      return {
        traceId: raw.traceId ?? `ui-${Date.now()}`,
        question,
        jurisdiction: raw.jurisdiction ?? "Ontario",
        short_answer: raw.short_answer ?? ["No quick summary was returned."],
        what_the_law_says: (raw.what_the_law_says ?? []).map((it: any) => ({
          act: it.act ?? "Unknown Act",
          section: it.section ?? "",
          url: it.url ?? "",
          quote: it.quote ?? "",
        })),
        caveats: raw.caveats ?? [],
        sources: (raw.sources ?? [])
          .map((s: any) => (typeof s === "string" ? s : s?.url))
          .filter(Boolean),
        followups: raw.followups ?? [],
        confidence: (["high", "medium", "low"] as Confidence[]).includes(
          raw.confidence
        )
          ? raw.confidence
          : "low",
      };
    }
    const ans = raw.answer;
    if (typeof ans === "string") {
      return {
        traceId: raw.traceId ?? `ui-${Date.now()}`,
        question,
        jurisdiction: "Ontario",
        short_answer: [ans],
        what_the_law_says: [],
        caveats: [],
        sources: [],
        followups: [],
        confidence: "low",
      };
    }
    return {
      traceId: raw.traceId ?? `ui-${Date.now()}`,
      question,
      jurisdiction: "Ontario",
      short_answer: ans?.short_answer ?? ["No quick summary was returned."],
      what_the_law_says: (ans?.what_the_law_says ?? []).map((it: any) => ({
        act: it.act ?? "Unknown Act",
        section: it.section ?? "",
        url: it.url ?? "",
        quote: it.quote ?? "",
      })),
      caveats: ans?.caveats ?? [],
      sources: (ans?.sources ?? [])
        .map((s: any) => (typeof s === "string" ? s : s?.url))
        .filter(Boolean),
      followups: ans?.followups ?? [],
      confidence: (["high", "medium", "low"] as Confidence[]).includes(
        ans?.confidence
      )
        ? ans.confidence
        : "low",
    };
  }

  /* ──────────────────────────────────────────────────────────────────────────
     Ensure a backend ChatSession exists; remember its id on the local session.
     NOTE: we pass a title candidate because the local state can be stale after
           createSession() (React setState is async).
     ────────────────────────────────────────────────────────────────────────── */
  const backendCreateLocks = new Map<string, Promise<string>>();

  async function ensureBackendSession(localId: string, sessions: Session[]) {
    console.log("[ensureBackendSession] called", { localId });

    if (backendCreateLocks.has(localId)) {
      console.log(
        "[ensureBackendSession] lock hit → returning existing promise",
        { localId }
      );
      return backendCreateLocks.get(localId)!;
    }

    const p = (async () => {
      // A) Session creation is handled by useChatHistory hook
      console.log(
        "[ensureBackendSession] step A: session should already exist"
      );

      // B) if we already have a backendId in state, use it
      const inState = sessions.find((s) => s.id === localId)?.backendId;
      if (inState) {
        console.log("[ensureBackendSession] step B: found in state", {
          localId,
          backendId: inState,
        });
        return inState;
      }

      // C) if we cached one, restore it
      const cached = localStorage.getItem(`backendId:${localId}`);
      if (cached) {
        console.log("[ensureBackendSession] step C: found cached backendId", {
          localId,
          backendId: cached,
        });
        // Update sessions through the hook's bindBackendId function
        bindBackendId(localId, cached);
        return cached;
      }

      // D) create on the server
      console.log("[ensureBackendSession] step D: creating backend session", {
        localId,
      });
      const created = await apiFetch("/history", {
        method: "POST",
        body: JSON.stringify({ title: "New chat" }),
      });
      console.log("[ensureBackendSession] server responded", created);

      const backendId = created.session?.id ?? created.id;
      if (!backendId) {
        console.error(
          "[ensureBackendSession] ERROR: backend did not return id",
          { localId, created }
        );
        throw new Error("Backend did not return an id");
      }

      // E) persist + update state
      localStorage.setItem(`backendId:${localId}`, backendId);
      bindBackendId(localId, backendId);

      console.log("[ensureBackendSession] step E: persisted + updated state", {
        localId,
        backendId,
      });
      return backendId;
    })();

    backendCreateLocks.set(localId, p);
    try {
      const result = await p;
      console.log("[ensureBackendSession] success", {
        localId,
        backendId: result,
      });
      return result;
    } catch (e) {
      console.error("[ensureBackendSession] failed", {
        localId,
        error: (e as Error).message,
      });
      throw e;
    } finally {
      backendCreateLocks.delete(localId);
      console.log("[ensureBackendSession] lock released", { localId });
    }
  }

  /* ──────────────────────────────────────────────────────────────────────────
     /ask call with Authorization + server session id
     ────────────────────────────────────────────────────────────────────────── */
  const callLegalAPI = async (question: string, serverSessionId: string) => {
    const raw = await apiFetch(`/ask`, {
      method: "POST",
      body: JSON.stringify({ query: question, topic, sessionId: serverSessionId }),
    });
    return toLegalResponse(question, raw);
  };

  /* ──────────────────────────────────────────────────────────────────────────
     SEND FLOW:
       1) Ensure local + backend session
       2) Add user message (local + best-effort backend)
       3) Call /ask (authorized), add assistant message (local + best-effort backend)
       4) Auto-title first thread (local + backend)
     ────────────────────────────────────────────────────────────────────────── */
  const handleSendMessage = async () => {
    const q = inputValue.trim();
    console.log("[FE send] start", { q, isLoading, activeId });

    if (!q || isLoading) return;

    // 1) Ensure a local session id
    let sid = activeId;
    if (!sid) {
      sid = createSession(); // returns new local id
      setActiveId(sid); // async; don't rely on `active` below
      console.log("[FE send] created local session", { sid });
    }

    // Title will be auto-generated by useChatHistory hook

    // 2) Ensure a backend session id
    let serverSessionId: string | undefined = sessions.find(
      (s: any) => s.id === sid
    )?.backendId;

    if (!serverSessionId) {
      try {
        // NOTE: use the signature that matches your helper
        const newServerSessionId = await ensureBackendSession(sid, sessions);
        serverSessionId = newServerSessionId;
        console.log("[FE send] backend session ready", {
          sid,
          serverSessionId,
        });
      } catch (e) {
        console.error("[FE send] Failed creating backend session:", e);
        addMessageToActive({
          type: "error",
          content: "Could not create a chat session. Please try again.",
        });
        return; // bail — nothing else will work without a backend id
      }
    }

    // 3) Add user message locally
    addMessageToActive({ type: "user", content: q });

    // 3b) Fire-and-forget save to history
    apiFetch(`/history/${serverSessionId!}/messages`, {
      method: "POST",
      body: JSON.stringify({ role: "user", content: q }),
    }).catch((err) => console.warn("[FE send] save user message failed", err));

    setInputValue("");
    setIsLoading(true);

    try {
      // 4) Call your backend that generates the assistant reply
      const legalResponse = await callLegalAPI(q, serverSessionId!);

      // 5) Add assistant message locally
      addMessageToActive({ type: "assistant", content: "", legalResponse });

      // 5b) Save assistant message
      apiFetch(`/history/${serverSessionId!}/messages`, {
        method: "POST",
        body: JSON.stringify({
          role: "assistant",
          content: "",
          legalResponse,
          traceId: legalResponse?.traceId,
        }),
      }).catch((err) =>
        console.warn("[FE send] save assistant message failed", err)
      );

      // Auto-titling is handled by addMessageToActive in useChatHistory hook

      inputRef.current?.focus();
    } catch (e: any) {
      addMessageToActive({
        type: "error",
        content: e?.message || "Unexpected error. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleFollowupClick = (q: string) => {
    setInputValue(q);
    inputRef.current?.focus();
  };

  // Autoscroll to bottom when messages change
  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLElement | null;
    if (viewport) viewport.scrollTop = viewport.scrollHeight;
  }, [messages]);

  const getConfidenceColor = (c: Confidence) =>
    c === "high"
      ? "bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-100"
      : c === "medium"
      ? "bg-yellow-200 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100"
      : "bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-100";

  const LegalResponseDisplay = ({ response }: { response: LegalResponse }) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          <span className="sr-only">Trace ID: {response.traceId}</span>
          <span>Jurisdiction: {response.jurisdiction}</span>
        </div>
        <Badge className={getConfidenceColor(response.confidence)}>
          {response.confidence[0].toUpperCase() + response.confidence.slice(1)}{" "}
          Confidence
        </Badge>
      </div>

      <Card className="p-4 bg-card text-card-foreground border border-border">
        <div className="flex items-center space-x-2 mb-3">
          <MessageSquare className="h-4 w-4 text-primary" />
          <h4 className="font-semibold">Quick Answer</h4>
        </div>
        <ul className="space-y-2">
          {response.short_answer.map((point, idx) => (
            <li key={idx} className="flex items-start space-x-2 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </Card>

      {response.caveats.length > 0 && (
        <Alert className="border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-900/20">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="font-semibold text-amber-800 dark:text-amber-200">
                Important Limitations
              </div>
              <ul className="space-y-1">
                {response.caveats.map((caveat, idx) => (
                  <li
                    key={idx}
                    className="flex items-start space-x-2 text-sm text-amber-800 dark:text-amber-100"
                  >
                    <div className="w-1 h-1 rounded-full bg-amber-600 mt-2 flex-shrink-0" />
                    <span>{caveat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {response.followups.length > 0 && (
        <Card className="p-4 bg-card text-card-foreground border border-border">
          <h4 className="font-semibold mb-3">Related Questions</h4>
          <div className="grid grid-cols-1 gap-2">
            {response.followups.map((q, idx) => (
              <Button
                key={idx}
                variant="ghost"
                className="w-full justify-start h-auto min-h-[44px] py-3 text-left text-base sm:text-sm leading-6
                           text-muted-foreground hover:text-primary !whitespace-normal break-words"
                onClick={() => handleFollowupClick(q)}
              >
                {q}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {response.what_the_law_says.length > 0 && (
        <Card className="p-4 bg-card text-card-foreground border border-border">
          <div className="flex items-center space-x-2 mb-3">
            <Scale className="h-4 w-4 text-primary" />
            <h4 className="font-semibold">What the Law Says</h4>
          </div>
          <div className="space-y-4">
            {response.what_the_law_says.map((law, idx) => (
              <div key={idx} className="border-l-2 border-border pl-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-medium text-sm">{law.act}</span>
                  <Badge variant="outline" className="text-xs">
                    s.{law.section}
                  </Badge>
                </div>
                <blockquote className="text-sm text-muted-foreground italic mb-2">
                  “{law.quote}”
                </blockquote>
                <a
                  href={law.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center space-x-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>View full text</span>
                </a>
              </div>
            ))}
          </div>
        </Card>
      )}

      {response.sources.length > 0 && (
        <Card className="p-4 bg-card text-card-foreground border border-border">
          <h4 className="font-semibold mb-3 text-sm">Official Sources</h4>
          <div className="flex flex-wrap gap-2">
            {response.sources.map((url, idx) => (
              <a
                key={idx}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground hover:bg-accent transition-colors max-w-full"
                title={url}
              >
                <ExternalLink className="h-3 w-3 shrink-0" />
                <span className="truncate max-w-[220px] sm:max-w-[300px]">
                  {shortLabel(url)}
                </span>
              </a>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      {/* LEFT: History rail */}
      <HistorySidebar
        sessions={sessions}
        activeId={activeId}
        onSelect={(id) => {
          setActiveId(id);
          setSidebarOpen(false);
        }}
        onNew={() => {
          const id = createSession();
          setActiveId(id);
          setSidebarOpen(false);
        }}
        onDelete={deleteSession}
        onRename={renameSession}
        mobileOpen={sidebarOpen}
        setMobileOpen={setSidebarOpen}
      />

      {/* RIGHT: Main column */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border bg-card text-card-foreground px-4 py-3">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
            <div className="flex items-center gap-3">
              <HistoryHamburger onClick={() => setSidebarOpen(true)} />
              <div className="bg-primary rounded-lg p-2">
                <Scale className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold">
                  Ontario Legal Information Assistant
                </h2>
                <p className="text-sm text-muted-foreground">
                  General information • Not legal advice
                </p>
              </div>
            </div>
            <nav className="flex items-center space-x-2">
              <ThemeToggle />
              <UserMenu user={user} onLogout={handleLogout} />
            </nav>
          </div>
        </div>

        {/* First-prompt hero */}
        {!hasHistory && (
          <div className="flex-1 grid place-items-center px-4">
            <div className="w-full max-w-3xl text-center space-y-6">
              <h1 className="text-2xl sm:text-3xl font-semibold">
                Ask anything about Ontario law.
              </h1>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="w-full"
              >
                <div className="relative">
                  <button
                    type="button"
                    aria-label="Add"
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="What is a lease?"
                    className="h-14 rounded-full pl-12 pr-16 text-base bg-[var(--input-background)] text-foreground placeholder:text-muted-foreground/70 border border-border/60 hover:border-border focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:border-border caret-primary"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!inputValue.trim() || isLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full"
                    aria-label="Send"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </form>

              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "What is a lease?",
                  "Can my landlord raise rent?",
                  "How do I end a tenancy?",
                  "What happens if I get a speeding ticket?",
                ].map((s) => (
                  <Button
                    key={s}
                    variant="secondary"
                    className="rounded-full px-3 py-1 text-sm"
                    onClick={() => {
                      setInputValue(s);
                      inputRef.current?.focus();
                    }}
                  >
                    {s}
                  </Button>
                ))}
              </div>

              <p className="text-xs text-muted-foreground">
                Ontario law information only • not legal advice
              </p>
            </div>
          </div>
        )}

        {/* Chat */}
        {hasHistory && (
          <>
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="mx-auto max-w-4xl space-y-6">
                {messages.map((m: any) => (
                  <div
                    key={m.id}
                    className={`flex ${
                      m.type === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-3xl rounded-2xl p-4 shadow-sm border ${
                        m.type === "user"
                          ? "bg-neutral-900 text-neutral-50 dark:bg-neutral-800 border-transparent"
                          : m.type === "error"
                          ? "bg-destructive/10 border-destructive/20"
                          : "bg-card text-card-foreground border-border"
                      }`}
                    >
                      {m.type === "user" ? (
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {m.content}
                        </p>
                      ) : m.type === "error" ? (
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                          <p className="text-sm text-destructive">
                            {m.content}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {m.content?.trim() && (
                            <p className="text-sm text-muted-foreground">
                              {m.content}
                            </p>
                          )}
                          {m.legalResponse && (
                            <>
                              <LegalResponseDisplay
                                response={m.legalResponse}
                              />
                              <FeedbackBar
                                traceId={m.legalResponse.traceId}
                                topic={topic}
                                question={m.legalResponse.question}
                                summary={m.legalResponse.short_answer
                                  ?.slice(0, 2)
                                  .join(" • ")
                                  .slice(0, 200)}
                                sessionId={active?.backendId}
                              />
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-card text-card-foreground border border-border rounded-lg p-4 shadow-sm">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">
                          Researching Ontario law...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Composer */}
            <div className="border-t border-border bg-background p-4">
              <div className="mx-auto w-full max-w-4xl">
                <form onSubmit={onSubmit}>
                  <div className="relative">
                    <button
                      type="button"
                      aria-label="Add"
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-muted-foreground hover:text-foreground"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Ask about Ontario law (e.g., “Can my landlord raise rent?”)"
                      className="h-12 rounded-full pl-12 pr-16 bg-[var(--input-background)] text-foreground placeholder:text-muted-foreground/70 border border-border/60 hover:border-border focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:border-border caret-primary"
                      disabled={isLoading}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!inputValue.trim() || isLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full"
                      aria-label="Send"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </form>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Ontario legal information only. For legal advice, consult an
                  Ontario lawyer.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
