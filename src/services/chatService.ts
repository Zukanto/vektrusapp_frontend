import { supabase } from '../lib/supabase';
import { Database } from '../lib/supabase';

// Use existing database types
export type ChatThread = Database['public']['Tables']['chat_threads']['Row'];
export type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];
export type TeamMember = Database['public']['Tables']['team_members']['Row'];
export type TeamAiConfig = Database['public']['Tables']['team_ai_config']['Row'];

export class ChatService {
  static async getUserTeam(userId: string) {
    const { data, error } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      throw new Error('User is not assigned to any team');
    }
    
    return data;
  }

  static async getTeam(teamId: string) {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async getOrCreateThread(teamId: string, userId: string): Promise<ChatThread> {
    // Try to get existing thread
    let { data: existingThread } = await supabase
      .from('chat_threads')
      .select('*')
      .eq('team_id', teamId)
      .eq('created_by', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingThread) {
      return existingThread;
    }

    // Create new thread
    const { data: newThread, error } = await supabase
      .from('chat_threads')
      .insert({
        team_id: teamId,
        title: 'Neuer Chat',
        created_by: userId
      })
      .select()
      .single();

    if (error) throw error;
    return newThread;
  }

  static async getThreadMessages(threadId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async createMessage(
    threadId: string,
    teamId: string,
    role: 'user' | 'assistant',
    content: string,
    createdBy?: string
  ): Promise<ChatMessage> {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        thread_id: threadId,
        team_id: teamId,
        role,
        content,
        status: role === 'user' ? 'committed' : 'streaming',
        created_by: createdBy
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateMessageStatus(messageId: string, status: ChatMessage['status']) {
    const { error } = await supabase
      .from('chat_messages')
      .update({ status })
      .eq('id', messageId);

    if (error) throw error;
  }

  static async updateMessageContent(messageId: string, content: string) {
    const { error } = await supabase
      .from('chat_messages')
      .update({ content })
      .eq('id', messageId);

    if (error) throw error;
  }
  
  static async updateThreadTimestamp(threadId: string) {
    const { error } = await supabase
      .from('chat_threads')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', threadId);

    if (error) throw error;
  }

  static async getTeamAiConfig(teamId: string) {
    const { data, error } = await supabase
      .from('team_ai_config')
      .select('assistant_id')
      .eq('team_id', teamId)
      .single();

    if (error) throw error;
    return data;
  }

  static async subscribeToMessages(threadId: string, callback: (message: ChatMessage) => void) {
    return supabase
      .channel(`chat_messages:${threadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `thread_id=eq.${threadId}`
        },
        (payload) => {
          callback(payload.new as ChatMessage);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `thread_id=eq.${threadId}`
        },
        (payload) => {
          callback(payload.new as ChatMessage);
        }
      )
      .subscribe();
  }
}