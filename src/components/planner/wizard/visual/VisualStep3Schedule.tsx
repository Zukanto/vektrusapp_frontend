import React from 'react';
import { VisualWizardData, computeDates, formatDate, toInputDate } from './types';

interface VisualStep3ScheduleProps {
  data: VisualWizardData;
  onUpdate: (partial: Partial<VisualWizardData>) => void;
}

const scheduleOptions = [
  { id: 'next_7_days', label: 'Nächste 7 Tage' },
  { id: 'next_week', label: 'Nächste Woche' },
  { id: 'next_14_days', label: 'Nächste 14 Tage' },
  { id: 'custom', label: 'Benutzerdefiniert' },
] as const;

const VisualStep3Schedule: React.FC<VisualStep3ScheduleProps> = ({ data, onUpdate }) => {
  const setScheduleType = (type: string) => {
    if (type === 'custom') {
      onUpdate({ scheduleType: type as VisualWizardData['scheduleType'] });
    } else {
      const { start, end } = computeDates(type);
      onUpdate({ scheduleType: type as VisualWizardData['scheduleType'], timeframe: { startDate: start, endDate: end } });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h3
          className="text-2xl font-bold text-[#111111] mb-2"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          Wann sollen die Posts erscheinen?
        </h3>
        <p className="text-[#7A7A7A] leading-relaxed">
          Vektrus verteilt die Posts optimal über den Zeitraum.
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#111111] mb-3">Zeitraum</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {scheduleOptions.map(opt => (
            <button
              key={opt.id}
              onClick={() => setScheduleType(opt.id)}
              className={`py-3 px-4 rounded-[var(--vektrus-radius-lg)] border-2 text-sm font-medium transition-all duration-300 border-gradient-ai ${
                data.scheduleType === opt.id
                  ? 'ai-active bg-[rgba(124,108,242,0.04)] text-[#111111] border-transparent'
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

      <div className="bg-gradient-to-r from-[#F4FCFE] to-white rounded-[var(--vektrus-radius-md)] p-4 border border-[#B6EBF7]/40">
        <p className="text-xs text-[#7A7A7A]">
          Die Posting-Zeiten werden automatisch pro Plattform optimiert. Du kannst sie danach im Kalender anpassen.
        </p>
      </div>
    </div>
  );
};

export default VisualStep3Schedule;
