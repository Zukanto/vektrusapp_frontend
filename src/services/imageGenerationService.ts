import { supabase } from '../lib/supabase';

export interface GeneratedImage {
  id: string;
  user_id: string;
  prompt: string;
  generated_image_url: string;
  status: 'processing' | 'completed' | 'failed';
  workflow_type: string;
  nano_task_id?: string;
  created_at: string;
}

export interface GenerateImageResponse {
  success: boolean;
  message: string;
  data: {
    generation_id: string;
    image_url: string;
    filename: string;
    prompt: string;
    media_file_id: string;
  };
}

export interface AdvancedImageVariant {
  variant_number: number;
  image_url: string;
  filename: string;
  media_file_id: string;
}

export interface GenerateAdvancedImageResponse {
  success: boolean;
  message: string;
  data: {
    generation_id: string;
    total_variants: number;
    images: AdvancedImageVariant[];
    prompt: string;
  };
}

export interface GenerationProgress {
  stage: 'uploading' | 'analyzing' | 'generating' | 'quality_check' | 'finalizing';
  message: string;
  percent?: number;
}

export const testImageAdvancedWebhook = async () => {
  console.log('🧪 Testing Image Advanced Webhook via Edge Function...');

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    console.error('❌ No valid session found');
    return { success: false, error: 'Not authenticated' };
  }

  console.log('✅ Session found:', session.user.id);

  const testPayload = {
    path: 'image-advanced',
    prompt: 'A beautiful landscape with mountains and a lake, sunset lighting',
    count: 1
  };

  console.log('📤 Sending test request with payload:', testPayload);

  try {
    const { data, error } = await supabase.functions.invoke('n8n-proxy', {
      body: testPayload
    });

    if (error) {
      console.error('❌ Test failed:', error);
      return { success: false, error: error.message };
    }

    console.log('📥 Response:', data);

    if (data?.data?.images) {
      console.log('📸 Images in response:');
      data.data.images.forEach((img: any, index: number) => {
        console.log(`  Image ${index + 1}:`, {
          variant_number: img.variant_number,
          image_url: img.image_url,
          image_url_length: img.image_url?.length || 0,
          image_url_is_valid: Boolean(img.image_url && img.image_url.startsWith('http')),
          filename: img.filename,
          media_file_id: img.media_file_id
        });
      });
    }

    return {
      success: true,
      data: data
    };
  } catch (error: any) {
    console.error('❌ Test failed:', error);
    return { success: false, error: error.message };
  }
};

(window as any).testImageAdvancedWebhook = testImageAdvancedWebhook;

