import { useState, useCallback } from "react";
import { Mic, MicOff, Square, Radio } from "lucide-react";
import { useVoiceStore } from "../../stores/voiceStore";

interface Props {
  isRecording: boolean;
  isSupported: boolean;
  interimTranscript: string;
  onToggle: () => void;
  onCommand: (text: string) => void;
}

/** Dictate mode: raw speech is inserted as code. Command mode: speech is parsed as a voice command. */
type MicMode = "command" | "dictate";

export default function FloatingMicPanel({
  isRecording,
  isSupported,
  interimTranscript,
  onToggle,
  onCommand,
}: Props) {
  const [mode, setMode] = useState<MicMode>("command");
  const [manualText, setManualText] = useState("");
  const { lastTranscript, lastResponse } = useVoiceStore();

  const handleModeToggle = () => {
    setMode((m) => (m === "command" ? "dictate" : "command"));
  };

  const handleManualSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!manualText.trim()) return;
      const text =
        mode === "dictate" ? `type ${manualText.trim()}` : manualText.trim();
      onCommand(text);
      setManualText("");
    },
    [manualText, mode, onCommand]
  );

  return (
    <div
      className={`floating-mic-panel${isRecording ? " recording" : ""}`}
      role="region"
      aria-label="Microphone and voice control panel"
    >
      {/* Status row */}
      <div className="mic-status-row">
        <span className={`mic-status-badge${isRecording ? " active" : ""}`}>
          {isRecording ? (
            <><Radio size={12} className="pulse-dot" aria-hidden="true" /> Listening</>
          ) : (
            <><Square size={12} aria-hidden="true" /> Idle</>
          )}
        </span>

        {/* Mode toggle */}
        <div className="mic-mode-toggle" role="group" aria-label="Mic mode">
          <button
            type="button"
            className={mode === "command" ? "mode-btn active" : "mode-btn"}
            onClick={() => setMode("command")}
            aria-pressed={mode === "command"}
            title="Command mode: speak navigation and editing commands"
          >
            🧭 Command
          </button>
          <button
            type="button"
            className={mode === "dictate" ? "mode-btn active" : "mode-btn"}
            onClick={() => setMode("dictate")}
            aria-pressed={mode === "dictate"}
            title="Dictate mode: spoken text is inserted as code"
          >
            ✏️ Dictate
          </button>
        </div>
      </div>

      {/* Big mic button */}
      {isSupported ? (
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={isRecording}
          aria-label={
            isRecording
              ? "Stop listening — click or press Ctrl+Shift+M"
              : `Start ${mode} — click or press Ctrl+Shift+M`
          }
          className={`mic-fab${isRecording ? " listening" : ""}`}
        >
          {isRecording ? (
            <MicOff size={32} aria-hidden="true" />
          ) : (
            <Mic size={32} aria-hidden="true" />
          )}
        </button>
      ) : (
        <p role="alert" className="unsupported-warning">
          Voice input not supported. Use Chrome or Edge, or type below.
        </p>
      )}

      {/* Live interim transcript */}
      {isRecording && interimTranscript && (
        <p
          className="live-transcript"
          aria-live="polite"
          aria-label="Live transcript"
        >
          <em>{interimTranscript}</em>
        </p>
      )}

      {/* Last exchange */}
      {(lastTranscript || lastResponse) && (
        <div className="mic-last-exchange">
          {lastTranscript && (
            <p className="exchange-you">
              <strong>You:</strong> {lastTranscript}
            </p>
          )}
          {lastResponse && (
            <p className="exchange-response">
              <strong>V-Code:</strong> {lastResponse}
            </p>
          )}
        </div>
      )}

      {/* Manual text fallback */}
      <form onSubmit={handleManualSubmit} className="mic-text-fallback">
        <label htmlFor="floating-text-input" className="sr-only">
          {mode === "command" ? "Type a command" : "Type code to insert"}
        </label>
        <input
          id="floating-text-input"
          type="text"
          value={manualText}
          onChange={(e) => setManualText(e.target.value)}
          placeholder={
            mode === "command"
              ? 'e.g. "go to line 5" or "explain error"'
              : 'e.g. "print hello world"'
          }
        />
        <button type="submit">Send</button>
      </form>

      {/* Shortcut hint */}
      <p className="mic-shortcut-hint">
        <kbd>Ctrl+Shift+M</kbd> to toggle · <kbd>Escape</kbd> to stop speech
      </p>
    </div>
  );
}
