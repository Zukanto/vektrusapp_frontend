import { supabase } from '../lib/supabase';
import { callN8n } from '../lib/n8n';

export interface ReelConfiguration {
  platforms: string[];
  theme: string;
  topic_description?: string;
  reel_count: number;
  difficulty: 'einfach' | 'mittel' | 'fortgeschritten';
  show_face: boolean;
}

export interface ReelWebhookResponse {
  success: boolean;
  pulse_id: string;
  status: string;
  mode: string;
  summary: {
    total_reels: number;
    platforms: string[];
    difficulty: string;
  };
}

export interface ReelScene {
  nr: number;
  action: string;
  duration_seconds: number;
  camera: string;
  tip: string;
  text_overlay: string | null;
}

export interface ReelContent {
  type: string;
  format: string;
  title: string;
  hook: {
    text: string;
    type: string;
    delivery: string;
  };
  scenes: ReelScene[];
  total_duration_seconds: number;
  voiceover_script: string | null;
  audio_suggestion: { type: string; note: string };
  caption: string;
  hashtags: string[];
  why_it_works: string;
  difficulty: string;
  estimated_effort: string;
  needs_face: boolean;
  content_type: string;
  reasoning: string;
}

export const generateReels = async (config: ReelConfiguration): Promise<ReelWebhookResponse> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Nicht eingeloggt');

  return callN8n('vektrus-pulse-reels', {
    user_id: session.user.id,
    reel_configuration: {
      ...config,
      language: 'DE',
    },
  });
};

export const pollReelStatus = async (pulseId: string) => {
  const { data } = await supabase
    .from('pulse_configurations')
    .select('status, completed_at')
    .eq('id', pulseId)
    .single();
  return data;
};

export const loadReelResults = async (pulseId: string) => {
  const { data } = await supabase
    .from('pulse_generated_content')
    .select('*')
    .eq('pulse_config_id', pulseId)
    .eq('source', 'pulse_reels')
    .order('post_number', { ascending: true });
  return data || [];
};
