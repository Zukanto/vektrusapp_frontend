import React, { useMemo } from 'react';
import { Check, Minus, Plus } from 'lucide-react';
import { PulseWizardData } from './types';
import SocialIcon, { getPlatformLabel } from '../../ui/SocialIcon';

interface Step2Props {
  data: PulseWizardData;
  onUpdate: (data: Partial<PulseWizardData>) => void;
}

const platforms = [
  { id: 'instagram', comingSoon: false },
  { id: 'linkedin', comingSoon: false },
  { id: 'facebook', comingSoon: false },
  { id: 'tiktok', comingSoon: true },
  { id: 'twitter', comingSoon: false },
];

const scheduleOptions = [
  { id: 'next_7_days', label: 'Nächste 7 Tage' },
  { id: 'next_week', label: 'Nächste Woche' },
  { id: 'next_14_days', label: 'Nächste 14 Tage' },
  { id: 'custom', label: 'Benutzerdefiniert' }
] as const;

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getSunday(monday: Date): Date {
  const sun = new Date(monday);
  sun.setDate(monday.getDate() + 6);
  sun.setHours(23, 59, 59, 999);
  return sun;
}

function computeDates(type: string): { start: Date; end: Date } {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  switch (type) {
    case 'next_7_days': {
      const end = new Date(now);
      end.setDate(now.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { start: now, end };
    }
    case 'next_week': {
      const thisMonday = getMonday(now);
      const nextMon = new Date(thisMonday);
      nextMon.setDate(thisMonday.getDate() + 7);
      return { start: nextMon, end: getSunday(nextMon) };
    }
    case 'next_14_days': {
      const end = new Date(now);
      end.setDate(now.getDate() + 13);
      end.setHours(23, 59, 59, 999);
      return { start: now, end };
    }
    default:
      return { start: now, end: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000) };
  }
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function toInputDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const Step2PlatformSchedule: React.FC<Step2Props> = ({ data, onUpdate }) => {
  const togglePlatform = (id: string) => {
    const next = data.platforms.includes(id)
      ? data.platforms.filter(p => p !== id)
      : [...data.platforms, id];
    onUpdate({ platforms: next });
  };

  const setFrequency = (n: number) => {
    onUpdate({ frequency: Math.max(1, Math.min(7, n)) });
  };

  const setScheduleType = (type: string) => {
    if (type === 'custom') {
      onUpdate({ scheduleType: type as PulseWizardData['scheduleType'] });
    } else {
      const { start, end } = computeDates(type);
      onUpdate({ scheduleType: type as PulseWizardData['scheduleType'], timeframe: { startDate: start, endDate: end } });
    }
  };

  const days = useMemo(() => {
    const startDay = new Date(data.timeframe.startDate.getFullYear(), data.timeframe.startDate.getMonth(), data.timeframe.startDate.getDate());
    const endDay = new Date(data.timeframe.endDate.getFullYear(), data.timeframe.endDate.getMonth(), data.timeframe.endDate.getDate());
    return Math.max(1, Math.round((endDay.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  }, [data.timeframe]);

  const weeks = Math.max(1, Math.round(days / 7));
  const totalPosts = weeks * data.frequency * data.platforms.length;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-[#111111] mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Wo und wie oft posten?
        </h3>
        <p className="text-[#7A7A7A] leading-relaxed">
          Wähle die Plattformen und den Zeitraum.
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#111111] mb-3">Plattformen</label>
        <div className="flex flex-wrap gap-3">
          {platforms.map(p => {
            const selected = data.platforms.includes(p.id);
            if (p.comingSoon) {
              return (
                <div
                  key={p.id}
                  className="relative flex items-center space-x-2.5 px-4 py-3 rounded-[var(--vektrus-radius-md)] border-2 border-[rgba(73,183,227,0.10)] bg-[#F4FCFE] cursor-not-allowed opacity-60"
                >
                  <SocialIcon platform={p.id} size={32} className="grayscale opacity-50" />
                  <span className="text-sm font-medium text-gray-400">
                    {getPlatformLabel(p.id)}
                  </span>
                  <span className="text-[10px] font-semibold text-gray-400 bg-[#B6EBF7]/20 rounded-full px-2 py-0.5 leading-tight">
                    Coming soon
                  </span>
                </div>
              );
            }
            return (
              <button
                key={p.id}
                onClick={() => togglePlatform(p.id)}
                className={`flex items-center space-x-2.5 px-4 py-3 rounded-[var(--vektrus-radius-md)] border-2 transition-all duration-200 border-gradient-ai ${
                  selected
                    ? 'ai-active bg-[rgba(124,108,242,0.04)] shadow-sm border-transparent'
                    : 'border-[rgba(73,183,227,0.18)] hover:border-[#B4E8E5] bg-white'
                }`}
              >
                <SocialIcon platform={p.id} size={32} />
                <span className={`text-sm font-medium ${selected ? 'text-[#111111]' : 'text-[#7A7A7A]'}`}>
                  {getPlatformLabel(p.id)}
                </span>
                {selected && (
                  <div className="w-5 h-5 pulse-gradient-icon rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#111111] mb-3">Posts pro Woche</label>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setFrequency(data.frequency - 1)}
            disabled={data.frequency <= 1}
            className="w-10 h-10 rounded-[var(--vektrus-radius-md)] border-2 border-[rgba(73,183,227,0.18)] flex items-center justify-center hover:border-[#B6EBF7] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Minus className="w-4 h-4 text-[#7A7A7A]" />
          </button>
          <div className="flex-1 relative">
            <div className="h-2 bg-[#B6EBF7]/20 rounded-full">
              <div
                className="h-2 bg-gradient-to-r from-[#49B7E3] via-[#49B7E3] to-[#B4E8E5] rounded-full transition-all duration-300"
                style={{ width: `${((data.frequency - 1) / 6) * 100}%` }}
              />
            </div>
            <input
              type="range"
              min={1}
              max={7}
              value={data.frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
            />
          </div>
          <button
            onClick={() => setFrequency(data.frequency + 1)}
            disabled={data.frequency >= 7}
            className="w-10 h-10 rounded-[var(--vektrus-radius-md)] border-2 border-[rgba(73,183,227,0.18)] flex items-center justify-center hover:border-[#B6EBF7] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Plus className="w-4 h-4 text-[#7A7A7A]" />
          </button>
          <div className="w-14 h-10 bg-[#F4FCFE] border-2 border-[#B6EBF7] rounded-[var(--vektrus-radius-md)] flex items-center justify-center">
            <span className="text-lg font-bold text-[#49B7E3]">{data.frequency}</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#111111] mb-3">Zeitraum</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {scheduleOptions.map(opt => (
            <button
              key={opt.id}
              onClick={() => setScheduleType(opt.id)}
              className={`py-2.5 px-4 rounded-[var(--vektrus-radius-md)] border-2 text-sm font-medium transition-all duration-200 ${
                data.scheduleType === opt.id
                  ? 'border-[#49B7E3] bg-[#49B7E3]/8 text-[#111111]'
                  : 'border-[rgba(73,183,227,0.18)] text-[#7A7A7A] hover:border-[#B6EBF7]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {data.scheduleType === 'custom' ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#7A7A7A] mb-1 block">Startdatum</label>
              <input
                type="date"
                value={toInputDate(data.timeframe.startDate)}
                min={toInputDate(new Date())}
                onChange={(e) => {
                  const d = new Date(e.target.value);
                  d.setHours(0, 0, 0, 0);
                  onUpdate({ timeframe: { ...data.timeframe, startDate: d } });
                }}
                className="w-full p-2.5 border-2 border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] text-sm focus:outline-none focus:border-[#B6EBF7] transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-[#7A7A7A] mb-1 block">Enddatum</label>
              <input
                type="date"
                value={toInputDate(data.timeframe.endDate)}
                min={toInputDate(data.timeframe.startDate)}
                onChange={(e) => {
                  const d = new Date(e.target.value);
                  d.setHours(23, 59, 59, 999);
                  onUpdate({ timeframe: { ...data.timeframe, endDate: d } });
                }}
                className="w-full p-2.5 border-2 border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] text-sm focus:outline-none focus:border-[#B6EBF7] transition-all"
              />
            </div>
          </div>
        ) : (
          <div className="text-sm text-[#7A7A7A] bg-[#F4FCFE] rounded-[var(--vektrus-radius-md)] px-4 py-2.5 border border-[#B6EBF7]/40">
            {formatDate(data.timeframe.startDate)} - {formatDate(data.timeframe.endDate)}
          </div>
        )}
      </div>

      {data.platforms.length > 0 && (
        <div className="bg-gradient-to-r from-[#F4FCFE] to-white rounded-[var(--vektrus-radius-md)] p-4 border border-[#B6EBF7] flex items-center justify-between">
          <div className="text-sm text-[#7A7A7A]">
            = <span className="font-bold text-[#111111]">{totalPosts} Posts</span> auf{' '}
            <span className="font-bold text-[#111111]">{data.platforms.length} Plattform{data.platforms.length > 1 ? 'en' : ''}</span>{' '}
            über <span className="font-bold text-[#111111]">{days} Tage</span>
          </div>
          <div className="text-2xl font-bold text-[#49B7E3]">{totalPosts}</div>
        </div>
      )}
    </div>
  );
};

export default Step2PlatformSchedule;
