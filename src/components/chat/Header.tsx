"use client";
import { Scale } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <div className="border-b border-border bg-card text-card-foreground px-4 py-3">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary rounded-lg p-2">
            <Scale className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold">Ontario Legal Information Assistant</h2>
            <p className="text-sm text-muted-foreground">General information • Not legal advice</p>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
}
