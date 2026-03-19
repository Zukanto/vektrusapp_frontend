export const kpiData = {
  reach: { value: '86.5K', trend: '+24%', direction: 'up' as const },
  engagement: { value: '3.4%', trend: '+0.6%', direction: 'up' as const },
  impressions: { value: '142K', trend: '+18%', direction: 'up' as const },
  posts: { value: '34', trend: 'gleich', direction: 'neutral' as const },
};

export const engagementData = [
  { date: '15.02', engagement: 2.1 },
  { date: '17.02', engagement: 3.4 },
  { date: '19.02', engagement: 5.4 },
  { date: '21.02', engagement: 2.8 },
  { date: '23.02', engagement: 1.9 },
  { date: '25.02', engagement: 4.2 },
  { date: '27.02', engagement: 2.2 },
  { date: '01.03', engagement: 3.1 },
  { date: '03.03', engagement: 2.6 },
  { date: '05.03', engagement: 1.8 },
  { date: '07.03', engagement: 3.9 },
  { date: '09.03', engagement: 3.5 },
  { date: '11.03', engagement: 1.3 },
  { date: '13.03', engagement: 4.1 },
  { date: '15.03', engagement: 2.9 },
  { date: '16.03', engagement: 3.2 },
];

export const heatmapData = [
  { day: 1, hour: 9, engagement: 342, posts: 12 },
  { day: 1, hour: 18, engagement: 289, posts: 8 },
  { day: 2, hour: 9, engagement: 198, posts: 5 },
  { day: 2, hour: 12, engagement: 156, posts: 4 },
  { day: 2, hour: 18, engagement: 510, posts: 15 },
  { day: 3, hour: 9, engagement: 267, posts: 9 },
  { day: 3, hour: 15, engagement: 312, posts: 7 },
  { day: 4, hour: 9, engagement: 223, posts: 6 },
  { day: 4, hour: 12, engagement: 289, posts: 8 },
  { day: 5, hour: 9, engagement: 178, posts: 4 },
  { day: 5, hour: 18, engagement: 445, posts: 11 },
];

export const decayData = [
  { label: '0-6h', percentage: 45.2 },
  { label: '6-12h', percentage: 18.7 },
  { label: '12-24h', percentage: 14.1 },
  { label: '1-2d', percentage: 9.3 },
  { label: '2-7d', percentage: 8.1 },
  { label: '7-30d', percentage: 3.8 },
  { label: '30d+', percentage: 0.8 },
];

export const topPostsData = [
  {
    platform: 'linkedin',
    format: 'text_only',
    content: 'Contactless, precise, efficient – hot air welding with a system. 💨',
    date: '19.02.2026',
    reach: 580,
    engagement_rate: 5.42,
    likes: 42,
    comments: 0,
    shares: 0,
    tier: 'high',
    thumbnail: null,
    post_url: 'https://linkedin.com/post/example1',
  },
  {
    platform: 'linkedin',
    format: 'text_only',
    content: 'Large packaging for frozen products – practical, hygienic, efficient. 🐟📦',
    date: '27.01.2026',
    reach: 420,
    engagement_rate: 5.81,
    likes: 36,
    comments: 0,
    shares: 0,
    tier: 'high',
    thumbnail: null,
    post_url: 'https://linkedin.com/post/example2',
  },
  {
    platform: 'facebook',
    format: 'single_image',
    content: 'Kontaktlos, präzise, effizient – Heißluftschweißen mit System. 💨',
    date: '19.02.2026',
    reach: 295,
    engagement_rate: 4.03,
    likes: 12,
    comments: 0,
    shares: 3,
    tier: 'medium',
    thumbnail: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop',
    post_url: 'https://facebook.com/post/example3',
  },
];

export const recyclingData = [
  {
    platform: 'linkedin',
    format: 'text_only',
    content: 'Expertise that lasts – continuing education at TÜV SÜD.',
    date: '25.02.2026',
    original_date_label: 'vor 19 Tagen',
    reach: 140,
    engagement_rate: 4.21,
    likes: 7,
    comments: 0,
    shares: 1,
    tier: 'high',
    recycle_reason: 'Überdurchschnittlich performt — ideal zum Auffrischen',
  },
  {
    platform: 'facebook',
    format: 'single_image',
    content: 'Dreifach aufgestellt. Voll im Takt. 3 neue CUBIX 3500KS Anlagen',
    date: '16.12.2025',
    original_date_label: 'vor 90 Tagen',
    reach: 0,
    engagement_rate: 3.34,
    likes: 13,
    comments: 0,
    shares: 3,
    tier: 'medium',
    recycle_reason: 'Gute Performance — lange genug her für Repost',
  },
  {
    platform: 'linkedin',
    format: 'text_only',
    content: '🎄 Christmas Season at prewa 🎄 We are taking a short break.',
    date: '22.12.2025',
    original_date_label: 'vor 84 Tagen',
    reach: 249,
    engagement_rate: 1.48,
    likes: 5,
    comments: 0,
    shares: 1,
    tier: 'medium',
    recycle_reason: 'Saisonaler Content — kann nächste Saison wiederverwendet werden',
  },
];

