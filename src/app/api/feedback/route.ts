import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:4001";

function forwardAuth(req: NextRequest) {
  return (
    req.headers.get("authorization") ||
    (req.cookies.get("jwt")?.value ? `Bearer ${req.cookies.get("jwt")!.value}` : undefined)
  );
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const auth = forwardAuth(req);
  if (auth) headers["Authorization"] = auth;

  const r = await fetch(`${API_URL}/feedback`, {
    method: "POST",
    headers,
    body,
  });
  const text = await r.text();
  return new NextResponse(text, {
    status: r.status,
    headers: { "Content-Type": "application/json" },
  });
}
