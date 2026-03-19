export const DEMO_USER = {
  id: 'demo-user-001',
  email: 'demo@vektrus.com',
  user_metadata: {
    full_name: 'Sarah Weber',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    company: 'Digital Creators GmbH',
    role: 'Social Media Manager'
  }
};

export const DEMO_KPI_DATA = {
  reach: {
    current: 47823,
    previous: 38942,
    change: 22.8,
    trend: 'up' as const
  },
  engagement: {
    current: 4.2,
    previous: 3.5,
    change: 20.0,
    trend: 'up' as const
  },
  followers: {
    current: 12458,
    previous: 11203,
    change: 11.2,
    trend: 'up' as const
  },
  posts: {
    current: 24,
    previous: 18,
    change: 33.3,
    trend: 'up' as const
  }
};

export const DEMO_WEEK_PREVIEW = [
  {
    id: 'preview-1',
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    time: '09:00',
    platform: 'linkedin' as const,
    title: 'Produktivitäts-Hack: Die 2-Minuten-Regel',
    contentType: 'post' as const,
    status: 'scheduled' as const
  },
  {
    id: 'preview-2',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    time: '18:00',
    platform: 'instagram' as const,
    title: 'Neues Produkt-Launch: Behind the Scenes',
    contentType: 'reel' as const,
    status: 'scheduled' as const
  },
  {
    id: 'preview-3',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    time: '12:00',
    platform: 'linkedin' as const,
    title: 'Die Zukunft von KI in der Content-Erstellung',
    contentType: 'carousel' as const,
    status: 'draft' as const
  },
  {
    id: 'preview-4',
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    time: '16:00',
    platform: 'instagram' as const,
    title: 'Kundengeschichte: Vom Startup zum Erfolg',
    contentType: 'reel' as const,
    status: 'scheduled' as const
  },
  {
    id: 'preview-5',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    time: '10:00',
    platform: 'linkedin' as const,
    title: '5 Red Flags beim Hiring',
    contentType: 'carousel' as const,
    status: 'scheduled' as const
  },
  {
    id: 'preview-6',
    date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    time: '20:00',
    platform: 'instagram' as const,
    title: 'Weekend Vibes: Work-Life Balance',
    contentType: 'post' as const,
    status: 'ai_suggestion' as const
  },
  {
    id: 'preview-7',
    date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    time: '11:00',
    platform: 'facebook' as const,
    title: 'Community Event: Live Q&A Session',
    contentType: 'post' as const,
    status: 'scheduled' as const
  },
  {
    id: 'preview-8',
    date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
    time: '13:00',
    platform: 'twitter' as const,
    title: 'Quick Tipp: Engagement-Boost',
    contentType: 'post' as const,
    status: 'draft' as const
  },
  {
    id: 'preview-9',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    time: '17:00',
    platform: 'facebook' as const,
    title: 'Gewinnspiel: Teilen & Gewinnen',
    contentType: 'post' as const,
    status: 'ai_suggestion' as const
  }
];

export const DEMO_AI_INSIGHTS = [
  {
    type: 'positive' as const,
    title: 'Optimale Posting-Zeit entdeckt',
    description: 'Deine Instagram Reels performen zwischen 18-20 Uhr 45% besser.',
    action: 'Mehr Reels für diese Zeit planen',
    priority: 'high' as const
  },
  {
    type: 'recommendation' as const,
    title: 'Carousel-Format boosten',
    description: 'LinkedIn Carousels generieren 3x mehr Engagement als normale Posts.',
    action: 'Carousel-Content erstellen',
    priority: 'medium' as const
  },
  {
    type: 'warning' as const,
    title: 'Hashtag-Strategie überdenken',
    description: 'Deine Top 3 Hashtags erreichen nur 12% der Zielgruppe.',
    action: 'Neue Hashtags recherchieren',
    priority: 'low' as const
  }
];

