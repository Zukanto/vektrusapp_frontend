import React from 'react';
import { CalendarClock, Check, Clock, Sparkles, ArrowRight, FileEdit } from 'lucide-react';
import { ContentSlot } from './types';
import SocialIcon, { getPlatformLabel } from '../ui/SocialIcon';

interface MonthViewProps {
  selectedMonth: Date;
  contentSlots: ContentSlot[];
  onWeekSelect: (week: Date) => void;
  activePlatforms?: string[];
}

const MonthView: React.FC<MonthViewProps> = ({
  selectedMonth,
  contentSlots,
  onWeekSelect,
  activePlatforms,
}) => {
  const [currentMonth, setCurrentMonth] = React.useState(selectedMonth);

  React.useEffect(() => {
    setCurrentMonth(selectedMonth);
  }, [selectedMonth.getFullYear(), selectedMonth.getMonth()]);

  const getISOWeekNumber = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  const getMondayOfWeek = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const getMonthWeeks = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const weeks: Date[] = [];
    let currentWeek = getMondayOfWeek(firstDay);

    while (currentWeek <= lastDay) {
      weeks.push(new Date(currentWeek));
      currentWeek.setDate(currentWeek.getDate() + 7);
    }

    return weeks;
  };

  const getWeekRange = (weekStart: Date) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return `${weekStart.getDate()}.${weekStart.getMonth() + 1} – ${weekEnd.getDate()}.${weekEnd.getMonth() + 1}`;
  };

  const allPlatforms = ['instagram', 'linkedin', 'tiktok', 'facebook', 'twitter'];
  const platforms = activePlatforms && activePlatforms.length > 0 ? activePlatforms : allPlatforms;
  const isFiltered = platforms.length < allPlatforms.length;

  const getWeekSlots = (weekStart: Date) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return contentSlots.filter(slot => {
      const slotDate = slot.date instanceof Date ? slot.date : new Date(slot.date);
      if (slotDate < weekStart || slotDate > weekEnd) return false;
      if (isFiltered && !platforms.includes(slot.platform)) return false;
      return true;
    });
  };

  const getPlatformSlots = (weekSlots: ContentSlot[], platform: string) => {
    return weekSlots.filter(slot => slot.platform === platform);
  };

  const filteredSlots = isFiltered
    ? contentSlots.filter(s => platforms.includes(s.platform))
    : contentSlots;

  const weeks = getMonthWeeks(currentMonth);

  const getStatusDotColor = (status: ContentSlot['status']) => {
    switch (status) {
      case 'published': return 'bg-[#49D69E]';
      case 'scheduled':
      case 'planned': return 'bg-[#49B7E3]';
      case 'draft': return 'bg-[#F4BE9D]';
      case 'ai_suggestion': return 'bg-[var(--vektrus-ai-violet)]';
      case 'failed':
      case 'rejected': return 'bg-[#FA7E70]';
      default: return 'bg-[#B6EBF7]/40';
    }
  };

  const isThisWeek = (weekStart: Date) => {
    const now = new Date();
    const currentMonday = getMondayOfWeek(now);
    return weekStart.toDateString() === currentMonday.toDateString();
  };

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-[1240px] mx-auto">
        {/* Week Cards */}
        <div className="space-y-3">
          {weeks.map((weekStart, weekIndex) => {
            const weekSlots = getWeekSlots(weekStart);
            const isCurrent = isThisWeek(weekStart);
            const draftCount = weekSlots.filter(s => s.status === 'draft').length;
            const scheduledCount = weekSlots.filter(s => s.status === 'scheduled' || s.status === 'planned').length;
            const publishedCount = weekSlots.filter(s => s.status === 'published').length;
            const aiCount = weekSlots.filter(s => s.status === 'ai_suggestion').length;

            return (
              <div
                key={weekIndex}
                onClick={() => onWeekSelect(weekStart)}
                className={`rounded-[var(--vektrus-radius-md)] border cursor-pointer transition-all duration-200 hover:shadow-card hover:-translate-y-px ${
                  isCurrent
                    ? 'border-[#49B7E3]/40 bg-white shadow-subtle ring-1 ring-[#49B7E3]/10'
                    : 'border-[rgba(73,183,227,0.15)] bg-white hover:border-[#B6EBF7]/60'
                }`}
              >
                <div className="flex items-center gap-5 px-5 py-4">
                  {/* KW badge */}
                  <div className={`w-11 h-11 rounded-[var(--vektrus-radius-sm)] flex flex-col items-center justify-center flex-shrink-0 ${
                    isCurrent ? 'bg-[#49B7E3] shadow-subtle' : 'bg-[#F4FCFE]'
                  }`}>
                    <span className={`text-[9px] font-bold uppercase leading-none ${isCurrent ? 'text-white/70' : 'text-[#AAAAAA]'}`}>KW</span>
                    <span className={`text-base font-bold leading-tight ${isCurrent ? 'text-white' : 'text-[#111111]'}`}>
                      {getISOWeekNumber(weekStart)}
                    </span>
                  </div>

                  {/* Week info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm font-semibold text-[#111111]">
                        {getWeekRange(weekStart)}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-semibold text-[#49B7E3] bg-[#49B7E3]/8 px-1.5 py-0.5 rounded-full">
                          Aktuell
                        </span>
                      )}
                    </div>

                    {/* Platform row */}
                    <div className="flex items-center gap-3 flex-wrap">
                      {platforms.map(platform => {
                        const count = getPlatformSlots(weekSlots, platform).length;
                        const platformSlots = getPlatformSlots(weekSlots, platform);
                        return (
                          <div key={platform} className="flex items-center gap-1.5">
                            <SocialIcon platform={platform} size={14} />
                            {count > 0 ? (
                              <div className="flex items-center gap-0.5">
                                {platformSlots.slice(0, 4).map((slot, i) => (
                                  <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full ${getStatusDotColor(slot.status)}`}
                                    title={slot.title}
                                  />
                                ))}
                                {count > 4 && (
                                  <span className="text-[9px] text-[#7A7A7A] font-medium ml-0.5">+{count - 4}</span>
                                )}
                              </div>
                            ) : (
                              <div className="w-2 h-2 rounded-full border border-dashed border-[#CCCCCC]" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Status summary */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {draftCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-[var(--vektrus-radius-sm)] bg-[#F4BE9D]/10 text-[10px] font-semibold text-[#B8860B]">
                        <FileEdit className="w-2.5 h-2.5" />{draftCount}
                      </span>
                    )}
                    {scheduledCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-[var(--vektrus-radius-sm)] bg-[#49B7E3]/8 text-[10px] font-semibold text-[#49B7E3]">
                        <CalendarClock className="w-2.5 h-2.5" />{scheduledCount}
                      </span>
                    )}
                    {publishedCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-[var(--vektrus-radius-sm)] bg-[#49D69E]/8 text-[10px] font-semibold text-[#49D69E]">
                        <Check className="w-2.5 h-2.5" />{publishedCount}
                      </span>
                    )}
                    {aiCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-[var(--vektrus-radius-sm)] bg-[rgba(124,108,242,0.06)] text-[10px] font-semibold text-[var(--vektrus-ai-violet)]">
                        <Sparkles className="w-2.5 h-2.5" />{aiCount}
                      </span>
                    )}

                    {/* Total count */}
                    <div className="flex items-center gap-1.5 pl-2 border-l border-[rgba(73,183,227,0.12)]">
                      <span className="text-sm font-bold text-[#111111]">{weekSlots.length}</span>
                      <span className="text-[11px] text-[#7A7A7A]">Posts</span>
                    </div>

                    <ArrowRight className="w-4 h-4 text-[#CCCCCC] group-hover:text-[#7A7A7A] transition-colors ml-1" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Month Summary */}
        <div className="mt-5 bg-white rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.12)] overflow-hidden shadow-subtle">
          <div className="px-5 py-3 border-b border-[rgba(73,183,227,0.08)]">
            <h3 className="text-sm font-semibold text-[#111111]">Monatsübersicht</h3>
          </div>
          <div className="grid grid-cols-4 divide-x divide-[rgba(73,183,227,0.08)]">
            <div className="text-center py-4 px-3">
              <div className="text-xl font-bold text-[#49B7E3] mb-0.5">
                {filteredSlots.length}
              </div>
              <div className="text-[11px] text-[#7A7A7A] font-medium">Gesamt</div>
            </div>
            <div className="text-center py-4 px-3">
              <div className="text-xl font-bold text-[#49D69E] mb-0.5">
                {filteredSlots.filter(s => s.status === 'scheduled' || s.status === 'planned').length}
              </div>
              <div className="text-[11px] text-[#7A7A7A] font-medium">Geplant</div>
            </div>
            <div className="text-center py-4 px-3">
              <div className="text-xl font-bold text-[var(--vektrus-ai-violet)] mb-0.5">
                {filteredSlots.filter(s => s.status === 'ai_suggestion').length}
              </div>
              <div className="text-[11px] text-[#7A7A7A] font-medium">KI-Vorschläge</div>
            </div>
            <div className="text-center py-4 px-3">
              <div className="text-xl font-bold text-[#49D69E] mb-0.5">
                {filteredSlots.filter(s => s.status === 'published').length}
              </div>
              <div className="text-[11px] text-[#7A7A7A] font-medium">Live</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthView;
