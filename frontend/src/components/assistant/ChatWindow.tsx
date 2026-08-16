import { useState, type FormEvent } from "react";
import { useAssistantStore } from "../../stores/assistantStore";
import { useEditorStore } from "../../stores/editorStore";
import { chatWithAI } from "../../services/aiService";
import ChatMessage from "./ChatMessage";

interface Props {
  onSpeak: (text: string) => void;
}

export default function ChatWindow({ onSpeak }: Props) {
  const { messages, isThinking, addMessage, setThinking } = useAssistantStore();
  const { code, language } = useEditorStore();
  const [input, setInput] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const question = input.trim();
    if (!question) return;
    setInput("");
    addMessage({ role: "user", content: question });
    setThinking(true);
    try {
      const ai = await chatWithAI({ message: question, code, language });
      addMessage({ role: "assistant", content: ai.spokenResponse, suggestions: ai.suggestions });
      onSpeak(ai.spokenResponse);
    } catch {
      const msg = "I couldn't reach the AI assistant. Check that the backend is running and an API key is configured.";
      addMessage({ role: "assistant", content: msg });
      onSpeak(msg);
    } finally {
      setThinking(false);
    }
  };

  return (
    <section id="ai-assistant" aria-labelledby="assistant-heading" className="chat-window">
      <h2 id="assistant-heading">AI Assistant</h2>
      <ul className="chat-messages" aria-live="polite">
        {messages.map((m) => <ChatMessage key={m.id} message={m} />)}
        {isThinking && <li className="chat-message assistant thinking">Thinking…</li>}
      </ul>
      <form onSubmit={handleSubmit}>
        <label htmlFor="chat-input" className="sr-only">Ask the AI assistant</label>
        <input
          id="chat-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your code…"
        />
        <button type="submit">Send</button>
      </form>
    </section>
  );
}
