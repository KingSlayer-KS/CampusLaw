export type FrontendAnswer = {
    question: string;
    jurisdiction: "Ontario";
    short_answer: string[];
    what_the_law_says: { act: string; section: string; url: string; quote: string }[];
    process_and_forms?: { step: string; forms?: { name: string; url: string }[] }[];
    caveats?: string[];
    sources: { title?: string; url: string }[];
    followups: string[];
    confidence: "high" | "medium" | "low";
  };
  
  export async function ask(payload: {
    query: string;
    topic?: "tenancy" | "traffic";
    facts?: Record<string, unknown>;
    goal?: string;
    language?: string;
  }) {
    const r = await fetch("/api/ask", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!r.ok) throw new Error(`Ask failed: ${r.status}`);
    return (await r.json()) as { answer: FrontendAnswer; cites: any[]; traceId: string };
  }
  