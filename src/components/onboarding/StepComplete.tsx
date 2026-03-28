import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Building2, Briefcase, Share2, Info, Loader2 } from 'lucide-react';
import { SocialAccountService, type LateAccount } from '../../services/socialAccountService';
import type { OnboardingFormData } from '../../hooks/useOnboarding';

interface StepCompleteProps {
  formData: OnboardingFormData;
  onComplete: () => Promise<boolean>;
  saving: boolean;
}

const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok',
  twitter: 'X (Twitter)',
};

const StepComplete: React.FC<StepCompleteProps> = ({ formData, onComplete, saving }) => {
  const [connectedAccounts, setConnectedAccounts] = useState<LateAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  useEffect(() => {
    SocialAccountService.getConnectedAccounts()
      .then(setConnectedAccounts)
      .catch(() => {})
      .finally(() => setLoadingAccounts(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header with animated check */}
      <div className="text-center mb-2">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--vektrus-success)] mb-5 shadow-[0_8px_32px_rgba(73,214,158,0.25)]"
        >
          <Check className="w-10 h-10 text-white" strokeWidth={2.5} />
        </motion.div>

        <h2 className="font-manrope text-[32px] font-bold text-[var(--vektrus-anthrazit)] leading-tight">
          Alles bereit!
        </h2>
        <p className="mt-2 text-[15px] text-[var(--vektrus-gray)] max-w-md mx-auto">
          Vektrus ist jetzt auf dein Unternehmen eingestellt und bereit, loszulegen.
        </p>
      </div>

      {/* Summary card */}
      <div className="rounded-xl bg-[var(--vektrus-mint)] p-5 space-y-4">
        {/* Company */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[rgba(73,183,227,0.10)] flex items-center justify-center shrink-0">
            <Building2 className="w-[18px] h-[18px] text-[var(--vektrus-blue)]" />
          </div>
          <div>
            <p className="text-[12px] text-[var(--vektrus-gray)]">Unternehmen</p>
            <p className="text-[14px] font-medium text-[var(--vektrus-anthrazit)]">
              {formData.companyName}
            </p>
          </div>
        </div>

        {/* Industry */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[rgba(73,183,227,0.10)] flex items-center justify-center shrink-0">
            <Briefcase className="w-[18px] h-[18px] text-[var(--vektrus-blue)]" />
          </div>
          <div>
            <p className="text-[12px] text-[var(--vektrus-gray)]">Branche</p>
            <p className="text-[14px] font-medium text-[var(--vektrus-anthrazit)]">
              {formData.industry}
            </p>
          </div>
        </div>

        {/* Connected platforms */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-[rgba(73,183,227,0.10)] flex items-center justify-center shrink-0">
            <Share2 className="w-[18px] h-[18px] text-[var(--vektrus-blue)]" />
          </div>
          <div>
            <p className="text-[12px] text-[var(--vektrus-gray)] mb-1.5">Verbundene Plattformen</p>
            {loadingAccounts ? (
              <Loader2 className="w-4 h-4 text-[var(--vektrus-gray)] animate-spin" />
            ) : connectedAccounts.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {connectedAccounts.map((account) => (
                  <span
                    key={account.id}
                    className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[12px] font-medium text-[var(--vektrus-anthrazit)] border border-[rgba(73,183,227,0.12)] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                  >
                    <Check className="w-3 h-3 text-[var(--vektrus-success)]" />
                    {PLATFORM_LABELS[account.platform] || account.platform}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-[var(--vektrus-gray)]">
                Noch keine Konten verbunden
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Info boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex items-start gap-3 rounded-xl bg-[rgba(73,183,227,0.05)] p-4">
          <Info className="w-4 h-4 text-[var(--vektrus-blue)] shrink-0 mt-0.5" />
          <p className="text-[13px] text-[var(--vektrus-gray)] leading-relaxed">
            Deine Analytics-Daten werden innerhalb von 24 Stunden verfügbar sein.
          </p>
        </div>
        <div className="flex items-start gap-3 rounded-xl bg-[rgba(73,183,227,0.05)] p-4">
          <Info className="w-4 h-4 text-[var(--vektrus-blue)] shrink-0 mt-0.5" />
          <p className="text-[13px] text-[var(--vektrus-gray)] leading-relaxed">
            Deine Einstellungen kannst du jederzeit unter Profil → Einstellungen ändern.
          </p>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onComplete}
        disabled={saving}
        className="w-full bg-[var(--vektrus-blue)] text-white rounded-xl px-5 py-3 text-[16px] font-semibold hover:bg-[#3a9fd1] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(73,183,227,0.25)] hover:shadow-[0_6px_24px_rgba(73,183,227,0.3)]"
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Wird eingerichtet…
          </>
        ) : (
          "Los geht's!"
        )}
      </button>
    </div>
  );
};

export default StepComplete;
