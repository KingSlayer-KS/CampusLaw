import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:4001";

export async function POST(req: NextRequest) {
  // read once as text and pass through verbatim
  const body = await req.text();

  const upstream = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body, // expects: { "refreshToken": "..." }
  });

  const text = await upstream.text();
  const res = new NextResponse(text, {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") || "application/json",
    },
  });

  // pass through any Set-Cookie from backend (if you ever use cookies)
  const setCookie = upstream.headers.get("set-cookie");
  if (setCookie) res.headers.set("set-cookie", setCookie);

  return res;
}