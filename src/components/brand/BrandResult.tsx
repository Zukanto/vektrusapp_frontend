import React from 'react';
import { Brush, RefreshCw } from 'lucide-react';
import { BrandProfile } from './types';
import ColorSection from './result/ColorSection';
import TypographySection from './result/TypographySection';
import TonalitySection from './result/TonalitySection';
import VisualStyleSection from './result/VisualStyleSection';
import LogoSection from './result/LogoSection';
import ReferenceDesigns from './result/ReferenceDesigns';
import SponsorHint from './result/SponsorHint';
import ConfidenceSection from './result/ConfidenceSection';
import { supabase } from '../../lib/supabase';

interface BrandResultProps {
  profile: BrandProfile;
  onReanalyze: () => void;
  onProfileUpdate: (updated: BrandProfile) => void;
}


const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
};

const BrandResult: React.FC<BrandResultProps> = ({ profile, onReanalyze, onProfileUpdate }) => {

  const updateField = async (field: string, value: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from('brand_profiles')
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq('user_id', session.user.id);

    if (!error) {
      onProfileUpdate({ ...profile, [field]: value });
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-shrink-0 px-8 pt-8 pb-6 border-b border-[rgba(73,183,227,0.18)] bg-white">
        <div className="max-w-[1240px] mx-auto flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[var(--vektrus-radius-sm)] bg-[#E6F7FD] flex items-center justify-center">
              <Brush className="w-5 h-5 text-[#49B7E3]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#111111] font-manrope">Dein Brand Profile</h1>
              {profile.updated_at && (
                <p className="text-xs text-[#7A7A7A] mt-0.5">
                  Zuletzt aktualisiert: {formatDate(profile.extraction_date || profile.updated_at)}
                </p>
              )}
            </div>
          </div>
          <button
            id="btn-reanalyze"
            onClick={onReanalyze}
            className="flex items-center gap-2 px-4 py-2.5 rounded-[var(--vektrus-radius-sm)] border border-[#49B7E3] text-[#49B7E3] text-sm font-semibold hover:bg-[#E6F7FD] transition-colors flex-shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
            Neu analysieren
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-[1240px] mx-auto space-y-5">
          {profile.style_summary && (
            <div
              className="rounded-[var(--vektrus-radius-lg)] p-6 border border-[rgba(73,183,227,0.18)] shadow-card"
              style={{
                background: 'linear-gradient(135deg, #F4FCFE 0%, #FFFFFF 100%)',
              }}
            >
              <p className="text-lg text-[#111111] leading-relaxed">
                "{profile.style_summary}"
              </p>
            </div>
          )}

          <ConfidenceSection profile={profile} />

          <div id="section-colors">
            <ColorSection
              colors={profile.colors || {}}
              onSave={(colors) => {
                updateField('colors', colors);
                updateField('colors_edited', true);
              }}
            />
          </div>

          <TypographySection
            fonts={profile.fonts || {}}
            onSave={async (fonts) => {
              await updateField('fonts', fonts);
              await updateField('fonts_edited', true);
            }}
          />

          <TonalitySection
            tonality={profile.tonality || {}}
            onSave={(tonality) => updateField('tonality', tonality)}
          />

          <VisualStyleSection
            designDna={profile.design_dna || {}}
            visualStyle={profile.visual_style}
            onSave={({ visual_style, design_dna }) => {
              updateField('visual_style', visual_style);
              updateField('design_dna', design_dna);
            }}
          />

          <div id="section-logo">
            <LogoSection logoUrl={profile.logo_url} designDna={profile.design_dna} />
          </div>

          <ReferenceDesigns images={profile.reference_images || []} />
          <SponsorHint profile={profile} />
        </div>
      </div>
    </div>
  );
};

export default BrandResult;
