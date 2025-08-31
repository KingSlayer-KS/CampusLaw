// src/app/api/_proxy.ts
import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:4001";

// Optional: tiny timeout wrapper
async function withTimeout<T>(p: Promise<T>, ms = 20000): Promise<T> {
  const t = new Promise<never>((_, rej) => setTimeout(() => rej(new Error("Upstream timeout")), ms));
  return Promise.race([p, t]);
}

export async function proxyJSON(req: NextRequest, upstreamPath: string, init?: RequestInit) {
  // Forward auth: Bearer and cookies (if you’re using httpOnly cookies for auth)
  const headers = new Headers(init?.headers || {});
  const bearer = req.headers.get("authorization");
  if (bearer) headers.set("authorization", bearer);

  const cookie = req.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);

  // Ensure JSON unless caller overrides
  if (!headers.has("content-type")) headers.set("content-type", "application/json");

  // Read body only once (NextRequest body is a stream)
  const body =
    init?.body ??
    (req.method === "GET" || req.method === "HEAD" ? undefined : await req.text());

  const upstream = await withTimeout(
    fetch(`${API_URL}${upstreamPath}`, {
      method: init?.method || req.method,
      headers,
      body,
      // server-to-server fetch; no need for credentials: 'include'
    })
  );

  // Pass-through text to avoid double-JSON parsing issues
  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") || "application/json",
      // You can selectively forward set-cookie headers if needed:
      // 'set-cookie': upstream.headers.get('set-cookie') ?? ''
    },
  });
}
