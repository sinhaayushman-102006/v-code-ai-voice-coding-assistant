import { Mic, MicOff } from "lucide-react";

interface Props {
  isListening: boolean;
  isSupported: boolean;
  onToggle: () => void;
}

export default function MicButton({ isListening, isSupported, onToggle }: Props) {
  if (!isSupported) {
    return (
      <p role="alert" className="unsupported-warning">
        Voice input isn't supported in this browser. Try Chrome or Edge, or use the text input below.
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isListening}
      aria-label={isListening ? "Stop listening" : "Start listening (Ctrl+Shift+M)"}
      className={`mic-button ${isListening ? "listening" : ""}`}
    >
      {isListening ? <MicOff aria-hidden="true" /> : <Mic aria-hidden="true" />}
      <span>{isListening ? "Listening… (click to stop)" : "Click or press Ctrl+Shift+M to talk"}</span>
    </button>
  );
}
