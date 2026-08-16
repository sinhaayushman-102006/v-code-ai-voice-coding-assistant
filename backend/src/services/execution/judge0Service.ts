import type { RunResult, SupportedLanguage } from "@shared/types/code";

// Real Judge0 integration for languages that need a true isolated sandbox
// (Python, in this MVP). Requires JUDGE0_API_URL and JUDGE0_API_KEY --
// without them this throws a clear configuration error rather than
// pretending to run the code.
const LANGUAGE_IDS: Partial<Record<SupportedLanguage, number>> = {
  python: 71, // Python 3 on Judge0 CE
  javascript: 63, // Node.js -- available here too, but we prefer the local executor by default
};

export async function isConfigured(): Promise<boolean> {
  return Boolean(process.env.JUDGE0_API_URL && process.env.JUDGE0_API_KEY);
}

export async function runOnJudge0(code: string, language: SupportedLanguage): Promise<RunResult> {
  const url = process.env.JUDGE0_API_URL;
  const key = process.env.JUDGE0_API_KEY;
  if (!url || !key) {
    const err: any = new Error("Judge0 is not configured");
    err.status = 501;
    err.publicMessage =
      "Running Python requires Judge0 to be configured (JUDGE0_API_URL and JUDGE0_API_KEY in backend/.env). JavaScript runs locally without any extra setup.";
    throw err;
  }

  const languageId = LANGUAGE_IDS[language];
  if (!languageId) {
    const err: any = new Error(`Unsupported language for Judge0: ${language}`);
    err.status = 400;
    err.publicMessage = `${language} isn't supported yet.`;
    throw err;
  }

  const start = Date.now();
  const submitRes = await fetch(`${url}/submissions?base64_encoded=false&wait=true`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-RapidAPI-Key": key,
    },
    body: JSON.stringify({ source_code: code, language_id: languageId }),
  });

  if (!submitRes.ok) {
    const text = await submitRes.text().catch(() => "");
    const err: any = new Error(`Judge0 responded ${submitRes.status}: ${text}`);
    err.status = 502;
    err.publicMessage = "The code execution sandbox returned an error.";
    throw err;
  }

  const result = (await submitRes.json()) as any;
  return {
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? result.compile_output ?? "",
    exitCode: result.status?.id === 3 ? 0 : 1,
    sandboxed: true,
    durationMs: Date.now() - start,
  };
}
