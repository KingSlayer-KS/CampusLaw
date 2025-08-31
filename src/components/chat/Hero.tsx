"use client";
import { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2, Send } from "lucide-react";

export default function Hero({
  value,
  setValue,
  onSubmit,
  isLoading,
  inputRef,
}: {
  value: string;
  setValue: (s: string) => void;
  onSubmit: (e: FormEvent) => void;
  isLoading: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
}) {
  return (
    <div className="flex-1 grid place-items-center px-4">
      <div className="w-full max-w-3xl text-center space-y-6">
        <h1 className="text-2xl sm:text-3xl font-semibold">Ask anything about Ontario law.</h1>
        <form onSubmit={onSubmit} className="w-full">
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
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="What is a lease?"
              className="h-14 rounded-full pl-12 pr-16 text-base bg-[var(--input-background)] text-foreground placeholder:text-muted-foreground/70 border border-border/60 hover:border-border focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:border-border caret-primary"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!value.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full"
              aria-label="Send"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
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
                setValue(s);
                inputRef.current?.focus();
              }}
            >
              {s}
            </Button>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">Ontario law information only • not legal advice</p>
      </div>
    </div>
  );
}
