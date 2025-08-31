// src/app/chat/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChatInterface } from "@/components/ChatInterface";

export default function ChatPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // // 🔒 Real guard (enable when you want auth)
    // const token = localStorage.getItem("jwt");
    // if (!token) {
    //   router.replace("/login");
    //   return;
    // }
    // setReady(true);
  }, [router]);

  // ⛳ For testing without auth, just do:
  useEffect(() => setReady(true), []);

  if (!ready) return null; // or a skeleton/spinner
  return <ChatInterface />;
}
