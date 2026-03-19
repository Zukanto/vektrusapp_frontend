import { supabase } from '../lib/supabase';
import { parseContent } from '../lib/contentParser';

export interface PulseConfiguration {
  primary_goal: string;
  platforms: {
    id: string;
    enabled: boolean;
    posting_times: string[];
  }[];
  posting_frequency: {
    type: string;
    posts_per_week: number;
  };
  schedule: {
    type: string;
    start_date: string;
    end_date: string;
    timezone: string;
  };
  tone: {
    style: string;
  };
  theme: {
    focus: string;
  };
  topic_description?: string;
  language: {
    primary: string;
    excluded_keywords?: string[];
    mandatory_keywords?: string[];
  };
  image_generation?: {
    enabled: boolean;
    quality: 'standard' | 'premium';
  };
  stories_enabled?: boolean;
}

export interface WebhookRequest {
  user_id: string;
  pulse_configuration: PulseConfiguration;
}

export interface WebhookResponse {
  success: boolean;
  pulse_id?: string;
  message?: string;
  summary?: {
    total_posts: number;
    schedule: {
      start: string;
      end: string;
    };
  };
  error?: string;
  processing_complete?: boolean;
  content_plan?: {
    post_id: string;
    platform: string;
    type: string;
    content: string;
    caption: string;
    hashtags: string[];
    ready_to_publish?: boolean;
    image_url?: string;
    design_image_url?: string;
    design_status?: string;
    design_status_message?: string;
  }[];
  metadata?: {
    user_id: string;
    total_posts: number;
    generation_time?: string;
    workflow_version: string;
  };
  user_message?: {
    title: string;
    description: string;
    next_steps?: string[];
  };
}

export class ContentGeneratorService {
  private static readonly N8N_PULSE_URL = 'https://n8n.vektrus.ai/webhook/vektrus-pulse';
  private static readonly N8N_PULSE_VISUAL_URL = 'https://n8n.vektrus.ai/webhook/vektrus-pulse-visual';
  private static readonly WEBHOOK_TIMEOUT = 30000;

  static mapGoalToPulse(goal: string): PulseConfiguration['primary_goal'] {
    const mapping: Record<string, PulseConfiguration['primary_goal']> = {
      'awareness': 'brand_awareness',
      'engagement': 'community',
      'leads': 'leads',
      'sales': 'sales',
      'launch': 'launch',
      'community': 'community',
      'relationships': 'relationships'
    };
    return mapping[goal] || 'community';
  }

  static mapStyleToPulse(style: string): PulseConfiguration['tone']['style'] {
    const mapping: Record<string, PulseConfiguration['tone']['style']> = {
      'professional': 'professional',
      'casual': 'casual',
      'inspiring': 'inspiring'
    };
    return mapping[style] || 'professional';
  }

  static mapThemeToPulse(theme: string): PulseConfiguration['theme']['focus'] {
    const mapping: Record<string, PulseConfiguration['theme']['focus']> = {
      'product': 'product',
      'behind_the_scenes': 'behind_the_scenes',
      'educational': 'educational'
    };
    return mapping[theme] || 'product';
  }

  static mapFrequencyType(frequency: number): PulseConfiguration['posting_frequency']['type'] {
    if (frequency <= 2) return 'relaxed';
    if (frequency <= 3) return 'balanced';
    if (frequency <= 5) return 'active';
    return 'intensive';
  }

