import React from 'react';

interface LogoSectionProps {
  logoUrl?: string;
  designDna?: Record<string, any>;
}

const LogoSection: React.FC<LogoSectionProps> = ({ logoUrl, designDna }) => {
  if (!logoUrl) return null;

  const logoType = designDna?.logo_type;
  const complexity = designDna?.logo_complexity;
  const placement = designDna?.logo_placement;

  return (
    <div className="rounded-2xl bg-white border border-[rgba(73,183,227,0.18)] p-6" style={{ boxShadow: '0px 4px 18px rgba(17,17,17,0.06)' }}>
      <h3 className="text-base font-semibold text-[#111111] mb-5">Logo</h3>
      <div className="flex items-start gap-6">
        <div
          className="w-28 h-28 rounded-[var(--vektrus-radius-md)] flex-shrink-0 flex items-center justify-center overflow-hidden"
          style={{
            background: 'repeating-conic-gradient(#e5e7eb 0% 25%, white 0% 50%) 0 0 / 16px 16px',
          }}
        >
          <img
            src={logoUrl}
            alt="Brand logo"
            className="max-w-full max-h-full object-contain p-2"
          />
        </div>
        {(logoType || complexity || placement) && (
          <div className="space-y-2">
            {logoType && (
              <div>
                <p className="text-xs text-[#7A7A7A]">Typ</p>
                <p className="text-sm font-medium text-[#111111]">{logoType}</p>
              </div>
            )}
            {complexity && (
              <div>
                <p className="text-xs text-[#7A7A7A]">Komplexität</p>
                <p className="text-sm font-medium text-[#111111]">{complexity}</p>
              </div>
            )}
            {placement && (
              <div>
                <p className="text-xs text-[#7A7A7A]">Empfohlene Platzierung</p>
                <p className="text-sm font-medium text-[#111111]">{placement}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LogoSection;
