import React, { useState } from 'react';
import { Pen } from 'lucide-react';
import { BrandTonality } from '../types';

interface TonalitySectionProps {
  tonality: BrandTonality;
  onSave: (tonality: BrandTonality) => Promise<void>;
}

const FORMALITY_OPTIONS = ['casual', 'semi-formal', 'professional', 'formal'];
const LANGUAGE_MIX_OPTIONS = ['pure_german', 'german_with_english', 'bilingual'];
const ADDRESSING_OPTIONS = ['Du', 'Sie', 'Neutral'];

const FORMALITY_LABELS: Record<string, string> = {
  casual: 'Locker',
  'semi-formal': 'Semi-formal',
  professional: 'Professionell',
  formal: 'Formal',
};

const LANGUAGE_LABELS: Record<string, string> = {
  pure_german: 'Reines Deutsch',
  german_with_english: 'Deutsch mit Anglizismen',
  bilingual: 'Zweisprachig',
};

const TonalitySection: React.FC<TonalitySectionProps> = ({ tonality, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<BrandTonality>(tonality);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(draft);
    setSaving(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(tonality);
    setIsEditing(false);
  };

  const chips = [
    { label: 'Ansprache', value: tonality.addressing },
    { label: 'Formalität', value: FORMALITY_LABELS[tonality.formality || ''] || tonality.formality },
    { label: 'Sprachmix', value: LANGUAGE_LABELS[tonality.language_mix || ''] || tonality.language_mix },
    { label: 'Headline-Stil', value: tonality.headline_style },
    { label: 'Emotionaler Ton', value: tonality.emotional_tone },
  ].filter((c) => c.value);

  if (chips.length === 0 && !tonality.description) return null;

  return (
    <div className="rounded-2xl bg-white border border-[rgba(73,183,227,0.18)] p-6" style={{ boxShadow: '0px 4px 18px rgba(17,17,17,0.06)' }}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-[#111111]">Tonalität & Sprache</h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 text-xs text-[#49B7E3] hover:text-[#2E9FD0] transition-colors"
          >
            <Pen className="w-3.5 h-3.5" />
            Bearbeiten
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[#7A7A7A] block mb-1.5">Ansprache</label>
            <div className="flex gap-4">
              {ADDRESSING_OPTIONS.map((opt) => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${
                      draft.addressing === opt ? 'border-[#49B7E3] bg-[#49B7E3]' : 'border-[rgba(73,183,227,0.4)]'
                    }`}
                    onClick={() => setDraft((p) => ({ ...p, addressing: opt }))}
                  >
                    {draft.addressing === opt && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm text-[#111111]" onClick={() => setDraft((p) => ({ ...p, addressing: opt }))}>{opt}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#7A7A7A] block mb-1">Formalität</label>
              <select
                value={draft.formality || ''}
                onChange={(e) => setDraft((p) => ({ ...p, formality: e.target.value }))}
                className="w-full h-10 px-3 rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.25)] text-sm text-[#111111] focus:outline-none focus:border-[#49B7E3] bg-white"
              >
                <option value="">Wählen...</option>
                {FORMALITY_OPTIONS.map((o) => (
                  <option key={o} value={o}>{FORMALITY_LABELS[o]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[#7A7A7A] block mb-1">Sprachmix</label>
              <select
                value={draft.language_mix || ''}
                onChange={(e) => setDraft((p) => ({ ...p, language_mix: e.target.value }))}
                className="w-full h-10 px-3 rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.25)] text-sm text-[#111111] focus:outline-none focus:border-[#49B7E3] bg-white"
              >
                <option value="">Wählen...</option>
                {LANGUAGE_MIX_OPTIONS.map((o) => (
                  <option key={o} value={o}>{LANGUAGE_LABELS[o]}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[#7A7A7A] block mb-1">Headline-Stil</label>
            <input
              type="text"
              value={draft.headline_style || ''}
              onChange={(e) => setDraft((p) => ({ ...p, headline_style: e.target.value }))}
              placeholder="z.B. Provokant / Call-to-Action"
              className="w-full h-10 px-3 rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.25)] text-sm text-[#111111] placeholder-[#7A7A7A] focus:outline-none focus:border-[#49B7E3] transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[#7A7A7A] block mb-1">Emotionaler Ton</label>
            <input
              type="text"
              value={draft.emotional_tone || ''}
              onChange={(e) => setDraft((p) => ({ ...p, emotional_tone: e.target.value }))}
              placeholder="z.B. Energisch, motivierend"
              className="w-full h-10 px-3 rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.25)] text-sm text-[#111111] placeholder-[#7A7A7A] focus:outline-none focus:border-[#49B7E3] transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[#7A7A7A] block mb-1">Beschreibung</label>
            <textarea
              value={draft.description || ''}
              onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.25)] text-sm text-[#111111] focus:outline-none focus:border-[#49B7E3] transition-all resize-none"
            />
          </div>
          <div className="flex items-center gap-3 pt-2 border-t border-[rgba(73,183,227,0.18)]">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-[var(--vektrus-radius-md)] bg-[#49B7E3] text-white text-sm font-semibold hover:bg-[#2E9FD0] transition-colors disabled:opacity-50"
            >
              {saving ? 'Speichern...' : 'Speichern'}
            </button>
            <button onClick={handleCancel} className="text-sm text-[#7A7A7A] hover:text-[#111111] transition-colors">
              Abbrechen
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-3 mb-4">
            {chips.map(({ label, value }) => (
              <div
                key={label}
                className="px-4 py-2.5 rounded-[var(--vektrus-radius-md)] bg-[#F4FCFE] border border-[rgba(73,183,227,0.18)]"
              >
                <p className="text-xs text-[#7A7A7A] mb-0.5">{label}</p>
                <p className="text-sm font-medium text-[#111111]">{value}</p>
              </div>
            ))}
          </div>
          {tonality.description && (
            <p className="text-sm text-[#7A7A7A] italic leading-relaxed">{tonality.description}</p>
          )}
        </>
      )}
    </div>
  );
};

export default TonalitySection;