  static formatDateForPulse(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  static getDefaultPostingTimes(platform: string): string[] {
    const times: Record<string, string[]> = {
      instagram: ['09:00', '13:00', '19:00'],
      linkedin: ['08:00', '12:00', '17:00'],
      tiktok: ['12:00', '18:00', '21:00'],
      facebook: ['09:00', '15:00', '19:00'],
      twitter: ['09:00', '12:00', '18:00']
    };
    return times[platform] || ['09:00', '13:00', '19:00'];
  }
static async generateContent(wizardData: any, isDemoMode: boolean = false): Promise<WebhookResponse> {
    if (isDemoMode) {
      return this.generateDemoContent(wizardData);
    }

    if (wizardData.mode === 'visual') {
      return this.generateVisualContent(wizardData);
    }

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.access_token) {
      throw new Error('User nicht eingeloggt');
    }

    const pulseConfiguration: PulseConfiguration = {
      primary_goal: wizardData.goal || 'engagement',
      platforms: (wizardData.platforms || []).map((platformId: string) => ({
        id: platformId,
        enabled: true,
        posting_times: this.getDefaultPostingTimes(platformId)
      })),
      posting_frequency: {
        type: this.mapFrequencyType(wizardData.frequency || 3),
        posts_per_week: wizardData.frequency || 3
      },
      schedule: {
        type: wizardData.scheduleType || 'custom',
        start_date: this.formatDateForPulse(wizardData.timeframe.startDate),
        end_date: this.formatDateForPulse(wizardData.timeframe.endDate),
        timezone: 'Europe/Berlin'
      },
      tone: {
        style: wizardData.tone || 'professional'
      },
      theme: {
        focus: wizardData.theme || 'product'
      },
      topic_description: wizardData.topicDescription || undefined,
      language: {
        primary: 'DE'
      },
      image_generation: wizardData.imageGeneration ? {
        enabled: wizardData.imageGeneration.enabled,
        quality: wizardData.imageGeneration.quality
      } : { enabled: false, quality: 'standard' as const },
      stories_enabled: wizardData.storiesEnabled || false
    };

    const webhookRequest = {
      user_id: session.user.id,
      pulse_configuration: pulseConfiguration
    };

    console.log('Sending Vektrus Pulse request to n8n:', webhookRequest);

    try {
      const response = await fetch(this.N8N_PULSE_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookRequest),
      });

      console.log('n8n response status:', response.status);

