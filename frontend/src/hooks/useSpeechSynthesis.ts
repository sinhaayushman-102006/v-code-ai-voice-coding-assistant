import { useCallback, useEffect, useRef, useState } from "react";
import { useSettingsStore } from "../stores/settingsStore";

export function useSpeechSynthesis() {
  const { rate, pitch, voiceURI } = useSettingsStore((s) => s.speech);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const queueRef = useRef<string[]>([]);

  useEffect(() => {
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = useCallback(
    (text: string, opts?: { interrupt?: boolean }) => {
      if (!text) return;
      if (opts?.interrupt) {
        window.speechSynthesis.cancel();
        queueRef.current = [];
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;
      const chosen = voices.find((v) => v.voiceURI === voiceURI);
      if (chosen) utterance.voice = chosen;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    },
    [rate, pitch, voiceURI, voices]
  );

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const pause = useCallback(() => window.speechSynthesis.pause(), []);
  const resume = useCallback(() => window.speechSynthesis.resume(), []);

  return { speak, stop, pause, resume, isSpeaking, voices };
}
