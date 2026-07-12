// Helper partage pour les appels a l'API Anthropic (Claude).
// Utilise par api/ai.ts (chat/recommandations/assistant admin) et
// api/weekly-report.ts (rapport hebdomadaire automatique).
// Cle secrete cote serveur uniquement : ANTHROPIC_API_KEY (Vercel > Settings >
// Environment Variables, jamais commit dans le code).

export const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function callClaude(
  model: string,
  system: string,
  messages: ChatMessage[],
  maxTokens = 700,
): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      system,
      max_tokens: maxTokens,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Erreur API Anthropic (${res.status}) : ${errText}`);
  }

  const data = (await res.json()) as { content?: { text?: string }[] };
  return data.content?.[0]?.text ?? '';
}