export const DEMO_ONBOARDING_CHECKLIST = [
  {
    id: 'check-1',
    title: 'Social Media Accounts verbinden',
    description: 'Verbinde deine ersten Plattformen',
    completed: true,
    action: 'Accounts verwalten'
  },
  {
    id: 'check-2',
    title: 'Ersten Content-Plan erstellen',
    description: 'Nutze den Wizard für deinen Wochenplan',
    completed: true,
    action: 'Zum Planner'
  },
  {
    id: 'check-3',
    title: 'Performance analysieren',
    description: 'Verstehe deine ersten Insights',
    completed: false,
    action: 'Insights öffnen'
  },
  {
    id: 'check-4',
    title: 'Team einladen',
    description: 'Arbeite gemeinsam an eurem Content',
    completed: false,
    action: 'Team einladen'
  }
];

export const DEMO_PLANNED_POSTS = [
  {
    id: 'post-1',
    date: new Date(2025, 10, 4, 18, 0),
    time: '18:00',
    platform: 'instagram' as const,
    status: 'scheduled' as const,
    title: 'Behind the Scenes: Content Creation',
    content: 'So entstehen unsere Social Media Posts! 🎬 Von der Idee bis zum fertigen Content - ein kleiner Einblick in unseren kreativen Prozess.\n\nWas interessiert euch am meisten?\n\n#contentcreation #socialmedia #behindthescenes #creative #workflow',
    contentType: 'reel' as const,
    hashtags: ['contentcreation', 'socialmedia', 'behindthescenes', 'creative', 'workflow'],
    tone: 'casual' as const,
    contentScore: { total: 78, readability: 82, hookStrength: 75, hashtagQuality: 74, ctaClarity: 79, platformFit: 80 },
    mediaUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'post-2',
    date: new Date(2025, 10, 5, 9, 0),
    time: '09:00',
    platform: 'linkedin' as const,
    status: 'scheduled' as const,
    title: '5 Game-Changing Social Media Trends 2025',
    content: 'Die Social Media Landschaft verändert sich rasant. Hier sind 5 Trends, die ihr 2025 nicht verpassen solltet:\n\n1️⃣ KI-gestützte Content-Planung\n2️⃣ Authentic Storytelling\n3️⃣ Micro-Communities\n4️⃣ Short-Form Video dominiert\n5️⃣ Social Commerce Integration\n\nWelcher Trend ist für euch am relevantesten? 👇',
    contentType: 'carousel' as const,
    hashtags: ['socialmedia', 'trends2025', 'marketing', 'digitalmarketing', 'contentmarketing'],
    tone: 'professional' as const,
    contentScore: { total: 85, readability: 88, hookStrength: 83, hashtagQuality: 82, ctaClarity: 86, platformFit: 86 },
    mediaUrl: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'post-3',
    date: new Date(2025, 10, 6, 19, 0),
    time: '19:00',
    platform: 'tiktok' as const,
    status: 'draft' as const,
    title: '30-Sekunden Posting-Hack',
    content: 'Der schnellste Weg zu mehr Engagement! 🚀\n\n#socialmediatips #hacks #engagement #contentcreator #tiktoktips',
    contentType: 'reel' as const,
    hashtags: ['socialmediatips', 'hacks', 'engagement', 'contentcreator', 'tiktoktips'],
    tone: 'energetic' as const,
    contentScore: { total: 91, readability: 90, hookStrength: 93, hashtagQuality: 89, ctaClarity: 88, platformFit: 95 },
    mediaUrl: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'post-4',
    date: new Date(2025, 10, 7, 15, 0),
    time: '15:00',
    platform: 'instagram' as const,
    status: 'ai_suggestion' as const,
    title: 'Community Question Time',
    content: 'Zeit für eure Fragen! 💬 Stellt uns alles rund um Social Media Marketing.\n\nWir antworten live in den nächsten 2 Stunden!\n\n#ama #community #socialmedia #marketing #questions',
    contentType: 'story' as const,
    hashtags: ['ama', 'community', 'socialmedia', 'marketing', 'questions'],
    tone: 'friendly' as const,
    contentScore: { total: 72, readability: 76, hookStrength: 70, hashtagQuality: 68, ctaClarity: 74, platformFit: 72 }
  },
  {
    id: 'post-5',
    date: new Date(2025, 10, 8, 10, 0),
    time: '10:00',
    platform: 'linkedin' as const,
    status: 'draft' as const,
    title: 'Case Study: Mehr Engagement in 3 Monaten',
    content: 'Wie wir unserem Kunden innerhalb von 3 Monaten zu 65% mehr Engagement verholfen haben.\n\n📊 Die Strategie:\n• Konsistente Posting-Zeiten\n• Zielgruppen-spezifischer Content\n• KI-gestützte Optimierung\n• Community-First Ansatz\n\nMöchtet ihr mehr Details? Kommentiert "Case Study" und ich sende euch den vollständigen Report.\n\n#casestudy #socialmedia #marketing #success #roi',
    contentType: 'post' as const,
    hashtags: ['casestudy', 'socialmedia', 'marketing', 'success', 'roi'],
    tone: 'professional' as const,
    contentScore: { total: 81, readability: 84, hookStrength: 79, hashtagQuality: 80, ctaClarity: 82, platformFit: 80 },
    mediaUrl: 'https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'post-6',
    date: new Date(2025, 10, 9, 18, 30),
    time: '18:30',
    platform: 'instagram' as const,
    status: 'ai_suggestion' as const,
    title: 'Wochenrückblick & Learnings',
    content: 'Eine intensive Woche liegt hinter uns! 📈\n\nUnsere Top 3 Learnings:\n\n✨ Authentizität > Perfektion\n🎯 Konsistenz schlägt Quantität\n💡 Community-Feedback ist Gold wert\n\nWas waren eure größten Learnings diese Woche?\n\n#recap #learnings #socialmedia #growth #community',
    contentType: 'carousel' as const,
    hashtags: ['recap', 'learnings', 'socialmedia', 'growth', 'community'],
    tone: 'inspirational' as const,
    contentScore: { total: 79, readability: 80, hookStrength: 78, hashtagQuality: 77, ctaClarity: 79, platformFit: 81 },
    mediaUrl: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800'
  }
];

