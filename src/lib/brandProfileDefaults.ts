import { supabase } from './supabase';

export interface BrandTonality {
  formality?: string;
  addressing?: string;
  emotional_tone?: string;
  headline_style?: string;
  language_mix?: string;
  summary?: string;
}

export interface BrandProfileData {
  tonality: BrandTonality | null;
}

export interface SmartDefaults {
  tone?: string;
  language?: string;
}

export const loadBrandProfile = async (): Promise<BrandProfileData | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('brand_profiles')
    .select('tonality')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (error || !data) return null;
  return data as BrandProfileData;
};

export const getSmartDefaults = (brandProfile: BrandProfileData | null): SmartDefaults => {
  if (!brandProfile?.tonality) return {};

  const tonality = brandProfile.tonality;
  const defaults: SmartDefaults = {};

  const formalityMap: Record<string, string> = {
    'Locker': 'casual',
    'Professionell': 'professional',
    'Inspirierend': 'inspirational',
    'Humorvoll': 'humorous',
    'Informativ': 'informative',
  };

  if (tonality.formality && formalityMap[tonality.formality]) {
    defaults.tone = formalityMap[tonality.formality];
  } else if (tonality.emotional_tone) {
    const et = tonality.emotional_tone.toLowerCase();
    if (et.includes('humorvoll') || et.includes('witzig') || et.includes('lustig')) {
      defaults.tone = 'humorous';
    } else if (et.includes('inspirierend') || et.includes('motivierend')) {
      defaults.tone = 'inspirational';
    } else if (et.includes('informativ') || et.includes('sachlich') || et.includes('analytisch')) {
      defaults.tone = 'informative';
    }
  }

  if (tonality.language_mix) {
    const lm = tonality.language_mix.toLowerCase();
    const hasDe = lm.includes('deutsch');
    const hasEn = lm.includes('englisch');
    const hasAngl = lm.includes('anglizismen') || lm.includes('mix');

    if (hasDe && hasEn && !hasAngl) {
      defaults.language = 'BOTH';
    } else if (hasDe || hasAngl) {
      defaults.language = 'DE';
    } else if (hasEn) {
      defaults.language = 'EN';
    }
  }

  return defaults;
};

export const hasSmartDefaults = (defaults: SmartDefaults): boolean => {
  return !!(defaults.tone || defaults.language);
};
