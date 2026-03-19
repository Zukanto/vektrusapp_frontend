import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { ContentSlot } from './types';
import SocialIcon, { getPlatformLabel } from '../ui/SocialIcon';

interface MonthViewProps {
  selectedMonth: Date;
  contentSlots: ContentSlot[];
  onWeekSelect: (week: Date) => void;
}

const MonthView: React.FC<MonthViewProps> = ({
  selectedMonth,
  contentSlots,
  onWeekSelect
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
    
    return `${weekStart.getDate()}.${weekStart.getMonth() + 1} - ${weekEnd.getDate()}.${weekEnd.getMonth() + 1}`;
  };

  const getWeekSlots = (weekStart: Date) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    return contentSlots.filter(slot => {
      const slotDate = slot.date;
      return slotDate >= weekStart && slotDate <= weekEnd;
    });
  };

  const getPlatformSlots = (weekSlots: ContentSlot[], platform: string) => {
    return weekSlots.filter(slot => slot.platform === platform);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newMonth);
  };

  const platforms = ['instagram', 'linkedin', 'tiktok', 'facebook', 'twitter'];
  const weeks = getMonthWeeks(currentMonth);


  const getStatusColor = (status: ContentSlot['status']) => {
    switch (status) {
      case 'planned':
        return 'bg-[#49D69E]';
      case 'scheduled':
        return 'bg-[#49B7E3]';
      case 'draft':
        return 'bg-[#F4BE9D]';
      case 'ai_suggestion':
        return 'bg-[#B6EBF7]';
      case 'rejected':
        return 'bg-[#FA7E70]';
      case 'published':
        return 'bg-[#49D69E]';
      case 'failed':
        return 'bg-[#FA7E70]';
      default:
        return 'bg-[#B6EBF7]/20';
    }
  };

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-[1240px] mx-auto">
        {/* Month Header */}
        <div className="bg-white rounded-[var(--vektrus-radius-lg)] border border-[rgba(73,183,227,0.18)] p-6 mb-6 shadow-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-3 text-[#7A7A7A] hover:text-[#49B7E3] hover:bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] transition-all duration-200"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-3 px-4">
                <div className="w-10 h-10 bg-[#49B7E3] rounded-[var(--vektrus-radius-sm)] flex items-center justify-center shadow-subtle">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold font-manrope text-[#111111]">
                  {currentMonth.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                </h1>
              </div>

              <button
                onClick={() => navigateMonth('next')}
                className="p-3 text-[#7A7A7A] hover:text-[#49B7E3] hover:bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] transition-all duration-200"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => onWeekSelect(selectedMonth)}
              className="px-5 py-2.5 bg-[#49B7E3] hover:bg-[#3A9FD1] text-white rounded-[var(--vektrus-radius-sm)] font-semibold transition-all duration-200 shadow-card hover:shadow-elevated text-sm"
            >
              Zur Wochenansicht
            </button>
          </div>
        </div>

        {/* Month Grid */}
        <div className="space-y-4">
          {weeks.map((weekStart, weekIndex) => {
            const weekSlots = getWeekSlots(weekStart);
            const isCurrentWeek = weekStart.toDateString() === selectedMonth.toDateString();
            
            return (
              <div
                key={weekIndex}
                onClick={() => onWeekSelect(weekStart)}
                className={`rounded-[var(--vektrus-radius-lg)] border p-6 cursor-pointer transition-all duration-200 hover:shadow-elevated ${
                  isCurrentWeek
                    ? 'border-[#49B7E3] bg-[#F4FCFE] shadow-card'
                    : 'border-[rgba(73,183,227,0.18)] bg-white hover:border-[#B6EBF7]'
                }`}
              >
                {/* Week Header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-[var(--vektrus-radius-sm)] flex items-center justify-center shadow-subtle ${
                      isCurrentWeek
                        ? 'bg-[#49B7E3]'
                        : 'bg-[#F4FCFE]'
                    }`}>
                      <div className="text-center">
                        <div className={`text-[10px] font-bold ${isCurrentWeek ? 'text-white' : 'text-[#7A7A7A]'}`}>KW</div>
                        <div className={`text-lg font-bold leading-tight ${isCurrentWeek ? 'text-white' : 'text-[#111111]'}`}>
                          {getISOWeekNumber(weekStart)}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold font-manrope text-[#111111]">
                        Kalenderwoche {getISOWeekNumber(weekStart)}
                      </h3>
                      <p className="text-sm text-[#7A7A7A]">{getWeekRange(weekStart)}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-center px-4 py-2 bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)]">
                      <div className="text-xl font-bold text-[#49B7E3]">{weekSlots.length}</div>
                      <div className="text-xs text-[#7A7A7A] font-medium">Posts</div>
                    </div>
                    <div className="text-center px-4 py-2 bg-[rgba(73,214,158,0.08)] rounded-[var(--vektrus-radius-sm)]">
                      <div className="text-xl font-bold text-[#49D69E]">
                        {weekSlots.filter(s => s.status === 'planned').length}
                      </div>
                      <div className="text-xs text-[#7A7A7A] font-medium">Geplant</div>
                    </div>
                  </div>
                </div>

                {/* Platform Overview */}
                <div className="grid grid-cols-5 gap-4">
                  {platforms.map(platform => {
                    const platformSlots = getPlatformSlots(weekSlots, platform);
                    
                    return (
                      <div key={platform} className="text-center">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                          <SocialIcon platform={platform} size={20} />
                          <span className="text-sm font-medium text-[#111111]">
                            {getPlatformLabel(platform)}
                          </span>
                        </div>
                        
                        <div className="flex justify-center space-x-1">
                          {platformSlots.slice(0, 3).map((slot, index) => (
                            <div
                              key={index}
                              className={`w-3 h-3 rounded-full ${getStatusColor(slot.status)}`}
                              title={slot.title}
                            />
                          ))}
                          {platformSlots.length > 3 && (
                            <div className="w-3 h-3 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-xs text-white">+</span>
                            </div>
                          )}
                          {platformSlots.length === 0 && (
                            <div className="w-3 h-3 rounded-full border-2 border-dashed border-gray-300" />
                          )}
                        </div>
                        
                        <div className="text-xs text-[#7A7A7A] mt-1">
                          {platformSlots.length} Post{platformSlots.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Month Summary */}
        <div className="mt-6 bg-white rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.18)] p-6 shadow-subtle">
          <h3 className="text-lg font-semibold font-manrope text-[#111111] mb-4">Monatsübersicht</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)]">
              <div className="text-2xl font-bold text-[#49B7E3] mb-1">
                {contentSlots.length}
              </div>
              <div className="text-sm text-[#7A7A7A]">Gesamt Posts</div>
            </div>

            <div className="text-center p-4 bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)]">
              <div className="text-2xl font-bold text-[#49D69E] mb-1">
                {contentSlots.filter(s => s.status === 'planned').length}
              </div>
              <div className="text-sm text-[#7A7A7A]">Geplant</div>
            </div>

            <div className="text-center p-4 bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)]">
              <div className="text-2xl font-bold text-[var(--vektrus-ai-violet)] mb-1">
                {contentSlots.filter(s => s.status === 'ai_suggestion').length}
              </div>
              <div className="text-sm text-[#7A7A7A]">KI-Vorschläge</div>
            </div>

            <div className="text-center p-4 bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)]">
              <div className="text-2xl font-bold text-[#49D69E] mb-1">
                {contentSlots.filter(s => s.status === 'published').length}
              </div>
              <div className="text-sm text-[#7A7A7A]">Veröffentlicht</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthView;