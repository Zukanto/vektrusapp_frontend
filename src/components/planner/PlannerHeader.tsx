import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Zap, Eye, Calendar, Filter, FileText, Film, Layers, Sparkles, Clock, CheckCircle, ListFilter } from 'lucide-react';
import { PlannerContext } from './types';
import { useModuleColors } from '../../hooks/useModuleColors';
import SocialIcon from '../ui/SocialIcon';

export type StatusFilter = 'all' | 'draft' | 'scheduled' | 'published' | 'ai_suggestion';
export type ContentTypeFilter = 'all' | 'post' | 'reel' | 'carousel' | 'story';

interface PlannerHeaderProps {
  selectedWeek: Date;
  onWeekChange: (date: Date) => void;
  context: PlannerContext;
  onContextChange: (context: PlannerContext) => void;
  connectedPlatforms?: string[];
  onStartWizard: () => void;
  onGenerateWeek: () => void;
  onExport?: () => void;
  onMonthView?: () => void;
  weekPostsCount?: number;
  viewMode?: 'week' | 'month';
  statusFilter?: StatusFilter;
  onStatusFilterChange?: (filter: StatusFilter) => void;
  contentTypeFilter?: ContentTypeFilter;
  onContentTypeFilterChange?: (filter: ContentTypeFilter) => void;
}

