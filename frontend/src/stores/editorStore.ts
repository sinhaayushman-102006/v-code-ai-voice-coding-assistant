import { create } from "zustand";
import type { SupportedLanguage } from "../types/shared";

interface EditorState {
  code: string;
  language: SupportedLanguage;
  cursorLine: number;
  lastError: string | null;
  isRunning: boolean;
  output: { stdout: string; stderr: string } | null;
  setCode: (code: string) => void;
  setLanguage: (language: SupportedLanguage) => void;
  setCursorLine: (line: number) => void;
  setError: (err: string | null) => void;
  setRunning: (running: boolean) => void;
  setOutput: (output: { stdout: string; stderr: string } | null) => void;
}

const STARTER: Record<SupportedLanguage, string> = {
  python: `# Say "create a function called add" or start typing.\n`,
  javascript: `// Say "create a function called add" or start typing.\n`,
};

export const useEditorStore = create<EditorState>((set, get) => ({
  code: STARTER.python,
  language: "python",
  cursorLine: 1,
  lastError: null,
  isRunning: false,
  output: null,
  setCode: (code) => set({ code }),
  setLanguage: (language) => {
    // Only reset to starter code if the buffer is still the untouched starter
    const current = get().code;
    const isUntouched = Object.values(STARTER).includes(current);
    set({ language, code: isUntouched ? STARTER[language] : current });
  },
  setCursorLine: (cursorLine) => set({ cursorLine }),
  setError: (lastError) => set({ lastError }),
  setRunning: (isRunning) => set({ isRunning }),
  setOutput: (output) => set({ output }),
}));
