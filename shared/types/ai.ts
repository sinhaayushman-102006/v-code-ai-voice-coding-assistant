export type AIResponseType = "explanation" | "code" | "error_explanation" | "chat";

export interface AIStructuredResponse {
  type: AIResponseType;
  spokenResponse: string;
  code?: string | null;
  language?: string;
  suggestions?: string[];
}

export interface AIChatRequest {
  message: string;
  code?: string;
  language?: string;
  history?: { role: "user" | "assistant"; content: string }[];
}