export const DEMO_TOP_POSTS = [
  {
    id: 'top-1',
    platform: 'instagram' as const,
    contentType: 'reel' as const,
    title: '5 Canva Hacks die du kennen musst',
    publishedAt: new Date(2025, 9, 28),
    metrics: {
      reach: 45238,
      impressions: 67842,
      engagement: 8.7,
      likes: 3942,
      comments: 287,
      shares: 523,
      saves: 1891
    },
    thumbnailUrl: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'top-2',
    platform: 'linkedin' as const,
    contentType: 'carousel' as const,
    title: 'Social Media Algorithmus verstehen',
    publishedAt: new Date(2025, 10, 1),
    metrics: {
      reach: 32847,
      impressions: 51293,
      engagement: 6.4,
      likes: 2847,
      comments: 412,
      shares: 892,
      saves: 0
    },
    thumbnailUrl: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'top-3',
    platform: 'tiktok' as const,
    contentType: 'reel' as const,
    title: 'So findest du die perfekte Posting-Zeit',
    publishedAt: new Date(2025, 9, 30),
    metrics: {
      reach: 87234,
      impressions: 142387,
      engagement: 9.2,
      likes: 12487,
      comments: 843,
      shares: 2341,
      saves: 0
    },
    thumbnailUrl: 'https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=400'
  }
];

export const DEMO_PERFORMANCE_DATA = {
  instagram: {
    reach: { value: 47823, change: 22.8, trend: 'up' as const },
    engagement: { value: 6.4, change: 18.2, trend: 'up' as const },
    followers: { value: 8342, change: 12.4, trend: 'up' as const },
    posts: { value: 16, change: 33.3, trend: 'up' as const }
  },
  linkedin: {
    reach: { value: 32847, change: 15.3, trend: 'up' as const },
    engagement: { value: 5.2, change: 24.1, trend: 'up' as const },
    followers: { value: 3248, change: 8.7, trend: 'up' as const },
    posts: { value: 8, change: 60.0, trend: 'up' as const }
  },
  tiktok: {
    reach: { value: 87234, change: 45.2, trend: 'up' as const },
    engagement: { value: 8.9, change: 31.4, trend: 'up' as const },
    followers: { value: 1268, change: 52.3, trend: 'up' as const },
    posts: { value: 4, change: 100.0, trend: 'up' as const }
  }
};