      if (!response.ok) {
        throw new Error(`n8n webhook failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('Pulse response (async):', data);

      if (!data.success) {
        throw new Error(data.error || 'Content-Generierung fehlgeschlagen');
      }

      return {
        success: true,
        pulse_id: data.pulse_id,
        message: data.message,
        summary: data.summary,
        processing_complete: false,
        content_plan: [],
        metadata: {
          user_id: session.user.id,
          total_posts: data.summary?.total_posts || 0,
          workflow_version: 'pulse-v2.0-async'
        },
        user_message: {
          title: 'Content wird generiert...',
          description: `${data.summary?.total_posts || 0} Posts werden erstellt.`,
          next_steps: ['Posts werden im Hintergrund generiert']
        }
      };
    } catch (error) {
      console.error('Content generation error:', error);

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Netzwerkfehler: Bitte überprüfe deine Internetverbindung.');
      }

      throw new Error(error instanceof Error ? error.message : 'Content-Generierung fehlgeschlagen');
    }
  }

  static async generateVisualContent(wizardData: any): Promise<WebhookResponse> {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.access_token) {
      throw new Error('User nicht eingeloggt');
    }

    const payload = {
      user_id: session.user.id,
      apply_ci: wizardData.apply_ci !== false,
      images: (wizardData.images || []).map((img: any) => ({
        url: img.url,
        description: img.description || '',
      })),
      pulse_configuration: {
        mode: 'visual',
        primary_goal: wizardData.goal || 'engagement',
        platforms: (wizardData.platforms || []).map((platformId: string) => ({
          id: platformId,
          enabled: true,
          posting_times: this.getDefaultPostingTimes(platformId),
        })),
        schedule: {
          type: wizardData.scheduleType || 'next_week',
          start_date: this.formatDateForPulse(wizardData.timeframe.startDate),
          end_date: this.formatDateForPulse(wizardData.timeframe.endDate),
          timezone: 'Europe/Berlin',
        },
        tone: { style: wizardData.tone || 'professional' },
        theme: { focus: 'visual' },
        language: { primary: wizardData.language || 'DE' },
      },
    };

    console.log('Sending Vektrus Pulse Visual request to n8n:', payload);

    try {
      const response = await fetch(this.N8N_PULSE_VISUAL_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('n8n Visual response status:', response.status);

      if (!response.ok) {
        throw new Error(`n8n webhook failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('Pulse Visual response:', data);

      if (!data.success) {
        throw new Error(data.error || 'Visual-Generierung fehlgeschlagen');
      }

      return {
        success: true,
        pulse_id: data.pulse_id,
        message: data.message,
        summary: data.summary,
        processing_complete: false,
        content_plan: [],
        metadata: {
          user_id: session.user.id,
          total_posts: data.summary?.total_posts || 0,
          workflow_version: 'pulse-visual-v1.0',
        },
        user_message: {
          title: 'Visual Content wird generiert...',
          description: `${data.summary?.total_posts || 0} Posts werden aus deinen Bildern erstellt.`,
          next_steps: ['Posts werden im Hintergrund generiert'],
        },
      };
    } catch (error) {
      console.error('Visual content generation error:', error);

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Netzwerkfehler: Bitte überprüfe deine Internetverbindung.');
      }

      throw new Error(error instanceof Error ? error.message : 'Visual-Generierung fehlgeschlagen');
    }
  }
  static async loadGeneratedPosts(pulseId: string) {
    try {
      console.log('=== LOADING POSTS FROM SUPABASE ===');
      console.log('Pulse ID:', pulseId);
      console.log('Table: pulse_generated_content');
      console.log('Filter: pulse_config_id =', pulseId);

      console.log('Executing Supabase query...');

      const { data, error } = await supabase
        .from('pulse_generated_content')
        .select('*')
        .eq('pulse_config_id', pulseId)
        .order('scheduled_date');

      console.log('Supabase query completed');
      console.log('Error:', error);
      console.log('Data:', data);
      console.log('Data length:', data?.length);

      if (error) {
        console.error('❌ Supabase error loading posts:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return [];
      }

      if (!data || data.length === 0) {
        console.warn('⚠️ No posts found in database for pulse_id:', pulseId);
        console.warn('This could mean:');
        console.warn('1. Posts are still being generated by n8n');
        console.warn('2. The pulse_config_id does not match');
        console.warn('3. RLS policy is blocking access');
      } else {
        console.log('✅ Successfully loaded', data.length, 'posts');
        console.log('Posts:', JSON.stringify(data, null, 2));
      }

      return data || [];
    } catch (error) {
      console.error('💥 Unexpected error loading posts:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return [];
    }
  }

  static async pollForCompletion(
    pulseId: string,
    totalExpectedPosts: number,
    onProgress?: (currentPosts: number, totalPosts: number, status: string, designProgress?: string, currentPostsData?: any[]) => void,
    options?: { intervalMs?: number; maxAttempts?: number }
  ): Promise<{ posts: any[]; status: string }> {
    const intervalMs = options?.intervalMs || 4000;
    const maxAttempts = options?.maxAttempts || 90;

    let lastPostCount = -1;
    let staleRounds = 0;
    const maxStaleRounds = 60;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const { data: config } = await supabase
          .from('pulse_configurations')
          .select('status')
          .eq('id', pulseId)
          .maybeSingle();

        const pulseStatus = config?.status || 'processing';

        const { data: posts, error: postsError } = await supabase
          .from('pulse_generated_content')
          .select('*')
          .eq('pulse_config_id', pulseId)
          .order('scheduled_date');

        if (postsError) {
          console.error('Poll posts error:', postsError);
        }

        const currentPosts = posts?.length || 0;

        let designProgress = '';
        if (currentPosts > 0 && posts) {
          const designDone = posts.filter(p => {
            const c = typeof p.content === 'string' ? (() => { try { return JSON.parse(p.content); } catch { return {}; } })() : (p.content || {});
            return c.design_status && c.design_status !== 'pending';
          }).length;
          const designPending = posts.filter(p => {
            const c = typeof p.content === 'string' ? (() => { try { return JSON.parse(p.content); } catch { return {}; } })() : (p.content || {});
            return c.design_status === 'pending';
          }).length;
          if (designPending > 0) {
            designProgress = `Designs: ${designDone}/${currentPosts} fertig`;
          }
        }

        console.log(`Poll ${attempt + 1}/${maxAttempts}: ${currentPosts}/${totalExpectedPosts} posts, status: ${pulseStatus}${designProgress ? `, ${designProgress}` : ''}`);

        if (onProgress) {
          onProgress(currentPosts, totalExpectedPosts, pulseStatus, designProgress, posts || []);
        }

        if (pulseStatus === 'completed') {
          const { data: finalPosts } = await supabase
            .from('pulse_generated_content')
            .select('*')
            .eq('pulse_config_id', pulseId)
            .order('scheduled_date');
          console.log(`Pulse completed! ${finalPosts?.length || 0} posts ready.`);
          return { posts: finalPosts || [], status: 'completed' };
        }

        if (pulseStatus === 'failed') {
          return { posts: posts || [], status: 'failed' };
        }

        if (currentPosts === lastPostCount) {
          staleRounds++;
        } else {
          staleRounds = 0;
          lastPostCount = currentPosts;
        }

        if (staleRounds >= maxStaleRounds) {
          console.warn(`Polling stale for ${maxStaleRounds * intervalMs / 1000}s — execution likely stuck.`);
          return {
            posts: posts || [],
            status: currentPosts > 0 ? 'partial' : 'timeout',
          };
        }

        await new Promise(resolve => setTimeout(resolve, intervalMs));
      } catch (error) {
        console.error(`Poll attempt ${attempt + 1} error:`, error);
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    }

    const { data: finalPosts } = await supabase
      .from('pulse_generated_content')
      .select('*')
      .eq('pulse_config_id', pulseId)
      .order('scheduled_date');

    return {
      posts: finalPosts || [],
      status: (finalPosts?.length || 0) > 0 ? 'partial' : 'timeout'
    };
  }

  static convertWebhookResponseToPosts(response: WebhookResponse, wizardData: any) {
    if (!response.content_plan || response.content_plan.length === 0) {
      return [];
    }

    return response.content_plan.map((post, index) => {
      const startDate = wizardData.timeframe.startDate;
      const dayOffset = Math.floor(index / wizardData.platforms.length) * Math.ceil(7 / wizardData.frequency);
      const postDate = new Date(startDate);
      postDate.setDate(startDate.getDate() + dayOffset);

      const parsed = parseContent(post.content);
      const imageUrl = post.image_url || parsed.image_url;
      const compositedImageUrl = post.design_image_url || parsed.design_image_url;
      const designStatus = (post.design_status || parsed.design_status) as any;
      const designStatusMessage = post.design_status_message || parsed.design_status_message;
      const contentFormat = post.content_format || parsed.content_format || 'single_image';
      const carouselSlides = post.carousel_slides || parsed.carousel_slides;
      return {
        id: post.post_id,
        platform: post.platform,
        title: parsed.hook || `Post für ${post.platform}`,
        hook: parsed.hook || post.caption || `Hook für ${post.platform}`,
        body: parsed.primary_text,
        cta: parsed.cta || '',
        hashtags: parsed.hashtags.length > 0 ? parsed.hashtags : (post.hashtags || []),
        scheduledTime: this.getOptimalTime(post.platform),
        scheduledDate: postDate,
        imageUrl: imageUrl || undefined,
        designImageUrl: compositedImageUrl || undefined,
        applyCI: wizardData?.apply_ci !== false,
        designStatus: designStatus || undefined,
        designStatusMessage: designStatusMessage || undefined,
        contentFormat,
        carouselSlides: Array.isArray(carouselSlides) ? carouselSlides : undefined,
        contentScore: (() => {
          const readability = Math.floor(Math.random() * 25) + 70;
          const hookStrength = Math.floor(Math.random() * 30) + 65;
          const hashtagQuality = Math.floor(Math.random() * 30) + 60;
          const ctaClarity = Math.floor(Math.random() * 25) + 70;
          const platformFit = Math.floor(Math.random() * 20) + 75;
          const total = Math.round((readability + hookStrength + hashtagQuality + ctaClarity + platformFit) / 5);
          return { total, readability, hookStrength, hashtagQuality, ctaClarity, platformFit };
        })()
      };
    });
  }

  static generateDemoContent(wizardData: any): Promise<WebhookResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const demoPostTemplates = [
          {
            platform: 'instagram',
            type: 'reel',
            content: '5 Social Media Hacks die du HEUTE noch umsetzen kannst! 🚀\n\n✨ Speichere diesen Post für später',
            caption: 'Quick Wins für mehr Engagement',
            hashtags: ['socialmediatips', 'contentcreator', 'marketing', 'instagram', 'reels']
          },
          {
            platform: 'linkedin',
            type: 'carousel',
            content: 'Die 7 größten Social Media Fehler 2025\n\nUnd wie du sie vermeidest 👇',
            caption: 'Social Media Fehler vermeiden',
            hashtags: ['socialmedia', 'marketing', 'linkedin', 'business', 'contentmarketing']
          },
          {
            platform: 'tiktok',
            type: 'reel',
            content: 'So erstellst du in 30 Sekunden viralen Content 🔥',
            caption: 'Viral Content Formel',
            hashtags: ['tiktok', 'viral', 'contentcreator', 'socialmedia', 'hacks']
          },
          {
            platform: 'instagram',
            type: 'story',
            content: 'Umfrage: Welches Thema interessiert dich am meisten? 🤔\n\nA) Content-Strategie\nB) Algorithmus-Hacks\nC) Community-Building',
            caption: 'Community Umfrage',
            hashtags: ['instagram', 'community', 'engagement', 'stories']
          }
        ];

        const numPosts = Math.min(wizardData.frequency * wizardData.platforms.length, 12);
        const contentPlan = [];

        for (let i = 0; i < numPosts; i++) {
          const template = demoPostTemplates[i % demoPostTemplates.length];
          const platform = wizardData.platforms[i % wizardData.platforms.length];

          contentPlan.push({
            post_id: `demo-post-${i + 1}`,
            platform: platform,
            type: template.type,
            content: template.content,
            caption: template.caption,
            hashtags: template.hashtags,
            ready_to_publish: true
          });
        }

        const response: WebhookResponse = {
          success: true,
          processing_complete: true,
          content_plan: contentPlan,
          metadata: {
            user_id: 'demo-user-001',
            total_posts: contentPlan.length,
            generation_time: '2.3s',
            workflow_version: 'demo-v1.0'
          },
          user_message: {
            title: 'Dein Content-Plan ist bereit! 🎉',
            description: `Ich habe ${contentPlan.length} Posts für dich erstellt, optimiert auf ${wizardData.goal} mit ${wizardData.tone} Tonalität.`,
            next_steps: [
              'Posts im Kalender ansehen und anpassen',
              'Zeitpunkte nach deinen Insights optimieren',
              'Bei Bedarf weitere Posts generieren'
            ]
          }
        };

        resolve(response);
      }, 6000);
    });
  }

  private static getOptimalTime(platform: string): string {
    const times: Record<string, string> = {
      instagram: '18:00',
      linkedin: '09:00',
      tiktok: '19:00',
      facebook: '15:00',
      twitter: '12:00'
    };
    return times[platform] || '18:00';
  }

  private static getMockImage(index: number): string {
    const mockImages = [
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop'
    ];
    return mockImages[index % mockImages.length];
  }
}