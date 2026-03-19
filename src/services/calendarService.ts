import { supabase } from '../lib/supabase';
import { ContentSlot } from '../components/planner/types';
import { parseContent, type ParsedContent } from '../lib/contentParser';

export interface PostContent {
  primary_text?: string;
  text?: string;
  caption?: string;
  hashtags?: string[];
  cta?: string;
  emoji_suggestions?: string[];
  hook?: string;
  media_urls?: string[];
  reasoning?: string;
  content_type?: string;
  estimated_engagement?: string;
}

export interface CalendarPost {
  id: string;
  user_id: string;
  pulse_config_id?: string;
  platform: string;
  post_number: number;
  content: PostContent;
  scheduled_date: string;
  status: 'draft' | 'approved' | 'scheduled' | 'published' | 'failed';
  source?: 'pulse' | 'manual';
  published_at?: string;
  platform_post_id?: string;
  performance_metrics?: any;
  created_at: string;
  updated_at: string;
}

export class CalendarService {
  static async loadPosts(startDate: Date, endDate: Date): Promise<CalendarPost[]> {
    try {
      console.log('Loading calendar posts from Supabase');
      console.log('Date range:', startDate.toISOString(), 'to', endDate.toISOString());

      const { data: posts, error } = await supabase
        .from('pulse_generated_content')
        .select('*')
        .gte('scheduled_date', startDate.toISOString())
        .lte('scheduled_date', endDate.toISOString())
        .order('scheduled_date', { ascending: true });

      if (error) {
        console.error('Error loading calendar posts:', error);
        throw error;
      }

      console.log('Loaded posts:', posts?.length || 0);
      return posts || [];
    } catch (error) {
      console.error('Unexpected error loading posts:', error);
      throw error;
    }
  }

  static async createPost(postData: {
    platform: string;
    content: PostContent;
    scheduled_date: Date;
    status?: 'draft' | 'approved' | 'scheduled' | 'published' | 'failed';
    content_type?: string;
  }): Promise<CalendarPost> {
    try {
      console.log('Creating manual post in Supabase');

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error('User nicht eingeloggt');
      }

      const { data, error } = await supabase
        .from('pulse_generated_content')
        .insert({
          user_id: session.user.id,
          platform: postData.platform,
          content: postData.content,
          scheduled_date: postData.scheduled_date.toISOString(),
          status: postData.status || 'draft',
          source: 'manual',
          post_number: 1,
          content_type: postData.content_type || 'text_post'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating post:', error);
        throw error;
      }

      console.log('Post created:', data);
      return data;
    } catch (error) {
      console.error('Unexpected error creating post:', error);
      throw error;
    }
  }

  static async updatePost(
    postId: string,
    updates: {
      scheduled_date?: Date;
      content?: any;
      status?: 'draft' | 'approved' | 'scheduled' | 'published' | 'failed';
      platform?: string;
      content_type?: string;
      published_at?: string;
    }
  ): Promise<CalendarPost> {
    try {
      console.log('Updating post in Supabase:', postId);

      const updateData: any = { ...updates };

      if (updates.scheduled_date) {
        updateData.scheduled_date = updates.scheduled_date.toISOString();
      }

      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('pulse_generated_content')
        .update(updateData)
        .eq('id', postId)
        .select()
        .single();

      if (error) {
        console.error('Error updating post:', error);
        throw error;
      }

      console.log('Post updated:', data);
      return data;
    } catch (error) {
      console.error('Unexpected error updating post:', error);
      throw error;
    }
  }

  static async deletePost(postId: string): Promise<void> {
    try {
      console.log('Deleting post from Supabase:', postId);

      const { error } = await supabase
        .from('pulse_generated_content')
        .delete()
        .eq('id', postId);

      if (error) {
        console.error('Error deleting post:', error);
        throw error;
      }

      console.log('Post deleted');
    } catch (error) {
      console.error('Unexpected error deleting post:', error);
      throw error;
    }
  }

  static extractContentText(content: PostContent): string {
    if (!content) return '';
    const parsed = parseContent(content);
    return parsed.primary_text;
  }

  static extractMedia(content: PostContent): ContentSlot['media'] | undefined {
    if (!content) return undefined;
    const parsed = parseContent(content);
    const raw = (content as any);
    const designUrl =
      (raw.has_design && (raw.design_image_url || raw.design_url)) ? (raw.design_image_url || raw.design_url) :
      (parsed.design_status === 'success' && parsed.design_image_url) ? parsed.design_image_url :
      null;
    const imageUrl = designUrl || parsed.image_url || (parsed.media_urls || [])[0];
    if (imageUrl) {
      return { type: 'image', url: imageUrl };
    }
    return undefined;
  }

  static formatScheduledTime(dateStr: string): string {
    const d = new Date(dateStr);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  static convertToContentSlot(post: CalendarPost): ContentSlot {
    const parsed = parseContent(post.content);
    const media = this.extractMedia(post.content);
    const time = this.formatScheduledTime(post.scheduled_date);

    return {
      id: post.id,
      date: new Date(post.scheduled_date),
      time,
      platform: post.platform as any,
      contentType: (post as any).content_type || 'post',
      title: parsed.hook || (parsed.primary_text ? parsed.primary_text.substring(0, 50) : 'Untitled Post'),
      body: parsed.primary_text,
      content: parsed.primary_text,
      hashtags: parsed.hashtags,
      status: post.status as any,
      source: post.source,
      cta: parsed.cta,
      media,
      contentTypeDetail: parsed.content_type,
      estimatedEngagement: parsed.estimated_engagement,
      reasoning: parsed.reasoning,
      emojiSuggestions: parsed.emoji_suggestions,
    };
  }

  static buildContentJsonb(slot: ContentSlot): PostContent {
    const content: PostContent = {
      primary_text: slot.body || slot.content || '',
      hashtags: slot.hashtags,
      cta: slot.cta,
      hook: slot.title,
    };
    if (slot.media?.url) {
      content.media_urls = [slot.media.url];
    }
    if (slot.contentTypeDetail) {
      content.content_type = slot.contentTypeDetail;
    }
    if (slot.estimatedEngagement) {
      content.estimated_engagement = slot.estimatedEngagement;
    }
    if (slot.reasoning) {
      content.reasoning = slot.reasoning;
    }
    if (slot.emojiSuggestions) {
      content.emoji_suggestions = slot.emojiSuggestions;
    }
    return content;
  }

  static convertFromContentSlot(slot: ContentSlot, userId: string): any {
    return {
      user_id: userId,
      platform: slot.platform,
      content: this.buildContentJsonb(slot),
      scheduled_date: new Date(slot.date).toISOString(),
      status: slot.status,
      source: slot.source || 'manual',
      post_number: 1,
      content_type: slot.contentType
    };
  }

  static subscribeToUpdates(userId: string, onUpdate: () => void) {
    console.log('Subscribing to calendar updates for user:', userId);

    const subscription = supabase
      .channel('calendar-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pulse_generated_content',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Calendar update received:', payload);
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      console.log('Unsubscribing from calendar updates');
      subscription.unsubscribe();
    };
  }
}