export const DEMO_POSTING_HEATMAP = {
  instagram: {
    monday: [2, 3, 4, 6, 8, 7, 5, 4, 3, 2, 1, 1, 2, 3, 5, 7, 9, 8, 6, 4, 3, 2, 2, 1],
    tuesday: [1, 2, 3, 5, 7, 8, 6, 5, 4, 3, 2, 2, 3, 4, 6, 8, 9, 8, 7, 5, 4, 3, 2, 1],
    wednesday: [2, 2, 4, 6, 8, 9, 7, 6, 5, 4, 3, 2, 3, 5, 7, 9, 10, 9, 8, 6, 5, 4, 3, 2],
    thursday: [1, 2, 3, 5, 7, 8, 7, 6, 5, 4, 3, 2, 3, 4, 6, 8, 9, 9, 8, 6, 5, 4, 3, 2],
    friday: [2, 3, 4, 6, 7, 8, 7, 6, 5, 4, 3, 3, 4, 5, 7, 8, 9, 10, 9, 7, 6, 5, 4, 3],
    saturday: [3, 3, 4, 5, 6, 7, 6, 5, 5, 4, 4, 5, 6, 7, 8, 9, 8, 7, 6, 5, 4, 4, 3, 3],
    sunday: [3, 2, 3, 4, 5, 6, 5, 5, 4, 4, 5, 6, 7, 8, 9, 8, 7, 6, 5, 5, 4, 3, 3, 2]
  }
};

export const DEMO_FORMAT_PERFORMANCE = [
  { format: 'Reels', reach: 45238, engagement: 8.7, posts: 8 },
  { format: 'Carousel', reach: 32847, engagement: 6.4, posts: 6 },
  { format: 'Post', reach: 18429, engagement: 4.2, posts: 7 },
  { format: 'Story', reach: 9842, engagement: 3.8, posts: 12 }
];

export const DEMO_CHAT_HISTORY = [
  {
    role: 'assistant' as const,
    content: 'Hallo Sarah! 👋 Ich bin dein Vektrus AI Assistant. Ich helfe dir, deine Social Media Strategie zu optimieren. Was möchtest du heute erreichen?',
    timestamp: new Date(2025, 10, 4, 9, 0)
  },
  {
    role: 'user' as const,
    content: 'Ich möchte meine Instagram Engagement Rate verbessern',
    timestamp: new Date(2025, 10, 4, 9, 2)
  },
  {
    role: 'assistant' as const,
    content: 'Perfekt! Basierend auf deinen aktuellen Daten habe ich 3 konkrete Empfehlungen:\n\n1. **Optimale Posting-Zeit**: Deine Posts zwischen 18-20 Uhr bekommen 45% mehr Engagement\n\n2. **Content-Format**: Reels performen 3x besser als normale Posts. Du solltest mindestens 60% Reels posten\n\n3. **Call-to-Action**: Posts mit direkten Fragen in der Caption bekommen 28% mehr Kommentare\n\nMöchtest du, dass ich dir einen optimierten Wochenplan mit diesen Insights erstelle?',
    timestamp: new Date(2025, 10, 4, 9, 3)
  }
];

