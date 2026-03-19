import { ContentSlot } from '../components/planner/types';

export const generateRealisticDemoPosts = (): ContentSlot[] => {
  const now = new Date();
  const getDateOffset = (days: number, hour: number = 10) => {
    const date = new Date(now);
    date.setDate(date.getDate() + days);
    date.setHours(hour, 0, 0, 0);
    return date;
  };

  return [
    {
      id: 'demo-post-1',
      date: getDateOffset(1, 9),
      time: '09:00',
      platform: 'linkedin',
      platforms: ['linkedin'],
      status: 'scheduled',
      title: 'Produktivitäts-Hack: Die 2-Minuten-Regel',
      content: `Die 2-Minuten-Regel hat mein Zeitmanagement revolutioniert 🚀

Wenn eine Aufgabe weniger als 2 Minuten dauert, mache ich sie sofort. Das Ergebnis?

✅ Weniger mentale Last
✅ Mehr erledigte Tasks
✅ Besserer Workflow

Was sind eure besten Produktivitäts-Hacks? Teilt sie in den Kommentaren!

#Produktivität #Zeitmanagement #BusinessTips #WorkSmarter`,
      contentType: 'post',
      hashtags: ['Produktivität', 'Zeitmanagement', 'BusinessTips', 'WorkSmarter', 'Leadership'],
      tone: 'professional',
      targetAudience: 'Professionals, Entrepreneurs',
      contentScore: { total: 76, readability: 80, hookStrength: 72, hashtagQuality: 74, ctaClarity: 78, platformFit: 76 },
      campaign: 'Educational Content Series'
    },
    {
      id: 'demo-post-2',
      date: getDateOffset(2, 18),
      time: '18:00',
      platform: 'instagram',
      platforms: ['instagram', 'facebook'],
      status: 'scheduled',
      title: 'Neues Produkt-Launch: Behind the Scenes',
      content: `Sneak Peek! 👀✨

Monatelange Arbeit, unzählige Prototypen und jede Menge Kaffee später...

Wir launchen nächste Woche etwas GROSSES!

Könnt ihr erraten, was es ist? 🤔

Erster Hinweis: Es wird euren Alltag 10x einfacher machen.

#ComingSoon #NewProduct #BehindTheScenes #Startup #Innovation`,
      contentType: 'reel',
      hashtags: ['ComingSoon', 'NewProduct', 'BehindTheScenes', 'Startup', 'Innovation', 'ProductLaunch'],
      tone: 'casual',
      targetAudience: 'Young Professionals, Early Adopters',
      contentScore: { total: 87, readability: 86, hookStrength: 90, hashtagQuality: 85, ctaClarity: 84, platformFit: 90 },
      campaign: 'Product Launch Campaign',
      media: {
        type: 'video',
        style: 'photo',
        prompt: 'Behind the scenes product development, modern office, cinematic'
      }
    },
    {
      id: 'demo-post-3',
      date: getDateOffset(3, 12),
      time: '12:00',
      platform: 'linkedin',
      platforms: ['linkedin'],
      status: 'draft',
      title: 'Die Zukunft von KI in der Content-Erstellung',
      content: `KI verändert Content Marketing fundamental. Hier ist meine Einschätzung nach 6 Monaten intensiver Nutzung:

🎯 Was KI GUT kann:
• Erste Entwürfe & Ideenfindung
• Datenanalyse & Insights
• Routine-Content skalieren
• A/B-Testing beschleunigen

⚠️ Was KI NICHT kann:
• Authentische Brand Voice
• Emotionale Tiefe
• Strategisches Denken
• Echte Kreativität

Der Sweet Spot? KI als Co-Pilot, nicht als Ersatz.

Wie nutzt ihr KI in eurem Marketing?

#KI #ContentMarketing #DigitalTransformation #MarketingStrategy #AI`,
      contentType: 'carousel',
      hashtags: ['KI', 'ContentMarketing', 'DigitalTransformation', 'MarketingStrategy', 'AI', 'FutureOfWork'],
      tone: 'professional',
      targetAudience: 'Marketing Professionals, Business Leaders',
      contentScore: { total: 82, readability: 85, hookStrength: 80, hashtagQuality: 81, ctaClarity: 83, platformFit: 81 },
      campaign: 'Thought Leadership Series'
    },
    {
      id: 'demo-post-4',
      date: getDateOffset(4, 16),
      time: '16:00',
      platform: 'instagram',
      platforms: ['instagram', 'tiktok'],
      status: 'scheduled',
      title: 'Kundengeschichte: Vom Startup zum Erfolg',
      content: `"Vor einem Jahr waren wir zu zweit in einer WG. Heute haben wir 15 Mitarbeiter." 💪

Sarah's Story ist Inspiration pur!

Von 0 auf 1 Million Euro Umsatz in 12 Monaten. Hier sind ihre 3 wichtigsten Learnings:

1️⃣ Community first, Verkauf second
2️⃣ Authentizität schlägt Perfektion
3️⃣ Durchhalten, auch wenn's hart wird

Vollständiges Interview auf dem Link in der Bio!

Welchen Rat hättet ihr eurem früheren Unternehmer-Ich gegeben?

#StartupStory #Entrepreneurship #SuccessStory #Inspiration #GirlBoss #BusinessGrowth`,
      contentType: 'reel',
      hashtags: ['StartupStory', 'Entrepreneurship', 'SuccessStory', 'Inspiration', 'GirlBoss', 'BusinessGrowth'],
      tone: 'inspiring',
      targetAudience: 'Entrepreneurs, Startup Community',
      cta: 'Link in Bio ansehen',
      contentScore: { total: 92, readability: 91, hookStrength: 94, hashtagQuality: 90, ctaClarity: 93, platformFit: 92 },
      campaign: 'Customer Success Stories',
      media: {
        type: 'video',
        style: 'photo',
        prompt: 'Professional entrepreneur portrait, modern startup office, confident'
      }
    },
    {
      id: 'demo-post-5',
      date: getDateOffset(5, 10),
      time: '10:00',
      platform: 'linkedin',
      platforms: ['linkedin'],
      status: 'scheduled',
      title: '5 Red Flags beim Hiring',
      content: `Nach 50+ Interviews habe ich diese 5 Red Flags identifiziert:

🚩 Schlechte Vorbereitung
"Was macht eure Firma nochmal?" - Instant No.

🚩 Nur über Gehalt reden
Motivation sollte tiefer gehen.

🚩 Negative über Ex-Arbeitgeber
Professionalism matters.

🚩 Keine eigenen Fragen
Interesse zeigen ist key.

🚩 Unrealistische Erwartungen
"In 6 Monaten CEO?" - Hmm...

Was sind eure Hiring Red Flags?

#Hiring #Recruitment #HRTips #Leadership #TalentAcquisition #BusinessTips`,
      contentType: 'carousel',
      hashtags: ['Hiring', 'Recruitment', 'HRTips', 'Leadership', 'TalentAcquisition', 'BusinessTips'],
      tone: 'professional',
      targetAudience: 'HR Professionals, Team Leads, Founders',
      contentScore: { total: 74, readability: 77, hookStrength: 72, hashtagQuality: 70, ctaClarity: 75, platformFit: 76 },
      campaign: 'Business Best Practices'
    },
    {
      id: 'demo-post-6',
      date: getDateOffset(6, 20),
      time: '20:00',
      platform: 'instagram',
      platforms: ['instagram', 'facebook'],
      status: 'ai_suggestion',
      title: 'Weekend Vibes: Work-Life Balance',
      content: `Freitag Abend = Laptop zu! 💻➡️🌅

Work-Life Balance ist kein Luxus, es ist eine Notwendigkeit.

Meine Wochenend-Regeln:
✨ Keine Mails nach 18 Uhr
✨ Quality Time mit Familie
✨ Sport & Natur
✨ Kreative Hobbies
✨ Einfach mal NICHTS tun

Mental Health > Hustle Culture

Wie verbringt ihr euer perfektes Wochenende?

#WorkLifeBalance #MentalHealth #WeekendVibes #SelfCare #Wellness #HealthyLifestyle`,
      contentType: 'post',
      hashtags: ['WorkLifeBalance', 'MentalHealth', 'WeekendVibes', 'SelfCare', 'Wellness', 'HealthyLifestyle'],
      tone: 'casual',
      targetAudience: 'Working Professionals, Burnout Prevention',
      contentScore: { total: 80, readability: 82, hookStrength: 79, hashtagQuality: 78, ctaClarity: 80, platformFit: 81 },
      campaign: 'Lifestyle & Culture'
    },
    {
      id: 'demo-post-7',
      date: getDateOffset(7, 14),
      time: '14:00',
      platform: 'linkedin',
      platforms: ['linkedin'],
      status: 'planned',
      title: 'Datenbasierte Entscheidungen: Ein Framework',
      content: `"We need to be more data-driven!"

Jeder sagt es, aber wie macht man es richtig?

Mein 3-Schritte Framework:

📊 SCHRITT 1: Richtigen Metriken definieren
Nicht alles messen, was messbar ist. Sondern messen, was wichtig ist.

📈 SCHRITT 2: Context über Numbers
Eine 5% Conversion Rate kann gut oder schlecht sein - je nach Kontext.

🎯 SCHRITT 3: Action follows Insight
Daten ohne Handlung sind Verschwendung.

Bonus: Bauchgefühl + Daten = Magic ✨

Was sind eure Erfahrungen mit datenbasierten Entscheidungen?

#DataDriven #BusinessStrategy #Analytics #DecisionMaking #Leadership`,
      contentType: 'post',
      hashtags: ['DataDriven', 'BusinessStrategy', 'Analytics', 'DecisionMaking', 'Leadership', 'GrowthHacking'],
      tone: 'educational',
      targetAudience: 'Business Analysts, Executives, Product Managers',
      contentScore: { total: 77, readability: 79, hookStrength: 75, hashtagQuality: 76, ctaClarity: 78, platformFit: 77 },
      campaign: 'Educational Content Series'
    },
    {
      id: 'demo-post-8',
      date: getDateOffset(8, 11),
      time: '11:00',
      platform: 'facebook',
      platforms: ['facebook'],
      status: 'scheduled',
      title: 'Community Event: Live Q&A Session',
      content: `🎉 SAVE THE DATE! 🎉

Nächsten Donnerstag um 19 Uhr gehen wir LIVE!

Thema: "Social Media Strategie 2025 - Was wirklich funktioniert"

Unser Marketing-Team beantwortet ALLE eure Fragen live:
👉 Algorithmus-Hacks
👉 Content-Ideen
👉 Budget-Tipps
👉 Tool-Empfehlungen

💬 Schreibt jetzt schon eure Fragen in die Kommentare!

Wir freuen uns auf euch! 🙌

#LiveQA #SocialMediaTipps #CommunityFirst #Marketing2025`,
      contentType: 'post',
      hashtags: ['LiveQA', 'SocialMediaTipps', 'CommunityFirst', 'Marketing2025', 'FacebookLive'],
      tone: 'casual',
      targetAudience: 'Community Members, Small Business Owners',
      cta: 'Jetzt Fragen stellen',
      contentScore: { total: 84, readability: 83, hookStrength: 85, hashtagQuality: 84, ctaClarity: 86, platformFit: 82 },
      campaign: 'Community Engagement'
    },
    {
      id: 'demo-post-9',
      date: getDateOffset(9, 13),
      time: '13:00',
      platform: 'twitter',
      platforms: ['twitter'],
      status: 'draft',
      title: 'Quick Tipp: Engagement-Boost',
      content: `🧵 Thread: 7 Wege zu mehr Engagement (ohne Algo-Hacks)

1/ Stellt echte Fragen
Nicht "Wie findet ihr das?" sondern "Was war euer größter Social Media Fehler 2024?"

2/ Teilt unpopuläre Meinungen
Kontroverse ≠ Clickbait. Authentische Takes starten Diskussionen.

3/ Nutzt Storytelling
Menschen erinnern sich an Stories, nicht an Fakten.

4/ Antwortet IMMER
Jeder Kommentar verdient eine Antwort. Auch "Danke!" zählt.

5/ Postet zur richtigen Zeit
Analysiert eure Insights. Prime Time ≠ beste Zeit für euch.

6/ Weniger perfekt, mehr authentisch
Fehlerfreie Posts < Posts mit Persönlichkeit

7/ Habt Geduld
Community Building dauert. Konsistenz schlägt Virality.

Was würdet ihr ergänzen? 💭

#SocialMediaTips #Engagement #ContentStrategy #TwitterTips`,
      contentType: 'post',
      hashtags: ['SocialMediaTips', 'Engagement', 'ContentStrategy', 'TwitterTips', 'ThreadsUnrolled'],
      tone: 'educational',
      targetAudience: 'Content Creators, Social Media Managers',
      contentScore: { total: 89, readability: 87, hookStrength: 92, hashtagQuality: 88, ctaClarity: 88, platformFit: 90 },
      campaign: 'Educational Content Series'
    },
    {
      id: 'demo-post-10',
      date: getDateOffset(10, 17),
      time: '17:00',
      platform: 'facebook',
      platforms: ['facebook', 'instagram'],
      status: 'ai_suggestion',
      title: 'Gewinnspiel: Teilen & Gewinnen',
      content: `🎁 GEWINNSPIEL! 🎁

Wir verlosen 3x unseren Premium Social Media Kurs (Wert: je 299€)!

So einfach geht's:
1️⃣ Like diesen Post
2️⃣ Folge unserer Seite
3️⃣ Markiere 2 Freunde in den Kommentaren
4️⃣ Teile den Post in deiner Story (optional, Extra-Los!)

Was ihr lernt:
✨ Content-Strategie entwickeln
✨ KI-Tools effektiv nutzen
✨ Community aufbauen
✨ Reichweite organisch steigern

⏰ Teilnahme bis Sonntag, 23:59 Uhr
🍀 Gewinner werden am Montag bekannt gegeben

Viel Glück! 🚀

Teilnahmebedingungen: Link in Bio
#Gewinnspiel #SocialMediaKurs #Giveaway #Marketing #ContentCreator`,
      contentType: 'post',
      hashtags: ['Gewinnspiel', 'SocialMediaKurs', 'Giveaway', 'Marketing', 'ContentCreator', 'WinWin'],
      tone: 'casual',
      targetAudience: 'Aspiring Content Creators, Students',
      cta: 'Jetzt teilnehmen',
      contentScore: { total: 94, readability: 92, hookStrength: 96, hashtagQuality: 93, ctaClarity: 95, platformFit: 94 },
      campaign: 'Community Growth Campaign'
    }
  ];
};

