// src/app/chat/page.tsx
"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { ChatInterface } from "@/components/ChatInterface";

export default function ChatPage() {
  return (
    <AuthGuard>
      <ChatInterface />
    </AuthGuard>
  );
}
