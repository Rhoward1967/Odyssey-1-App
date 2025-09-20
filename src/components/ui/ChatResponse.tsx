/**
 * ChatResponse Component
 * Renders a list of chat messages with standardized styling.
 *
 * @prop {Array<{role: string; content: string}>} messages - Array of message objects with role and content.
 */
import React from "react";

export interface ChatResponseProps {
  messages: Array<{ role: string; content: string }>;
}

export const ChatResponse: React.FC<ChatResponseProps> = ({ messages }) => (
  <div className="space-y-2 w-full" aria-live="polite">
    {messages.map((msg, idx) => (
      <div
        key={idx}
        className={`p-2 rounded-md text-sm ${
          msg.role === "user"
            ? "bg-primary/10 text-primary"
            : msg.role === "assistant"
            ? "bg-background text-foreground"
            : msg.role === "error"
            ? "bg-destructive/20 text-destructive"
            : "bg-muted text-muted-foreground"
        }`}
        data-role={msg.role}
      >
        {msg.content}
      </div>
    ))}
  </div>
);