export interface RewriteOption {
  id: string;
  label: string;
  description: string;
  icon: string;
}

export const rewriteOptions: RewriteOption[] = [
  {
    id: 'professional',
    label: 'Professionell',
    description: 'Formeller Ton für Business-Kontext',
    icon: '💼'
  },
  {
    id: 'casual',
    label: 'Locker',
    description: 'Freundlich und zugänglich',
    icon: '😊'
  },
  {
    id: 'engaging',
    label: 'Engaging',
    description: 'Mehr Interaktion und Emotion',
    icon: '🔥'
  },
  {
    id: 'concise',
    label: 'Prägnant',
    description: 'Kürzer und auf den Punkt',
    icon: '✂️'
  },
  {
    id: 'storytelling',
    label: 'Storytelling',
    description: 'Narrative und persönlicher',
    icon: '📖'
  }
];

export const simulateAIRewrite = async (
  content: string,
  tone: string,
  currentTone?: string
): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

  const rewriteVariations: Record<string, (text: string) => string> = {
    professional: (text) => {
      return text
        .replace(/!/g, '.')
        .replace(/😊|🚀|✨|💪|👀|🔥/g, '')
        .replace(/super|mega|krass/gi, 'signifikant')
        .replace(/cool|geil/gi, 'bemerkenswert')
        .split('\n')
        .map(line => {
          if (line.startsWith('•') || line.match(/^\d/)) return line;
          return line.charAt(0).toUpperCase() + line.slice(1);
        })
        .join('\n')
        .trim();
    },

    casual: (text) => {
      const casual = text
        .replace(/\. /g, '! ')
        .replace(/signifikant/gi, 'mega')
        .replace(/bemerkenswert/gi, 'cool');

      const emojis = ['😊', '🚀', '✨', '💡', '👍'];
      const lines = casual.split('\n');
      if (lines.length > 0 && !lines[0].match(/[😊🚀✨💡👍]/)) {
        lines[0] += ' ' + emojis[Math.floor(Math.random() * emojis.length)];
      }
      return lines.join('\n');
    },

    engaging: (text) => {
      const questions = [
        '\n\nWas sind eure Gedanken dazu?',
        '\n\nWie seht ihr das?',
        '\n\nHabt ihr ähnliche Erfahrungen gemacht?',
        '\n\nTeilt eure Meinung in den Kommentaren!'
      ];

      let engaging = text
        .replace(/\./g, '!')
        .replace(/Ich denke/g, '🤔 Ich denke')
        .replace(/wichtig/gi, '🎯 wichtig');

      if (!engaging.includes('?')) {
        engaging += questions[Math.floor(Math.random() * questions.length)];
      }

      return engaging;
    },

    concise: (text) => {
      return text
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => {
          if (line.length > 100) {
            const words = line.split(' ');
            return words.slice(0, Math.ceil(words.length * 0.7)).join(' ') + '...';
          }
          return line;
        })
        .slice(0, 5)
        .join('\n')
        .replace(/\.\.\./g, '.');
    },

    storytelling: (text) => {
      const storyStarters = [
        'Letzte Woche ist mir etwas aufgefallen: ',
        'Eine Geschichte, die ich teilen möchte: ',
        'Es begann mit einer einfachen Frage: ',
        'Stellt euch vor: '
      ];

      const starter = storyStarters[Math.floor(Math.random() * storyStarters.length)];

      return starter + text
        .replace(/^.{0,50}:?\s*/i, '')
        .replace(/\n\n/g, '\n\nUnd dann... ')
        .replace(/Fazit:|Ergebnis:/gi, 'Was ich gelernt habe:');
    }
  };

  const rewriter = rewriteVariations[tone] || ((t) => t);
  return rewriter(content);
};