export const ImageGenerationService = {
  async generateImage(
    prompt: string,
    model: 'gpt-image-1' | 'nano-banana-pro' = 'gpt-image-1',
    aspect_ratio: string = '1:1'
  ): Promise<GenerateImageResponse> {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      throw new Error('User nicht eingeloggt');
    }

    if (!prompt.trim()) {
      throw new Error('Prompt ist erforderlich');
    }

    console.log('Generating image with prompt:', prompt);
    console.log('Model:', model);
    console.log('Image generation request body:', { path: 'image-simple', prompt: prompt.trim(), model, aspect_ratio });

    try {
      const { data, error } = await supabase.functions.invoke('n8n-proxy', {
        body: {
          path: 'image-simple',
          prompt: prompt.trim(),
          model: model,
          aspect_ratio: aspect_ratio
        }
      });

      if (error) {
        console.error('❌ Image generation error:', error);
        
        if (error.message?.includes('401') || error.message?.includes('403')) {
          throw new Error('Bitte melde dich erneut an.');
        }

        throw new Error(error.message || 'Bildgenerierung fehlgeschlagen');
      }

      console.log('✅ Image generated:', data);
      return data;
    } catch (error: any) {
      console.error('❌ Image generation failed:', error);
      throw error;
    }
  },

  async getUserImages(): Promise<GeneratedImage[]> {
    const { data, error } = await supabase
      .from('generated_images')
      .select('*')
      .eq('workflow_type', 'simple')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getImage(imageId: string): Promise<GeneratedImage> {
    const { data, error } = await supabase
      .from('generated_images')
      .select('*')
      .eq('id', imageId)
      .single();

    if (error) throw error;
    return data;
  },

  async uploadImage(file: File): Promise<string> {
    console.log('📤 Uploading image to Supabase Storage...');

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      throw new Error('User nicht eingeloggt');
    }

    if (!file) {
      throw new Error('Keine Datei ausgewählt');
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('Nur Bild-Dateien sind erlaubt');
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error('Bild ist zu groß (max. 10MB)');
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Ungültiger Dateityp. Nur JPEG, PNG, WebP und GIF erlaubt.');
    }

    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `temp_${timestamp}_${sanitizedName}`;
    const filepath = `temp-uploads/${filename}`;

    console.log('Uploading file:', {
      filename,
      filepath,
      size: file.size,
      type: file.type
    });

    try {
      const { data, error } = await supabase.storage
        .from('user-images')
        .upload(filepath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (error) {
        console.error('❌ Supabase Storage Upload Error:', error);
        throw new Error(`Upload fehlgeschlagen: ${error.message}`);
      }

      if (!data || !data.path) {
        throw new Error('Upload erfolgreich, aber kein Pfad zurückgegeben');
      }

      console.log('✅ Upload successful:', data);

      const { data: { publicUrl } } = supabase.storage
        .from('user-images')
        .getPublicUrl(data.path);

      console.log('✅ Public URL:', publicUrl);

      return publicUrl;
    } catch (error: any) {
      console.error('❌ Upload Error:', error);
      throw new Error(`Bild-Upload fehlgeschlagen: ${error.message || 'Unbekannter Fehler'}`);
    }
  },

  async generateAdvancedImage(params: {
    prompt: string;
    inspirationImageUrl?: string;
    productImageUrl?: string;
    count?: number;
    aspect_ratio?: string;
    use_brand_ci?: boolean;
    onProgress?: (progress: GenerationProgress) => void;
  }): Promise<GenerateAdvancedImageResponse> {
    console.log('🎨 Starting Advanced Image Generation...');

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      throw new Error('Bitte melde dich erneut an.');
    }

    if (!params.prompt.trim()) {
      throw new Error('Bitte gib eine Bildbeschreibung ein');
    }

    const count = Math.min(Math.max(params.count || 1, 1), 5);

    const inspirationUrl = params.inspirationImageUrl;
    const productUrl = params.productImageUrl;

    console.log('Generating advanced image with:', {
      prompt: params.prompt,
      hasInspiration: !!inspirationUrl,
      hasProduct: !!productUrl,
      count: count
    });

    params.onProgress?.({
      stage: 'analyzing',
      message: inspirationUrl || productUrl
        ? 'KI analysiert Referenzbilder...'
        : 'Bereite Bildgenerierung vor...',
      percent: 25
    });

    console.log('🚀 Sending request via Edge Function...');
    console.log('Image generation request body:', { path: 'image-advanced', prompt: params.prompt.trim(), aspect_ratio: params.aspect_ratio || '1:1', count, inspiration_image_url: inspirationUrl, product_image_url: productUrl });

    const estimatedTime = count * 60;
    params.onProgress?.({
      stage: 'generating',
      message: `Generiere ${count} ${count === 1 ? 'Variante' : 'Varianten'}... (ca. ${Math.ceil(estimatedTime / 60)} Min)`,
      percent: 40
    });

    try {
      const { data, error } = await supabase.functions.invoke('n8n-proxy', {
        body: {
          path: 'image-advanced',
          prompt: params.prompt.trim(),
          inspiration_image_url: inspirationUrl,
          product_image_url: productUrl,
          count: count,
          aspect_ratio: params.aspect_ratio || '1:1',
          use_brand_ci: params.use_brand_ci ?? false
        }
      });

      if (error) {
        console.error('❌ Advanced image error:', error);

        if (error.message?.includes('401') || error.message?.includes('403')) {
          throw new Error('Authentifizierung fehlgeschlagen. Bitte melde dich erneut an.');
        }

        throw new Error(error.message || 'Bildgenerierung fehlgeschlagen');
      }

      params.onProgress?.({
        stage: 'quality_check',
        message: 'Quality Check läuft...',
        percent: 85
      });

      console.log('✅ Advanced images generated:', data);
      console.log('✅ Response structure check:', {
        hasSuccess: Boolean(data.success),
        hasData: Boolean(data.data),
        hasImages: Boolean(data.data?.images),
        imagesCount: data.data?.images?.length || 0
      });

      if (!data.success || !data.data || !data.data.images || data.data.images.length === 0) {
        console.error('❌ Invalid response structure');
        throw new Error('Keine Bilder wurden generiert. Bitte versuche es erneut.');
      }

      console.log('🖼️ Validating image URLs...');
      data.data.images.forEach((img: AdvancedImageVariant, index: number) => {
        const isValid = img.image_url &&
                       typeof img.image_url === 'string' &&
                       img.image_url.trim() !== '' &&
                       (img.image_url.startsWith('http://') || img.image_url.startsWith('https://'));

        console.log(`  Image ${index + 1}:`, {
          variant: img.variant_number,
          url: img.image_url,
          isValid: isValid
        });

        if (!isValid) {
          console.error(`  ❌ Image ${index + 1} has INVALID URL!`);
        }
      });

      params.onProgress?.({
        stage: 'finalizing',
        message: 'Fertig!',
        percent: 100
      });

      return data;
    } catch (error: any) {
      console.error('❌ Advanced image generation failed:', error);
      throw error;
    }
  }
};