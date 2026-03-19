export type MessageClassification = 'SOCIAL_MEDIA_POST' | 'GENERAL_QUESTION';

export interface ClassificationResult {
  type: MessageClassification;
  confidence: number;
  reasoning: string;
  suggestedActions: string[];
}

const SOCIAL_MEDIA_INDICATORS = {
  contentPatterns: [
    /hier ist (dein|ihr|euer) (post|caption|beitrag|content)/i,
    /hier sind (deine|ihre|eure) (posts|captions|beiträge)/i,
    /post für (instagram|facebook|linkedin|twitter|tiktok|x)/i,
    /caption für/i,
    /beitrag für/i,
    /social[- ]?media[- ]?post/i,
    /content[- ]?vorschlag/i,
    /posting[- ]?idee/i,
  ],

  structuralPatterns: [
    /#\w+/,
    /@\w+/,
    /\*\*[^*]+\*\*/,
    /📱|📸|🎯|💡|✨|🚀|💪|🔥|❤️|👉|📣|🎉/,
    /\n{2,}/,
    /^(post|caption|beitrag)\s*\d*:/im,
    /\[(instagram|facebook|linkedin|twitter|tiktok)\]/i,
  ],

  contentKeywords: [
    'caption', 'post', 'beitrag', 'posting', 'content',
    'hashtag', 'story', 'reel', 'feed', 'bio',
    'call-to-action', 'cta', 'engagement',
    'veröffentlichen', 'posten', 'teilen',
  ],

  platformMentions: [
    'instagram', 'facebook', 'linkedin', 'twitter', 'tiktok',
    'youtube', 'pinterest', 'threads', 'x.com',
  ],
};

const QUESTION_INDICATORS = {
  questionPatterns: [
    /^(was|wie|wann|warum|wo|wer|welche|können|kannst|könntest|würdest|ist es|gibt es|hast du)\s/i,
    /\?$/,
    /erkläre?( mir)?/i,
    /was bedeutet/i,
    /was ist der unterschied/i,
    /wie funktioniert/i,
    /kannst du mir (sagen|erklären|helfen)/i,
    /ich (verstehe|weiß) nicht/i,
    /hilf mir (zu verstehen|dabei)/i,
  ],

  informationalKeywords: [
    'algorithmus', 'strategie', 'tipps', 'best practices',
    'empfehlung', 'rat', 'analyse', 'statistik',
    'bedeutung', 'definition', 'unterschied', 'vergleich',
    'optimieren', 'verbessern', 'lernen', 'verstehen',
  ],

  metaDiscussionPatterns: [
    /wie (oft|viel|lange) sollte/i,
    /wann ist die beste zeit/i,
    /was sind die (besten|wichtigsten)/i,
    /welche (strategie|methode|technik)/i,
    /warum (funktioniert|ist)/i,
  ],
};

export const classifyMessage = (message: string): ClassificationResult => {
  if (!message || message.trim().length === 0) {
    return {
      type: 'GENERAL_QUESTION',
      confidence: 1,
      reasoning: 'Empty message',
      suggestedActions: [],
    };
  }

  let socialMediaScore = 0;
  let questionScore = 0;
  const reasons: string[] = [];

  SOCIAL_MEDIA_INDICATORS.contentPatterns.forEach(pattern => {
    if (pattern.test(message)) {
      socialMediaScore += 3;
      reasons.push('Content-Formulierung erkannt');
    }
  });

  SOCIAL_MEDIA_INDICATORS.structuralPatterns.forEach(pattern => {
    const matches = message.match(pattern);
    if (matches) {
      socialMediaScore += matches.length > 2 ? 2 : 1;
      reasons.push('Social-Media-Struktur erkannt');
    }
  });

  const lowerMessage = message.toLowerCase();

  SOCIAL_MEDIA_INDICATORS.contentKeywords.forEach(keyword => {
    if (lowerMessage.includes(keyword)) {
      socialMediaScore += 0.5;
    }
  });

  SOCIAL_MEDIA_INDICATORS.platformMentions.forEach(platform => {
    if (lowerMessage.includes(platform)) {
      socialMediaScore += 0.5;
    }
  });

  QUESTION_INDICATORS.questionPatterns.forEach(pattern => {
    if (pattern.test(message)) {
      questionScore += 2;
      reasons.push('Frageformulierung erkannt');
    }
  });

  QUESTION_INDICATORS.informationalKeywords.forEach(keyword => {
    if (lowerMessage.includes(keyword)) {
      questionScore += 0.5;
    }
  });

  QUESTION_INDICATORS.metaDiscussionPatterns.forEach(pattern => {
    if (pattern.test(message)) {
      questionScore += 2;
      reasons.push('Meta-Diskussion erkannt');
    }
  });

  const hashtagCount = (message.match(/#\w+/g) || []).length;
  if (hashtagCount >= 3) {
    socialMediaScore += 3;
    reasons.push(`${hashtagCount} Hashtags erkannt`);
  }

  const lines = message.split('\n').filter(l => l.trim().length > 0);
  if (lines.length >= 3 && message.length > 150) {
    socialMediaScore += 1;
    reasons.push('Mehrzeiliger Content');
  }

  if (message.length < 50 && message.includes('?')) {
    questionScore += 2;
    reasons.push('Kurze Frage');
  }

  if (message.length > 200 && !message.includes('?')) {
    socialMediaScore += 1;
    reasons.push('Langer Content ohne Frage');
  }

  const totalScore = socialMediaScore + questionScore;
  const isSocialMedia = socialMediaScore > questionScore;
  const confidence = totalScore > 0
    ? Math.min(0.95, (Math.abs(socialMediaScore - questionScore) / totalScore) + 0.5)
    : 0.5;

  const uniqueReasons = [...new Set(reasons)];

  return {
    type: isSocialMedia ? 'SOCIAL_MEDIA_POST' : 'GENERAL_QUESTION',
    confidence,
    reasoning: uniqueReasons.length > 0
      ? uniqueReasons.slice(0, 3).join(', ')
      : (isSocialMedia ? 'Content-Merkmale erkannt' : 'Informationsanfrage'),
    suggestedActions: isSocialMedia
      ? ['add_to_plan', 'generate_image', 'schedule', 'edit']
      : ['follow_up', 'clarify'],
  };
};

export const isSocialMediaContent = (message: string): boolean => {
  return classifyMessage(message).type === 'SOCIAL_MEDIA_POST';
};

export const shouldShowContentActions = (message: string): boolean => {
  const result = classifyMessage(message);
  return result.type === 'SOCIAL_MEDIA_POST' && result.confidence >= 0.5;
};