export const formatData = [
  { format: 'Carousel', icon: '🎠', posts: 6, avgReach: 15200, avgEngagement: 5.2, performance: 95 },
  { format: 'Reel/Video', icon: '🎬', posts: 4, avgReach: 12500, avgEngagement: 6.1, performance: 88 },
  { format: 'Single Image', icon: '📸', posts: 12, avgReach: 8200, avgEngagement: 3.1, performance: 72 },
  { format: 'Text-Only', icon: '📝', posts: 8, avgReach: 4100, avgEngagement: 4.8, performance: 68 },
];

export const platformData = [
  {
    platform: 'Instagram', color: '#E1306C', posts: 5,
    reachShare: 33, reach: 28500, engagement: 1800,
    strengths: ['Reichweite', 'Visual Content', 'Community'],
  },
  {
    platform: 'LinkedIn', color: '#0077B5', posts: 3,
    reachShare: 14, reach: 12300, engagement: 892,
    strengths: ['Lead Generation', 'B2B', 'Professional'],
  },
  {
    platform: 'TikTok', color: '#000000', posts: 2,
    reachShare: 53, reach: 45600, engagement: 2100,
    strengths: ['Viral Potential', 'Young Audience', 'Creative'],
  },
];

export const followerData = {
  accounts: [
    { platform: 'Instagram', color: '#E1306C', current: 76, growth: '+12 diese Woche' },
    { platform: 'LinkedIn', color: '#0077B5', current: 22, growth: '+3 diese Woche' },
    { platform: 'Facebook', color: '#1877F2', current: 2, growth: '+0 diese Woche' },
  ],
  chartData: [
    { date: '01.03', instagram: 64, linkedin: 19, facebook: 2 },
    { date: '03.03', instagram: 65, linkedin: 19, facebook: 2 },
    { date: '05.03', instagram: 67, linkedin: 20, facebook: 2 },
    { date: '07.03', instagram: 69, linkedin: 20, facebook: 2 },
    { date: '09.03', instagram: 71, linkedin: 21, facebook: 2 },
    { date: '11.03', instagram: 73, linkedin: 21, facebook: 2 },
    { date: '13.03', instagram: 74, linkedin: 22, facebook: 2 },
    { date: '15.03', instagram: 75, linkedin: 22, facebook: 2 },
    { date: '16.03', instagram: 76, linkedin: 22, facebook: 2 },
  ],
};

export const allPostsData = [
  { platform: 'facebook', format: 'single_image', content: '75 Beutel pro Minute – Mozzarella im Takt. 🧀', date: '11.03.2026', reach: 520, likes: 11, comments: 0, shares: 2, engagement: 1.26, tier: 'low' },
  { platform: 'linkedin', format: 'text_only', content: 'Mozzarella packaging with precision, speed, and hygiene.', date: '10.03.2026', reach: 480, likes: 19, comments: 1, shares: 0, engagement: 2.59, tier: 'medium' },
  { platform: 'facebook', format: 'single_image', content: 'Technologie für sensible Anwendungen – Verpackungslösung.', date: '27.02.2026', reach: 310, likes: 8, comments: 0, shares: 4, engagement: 2.19, tier: 'medium' },
  { platform: 'linkedin', format: 'text_only', content: 'Technology for sensitive applications – packaging.', date: '25.02.2026', reach: 323, likes: 12, comments: 0, shares: 0, engagement: 2.37, tier: 'medium' },
  { platform: 'linkedin', format: 'text_only', content: 'Expertise that lasts – continuing education at TÜV SÜD.', date: '25.02.2026', reach: 140, likes: 7, comments: 0, shares: 1, engagement: 4.21, tier: 'high' },
  { platform: 'facebook', format: 'single_image', content: 'Kontaktlos, präzise, effizient – Heißluftschweißen.', date: '19.02.2026', reach: 295, likes: 12, comments: 0, shares: 3, engagement: 4.03, tier: 'medium' },
  { platform: 'linkedin', format: 'text_only', content: 'Contactless, precise, efficient – hot air welding.', date: '19.02.2026', reach: 580, likes: 42, comments: 0, shares: 0, engagement: 5.42, tier: 'high' },
  { platform: 'facebook', format: 'single_image', content: 'Weiterbildung statt Stillstand. 🛠️📚', date: '26.02.2026', reach: 210, likes: 6, comments: 0, shares: 4, engagement: 2.33, tier: 'medium' },
  { platform: 'facebook', format: 'single_image', content: 'Bereit für den nächsten Einsatz. 📦🧂', date: '12.02.2026', reach: 250, likes: 10, comments: 0, shares: 2, engagement: 2.42, tier: 'medium' },
  { platform: 'linkedin', format: 'text_only', content: 'Ready for delivery – hail salt dosing with paper packaging.', date: '12.02.2026', reach: 748, likes: 37, comments: 0, shares: 0, engagement: 1.04, tier: 'low' },
];
