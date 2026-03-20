/**
 * Caption Block Extractor
 *
 * Extracts clearly identifiable post/caption blocks from AI chat responses.
 * Used for the Chat -> Content Planner handoff so only the actual caption
 * content is transferred, not surrounding explanation text.
 */

export interface CaptionBlock {
  /** Label for the block, e.g. "Vorschlag 1", "Instagram Post" */
  label: string;
  /** The caption/post body text */
  body: string;
  /** Extracted hashtags (without leading #) */
  hashtags: string[];
  /** CTA if explicitly labeled */
  cta: string;
  /** Platform hint if detected in heading */
  platformHint?: string;
  /** Start line index in the original message (for rendering) */
  startIndex: number;
  /** End line index in the original message */
  endIndex: number;
}

/**
 * Heading patterns that signal the start of a caption/post block.
 * Ordered by specificity — first match wins.
 */
const BLOCK_START_PATTERNS: Array<{ pattern: RegExp; labelExtract: (m: RegExpMatchArray) => string }> = [
  // ## Caption / ## Post / ## Beitrag / ## Post-Vorschlag
  {
    pattern: /^#{1,3}\s+(caption|post|beitrag|posting|post[- ]?vorschlag|post[- ]?text|vorschlag)\s*(\d+)?[:\s]*/i,
    labelExtract: (m) => {
      const num = m[2] ? ` ${m[2]}` : '';
      return `${capitalize(m[1])}${num}`;
    },
  },
  // ## Instagram Post / ## LinkedIn Caption etc.
  {
    pattern: /^#{1,3}\s+(instagram|linkedin|facebook|tiktok|twitter|x)\s*(post|caption|beitrag|text)?[:\s]*/i,
    labelExtract: (m) => `${capitalize(m[1])} ${capitalize(m[2] || 'Post')}`,
  },
  // **Caption:** / **Post:** / **Post-Text:** / **Vorschlag 1:**
  {
    pattern: /^\*\*(caption|post|beitrag|posting|post[- ]?text|vorschlag)\s*(\d+)?\s*:?\*\*/i,
    labelExtract: (m) => {
      const num = m[2] ? ` ${m[2]}` : '';
      return `${capitalize(m[1])}${num}`;
    },
  },
  // **Instagram Post:** / **LinkedIn Caption:**
  {
    pattern: /^\*\*(instagram|linkedin|facebook|tiktok|twitter|x)\s*(post|caption|beitrag|text)?\s*:?\*\*/i,
    labelExtract: (m) => `${capitalize(m[1])} ${capitalize(m[2] || 'Post')}`,
  },
  // Caption 1: / Post 1: / Vorschlag 1: (plain text heading)
  {
    pattern: /^(caption|post|beitrag|posting|vorschlag)\s*(\d+)\s*:/i,
    labelExtract: (m) => `${capitalize(m[1])} ${m[2]}`,
  },
  // [Instagram] / [LinkedIn] platform tags
  {
    pattern: /^\[(instagram|linkedin|facebook|tiktok|twitter|x)\]\s*/i,
    labelExtract: (m) => `${capitalize(m[1])} Post`,
  },
  // Natural-language intro lines used as pseudo-headings:
  // "Hier ist dein Post:" / "Hier ist eine Caption:" / "Hier ist ein LinkedIn-Post:"
  {
    pattern: /^(?:hier|klar[,.]?\s*hier)\s+(?:ist|kommt)\s+(?:dein[e]?|ein[e]?[rn]?|der|die|das)\s+(?:(?:instagram|linkedin|facebook|tiktok|twitter)[- ]?)?(caption|post|beitrag|posting|post[- ]?text|social[- ]?media[- ]?post)\s*[:.!]?\s*$/i,
    labelExtract: (m) => capitalize(m[1]),
  },
];

/**
 * Patterns that signal the end of a caption block (next section starts).
 */
