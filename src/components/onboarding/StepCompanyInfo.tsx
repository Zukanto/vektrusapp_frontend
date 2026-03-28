import React, { useState, useRef, useEffect } from 'react';
import { Building2, Lock, ChevronDown, Check, ArrowRight, Loader2 } from 'lucide-react';
import { OnboardingFormData } from '../../hooks/useOnboarding';

interface StepCompanyInfoProps {
  formData: OnboardingFormData;
  updateField: <K extends keyof OnboardingFormData>(field: K, value: OnboardingFormData[K]) => void;
  userEmail: string;
  onNext: () => void;
  saving: boolean;
}

const INDUSTRY_OPTIONS = [
  'Handwerk & Bau',
  'Gastronomie & Hotellerie',
  'Einzelhandel & E-Commerce',
  'Gesundheit & Fitness',
  'IT & Software',
  'Beratung & Coaching',
  'Immobilien',
  'Recht & Finanzen',
  'Bildung & Training',
  'Agentur & Marketing',
  'Industrie & Fertigung',
  'Sport & Events',
  'Non-Profit & Vereine',
  'Sonstige',
];

const inputBase =
  'w-full h-12 rounded-xl border border-[rgba(73,183,227,0.15)] bg-white px-4 text-[14px] text-[var(--vektrus-anthrazit)] placeholder:text-[var(--vektrus-gray)]/60 transition-all duration-150 focus:border-[var(--vektrus-blue)] focus:ring-2 focus:ring-[var(--vektrus-blue)]/15 focus:outline-none';

// ── Custom dropdown ────────────────────────────────────────────────────

function IndustryDropdown({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`${inputBase} flex items-center justify-between text-left ${!value ? 'text-[var(--vektrus-gray)]/60' : ''} ${open ? 'border-[var(--vektrus-blue)] ring-2 ring-[var(--vektrus-blue)]/15' : ''}`}
      >
        <span className="truncate">{value || 'Branche auswählen…'}</span>
        <ChevronDown className={`w-4 h-4 text-[var(--vektrus-gray)] transition-transform duration-200 shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-white rounded-xl border border-[rgba(73,183,227,0.15)] shadow-[0_8px_32px_rgba(73,183,227,0.12)] max-h-[240px] overflow-y-auto py-1">
          {INDUSTRY_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-[14px] text-left transition-colors hover:bg-[rgba(73,183,227,0.06)] ${value === opt ? 'text-[var(--vektrus-blue)] font-medium bg-[rgba(73,183,227,0.04)]' : 'text-[var(--vektrus-anthrazit)]'}`}
            >
              <span>{opt}</span>
              {value === opt && <Check className="w-4 h-4 text-[var(--vektrus-blue)] shrink-0" />}
            </button>
          ))}
        </div>
      )}

      {error && <p className="text-[var(--vektrus-error)] text-[13px] mt-1.5">{error}</p>}
    </div>
  );
}

// ── Label component ────────────────────────────────────────────────────

function FieldLabel({ children, required, optional }: { children: React.ReactNode; required?: boolean; optional?: boolean }) {
  return (
    <label className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--vektrus-anthrazit)] mb-2">
      {required && <span className="w-1.5 h-1.5 rounded-full bg-[var(--vektrus-blue)] shrink-0" />}
      {children}
      {optional && <span className="text-[var(--vektrus-gray)] font-normal">(optional)</span>}
    </label>
  );
}

// ── Main component ─────────────────────────────────────────────────────

const StepCompanyInfo: React.FC<StepCompanyInfoProps> = ({
  formData,
  updateField,
  userEmail,
  onNext,
  saving,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'Vorname ist erforderlich';
    if (!formData.lastName.trim()) newErrors.lastName = 'Nachname ist erforderlich';
    if (!formData.companyName.trim()) newErrors.companyName = 'Unternehmensname ist erforderlich';
    if (!formData.industry) newErrors.industry = 'Bitte wähle eine Branche';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[rgba(73,183,227,0.10)] mb-4">
          <Building2 className="w-6 h-6 text-[var(--vektrus-blue)]" />
        </div>
        <p className="text-xs text-[var(--vektrus-gray)] uppercase tracking-wider font-medium mb-1.5">
          Schritt 1 von 4
        </p>
        <h2 className="font-manrope text-[26px] font-bold text-[var(--vektrus-anthrazit)] leading-tight">
          Erzähl uns von deinem Unternehmen
        </h2>
        <p className="mt-2 text-[15px] text-[var(--vektrus-gray)] max-w-md mx-auto">
          Damit Vektrus deine Inhalte optimal auf dein Unternehmen zuschneiden kann.
        </p>
      </div>

      <div className="border-t border-[rgba(73,183,227,0.08)] pt-6" />

      {/* Name row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel required>Vorname</FieldLabel>
          <input
            type="text"
            className={inputBase}
            value={formData.firstName}
            onChange={(e) => updateField('firstName', e.target.value)}
            placeholder="Max"
          />
          {errors.firstName && <p className="text-[var(--vektrus-error)] text-[13px] mt-1.5">{errors.firstName}</p>}
        </div>
        <div>
          <FieldLabel required>Nachname</FieldLabel>
          <input
            type="text"
            className={inputBase}
            value={formData.lastName}
            onChange={(e) => updateField('lastName', e.target.value)}
            placeholder="Mustermann"
          />
          {errors.lastName && <p className="text-[var(--vektrus-error)] text-[13px] mt-1.5">{errors.lastName}</p>}
        </div>
      </div>

      {/* Email (read-only) */}
      <div>
        <FieldLabel>E-Mail</FieldLabel>
        <div className="relative">
          <input
            type="email"
            className={`${inputBase} bg-[rgba(73,183,227,0.03)] text-[var(--vektrus-gray)] cursor-not-allowed pr-10`}
            value={userEmail}
            disabled
          />
          <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--vektrus-gray)]/40" />
        </div>
      </div>

      {/* Company name */}
      <div>
        <FieldLabel required>Unternehmensname</FieldLabel>
        <input
          type="text"
          className={inputBase}
          value={formData.companyName}
          onChange={(e) => updateField('companyName', e.target.value)}
          placeholder="Mein Unternehmen GmbH"
        />
        {errors.companyName && <p className="text-[var(--vektrus-error)] text-[13px] mt-1.5">{errors.companyName}</p>}
      </div>

      {/* Industry — custom dropdown */}
      <div>
        <FieldLabel required>Branche</FieldLabel>
        <IndustryDropdown
          value={formData.industry}
          onChange={(v) => updateField('industry', v)}
          error={errors.industry}
        />
      </div>

      {/* Website */}
      <div>
        <FieldLabel optional>Website</FieldLabel>
        <input
          type="url"
          className={inputBase}
          value={formData.website}
          onChange={(e) => updateField('website', e.target.value)}
          placeholder="https://www.beispiel.de"
        />
      </div>

      {/* Next button */}
      <div className="flex justify-end pt-2">
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

export default StepCompanyInfo;
