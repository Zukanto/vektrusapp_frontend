import React, { useState } from 'react';
import { Info, X } from 'lucide-react';
import { BrandProfile } from '../types';

const SPONSOR_KEYWORDS = [
  'sponsor',
  'partner',
  'werbung',
  'advertisement',
  'logo-leiste',
  'logoleiste',
  'sponsor-bereich',
  'sponsorbereich',
  'partner-logo',
  'partnerlogo',
  'branding-bar',
  'brandingbar',
  'sponsor section',
  'partner section',
  'advertiser',
  'sponsoren',
  'sponsorenleiste',
  'werbebereich',
];

const shouldShowSponsorHint = (profile: BrandProfile): boolean => {
  const searchTexts = [
    JSON.stringify(profile.design_dna || ''),
    profile.style_summary || '',
    JSON.stringify(profile.reference_images || ''),
  ]
    .join(' ')
    .toLowerCase();

  return SPONSOR_KEYWORDS.some((kw) => searchTexts.includes(kw));
};

interface SponsorHintProps {
  profile: BrandProfile;
}

const SponsorHint: React.FC<SponsorHintProps> = ({ profile }) => {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('brand-sponsor-hint-dismissed') === 'true',
  );

  if (dismissed || !shouldShowSponsorHint(profile)) return null;

  return (
    <div
      className="relative rounded-[var(--vektrus-radius-sm)] mt-3"
      style={{
        background: '#F8F9FA',
        border: '1px solid #E8E8E8',
        padding: '12px 16px',
      }}
    >
      <button
        onClick={() => {
          setDismissed(true);
          localStorage.setItem('brand-sponsor-hint-dismissed', 'true');
        }}
        className="absolute top-2.5 right-2.5 w-5 h-5 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
        aria-label="Schließen"
      >
        <X className="w-3.5 h-3.5" style={{ color: '#ABABAB' }} />
      </button>

      <div className="flex items-center gap-2 mb-1">
        <Info className="w-4 h-4 flex-shrink-0" style={{ color: '#7A7A7A' }} />
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: '13px',
            color: '#111111',
          }}
        >
          Sponsoren & Partner-Logos in deinen Designs
        </span>
      </div>

      <p
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          fontSize: '13px',
          color: '#7A7A7A',
          lineHeight: '1.5',
          marginTop: '4px',
          paddingRight: '16px',
        }}
      >
        Vektrus erkennt Sponsor-Bereiche in deinen Referenz-Designs und
        übernimmt diese bewusst nicht in neue Posts. So bleiben deine
        generierten Inhalte frei von fremden Marken.
      </p>
    </div>
  );
};

export default SponsorHint;
