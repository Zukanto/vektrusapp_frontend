import React, { useState } from 'react';
import { Pen } from 'lucide-react';

interface VisualStyleData {
  mood?: string;
  image_style?: string;
  effects?: string;
  layout?: string;
}

interface VisualStyleSectionProps {
  designDna: Record<string, any>;
  visualStyle?: string;
  onSave: (data: { visual_style: string; design_dna: Record<string, any> }) => Promise<void>;
}

const VisualStyleSection: React.FC<VisualStyleSectionProps> = ({ designDna, visualStyle, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftStyle, setDraftStyle] = useState(visualStyle || '');
  const [draftDna, setDraftDna] = useState<VisualStyleData>({
    mood: designDna?.mood || '',
    image_style: designDna?.image_style || '',
    effects: designDna?.effects || '',
    layout: designDna?.layout || '',
  });
  const [saving, setSaving] = useState(false);

  const hasData = visualStyle || designDna?.mood || designDna?.image_style || designDna?.effects || designDna?.layout;
  if (!hasData) return null;

  const handleSave = async () => {
    setSaving(true);
    await onSave({ visual_style: draftStyle, design_dna: { ...designDna, ...draftDna } });
    setSaving(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraftStyle(visualStyle || '');
    setDraftDna({ mood: designDna?.mood || '', image_style: designDna?.image_style || '', effects: designDna?.effects || '', layout: designDna?.layout || '' });
    setIsEditing(false);
  };

  return (
    <div className="rounded-2xl bg-white border border-[rgba(73,183,227,0.18)] p-6" style={{ boxShadow: '0px 4px 18px rgba(17,17,17,0.06)' }}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-[#111111]">Visueller Stil</h3>
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
          {[
            { key: 'mood', label: 'Stimmung' },
            { key: 'image_style', label: 'Bildstil' },
            { key: 'effects', label: 'Effekte' },
            { key: 'layout', label: 'Layout' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="text-xs font-medium text-[#7A7A7A] block mb-1">{label}</label>
              <input
                type="text"
                value={draftDna[key as keyof VisualStyleData] || ''}
                onChange={(e) => setDraftDna((p) => ({ ...p, [key]: e.target.value }))}
                className="w-full h-10 px-3 rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.25)] text-sm text-[#111111] focus:outline-none focus:border-[#49B7E3] transition-all"
              />
            </div>
          ))}
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
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-6">
            {designDna?.mood && (
              <div>
                <p className="text-xs text-[#7A7A7A] mb-1">Stimmung</p>
                <p className="text-sm font-medium text-[#111111]">{designDna.mood}</p>
              </div>
            )}
            {designDna?.image_style && (
              <div>
                <p className="text-xs text-[#7A7A7A] mb-1">Bildstil</p>
                <p className="text-sm font-medium text-[#111111]">{designDna.image_style}</p>
              </div>
            )}
            {designDna?.effects && (
              <div>
                <p className="text-xs text-[#7A7A7A] mb-1">Effekte</p>
                <p className="text-sm font-medium text-[#111111]">{designDna.effects}</p>
              </div>
            )}
          </div>
          {designDna?.layout && (
            <div>
              <p className="text-xs text-[#7A7A7A] mb-1">Layout</p>
              <p className="text-sm font-medium text-[#111111]">{designDna.layout}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VisualStyleSection;
