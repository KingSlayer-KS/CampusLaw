// src/app/api/history/route.ts
import { log } from "console";
import { NextRequest, NextResponse } from "next/server";
const API = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:4001";

function forwardAuth(req: NextRequest) {
  return (
    req.headers.get("authorization") ||
    (req.cookies.get("jwt")?.value ? `Bearer ${req.cookies.get("jwt")!.value}` : undefined)
  );

}
// console.log(forwardAuth)

// GET /api/history -> list sessions
export async function GET(req: NextRequest) {
  console.log(forwardAuth(req))
  const r = await fetch(`${API}/history`, {
    headers: {
      ...(forwardAuth(req) ? { Authorization: forwardAuth(req)! } : {}),
    },
    
  });


  console.log(r)
  return new NextResponse(await r.text(), {
    status: r.status,
    headers: { "Content-Type": "application/json" },
  });
}

// POST /api/history -> create a session
export async function POST(req: NextRequest) {
  const r = await fetch(`${API}/history`, {
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

