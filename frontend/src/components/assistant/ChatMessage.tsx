import type { ChatMessage as ChatMessageType } from "../../stores/assistantStore";

export default function ChatMessage({ message }: { message: ChatMessageType }) {
  return (
    <li className={`chat-message ${message.role}`}>
      <span className="chat-role sr-only">{message.role === "user" ? "You" : "V-Code assistant"}</span>
      <p>{message.content}</p>
      {message.suggestions && message.suggestions.length > 0 && (
        <ul className="chat-suggestions" aria-label="Suggestions">
          {message.suggestions.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      )}
    </li>
  );
}
