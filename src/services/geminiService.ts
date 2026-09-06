import type { ChatMessage, EntryMood, GeminiReflectResponse } from "../types";

export interface GenerateReflectionParams {
  prompt: string;
  messages: ChatMessage[];
  entryTitle?: string;
  entryMood?: EntryMood;
  action?: "reflect" | "summarize" | "brainstorm" | "prompts";
}

export async function requestGeminiReflection(
  params: GenerateReflectionParams
): Promise<GeminiReflectResponse> {
  const response = await fetch("/api/gemini/reflect", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Server responded with status ${response.status}: Failed to generate reflection`
    );
  }

  const data = await response.json();
  return {
    text: data.text,
    model: data.model || "gemini-2.5-flash",
    microWellness: data.microWellness,
  };
}
