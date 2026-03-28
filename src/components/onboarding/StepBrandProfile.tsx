import React, { useState, useRef, useMemo } from 'react';
import {
  Sparkles, Users, Heart, MessageSquare, Megaphone, Shield,
  Briefcase, MessageCircle, Zap, X, Check,
  ArrowRight, ArrowLeft, Loader2,
} from 'lucide-react';
import { OnboardingFormData } from '../../hooks/useOnboarding';

interface StepBrandProfileProps {
  formData: OnboardingFormData;
  updateField: <K extends keyof OnboardingFormData>(field: K, value: OnboardingFormData[K]) => void;
  onNext: () => void;
  onBack: () => void;
  saving: boolean;
}

// ── Shared styles ──────────────────────────────────────────────────────

const inputBase =
  'w-full h-12 rounded-xl border border-[rgba(73,183,227,0.15)] bg-white px-4 text-[14px] text-[var(--vektrus-anthrazit)] placeholder:text-[var(--vektrus-gray)]/60 transition-all duration-150 focus:border-[var(--vektrus-blue)] focus:ring-2 focus:ring-[var(--vektrus-blue)]/15 focus:outline-none';

// ── Section header ─────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, description }: { icon: React.FC<any>; title: string; description?: string }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-[var(--vektrus-blue)]" />
        <h3 className="text-[13px] font-semibold text-[var(--vektrus-anthrazit)] uppercase tracking-wide">
          {title}
        </h3>
      </div>
      {description && (
        <p className="text-[14px] text-[var(--vektrus-gray)] ml-6">{description}</p>
      )}
    </div>
  );
}

// ── Brand voice cards ──────────────────────────────────────────────────

const BRAND_VOICES: Array<{
  value: OnboardingFormData['brandVoice'];
  label: string;
  description: string;
  icon: React.FC<any>;
}> = [
  { value: 'professional', label: 'Professionell', description: 'Seriös und kompetent', icon: Briefcase },
  { value: 'friendly', label: 'Locker & nahbar', description: 'Freundlich und herzlich', icon: MessageCircle },
  { value: 'bold', label: 'Humorvoll & frech', description: 'Mutig und unterhaltsam', icon: Zap },
];

// ── Emoji options ──────────────────────────────────────────────────────

const EMOJI_OPTIONS: Array<{ value: OnboardingFormData['emojiUsage']; label: string }> = [
  { value: 'none', label: 'Gar nicht' },
  { value: 'subtle', label: 'Dezent' },
  { value: 'balanced', label: 'Ausgewogen' },
  { value: 'many', label: 'Viele' },
];

// ── Tag input ──────────────────────────────────────────────────────────

function TagInput({
  tags,
  onChange,
  placeholder,
  max,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder: string;
  max?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [focused, setFocused] = useState(false);

  const addTag = (raw: string) => {
    const tag = raw.trim();
    if (!tag || tags.includes(tag)) return;
    if (max && tags.length >= max) return;
    onChange([...tags, tag]);
    setInputValue('');
  };

  const removeTag = (index: number) => onChange(tags.filter((_, i) => i !== index));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    }
    if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const atMax = max !== undefined && tags.length >= max;

  return (
    <div
      className={`
        flex flex-wrap gap-2 min-h-[48px] rounded-xl px-3 py-2.5 cursor-text transition-all duration-150
        ${focused
          ? 'border-2 border-[var(--vektrus-blue)] ring-2 ring-[var(--vektrus-blue)]/15 bg-white'
          : tags.length === 0
            ? 'border-2 border-dashed border-[rgba(73,183,227,0.20)] bg-[rgba(73,183,227,0.02)]'
            : 'border border-[rgba(73,183,227,0.15)] bg-white'
        }
      `}
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map((tag, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(73,183,227,0.10)] text-[var(--vektrus-blue)] px-3 py-1 text-[13px] font-medium"
        >
          {tag}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); removeTag(i); }}
            className="rounded-full p-0.5 hover:bg-[rgba(73,183,227,0.20)] transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      {!atMax && (
        <input
          ref={inputRef}
          type="text"
          className="flex-1 min-w-[120px] border-none p-0 text-[14px] text-[var(--vektrus-anthrazit)] placeholder:text-[var(--vektrus-gray)]/60 focus:outline-none focus:ring-0 bg-transparent"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => { addTag(inputValue); setFocused(false); }}
          placeholder={tags.length === 0 ? placeholder : 'Eingabe + Enter'}
        />
      )}
    </div>
  );
}

