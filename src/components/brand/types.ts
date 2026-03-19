export interface UploadedDesign {
  id: string;
  file: File;
  previewUrl: string;
  publicUrl?: string;
  platform: string;
  uploadProgress: number;
  uploaded: boolean;
  error?: string;
}

export interface BrandColors {
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
  text?: string;
  mood?: string;
}

export interface BrandFonts {
  heading?: string;
  body?: string;
  accent?: string;
  hierarchy_description?: string;
  heading_custom?: string;
  body_custom?: string;
  accent_custom?: string;
}

export interface BrandTonality {
  formality?: string;
  addressing?: string;
  language_mix?: string;
  headline_style?: string;
  emotional_tone?: string;
  description?: string;
}

export interface BrandConfidence {
  overall?: number;
  colors?: number;
  typography?: number;
  layout?: number;
  tonality?: number;
}

export interface ReferenceImage {
  url: string;
  platform: string;
  analysis?: string;
}

export interface BrandProfile {
  user_id: string;
  logo_url?: string;
  logo_dark_url?: string;
  logo_storage_path?: string;
  colors: BrandColors;
  fonts: BrandFonts;
  slogan?: string;
  visual_style?: string;
  tonality: BrandTonality;
  design_dna: Record<string, any>;
  reference_images: ReferenceImage[];
  style_summary?: string;
  prompt_guidelines?: string;
  confidence: BrandConfidence;
  colors_edited?: boolean;
  onboarding_status: 'pending' | 'processing' | 'completed';
  extraction_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WizardData {
  designs: UploadedDesign[];
  logoFile?: File;
  logoPreviewUrl?: string;
  logoPublicUrl?: string;
  logoStoragePath?: string;
  slogan: string;
  primaryColor: string;
  secondaryColor: string;
  visualStyle: string;
  addressing: string;
  referenzConfirmed: boolean;
  headingFont: string;
  bodyFont: string;
}

export type PageState = 'loading' | 'wizard' | 'processing' | 'result';
export type WizardStep = 1 | 2 | 3;
