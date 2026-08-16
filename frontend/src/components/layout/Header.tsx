import { Link } from "react-router-dom";

interface Props {
  isListening: boolean;
}

export default function Header({ isListening }: Props) {
  return (
    <header className="app-header">
      <h1>V-Code</h1>
      <nav aria-label="Main navigation">
        <Link to="/">Workspace</Link>
        <Link to="/tutor">Tutor</Link>
        <Link to="/settings">Settings</Link>
      </nav>
      <span className="voice-indicator" role="status">
        Voice: {isListening ? "Listening" : "Idle"}
      </span>
    </header>
  );
}
