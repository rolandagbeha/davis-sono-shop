// Client leger pour l'assistant IA (appelle la fonction serverless /api/ai).
// Aucune cle API n'est manipulee cote client : tout passe par le serveur.

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

export interface AIRecommendation {
  slug: string;
  reason: string;
}

export interface AIGeneratedDescription {
  short_description: string;
  description: string;
}

async function postAI<T>(payload: Record<string, unknown>, accessToken?: string): Promise<T> {
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || "Erreur de l'assistant IA");
  }

  return data as T;
}

// Chat conversationnel cote client (boutique publique)
export async function aiChat(messages: ChatMessage[]): Promise<string> {
  const data = await postAI<{ reply: string }>({ action: 'chat', messages });
  return data.reply;
}

// Recommandations produit generees par l'IA
export async function aiRecommend(context: string, excludeSlug?: string): Promise<AIRecommendation[]> {
  const data = await postAI<{ recommendations: AIRecommendation[] }>({
    action: 'recommend',
    context,
    excludeSlug,
  });
  return Array.isArray(data.recommendations) ? data.recommendations : [];
}

// Chat de l'assistant admin (necessite un token Supabase valide)
export async function aiAdminChat(
  messages: ChatMessage[],
  statsContext: string,
  accessToken: string,
): Promise<string> {
  const data = await postAI<{ reply: string }>(
    { action: 'admin_chat', messages, statsContext },
    accessToken,
  );
  return data.reply;
}

// Generation de description produit par l'IA (admin uniquement)
export async function aiGenerateDescription(
  name: string,
  category: string,
  hints: string,
  accessToken: string,
): Promise<AIGeneratedDescription> {
  return postAI<AIGeneratedDescription>(
    { action: 'generate_description', name, category, hints },
    accessToken,
  );
}
