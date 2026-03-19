import React from 'react';
import { Shield } from 'lucide-react';
import { WizardData } from '../types';

interface Step3StartProps {
  wizardData: WizardData;
}

const platformCount = (designs: WizardData['designs']) => {
  const counts: Record<string, number> = {};
  designs.forEach((d) => {
    counts[d.platform] = (counts[d.platform] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([p, c]) => `${p} (${c})`)
    .join(', ');
};

const Step3Start: React.FC<Step3StartProps> = ({ wizardData }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#111111] mb-1 font-manrope">Bereit für die Analyse</h2>
        <p className="text-[#7A7A7A] text-base">Überprüfe deine Angaben und starte die KI-Analyse.</p>
      </div>

      <div className="rounded-[var(--vektrus-radius-lg)] bg-white border border-[rgba(73,183,227,0.18)] overflow-hidden shadow-card">
        <div className="px-6 py-4 border-b border-[rgba(73,183,227,0.18)]">
          <p className="text-sm font-semibold text-[#111111]">Zusammenfassung</p>
        </div>
        <div className="px-6 py-4 space-y-3">
          <SummaryRow label="Referenz-Designs" value={`${wizardData.designs.length} Bild${wizardData.designs.length !== 1 ? 'er' : ''}`} />
          {wizardData.designs.length > 0 && (
            <SummaryRow label="Plattformen" value={platformCount(wizardData.designs)} />
          )}
          <SummaryRow
            label="Logo"
            value={wizardData.logoPublicUrl ? 'Hochgeladen' : 'Nicht angegeben'}
            valueClass={wizardData.logoPublicUrl ? 'text-[#49D69E]' : undefined}
          />
          {wizardData.slogan && (
            <SummaryRow label="Slogan" value={`"${wizardData.slogan}"`} />
          )}
          {wizardData.primaryColor && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#7A7A7A]">Primärfarbe</span>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full border border-[rgba(0,0,0,0.1)]"
                  style={{ background: wizardData.primaryColor }}
                />
                <span className="font-medium text-[#111111]">{wizardData.primaryColor}</span>
              </div>
            </div>
          )}
          {wizardData.visualStyle && (
            <SummaryRow label="Visueller Stil" value={wizardData.visualStyle} />
          )}
          {wizardData.addressing && (
            <SummaryRow label="Ansprache" value={wizardData.addressing} />
          )}
        </div>
      </div>

      <div className="flex items-start gap-3 p-5 rounded-[var(--vektrus-radius-md)] bg-[#F4FCFE] border border-[rgba(73,183,227,0.18)]">
        <Shield className="w-5 h-5 text-[#49B7E3] flex-shrink-0 mt-0.5" />
        <p className="text-sm text-[#7A7A7A] leading-relaxed">
          Die Analyse dauert ca. 1-3 Minuten. Deine Daten werden sicher auf EU-Servern verarbeitet und nie an Dritte weitergegeben.
        </p>
      </div>
    </div>
  );
};

interface SummaryRowProps {
  label: string;
  value: string;
  valueClass?: string;
}

const SummaryRow: React.FC<SummaryRowProps> = ({ label, value, valueClass }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-[#7A7A7A]">{label}</span>
    <span className={`font-medium ${valueClass || 'text-[#111111]'}`}>{value}</span>
  </div>
);

export default Step3Start;
