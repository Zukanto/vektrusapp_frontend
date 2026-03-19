import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Zap, Wand as Wand2, Eye, Megaphone, Heart, Target, DollarSign, Rocket, Users } from 'lucide-react';
import { PlannerContext } from './types';
import { useModuleColors } from '../../hooks/useModuleColors';

interface PlannerHeaderProps {
  selectedWeek: Date;
  onWeekChange: (date: Date) => void;
  context: PlannerContext;
  onContextChange: (context: PlannerContext) => void;
  onStartWizard: () => void;
  onGenerateWeek: () => void;
  onExport?: () => void;
  onMonthView?: () => void;
  weekPostsCount?: number;
  viewMode?: 'week' | 'month';
}

const PlannerHeader: React.FC<PlannerHeaderProps> = ({
  selectedWeek,
  onWeekChange,
  context,
  onContextChange,
  onStartWizard,
  onGenerateWeek,
  onExport,
  onMonthView,
  weekPostsCount = 0,
  viewMode = 'week'
}) => {
  const goals = [
    { id: 'awareness', label: 'Awareness', icon: <Megaphone className="w-4 h-4" /> },
    { id: 'engagement', label: 'Engagement', icon: <Heart className="w-4 h-4" /> },
    { id: 'leads', label: 'Lead Generation', icon: <Target className="w-4 h-4" /> },
    { id: 'sales', label: 'Sales', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'launch', label: 'Produktlaunch', icon: <Rocket className="w-4 h-4" /> },
    { id: 'community', label: 'Community Building', icon: <Users className="w-4 h-4" /> }
  ];

  const platforms = [
    { id: 'instagram', label: 'Instagram', color: 'bg-pink-500', isConnected: true },
    { id: 'linkedin', label: 'LinkedIn', color: 'bg-blue-600', isConnected: true },
    { id: 'tiktok', label: 'TikTok', color: 'bg-black', isConnected: false },
    { id: 'facebook', label: 'Facebook', color: 'bg-blue-500', isConnected: false },
    { id: 'twitter', label: 'Twitter', color: 'bg-sky-500', isConnected: false }
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

  const getCurrentGoal = () => {
    return goals.find(g => g.id === context.goal);
  };

  const colors = useModuleColors('planner');
  const [showPlatformMenu, setShowPlatformMenu] = useState(false);
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  const [showGlow, setShowGlow] = useState(false);
  const glowShownRef = useRef(false);

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

  const activePlatforms = platforms.filter(p => p.isConnected);
  const inactivePlatforms = platforms.filter(p => !p.isConnected);
  const visiblePlatforms = showOnlyActive ? activePlatforms : platforms;

  const getWeekNumber = (date: Date) => {
    const monday = getWeekStart(date);
    const yearStart = new Date(monday.getFullYear(), 0, 4);
    const firstMonday = new Date(yearStart);
    const day = yearStart.getDay();
    firstMonday.setDate(yearStart.getDate() - (day === 0 ? 6 : day - 1));
    const diff = monday.getTime() - firstMonday.getTime();
    return Math.round(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
  };

  return (
    <div
      className="bg-white border-b-2"
      style={{ borderBottomColor: colors.borderLight, height: '88px' }}
    >
      <div className="max-w-[1240px] mx-auto h-full flex flex-col">
        {/* Zeile 1 - Haupt-Navigation (48px) */}
        <div className="flex items-center justify-between px-6" style={{ height: '48px' }}>
          {/* Links: Wochennavigation */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigateWeek('prev')}
              className="w-9 h-9 flex items-center justify-center rounded-[var(--vektrus-radius-sm)] transition-all hover:bg-[#F4FCFE]"
              style={{ color: colors.primary }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {viewMode === 'month' ? (
              <span className="px-3 py-1.5 rounded-[var(--vektrus-radius-sm)] font-semibold text-sm" style={{ backgroundColor: colors.primaryVeryLight, color: colors.primary, minWidth: '120px', textAlign: 'center' }}>
                {selectedWeek.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
              </span>
            ) : (
              <>
                <div
                  className="px-3 py-1.5 rounded-[var(--vektrus-radius-sm)] font-semibold text-sm"
                  style={{ backgroundColor: colors.primaryVeryLight, color: colors.primary, minWidth: '80px', textAlign: 'center' }}
                >
                  KW {getWeekNumber(selectedWeek)}
                </div>

                <span className="text-sm text-gray-700">
                  {getWeekRange(selectedWeek)}
                </span>
              </>
            )}

            <button
              onClick={() => navigateWeek('next')}
              className="w-9 h-9 flex items-center justify-center rounded-[var(--vektrus-radius-sm)] transition-all hover:bg-[#F4FCFE]"
              style={{ color: colors.primary }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Mitte: Ansichts-Toggle */}
          <button
            onClick={onMonthView}
            className="flex items-center space-x-2 px-4 py-2 text-[#7A7A7A] hover:text-[#111111] hover:bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] transition-all text-sm font-medium"
            style={{ width: '140px' }}
          >
            <Eye className="w-4 h-4" />
            <span>Monatsansicht</span>
          </button>

          {/* Rechts: Primary Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onStartWizard}
              data-tour="planner-pulse-button"
              className={`pulse-planner-btn flex items-center space-x-2 px-5 py-2.5 rounded-[var(--vektrus-radius-sm)] font-semibold transition-all duration-200 border-2 hover:shadow-subtle ${showGlow ? 'pulse-glow-once' : ''}`}
              style={{
                borderColor: '#49B7E3',
                color: '#49B7E3',
                backgroundColor: 'transparent',
                minWidth: '160px',
                height: '40px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(73, 183, 227, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Zap className="w-4 h-4" />
              <span className="text-sm whitespace-nowrap">Pulse</span>
            </button>
          </div>
        </div>

        {/* Zeile 2 - Platform Filter (40px) */}
        <div className="flex items-center px-6 space-x-2" data-tour="planner-filter" style={{ height: '40px' }}>
          {/* Toggle: Nur aktive / Alle Plattformen */}
          <button
            onClick={() => setShowOnlyActive(!showOnlyActive)}
            className="h-8 px-3 rounded-[var(--vektrus-radius-sm)] text-xs font-bold transition-all duration-200 border-2 flex items-center space-x-1.5 mr-2"
            style={{
              backgroundColor: showOnlyActive ? colors.primaryVeryLight : 'white',
              borderColor: showOnlyActive ? colors.primary : '#D1D5DB',
              color: showOnlyActive ? colors.primary : '#6B7280'
            }}
          >
            <span>{showOnlyActive ? 'Nur aktive' : 'Alle anzeigen'}</span>
            <span className="text-xs opacity-70">({visiblePlatforms.length}/{platforms.length})</span>
          </button>

          {visiblePlatforms.map(platform => (
            <button
              key={platform.id}
              onClick={() => togglePlatform(platform.id)}
              disabled={!platform.isConnected}
              className={`h-8 px-3 rounded-[var(--vektrus-radius-sm)] text-xs font-medium transition-all duration-200 flex items-center space-x-1.5 ${
                !platform.isConnected
                  ? 'bg-[#F4FCFE] text-gray-400 cursor-not-allowed opacity-50'
                  : context.platforms.includes(platform.id)
                  ? `${platform.color} text-white`
                  : 'bg-[#B6EBF7]/20 text-gray-500'
              }`}
            >
              <span>{platform.label}</span>
              {!platform.isConnected && <svg className="w-3 h-3 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlannerHeader;