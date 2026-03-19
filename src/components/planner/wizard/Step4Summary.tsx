import React, { useMemo, useState } from 'react';
import { Image, Zap, Sparkles, Clock, Info, ChevronRight, Gem, Smartphone } from 'lucide-react';
import { PulseWizardData } from './types';
import SocialIcon, { getPlatformLabel } from '../../ui/SocialIcon';
import { calculateFormatPreview, ContentFormat, StoryFormat, anyPlatformSupportsStories, platformSupportsStories } from '../../../utils/formatMix';

interface Step4Props {
  data: PulseWizardData;
  onUpdate: (data: Partial<PulseWizardData>) => void;
  onJumpToStep: (step: number) => void;
}

const themeLabels: Record<string, string> = {
  product: 'Produkt / Service',
  event: 'Event / Aktion',
  knowledge: 'Branchenwissen',
  behind_the_scenes: 'Behind the Scenes',
  customer_success: 'Kundenerfolg',
  seasonal: 'Saisonales / Aktuelles'
};

const goalLabels: Record<string, string> = {
  reach: 'Reichweite',
  engagement: 'Engagement',
  leads: 'Leads & Verkäufe',
  brand_awareness: 'Markenbekanntheit'
};

const toneLabels: Record<string, string> = {
  professional: 'Professionell',
  casual: 'Locker',
  inspirational: 'Inspirierend',
  humorous: 'Humorvoll'
};

