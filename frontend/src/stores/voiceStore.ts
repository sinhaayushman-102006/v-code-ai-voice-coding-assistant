import { create } from "zustand";

interface VoiceState {
  lastTranscript: string;
  lastResponse: string;
  history: { transcript: string; response: string }[];
  setExchange: (transcript: string, response: string) => void;
}

export const useVoiceStore = create<VoiceState>((set, get) => ({
  lastTranscript: "",
  lastResponse: "",
  history: [],
  setExchange: (transcript, response) => {
    set({
      lastTranscript: transcript,
      lastResponse: response,
      history: [...get().history.slice(-19), { transcript, response }],
    });
  },
}));