// ── Custom slider ──────────────────────────────────────────────────────

function PremiumSlider({
  value,
  onChange,
  label,
  leftLabel,
  rightLabel,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  leftLabel: string;
  rightLabel: string;
}) {
  const fillPercent = useMemo(() => ((value - 1) / 9) * 100, [value]);

  return (
    <div>
      <label className="block text-[13px] font-medium text-[var(--vektrus-anthrazit)] mb-3">{label}</label>
      <div className="space-y-2">
        <div className="relative">
          <div className="h-2 rounded-full bg-[rgba(73,183,227,0.12)] relative">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-[var(--vektrus-blue)] transition-all duration-100"
              style={{ width: `${fillPercent}%` }}
            />
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
          />
          {/* Thumb indicator */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none"
            style={{ left: `${fillPercent}%` }}
          >
            <div className="w-5 h-5 rounded-full bg-[var(--vektrus-blue)] border-2 border-white shadow-[0_2px_8px_rgba(73,183,227,0.35)]" />
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[var(--vektrus-blue)] text-white text-[11px] font-bold rounded-md px-1.5 py-0.5 min-w-[22px] text-center">
              {value}
            </div>
          </div>
        </div>
        <div className="flex justify-between">
          <span className="text-[12px] text-[var(--vektrus-gray)]">{leftLabel}</span>
          <span className="text-[12px] text-[var(--vektrus-gray)]">{rightLabel}</span>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────

const StepBrandProfile: React.FC<StepBrandProfileProps> = ({
  formData,
  updateField,
  onNext,
  onBack,
  saving,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.targetAudience.trim() || formData.targetAudience.trim().length < 20) {
      newErrors.targetAudience = 'Bitte beschreibe deine Zielgruppe in mindestens 20 Zeichen';
    }
    if (!formData.brandVoice) {
      newErrors.brandVoice = 'Bitte wähle eine Markenpersönlichkeit';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  const updateKeyMessage = (index: number, value: string) => {
    const updated = [...formData.keyMessages] as [string, string, string];
    updated[index] = value;
    updateField('keyMessages', updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[rgba(73,183,227,0.10)] mb-4">
          <Sparkles className="w-6 h-6 text-[var(--vektrus-blue)]" />
        </div>
        <p className="text-xs text-[var(--vektrus-gray)] uppercase tracking-wider font-medium mb-1.5">
          Schritt 2 von 4
        </p>
        <h2 className="font-manrope text-[26px] font-bold text-[var(--vektrus-anthrazit)] leading-tight">
          Dein Markenprofil
        </h2>
        <p className="mt-2 text-[15px] text-[var(--vektrus-gray)] max-w-md mx-auto">
          Diese Angaben helfen der KI, Inhalte zu erstellen, die wirklich zu dir passen.
        </p>
      </div>

      <div className="border-t border-[rgba(73,183,227,0.08)] pt-6" />

      {/* ── Sektion A: Zielgruppe ─────────────────────────────────── */}
      <section>
        <SectionHeader icon={Users} title="Deine Zielgruppe" />
        <label className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--vektrus-anthrazit)] mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--vektrus-blue)] shrink-0" />
          Wer ist deine Wunschzielgruppe?
        </label>
        <textarea
          className={`w-full rounded-xl border border-[rgba(73,183,227,0.15)] bg-white px-4 py-3 text-[14px] text-[var(--vektrus-anthrazit)] placeholder:text-[var(--vektrus-gray)]/60 transition-all duration-150 focus:border-[var(--vektrus-blue)] focus:ring-2 focus:ring-[var(--vektrus-blue)]/15 focus:outline-none min-h-[90px] resize-y`}
          value={formData.targetAudience}
          onChange={(e) => updateField('targetAudience', e.target.value)}
          placeholder="Beschreibe in 2–3 Sätzen, wer bei dir kauft und welches konkrete Problem du für diese Menschen löst."
        />
        {errors.targetAudience && (
          <p className="text-[var(--vektrus-error)] text-[13px] mt-1.5">{errors.targetAudience}</p>
        )}
      </section>

      <div className="border-t border-[rgba(73,183,227,0.08)]" />

      {/* ── Sektion B: Markenpersönlichkeit ────────────────────────── */}
      <section>
        <SectionHeader
          icon={Heart}
          title="Deine Markenpersönlichkeit"
          description="Wenn deine Marke eine Person auf einer Netzwerkveranstaltung wäre – wie würde sie auftreten?"
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {BRAND_VOICES.map((voice) => {
            const isSelected = formData.brandVoice === voice.value;
            const VoiceIcon = voice.icon;
            return (
              <button
                key={voice.value}
                type="button"
                onClick={() => updateField('brandVoice', voice.value)}
                className={`
                  relative rounded-2xl border-2 p-5 text-left transition-all duration-200
                  ${isSelected
                    ? 'border-[var(--vektrus-blue)] bg-[rgba(73,183,227,0.04)] shadow-[0_4px_16px_rgba(73,183,227,0.10)]'
                    : 'border-transparent bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:border-[rgba(73,183,227,0.25)] hover:shadow-md hover:-translate-y-0.5'
                  }
                `}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[var(--vektrus-blue)] flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className="w-11 h-11 rounded-full bg-[rgba(73,183,227,0.10)] flex items-center justify-center mb-3">
                  <VoiceIcon className="w-5 h-5 text-[var(--vektrus-blue)]" />
                </div>
                <p className="font-manrope font-semibold text-[15px] text-[var(--vektrus-anthrazit)]">
                  {voice.label}
                </p>
                <p className="text-[13px] text-[var(--vektrus-gray)] mt-0.5">{voice.description}</p>
              </button>
            );
          })}
        </div>
        {errors.brandVoice && (
          <p className="text-[var(--vektrus-error)] text-[13px] mt-1.5">{errors.brandVoice}</p>
        )}
      </section>

      <div className="border-t border-[rgba(73,183,227,0.08)]" />

      {/* ── Sektion C: Kernbotschaften ────────────────────────────── */}
      <section>
        <SectionHeader
          icon={MessageSquare}
          title="Deine Kernbotschaften"
          description="Was sind die 3 wichtigsten Botschaften, die deine Kunden immer wieder über dich lesen sollen?"
        />
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[rgba(73,183,227,0.12)] flex items-center justify-center shrink-0">
                <span className="text-[13px] font-semibold text-[var(--vektrus-blue)]">{i + 1}</span>
              </div>
              <input
                type="text"
                className={inputBase}
                value={formData.keyMessages[i]}
                onChange={(e) => updateKeyMessage(i, e.target.value)}
                placeholder={
                  i === 0
                    ? 'z.B. Lokale Produktion in Deutschland'
                    : i === 1
                      ? 'z.B. Antwort innerhalb von 24 Stunden'
                      : 'z.B. Kein Vertrag, jederzeit kündbar'
                }
              />
            </div>
          ))}
        </div>
      </section>

      <div className="border-t border-[rgba(73,183,227,0.08)]" />

      {/* ── Sektion D: Kommunikations-Stil ────────────────────────── */}
      <section>
        <SectionHeader icon={Megaphone} title="Dein Kommunikations-Stil" />

        <div className="space-y-8">
          <PremiumSlider
            label="Wie formell sollen deine Posts geschrieben sein?"
            value={formData.formality}
            onChange={(v) => updateField('formality', v)}
            leftLabel="Sehr kumpelhaft"
            rightLabel="Hochoffiziell"
          />

          <PremiumSlider
            label="Wie kreativ dürfen die Inhalte sein?"
            value={formData.creativity}
            onChange={(v) => updateField('creativity', v)}
            leftLabel="Sehr sachlich & faktenbasiert"
            rightLabel="Sehr kreativ & storytelling-fokussiert"
          />

          {/* Emoji Segment Control */}
          <div>
            <label className="block text-[13px] font-medium text-[var(--vektrus-anthrazit)] mb-3">
              Wie sollen Emojis eingesetzt werden?
            </label>
            <div className="inline-flex rounded-xl overflow-hidden border border-[rgba(73,183,227,0.20)]">
              {EMOJI_OPTIONS.map((opt, idx) => {
                const isSelected = formData.emojiUsage === opt.value;
                const isFirst = idx === 0;
                const isLast = idx === EMOJI_OPTIONS.length - 1;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateField('emojiUsage', opt.value)}
                    className={`
                      px-4 py-2.5 text-[13px] font-medium transition-all duration-150
                      ${isFirst ? '' : 'border-l border-[rgba(73,183,227,0.20)]'}
                      ${isSelected
                        ? 'bg-[var(--vektrus-blue)] text-white'
                        : 'bg-[rgba(73,183,227,0.03)] text-[var(--vektrus-gray)] hover:bg-[rgba(73,183,227,0.08)]'
                      }
                    `}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="border-t border-[rgba(73,183,227,0.08)]" />

      {/* ── Sektion E: Leitplanken & Markt ────────────────────────── */}
      <section>
        <SectionHeader icon={Shield} title="Leitplanken & Markt" />

        <div className="space-y-5">
          <div>
            <label className="block text-[13px] font-medium text-[var(--vektrus-anthrazit)] mb-2">
              Gibt es Wörter, Phrasen oder Themen, die wir nie verwenden sollen?
            </label>
            <TagInput
              tags={formData.noGoRules}
              onChange={(tags) => updateField('noGoRules', tags)}
              placeholder="z.B. bestimmter Branchen-Slang, Konkurrenten-Namen – Enter drücken"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[var(--vektrus-anthrazit)] mb-2">
              Wer sind deine 2–3 wichtigsten Mitbewerber auf Social Media?
            </label>
            <TagInput
              tags={formData.competitors}
              onChange={(tags) => updateField('competitors', tags)}
              placeholder="Mitbewerber eingeben – Enter drücken"
              max={3}
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[var(--vektrus-anthrazit)] mb-2">
              Was ist die wichtigste Handlung, die Follower nach einem Post ausführen sollen?
            </label>
            <input
              type="text"
              className={inputBase}
              value={formData.callToAction}
              onChange={(e) => updateField('callToAction', e.target.value)}
              placeholder="z.B. Link anklicken, DM schreiben, Kommentieren"
            />
          </div>
        </div>
      </section>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-2">
        <button
          onClick={onBack}
          disabled={saving}
          className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--vektrus-gray)] hover:text-[var(--vektrus-anthrazit)] transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück
        </button>
        <button
          onClick={handleNext}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-[var(--vektrus-blue)] text-white rounded-xl px-6 py-2.5 text-[14px] font-semibold hover:bg-[#3a9fd1] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_2px_8px_rgba(73,183,227,0.2)] hover:shadow-[0_4px_16px_rgba(73,183,227,0.25)]"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Wird gespeichert…
            </>
          ) : (
            <>
              Weiter
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default StepBrandProfile;
