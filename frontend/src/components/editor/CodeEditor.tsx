import { useRef } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import { useEditorStore } from "../../stores/editorStore";
import { useSettingsStore } from "../../stores/settingsStore";

interface Props {
  onMount?: (editor: any) => void;
}

// Wraps Monaco but is explicitly NOT the only way to interact with code --
// every capability here (navigate, insert, read, run) is also reachable via
// voice command and via the accessible controls outside the editor
// (see NarrationControls, VoiceControls). Monaco's own screen-reader mode
// is enabled so keyboard-only/screen-reader users get a usable textarea.
export default function CodeEditor({ onMount }: Props) {
  const { code, language, setCode, setCursorLine } = useEditorStore();
  const { fontSize, highContrast } = useSettingsStore();
  const editorRef = useRef<any>(null);

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor;
    editor.onDidChangeCursorPosition((e: any) => setCursorLine(e.position.lineNumber));
    onMount?.(editor);
  };

  return (
    <div id="code-editor" role="region" aria-label="Code editor">
      <Editor
        height="420px"
        language={language}
        value={code}
        theme={highContrast ? "hc-black" : "vs-dark"}
        onChange={(value) => setCode(value ?? "")}
        onMount={handleMount}
        options={{
          fontSize,
          accessibilitySupport: "on",
          ariaLabel: "Code editor. Use voice commands or type directly.",
          minimap: { enabled: false },
          wordWrap: "on",
          automaticLayout: true,
        }}
      />
    </div>
  );
}
