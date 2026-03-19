import { supabase } from '../lib/supabase';

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessageDB {
  id: string;
  session_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export const ChatSessionService = {
  async getUserSessions(): Promise<ChatSession[]> {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getPublicUserId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    if (profile) return profile.id;
    return user.id;
  },

  async createSession(title: string = 'Neuer Chat'): Promise<ChatSession> {
    const userId = await this.getPublicUserId();

    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({ user_id: userId, title })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateSessionTitle(sessionId: string, title: string): Promise<void> {
    const { error } = await supabase
      .from('chat_sessions')
      .update({ title })
      .eq('id', sessionId);

    if (error) throw error;
  },

  async deleteSession(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) throw error;
  },

  async getSessionMessages(sessionId: string): Promise<ChatMessageDB[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }
};
