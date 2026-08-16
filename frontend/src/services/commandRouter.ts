import type { ParsedCommand, CommandResult, SupportedLanguage } from "../types/shared";
import { useEditorStore } from "../stores/editorStore";
import { useAssistantStore } from "../stores/assistantStore";
import { useTutorStore } from "../stores/tutorStore";
import { narrateLine, narrateCode, narrateFunction } from "./codeNarrator";
import { chatWithAI, explainCode, explainErrorWithAI, fixCodeWithAI } from "./aiService";
import { explainErrorLocally } from "./errorExplainer";
import { runCode } from "./codeExecutionService";

// Every intent from the command parser ends up here. This is the single
// place that mutates editor/assistant/tutor state in response to voice --
// UI components never talk to the stores directly for voice-driven actions,
// which keeps the "what does this command actually do" logic in one file.

export interface RouterDeps {
  monacoRef: { current: any };
  speak: (text: string, opts?: { interrupt?: boolean }) => void;
}

export async function routeCommand(cmd: ParsedCommand, deps: RouterDeps): Promise<CommandResult> {
  const editor = useEditorStore.getState();
  const assistant = useAssistantStore.getState();
  const tutor = useTutorStore.getState();

  switch (cmd.intent) {
    case "GOTO_LINE": {
      const line = Number(cmd.parameters.line);
      deps.monacoRef.current?.revealLineInCenter(line);
      deps.monacoRef.current?.setPosition({ lineNumber: line, column: 1 });
      editor.setCursorLine(line);
      return respond(`Moved to line ${line}.`, deps);
    }

    case "GOTO_FUNCTION": {
      const name = String(cmd.parameters.name);
      const lines = editor.code.split("\n");
      const idx = lines.findIndex((l) => new RegExp(`\\b(def|function)\\s+${name}\\s*\\(`).test(l));
      if (idx === -1) return respond(`I couldn't find a function called ${name}.`, deps);
      deps.monacoRef.current?.revealLineInCenter(idx + 1);
      deps.monacoRef.current?.setPosition({ lineNumber: idx + 1, column: 1 });
      return respond(`Moved to function ${name} on line ${idx + 1}.`, deps);
    }

    case "READ_LINE": {
      const lineNum = Number(cmd.parameters.line) || editor.cursorLine;
      const line = editor.code.split("\n")[lineNum - 1] ?? "";
      return respond(narrateLine(line, lineNum), deps);
    }

    case "READ_FUNCTION": {
      const name = String(cmd.parameters.name);
      const narration = narrateFunction(editor.code, name);
      if (!narration) return respond(`I couldn't find a function called ${name}.`, deps);
      return respond(narration, deps);
    }

    case "READ_CODE":
      return respond(narrateCode(editor.code), deps);

    case "READ_SELECTION": {
      const selection = deps.monacoRef.current?.getModel()?.getValueInRange(
        deps.monacoRef.current.getSelection()
      );
      if (!selection) return respond("Nothing is selected.", deps);
      return respond(narrateCode(selection), deps);
    }

    case "UNDO":
      deps.monacoRef.current?.trigger("voice", "undo", null);
      return respond("Undone.", deps);

    case "REDO":
      deps.monacoRef.current?.trigger("voice", "redo", null);
      return respond("Redone.", deps);

    case "DELETE_LINE": {
      const lineNum = Number(cmd.parameters.line) || editor.cursorLine;
      const lines = editor.code.split("\n");
      lines.splice(lineNum - 1, 1);
      editor.setCode(lines.join("\n"));
      return respond(`Deleted line ${lineNum}.`, deps);
    }

    case "REPLACE_LINE": {
      const lineNum = Number(cmd.parameters.line);
      const content = String(cmd.parameters.content);
      const lines = editor.code.split("\n");
      lines[lineNum - 1] = content;
      editor.setCode(lines.join("\n"));
      return respond(`Replaced line ${lineNum}.`, deps);
    }

    case "SET_LANGUAGE": {
      const lang = String(cmd.parameters.language) as SupportedLanguage;
      editor.setLanguage(lang);
      return respond(`Switched language to ${lang}.`, deps);
    }

    case "SAVE_FILE": {
      const blob = new Blob([editor.code], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = editor.language === "python" ? "main.py" : "main.js";
      a.click();
      URL.revokeObjectURL(url);
      return respond("File saved to your downloads.", deps);
    }

    case "RUN_CODE": {
      editor.setRunning(true);
      deps.speak("Running your code.", { interrupt: true });
      try {
        const result = await runCode(editor.code, editor.language);
        editor.setOutput({ stdout: result.stdout, stderr: result.stderr });
        editor.setRunning(false);
        if (result.stderr) {
          editor.setError(result.stderr);
          return respond(`The code ran with an error. Say "explain error" to hear more.`, deps);
        }
        editor.setError(null);
        if (!result.stdout.trim()) {
          return respond("The code ran successfully, but it produced no output.", deps);
        }
        return respond(`The code ran successfully. Output: ${result.stdout.trim()}`, deps);
      } catch (e: any) {
        editor.setRunning(false);
        return respond(`I couldn't run the code: ${e.message}`, deps);
      }
    }

    case "EXPLAIN_ERROR": {
      if (!editor.lastError) return respond("There is no recent error to explain.", deps);
      const local = explainErrorLocally(editor.lastError);
      if (local) {
        return respond(`${local.spokenExplanation} ${local.suggestion ?? ""}`.trim(), deps);
      }
      assistant.setThinking(true);
      try {
        const ai = await explainErrorWithAI(editor.lastError, editor.code, editor.language);
        assistant.addMessage({ role: "assistant", content: ai.spokenResponse, suggestions: ai.suggestions });
        return respond(ai.spokenResponse, deps);
      } catch {
        return respond(
          "I couldn't reach the AI assistant to explain this error. The raw error was: " + editor.lastError,
          deps
        );
      } finally {
        assistant.setThinking(false);
      }
    }

    case "FIX_ERROR": {
      if (!editor.lastError) return respond("There is no recent error to fix.", deps);
      assistant.setThinking(true);
      try {
        const ai = await fixCodeWithAI(editor.lastError, editor.code, editor.language);
        if (ai.code) editor.setCode(ai.code);
        return respond(ai.spokenResponse, deps);
      } catch {
        return respond("I couldn't reach the AI assistant to fix this. Please check your connection or API key.", deps);
      } finally {
        assistant.setThinking(false);
      }
    }

    case "EXPLAIN_CODE": {
      assistant.setThinking(true);
      try {
        const ai = await explainCode(editor.code, editor.language);
        assistant.addMessage({ role: "assistant", content: ai.spokenResponse, suggestions: ai.suggestions });
        return respond(ai.spokenResponse, deps);
      } catch {
        return respond("I couldn't reach the AI assistant right now.", deps);
      } finally {
        assistant.setThinking(false);
      }
    }

    case "INSERT_CODE":
    case "ASK_AI": {
      const question = String(cmd.parameters.description ?? cmd.parameters.question ?? cmd.raw);
      assistant.addMessage({ role: "user", content: question });
      assistant.setThinking(true);
      try {
        const ai = await chatWithAI({ message: question, code: editor.code, language: editor.language });
        assistant.addMessage({ role: "assistant", content: ai.spokenResponse, suggestions: ai.suggestions });
        if (ai.code) {
          const insertion = ai.code + "\n";
          editor.setCode(editor.code.trimEnd() + "\n\n" + insertion);
        }
        return respond(ai.spokenResponse, deps);
      } catch {
        const msg = "I couldn't reach the AI assistant. Check that the backend is running and an API key is configured.";
        assistant.addMessage({ role: "assistant", content: msg });
        return respond(msg, deps);
      } finally {
        assistant.setThinking(false);
      }
    }

    case "DICTATE_CODE": {
      const textToType = String(cmd.parameters.text);
      // Optional: We could run this through the AI to format as proper code, but literal insertion is the fastest for dictation.
      // Wait, dictation for code needs AI to format it, e.g. "console log hello" -> "console.log('hello');".
      assistant.setThinking(true);
      try {
        const prompt = `Format this dictated speech as proper ${editor.language} code. Do not include markdown fences, just the exact code to type. Dictation: "${textToType}"`;
        const ai = await chatWithAI({ message: prompt, code: editor.code, language: editor.language });
        const insertion = ai.code || ai.spokenResponse || textToType;
        editor.setCode(editor.code.trimEnd() + "\n" + insertion);
        return respond("Typed.", deps);
      } catch {
        editor.setCode(editor.code.trimEnd() + "\n" + textToType);
        return respond("Typed literally, couldn't reach AI for formatting.", deps);
      } finally {
        assistant.setThinking(false);
      }
    }

    case "START_LESSON": {
      const topic = String(cmd.parameters.topic ?? "");
      tutor.startLesson(topic || 0);
      const lesson = useTutorStore.getState().lessons[useTutorStore.getState().currentLessonIndex];
      return respond(lesson ? `${lesson.title}. ${lesson.introduction}` : "I couldn't find that lesson.", deps);
    }

    case "NEXT_LESSON": {
      tutor.nextLesson();
      const lesson = useTutorStore.getState().lessons[useTutorStore.getState().currentLessonIndex];
      return respond(lesson ? `${lesson.title}. ${lesson.introduction}` : "That was the last lesson.", deps);
    }

    case "REPEAT": {
      const last = useAssistantStore.getState().messages.at(-1);
      return respond(last ? last.content : "There's nothing to repeat yet.", deps);
    }

    case "STOP_SPEAKING":
      window.speechSynthesis.cancel();
      return { success: true, spokenResponse: "" };

    case "HELP":
      return respond(
        'Try saying: "go to line 5", "read the code", "run the code", "explain this error", "teach me loops", or ask me anything about your code.',
        deps
      );

    default:
      return respond("I didn't understand that command. Say \"help\" to hear what you can say.", deps);
  }
}

function respond(spokenResponse: string, deps: RouterDeps): CommandResult {
  if (spokenResponse) deps.speak(spokenResponse, { interrupt: true });
  return { success: true, spokenResponse };
}
