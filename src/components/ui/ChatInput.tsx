/**
 * ChatInput Component
 * Renders a standardized input field and send button for chat interactions.
 *
 * @prop {string} value - The current value of the input field.
 * @prop {(newValue: string) => void} onChange - Callback fired when the input changes.
 * @prop {() => void} onSend - Callback fired when the send button or Enter key is pressed.
 * @prop {boolean} disabled - If true, disables both the input and button.
 */
import React from "react";
import { Input } from "./input";
import { Button } from "./button";

export interface ChatInputProps {
  value: string;
  onChange: (newValue: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  disabled = false,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disabled && value.trim()) {
      onSend();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !disabled && value.trim()) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <form className="flex items-center gap-2 w-full" onSubmit={handleSubmit}>
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        className="flex-1"
        disabled={disabled}
        autoFocus
        aria-label="Chat message input"
      />
      <Button type="submit" disabled={disabled || !value.trim()}>
        Send
      </Button>
    </form>
  );
};