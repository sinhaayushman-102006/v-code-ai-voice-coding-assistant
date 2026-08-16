import type { AIChatRequest, AIStructuredResponse } from "@shared/types/ai";

// All AI calls go through the backend (/api/ai/*) -- the frontend never
// holds an API key. If the backend has no GROQ_API_KEY configured, it returns
// a clear, honest "not configured" structured response rather than a fake
// answer (see backend/src/services/ai/aiService.ts).

const BASE = "/api/ai";

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`AI request failed (${res.status})`);
  }
  return res.json();
}

export async function chatWithAI(req: AIChatRequest): Promise<AIStructuredResponse> {
  return post<AIStructuredResponse>("/chat", req);
}

export async function explainCode(code: string, language: string): Promise<AIStructuredResponse> {
  return post<AIStructuredResponse>("/explain", { code, language });
}

export async function explainErrorWithAI(
  errorMessage: string,
  code: string,
  language: string
): Promise<AIStructuredResponse> {
  return post<AIStructuredResponse>("/explain-error", { errorMessage, code, language });
}

export async function fixCodeWithAI(
  errorMessage: string,
  code: string,
  language: string
): Promise<AIStructuredResponse> {
  return post<AIStructuredResponse>("/fix", { errorMessage, code, language });
}

export async function getHint(
  exercisePrompt: string,
  code: string,
  language: string
): Promise<AIStructuredResponse> {
  return post<AIStructuredResponse>("/hint", { exercisePrompt, code, language });
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("audio", audioBlob, "audio.webm");

  const res = await fetch(`${BASE}/audio/transcribe`, {
    method: "POST",
    body: formData,
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Failed to transcribe audio");
  }
  
  const data = await res.json();
  return data.text;
}
