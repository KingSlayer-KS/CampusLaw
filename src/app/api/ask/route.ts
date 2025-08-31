// src/app/api/ask/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:4001";

export async function POST(req: NextRequest) {
  const body = await req.text();

  // Forward Authorization from client -> Next -> Express
  const fwdAuth =
    req.headers.get("authorization") ||
    (req.cookies.get("jwt")?.value ? `Bearer ${req.cookies.get("jwt")!.value}` : undefined);

  const r = await fetch(`${API_URL}/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(fwdAuth ? { Authorization: fwdAuth } : {}),
    },
    body,
  });

  const text = await r.text();
  return new NextResponse(text, {
    status: r.status,
    headers: { "Content-Type": "application/json" },
  });
}
