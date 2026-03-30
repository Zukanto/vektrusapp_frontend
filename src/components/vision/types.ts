export interface VisionProject {
  id: string;
  user_id: string;
  product_name: string;
  target_audience?: string;
  user_description?: string;
  style_tags?: string[];
  extra_notes?: string;
  reference_images?: { url: string }[];
  model_selection?: string;
  output_type?: string;
  status: 'draft' | 'queued' | 'generating' | 'finished' | 'failed' | 'failed_timeout' | 'failed_generation' | 'failed_download';
  video_url?: string;
  image_url?: string;
  thumbnail_url?: string;
  error_message?: string;
  clip_purpose?: 'b_roll' | 'intro' | 'outro' | 'transition';
  generation_mode?: 'text_to_video' | 'image_to_video';
  reel_concept_id?: string | null;
  created_at?: string;
  queued_at?: string;
  started_at?: string;
  finished_at?: string;
  failed_at?: string;
  isDemo?: boolean;
}

export interface WizardFormData {
  productName: string;
  targetAudience: string;
  productFeatures: string;
  referenceImages: { url: string; file?: File }[];
  description: string;
  styleTags: string[];
  modelSelection: string;
}
