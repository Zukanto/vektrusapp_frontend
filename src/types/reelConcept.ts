// ── Reel Concept Types ──
// Canonical type definitions for reel concepts used throughout the Studio.

export type ReelFormat =
  | 'talking_head'
  | 'produkt_showcase'
  | 'tutorial'
  | 'behind_the_scenes'
  | 'vorher_nachher'
  | 'b_roll_montage'
  | 'listicle';

export type HookType = 'widerspruch' | 'zahl' | 'visuell' | 'frage' | 'statement';

export type HookDelivery = 'gesprochen' | 'text_overlay' | 'beides';

export type CameraType =
  | 'frontal_selfie'
  | 'detail_nah'
  | 'weitwinkel'
  | 'screen_recording'
  | 'produkt_fokus'
  | 'hände_fokus';

export type AudioType =
  | 'trending_sound'
  | 'voiceover'
  | 'musik_hintergrund'
  | 'original_audio';

export type PlatformOptimization = 'instagram' | 'tiktok' | 'youtube_shorts';

export type Difficulty = 'einfach' | 'mittel' | 'fortgeschritten';

export type ContentType = 'educational' | 'entertaining' | 'promotional' | 'behind_the_scenes';

export type BRollStatus = 'pending' | 'generating' | 'finished' | 'failed';

export interface Scene {
  nr: number;
  action: string;
  duration_seconds: number;
  camera: CameraType | string; // string fallback for legacy data
  tip: string;
  text_overlay: string | null;
  broll_video_url?: string;
  broll_status?: BRollStatus;
}

export interface ReelConcept {
  type: 'reel';
  format: ReelFormat | string;
  title: string;
  hook: {
    text: string;
    type: HookType | string;
    delivery: HookDelivery | string;
  };
  scenes: Scene[];
  total_duration_seconds: number;
  voiceover_script: string | null;
  audio_suggestion: {
    type: AudioType | string;
    note: string;
  };
  caption: string;
  hashtags: string[];
  platform_optimization: PlatformOptimization | string;
  why_it_works: string;
  difficulty: Difficulty | string;
  estimated_effort: string;
  needs_face: boolean;
  content_type: ContentType | string;
  reasoning: string;
  voiceover_audio_url?: string;
}

// ── Constants for labels / dropdowns ──

export const FORMAT_LABELS: Record<string, string> = {
  talking_head: 'Talking Head',
  produkt_showcase: 'Produkt-Showcase',
  tutorial: 'Tutorial',
  behind_the_scenes: 'Behind the Scenes',
  vorher_nachher: 'Vorher/Nachher',
  b_roll_montage: 'B-Roll Montage',
  listicle: 'Listicle',
};

export const FORMAT_OPTIONS: ReelFormat[] = [
  'talking_head',
  'produkt_showcase',
  'tutorial',
  'behind_the_scenes',
  'vorher_nachher',
  'b_roll_montage',
  'listicle',
];

export const HOOK_TYPE_LABELS: Record<string, string> = {
  widerspruch: 'Widerspruch',
  zahl: 'Zahl',
  visuell: 'Visuell',
  frage: 'Frage',
  statement: 'Statement',
};

export const HOOK_TYPE_OPTIONS: HookType[] = [
  'widerspruch',
  'zahl',
  'visuell',
  'frage',
  'statement',
];

export const DELIVERY_LABELS: Record<string, string> = {
  gesprochen: 'Gesprochen',
  text_overlay: 'Text-Overlay',
  beides: 'Beides',
};

export const DELIVERY_OPTIONS: HookDelivery[] = ['gesprochen', 'text_overlay', 'beides'];

export const CAMERA_LABELS: Record<string, string> = {
  frontal_selfie: 'Frontal / Selfie',
  detail_nah: 'Detail / Nah',
  weitwinkel: 'Weitwinkel',
  screen_recording: 'Screen Recording',
  produkt_fokus: 'Produkt-Fokus',
  'hände_fokus': 'Hände-Fokus',
};

export const CAMERA_OPTIONS: CameraType[] = [
  'frontal_selfie',
  'detail_nah',
  'weitwinkel',
  'screen_recording',
  'produkt_fokus',
  'hände_fokus',
];

export const AUDIO_TYPE_LABELS: Record<string, string> = {
  trending_sound: 'Trending Sound',
  voiceover: 'Voiceover',
  musik_hintergrund: 'Hintergrundmusik',
  original_audio: 'Original Audio',
};

export const AUDIO_TYPE_OPTIONS: AudioType[] = [
  'trending_sound',
  'voiceover',
  'musik_hintergrund',
  'original_audio',
];

export const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube_shorts: 'YouTube Shorts',
};

export const PLATFORM_OPTIONS: PlatformOptimization[] = [
  'instagram',
  'tiktok',
  'youtube_shorts',
];

export const PLATFORM_CAPTION_LIMITS: Record<string, number> = {
  instagram: 2200,
  tiktok: 2200,
  youtube_shorts: 500,
};

export const DIFFICULTY_LABELS: Record<string, string> = {
  einfach: 'Einfach',
  mittel: 'Mittel',
  fortgeschritten: 'Fortgeschritten',
};

export const DIFFICULTY_OPTIONS: Difficulty[] = ['einfach', 'mittel', 'fortgeschritten'];

export const DIFFICULTY_STYLES: Record<string, { bg: string; text: string }> = {
  einfach: { bg: 'rgba(73, 214, 158, 0.15)', text: '#49D69E' },
  mittel: { bg: 'rgba(244, 190, 157, 0.15)', text: '#F4BE9D' },
  fortgeschritten: { bg: 'rgba(124, 108, 242, 0.15)', text: '#7C6CF2' },
};

export const HOOK_TYPE_STYLES: Record<string, { bg: string; text: string }> = {
  widerspruch: { bg: 'rgba(250, 126, 112, 0.15)', text: '#FA7E70' },
  zahl: { bg: 'rgba(73, 183, 227, 0.15)', text: '#49B7E3' },
  visuell: { bg: 'rgba(232, 160, 214, 0.15)', text: '#E8A0D6' },
  frage: { bg: 'rgba(244, 190, 157, 0.15)', text: '#F4BE9D' },
  statement: { bg: 'rgba(124, 108, 242, 0.15)', text: '#7C6CF2' },
};

// ── Helper: create default scene ──
export function createDefaultScene(nr: number): Scene {
  return {
    nr,
    action: '',
    duration_seconds: 4,
    camera: 'frontal_selfie',
    tip: '',
    text_overlay: null,
  };
}

// ── Helper: recalculate derived fields ──
export function recalculate(concept: ReelConcept): ReelConcept {
  const total = concept.scenes.reduce((sum, s) => sum + s.duration_seconds, 0);
  return {
    ...concept,
    total_duration_seconds: total,
    estimated_effort: `${total}+ Sekunden, ${concept.scenes.length} Szenen`,
    scenes: concept.scenes.map((s, i) => ({ ...s, nr: i + 1 })),
  };
}
