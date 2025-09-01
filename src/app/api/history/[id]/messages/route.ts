// src/app/api/history/[id]/messages/route.ts
import { NextResponse } from "next/server";
const API = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:4001";

function forwardAuth(req: Request) {
  const bearer = req.headers.get("authorization");
  if (bearer) return bearer;
  const cookie = req.headers.get("cookie") || "";
  const m = cookie.match(/(?:^|; )jwt=([^;]+)/);
  return m ? `Bearer ${decodeURIComponent(m[1])}` : undefined;
}

function extractIdFromUrl(url: string): string | undefined {
  try {
    const { pathname } = new URL(url);
    const m = pathname.match(/\/api\/history\/([^/]+)\/messages/);
    return m?.[1];
  } catch {
    return undefined;
  }
}

export async function GET(req: Request) {
  const id = extractIdFromUrl(req.url);
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });
  const r = await fetch(`${API}/history/${id}/messages`, {
    headers: { ...(forwardAuth(req) ? { Authorization: forwardAuth(req)! } : {}) },
  });
  return new NextResponse(await r.text(), {
    status: r.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: Request) {
  const id = extractIdFromUrl(req.url);
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });
  const r = await fetch(`${API}/history/${id}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(forwardAuth(req) ? { Authorization: forwardAuth(req)! } : {}),
    },
    body: await req.text(),
  });
  return new NextResponse(await r.text(), {
    status: r.status,
    headers: { "Content-Type": "application/json" },
  });
}
