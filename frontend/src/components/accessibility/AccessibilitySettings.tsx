import { useSettingsStore } from "../../stores/settingsStore";
import { useSpeechSynthesis } from "../../hooks/useSpeechSynthesis";

const SPEECH_LANGUAGES = [
  { label: "English (en-US)", value: "en-US" },
  { label: "Hindi — हिन्दी (hi-IN)", value: "hi-IN" },
  { label: "Bengali — বাংলা (bn-IN)", value: "bn-IN" },
];

export default function AccessibilitySettings() {
  const {
    speech, speechLang, fontSize, highContrast, reducedMotion, screenReaderAnnouncements,
    setSpeech, setSpeechLang, setFontSize, toggleHighContrast, toggleReducedMotion, toggleAnnouncements,
  } = useSettingsStore();
  const { voices } = useSpeechSynthesis();

  return (
    <section aria-labelledby="a11y-settings-heading" className="settings-panel">
      <h2 id="a11y-settings-heading">Accessibility Settings</h2>

      <div className="setting-row">
        <label htmlFor="speech-rate">Speech rate: {speech.rate.toFixed(1)}x</label>
        <input
          id="speech-rate"
          type="range"
          min={0.5}
          max={2}
          step={0.1}
          value={speech.rate}
          onChange={(e) => setSpeech({ rate: Number(e.target.value) })}
        />
      </div>

      <div className="setting-row">
        <label htmlFor="speech-pitch">Speech pitch: {speech.pitch.toFixed(1)}</label>
        <input
          id="speech-pitch"
          type="range"
          min={0}
          max={2}
          step={0.1}
          value={speech.pitch}
          onChange={(e) => setSpeech({ pitch: Number(e.target.value) })}
        />
      </div>

      <div className="setting-row">
        <label htmlFor="voice-select">Voice (text-to-speech)</label>
        <select
          id="voice-select"
          value={speech.voiceURI ?? ""}
          onChange={(e) => setSpeech({ voiceURI: e.target.value || null })}
        >
          <option value="">System default</option>
          {voices.map((v) => (
            <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>
          ))}
        </select>
      </div>

      <div className="setting-row">
        <label htmlFor="speech-lang">Speech recognition language</label>
        <select
          id="speech-lang"
          value={speechLang}
          onChange={(e) => setSpeechLang(e.target.value)}
        >
          {SPEECH_LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>
      </div>

      <div className="setting-row">
        <label htmlFor="font-size">Font size: {fontSize}px</label>
        <input
          id="font-size"
          type="range"
          min={12}
          max={32}
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
        />
      </div>

      <div className="setting-row checkbox-row">
        <input id="auto-narrate" type="checkbox" checked={speech.autoNarrate}
          onChange={(e) => setSpeech({ autoNarrate: e.target.checked })} />
        <label htmlFor="auto-narrate">Automatically narrate new lines as I type</label>
      </div>

      <div className="setting-row checkbox-row">
        <input id="high-contrast" type="checkbox" checked={highContrast} onChange={toggleHighContrast} />
        <label htmlFor="high-contrast">High contrast mode</label>
      </div>

      <div className="setting-row checkbox-row">
        <input id="reduced-motion" type="checkbox" checked={reducedMotion} onChange={toggleReducedMotion} />
        <label htmlFor="reduced-motion">Reduce motion</label>
      </div>

      <div className="setting-row checkbox-row">
        <input id="sr-announcements" type="checkbox" checked={screenReaderAnnouncements} onChange={toggleAnnouncements} />
        <label htmlFor="sr-announcements">Enable screen-reader status announcements</label>
      </div>

      <div className="setting-row keyboard-shortcuts-row">
        <h3>Keyboard Shortcuts</h3>
        <table className="shortcuts-table">
          <tbody>
            <tr><td><kbd>Ctrl+Shift+M</kbd></td><td>Toggle microphone</td></tr>
            <tr><td><kbd>Ctrl+Enter</kbd></td><td>Run code</td></tr>
            <tr><td><kbd>Ctrl+Shift+E</kbd></td><td>Explain code</td></tr>
            <tr><td><kbd>Ctrl+Shift+R</kbd></td><td>Read entire file aloud</td></tr>
            <tr><td><kbd>Escape</kbd></td><td>Stop speaking</td></tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
