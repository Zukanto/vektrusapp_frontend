import React, { useRef, useState, useCallback } from 'react';
import { Upload, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { WizardData } from '../types';
import FontPicker from '../result/FontPicker';

interface Step2DetailsProps {
  wizardData: WizardData;
  onChange: (data: Partial<WizardData>) => void;
  userId: string;
}

const VISUAL_STYLES = [
  'Professionell', 'Minimalistisch', 'Modern', 'Verspielt', 'Luxuriös', 'Mutig / Bold',
];

const isValidHex = (value: string) => /^#[0-9A-Fa-f]{6}$/.test(value);

const ColorInput: React.FC<{
  label: string;
  value: string;
  onChange: (val: string) => void;
}> = ({ label, value, onChange }) => {
  const [inputValue, setInputValue] = useState(value);
  const colorPickerRef = useRef<HTMLInputElement>(null);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;
    if (raw && !raw.startsWith('#')) raw = '#' + raw;
    setInputValue(raw);
    if (isValidHex(raw)) onChange(raw);
    if (raw === '' || raw === '#') onChange('');
  }, [onChange]);

  const handleColorPickerChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val);
  }, [onChange]);

  const displayColor = isValidHex(value) ? value : '#e5e7eb';

  return (
    <div>
      <label className="text-xs font-medium text-[#7A7A7A] block mb-1.5">{label}</label>
      <div className="flex items-center gap-2 h-11 px-3 rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.25)] focus-within:border-[#49B7E3] focus-within:ring-2 focus-within:ring-[#B6EBF7]/40 transition-all bg-white">
        <button
          type="button"
          onClick={() => colorPickerRef.current?.click()}
          className="w-6 h-6 rounded-full border border-[rgba(0,0,0,0.12)] flex-shrink-0 cursor-pointer hover:scale-110 transition-transform"
          style={{ background: displayColor }}
          title="Farbe per Picker wählen"
        />
        <input
          ref={colorPickerRef}
          type="color"
          value={isValidHex(value) ? value : '#000000'}
          onChange={handleColorPickerChange}
          className="sr-only"
          tabIndex={-1}
        />
        <input
          type="text"
          value={inputValue}
          onChange={handleTextChange}
          onBlur={() => {
            if (!isValidHex(inputValue) && inputValue !== '' && inputValue !== '#') {
              setInputValue(value);
            }
          }}
          placeholder="#AABBCC"
          maxLength={7}
          className="flex-1 text-sm text-[#111111] placeholder-[#BBBBBB] focus:outline-none bg-transparent font-mono"
        />
      </div>
    </div>
  );
};