const PlannerHeader: React.FC<PlannerHeaderProps> = ({
  selectedWeek,
  onWeekChange,
  context,
  onContextChange,
  connectedPlatforms,
  onStartWizard,
  onGenerateWeek,
  onExport,
  onMonthView,
  weekPostsCount = 0,
  viewMode = 'week',
  statusFilter = 'all',
  onStatusFilterChange,
  contentTypeFilter = 'all',
  onContentTypeFilterChange,
}) => {
  const allPlatforms = [
    { id: 'instagram', label: 'Instagram' },
    { id: 'linkedin', label: 'LinkedIn' },
    { id: 'tiktok', label: 'TikTok' },
    { id: 'facebook', label: 'Facebook' },
    { id: 'twitter', label: 'Twitter' },
  ];

  // Show only platforms the user has actually connected via Late API
  // No fallback — if nothing is connected, no pills are shown
  const platforms = connectedPlatforms && connectedPlatforms.length > 0
    ? allPlatforms.filter(p => connectedPlatforms.includes(p.id))
    : [];

  const statusOptions: { id: StatusFilter; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'Alle', icon: <ListFilter className="w-3.5 h-3.5" /> },
    { id: 'draft', label: 'Entwürfe', icon: <Clock className="w-3.5 h-3.5" /> },
    { id: 'scheduled', label: 'Geplant', icon: <Calendar className="w-3.5 h-3.5" /> },
    { id: 'published', label: 'Live', icon: <CheckCircle className="w-3.5 h-3.5" /> },
    { id: 'ai_suggestion', label: 'KI', icon: <Sparkles className="w-3.5 h-3.5" /> },
  ];

  const typeOptions: { id: ContentTypeFilter; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'Alle', icon: <Filter className="w-3.5 h-3.5" /> },
    { id: 'post', label: 'Posts', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'reel', label: 'Reels', icon: <Film className="w-3.5 h-3.5" /> },
    { id: 'carousel', label: 'Carousel', icon: <Layers className="w-3.5 h-3.5" /> },
  ];

  const getWeekStart = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    return start;
  };

  const getWeekRange = (date: Date) => {
    const start = getWeekStart(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `${start.getDate()}.${start.getMonth() + 1} - ${end.getDate()}.${end.getMonth() + 1}.${end.getFullYear()}`;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedWeek);
    if (viewMode === 'month') {
      newDate.setMonth(selectedWeek.getMonth() + (direction === 'next' ? 1 : -1));
    } else {
      newDate.setDate(selectedWeek.getDate() + (direction === 'next' ? 7 : -7));
    }
    onWeekChange(newDate);
  };

  const togglePlatform = (platformId: string) => {
    const newPlatforms = context.platforms.includes(platformId)
      ? context.platforms.filter(p => p !== platformId)
      : [...context.platforms, platformId];
    onContextChange({ ...context, platforms: newPlatforms });
  };

  const colors = useModuleColors('planner');
  const [showGlow, setShowGlow] = useState(false);
  const glowShownRef = useRef(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (glowShownRef.current) return;
    const sessionKey = 'pulse-glow-shown';
    if (sessionStorage.getItem(sessionKey)) return;
    if (weekPostsCount === 0) {
      setShowGlow(true);
      glowShownRef.current = true;
      sessionStorage.setItem(sessionKey, '1');
      const timer = setTimeout(() => setShowGlow(false), 1600);
      return () => clearTimeout(timer);
    }
  }, [weekPostsCount]);

  const getWeekNumber = (date: Date) => {
    const monday = getWeekStart(date);
    const yearStart = new Date(monday.getFullYear(), 0, 4);
    const firstMonday = new Date(yearStart);
    const day = yearStart.getDay();
    firstMonday.setDate(yearStart.getDate() - (day === 0 ? 6 : day - 1));
    const diff = monday.getTime() - firstMonday.getTime();
    return Math.round(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
  };

  const hasActiveFilters = statusFilter !== 'all' || contentTypeFilter !== 'all';

  return (
    <div className="bg-white border-b border-[rgba(73,183,227,0.15)]">
      <div className="max-w-[1240px] mx-auto">
        {/* Single row toolbar */}
        <div className="flex items-center justify-between px-6 h-[52px]">
          {/* Left: Week navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateWeek('prev')}
              className="w-8 h-8 flex items-center justify-center rounded-[var(--vektrus-radius-sm)] transition-all hover:bg-[#F4FCFE] text-[#7A7A7A] hover:text-[#111111]"
            >
              <ChevronLeft className="w-4.5 h-4.5" />
            </button>

            {viewMode === 'month' ? (
              <span className="px-3 py-1.5 rounded-[var(--vektrus-radius-sm)] font-semibold text-sm" style={{ backgroundColor: colors.primaryVeryLight, color: colors.primary, minWidth: '120px', textAlign: 'center' }}>
                {selectedWeek.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[#7A7A7A]">
                  {getWeekRange(selectedWeek)}
                </span>
              </div>
            )}

            <button
              onClick={() => navigateWeek('next')}
              className="w-8 h-8 flex items-center justify-center rounded-[var(--vektrus-radius-sm)] transition-all hover:bg-[#F4FCFE] text-[#7A7A7A] hover:text-[#111111]"
            >
              <ChevronRight className="w-4.5 h-4.5" />
            </button>

            <button
              onClick={() => onWeekChange(new Date())}
              className="px-2.5 py-1 text-xs font-medium text-[#7A7A7A] hover:text-[#49B7E3] hover:bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] transition-all"
            >
              Heute
            </button>
          </div>

          {/* Center: Platform + filter controls */}
          <div className="flex items-center gap-2" data-tour="planner-filter">
            {/* Platform pills */}
            {platforms.map(platform => (
              <button
                key={platform.id}
                onClick={() => togglePlatform(platform.id)}
                className={`h-7 px-2.5 rounded-full text-xs font-medium transition-all duration-150 flex items-center gap-1.5 ${
                  context.platforms.includes(platform.id)
                    ? 'bg-[#111111] text-white'
                    : 'bg-[#F4FCFE] text-[#7A7A7A] hover:bg-[#E6F6FB]'
                }`}
              >
                <SocialIcon platform={platform.id} size={12} />
                <span>{platform.label}</span>
              </button>
            ))}

            {/* Divider */}
            <div className="w-px h-5 bg-[rgba(73,183,227,0.15)] mx-1" />

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`h-7 px-2.5 rounded-full text-xs font-medium transition-all duration-150 flex items-center gap-1.5 ${
                hasActiveFilters || showFilters
                  ? 'bg-[#49B7E3]/10 text-[#49B7E3]'
                  : 'bg-[#F4FCFE] text-[#7A7A7A] hover:bg-[#E6F6FB]'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter</span>
              {hasActiveFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#49B7E3]" />
              )}
            </button>
          </div>

          {/* Right: View toggle + Pulse CTA */}
          <div className="flex items-center gap-2">
            <button
              onClick={onMonthView}
              className="h-8 px-3 flex items-center gap-1.5 text-xs font-medium text-[#7A7A7A] hover:text-[#111111] hover:bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{viewMode === 'week' ? 'Monat' : 'Woche'}</span>
            </button>

            <button
              onClick={onStartWizard}
              data-tour="planner-pulse-button"
              className={`pulse-planner-btn flex items-center gap-2 px-4 py-2 rounded-[var(--vektrus-radius-sm)] font-semibold transition-all duration-200 text-sm text-white hover:shadow-card ${showGlow ? 'pulse-glow-once' : ''}`}
              style={{
                background: 'linear-gradient(135deg, #49B7E3 0%, var(--vektrus-ai-violet) 100%)',
              }}
            >
              <Zap className="w-4 h-4" />
              <span>Pulse</span>
            </button>
          </div>
        </div>

        {/* Expandable filter row */}
        {showFilters && (
          <div className="flex items-center gap-4 px-6 pb-3 pt-1">
            {/* Status filters */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-semibold text-[#7A7A7A] uppercase tracking-wide mr-1.5">Status</span>
              {statusOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => onStatusFilterChange?.(opt.id)}
                  className={`h-6 px-2 rounded-full text-[11px] font-medium transition-all duration-150 flex items-center gap-1 ${
                    statusFilter === opt.id
                      ? 'bg-[#111111] text-white'
                      : 'bg-[#F4FCFE] text-[#7A7A7A] hover:bg-[#E6F6FB]'
                  }`}
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-[rgba(73,183,227,0.12)]" />

            {/* Content type filters */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-semibold text-[#7A7A7A] uppercase tracking-wide mr-1.5">Format</span>
              {typeOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => onContentTypeFilterChange?.(opt.id)}
                  className={`h-6 px-2 rounded-full text-[11px] font-medium transition-all duration-150 flex items-center gap-1 ${
                    contentTypeFilter === opt.id
                      ? 'bg-[#111111] text-white'
                      : 'bg-[#F4FCFE] text-[#7A7A7A] hover:bg-[#E6F6FB]'
                  }`}
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={() => {
                  onStatusFilterChange?.('all');
                  onContentTypeFilterChange?.('all');
                }}
                className="text-[11px] font-medium text-[#FA7E70] hover:text-[#E05A4E] transition-colors ml-auto"
              >
                Filter zurücksetzen
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlannerHeader;
