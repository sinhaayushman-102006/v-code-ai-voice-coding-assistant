import { useVoiceStore } from "../../stores/voiceStore";

export default function VoiceStatus() {
  const { lastTranscript, lastResponse } = useVoiceStore();
  return (
    <div id="voice-controls" aria-labelledby="voice-status-heading" className="voice-status">
      <h2 id="voice-status-heading" className="sr-only">Voice status</h2>
      <p><strong>You said:</strong> {lastTranscript || "—"}</p>
      <p><strong>V-Code said:</strong> {lastResponse || "—"}</p>
    </div>
  );
}