export const DEMO_MEDIA_LIBRARY = [
  {
    id: 'media-1',
    type: 'image' as const,
    url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
    thumbnail: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=200',
    name: 'Team Brainstorming',
    uploadedAt: new Date(2025, 10, 1),
    size: 2.4,
    dimensions: { width: 1920, height: 1080 },
    usedIn: ['post-1']
  },
  {
    id: 'media-2',
    type: 'image' as const,
    url: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800',
    thumbnail: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=200',
    name: 'Social Media Analytics',
    uploadedAt: new Date(2025, 10, 2),
    size: 1.8,
    dimensions: { width: 1920, height: 1080 },
    usedIn: ['post-2']
  },
  {
    id: 'media-3',
    type: 'image' as const,
    url: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
    thumbnail: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=200',
    name: 'Content Creation Setup',
    uploadedAt: new Date(2025, 10, 3),
    size: 3.1,
    dimensions: { width: 1920, height: 1080 },
    usedIn: ['post-3']
  },
  {
    id: 'media-4',
    type: 'video' as const,
    url: 'https://videos.pexels.com/video-files/3195394/3195394-uhd_2560_1440_25fps.mp4',
    thumbnail: 'https://images.pexels.com/videos/3195394/pexels-photo-3195394.jpeg?auto=compress&cs=tinysrgb&w=200',
    name: 'Behind the Scenes Video',
    uploadedAt: new Date(2025, 9, 30),
    size: 45.2,
    dimensions: { width: 2560, height: 1440 },
    duration: 15,
    usedIn: []
  },
  {
    id: 'media-5',
    type: 'image' as const,
    url: 'https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg?auto=compress&cs=tinysrgb&w=800',
    thumbnail: 'https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg?auto=compress&cs=tinysrgb&w=200',
    name: 'Success Metrics Dashboard',
    uploadedAt: new Date(2025, 9, 28),
    size: 2.1,
    dimensions: { width: 1920, height: 1080 },
    usedIn: ['post-5']
  },
  {
    id: 'media-6',
    type: 'image' as const,
    url: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800',
    thumbnail: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=200',
    name: 'Weekly Review',
    uploadedAt: new Date(2025, 10, 4),
    size: 1.9,
    dimensions: { width: 1920, height: 1080 },
    usedIn: ['post-6']
  }
];

export const DEMO_AI_RECOMMENDATIONS = [
  {
    type: 'timing' as const,
    priority: 'high' as const,
    title: 'Optimale Posting-Zeit für Reels',
    description: 'Deine Instagram Reels performen zwischen 18-20 Uhr 45% besser als zu anderen Zeiten.',
    impact: '+45% Engagement',
    action: 'Mehr Reels für 18-20 Uhr planen',
    metrics: {
      current: 4.2,
      potential: 6.1,
      confidence: 92
    }
  },
  {
    type: 'content' as const,
    priority: 'high' as const,
    title: 'Carousel-Posts boosten',
    description: 'LinkedIn Carousel-Posts generieren 2.8x mehr Engagement als normale Posts. Du solltest mindestens 40% deiner LinkedIn-Posts als Carousel gestalten.',
    impact: '+68% Engagement',
    action: 'Mehr Carousel-Content erstellen',
    metrics: {
      current: 3.2,
      potential: 5.4,
      confidence: 88
    }
  },
  {
    type: 'hashtag' as const,
    priority: 'medium' as const,
    title: 'Hashtag-Strategie anpassen',
    description: 'Deine aktuellen Top-Hashtags erreichen nur 32% deiner Zielgruppe. Durch gezielte Nischen-Hashtags kannst du 40% mehr relevante Nutzer erreichen.',
    impact: '+40% Reichweite',
    action: 'Neue Hashtag-Recherche starten',
    metrics: {
      current: 32,
      potential: 45,
      confidence: 84
    }
  },
  {
    type: 'frequency' as const,
    priority: 'medium' as const,
    title: 'Posting-Frequenz erhöhen',
    description: 'Accounts mit 4-5 Posts pro Woche wachsen 65% schneller. Du postest aktuell 2.8x pro Woche.',
    impact: '+65% Follower-Wachstum',
    action: 'Wochenplan intensivieren',
    metrics: {
      current: 2.8,
      potential: 4.5,
      confidence: 79
    }
  },
  {
    type: 'platform' as const,
    priority: 'low' as const,
    title: 'TikTok-Potenzial nutzen',
    description: 'TikTok zeigt für deine Branche 2.8x höhere Engagement-Raten. Mit 2-3 TikToks pro Woche könntest du 350+ neue Follower pro Monat gewinnen.',
    impact: '+350 Follower/Monat',
    action: 'TikTok-Strategie entwickeln',
    metrics: {
      current: 0,
      potential: 350,
      confidence: 76
    }
  }
];
