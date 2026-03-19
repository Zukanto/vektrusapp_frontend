import React from 'react';
import { CheckCircle2, AlertTriangle, Circle } from 'lucide-react';
import { BrandProfile } from '../types';

interface ConfidenceCheckItem {
  status: 'done' | 'warning' | 'todo';
  text: string;
  action?: string;
}

const getConfidenceLevel = (confidence: string | number | undefined): 'low' | 'medium' | 'high' => {
  if (confidence === undefined || confidence === null) return 'medium';
  if (typeof confidence === 'string') {
    const normalized = confidence.toLowerCase().trim();
    if (['low', 'niedrig'].includes(normalized)) return 'low';
    if (['high', 'hoch'].includes(normalized)) return 'high';
    return 'medium';
  }
  if (typeof confidence === 'number') {
    if (confidence < 0.4) return 'low';
    if (confidence >= 0.7) return 'high';
    return 'medium';
  }
  return 'medium';
};

const getConfidencePercent = (confidenceRaw: number | undefined, level: 'low' | 'medium' | 'high'): number => {
  if (typeof confidenceRaw === 'number') return Math.round(confidenceRaw * 100);
  if (level === 'low') return 25;
  if (level === 'high') return 85;
  return 55;
};

const getConfidenceChecklist = (
  profile: BrandProfile,
  level: 'low' | 'medium' | 'high'
): ConfidenceCheckItem[] => {
  const items: ConfidenceCheckItem[] = [];
  const designCount = profile.reference_images?.length || 0;

  if (designCount >= 5) {
    items.push({ status: 'done', text: `${designCount} Designs hochgeladen — sehr gut!` });
  } else if (designCount >= 3) {
    items.push({ status: 'done', text: `${designCount} Designs hochgeladen` });
    items.push({
      status: 'warning',
      text: `Lade ${5 - designCount} weitere Design${5 - designCount === 1 ? '' : 's'} hoch für bessere Ergebnisse`,
      action: 'add_designs',
    });
  } else if (designCount >= 1) {
    items.push({
      status: 'warning',
      text: `Nur ${designCount} Design${designCount === 1 ? '' : 's'} — lade mindestens ${3 - designCount} weitere hoch`,
      action: 'add_designs',
    });
  } else {
    items.push({
      status: 'todo',
      text: 'Lade mindestens 3 bestehende Social Media Posts hoch',
      action: 'add_designs',
    });
  }

  if (profile.logo_url) {
    items.push({ status: 'done', text: 'Logo vorhanden' });
  } else {
    items.push({
      status: 'todo',
      text: 'Logo hochladen für präzisere Farberkennung',
      action: 'add_logo',
    });
  }

  const colorsManuallyEdited = (profile as any).colors_edited === true;
  if (colorsManuallyEdited) {
    items.push({ status: 'done', text: 'Farbpalette manuell bestätigt' });
  } else {
    items.push({
      status: 'todo',
      text: 'Farbpalette prüfen und bestätigen (optional)',
      action: 'edit_colors',
    });
  }

  if (designCount >= 3 && level === 'low') {
    items.push({
      status: 'warning',
      text: 'Deine Designs haben sehr unterschiedliche Stile — lade Designs mit einheitlichem Look hoch',
      action: 'add_designs',
    });
  }

  return items;
};

const levelConfig = {
  low: {
    label: 'Niedrig',
    color: '#FA7E70',
    borderAccent: '#FA7E70',
    bg: 'rgba(250,126,112,0.04)',
  },
  medium: {
    label: 'Mittel',
    color: '#F4BE9D',
    borderAccent: '#F4BE9D',
    bg: 'rgba(244,190,157,0.04)',
  },
  high: {
    label: 'Hoch',
    color: '#49D69E',
    borderAccent: '#49D69E',
    bg: 'rgba(73,214,158,0.04)',
  },
};

const handleAction = (action: string) => {
  switch (action) {
    case 'add_designs':
      document.getElementById('btn-reanalyze')?.scrollIntoView({ behavior: 'smooth' });
      break;
    case 'add_logo':
      document.getElementById('section-logo')?.scrollIntoView({ behavior: 'smooth' });
      break;
    case 'edit_colors':
      document.getElementById('section-colors')?.scrollIntoView({ behavior: 'smooth' });
      break;
  }
};

interface ConfidenceSectionProps {
  profile: BrandProfile;
}

const StatusIcon: React.FC<{ status: ConfidenceCheckItem['status'] }> = ({ status }) => {
  if (status === 'done') {
    return <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#49D69E' }} />;
  }
  if (status === 'warning') {
    return <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: '#F4BE9D' }} />;
  }
  return <Circle className="w-4 h-4 flex-shrink-0" style={{ color: '#7A7A7A' }} />;
};

const ConfidenceSection: React.FC<ConfidenceSectionProps> = ({ profile }) => {
  const rawConfidence = profile.confidence?.overall;
  const level = getConfidenceLevel(rawConfidence);
  const percent = getConfidencePercent(rawConfidence, level);
  const config = levelConfig[level];
  const checklist = getConfidenceChecklist(profile, level);

  return (
    <div
      className="rounded-[var(--vektrus-radius-md)] overflow-hidden"
      style={{
        background: '#FFFFFF',
        border: '1px solid #E8E8E8',
        borderLeft: `3px solid ${config.borderAccent}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <div className="p-6">
        <h3
          className="mb-4"
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontWeight: 600,
            fontSize: '18px',
            color: '#111111',
            lineHeight: '1.2',
          }}
        >
          Analyse-Qualität
        </h3>

        <div className="flex items-center gap-3 mb-1">
          <div
            className="flex-1 h-2 rounded-full overflow-hidden"
            style={{ background: 'rgba(0,0,0,0.06)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${percent}%`, background: config.color }}
            />
          </div>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              color: config.color,
              whiteSpace: 'nowrap',
            }}
          >
            {percent}% — {config.label}
          </span>
        </div>

        {level === 'high' ? (
          <div
            className="mt-4 flex items-start gap-2"
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#49D69E' }} />
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: '14px',
                color: '#111111',
                lineHeight: '1.5',
              }}
            >
              Dein Brand Profile ist gut ausgefüllt. Vektrus kennt deinen Stil und erstellt Posts in deinem Look.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-5 mb-3">
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '12px',
                  color: '#7A7A7A',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                So verbesserst du die Erkennung
              </span>
              <div
                className="mt-1.5"
                style={{ height: '1px', background: 'rgba(0,0,0,0.06)' }}
              />
            </div>

            <ul className="space-y-2.5">
              {checklist.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-0.5">
                    <StatusIcon status={item.status} />
                  </span>
                  {item.action ? (
                    <button
                      onClick={() => handleAction(item.action!)}
                      className="text-left transition-opacity hover:opacity-70"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: item.status === 'done' ? 400 : 500,
                        fontSize: '14px',
                        color: item.status === 'done' ? '#111111' : item.status === 'warning' ? '#111111' : '#111111',
                        lineHeight: '1.5',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        textDecoration: item.status !== 'done' ? 'underline' : 'none',
                        textDecorationColor: 'rgba(0,0,0,0.2)',
                        textUnderlineOffset: '2px',
                      }}
                    >
                      {item.text}
                    </button>
                  ) : (
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 400,
                        fontSize: '14px',
                        color: '#111111',
                        lineHeight: '1.5',
                      }}
                    >
                      {item.text}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default ConfidenceSection;
