import React, { useState } from 'react';
import { Pen, Check } from 'lucide-react';
import { BrandColors } from '../types';

interface ColorSectionProps {
  colors: BrandColors;
  onSave: (colors: BrandColors) => Promise<void>;
}

const COLOR_ROLES: { key: keyof Omit<BrandColors, 'mood'>; label: string }[] = [
  { key: 'primary', label: 'Primär' },
  { key: 'secondary', label: 'Sekundär' },
  { key: 'accent', label: 'Akzent' },
  { key: 'background', label: 'Hintergrund' },
  { key: 'text', label: 'Text' },
];

const ColorSection: React.FC<ColorSectionProps> = ({ colors, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<BrandColors>(colors);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex).catch(() => {});
    setCopied(hex);
    setTimeout(() => setCopied(null), 1500);
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(draft);
    setSaving(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(colors);
    setIsEditing(false);
  };

  return (
    <div className="rounded-2xl bg-white border border-[rgba(73,183,227,0.18)] p-6" style={{ boxShadow: '0px 4px 18px rgba(17,17,17,0.06)' }}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-[#111111]">Farbpalette</h3>
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

      <div className="flex flex-wrap gap-3 mb-4">
        {COLOR_ROLES.map(({ key, label }) => {
          const hex = (isEditing ? draft : colors)[key];
          if (!hex) return null;
          return (
            <div key={key} className="flex flex-col items-center gap-1.5">
              <div className="relative group">
                {isEditing ? (
                  <div className="relative w-16 h-16 rounded-[var(--vektrus-radius-md)] border border-[rgba(0,0,0,0.08)] overflow-hidden cursor-pointer">
                    <div className="w-full h-full" style={{ background: draft[key] || '#e5e7eb' }} />
                    <input
                      type="color"
                      value={draft[key] || '#000000'}
                      onChange={(e) => setDraft((prev) => ({ ...prev, [key]: e.target.value }))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => hex && handleCopy(hex)}
                    className="w-16 h-16 rounded-[var(--vektrus-radius-md)] border border-[rgba(0,0,0,0.08)] transition-transform duration-150 hover:scale-105"
                    style={{ background: hex }}
                    title="Klicken zum Kopieren"
                  >
                    {copied === hex && (
                      <div className="w-full h-full flex items-center justify-center bg-black/20 rounded-[var(--vektrus-radius-md)]">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </button>
                )}
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={draft[key] || ''}
                  onChange={(e) => setDraft((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="w-16 text-center text-xs text-[#7A7A7A] border border-[rgba(73,183,227,0.25)] rounded-[var(--vektrus-radius-sm)] px-1 py-0.5 focus:outline-none focus:border-[#49B7E3]"
                />
              ) : (
                <span className="text-xs text-[#7A7A7A]">{hex}</span>
              )}
              <span className="text-xs font-medium text-[#111111]">{label}</span>
            </div>
          );
        })}
      </div>

      {colors.mood && !isEditing && (
        <p className="text-sm text-[#7A7A7A] italic">{colors.mood}</p>
      )}

      {isEditing && (
        <div className="flex items-center gap-3 mt-5 pt-4 border-t border-[rgba(73,183,227,0.18)]">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-[var(--vektrus-radius-md)] bg-[#49B7E3] text-white text-sm font-semibold hover:bg-[#2E9FD0] transition-colors disabled:opacity-50"
          >
            {saving ? 'Speichern...' : 'Speichern'}
          </button>
          <button
            onClick={handleCancel}
            className="text-sm text-[#7A7A7A] hover:text-[#111111] transition-colors"
          >
            Abbrechen
          </button>
        </div>
      )}
    </div>
  );
};

export default ColorSection;
