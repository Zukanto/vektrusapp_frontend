import React, { useState, useRef, useEffect } from 'react';
import { Target, Megaphone, Heart, DollarSign, Rocket, Users, Layers, TrendingUp, ChevronDown, Hash, Minus, Plus, X, Sparkles } from 'lucide-react';
import { PlannerContext, ContentSlot, ContentPillar } from './types';

interface StrategyBarProps {
  context: PlannerContext;
  contentSlots: ContentSlot[];
  selectedWeek: Date;
  onContextChange: (context: PlannerContext) => void;
}

const goalConfig: Record<string, { label: string; icon: React.ReactNode; color: string; shortDesc: string }> = {
  awareness: { label: 'Awareness', icon: <Megaphone className="w-3.5 h-3.5" />, color: '#49B7E3', shortDesc: 'Reichweite steigern' },
  engagement: { label: 'Engagement', icon: <Heart className="w-3.5 h-3.5" />, color: '#EC4899', shortDesc: 'Interaktion stärken' },
  leads: { label: 'Leads', icon: <Target className="w-3.5 h-3.5" />, color: '#49D69E', shortDesc: 'Kontakte gewinnen' },
  sales: { label: 'Sales', icon: <DollarSign className="w-3.5 h-3.5" />, color: '#FFB627', shortDesc: 'Conversions steigern' },
  launch: { label: 'Launch', icon: <Rocket className="w-3.5 h-3.5" />, color: '#7C6CF2', shortDesc: 'Produkt einführen' },
  community: { label: 'Community', icon: <Users className="w-3.5 h-3.5" />, color: '#00CED1', shortDesc: 'Bindung aufbauen' },
};

const pillarLabels: Record<ContentPillar, { label: string; color: string }> = {
  educational: { label: 'Edu', color: '#49B7E3' },
  entertaining: { label: 'Fun', color: '#EC4899' },
  promotional: { label: 'Promo', color: '#FFB627' },
  behind_the_scenes: { label: 'BTS', color: '#49D69E' },
};

