import { useState, type FormEvent } from "react";

interface Props {
  onSubmit: (text: string) => void;
  disabled?: boolean;
}

// A typed fallback for every voice command -- required for users without a
// mic, in noisy environments, or who simply prefer typing. Every voice
// intent is reachable through this same input.
export default function TextCommandInput({ onSubmit, disabled }: Props) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSubmit(value.trim());
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="text-command-form">
      <label htmlFor="text-command">Or type a command</label>
      <input
        id="text-command"
        type="text"
        value={value}
        disabled={disabled}
        onChange={(e) => setValue(e.target.value)}
        placeholder='e.g. "go to line 5" or "explain this error"'
      />
      <button type="submit" disabled={disabled}>Send</button>
    </form>
  );
}
