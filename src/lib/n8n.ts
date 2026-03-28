import { supabase } from './supabase';

export const callN8n = async (endpoint: string, body: object) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Nicht eingeloggt');

  const response = await fetch(`https://n8n.vektrus.ai/webhook/${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return response.json();
};
