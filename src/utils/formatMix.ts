export type ContentFormat = 'carousel' | 'single_image' | 'text_only';
export type StoryFormat = 'story_teaser' | 'story_standalone';

export interface FormatMixSummary {
  carousel: number;
  single_image: number;
  text_only: number;
  story_teaser: number;
  story_standalone: number;
  total_feed: number;
  total_stories: number;
  total: number;
}

export interface FormatMixResult {
  platform: string;
  platformLabel: string;
  weeklyMix: ContentFormat[];
  weeklyStoryMix: StoryMixEntry[];
  summary: FormatMixSummary;
}

export interface StoryMixEntry {
  type: StoryFormat;
  references_feed_index: number | null;
}

const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  twitter: 'X (Twitter)',
  tiktok: 'TikTok',
};

export function platformSupportsStories(platform: string): boolean {
  return ['instagram', 'facebook'].includes(platform);
}

export function anyPlatformSupportsStories(platforms: string[]): boolean {
  return platforms.some(p => platformSupportsStories(p));
}

export function getWeeklyFormatMix(postsPerWeek: number, platform: string): ContentFormat[] {
  if (platform === 'instagram') {
    if (postsPerWeek <= 2) return Array(postsPerWeek).fill('single_image');
    if (postsPerWeek === 3) return ['carousel', 'single_image', 'single_image'];
    if (postsPerWeek === 4) return ['carousel', 'single_image', 'single_image', 'single_image'];
    const mix: ContentFormat[] = ['carousel', 'single_image', 'single_image', 'carousel'];
    while (mix.length < postsPerWeek) mix.push('single_image');
    return mix;
  }

  if (platform === 'linkedin') {
    if (postsPerWeek === 1) return ['text_only'];
    if (postsPerWeek === 2) return ['text_only', 'single_image'];
    if (postsPerWeek === 3) return ['carousel', 'text_only', 'single_image'];
    if (postsPerWeek === 4) return ['carousel', 'text_only', 'single_image', 'text_only'];
    const mix: ContentFormat[] = ['carousel', 'text_only', 'single_image', 'carousel', 'text_only'];
    while (mix.length < postsPerWeek) mix.push('single_image');
    return mix;
  }

  if (platform === 'facebook') {
    if (postsPerWeek === 1) return ['single_image'];
    if (postsPerWeek === 2) return ['single_image', 'text_only'];
    if (postsPerWeek === 3) return ['carousel', 'single_image', 'text_only'];
    if (postsPerWeek === 4) return ['carousel', 'single_image', 'text_only', 'single_image'];
    const mix: ContentFormat[] = ['carousel', 'single_image', 'text_only', 'single_image', 'carousel'];
    while (mix.length < postsPerWeek) mix.push('single_image');
    return mix;
  }

  if (platform === 'twitter') {
    if (postsPerWeek === 1) return ['text_only'];
    if (postsPerWeek === 2) return ['text_only', 'text_only'];
    if (postsPerWeek === 3) return ['text_only', 'single_image', 'text_only'];
    const mix: ContentFormat[] = ['text_only', 'single_image', 'text_only', 'text_only'];
    while (mix.length < postsPerWeek) mix.push('text_only');
    return mix;
  }

  if (platform === 'tiktok') {
    return Array(postsPerWeek).fill('single_image');
  }

  return Array(postsPerWeek).fill('single_image');
}

export function getStoryMix(feedPostCount: number, platform: string): StoryMixEntry[] {
  if (!platformSupportsStories(platform)) return [];

  const storyCount = Math.max(1, Math.round(feedPostCount / 2));
  const stories: StoryMixEntry[] = [];

  for (let i = 0; i < storyCount; i++) {
    if (i % 2 === 0) {
      stories.push({ type: 'story_teaser', references_feed_index: i % feedPostCount });
    } else {
      stories.push({ type: 'story_standalone', references_feed_index: null });
    }
  }

  return stories;
}

export function calculateFormatPreview(
  platforms: string[],
  postsPerWeek: number,
  weeks: number,
  storiesEnabled: boolean = false
): FormatMixResult[] {
  return platforms.map(platform => {
    const weeklyMix = getWeeklyFormatMix(postsPerWeek, platform);
    const weeklyStoryMix = storiesEnabled ? getStoryMix(postsPerWeek, platform) : [];

    const totalFeedFormats: ContentFormat[] = [];
    const totalStoryFormats: StoryFormat[] = [];
    for (let w = 0; w < weeks; w++) {
      totalFeedFormats.push(...weeklyMix);
      weeklyStoryMix.forEach(s => totalStoryFormats.push(s.type));
    }

    return {
      platform,
      platformLabel: PLATFORM_LABELS[platform] || platform,
      weeklyMix,
      weeklyStoryMix,
      summary: {
        carousel: totalFeedFormats.filter(f => f === 'carousel').length,
        single_image: totalFeedFormats.filter(f => f === 'single_image').length,
        text_only: totalFeedFormats.filter(f => f === 'text_only').length,
        story_teaser: totalStoryFormats.filter(f => f === 'story_teaser').length,
        story_standalone: totalStoryFormats.filter(f => f === 'story_standalone').length,
        total_feed: totalFeedFormats.length,
        total_stories: totalStoryFormats.length,
        total: totalFeedFormats.length + totalStoryFormats.length,
      },
    };
  });
}
