import type { Confidence } from "./types";

export function shortLabel(url: string) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    const parts = u.pathname.split("/").filter(Boolean);
    const tail = parts.at(-1) ?? "";
    const shortTail = tail.length > 32 ? tail.slice(0, 29) + "…" : tail;
    return shortTail ? `${host}/${shortTail}` : host;
  } catch {
    return url;
  }
}

export function confidenceBadge(c: Confidence) {
  return c === "high"
    ? "bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-100"
    : c === "medium"
    ? "bg-yellow-200 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100"
    : "bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-100";
}
