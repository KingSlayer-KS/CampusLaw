export type Confidence = "high" | "medium" | "low";

export interface LegalResponse {
  traceId: string;
  question: string;
  jurisdiction: string; // "Ontario"
  short_answer: string[];
  what_the_law_says: { act: string; section: string; url: string; quote: string }[];
  caveats: string[];
  sources: string[];
  followups: string[];
  confidence: Confidence;
}

export interface Message {
  id: string;
  type: "user" | "assistant" | "error";
  content: string;
  legalResponse?: LegalResponse;
  timestamp: Date;
}

export type FeedbackReason =
  | "notAccurate"
  | "missingCitation"
  | "unclear"
  | "wrongJurisdiction"
  | "offTopic"
  | "other";

export type FeedbackPayload = {
  traceId: string;
  topic?: "tenancy" | "traffic";
  question: string;
  helpful: boolean;
  reasons?: FeedbackReason[];
  comment?: string;
  answerSummary?: string;
  uiVersion?: string;
};
