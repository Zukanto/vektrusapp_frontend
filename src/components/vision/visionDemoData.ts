import { VisionProject } from './types';

const daysAgo = (days: number) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

const hoursAgo = (hours: number) =>
  new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

export const DEMO_PROJECTS: (VisionProject & { isDemo: true })[] = [
  {
    id: 'demo-1',
    isDemo: true,
    user_id: 'demo',
    product_name: 'Glow Serum Pro',
    target_audience: 'Frauen 25-35, Beauty-affin, Instagram & TikTok',
    user_description:
      'Junge Frau in hellem Badezimmer, hält das Serum in der Hand und lächelt in die Kamera. Natürliches Licht, Clean-Ästhetik.',
    style_tags: ['Clean', 'Luxuriös'],
    reference_images: [
      {
        url: 'https://images.pexels.com/photos/3685530/pexels-photo-3685530.jpeg?auto=compress&cs=tinysrgb&w=300',
      },
      {
        url: 'https://images.pexels.com/photos/3018845/pexels-photo-3018845.jpeg?auto=compress&cs=tinysrgb&w=300',
      },
    ],
    model_selection: 'Nano + Veo 3.1',
    output_type: 'video',
    status: 'finished',
    image_url:
      'https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?auto=compress&cs=tinysrgb&w=800',
    video_url:
      'https://videos.pexels.com/video-files/4622400/4622400-hd_1080_1920_25fps.mp4',
    created_at: daysAgo(3),
    finished_at: daysAgo(3),
  },
  {
    id: 'demo-2',
    isDemo: true,
    user_id: 'demo',
    product_name: 'FitPro Protein Mix',
    target_audience: 'Männer & Frauen 20-30, Fitness-Community',
    user_description:
      'Sportliche Person nach dem Workout, mixt den Protein Shake. Gym-Setting, energetisch und motivierend.',
    style_tags: ['Energetisch', 'Realistisch'],
    reference_images: [
      {
        url: 'https://images.pexels.com/photos/3735218/pexels-photo-3735218.jpeg?auto=compress&cs=tinysrgb&w=300',
      },
    ],
    model_selection: 'Veo 3.1',
    output_type: 'video',
    status: 'generating',
    created_at: hoursAgo(1),
  },
  {
    id: 'demo-3',
    isDemo: true,
    user_id: 'demo',
    product_name: 'Artisan Coffee Blend',
    target_audience: 'Kaffee-Liebhaber 25-45, Premium-Segment',
    user_description:
      'Person gießt Kaffee in eine hochwertige Tasse, warmes Morgenlicht, gemütliches Ambiente. Lifestyle-Feeling.',
    style_tags: ['Luxuriös', 'Minimalistisch'],
    reference_images: [
      {
        url: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=300',
      },
      {
        url: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=300',
      },
    ],
    model_selection: 'Sora 2',
    output_type: 'video',
    status: 'queued',
    created_at: hoursAgo(0.5),
  },
  {
    id: 'demo-4',
    isDemo: true,
    user_id: 'demo',
    product_name: 'Luxe Night Cream',
    target_audience: 'Frauen 30-50, Hautpflege-bewusst, LinkedIn & Instagram',
    user_description:
      'Elegante Nahaufnahme der Creme auf der Haut, weiche Beleuchtung, luxuriöser Hintergrund mit goldenen Akzenten.',
    style_tags: ['Luxuriös', 'Clean'],
    reference_images: [
      {
        url: 'https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg?auto=compress&cs=tinysrgb&w=300',
      },
      {
        url: 'https://images.pexels.com/photos/3685530/pexels-photo-3685530.jpeg?auto=compress&cs=tinysrgb&w=300',
      },
      {
        url: 'https://images.pexels.com/photos/2587370/pexels-photo-2587370.jpeg?auto=compress&cs=tinysrgb&w=300',
      },
    ],
    model_selection: 'Nano + Veo 3.1',
    output_type: 'video',
    status: 'finished',
    image_url:
      'https://images.pexels.com/photos/3373738/pexels-photo-3373738.jpeg?auto=compress&cs=tinysrgb&w=800',
    video_url:
      'https://videos.pexels.com/video-files/4622466/4622466-hd_1080_1920_25fps.mp4',
    created_at: daysAgo(7),
    finished_at: daysAgo(7),
  },
  {
    id: 'demo-5',
    isDemo: true,
    user_id: 'demo',
    product_name: 'Urban Sneaker X9',
    target_audience: 'Gen-Z, Streetwear-Fans, TikTok & Instagram',
    user_description:
      'Person läuft durch urbane Straße, Sneaker im Fokus. Dynamische Kameraführung, Street-Style Ästhetik.',
    style_tags: ['Energetisch'],
    reference_images: [
      {
        url: 'https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=300',
      },
    ],
    model_selection: 'Veo 3.1',
    output_type: 'video',
    status: 'failed',
    error_message: 'Bildanalyse fehlgeschlagen. Bitte versuche es mit einem anderen Referenzbild.',
    created_at: daysAgo(1),
    failed_at: daysAgo(1),
  },
];
