import React from 'react';
import {
  Zap, CheckCircle, AlertCircle, Sparkles, Target,
  ChevronUp, ChevronDown, ArrowRight, Lightbulb,
  Megaphone, Heart, DollarSign, Rocket, Users,
  Layers, Hash, Minus, Plus, X, Clock, Calendar
} from 'lucide-react';
import { ContentSlot, PlannerContext, ContentPillar } from './types';
import SocialIcon from '../ui/SocialIcon';

interface WeeklyIntelligenceCardProps {
  contentSlots: ContentSlot[];
  selectedWeek: Date;
  context: PlannerContext;
  onContextChange: (context: PlannerContext) => void;
  onNavigatePulse: () => void;
  onFillGaps: () => void;
  onApproveAll: () => void;
}

// --- Config ---

const goalConfig: Record<string, { label: string; icon: React.ReactNode; color: string; shortDesc: string }> = {
  awareness: { label: 'Awareness', icon: <Megaphone className="w-3.5 h-3.5" />, color: '#49B7E3', shortDesc: 'Reichweite steigern' },
  engagement: { label: 'Engagement', icon: <Heart className="w-3.5 h-3.5" />, color: '#EC4899', shortDesc: 'Interaktion staerken' },
  leads: { label: 'Leads', icon: <Target className="w-3.5 h-3.5" />, color: '#49D69E', shortDesc: 'Kontakte gewinnen' },
  sales: { label: 'Sales', icon: <DollarSign className="w-3.5 h-3.5" />, color: '#FFB627', shortDesc: 'Conversions steigern' },
  launch: { label: 'Launch', icon: <Rocket className="w-3.5 h-3.5" />, color: '#7C6CF2', shortDesc: 'Produkt einfuehren' },
  community: { label: 'Community', icon: <Users className="w-3.5 h-3.5" />, color: '#00CED1', shortDesc: 'Bindung aufbauen' },
};

const pillarConfig: Record<ContentPillar, { label: string; color: string }> = {
  educational: { label: 'Edu', color: '#49B7E3' },
  entertaining: { label: 'Fun', color: '#EC4899' },
  promotional: { label: 'Promo', color: '#FFB627' },
  behind_the_scenes: { label: 'BTS', color: '#49D69E' },
};

const PILLAR_LABELS: Record<ContentPillar, string> = {
  educational: 'Educational',
  entertaining: 'Entertaining',
  promotional: 'Promotional',
  behind_the_scenes: 'Behind the Scenes',
};

// --- Analysis ---

interface GapInsight {
  type: 'platform_gap' | 'pillar_imbalance' | 'funnel_gap' | 'format_gap' | 'frequency_gap' | 'drafts_pending';
  severity: 'high' | 'medium' | 'low';
  label: string;
  detail: string;
  actionLabel?: string;
  actionType?: 'pulse' | 'fillGaps' | 'approve';
}

