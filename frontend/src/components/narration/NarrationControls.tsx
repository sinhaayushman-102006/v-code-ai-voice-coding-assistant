import { useEditorStore } from "../../stores/editorStore";
import { narrateCode, narrateLine } from "../../services/codeNarrator";

interface Props {
  onSpeak: (text: string) => void;
}

export default function NarrationControls({ onSpeak }: Props) {
  const { code, cursorLine } = useEditorStore();

  return (
    <div className="narration-controls" role="group" aria-label="Narration controls">
      <button type="button" onClick={() => onSpeak(narrateLine(code.split("\n")[cursorLine - 1] ?? "", cursorLine))}>
        Read current line
      </button>
      <button type="button" onClick={() => onSpeak(narrateCode(code))}>
        Read entire file
      </button>
    </div>
  );
}
