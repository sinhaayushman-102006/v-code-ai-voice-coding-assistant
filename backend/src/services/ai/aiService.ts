import OpenAI from "openai";
import type { AIStructuredResponse } from "@shared/types/ai";

// Talks to OpenRouter's chat completions API (OpenAI-compatible). If OPENROUTER_API_KEY
// isn't set, every function returns an honest "not configured" structured response
// rather than a fake answer -- this was a hard requirement, not a nice-to-have.
//
// OPENROUTER_MODEL defaults to a current meta-llama model; override in
// .env if you want a different one.

let client: OpenAI | null = null;
let isConfiguredFlag = false;

function getClient(): OpenAI | null {
  if (isConfiguredFlag) return client;
  
  const key = process.env.OPENROUTER_API_KEY;
  if (key) {
    client = new OpenAI({ 
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: key,
      defaultHeaders: {
        "HTTP-Referer": process.env.YOUR_SITE_URL ?? "http://localhost:5173",
        "X-Title": process.env.YOUR_SITE_NAME ?? "V-Code",
      }
    });
  }
  isConfiguredFlag = true;
  return client;
}

const NOT_CONFIGURED: AIStructuredResponse = {
  type: "chat",
  spokenResponse:
    "The AI assistant isn't configured yet. Set OPENROUTER_API_KEY in the backend's .env file to enable explanations, error help, and code generation.",
  suggestions: ["Add OPENROUTER_API_KEY to backend/.env (get one at openrouter.ai)", "Restart the backend server"],
};

const SYSTEM_PROMPT = `You are V-Code's voice-first coding tutor for blind and low-vision learners.
Always reply with ONLY a JSON object, no markdown fences, no prose outside the JSON, matching this exact shape:
{"type":"explanation"|"code"|"error_explanation"|"chat","spokenResponse":"<=2 short sentences, no code symbols read aloud literally","code":"<code or null>","language":"python"|"javascript"|null,"suggestions":["short suggestion", "..."]}
Keep spokenResponse concise (it will be read aloud by text-to-speech) and free of raw symbols like curly braces or asterisks -- describe them in words instead.`;

async function callModel(userPrompt: string): Promise<AIStructuredResponse> {
  const activeClient = getClient();
  if (!activeClient) return NOT_CONFIGURED;

  const model = process.env.OPENROUTER_MODEL ?? "meta-llama/llama-3.3-70b-instruct";

  let completion;
  try {
    completion = await activeClient.chat.completions.create({
      model: model,
      temperature: 0.4,
      max_tokens: 800,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });
  } catch (e: any) {
    const err: any = new Error(`OpenRouter API request failed: ${e?.message ?? e}`);
    err.status = e?.status && e.status >= 400 && e.status < 600 ? e.status : 502;
    err.publicMessage =
      err.status === 401
        ? "OpenRouter rejected the API key. Check OPENROUTER_API_KEY in backend/.env."
        : "The OpenRouter API returned an error. Check OPENROUTER_API_KEY and OPENROUTER_MODEL.";
    throw err;
  }

  const rawText = completion.choices?.[0]?.message?.content ?? "";

  try {
    const cleaned = rawText.replace(/^```json\s*|```$/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return {
      type: parsed.type ?? "chat",
      spokenResponse: parsed.spokenResponse ?? "I don't have a response for that.",
      code: parsed.code ?? null,
      language: parsed.language ?? undefined,
      suggestions: parsed.suggestions ?? [],
    };
  } catch {
    // Model didn't return clean JSON -- fall back to treating the raw text
    // as the spoken response rather than crashing the request.
    return { type: "chat", spokenResponse: rawText.slice(0, 500) || "I couldn't parse a response." };
  }
}

export async function chat(message: string, code?: string, language?: string): Promise<AIStructuredResponse> {
  const prompt = `The learner is working in ${language ?? "an unspecified language"}. Their current code:\n\n${code ?? "(no code yet)"}\n\nTheir message: "${message}"`;
  return callModel(prompt);
}

export async function explain(code: string, language: string): Promise<AIStructuredResponse> {
  const prompt = `Explain what this ${language} code does, in plain spoken language suitable for a blind beginner:\n\n${code}`;
  return callModel(prompt);
}

export async function explainError(errorMessage: string, code: string, language: string): Promise<AIStructuredResponse> {
  const prompt = `This ${language} code:\n\n${code}\n\nproduced this error:\n\n${errorMessage}\n\nExplain in plain spoken language why it happened and how to fix it.`;
  return callModel(prompt);
}

export async function fix(errorMessage: string, code: string, language: string): Promise<AIStructuredResponse> {
  const prompt = `This ${language} code:\n\n${code}\n\nproduced this error:\n\n${errorMessage}\n\nReturn the corrected full code in the "code" field, type "code", and a one-sentence spokenResponse describing the fix.`;
  return callModel(prompt);
}

export async function hint(exercisePrompt: string, code: string, language: string): Promise<AIStructuredResponse> {
  const prompt = `A beginner is working on this ${language} exercise: "${exercisePrompt}".\n\nTheir current code:\n\n${code || "(nothing written yet)"}\n\nGive ONE short, friendly hint that nudges them in the right direction WITHOUT revealing the full solution. Focus on what concept or step they are missing. Keep the spokenResponse to one sentence.`;
  return callModel(prompt);
}

export function isConfigured(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY);
}
