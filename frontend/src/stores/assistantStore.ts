import { create } from "zustand";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestions?: string[];
}

interface AssistantState {
  messages: ChatMessage[];
  isThinking: boolean;
  addMessage: (msg: Omit<ChatMessage, "id">) => void;
  setThinking: (t: boolean) => void;
  clear: () => void;
}

export const useAssistantStore = create<AssistantState>((set, get) => ({
  messages: [],
  isThinking: false,
  addMessage: (msg) => set({ messages: [...get().messages, { ...msg, id: crypto.randomUUID() }] }),
  setThinking: (isThinking) => set({ isThinking }),
  clear: () => set({ messages: [] }),
}));
