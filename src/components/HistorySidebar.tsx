// src/components/HistorySidebar.tsx
"use client";

import { useMemo, useState } from "react";
import { ChatSession } from "@/hooks/useChatHistory";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit3, Menu, X, Clock } from "lucide-react";

/** Simple classnames helper in case you don't have one */
function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

type Props = {
  sessions: ChatSession[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  /** mobile drawer control */
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
};

export default function HistorySidebar({
  sessions,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onRename,
  mobileOpen,
  setMobileOpen,
}: Props) {
  const [hoverId, setHoverId] = useState<string | null>(null);

  /** Sort by updatedAt desc just in case upstream didn’t */
  const ordered = useMemo(() => {
    return [...sessions].sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1));
  }, [sessions]);

  const renderUpdated = (iso?: string) => {
    if (!iso) return null;
    try {
      const d = new Date(iso);
      // Compact timestamp: today -> time; otherwise -> short date
      const now = new Date();
      const sameDay =
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate();
      const fmt = new Intl.DateTimeFormat(undefined, sameDay
        ? { hour: "numeric", minute: "2-digit" }
        : { month: "short", day: "numeric" });
      return fmt.format(d);
    } catch {
      return null;
    }
  };

  const List = (
    <div className="h-full flex flex-col bg-card text-card-foreground border-r border-border">
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-border">
        <div className="font-semibold text-sm">History</div>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" onClick={onNew} aria-label="New chat">
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close history"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Sessions */}
      <div className="flex-1 overflow-auto p-2 space-y-1">
        {ordered.length === 0 && (
          <div className="text-xs text-muted-foreground p-2">No conversations yet.</div>
        )}

        {ordered.map((s) => {
          const isActive = activeId === s.id;
          const updated = renderUpdated(s.updatedAt);

          return (
            <div
              key={s.id}
              onMouseEnter={() => setHoverId(s.id)}
              onMouseLeave={() => setHoverId((x) => (x === s.id ? null : x))}
              className={cx(
                "group rounded-md px-2 py-2 cursor-pointer border border-transparent",
                "focus-within:ring-2 focus-within:ring-ring/30",
                isActive ? "bg-muted text-foreground" : "hover:bg-muted/50"
              )}
              onClick={() => onSelect(s.id)}
              title={s.title}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onSelect(s.id);
              }}
            >
              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {s.title || "Untitled"}
                  </div>
                  {updated && (
                    <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Updated {updated}</span>
                    </div>
                  )}
                </div>

                {(hoverId === s.id || isActive) && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      className="p-1 rounded hover:bg-background"
                      onClick={(e) => {
                        e.stopPropagation();
                        const t = prompt("Rename chat", s.title || "Untitled");
                        if (t != null) onRename(s.id, t.trim() || "Untitled");
                      }}
                      title="Rename"
                      aria-label={`Rename ${s.title || "chat"}`}
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      className="p-1 rounded hover:bg-background"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Delete this chat?")) onDelete(s.id);
                      }}
                      title="Delete"
                      aria-label={`Delete ${s.title || "chat"}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop rail */}
      <aside className="hidden md:block md:w-72 md:flex-shrink-0">{List}</aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden">
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] shadow-lg">{List}</div>
        </div>
      )}
    </>
  );
}

/** Put this button in your header for mobile */
export function HistoryHamburger({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden"
      onClick={onClick}
      aria-label="Open history"
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}
