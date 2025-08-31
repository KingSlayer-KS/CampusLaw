import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:4001";

export async function POST(req: NextRequest) {
  const body = await req.text(); // forward raw JSON
  const headers = new Headers({ "content-type": "application/json" });

  const upstream = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers,
    body,
  });

  const text = await upstream.text();
  const res = new NextResponse(text, {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") || "application/json",
    },
  });

  // pass through any Set-Cookie (if backend sets cookies)
  const setCookie = upstream.headers.get("set-cookie");
  if (setCookie) res.headers.set("set-cookie", setCookie);

  return res;
}