function getWeekStart(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function analyzeWeek(weekSlots: ContentSlot[], context: PlannerContext): GapInsight[] {
  const insights: GapInsight[] = [];
  const recommended = context.frequency || 5;
  const actual = weekSlots.length;

  // 1. Frequency gap
  if (actual < recommended) {
    const gap = recommended - actual;
    insights.push({
      type: 'frequency_gap',
      severity: gap >= 3 ? 'high' : gap >= 2 ? 'medium' : 'low',
      label: `${gap} Posts fehlen`,
      detail: `${actual} von ${recommended} geplant`,
      actionLabel: 'Mit Pulse fuellen',
      actionType: 'fillGaps',
    });
  }

  // 2. Platform gaps — grouped
  const platformCounts = weekSlots.reduce((acc, s) => {
    acc[s.platform] = (acc[s.platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const emptyPlatforms = context.platforms.filter(p => !platformCounts[p]);
  if (emptyPlatforms.length > 0) {
    const goal = goalConfig[context.goal];
    const goalLabel = goal ? goal.label.toLowerCase() : '';

    if (emptyPlatforms.length === 1) {
      insights.push({
        type: 'platform_gap',
        severity: 'medium',
        label: `${emptyPlatforms[0]} noch ohne Content`,
        detail: goalLabel ? `Fuer dein ${goalLabel}-Ziel empfohlen` : `Kein Content diese Woche`,
        actionLabel: 'Generieren',
        actionType: 'fillGaps',
      });
    } else {
      insights.push({
        type: 'platform_gap',
        severity: 'medium',
        label: `${emptyPlatforms.length} Kanaele noch ohne Content`,
        detail: emptyPlatforms.join(', '),
        actionLabel: 'Generieren',
        actionType: 'fillGaps',
      });
    }
  }

  // 3. Pillar imbalance
  const pillarCounts = weekSlots.reduce((acc, s) => {
    const p = s.pillar || s.contentTypeDetail;
    if (p) acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (actual >= 3) {
    const hasPillarData = Object.keys(pillarCounts).length > 0;
    if (hasPillarData) {
      const totalPillar = Object.values(pillarCounts).reduce((a, b) => a + b, 0);
      const dominantPillar = Object.entries(pillarCounts).sort((a, b) => b[1] - a[1])[0];
      if (dominantPillar && dominantPillar[1] / totalPillar > 0.7) {
        const name = PILLAR_LABELS[dominantPillar[0] as ContentPillar] || dominantPillar[0];
        insights.push({
          type: 'pillar_imbalance',
          severity: 'low',
          label: `${name}-lastig`,
          detail: `${Math.round((dominantPillar[1] / totalPillar) * 100)}% deines Contents ist ${name}`,
        });
      }
    }
  }

  // 4. Format diversity
  const typeCounts = weekSlots.reduce((acc, s) => {
    acc[s.contentType] = (acc[s.contentType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (actual >= 4 && Object.keys(typeCounts).length === 1) {
    insights.push({
      type: 'format_gap',
      severity: 'low',
      label: 'Nur ein Format',
      detail: `Alle Posts sind ${Object.keys(typeCounts)[0]}s. Ein Mix performt besser.`,
    });
  }

  // 5. Drafts pending
  const draftCount = weekSlots.filter(s => s.status === 'draft').length;
  if (draftCount >= 2) {
    insights.push({
      type: 'drafts_pending',
      severity: draftCount >= 4 ? 'medium' : 'low',
      label: `${draftCount} Entwuerfe offen`,
      detail: 'Pruefe und genehmige deine Entwuerfe',
      actionLabel: 'Alle freigeben',
      actionType: 'approve',
    });
  }

  // 6. Goal-aware heuristics
  const goal = context.goal;

  if (goal === 'leads' && actual >= 2) {
    const bofu = weekSlots.filter(s => s.funnelStage === 'bofu').length;
    if (bofu === 0 && actual >= 3) {
      insights.push({
        type: 'funnel_gap',
        severity: 'low',
        label: 'Kein Bottom-Funnel',
        detail: 'Ergaenze Posts mit direktem CTA fuer Lead-Conversion',
      });
    }
  }

  if (goal === 'engagement' && actual >= 2) {
    const hasReels = typeCounts['reel'] && typeCounts['reel'] > 0;
    const hasCarousel = typeCounts['carousel'] && typeCounts['carousel'] > 0;
    if (!hasReels && !hasCarousel) {
      insights.push({
        type: 'format_gap',
        severity: 'low',
        label: 'Reels/Carousels fehlen',
        detail: 'Interaktive Formate erzeugen mehr Engagement',
        actionLabel: 'Mit Pulse fuellen',
        actionType: 'fillGaps',
      });
    }
  }

  if (goal === 'awareness' && actual >= 2) {
    const uniquePlatforms = new Set(weekSlots.map(s => s.platform)).size;
    if (uniquePlatforms <= 1 && context.platforms.length >= 2) {
      insights.push({
        type: 'platform_gap',
        severity: 'medium',
        label: 'Nur 1 Plattform bespielt',
        detail: 'Fuer Reichweite lohnt sich Multi-Plattform-Praesenz',
        actionLabel: 'Generieren',
        actionType: 'fillGaps',
      });
    }
  }

  if (goal === 'sales' && actual >= 2) {
    const promoCount = (pillarCounts['promotional'] || 0);
    if (promoCount === 0) {
      insights.push({
        type: 'pillar_imbalance',
        severity: 'medium',
        label: 'Kein Promotional Content',
        detail: 'Fuer Sales-Ziele braucht es mindestens 1 Promotional Post',
        actionLabel: 'Mit Pulse fuellen',
        actionType: 'fillGaps',
      });
    }
  }

  if (goal === 'community' && actual >= 2) {
    const eduOrBts = (pillarCounts['educational'] || 0) + (pillarCounts['behind_the_scenes'] || 0);
    if (eduOrBts === 0) {
      insights.push({
        type: 'pillar_imbalance',
        severity: 'low',
        label: 'Kein Community-Content',
        detail: 'Educational oder Behind-the-Scenes staerkt die Bindung',
      });
    }
  }

  return insights;
}

// --- Component ---

const WeeklyIntelligenceCard: React.FC<WeeklyIntelligenceCardProps> = ({
  contentSlots,
  selectedWeek,
  context,
  onContextChange,
  onNavigatePulse,
  onFillGaps,
  onApproveAll,
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [showGoalPicker, setShowGoalPicker] = React.useState(false);
  const [editingCampaign, setEditingCampaign] = React.useState(false);
  const [campaignDraft, setCampaignDraft] = React.useState(context.campaign || '');
  const campaignInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (editingCampaign && campaignInputRef.current) {
      campaignInputRef.current.focus();
    }
  }, [editingCampaign]);

  const weekStart = getWeekStart(selectedWeek);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const weekSlots = contentSlots.filter(slot => {
    const d = slot.date instanceof Date ? slot.date : new Date(slot.date);
    return d >= weekStart && d <= weekEnd;
  });

  const recommended = context.frequency || 5;
  const actual = weekSlots.length;
  const progress = Math.min(Math.round((actual / recommended) * 100), 100);
  const goal = goalConfig[context.goal] || goalConfig.engagement;

  const platformCounts = weekSlots.reduce((acc, slot) => {
    acc[slot.platform] = (acc[slot.platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Pillar distribution
  const pillarCounts = weekSlots.reduce((acc, slot) => {
    const pillar = slot.pillar || slot.contentTypeDetail || 'promotional';
    acc[pillar] = (acc[pillar] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const totalWithPillar = Object.values(pillarCounts).reduce((a, b) => a + b, 0);

  const getProgressColor = () => {
    if (progress >= 100) return '#49D69E';
    if (progress >= 60) return '#49B7E3';
    if (progress >= 30) return '#F4BE9D';
    return '#FA7E70';
  };

  const insights = analyzeWeek(weekSlots, context);
  // Pick the single most important actionable insight
  const primaryInsight = insights.find(i => i.actionType && i.severity !== 'low') || insights.find(i => i.actionType);
  const secondaryInsights = insights.filter(i => i !== primaryInsight).slice(0, 2);

  const handleAction = (actionType?: string) => {
    if (actionType === 'pulse') onNavigatePulse();
    else if (actionType === 'fillGaps') onFillGaps();
    else if (actionType === 'approve') onApproveAll();
  };

  const handleGoalChange = (goalId: string) => {
    onContextChange({ ...context, goal: goalId });
    setShowGoalPicker(false);
  };

  const handleFrequencyChange = (delta: number) => {
    const newFreq = Math.max(1, Math.min(14, context.frequency + delta));
    onContextChange({ ...context, frequency: newFreq });
  };

  const getWeekNumber = (date: Date) => {
    const monday = getWeekStart(date);
    const yearStart = new Date(monday.getFullYear(), 0, 4);
    const firstMonday = new Date(yearStart);
    const day = yearStart.getDay();
    firstMonday.setDate(yearStart.getDate() - (day === 0 ? 6 : day - 1));
    const diff = monday.getTime() - firstMonday.getTime();
    return Math.round(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
  };

  // Collapsed: single-line summary
  if (isCollapsed) {
    return (
      <div className="bg-white border-b border-[rgba(73,183,227,0.10)]">
        <div className="max-w-[1240px] mx-auto px-6 py-2">
          <button
            onClick={() => setIsCollapsed(false)}
            className="flex items-center gap-3 text-sm text-[#7A7A7A] hover:text-[#111111] transition-colors w-full"
          >
            <ChevronDown className="w-3.5 h-3.5" />
            <span className="text-[11px] font-semibold text-[#AAAAAA] uppercase tracking-wider">KW {getWeekNumber(selectedWeek)}</span>
            <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ backgroundColor: `${goal.color}15`, color: goal.color }}>
              {goal.icon}
            </div>
            <span className="text-xs font-medium">{goal.label}</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: `${getProgressColor()}15`, color: getProgressColor() }}>
              {actual}/{recommended}
            </span>
            {primaryInsight && primaryInsight.severity !== 'low' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#F4BE9D]/10 text-[#B8860B] font-medium">
                {primaryInsight.label}
              </span>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-b border-[rgba(73,183,227,0.10)]">
      <div className="max-w-[1240px] mx-auto px-6 py-4">
        <div className="flex items-start gap-5">

          {/* Left: Weekly Summary / KPI */}
          <div className="flex-shrink-0 w-[72px]">
            <div className="relative w-[64px] h-[64px] mx-auto">
              <svg className="w-[64px] h-[64px] -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="#F4FCFE" strokeWidth="4" />
                <circle
                  cx="32" cy="32" r="28" fill="none"
                  stroke={getProgressColor()}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${(progress / 100) * 175.93} 175.93`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-[#111111] leading-none">{actual}</span>
                <span className="text-[9px] text-[#7A7A7A] leading-none mt-0.5">von {recommended}</span>
              </div>
            </div>
            <div className="text-center mt-1.5">
              <span className="text-[10px] font-semibold text-[#AAAAAA] uppercase tracking-wider">KW {getWeekNumber(selectedWeek)}</span>
            </div>
          </div>

          {/* Center: Level A + B */}
          <div className="flex-1 min-w-0">

            {/* Level A — Strategic context */}
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              {/* Goal switcher */}
              <div className="relative">
                <button
                  onClick={() => setShowGoalPicker(!showGoalPicker)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-[var(--vektrus-radius-sm)] hover:bg-[#F4FCFE] transition-colors group"
                >
                  <div className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: `${goal.color}15`, color: goal.color }}>
                    {goal.icon}
                  </div>
                  <span className="text-xs font-semibold text-[#111111]">{goal.label}</span>
                  <ChevronDown className="w-3 h-3 text-[#AAAAAA] group-hover:text-[#7A7A7A]" />
                </button>

                {showGoalPicker && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowGoalPicker(false)} />
                    <div className="absolute top-full left-0 mt-1 bg-white rounded-[var(--vektrus-radius-md)] shadow-elevated border border-[rgba(73,183,227,0.12)] py-1 z-50 min-w-[180px]">
                      {Object.entries(goalConfig).map(([id, cfg]) => (
                        <button
                          key={id}
                          onClick={() => handleGoalChange(id)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-[#F4FCFE] transition-colors ${context.goal === id ? 'bg-[#F4FCFE]' : ''}`}
                        >
                          <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${cfg.color}15`, color: cfg.color }}>
                            {cfg.icon}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-[#111111]">{cfg.label}</div>
                            <div className="text-[10px] text-[#7A7A7A]">{cfg.shortDesc}</div>
                          </div>
                          {context.goal === id && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="w-px h-4 bg-[rgba(73,183,227,0.12)]" />

              {/* Frequency */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-medium text-[#7A7A7A]">Ziel</span>
                <div className="flex items-center bg-[#F4FCFE] rounded-full">
                  <button onClick={() => handleFrequencyChange(-1)} className="w-5 h-5 flex items-center justify-center text-[#7A7A7A] hover:text-[#111111] rounded-full hover:bg-[#E6F6FB]">
                    <Minus className="w-2.5 h-2.5" />
                  </button>
                  <span className="text-[11px] font-bold text-[#111111] w-7 text-center tabular-nums">{context.frequency}/W</span>
                  <button onClick={() => handleFrequencyChange(1)} className="w-5 h-5 flex items-center justify-center text-[#7A7A7A] hover:text-[#111111] rounded-full hover:bg-[#E6F6FB]">
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>

              <div className="w-px h-4 bg-[rgba(73,183,227,0.12)]" />

              {/* Campaign */}
              <div className="flex items-center gap-1">
                <Hash className="w-3 h-3 text-[#AAAAAA]" />
                {editingCampaign ? (
                  <input
                    ref={campaignInputRef}
                    type="text"
                    value={campaignDraft}
                    onChange={(e) => setCampaignDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { onContextChange({ ...context, campaign: campaignDraft || undefined }); setEditingCampaign(false); }
                      if (e.key === 'Escape') { setCampaignDraft(context.campaign || ''); setEditingCampaign(false); }
                    }}
                    onBlur={() => { onContextChange({ ...context, campaign: campaignDraft || undefined }); setEditingCampaign(false); }}
                    placeholder="Kampagne..."
                    className="w-24 text-[11px] font-medium text-[#111111] px-1.5 py-0.5 bg-white border border-[rgba(73,183,227,0.25)] rounded focus:outline-none focus:border-[#49B7E3]"
                  />
                ) : context.campaign ? (
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setCampaignDraft(context.campaign || ''); setEditingCampaign(true); }} className="text-[11px] font-medium text-[#111111] px-1.5 py-0.5 bg-[#F4FCFE] rounded hover:bg-[#E6F6FB] transition-colors">
                      {context.campaign}
                    </button>
                    <button onClick={() => onContextChange({ ...context, campaign: undefined })} className="p-0.5 text-[#AAAAAA] hover:text-[#FA7E70] transition-colors">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => { setCampaignDraft(''); setEditingCampaign(true); }} className="text-[10px] text-[#AAAAAA] hover:text-[#49B7E3] transition-colors">
                    Kampagne
                  </button>
                )}
              </div>

              <div className="w-px h-4 bg-[rgba(73,183,227,0.12)]" />

              {/* Content mix — visual bars */}
              <div className="flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-[#AAAAAA]" />
                {totalWithPillar > 0 ? (
                  <div className="flex items-center gap-0.5 h-4">
                    {(Object.entries(pillarConfig) as [ContentPillar, { label: string; color: string }][]).map(([key, cfg]) => {
                      const count = pillarCounts[key] || 0;
                      if (count === 0) return null;
                      const widthPx = Math.max(16, Math.round((count / totalWithPillar) * 64));
                      return (
                        <div
                          key={key}
                          className="h-full rounded-sm flex items-center justify-center"
                          style={{ width: `${widthPx}px`, backgroundColor: `${cfg.color}20` }}
                          title={`${cfg.label}: ${count} Post${count > 1 ? 's' : ''}`}
                        >
                          <span className="text-[8px] font-bold leading-none" style={{ color: cfg.color }}>{cfg.label}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-[10px] text-[#CCCCCC]">Mix noch nicht definiert</span>
                )}
              </div>

              {/* Per-platform counts */}
              <div className="flex items-center gap-1 ml-auto">
                {context.platforms.slice(0, 4).map(platform => {
                  const count = platformCounts[platform] || 0;
                  return (
                    <div
                      key={platform}
                      className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        count === 0 ? 'bg-[#FA7E70]/6 text-[#FA7E70]' : 'bg-[#F4FCFE] text-[#555]'
                      }`}
                    >
                      <SocialIcon platform={platform} size={10} />
                      <span>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Level B — Insights (consolidated) */}
            {insights.length > 0 ? (
              <div className="flex items-center gap-2 flex-wrap">
                {secondaryInsights.map((insight, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-1 px-2 py-1 rounded-[var(--vektrus-radius-sm)] text-[11px] ${
                      insight.severity === 'high'
                        ? 'bg-[#FA7E70]/8 text-[#C44536]'
                        : insight.severity === 'medium'
                        ? 'bg-[#F4BE9D]/10 text-[#B8860B]'
                        : 'bg-[#F4FCFE] text-[#555555]'
                    }`}
                  >
                    <Lightbulb className="w-3 h-3 flex-shrink-0" />
                    <span className="font-medium">{insight.label}</span>
                    {insight.detail && (
                      <span className="text-[10px] opacity-70 hidden sm:inline">— {insight.detail}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-[#49D69E]/6 rounded-[var(--vektrus-radius-sm)] text-[11px] text-[#2D8B5E]">
                <CheckCircle className="w-3 h-3" />
                <span className="font-medium">Woche ist strategisch aufgestellt</span>
              </div>
            )}
          </div>

          {/* Right: Level C — Single dominant action + collapse */}
          <div className="flex-shrink-0 flex flex-col items-end gap-2 pt-0.5">
            {primaryInsight && primaryInsight.actionType ? (
              <button
                onClick={() => handleAction(primaryInsight.actionType)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--vektrus-radius-sm)] text-xs font-semibold text-white transition-all hover:shadow-card hover:scale-[1.02]"
                style={{ background: primaryInsight.actionType === 'approve'
                  ? '#49D69E'
                  : 'linear-gradient(135deg, #49B7E3 0%, var(--vektrus-ai-violet) 100%)'
                }}
              >
                {primaryInsight.actionType === 'approve' ? (
                  <CheckCircle className="w-3.5 h-3.5" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                {primaryInsight.actionLabel}
              </button>
            ) : actual >= recommended ? (
              <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-[var(--vektrus-radius-sm)] bg-[#49D69E]/8 text-[11px] font-semibold text-[#49D69E]">
                <CheckCircle className="w-3 h-3" />
                Ziel erreicht
              </div>
            ) : null}

            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1 text-[#AAAAAA] hover:text-[#7A7A7A] transition-colors"
              title="Einklappen"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyIntelligenceCard;
