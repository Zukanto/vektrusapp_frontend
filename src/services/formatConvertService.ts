import { supabase } from '../lib/supabase';

export interface FormatOption {
  value: string;
  label: string;
  icon: string;
  description: string;
}

export async function convertPostFormat(
  contentRecordId: string,
  targetFormat: string
): Promise<{ success: boolean; message?: string; updated_content?: any; content_record_id?: string; target_format?: string }> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('User nicht eingeloggt');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000);

  try {
    console.log('[FormatConvert] Sende Request...', { contentRecordId, targetFormat });

    const response = await fetch('https://n8n.vektrus.ai/webhook/vektrus-format-convert', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content_record_id: contentRecordId,
        user_id: session.user.id,
        target_format: targetFormat
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log('[FormatConvert] Response Status:', response.status);

    const responseText = await response.text();
    console.log('[FormatConvert] Response Body (first 500 chars):', responseText.substring(0, 500));

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[FormatConvert] JSON Parse Error:', parseError);
      throw new Error('Ungültige Response vom Server');
    }

    console.log('[FormatConvert] Parsed Data:', {
      success: data.success,
      hasUpdatedContent: !!data.updated_content,
      contentFormat: data.updated_content?.content_format,
      hasDesignUrl: !!data.updated_content?.design_image_url
    });

    if (!response.ok || data.error) {
      throw new Error(data.message || `Server Error: ${response.status}`);
    }

    return data;

  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      console.error('[FormatConvert] Request Timeout nach 120s');
      throw new Error('Die Konvertierung dauert zu lange. Bitte lade die Seite neu — der Post wurde möglicherweise bereits konvertiert.');
    }

    console.error('[FormatConvert] Error:', error);
    throw error;
  }
}

export function getAvailableTargetFormats(
  currentFormat: string,
  platform: string
): FormatOption[] {
  const allFormats: FormatOption[] = [
    { value: 'single_image', label: 'Einzelbild', icon: '🖼️', description: 'Post mit einem Bild' },
    { value: 'carousel', label: 'Carousel', icon: '🎠', description: 'Multi-Slide Post (5 Slides)' },
    { value: 'text_only', label: 'Text Only', icon: '📝', description: 'Reiner Text ohne Bild' },
    { value: 'story_teaser', label: 'Story Teaser', icon: '📱', description: 'Story die zum Feed verweist' },
    { value: 'story_standalone', label: 'Story', icon: '📱', description: 'Eigenständige Story' }
  ];

  const platformSupport: Record<string, string[]> = {
    instagram: ['single_image', 'carousel', 'story_teaser', 'story_standalone'],
    linkedin: ['single_image', 'carousel', 'text_only'],
    facebook: ['single_image', 'carousel', 'text_only', 'story_teaser', 'story_standalone'],
    twitter: ['single_image', 'text_only'],
    tiktok: ['single_image']
  };

  const supported = platformSupport[platform] || ['single_image'];
  const isCurrentStory = currentFormat === 'story_teaser' || currentFormat === 'story_standalone';

  return allFormats.filter(f => {
    if (f.value === currentFormat) return false;
    if (!supported.includes(f.value)) return false;
    if (isCurrentStory && (f.value === 'story_teaser' || f.value === 'story_standalone')) return false;
    return true;
  });
}
