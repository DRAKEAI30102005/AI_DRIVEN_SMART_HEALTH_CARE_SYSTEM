export type OllamaChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

const OLLAMA_URL = 'http://127.0.0.1:11434/api/chat';
const OLLAMA_MODEL = 'gemma3:1b';

export async function askOllama(messages: OllamaChatMessage[]) {
  const response = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      messages,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to connect to Ollama.');
  }

  const data = await response.json() as {message?: {content?: string}};
  return data.message?.content?.trim() || 'No response generated.';
}

export function buildHealthAssistantMessages(history: OllamaChatMessage[], prompt: string) {
  return [
    {
      role: 'system' as const,
      content:
        'You are HealthPulse AI, a helpful health-tech assistant inside a patient app. Answer clearly, warmly, and practically. For medical questions, remind users that you do not replace a licensed doctor. Keep answers structured and easy to understand.',
    },
    ...history,
    {
      role: 'user' as const,
      content: prompt,
    },
  ];
}
