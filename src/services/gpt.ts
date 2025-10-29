export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function gptChat(
  messages: ChatMessage[],
  opts?: { model?: string; temperature?: number }
): Promise<ChatMessage> {
  const res = await fetch("/functions/v1/gpt-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages,
      model: opts?.model,
      temperature: opts?.temperature,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to call GPT");
  }

  const data = await res.json();
  return data.message as ChatMessage;
}