const BLOCK_END_PATTERNS = [
  /^#{1,3}\s+/,                           // New heading
  /^\*\*[^*]+:\*\*/,                       // New bold label
  /^(caption|post|beitrag|vorschlag)\s*\d+\s*:/i,  // Next numbered block
  /^\[(instagram|linkedin|facebook|tiktok|twitter|x)\]/i,  // Platform tag
  /^---+$/,                                // Horizontal rule
  /^(tipps?|hinweis|erklärung|strategie|zusammenfassung|fazit|anmerkung)[:\s]/i, // Non-caption sections
];

const HASHTAG_LINE_PATTERN = /^(?:(?:\*\*)?hashtags?(?:\*\*)?[:\s]*)?(?:#\w+[\s,]*){2,}/i;
const CTA_LINE_PATTERN = /^(?:\*\*)?(?:call[- ]to[- ]action|cta)[:\s]*\*?\*?\s*(.+)/i;

const PLATFORM_KEYWORDS: Record<string, string> = {
  instagram: 'instagram',
  linkedin: 'linkedin',
  facebook: 'facebook',
  tiktok: 'tiktok',
  twitter: 'twitter',
  x: 'twitter',
};

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function detectPlatform(label: string): string | undefined {
  const lower = label.toLowerCase();
  for (const [keyword, platform] of Object.entries(PLATFORM_KEYWORDS)) {
    if (lower.includes(keyword)) return platform;
  }
  return undefined;
}

function extractHashtags(text: string): string[] {
  const matches = text.match(/#(\w+)/g);
  if (!matches) return [];
  return matches.map(h => h.replace(/^#/, ''));
}

function isHashtagLine(line: string): boolean {
  return HASHTAG_LINE_PATTERN.test(line.trim());
}

function isBlockEndLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;

  for (const pattern of BLOCK_END_PATTERNS) {
    if (pattern.test(trimmed)) return true;
  }
  return false;
}

/**
 * Main extraction function.
 * Returns an array of caption blocks found in the message.
 * Returns empty array if no clear blocks are detected.
 */
export function extractCaptionBlocks(message: string): CaptionBlock[] {
  if (!message || message.trim().length === 0) return [];

  const lines = message.split('\n');
  const blocks: CaptionBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    let matched = false;

    for (const { pattern, labelExtract } of BLOCK_START_PATTERNS) {
      const match = line.match(pattern);
      if (match) {
        const label = labelExtract(match);
        const platformHint = detectPlatform(line); // check full line for platform hints
        const startIndex = i;

        // Content after the heading on the same line
        const headingRemainder = line.replace(pattern, '').trim();
        const bodyLines: string[] = [];
        if (headingRemainder) bodyLines.push(headingRemainder);

        let hashtags: string[] = [];
        let cta = '';

        // Collect lines until next block start or end of message
        i++;
        while (i < lines.length) {
          const nextLine = lines[i].trim();

          // Check if this is a new block start
          let isNewBlock = false;
          for (const { pattern: p } of BLOCK_START_PATTERNS) {
            if (p.test(nextLine)) {
              isNewBlock = true;
              break;
            }
          }
          if (isNewBlock) break;

          // Extract hashtags from hashtag lines (check before block-end,
          // because **Hashtags:** matches the generic bold-label end pattern)
          if (isHashtagLine(nextLine)) {
            hashtags = [...hashtags, ...extractHashtags(nextLine)];
            i++;
            continue;
          }

          // Extract CTA (check before block-end, because **CTA:** matches
          // the generic bold-label end pattern)
          const ctaMatch = nextLine.match(CTA_LINE_PATTERN);
          if (ctaMatch) {
            cta = ctaMatch[1].trim();
            i++;
            continue;
          }

          // Check for generic end patterns (new heading, separator, etc.)
          if (isBlockEndLine(nextLine)) break;

          bodyLines.push(lines[i]); // Preserve original whitespace
          i++;
        }

        // Clean up body: trim empty lines from start/end
        while (bodyLines.length > 0 && !bodyLines[0].trim()) bodyLines.shift();
        while (bodyLines.length > 0 && !bodyLines[bodyLines.length - 1].trim()) bodyLines.pop();

        const body = bodyLines.join('\n').trim();

        // Only add if there's meaningful content (at least 40 chars to avoid fragments)
        if (body.length >= 40) {
          // Also extract inline hashtags from body if no dedicated hashtag line found
          if (hashtags.length === 0) {
            // Check last line of body for hashtags
            const lastBodyLine = bodyLines[bodyLines.length - 1]?.trim() || '';
            if (isHashtagLine(lastBodyLine)) {
              hashtags = extractHashtags(lastBodyLine);
              // Remove hashtag line from body
              bodyLines.pop();
              const cleanBody = bodyLines.join('\n').trim();
              blocks.push({
                label,
                body: cleanBody || body,
                hashtags,
                cta,
                platformHint,
                startIndex,
                endIndex: i - 1,
              });
            } else {
              blocks.push({ label, body, hashtags, cta, platformHint, startIndex, endIndex: i - 1 });
            }
          } else {
            blocks.push({ label, body, hashtags, cta, platformHint, startIndex, endIndex: i - 1 });
          }
        }

        matched = true;
        break;
      }
    }

    if (!matched) i++;
  }

  return blocks;
}

// ── Single-caption detection (fallback for plain unstructured responses) ──

/**
 * Patterns in the prior user message that signal explicit caption/post intent.
 */
const USER_CAPTION_INTENT_PATTERNS = [
  /schreib(e|t)?\s*(mir\s+)?(nur\s+)?(eine?n?|1)\s*(caption|post|beitrag|posting)/i,
  /nur\s*(eine?n?|1|den|die)?\s*(caption|post|beitrag|posting)/i,
  /erstell(e|t)?\s*(mir\s+)?(eine?n?|1)\s*(caption|post|beitrag)/i,
  /gib\s*(mir\s+)?(eine?n?|1)\s*(caption|post|beitrag)/i,
  /caption\s*(für|zu|über)/i,
  /post[- ]?text\s*(für|zu|über)/i,
  /formulier(e|t)?\s*(mir\s+)?(eine?n?)?\s*(caption|post|beitrag)/i,
  /mach\s*(mir\s+)?(eine?n?)?\s*(caption|post|beitrag)/i,
  // Broader: platform-specific requests
  /(instagram|linkedin|facebook|tiktok|twitter)[- ]?(post|caption|beitrag|posting)/i,
  /post\s+(für|auf|zu)\s+(instagram|linkedin|facebook|tiktok|twitter)/i,
  /social[- ]?media[- ]?(post|beitrag|caption|content)/i,
  // Generic post/caption requests without article
  /schreib(e|t)?\s*(mir\s+)?(eine?n?\s+)?(caption|post[- ]?text)/i,
  /kannst du\s*(mir\s+)?(eine?n?\s+)?(caption|post|beitrag)\s*(schreiben|erstellen|machen|formulieren)/i,
];

/**
 * Patterns that match intro/preamble lines the AI puts before the actual caption.
 * These should be stripped from the body.
 */
const INTRO_LINE_PATTERNS = [
  /^(?:klar[,.]?\s*)?hier\s+(?:ist|kommt)\s+(?:dein[e]?|ein[e]?[rn]?|der|die|das)\s+/i,
  /^(?:natürlich|gerne|selbstverständlich|na klar)[!,.]?\s*(?:hier|so)\s/i,
  /^(?:natürlich|gerne|selbstverständlich|na klar)[!,.]\s*$/i,
  /^(?:so könnte|hier wäre)\s+(?:dein[e]?|ein[e]?[rn]?)\s+/i,
  /^(?:ich habe|ich hab)\s+(?:dir\s+)?(?:eine?n?\s+)?(caption|post|beitrag|posting)\s+/i,
];

/**
 * Patterns in the assistant message that indicate analysis/explanation, not a caption.
 */
const EXPLANATION_INDICATORS = [
  /^#{1,3}\s+/m,                                       // any markdown heading
  /hier\s+(?:sind|ist)\s+(?:eine?\s+)?(?:zusammenfassung|analyse|übersicht|strategie)/i,
  /hier\s+sind\s+(?:einige|ein\s+paar|verschiedene|mehrere)\s+/i,
  /folgende\s+(?:tipps|empfehlungen|punkte|schritte|aspekte|faktoren)/i,
  /lass\s+mich.*erklären/i,
  /zusammenfassend/i,
  /\d+\.\s+\*\*/m,                                     // numbered bold items (listicle)
  /(?:beachte|bedenke|berücksichtige)\s+(?:dabei|folgendes|bitte)/i,
  /wichtig(?:e|\s+ist)\s+(?:dabei|hier|zu\s+beachten)/i,
];

/**
 * Strips leading intro/preamble lines from a message.
 * Returns the message without intro lines and any detected platform hint.
 */
function stripIntroLines(lines: string[]): { bodyLines: string[]; platformHint?: string } {
  let startIdx = 0;
  let platformHint: string | undefined;

  // Strip up to 2 leading intro lines
  for (let i = 0; i < Math.min(lines.length, 2); i++) {
    const line = lines[i].trim();
    if (!line) { startIdx = i + 1; continue; } // skip empty leading lines

    let isIntro = false;
    for (const pattern of INTRO_LINE_PATTERNS) {
      if (pattern.test(line)) { isIntro = true; break; }
    }
    // Also treat lines ending with ":" that mention post/caption keywords as intros
    if (!isIntro && /(?:caption|post|beitrag|posting|vorschlag|entwurf)[:\s]*$/i.test(line) && line.length < 120) {
      isIntro = true;
    }

    if (isIntro) {
      // Try to extract platform hint from the intro line
      if (!platformHint) platformHint = detectPlatform(line);
      startIdx = i + 1;
    } else {
      break; // Stop at first non-intro line
    }
  }

  // Skip empty lines after intro
  while (startIdx < lines.length && !lines[startIdx].trim()) startIdx++;

  return { bodyLines: lines.slice(startIdx), platformHint };
}

/**
 * Detects a single plain-text caption when no structured blocks were found.
 * Returns one CaptionBlock or null. Conservative — rejects anything ambiguous.
 */
export function detectSingleCaption(
  message: string,
  previousUserMessage?: string,
): CaptionBlock | null {
  if (!message || message.trim().length === 0) return null;

  const trimmed = message.trim();

  // Hard length limits: too short = fragment, too long = probably not a caption
  if (trimmed.length < 40 || trimmed.length > 2000) return null;

  // Reject if message contains markdown headings
  if (/^#{1,3}\s+/m.test(trimmed)) return null;

  // Reject if message has 3+ bullet or numbered list items (analysis/tips)
  const bulletCount = (trimmed.match(/^[\s]*[-*]\s+/gm) || []).length;
  const numberedCount = (trimmed.match(/^[\s]*\d+[.)]\s+/gm) || []).length;
  if (bulletCount >= 3 || numberedCount >= 3) return null;

  // Reject if message contains explanation indicators
  for (const pattern of EXPLANATION_INDICATORS) {
    if (pattern.test(trimmed)) return null;
  }

  // Reject if message has 3+ question marks (Q&A style)
  if ((trimmed.match(/\?/g) || []).length >= 3) return null;

  // ── Strip intro lines ──
  const allLines = trimmed.split('\n');
  const { bodyLines: strippedLines, platformHint: introPlatform } = stripIntroLines(allLines);

  // ── Scoring ──
  let score = 0;

  // Signal: prior user message explicitly asked for a caption
  const userAskedForCaption = previousUserMessage
    ? USER_CAPTION_INTENT_PATTERNS.some(p => p.test(previousUserMessage))
    : false;
  if (userAskedForCaption) score += 3;

  // Signal: intro line was stripped (AI explicitly said "here is your post")
  if (strippedLines.length < allLines.length) score += 2;

  // Signal: message has trailing hashtags (strong caption indicator)
  const nonEmptyLines = strippedLines.filter(l => l.trim());
  const lastNonEmptyLines = nonEmptyLines.slice(-3);
  const hasTrailingHashtags = lastNonEmptyLines.some(l => isHashtagLine(l));
  if (hasTrailingHashtags) score += 2;

  // Signal: message has inline hashtags anywhere
  const strippedText = strippedLines.join('\n');
  const hashtagCount = (strippedText.match(/#\w+/g) || []).length;
  if (hashtagCount >= 1) score += 1;

  // Signal: message has emojis (common in social captions)
  const emojiPattern = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{200D}\u{FE0F}]/u;
  if (emojiPattern.test(strippedText)) score += 1;

  // Signal: relatively compact — few paragraphs for its length
  const paragraphs = strippedText.split(/\n\s*\n/).filter(p => p.trim());
  if (paragraphs.length <= 3) score += 1;

  // Signal: short and coherent (under 600 chars after stripping = very likely a caption)
  if (strippedText.trim().length <= 600) score += 1;

  // Require at least one caption-specific signal (not just generic compactness)
  const hasCaptionSignal = userAskedForCaption ||
    hasTrailingHashtags ||
    hashtagCount >= 1 ||
    strippedLines.length < allLines.length; // intro was stripped

  // Threshold: need at least 2 points AND at least one caption-specific signal
  if (score < 2 || !hasCaptionSignal) return null;

  // ── Build the caption block ──
  // Separate trailing hashtag lines from body
  const bodyLines: string[] = [];
  let hashtags: string[] = [];

  for (let li = 0; li < strippedLines.length; li++) {
    const line = strippedLines[li];
    // Check if this and all remaining non-empty lines are hashtags
    const remainingLines = strippedLines.slice(li);
    const remainingNonEmpty = remainingLines.filter(l => l.trim());
    const allRemainingAreHashtagsOrEmpty = remainingNonEmpty.length > 0 &&
      remainingNonEmpty.every(l => isHashtagLine(l));

    if (allRemainingAreHashtagsOrEmpty && isHashtagLine(line.trim())) {
      for (const hl of remainingLines) {
        if (hl.trim() && isHashtagLine(hl.trim())) {
          hashtags = [...hashtags, ...extractHashtags(hl)];
        }
      }
      break;
    }
    bodyLines.push(line);
  }

  // Clean body
  while (bodyLines.length > 0 && !bodyLines[0].trim()) bodyLines.shift();
  while (bodyLines.length > 0 && !bodyLines[bodyLines.length - 1].trim()) bodyLines.pop();
  const body = bodyLines.join('\n').trim();

  if (body.length < 40) return null;

  return {
    label: 'Caption',
    body,
    hashtags,
    cta: '',
    platformHint: introPlatform,
    startIndex: 0,
    endIndex: allLines.length - 1,
  };
}

/**
 * Creates a ContentSlot-compatible object from a CaptionBlock.
 * Used to prefill the new composer popup.
 */
export function captionBlockToSlotData(block: CaptionBlock): {
  body: string;
  content: string;
  hashtags: string[];
  cta: string;
  platform: 'instagram' | 'linkedin' | 'tiktok' | 'facebook' | 'twitter';
} {
  const platform = (block.platformHint as any) || 'instagram';
  return {
    body: block.body,
    content: block.body,
    hashtags: block.hashtags,
    cta: block.cta,
    platform,
  };
}