const Step2Details: React.FC<Step2DetailsProps> = ({ wizardData, onChange, userId }) => {
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoError, setLogoError] = useState('');
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (file: File) => {
    setIsUploadingLogo(true);
    setLogoError('');
    const previewUrl = URL.createObjectURL(file);
    onChange({ logoFile: file, logoPreviewUrl: previewUrl });

    const ext = file.name.split('.').pop();
    const filePath = `${userId}/brand/logo.${ext}`;

    const { error } = await supabase.storage
      .from('brand-assets')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (error) {
      setLogoError(error.message);
      setIsUploadingLogo(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('brand-assets')
      .getPublicUrl(filePath);

    onChange({ logoPublicUrl: urlData.publicUrl, logoStoragePath: filePath });
    setIsUploadingLogo(false);
  };

  const removeLogo = () => {
    if (wizardData.logoPreviewUrl) URL.revokeObjectURL(wizardData.logoPreviewUrl);
    onChange({ logoFile: undefined, logoPreviewUrl: undefined, logoPublicUrl: undefined, logoStoragePath: undefined });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#111111] mb-1 font-manrope">Logo & Details</h2>
        <p className="text-[#7A7A7A] text-base">
          Optionale Angaben verbessern die Analyse-Genauigkeit deutlich.
        </p>
      </div>

      <div className="p-6 rounded-[var(--vektrus-radius-lg)] bg-white border border-[rgba(73,183,227,0.18)] shadow-card">
        <p className="text-sm font-semibold text-[#111111] mb-1">Logo hochladen <span className="font-normal text-[#7A7A7A]">(optional)</span></p>
        <p className="text-xs text-[#7A7A7A] mb-4">Dein Logo hilft der KI, Farben und Stil noch präziser zu erkennen. PNG, SVG, JPG empfohlen.</p>

        <div className="flex items-start gap-5">
          {wizardData.logoPreviewUrl ? (
            <div className="relative flex-shrink-0 w-[120px] h-[120px] rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.18)] overflow-hidden bg-[#F4FCFE] flex items-center justify-center">
              <img
                src={wizardData.logoPreviewUrl}
                alt="Logo preview"
                className="max-w-full max-h-full object-contain p-2"
              />
              {isUploadingLogo && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-[#49B7E3] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <button
                onClick={removeLogo}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => logoInputRef.current?.click()}
              className="flex-shrink-0 w-[120px] h-[120px] rounded-[var(--vektrus-radius-md)] border-2 border-dashed border-[rgba(73,183,227,0.35)] bg-[#F4FCFE] hover:border-[#49B7E3] hover:bg-[#EBF8FE] flex flex-col items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Upload className="w-6 h-6 text-[#49B7E3]" />
              <span className="text-xs text-[#7A7A7A] text-center px-1">Logo hierher ziehen</span>
            </button>
          )}
          <div className="flex-1 text-sm text-[#7A7A7A] leading-relaxed pt-1">
            Transparenter Hintergrund empfohlen. Die KI nutzt das Logo, um deine Markenfarben und Typografie präziser zu erkennen.
            {logoError && <p className="text-[#FA7E70] mt-2 text-xs">{logoError}</p>}
          </div>
        </div>

        <input
          ref={logoInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
          className="hidden"
        />
      </div>

      <div className="p-6 rounded-[var(--vektrus-radius-lg)] bg-white border border-[rgba(73,183,227,0.18)] space-y-5 shadow-card">
        <div>
          <p className="text-sm font-semibold text-[#111111] mb-0.5">Zusätzliche Angaben <span className="font-normal text-[#7A7A7A]">(optional)</span></p>
          <p className="text-xs text-[#7A7A7A]">Diese Angaben verbessern die Analyse. Du kannst sie auch später ergänzen.</p>
        </div>

        <div>
          <label className="text-xs font-medium text-[#7A7A7A] block mb-1.5">Slogan / Claim</label>
          <input
            type="text"
            value={wizardData.slogan}
            onChange={(e) => onChange({ slogan: e.target.value })}
            placeholder='z.B. "Innovation trifft Qualität"'
            className="w-full h-11 px-4 rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.25)] text-sm text-[#111111] placeholder-[#7A7A7A] focus:outline-none focus:border-[#49B7E3] focus:ring-2 focus:ring-[#B6EBF7]/40 transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ColorInput
            label="Primärfarbe"
            value={wizardData.primaryColor}
            onChange={(val) => onChange({ primaryColor: val })}
          />
          <ColorInput
            label="Sekundärfarbe"
            value={wizardData.secondaryColor}
            onChange={(val) => onChange({ secondaryColor: val })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FontPicker
            label="Überschriften-Schrift"
            value={wizardData.headingFont}
            onChange={(val) => onChange({ headingFont: val })}
            showPairings
            onPairSuggestion={(heading, body) => onChange({ headingFont: heading, bodyFont: body })}
          />
          <FontPicker
            label="Fließtext-Schrift"
            value={wizardData.bodyFont}
            onChange={(val) => onChange({ bodyFont: val })}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-[#7A7A7A] block mb-2">Visueller Stil</label>
          <div className="flex flex-wrap gap-2">
            {VISUAL_STYLES.map((style) => (
              <button
                key={style}
                onClick={() => onChange({ visualStyle: wizardData.visualStyle === style ? '' : style })}
                className={`px-4 py-2 rounded-[var(--vektrus-radius-sm)] text-sm font-medium border transition-all duration-150 ${
                  wizardData.visualStyle === style
                    ? 'border-[#49B7E3] bg-[#E6F7FD] text-[#49B7E3]'
                    : 'border-[rgba(73,183,227,0.25)] text-[#7A7A7A] hover:border-[#49B7E3] hover:text-[#49B7E3]'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-[#7A7A7A] block mb-2">Ansprache</label>
          <div className="flex gap-6">
            {['Du', 'Sie', 'Neutral / Nicht festgelegt'].map((option) => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                    wizardData.addressing === option
                      ? 'border-[#49B7E3] bg-[#49B7E3]'
                      : 'border-[rgba(73,183,227,0.4)] bg-white'
                  }`}
                  onClick={() => onChange({ addressing: option })}
                >
                  {wizardData.addressing === option && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
                <span
                  className="text-sm text-[#111111] cursor-pointer"
                  onClick={() => onChange({ addressing: option })}
                >
                  {option}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step2Details;
