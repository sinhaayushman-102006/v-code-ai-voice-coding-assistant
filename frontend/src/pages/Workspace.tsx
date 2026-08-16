import { useCallback, useRef, useEffect } from "react";
import CodeEditor from "../components/editor/CodeEditor";
import MicButton from "../components/voice/MicButton";
import VoiceStatus from "../components/voice/VoiceStatus";
import TextCommandInput from "../components/voice/TextCommandInput";
import NarrationControls from "../components/narration/NarrationControls";
import ChatWindow from "../components/assistant/ChatWindow";
import FileExplorer from "../components/explorer/FileExplorer";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import { parseCommand } from "../services/commandParser";
import { routeCommand } from "../services/commandRouter";
import { transcribeAudio } from "../services/aiService";
import { useVoiceStore } from "../stores/voiceStore";
import { useEditorStore } from "../stores/editorStore";
import { useFileStore } from "../stores/fileStore";
import { announce } from "../components/accessibility/LiveRegion";
import { Files, Settings, MessageSquare, Mic } from "lucide-react";

export default function Workspace() {
  const monacoRef = useRef<any>(null);
  const { speak } = useSpeechSynthesis();
  const { setExchange } = useVoiceStore();
  const { code, language, setCode, setLanguage, output, isRunning } = useEditorStore();
  const { files, activeFileId, updateFileContent } = useFileStore();

  const { isRecording, startRecording, stopRecording } = useAudioRecorder();
  const silenceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync active file to editor
  useEffect(() => {
    if (activeFileId && files[activeFileId]) {
      const file = files[activeFileId];
      if (file.content !== undefined && file.content !== code) {
        setCode(file.content);
      }
      if (file.language && file.language !== language) {
        setLanguage(file.language as any);
      }
    }
  }, [activeFileId]);

  // Sync editor back to active file
  useEffect(() => {
    if (activeFileId) {
      updateFileContent(activeFileId, code);
    }
  }, [code, activeFileId]);

  const handleCommand = useCallback(
    async (text: string) => {
      const parsed = parseCommand(text);
      const result = await routeCommand(parsed, { monacoRef, speak });
      setExchange(text, result.spokenResponse);
      announce(result.spokenResponse);
    },
    [speak, setExchange]
  );

  const toggleRecording = async () => {
    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    if (isRecording) {
      // Stop and process
      try {
        speak("Processing...", { interrupt: true });
        const audioBlob = await stopRecording();
        const accurateText = await transcribeAudio(audioBlob);
        if (accurateText) {
          handleCommand(accurateText);
        } else {
          speak("I didn't catch that.");
        }
      } catch (err) {
        announce(`Transcription error: ${err}`, true);
      }
    } else {
      // Manual trigger without wake word
      speak("Listening.", { interrupt: true });
      startRecording();
    }
  };

  const handleSpeechResult = useCallback(
    async (transcript: string) => {
      const lower = transcript.toLowerCase();
      // Wake word detection
      if (!isRecording && (lower.includes("hey assistant") || lower.includes("hey v code") || lower.includes("v code"))) {
        speak("Listening.", { interrupt: true });
        startRecording();
        // Start a fallback timeout in case they never speak
        silenceTimeoutRef.current = setTimeout(() => toggleRecording(), 5000);
        return;
      }
      
      // If we are recording, use the browser's speech recognition to detect silence
      if (isRecording) {
        if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
        // Wait 2.5 seconds of silence before auto-stopping the recording
        silenceTimeoutRef.current = setTimeout(() => toggleRecording(), 2500);
        return;
      }

      // If we are not recording and didn't hear a wake word, just process the native text
      // (This serves as a fallback if the user just uses native speech commands)
      if (!isRecording) {
        handleCommand(transcript);
      }
    },
    [isRecording, startRecording, speak, handleCommand]
  );

  const { isListening, isSupported, startListening } = useSpeechRecognition({
    onResult: handleSpeechResult,
    onError: (err) => announce(`Voice recognition error: ${err}`, true),
    continuous: true,
  });

  // We auto-start the native wake-word listener
  useEffect(() => {
    if (isSupported && !isListening) {
      startListening();
    }
  }, [isSupported, isListening, startListening]);

  return (
    <main id="main-content" className="vscode-workspace">
      {/* 1. Activity Bar */}
      <div className="activity-bar">
        <div className="activity-icon active"><Files size={24} /></div>
        <div className="activity-icon"><MessageSquare size={24} /></div>
        <div className="activity-icon"><Mic size={24} /></div>
        <div className="activity-icon bottom"><Settings size={24} /></div>
      </div>

      {/* 2. Sidebar (File Explorer) */}
      <div className="sidebar-panel">
        <FileExplorer />
      </div>

      {/* 3. Editor Area */}
      <section aria-label="Editor panel" className="editor-panel">
        <div className="editor-tabs">
          {activeFileId && files[activeFileId] && (
            <div className="editor-tab active">
              {files[activeFileId].name}
            </div>
          )}
        </div>
        <div className="editor-container">
          <CodeEditor onMount={(editor) => (monacoRef.current = editor)} />
        </div>
        <NarrationControls onSpeak={(t) => speak(t, { interrupt: true })} />
        <div aria-live="polite" className="run-status">
          {isRunning && <p>Running…</p>}
          {output && (
            <div>
              {output.stdout && <pre aria-label="Program output">{output.stdout}</pre>}
              {output.stderr && <pre role="alert" aria-label="Program error" className="error-output">{output.stderr}</pre>}
            </div>
          )}
        </div>
      </section>

      {/* 4. Right Panel (Voice & Chat) */}
      <section aria-label="Assistant panel" className="right-panel">
        <div className="voice-panel">
          <MicButton isListening={isRecording} isSupported={isSupported} onToggle={toggleRecording} />
          <TextCommandInput onSubmit={handleCommand} />
          <VoiceStatus />
        </div>
        <ChatWindow onSpeak={(t) => speak(t, { interrupt: true })} />
      </section>
    </main>
  );
}
