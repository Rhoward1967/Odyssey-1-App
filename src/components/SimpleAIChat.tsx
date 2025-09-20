/**
 * SimpleAIChat Component
 * Odyssey-1 AI Chat interface utilizing standardized ChatInput and ChatResponse components.
 *
 * Features:
 * - Displays chat messages and budget/request usage.
 * - Handles user input, message sending, and error reporting directly in chat flow.
 * - Mobile-first responsive layout.
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ChatInput } from "./ui/ChatInput";
import { ChatResponse } from "./ui/ChatResponse";
import { realOpenAIService } from "../services/realOpenAI";

interface Usage {
  remainingBudget: number;
  remainingRequests: number;
  dailySpent: number;
}

export default function SimpleAIChat() {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [usage, setUsage] = useState<Usage>({
    remainingBudget: 10,
    remainingRequests: 100,
    dailySpent: 0,
  });

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    // Add user message immediately
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);

    try {
      const response = await realOpenAIService.processIntelligentQuery(userMessage);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: response.response },
      ]);

      // Update usage based on real response
      setUsage(prev => ({
        ...prev,
        dailySpent: prev.dailySpent + response.tokens * 0.000002,
        remainingBudget: prev.remainingBudget - response.tokens * 0.000002,
        remainingRequests: prev.remainingRequests - 1,
      }));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setMessages(prev => [...prev, { role: "error", content: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (isLoading) return <Badge variant="secondary">Thinking...</Badge>;
    if (usage.remainingBudget <= 0)
      return <Badge variant="destructive">Budget Exceeded</Badge>;
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey || apiKey === "your_openai_api_key_here")
      return <Badge variant="destructive">No API Key</Badge>;
    return <Badge variant="default">Ready</Badge>;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>ODYSSEY-1 AI Chat</span>
          {getStatusBadge()}
        </CardTitle>
        <div className="grid grid-cols-3 gap-4 text-sm w-full">
          <div className="text-center">
            <div className="font-bold">${usage.remainingBudget.toFixed(4)}</div>
            <div className="text-gray-500">Budget Left</div>
          </div>
          <div className="text-center">
            <div className="font-bold">{usage.remainingRequests}</div>
            <div className="text-gray-500">Requests Left</div>
          </div>
          <div className="text-center">
            <div className="font-bold">${usage.dailySpent.toFixed(4)}</div>
            <div className="text-gray-500">Total Spent</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 w-full">
        <ChatResponse messages={messages} />
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={sendMessage}
          disabled={isLoading || usage.remainingBudget <= 0}
        />
      </CardContent>
    </Card>
  );
}