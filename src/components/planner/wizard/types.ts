export interface PulseWizardData {
  theme: string;
  topicDescription: string;

  platforms: string[];
  frequency: number;
  scheduleType: 'next_7_days' | 'next_week' | 'next_14_days' | 'custom';
  timeframe: {
    startDate: Date;
    endDate: Date;
  };

  goal: string;
  tone: string;

  imageGeneration: {
    enabled: boolean;
    quality: 'standard' | 'premium';
  };

  storiesEnabled: boolean;
}

export type StoryFormat = 'story_teaser' | 'story_standalone';
export type StoryMood = 'energetic' | 'calm' | 'playful' | 'professional' | 'urgent';

export interface StoryContent {
  content_format: StoryFormat;
  text_overlay: string;
  subtext: string;
  story_mood: StoryMood;
  story_config?: {
    story_type: StoryFormat;
    references_post_number: number | null;
    format: '9:16';
    image_size: '1024x1536';
    text_in_image: true;
  };
  design_image_url: string | null;
  design_status: 'pending' | 'success' | 'failed';
  primary_text: '';
  hashtags: [];
  cta: '';
}

export type DesignStatus =
  | 'pending'
  | 'regenerating'
  | 'success'
  | 'skipped'
  | 'no_brand_profile'
  | 'failed_timeout'
  | 'failed_quality'
  | 'failed_download'
  | 'failed_generation';

export interface CarouselSlide {
  slide_number: number;
  type: 'hook' | 'value' | 'cta';
  headline: string;
  body: string;
  design_image_url: string | null;
  design_status: 'pending' | 'success' | 'failed';
}

export type ContentFormat = 'single_image' | 'text_only' | 'carousel' | 'story_teaser' | 'story_standalone';

export interface GeneratedPost {
  id: string;
  platform: string;
  title: string;
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
  scheduledTime: string;
  scheduledDate: Date;
  imageUrl?: string;
  designImageUrl?: string;
  applyCI?: boolean;
  imagePrompt?: string;
  imageType?: 'image' | 'video';
  designStatus?: DesignStatus;
  designStatusMessage?: string;
  contentScore?: {
    total: number;
    readability: number;
    hookStrength: number;
    hashtagQuality: number;
    ctaClarity: number;
    platformFit: number;
  };
  contentFormat?: ContentFormat;
  carouselSlides?: CarouselSlide[];
}

export type WizardMode = 'guided' | 'quick';

export type WizardData = PulseWizardData;
