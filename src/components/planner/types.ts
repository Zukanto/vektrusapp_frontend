export interface ContentSlot {
  id: string;
  date: Date;
  time: string;
  platform: 'instagram' | 'linkedin' | 'tiktok' | 'facebook' | 'twitter';
  platforms?: Array<'instagram' | 'linkedin' | 'tiktok' | 'facebook' | 'twitter'>;
  status: 'planned' | 'draft' | 'ai_suggestion' | 'rejected' | 'published' | 'scheduled' | 'failed';
  title: string;
  body: string;
  content?: string;
  contentType: 'post' | 'story' | 'reel' | 'carousel';
  hashtags: string[];
  cta?: string;
  tone?: 'professional' | 'casual' | 'inspiring' | 'educational';
  targetAudience?: string;
  source?: 'pulse' | 'manual';
  generatedBy?: 'pulse' | 'manual' | 'ai';
  publishedAt?: string;
  platformPostId?: string;
  media?: {
    type: 'image' | 'video';
    url?: string;
    prompt?: string;
    style?: 'photo' | 'illustration' | 'meme' | 'infographic';
  };
  contentScore?: {
    total: number;
    readability: number;
    hookStrength: number;
    hashtagQuality: number;
    ctaClarity: number;
    platformFit: number;
  };
  campaign?: string;
  version?: {
    original: string;
    edited: string;
    lastModified: Date;
  };
  contentTypeDetail?: 'educational' | 'entertaining' | 'promotional' | 'behind_the_scenes';
  estimatedEngagement?: 'low' | 'medium' | 'high';
  reasoning?: string;
  emojiSuggestions?: string[];
}

export interface PlannerContext {
  goal: string;
  platforms: string[];
  frequency: number;
  theme?: string;
  targetAudience?: string;
  tone?: string;
}

export interface WizardStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}