function formatDate(d: Date): string {
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const FORMAT_CONFIG: Record<ContentFormat, { icon: string; label: string; sublabel?: string; bg: string; border: string; text: string }> = {
  carousel: {
    icon: '🎠',
    label: 'Carousel',
    sublabel: '5 Slides',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    text: 'text-sky-700',
  },
  single_image: {
    icon: '🖼️',
    label: 'Einzelbild',
    bg: 'bg-[#F4FCFE]',
    border: 'border-[rgba(73,183,227,0.18)]',
    text: 'text-[#7A7A7A]',
  },
  text_only: {
    icon: '📝',
    label: 'Text Only',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-600',
  },
};

const STORY_FORMAT_CONFIG: Record<StoryFormat, { icon: string; label: string; sublabel: string; bg: string; border: string; text: string; subtext: string }> = {
  story_teaser: {
    icon: '📱',
    label: 'Teaser',
    sublabel: 'Story',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    subtext: 'text-amber-500',
  },
  story_standalone: {
    icon: '📱',
    label: 'Story',
    sublabel: 'Standalone',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    text: 'text-pink-700',
    subtext: 'text-pink-500',
  },
};

function FormatTile({ format }: { format: ContentFormat }) {
  const cfg = FORMAT_CONFIG[format];
  return (
    <div
      className={`flex flex-col items-center justify-center gap-1 px-3 py-2.5 rounded-[var(--vektrus-radius-sm)] border ${cfg.bg} ${cfg.border}`}
      style={{ minWidth: 76, minHeight: 64 }}
    >
      <span className="text-lg leading-none">{cfg.icon}</span>
      <span className={`text-xs font-medium ${cfg.text} leading-tight text-center`}>{cfg.label}</span>
      {cfg.sublabel && (
        <span className="text-[10px] text-sky-500 leading-none">{cfg.sublabel}</span>
      )}
    </div>
  );
}

function StoryTile({ format }: { format: StoryFormat }) {
  const cfg = STORY_FORMAT_CONFIG[format];
  return (
    <div
      className={`flex flex-col items-center justify-center gap-1 px-3 py-2.5 rounded-[var(--vektrus-radius-sm)] border ${cfg.bg} ${cfg.border}`}
      style={{ minWidth: 76, minHeight: 64 }}
    >
      <span className="text-lg leading-none">{cfg.icon}</span>
      <span className={`text-xs font-medium ${cfg.text} leading-tight text-center`}>{cfg.label}</span>
      <span className={`text-[10px] ${cfg.subtext} leading-none`}>{cfg.sublabel}</span>
    </div>
  );
}

const Step4Summary: React.FC<Step4Props> = ({ data, onUpdate, onJumpToStep }) => {
  const { imageGeneration } = data;
  const [showTooltip, setShowTooltip] = useState(false);

  const storiesEnabled = data.storiesEnabled ?? false;

  const days = useMemo(() => {
    const startDay = new Date(data.timeframe.startDate.getFullYear(), data.timeframe.startDate.getMonth(), data.timeframe.startDate.getDate());
    const endDay = new Date(data.timeframe.endDate.getFullYear(), data.timeframe.endDate.getMonth(), data.timeframe.endDate.getDate());
    return Math.max(1, Math.round((endDay.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  }, [data.timeframe]);

  const weeks = Math.max(1, Math.round(days / 7));
  const totalFeedPosts = weeks * data.frequency * data.platforms.length;

  const formatPreview = useMemo(() => {
    if (data.platforms.length === 0) return [];
    return calculateFormatPreview(data.platforms, data.frequency, weeks, storiesEnabled);
  }, [data.platforms, data.frequency, weeks, storiesEnabled]);

  const globalSummary = useMemo(() => {
    const acc = { carousel: 0, single_image: 0, text_only: 0, story_teaser: 0, story_standalone: 0, total_feed: 0, total_stories: 0, total: 0 };
    for (const fp of formatPreview) {
      acc.carousel += fp.summary.carousel;
      acc.single_image += fp.summary.single_image;
      acc.text_only += fp.summary.text_only;
      acc.story_teaser += fp.summary.story_teaser;
      acc.story_standalone += fp.summary.story_standalone;
      acc.total_feed += fp.summary.total_feed;
      acc.total_stories += fp.summary.total_stories;
      acc.total += fp.summary.total;
    }
    return acc;
  }, [formatPreview]);

  const showStoriesToggle = anyPlatformSupportsStories(data.platforms);

  const carouselPlatforms = ['instagram', 'linkedin', 'facebook'];
  const hasCarouselsInMix = data.frequency >= 3 && data.platforms.some(p => carouselPlatforms.includes(p));
  const showPremiumCarouselHint = imageGeneration.enabled && imageGeneration.quality === 'premium' && hasCarouselsInMix;

  const estimatedTime = imageGeneration.enabled
    ? Math.ceil((imageGeneration.quality === 'premium' ? totalFeedPosts * 45 : totalFeedPosts * 25) / 60)
    : Math.ceil(totalFeedPosts * 15 / 60);

  const summaryRows: Array<{ label: string; value: string; step: number; platforms?: string[] }> = [
    { label: 'Thema', value: themeLabels[data.theme] || data.theme, step: 0 },
    ...(data.topicDescription
      ? [{ label: 'Anlass', value: data.topicDescription.length > 60 ? data.topicDescription.slice(0, 60) + '...' : data.topicDescription, step: 0 }]
      : []),
    { label: 'Plattformen', value: '', step: 1, platforms: data.platforms },
    { label: 'Häufigkeit', value: `${data.frequency} Posts / Woche`, step: 1 },
    { label: 'Zeitraum', value: `${formatDate(data.timeframe.startDate)} - ${formatDate(data.timeframe.endDate)}`, step: 1 },
    { label: 'Ziel', value: goalLabels[data.goal] || data.goal, step: 2 },
    { label: 'Stil', value: toneLabels[data.tone] || data.tone, step: 2 }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-[#111111] mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Zusammenfassung
        </h3>
        <p className="text-[#7A7A7A] leading-relaxed">
          Prüfe deine Einstellungen und starte die Generierung.
        </p>
      </div>

      <div className="bg-white rounded-[var(--vektrus-radius-lg)] border-2 border-[rgba(73,183,227,0.18)] divide-y divide-[rgba(73,183,227,0.10)] overflow-hidden">
        {summaryRows.map((row, i) => (
          <button
            key={i}
            onClick={() => onJumpToStep(row.step)}
            className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-[#F4FCFE] transition-colors text-left group"
          >
            <span className="text-sm text-[#7A7A7A] w-28 flex-shrink-0">{row.label}</span>
            {row.platforms ? (
              <div className="flex items-center flex-wrap gap-1.5 flex-1">
                {row.platforms.map(p => (
                  <div key={p} className="flex items-center space-x-1 bg-[#F4FCFE] border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-sm)] px-2 py-0.5">
                    <SocialIcon platform={p} size={14} />
                    <span className="text-xs font-medium text-[#111111]">{getPlatformLabel(p)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-sm font-medium text-[#111111] flex-1 truncate">{row.value}</span>
            )}
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#49B7E3] transition-colors flex-shrink-0 ml-2" />
          </button>
        ))}
        <div className="px-5 py-3.5 bg-[#F4FCFE]">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#111111]">Gesamt</span>
            <span className="text-sm font-bold text-[#49B7E3]">
              {globalSummary.total > totalFeedPosts
                ? `${globalSummary.total_feed} Feed-Posts + ${globalSummary.total_stories} Stories`
                : `${totalFeedPosts} Posts werden generiert`}
            </span>
          </div>
        </div>
      </div>

      {/* Stories Toggle */}
      {showStoriesToggle && (
        <div
          className={`rounded-[var(--vektrus-radius-md)] p-4 border transition-colors ${
            storiesEnabled ? 'bg-sky-50 border-sky-200' : 'bg-[#F4FCFE] border-[rgba(73,183,227,0.18)]'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-[var(--vektrus-radius-md)] flex items-center justify-center flex-shrink-0 mt-0.5 ${
                storiesEnabled ? 'bg-[#49B7E3]' : 'bg-[#B6EBF7]/20'
              }`}>
                <Smartphone className={`w-4 h-4 ${storiesEnabled ? 'text-white' : 'text-gray-400'}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#111111]">Stories mitgenerieren</p>
                <p className="text-xs text-[#7A7A7A] leading-relaxed mt-0.5">
                  Zusätzlich zu deinen Feed-Posts werden automatisch
                  Instagram &amp; Facebook Stories erstellt.
                  Stories verschwinden nach 24 Stunden.
                </p>
              </div>
            </div>
            <button
              onClick={() => onUpdate({ storiesEnabled: !storiesEnabled })}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0 mt-1 ${
                storiesEnabled ? 'bg-[#49B7E3]' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${
                storiesEnabled ? 'left-6' : 'left-0.5'
              }`} />
            </button>
          </div>
        </div>
      )}

      {/* Format Preview */}
      {formatPreview.length > 0 && (
        <div className="bg-white rounded-[var(--vektrus-radius-lg)] border-2 border-[rgba(73,183,227,0.18)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[rgba(73,183,227,0.10)]">
            <span className="text-sm font-semibold text-[#111111]">Dein Content-Plan</span>
            <div className="relative">
              <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(v => !v)}
                className="w-5 h-5 rounded-full bg-[#F4FCFE] hover:bg-[#F4FCFE] text-[#7A7A7A] flex items-center justify-center transition-colors"
              >
                <Info className="w-3 h-3" />
              </button>
              {showTooltip && (
                <div className="absolute right-0 top-7 w-64 bg-gray-900 text-white text-xs rounded-[var(--vektrus-radius-md)] px-3 py-2.5 z-10 shadow-lg leading-relaxed">
                  Vektrus wählt automatisch den optimalen Format-Mix für maximale Reichweite. Carousels erzielen bis zu 1,4× mehr Reichweite als Einzelbilder.
                </div>
              )}
            </div>
          </div>

          <div className="px-5 py-4 space-y-5">
            {formatPreview.map((fp) => {
              const hasStories = fp.summary.total_stories > 0;
              const supportsStories = platformSupportsStories(fp.platform);
              return (
                <div key={fp.platform}>
                  {formatPreview.length > 1 && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <SocialIcon platform={fp.platform} size={16} />
                      <span className="text-xs font-semibold text-[#111111]">{fp.platformLabel}</span>
                      {storiesEnabled && !supportsStories && (
                        <span className="text-[10px] text-gray-400">(keine Stories)</span>
                      )}
                    </div>
                  )}

                  {/* Feed tiles */}
                  {fp.summary.total_feed > 0 && (
                    <>
                      {hasStories && (
                        <p className="text-[10px] text-[#7A7A7A] font-semibold uppercase tracking-wide mb-1.5">Feed-Posts</p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {fp.weeklyMix.map((fmt, i) => (
                          <FormatTile key={i} format={fmt} />
                        ))}
                      </div>
                    </>
                  )}

                  {/* Story tiles */}
                  {hasStories && fp.weeklyStoryMix.length > 0 && (
                    <>
                      <p className="text-[10px] text-[#7A7A7A] font-semibold uppercase tracking-wide mt-3 mb-1.5">Stories</p>
                      <div className="flex flex-wrap gap-2">
                        {fp.weeklyStoryMix.map((s, i) => (
                          <StoryTile key={i} format={s.type} />
                        ))}
                      </div>
                    </>
                  )}

                  {weeks > 1 && (
                    <div className="mt-1.5 text-[11px] text-[#7A7A7A]">
                      × {weeks} Wochen = <span className="font-semibold text-[#111111]">
                        {hasStories
                          ? `${fp.summary.total_feed} Feed-Posts + ${fp.summary.total_stories} Stories`
                          : `${fp.summary.total_feed} Posts`}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Global summary when multiple platforms */}
            {formatPreview.length > 1 && (
              <div className="pt-2 border-t border-[rgba(73,183,227,0.10)] text-xs text-[#7A7A7A]">
                {globalSummary.total_stories > 0 ? (
                  <>
                    Gesamt: <span className="font-semibold text-[#111111]">{globalSummary.total} Posts</span>
                    {' '}
                    <span className="text-gray-400">({globalSummary.total_feed} Feed-Posts + {globalSummary.total_stories} Stories)</span>
                    {' · '}
                    {[
                      globalSummary.carousel > 0 && `${globalSummary.carousel}× Carousel`,
                      globalSummary.single_image > 0 && `${globalSummary.single_image}× Einzelbild`,
                      globalSummary.text_only > 0 && `${globalSummary.text_only}× Text Only`,
                      globalSummary.story_teaser > 0 && `${globalSummary.story_teaser}× Story Teaser`,
                      globalSummary.story_standalone > 0 && `${globalSummary.story_standalone}× Story Standalone`,
                    ].filter(Boolean).join(' · ')}
                  </>
                ) : (
                  <>
                    Gesamt: <span className="font-semibold text-[#111111]">{globalSummary.total} Posts</span>
                    {' · '}
                    {[
                      globalSummary.carousel > 0 && `${globalSummary.carousel}× Carousel`,
                      globalSummary.single_image > 0 && `${globalSummary.single_image}× Einzelbild`,
                      globalSummary.text_only > 0 && `${globalSummary.text_only}× Text Only`,
                    ].filter(Boolean).join(' · ')}
                  </>
                )}
              </div>
            )}
            {formatPreview.length === 1 && globalSummary.total > data.frequency && (
              <div className="pt-1 text-xs text-[#7A7A7A]">
                {[
                  globalSummary.carousel > 0 && `${globalSummary.carousel}× Carousel`,
                  globalSummary.single_image > 0 && `${globalSummary.single_image}× Einzelbild`,
                  globalSummary.text_only > 0 && `${globalSummary.text_only}× Text Only`,
                  globalSummary.story_teaser > 0 && `${globalSummary.story_teaser}× Story Teaser`,
                  globalSummary.story_standalone > 0 && `${globalSummary.story_standalone}× Story Standalone`,
                ].filter(Boolean).join(' · ')}
              </div>
            )}
          </div>
        </div>
      )}

      {showPremiumCarouselHint && (
        <div className="bg-sky-50 border border-sky-200 rounded-[var(--vektrus-radius-md)] p-4">
          <div className="flex items-start space-x-3">
            <Gem className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-sky-800 mb-1">Premium + Carousel</p>
              <p className="text-sm text-sky-700 leading-relaxed">
                Deine Einzelbild-Posts werden mit Premium-Design generiert. Carousel-Slides nutzen eine spezielle Engine mit optimiertem Text-Rendering — ideal für Slides mit Headlines und Infografiken.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[var(--vektrus-radius-lg)] border-2 border-[rgba(73,183,227,0.18)] p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-3">
            <div className={`w-11 h-11 rounded-[var(--vektrus-radius-md)] flex items-center justify-center transition-all duration-300 ${
              imageGeneration.enabled
                ? 'bg-gradient-to-br from-[#49B7E3] to-[#B6EBF7] shadow-md'
                : 'bg-[#F4FCFE]'
            }`}>
              <Image className={`w-5 h-5 ${imageGeneration.enabled ? 'text-white' : 'text-gray-400'}`} />
            </div>
            <div>
              <h4 className="font-bold text-[#111111] text-sm">Bildgenerierung</h4>
              <p className="text-xs text-[#7A7A7A]">Automatisch passende Bilder zu jedem Post</p>
            </div>
          </div>
          <button
            onClick={() => onUpdate({ imageGeneration: { ...imageGeneration, enabled: !imageGeneration.enabled } })}
            className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
              imageGeneration.enabled ? 'bg-[#49D69E]' : 'bg-gray-300'
            }`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${
              imageGeneration.enabled ? 'left-6' : 'left-0.5'
            }`} />
          </button>
        </div>

        {imageGeneration.enabled && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onUpdate({ imageGeneration: { ...imageGeneration, quality: 'standard' } })}
                className={`p-4 rounded-[var(--vektrus-radius-md)] border-2 text-left transition-all duration-200 ${
                  imageGeneration.quality === 'standard'
                    ? 'border-[#49B7E3] bg-[#49B7E3]/6 shadow-sm'
                    : 'border-[rgba(73,183,227,0.18)] hover:border-[#B6EBF7]'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className={`w-4 h-4 ${imageGeneration.quality === 'standard' ? 'text-[#49B7E3]' : 'text-gray-400'}`} />
                  <span className="font-semibold text-sm text-[#111111]">Standard</span>
                </div>
                <p className="text-xs text-[#7A7A7A]">Schnell & optimiert für Social Media</p>
                <div className="mt-2 flex items-center space-x-1 text-xs text-[#49B7E3] font-medium">
                  <Clock className="w-3 h-3" />
                  <span>~25 Sek./Bild</span>
                </div>
              </button>
              <button
                onClick={() => onUpdate({ imageGeneration: { ...imageGeneration, quality: 'premium' } })}
                className={`p-4 rounded-[var(--vektrus-radius-md)] border-2 text-left transition-all duration-200 border-gradient-ai ${
                  imageGeneration.quality === 'premium'
                    ? 'ai-active bg-[rgba(124,108,242,0.04)] shadow-sm border-transparent'
                    : 'border-[rgba(73,183,227,0.18)]'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className={`w-4 h-4 ${imageGeneration.quality === 'premium' ? 'text-[var(--vektrus-ai-violet)]' : 'text-gray-400'}`} />
                  <span className="font-semibold text-sm text-[#111111]">Premium</span>
                </div>
                <p className="text-xs text-[#7A7A7A]">Höchste Qualität, fotorealistisch</p>
                <div className="mt-2 flex items-center space-x-1 text-xs text-[#49D69E] font-medium">
                  <Clock className="w-3 h-3" />
                  <span>~45 Sek./Bild</span>
                </div>
              </button>
            </div>

            <div className="bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] px-4 py-3 border border-[#B6EBF7]/40 flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-[#49B7E3] flex-shrink-0 mt-0.5" />
              <span className="text-xs text-[#7A7A7A]">
                Geschätzte Verarbeitungszeit: ~{estimatedTime} Min. für {totalFeedPosts} Posts.
                Bildgenerierung erhöht die Gesamtzeit.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step4Summary;
