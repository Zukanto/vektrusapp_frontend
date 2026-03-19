import React from 'react';
import { Plus, Clock, TrendingUp, Ellipsis, Copy, PenLine, Trash2, Sparkles, ChevronRight, Check, CircleAlert as AlertCircle, CalendarClock, FileEdit, Send, Zap, Image as ImageIcon, Calendar, FileText, Film, Layers } from 'lucide-react';
import SocialIcon from '../ui/SocialIcon';
import { ContentSlot } from './types';

interface WeekViewProps {
  selectedWeek: Date;
  contentSlots: ContentSlot[];
  onSlotSelect: (slot: ContentSlot) => void;
  onSlotCreate: (slot: Omit<ContentSlot, 'id'>) => void;
  onSlotUpdate: (slot: ContentSlot) => void;
  onSlotDelete?: (slotId: string) => void;
  onSlotDuplicate?: (slot: ContentSlot) => void;
  onSlotCopyToPlatform?: (slot: ContentSlot, platform: string) => void;
  plannerContext: any;
  onNavigatePulse?: () => void;
}

const WeekView: React.FC<WeekViewProps> = ({
  selectedWeek,
  contentSlots,
  onSlotSelect,
  onSlotCreate,
  onSlotUpdate,
  onSlotDelete,
  onSlotDuplicate,
  onSlotCopyToPlatform,
  plannerContext,
  onNavigatePulse
}) => {
  const weekDays = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
  const platforms = ['instagram', 'linkedin', 'tiktok', 'facebook', 'twitter'];
  const [hoveredSlot, setHoveredSlot] = React.useState<string | null>(null);
  const [contextMenu, setContextMenu] = React.useState<{ slotId: string; x: number; y: number } | null>(null);
  const menuButtonRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});

  // Smart defaults: expand platforms with posts + Instagram and LinkedIn by default
  const getDefaultExpandedPlatforms = () => {
    const platformsWithPosts = platforms.filter(platform =>
      contentSlots.some(slot => slot.platform === platform)
    );
    const defaults = ['instagram', 'linkedin'];
    return Array.from(new Set([...platformsWithPosts, ...defaults]));
  };

  const [expandedPlatforms, setExpandedPlatforms] = React.useState<string[]>(getDefaultExpandedPlatforms());

  const getStatusBadge = (status: ContentSlot['status']) => {
    const config: Record<string, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
      draft: { label: 'Entwurf', bg: 'bg-[#F4FCFE] border-gray-300', text: 'text-gray-700', icon: <FileEdit className="w-3 h-3" /> },
      scheduled: { label: 'Geplant', bg: 'bg-blue-50 border-blue-300', text: 'text-blue-700', icon: <CalendarClock className="w-3 h-3" /> },
      published: { label: 'Live', bg: 'bg-emerald-50 border-emerald-400', text: 'text-emerald-700', icon: <Check className="w-3 h-3" /> },
      failed: { label: 'Fehler', bg: 'bg-red-50 border-red-400', text: 'text-red-700', icon: <AlertCircle className="w-3 h-3" /> },
      planned: { label: 'Geplant', bg: 'bg-blue-50 border-blue-300', text: 'text-blue-700', icon: <CalendarClock className="w-3 h-3" /> },
      ai_suggestion: { label: 'KI', bg: 'bg-purple-50 border-purple-300', text: 'text-purple-700', icon: <Sparkles className="w-3 h-3" /> },
      rejected: { label: 'Abgelehnt', bg: 'bg-red-50 border-red-300', text: 'text-red-600', icon: <AlertCircle className="w-3 h-3" /> },
    };
    return config[status] || config.draft;
  };

  const getReachColor = (reach: number) => {
    if (reach >= 15000) return 'text-purple-200';
    if (reach >= 10000) return 'text-green-200';
    return 'text-blue-200';
  };

  const getEngagementColor = (engagement: number) => {
    if (engagement >= 7) return 'text-purple-200';
    if (engagement >= 5) return 'text-green-200';
    return 'text-blue-200';
  };

  const getTextColor = (status: ContentSlot['status'], platform?: string) => {
    // For platform-specific colored backgrounds, use white text
    if ((status === 'scheduled' || status === 'draft') && platform && ['instagram', 'linkedin', 'tiktok', 'facebook', 'twitter'].includes(platform)) {
      return 'text-white drop-shadow-sm';
    }
    // For ai_suggestion (purple background), use dark text
    if (status === 'ai_suggestion') {
      return 'text-[var(--vektrus-ai-violet)]';
    }
    // Default: white text with shadow
    return 'text-white drop-shadow-sm';
  };

  const getWeekStart = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    return start;
  };

  const getDayDate = (dayIndex: number) => {
    const weekStart = getWeekStart(selectedWeek);
    const dayDate = new Date(weekStart);
    dayDate.setDate(weekStart.getDate() + dayIndex);
    return dayDate;
  };

  const getSlotsForDay = (dayIndex: number, platform: string) => {
    const dayDate = getDayDate(dayIndex);
    const dayStr = dayDate.toDateString();
    return contentSlots.filter(slot => {
      const slotDate = slot.date instanceof Date ? slot.date : new Date(slot.date);
      return slotDate.toDateString() === dayStr && slot.platform === platform;
    });
  };

  const togglePlatform = (platform: string) => {
    setExpandedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const getPlatformPostCount = (platform: string) => {
    const weekStart = getWeekStart(selectedWeek);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return contentSlots.filter(slot =>
      slot.platform === platform &&
      slot.date >= weekStart &&
      slot.date <= weekEnd
    ).length;
  };

  const getSmartHint = (dayIndex: number, platform: string) => {
    const hints: Record<string, Record<number, { time: string; type: string; icon: React.ReactNode; score: number }>> = {
      'instagram': {
        2: { time: '18:00', type: 'Reels', icon: <Film className="w-4 h-4" />, score: 95 },
        4: { time: '20:00', type: 'Carousel', icon: <Layers className="w-4 h-4" />, score: 88 }
      },
      'linkedin': {
        1: { time: '09:00', type: 'Text-Post', icon: <FileText className="w-4 h-4" />, score: 92 },
        3: { time: '10:00', type: 'Carousel', icon: <Layers className="w-4 h-4" />, score: 85 }
      },
      'tiktok': {
        2: { time: '19:00', type: 'Video', icon: <Film className="w-4 h-4" />, score: 90 },
        5: { time: '21:00', type: 'Video', icon: <Film className="w-4 h-4" />, score: 87 }
      }
    };

    return hints[platform]?.[dayIndex] || null;
  };

  const getStatusColor = (status: ContentSlot['status'], platform?: string) => {
    if ((status === 'scheduled' || status === 'draft') && platform) {
      switch (platform) {
        case 'instagram':
          return 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 border-pink-400/50';
        case 'linkedin':
          return 'bg-[#0A66C2] border-[#0A66C2]/50';
        case 'tiktok':
          return 'bg-[#111111] border-[#333]';
        case 'facebook':
          return 'bg-[#1877F2] border-[#1877F2]/50';
        case 'twitter':
          return 'bg-[#1DA1F2] border-[#1DA1F2]/50';
      }
    }

    switch (status) {
      case 'scheduled':
        return 'bg-[#49D69E] border-[#49D69E]/50';
      case 'planned':
        return 'bg-[#49D69E] border-[#49D69E]/50';
      case 'draft':
        return 'bg-[#F4BE9D] border-[#F4BE9D]/50';
      case 'ai_suggestion':
        return 'bg-gradient-to-br from-[#A78BFA] to-[#818CF8] border-[#A78BFA]/50';
      case 'rejected':
        return 'bg-[#FA7E70] border-[#FA7E70]/50';
      case 'published':
        return 'bg-[#49D69E] border-[#49D69E]/50';
      default:
        return 'bg-[#B6EBF7]/20 border-[rgba(73,183,227,0.18)]';
    }
  };

  const getPlatformIcon = (platform: string) => {
    return <SocialIcon platform={platform} size={16} />;
  };

  const getContentTypeIcon = (type: ContentSlot['contentType']) => {
    switch (type) {
      case 'post':
        return <FileText className="w-3.5 h-3.5" />;
      case 'story':
        return <Film className="w-3.5 h-3.5" />;
      case 'reel':
        return <Film className="w-3.5 h-3.5" />;
      case 'carousel':
        return <Layers className="w-3.5 h-3.5" />;
      default:
        return <FileText className="w-3.5 h-3.5" />;
    }
  };

  const shouldShowPulseHints = React.useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const isMondayOrTuesday = dayOfWeek === 1 || dayOfWeek === 2;

    const weekStart = getWeekStart(selectedWeek);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const weekPosts = contentSlots.filter(slot => {
      const d = slot.date instanceof Date ? slot.date : new Date(slot.date);
      return d >= weekStart && d <= weekEnd;
    });

    const hasPulseThisWeek = weekPosts.some(
      s => s.source === 'pulse' || s.source === 'pulse-visual' || s.generatedBy === 'pulse'
    );
    if (hasPulseThisWeek) return false;

    const totalSlots = expandedPlatforms.length * 7;
    const emptyRatio = totalSlots > 0 ? (totalSlots - weekPosts.length) / totalSlots : 1;

    return (emptyRatio > 0.5 && !hasPulseThisWeek) || isMondayOrTuesday;
  }, [contentSlots, selectedWeek, expandedPlatforms]);

  const getPulseHintDay = (platform: string): number | null => {
    if (!shouldShowPulseHints) return null;

    const today = new Date();
    const todayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;

    for (let offset = 0; offset < 7; offset++) {
      const dayIdx = (todayIndex + offset) % 7;
      const daySlots = getSlotsForDay(dayIdx, platform);
      if (daySlots.length === 0) return dayIdx;
    }
    return null;
  };

  const handleCreateSlot = (dayIndex: number, platform: string) => {
    const dayDate = getDayDate(dayIndex);

    const tempSlot: ContentSlot = {
      id: `temp-${Date.now()}`,
      date: dayDate,
      time: '18:00',
      platform: platform as any,
      status: 'draft',
      title: 'Neuer Post',
      body: '',
      content: '',
      contentType: 'post',
      hashtags: []
    };
    onSlotSelect(tempSlot);
  };

  const openContextMenu = (slotId: string) => {
    const btn = menuButtonRefs.current[slotId];
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const menuHeight = 340;
    const menuWidth = 200;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceRight = window.innerWidth - rect.left;

    const y = spaceBelow < menuHeight ? rect.top - menuHeight : rect.bottom + 4;
    const x = spaceRight < menuWidth ? rect.right - menuWidth : rect.left;

    setContextMenu({ slotId, x, y });
  };

  const handleContextMenu = (e: React.MouseEvent, slotId: string) => {
    e.preventDefault();
    e.stopPropagation();
    openContextMenu(slotId);
  };

  const handleContextMenuAction = (action: string, slot: ContentSlot) => {
    setContextMenu(null);
    
    switch (action) {
      case 'edit':
        onSlotSelect(slot);
        break;
      case 'duplicate':
        onSlotDuplicate?.(slot);
        break;
      case 'delete':
        onSlotDelete?.(slot.id);
        break;
      case 'copy-instagram':
      case 'copy-linkedin':
      case 'copy-tiktok':
      case 'copy-facebook':
      case 'copy-twitter':
        const platform = action.replace('copy-', '');
        onSlotCopyToPlatform?.(slot, platform);
        break;
    }
  };

  // Close context menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Update expanded platforms when content changes
  React.useEffect(() => {
    setExpandedPlatforms(getDefaultExpandedPlatforms());
  }, [contentSlots.length]);

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-[1240px] mx-auto">
        {/* Week Grid */}
        <div className="bg-white rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.18)] overflow-hidden shadow-subtle">
          {/* Header Row */}
          <div className="grid grid-cols-8 border-b-2 border-[rgba(73,183,227,0.18)]">
            <div className="p-5 bg-[#F9FAFB] font-bold text-[#111111] text-sm uppercase tracking-wide">
              Plattform
            </div>
            {weekDays.map((day, index) => {
              const dayDate = getDayDate(index);
              const isToday = dayDate.toDateString() === new Date().toDateString();

              return (
                <div
                  key={day}
                  className={`p-4 text-center border-l-2 border-[rgba(73,183,227,0.18)] transition-all duration-200 ${
                    isToday
                      ? 'bg-[#E6F6FB]'
                      : 'bg-white hover:bg-[#F9FAFB]'
                  }`}
                >
                  <div className={`font-bold text-sm uppercase tracking-wide mb-1 ${
                    isToday ? 'text-[#49D69E]' : 'text-[#111111]'
                  }`}>
                    {day.substring(0, 2)}
                  </div>
                  <div className={`text-2xl font-bold leading-none mb-1 ${
                    isToday ? 'text-[#49D69E]' : 'text-[#111111]'
                  }`}>
                    {dayDate.getDate()}
                  </div>
                  <div className={`text-xs font-semibold ${
                    isToday ? 'text-[#49B7E3]' : 'text-[#7A7A7A]'
                  }`}>
                    {dayDate.toLocaleDateString('de-DE', { month: 'short' })}
                  </div>
                  {isToday && (
                    <div className="mt-1.5 mx-auto w-2 h-2 bg-gradient-to-br from-[#49D69E] to-[#49B7E3] rounded-full shadow-md"></div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Platform Rows */}
          {platforms.map(platform => {
            const isExpanded = expandedPlatforms.includes(platform);
            const postCount = getPlatformPostCount(platform);

            return (
              <div key={platform} className="border-b border-[rgba(73,183,227,0.18)] last:border-b-0">
                {/* Platform Header - Always Visible */}
                <button
                  onClick={() => togglePlatform(platform)}
                  className={`w-full flex items-center justify-between px-6 transition-all duration-200 hover:bg-[#F4FCFE] ${
                    isExpanded ? 'h-12 bg-[#F4FCFE]' : 'h-10 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="w-5 h-5 flex items-center justify-center">
                      {getPlatformIcon(platform)}
                    </div>
                    <span className="font-semibold text-[#111111] text-sm capitalize">
                      {platform}
                    </span>
                    <span className="text-xs text-gray-500">
                      {postCount === 0 ? '7 Slots available' : `${postCount}/7 Posts`}
                    </span>
                  </div>

                  {isExpanded && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const today = new Date();
                        const dayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;
                        handleCreateSlot(dayIndex, platform);
                      }}
                      className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-[var(--vektrus-radius-sm)] transition-all duration-200 hover:opacity-90"
                      style={{ backgroundColor: '#49D69E' }}
                    >
                      <Plus className="w-3 h-3" />
                      <span>Neuer Post</span>
                    </button>
                  )}
                </button>

                {/* Platform Grid - Only When Expanded */}
                {isExpanded && (
                  <div className="grid grid-cols-8 border-t border-[rgba(73,183,227,0.18)]">
                    {/* Empty first column for alignment */}
                    <div className="bg-[#F4FCFE]"></div>

                    {/* Day Labels */}
                    {weekDays.map((day, dayIndex) => {
                      const dayDate = getDayDate(dayIndex);
                      const isToday = dayDate.toDateString() === new Date().toDateString();

                      return (
                        <div
                          key={day}
                          className={`h-10 flex items-center justify-center border-l-2 border-[rgba(73,183,227,0.18)] text-xs font-bold transition-colors duration-200 ${
                            isToday
                              ? 'bg-gradient-to-r from-[#B6EBF7]/20 to-[#B4E8E5]/20 text-[#49D69E]'
                              : 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 hover:bg-[#F4FCFE]'
                          }`}
                        >
                          <span className={isToday ? 'bg-[#49D69E]/10 px-2 py-1 rounded-[var(--vektrus-radius-sm)]' : ''}>
                            {day.substring(0, 2)} • {dayDate.getDate()}.{dayDate.getMonth() + 1}
                          </span>
                        </div>
                      );
                    })}

                    {/* Empty first column for content */}
                    <div className="bg-white"></div>

                    {/* Day Slots */}
                    {weekDays.map((_, dayIndex) => {
                      const daySlots = getSlotsForDay(dayIndex, platform);
                      const dayDate = getDayDate(dayIndex);
                      const isToday = dayDate.toDateString() === new Date().toDateString();

                      return (
                        <div
                          key={dayIndex}
                          className={`p-3 border-l border-[rgba(73,183,227,0.18)] min-h-[160px] ${
                            isToday ? 'bg-[#F4FCFE]' : 'bg-white'
                          }`}
                        >
                    <div className="space-y-2">
                      {/* Existing Slots */}
                      {daySlots.map(slot => {
                        const isAi = slot.generatedBy === 'pulse' || slot.status === 'ai_suggestion';
                        const isPulse = slot.source === 'pulse' || slot.generatedBy === 'pulse';
                        const isPulseVisual = slot.source === 'pulse-visual';
                        const textColor = getTextColor(slot.status, slot.platform);

                        return (
                        <div
                          key={slot.id}
                          onClick={() => onSlotSelect(slot)}
                          onMouseEnter={() => setHoveredSlot(slot.id)}
                          onMouseLeave={() => setHoveredSlot(null)}
                          onContextMenu={(e) => handleContextMenu(e, slot.id)}
                          className={`group/card rounded-[var(--vektrus-radius-md)] border cursor-pointer transition-all duration-200 hover:shadow-card hover:-translate-y-0.5 relative overflow-hidden ${getStatusColor(slot.status, slot.platform)} ${hoveredSlot === slot.id ? 'z-[200]' : 'z-[1]'}`}
                        >
                          {(isPulse || isPulseVisual || isAi) && (
                            <div
                              className="absolute top-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-full backdrop-blur-sm z-10"
                              style={{ background: 'linear-gradient(135deg, rgba(73,183,227,0.85) 0%, rgba(124,108,242,0.85) 50%, rgba(232,160,214,0.85) 100%)' }}
                              title={isPulseVisual ? 'Generiert mit Pulse Visual' : 'Generiert mit Vektrus Pulse'}
                            >
                              {isPulseVisual ? (
                                <ImageIcon className="w-2.5 h-2.5 text-white" />
                              ) : (
                                <Zap className="w-2.5 h-2.5 text-white" />
                              )}
                              <span className="text-[9px] font-bold text-white leading-none">Pulse</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 px-2.5 pt-2 pb-1">
                            {isAi && !isPulse && !isPulseVisual && (
                              <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-white/20 backdrop-blur-sm rounded-[var(--vektrus-radius-sm)] text-[10px] font-bold text-white/90 shrink-0">
                                <Sparkles className="w-2.5 h-2.5" />
                                AI
                              </span>
                            )}
                            {slot.media?.type === 'video' && (
                              <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-purple-500/90 backdrop-blur-sm rounded-[var(--vektrus-radius-sm)] text-[10px] font-bold text-white shrink-0">
                                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                </svg>
                                Reel
                              </span>
                            )}
                            <span className={`text-[11px] font-medium ${textColor} ${!isAi && slot.media?.type !== 'video' ? 'mr-auto' : ''} truncate inline-flex items-center gap-1`}>
                              {getContentTypeIcon(slot.contentType)} {slot.contentType}
                            </span>
                            <div className="flex items-center gap-0.5 shrink-0">
                              <Clock className={`w-3 h-3 ${textColor} opacity-70`} />
                              <span className={`text-[11px] tabular-nums font-medium ${textColor}`}>{slot.time}</span>
                            </div>
                            <button
                              ref={(el) => { menuButtonRefs.current[slot.id] = el; }}
                              onClick={(e) => {
                                e.stopPropagation();
                                openContextMenu(slot.id);
                              }}
                              className={`shrink-0 w-6 h-6 flex items-center justify-center rounded-[var(--vektrus-radius-sm)] transition-all duration-150 -mr-0.5 ${
                                contextMenu?.slotId === slot.id
                                  ? 'bg-white/90 shadow-sm'
                                  : 'bg-white/0 hover:bg-white/30 group-hover/card:bg-white/20'
                              }`}
                            >
                              <Ellipsis className={`w-3.5 h-3.5 ${textColor}`} />
                            </button>
                          </div>

                          {/* Title */}
                          <div className="px-2.5 pb-2">
                            <h4 className={`text-[13px] font-semibold leading-snug truncate ${textColor}`}>
                              {slot.title}
                            </h4>

                            {/* Content Score */}
                            {slot.contentScore && (
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <span className={`text-[11px] font-semibold ${textColor}`}>
                                  Score {slot.contentScore.total}
                                </span>
                              </div>
                            )}

                            {/* Status Badge */}
                            {(slot.status === 'published' || slot.status === 'failed' || slot.status === 'scheduled') && (
                              <div className="mt-1.5">
                                {(() => {
                                  const badge = getStatusBadge(slot.status);
                                  return (
                                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[var(--vektrus-radius-sm)] text-[10px] font-semibold border ${badge.bg} ${badge.text}`}>
                                      {badge.icon}
                                      {badge.label}
                                    </span>
                                  );
                                })()}
                              </div>
                            )}
                          </div>

                          {/* Hover Preview */}
                          {hoveredSlot === slot.id && (
                            <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] shadow-elevated z-[250] pointer-events-none overflow-hidden">
                              <div className="bg-gradient-to-r from-[#E8F7F1] to-[#E5F5FB] px-4 py-3 border-b border-[rgba(73,183,227,0.10)]">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-[var(--vektrus-radius-sm)] bg-white flex items-center justify-center shadow-subtle border border-[rgba(73,183,227,0.08)]">
                                      {getPlatformIcon(slot.platform)}
                                    </div>
                                    <span className="text-xs font-bold text-[#111111] uppercase tracking-wide">{slot.platform}</span>
                                  </div>
                                  <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-[var(--vektrus-radius-sm)] border border-[rgba(73,183,227,0.10)]">
                                    <Clock className="w-3.5 h-3.5 text-[#111111]" />
                                    <span className="text-xs font-bold text-[#111111]">{slot.time}</span>
                                  </div>
                                </div>
                                <h4 className="text-sm font-bold text-[#111111] leading-tight">{slot.title}</h4>
                              </div>

                              <div className="px-4 py-3">
                                <p className="text-xs text-[#555] leading-relaxed line-clamp-3 mb-3">{slot.body || slot.content}</p>

                                {slot.contentScore && (
                                  <div className="grid grid-cols-2 gap-2 mb-3">
                                    <div className="bg-blue-50 rounded-[var(--vektrus-radius-sm)] p-2 border border-blue-100">
                                      <div className="text-[10px] text-[#555] mb-0.5 font-semibold">Content Score</div>
                                      <div className={`text-sm font-bold ${slot.contentScore.total >= 85 ? 'text-green-600' : slot.contentScore.total >= 70 ? 'text-blue-600' : 'text-amber-600'}`}>
                                        {slot.contentScore.total} / 100
                                      </div>
                                    </div>
                                    <div className="bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] p-2 border border-[rgba(73,183,227,0.10)]">
                                      <div className="text-[10px] text-[#555] mb-0.5 font-semibold">Plattform-Fit</div>
                                      <div className={`text-sm font-bold ${slot.contentScore.platformFit >= 85 ? 'text-green-600' : slot.contentScore.platformFit >= 70 ? 'text-blue-600' : 'text-amber-600'}`}>
                                        {slot.contentScore.platformFit}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {slot.hashtags && slot.hashtags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-3">
                                    {slot.hashtags.slice(0, 4).map((tag, i) => (
                                      <span key={i} className="text-[10px] px-1.5 py-0.5 bg-[#F4FCFE] text-[#555] rounded-full font-medium">#{tag}</span>
                                    ))}
                                    {slot.hashtags.length > 4 && (
                                      <span className="text-[10px] px-1.5 py-0.5 bg-[#F4FCFE] text-[#555] rounded-full font-medium">+{slot.hashtags.length - 4}</span>
                                    )}
                                  </div>
                                )}

                                {slot.cta && (
                                  <div className="bg-gradient-to-r from-[#49D69E] to-[#49B7E3] rounded-[var(--vektrus-radius-sm)] px-3 py-2">
                                    <div className="text-[10px] text-white/80 font-semibold mb-0.5">Call-to-Action</div>
                                    <div className="text-xs text-white font-bold">{slot.cta}</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        );
                      })}

                      {(() => {
                        const hint = getSmartHint(dayIndex, platform);
                        const pulseHintDay = getPulseHintDay(platform);
                        const showPulseHint = pulseHintDay === dayIndex;

                        if (showPulseHint) {
                          return (
                            <button
                              onClick={() => onNavigatePulse?.()}
                              className="w-full h-full min-h-[140px] border-2 border-dashed rounded-[var(--vektrus-radius-sm)] flex flex-col items-center justify-center transition-all duration-200 group relative opacity-60 hover:opacity-100 hover:bg-[#49B7E3]/5"
                              style={{ borderColor: 'rgba(124, 108, 242, 0.3)' }}
                            >
                              <div className="w-8 h-8 rounded-full pulse-gradient-icon flex items-center justify-center mb-1.5">
                                <Zap className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-xs font-medium" style={{ color: 'var(--vektrus-ai-violet)' }}>
                                Mit Pulse füllen
                              </span>
                            </button>
                          );
                        }

                        return (
                          <button
                            onClick={() => handleCreateSlot(dayIndex, platform)}
                            className="w-full h-full min-h-[140px] border-2 border-dashed border-gray-300 rounded-[var(--vektrus-radius-sm)] flex flex-col items-center justify-center text-gray-400 hover:text-[#49B7E3] hover:border-[#49B7E3] hover:bg-[#F4FCFE] transition-all duration-200 group relative"
                          >
                            <Plus className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />

                            {hint && (
                              <div className="text-center px-2">
                                <div className="text-xs text-gray-500 mb-1">Best Time</div>
                                <div className="flex items-center justify-center space-x-1 mb-1">
                                  <span className="text-[#49B7E3]">{hint.icon}</span>
                                  <span className="text-xs font-semibold text-gray-700">{hint.time}</span>
                                </div>
                                <div className="text-xs text-gray-600">{hint.type}</div>
                              </div>
                            )}

                            {hint && (
                              <div className="absolute top-2 right-2 w-6 h-6 bg-[#49B7E3] rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
                                <Sparkles className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    })}
        </div>

        {/* Context Menu */}
        {contextMenu && (
          <div
            className="fixed bg-white rounded-[var(--vektrus-radius-md)] shadow-elevated border border-[rgba(73,183,227,0.18)] py-1.5 z-[9999] min-w-[190px] max-h-[80vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-150"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const slot = contentSlots.find(s => s.id === contextMenu.slotId);
              if (!slot) return null;

              return (
                <>
                  <button
                    onClick={() => handleContextMenuAction('edit', slot)}
                    className="w-full px-3.5 py-2.5 text-left text-sm text-[#111111] hover:bg-[#F4FCFE] flex items-center space-x-2.5 transition-colors"
                  >
                    <PenLine className="w-4 h-4 text-[#7A7A7A]" />
                    <span className="font-medium">Bearbeiten</span>
                  </button>

                  <button
                    onClick={() => handleContextMenuAction('duplicate', slot)}
                    className="w-full px-3.5 py-2.5 text-left text-sm text-[#111111] hover:bg-[#F4FCFE] flex items-center space-x-2.5 transition-colors"
                  >
                    <Copy className="w-4 h-4 text-[#7A7A7A]" />
                    <span className="font-medium">Duplizieren</span>
                  </button>

                  <div className="border-t border-[rgba(73,183,227,0.10)] my-1 mx-2"></div>

                  <div className="px-3.5 py-1.5 text-xs text-[#7A7A7A] font-semibold uppercase tracking-wide">Kopieren nach</div>
                  {platforms.filter(p => p !== slot.platform).map(platform => (
                    <button
                      key={platform}
                      onClick={() => handleContextMenuAction(`copy-${platform}`, slot)}
                      className="w-full px-3.5 py-2 text-left text-sm text-[#111111] hover:bg-[#F4FCFE] flex items-center space-x-2.5 transition-colors"
                    >
                      <span>{getPlatformIcon(platform)}</span>
                      <span className="capitalize font-medium">{platform}</span>
                    </button>
                  ))}

                  <div className="border-t border-[rgba(73,183,227,0.10)] my-1 mx-2"></div>

                  <button
                    onClick={() => handleContextMenuAction('delete', slot)}
                    className="w-full px-3.5 py-2.5 text-left text-sm text-[#FA7E70] hover:bg-red-50 flex items-center space-x-2.5 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="font-medium">Löschen</span>
                  </button>
                </>
              );
            })()}
          </div>
        )}

        {/* Week Summary - Only show if there are posts */}
        {(() => {
          const totalPosts = contentSlots.length;
          const aiSuggestions = contentSlots.filter(s => s.status === 'ai_suggestion').length;
          const pulsePostsCount = contentSlots.filter(s => s.generatedBy === 'pulse').length;

          if (totalPosts === 0 && aiSuggestions === 0) {
            return null;
          }

          return (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-[var(--vektrus-radius-md)] p-4 border border-[rgba(73,183,227,0.18)] shadow-subtle">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] flex items-center justify-center">
                    <CalendarClock className="w-5 h-5 text-[#49B7E3]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#7A7A7A]">Geplante Posts</p>
                    <p className="text-xl font-bold text-[#111111]">
                      {contentSlots.filter(s => s.status === 'planned' || s.status === 'scheduled').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[var(--vektrus-radius-md)] p-4 border border-[rgba(73,183,227,0.18)] shadow-subtle">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[rgba(124,108,242,0.08)] rounded-[var(--vektrus-radius-sm)] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[var(--vektrus-ai-violet)]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#7A7A7A]">KI-Vorschläge</p>
                    <p className="text-xl font-bold text-[#111111]">
                      {aiSuggestions}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[var(--vektrus-radius-md)] p-4 border border-[rgba(73,183,227,0.18)] shadow-subtle">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[rgba(73,214,158,0.1)] rounded-[var(--vektrus-radius-sm)] flex items-center justify-center">
                    <Check className="w-5 h-5 text-[#49D69E]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#7A7A7A]">Veröffentlicht</p>
                    <p className="text-xl font-bold text-[#49D69E]">
                      {contentSlots.filter(s => s.status === 'published').length}
                    </p>
                  </div>
                </div>
              </div>

              {pulsePostsCount > 0 && (
                <div className="bg-white rounded-[var(--vektrus-radius-md)] p-4 border-gradient-ai ai-active border border-[rgba(124,108,242,0.15)] shadow-subtle">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 pulse-gradient-icon rounded-[var(--vektrus-radius-sm)] flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-[#7A7A7A]">Pulse Posts</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-xl font-bold text-[var(--vektrus-ai-violet)]">
                          {pulsePostsCount}/{totalPosts}
                        </p>
                        <span className="text-xs text-[#49D69E] font-medium">+12%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Auto-Save Indicator */}
        <div className="mt-4 flex justify-center">
          <div className="flex items-center space-x-2 px-3 py-1 bg-white border border-[rgba(73,183,227,0.18)] rounded-full text-xs text-[#7A7A7A]">
            <div className="w-2 h-2 bg-[#49D69E] rounded-full"></div>
            <span>Automatisch gespeichert um {new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeekView;