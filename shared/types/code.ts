export type SupportedLanguage = "python" | "javascript";

export interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  /** True if this came from a real sandbox vs. the local fallback executor */
  sandboxed: boolean;
  durationMs: number;
}

export interface ExplainedError {
  originalMessage: string;
  spokenExplanation: string;
  suggestion?: string;
  line?: number;
}