const StrategyBar: React.FC<StrategyBarProps> = ({ context, contentSlots, selectedWeek, onContextChange }) => {
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(false);
  const [campaignDraft, setCampaignDraft] = useState(context.campaign || '');
  const campaignInputRef = useRef<HTMLInputElement>(null);
  const goal = goalConfig[context.goal] || goalConfig.engagement;

  useEffect(() => {
    if (editingCampaign && campaignInputRef.current) {
      campaignInputRef.current.focus();
    }
  }, [editingCampaign]);

  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const weekStart = getWeekStart(selectedWeek);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const weekSlots = contentSlots.filter(slot => {
    const d = slot.date instanceof Date ? slot.date : new Date(slot.date);
    return d >= weekStart && d <= weekEnd;
  });

  // Compute pillar distribution
  const pillarCounts = weekSlots.reduce((acc, slot) => {
    const pillar = slot.pillar || slot.contentTypeDetail || 'promotional';
    acc[pillar] = (acc[pillar] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const totalWithPillar = Object.values(pillarCounts).reduce((a, b) => a + b, 0);

  // Check if any slot has an explicitly set pillar (vs. auto-derived fallback)
  const hasExplicitPillar = weekSlots.some(s => s.pillar != null);

  const getWeekNumber = (date: Date) => {
    const monday = getWeekStart(date);
    const yearStart = new Date(monday.getFullYear(), 0, 4);
    const firstMonday = new Date(yearStart);
    const day = yearStart.getDay();
    firstMonday.setDate(yearStart.getDate() - (day === 0 ? 6 : day - 1));
    const diff = monday.getTime() - firstMonday.getTime();
    return Math.round(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
  };

  const handleGoalChange = (goalId: string) => {
    onContextChange({ ...context, goal: goalId });
    setShowGoalPicker(false);
  };

  const handleFrequencyChange = (delta: number) => {
    const newFreq = Math.max(1, Math.min(14, context.frequency + delta));
    onContextChange({ ...context, frequency: newFreq });
  };

  return (
    <div className="bg-white border-b border-[rgba(73,183,227,0.12)] relative">
      <div className="max-w-[1240px] mx-auto px-6 py-2.5 flex items-center gap-6">

        {/* Week label */}
        <span className="text-[11px] font-semibold text-[#AAAAAA] uppercase tracking-wider flex-shrink-0">
          KW {getWeekNumber(selectedWeek)}
        </span>

        <div className="w-px h-5 bg-[rgba(73,183,227,0.12)]" />

        {/* Goal switcher */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowGoalPicker(!showGoalPicker)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-[var(--vektrus-radius-sm)] hover:bg-[#F4FCFE] transition-colors group"
          >
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ backgroundColor: `${goal.color}15`, color: goal.color }}
            >
              {goal.icon}
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold text-[#111111] leading-tight">{goal.label}</div>
              <div className="text-[10px] text-[#7A7A7A] leading-tight">{goal.shortDesc}</div>
            </div>
            <ChevronDown className="w-3 h-3 text-[#AAAAAA] group-hover:text-[#7A7A7A] transition-colors" />
          </button>

          {showGoalPicker && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowGoalPicker(false)} />
              <div className="absolute top-full left-0 mt-1 bg-white rounded-[var(--vektrus-radius-md)] shadow-elevated border border-[rgba(73,183,227,0.12)] py-1 z-50 min-w-[180px]">
                {Object.entries(goalConfig).map(([id, cfg]) => (
                  <button
                    key={id}
                    onClick={() => handleGoalChange(id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-[#F4FCFE] transition-colors ${
                      context.goal === id ? 'bg-[#F4FCFE]' : ''
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${cfg.color}15`, color: cfg.color }}
                    >
                      {cfg.icon}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#111111]">{cfg.label}</div>
                      <div className="text-[10px] text-[#7A7A7A]">{cfg.shortDesc}</div>
                    </div>
                    {context.goal === id && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="w-px h-5 bg-[rgba(73,183,227,0.12)]" />

        {/* Frequency control */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[11px] font-medium text-[#7A7A7A]">Ziel</span>
          <div className="flex items-center bg-[#F4FCFE] rounded-full">
            <button
              onClick={() => handleFrequencyChange(-1)}
              className="w-5 h-5 flex items-center justify-center text-[#7A7A7A] hover:text-[#111111] transition-colors rounded-full hover:bg-[#E6F6FB]"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-xs font-bold text-[#111111] w-8 text-center tabular-nums">{context.frequency}/W</span>
            <button
              onClick={() => handleFrequencyChange(1)}
              className="w-5 h-5 flex items-center justify-center text-[#7A7A7A] hover:text-[#111111] transition-colors rounded-full hover:bg-[#E6F6FB]"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="w-px h-5 bg-[rgba(73,183,227,0.12)]" />

        {/* Campaign (optional, ephemeral) */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Hash className="w-3 h-3 text-[#AAAAAA]" />
          {editingCampaign ? (
            <div className="flex items-center gap-1">
              <input
                ref={campaignInputRef}
                type="text"
                value={campaignDraft}
                onChange={(e) => setCampaignDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onContextChange({ ...context, campaign: campaignDraft || undefined });
                    setEditingCampaign(false);
                  }
                  if (e.key === 'Escape') {
                    setCampaignDraft(context.campaign || '');
                    setEditingCampaign(false);
                  }
                }}
                onBlur={() => {
                  onContextChange({ ...context, campaign: campaignDraft || undefined });
                  setEditingCampaign(false);
                }}
                placeholder="Kampagne..."
                className="w-24 text-xs font-medium text-[#111111] px-1.5 py-0.5 bg-white border border-[rgba(73,183,227,0.25)] rounded focus:outline-none focus:border-[#49B7E3]"
              />
            </div>
          ) : context.campaign ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setCampaignDraft(context.campaign || ''); setEditingCampaign(true); }}
                className="text-xs font-medium text-[#111111] px-1.5 py-0.5 bg-[#F4FCFE] rounded hover:bg-[#E6F6FB] transition-colors"
              >
                {context.campaign}
              </button>
              <button
                onClick={() => onContextChange({ ...context, campaign: undefined })}
                className="p-0.5 text-[#AAAAAA] hover:text-[#FA7E70] transition-colors"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setCampaignDraft(''); setEditingCampaign(true); }}
              className="text-[11px] text-[#AAAAAA] hover:text-[#49B7E3] transition-colors"
            >
              Kampagne
            </button>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Content pillar mix */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Layers className="w-3 h-3 text-[#AAAAAA]" />
          {totalWithPillar > 0 ? (
            <div className="flex items-center gap-1">
              {(Object.entries(pillarLabels) as [ContentPillar, { label: string; color: string }][]).map(([key, cfg]) => {
                const count = pillarCounts[key] || 0;
                if (count === 0) return null;
                return (
                  <span
                    key={key}
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: `${cfg.color}12`, color: cfg.color }}
                  >
                    {cfg.label} {count}
                  </span>
                );
              })}
              {!hasExplicitPillar && totalWithPillar > 0 && (
                <span className="text-[9px] text-[#AAAAAA] flex items-center gap-0.5" title="Pillar automatisch abgeleitet. Kann im Post-Editor manuell gesetzt werden.">
                  <Sparkles className="w-2.5 h-2.5" />
                  abgeleitet
                </span>
              )}
            </div>
          ) : (
            <span className="text-[10px] text-[#CCCCCC]">Kein Content-Mix</span>
          )}
        </div>

        {/* Post count */}
        <div className="flex items-center gap-1 text-[11px] text-[#7A7A7A] flex-shrink-0">
          <TrendingUp className="w-3 h-3 text-[#49D69E]" />
          <span className="font-medium">{weekSlots.length} Posts</span>
        </div>
      </div>
    </div>
  );
};

export default StrategyBar;
