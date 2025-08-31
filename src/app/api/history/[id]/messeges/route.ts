
// src/app/api/history/[id]/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
const API = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:4001";

function forwardAuth(req: NextRequest) {
  return (
    req.headers.get("authorization") ||
    (req.cookies.get("jwt")?.value ? `Bearer ${req.cookies.get("jwt")!.value}` : undefined)
  );
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const r = await fetch(`${API}/history/${params.id}/messages`, {
    headers: { ...(forwardAuth(req) ? { Authorization: forwardAuth(req)! } : {}) },
  });
  return new NextResponse(await r.text(), {
    status: r.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const r = await fetch(`${API}/history/${params.id}/messages`, {
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
