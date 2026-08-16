import type { RunResult, SupportedLanguage } from "../types/shared";

// Sends code to the backend to run. The backend decides whether to use
// Judge0 (real sandboxed multi-language execution, needs JUDGE0_API_KEY) or
// the local fallback executor (JavaScript only, Node vm-sandboxed, works
// with zero configuration -- see backend/src/services/execution).
export async function runCode(code: string, language: SupportedLanguage): Promise<RunResult> {
  const res = await fetch("/api/code/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, language }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Execution failed (${res.status})`);
  }
  return res.json();
}
