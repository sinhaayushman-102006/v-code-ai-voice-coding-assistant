import { create } from "zustand";

interface SpeechSettings {
  rate: number; // 0.5 - 2
  pitch: number; // 0 - 2
  voiceURI: string | null;
  autoNarrate: boolean;
}

interface SettingsState {
  speech: SpeechSettings;
  speechLang: string; // BCP-47 tag for speech recognition, e.g. "en-US", "hi-IN", "bn-IN"
  fontSize: number;
  highContrast: boolean;
  reducedMotion: boolean;
  screenReaderAnnouncements: boolean;
  setSpeech: (partial: Partial<SpeechSettings>) => void;
  setSpeechLang: (lang: string) => void;
  setFontSize: (size: number) => void;
  toggleHighContrast: () => void;
  toggleReducedMotion: () => void;
  toggleAnnouncements: () => void;
}

const STORAGE_KEY = "vcode:settings";

function loadInitial(): Pick<
  SettingsState,
  "speech" | "speechLang" | "fontSize" | "highContrast" | "reducedMotion" | "screenReaderAnnouncements"
> {
  const defaults = {
    speech: { rate: 1, pitch: 1, voiceURI: null, autoNarrate: true },
    speechLang: "en-US",
    fontSize: 18,
    highContrast: false,
    reducedMotion: false,
    screenReaderAnnouncements: true,
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

function persist(state: Partial<SettingsState>) {
  try {
    const { speech, speechLang, fontSize, highContrast, reducedMotion, screenReaderAnnouncements } = state as any;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ speech, speechLang, fontSize, highContrast, reducedMotion, screenReaderAnnouncements })
    );
  } catch {
    // localStorage unavailable (private browsing etc.) -- fail silently, in-memory state still works
  }
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...loadInitial(),
  setSpeech: (partial) => {
    const speech = { ...get().speech, ...partial };
    set({ speech });
    persist({ ...get(), speech });
  },
  setSpeechLang: (speechLang) => {
    set({ speechLang });
    persist({ ...get(), speechLang });
  },
  setFontSize: (fontSize) => {
    set({ fontSize });
    persist({ ...get(), fontSize });
  },
  toggleHighContrast: () => {
    const highContrast = !get().highContrast;
    set({ highContrast });
    persist({ ...get(), highContrast });
  },
  toggleReducedMotion: () => {
    const reducedMotion = !get().reducedMotion;
    set({ reducedMotion });
    persist({ ...get(), reducedMotion });
  },
  toggleAnnouncements: () => {
    const screenReaderAnnouncements = !get().screenReaderAnnouncements;
    set({ screenReaderAnnouncements });
    persist({ ...get(), screenReaderAnnouncements });
  },
}));
