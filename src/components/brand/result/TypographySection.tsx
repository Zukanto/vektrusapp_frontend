import React, { useState, useEffect } from 'react';
import { Pen, Type, AlignLeft, Sparkles } from 'lucide-react';
import { BrandFonts } from '../types';
import FontPicker, { loadGoogleFont } from './FontPicker';

interface TypographySectionProps {
  fonts: BrandFonts;
  onSave: (fonts: BrandFonts) => Promise<void>;
}

const FontPreviewCard: React.FC<{ label: string; family: string; icon: React.ReactNode }> = ({ label, family, icon }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (family) {
      loadGoogleFont(family).then(() => setLoaded(true));
    }
  }, [family]);

  return (
    <div
      className="rounded-[var(--vektrus-radius-md)] p-4 flex flex-col gap-2"
      style={{ background: '#FAFAFA', border: '1px solid #F0F0F0' }}
    >
      <div className="flex items-center gap-1.5">
        <span style={{ color: '#49B7E3' }}>{icon}</span>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#7A7A7A', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </p>
      </div>
      <p
        style={{
          fontFamily: loaded && family ? `'${family}', sans-serif` : 'Inter, sans-serif',
          fontSize: '20px',
          color: '#111111',
          lineHeight: '1.25',
          fontWeight: 600,
        }}
      >
        Aa
      </p>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#555555', fontWeight: 500 }}>
        {family || <span style={{ color: '#ABABAB' }}>Nicht gesetzt</span>}
      </p>
    </div>
  );
};

const TypographySection: React.FC<TypographySectionProps> = ({ fonts, onSave }) => {
  const noFontsSet = !fonts.heading && !fonts.body && !fonts.accent && !fonts.hierarchy_description;
  const [isEditing, setIsEditing] = useState(noFontsSet);
  const [draft, setDraft] = useState<BrandFonts>(fonts);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(fonts);
  }, [fonts]);

  const handleSave = async () => {
    setSaving(true);
    await onSave(draft);
    setSaving(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(fonts);
    setIsEditing(false);
  };

  const handlePairSuggestion = (heading: string, body: string) => {
    setDraft(prev => ({ ...prev, heading, body }));
  };

  return (
    <div className="rounded-2xl bg-white border border-[rgba(73,183,227,0.18)] p-6" style={{ boxShadow: '0px 4px 18px rgba(17,17,17,0.06)' }}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-[#111111]">Typografie</h3>
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
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4">
            <FontPicker
              label="Überschriften-Schrift"
              value={draft.heading || ''}
              onChange={v => setDraft(prev => ({ ...prev, heading: v }))}
              showPairings
              onPairSuggestion={handlePairSuggestion}
            />
            <FontPicker
              label="Fließtext-Schrift"
              value={draft.body || ''}
              onChange={v => setDraft(prev => ({ ...prev, body: v }))}
            />
            <FontPicker
              label="Akzent-Schrift (optional)"
              value={draft.accent || ''}
              onChange={v => setDraft(prev => ({ ...prev, accent: v }))}
            />
          </div>

          {(draft.heading || draft.body) && (
            <div
              className="rounded-[var(--vektrus-radius-md)] p-4"
              style={{ background: '#FAFAFA', border: '1px solid #F0F0F0' }}
            >
              <div className="flex items-center gap-1.5 mb-3">
                <Sparkles className="w-3.5 h-3.5" style={{ color: '#49D69E' }} />
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#7A7A7A', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Vorschau
                </p>
              </div>
              {draft.heading && (
                <p
                  style={{
                    fontFamily: `'${draft.heading}', sans-serif`,
                    fontSize: '22px',
                    fontWeight: 700,
                    color: '#111111',
                    lineHeight: '1.2',
                    marginBottom: 8,
                  }}
                >
                  Headline: Deine Marke
                </p>
              )}
              {draft.body && (
                <p
                  style={{
                    fontFamily: `'${draft.body}', sans-serif`,
                    fontSize: '14px',
                    color: '#555555',
                    lineHeight: '1.6',
                  }}
                >
                  Fließtext: Vektrus erstellt passgenaue Social-Media-Inhalte mit deiner Corporate Identity — klar, konsistent und wirkungsvoll.
                </p>
              )}
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-[#7A7A7A] block mb-1.5">Hierarchie-Beschreibung (optional)</label>
            <textarea
              value={draft.hierarchy_description || ''}
              onChange={(e) => setDraft((prev) => ({ ...prev, hierarchy_description: e.target.value }))}
              rows={2}
              placeholder="z.B. Playfair für Headlines, Inter für Body-Text…"
              className="w-full px-3 py-2 rounded-[var(--vektrus-radius-md)] border text-sm focus:outline-none transition-all resize-none"
              style={{
                border: '1.5px solid rgba(73,183,227,0.25)',
                color: '#111111',
                fontFamily: 'Inter, sans-serif',
                fontSize: '13px',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#49B7E3'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(73,183,227,0.1)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(73,183,227,0.25)'; e.currentTarget.style.boxShadow = 'none'; }}
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
          {noFontsSet ? (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full py-6 rounded-[var(--vektrus-radius-md)] border-2 border-dashed flex flex-col items-center gap-2 transition-colors hover:border-[#49B7E3]"
              style={{ borderColor: 'rgba(73,183,227,0.3)', background: 'rgba(73,183,227,0.02)' }}
            >
              <Type className="w-5 h-5" style={{ color: '#49B7E3' }} />
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#7A7A7A' }}>
                Noch keine Schriften gesetzt — jetzt auswählen
              </p>
            </button>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {fonts.heading && (
                  <FontPreviewCard
                    label="Überschriften"
                    family={fonts.heading}
                    icon={<Type className="w-3.5 h-3.5" />}
                  />
                )}
                {fonts.body && (
                  <FontPreviewCard
                    label="Fließtext"
                    family={fonts.body}
                    icon={<AlignLeft className="w-3.5 h-3.5" />}
                  />
                )}
                {fonts.accent && (
                  <FontPreviewCard
                    label="Akzent"
                    family={fonts.accent}
                    icon={<Sparkles className="w-3.5 h-3.5" />}
                  />
                )}
              </div>
              {fonts.hierarchy_description && (
                <p className="text-sm text-[#7A7A7A] italic mt-2">{fonts.hierarchy_description}</p>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default TypographySection;
