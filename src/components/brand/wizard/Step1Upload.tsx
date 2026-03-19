import React, { useCallback, useRef, useState } from 'react';
import { Upload, X, Lightbulb, Info, ChevronDown, ChevronUp, CircleCheck as CheckCircle2, Circle as XCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { UploadedDesign, WizardData } from '../types';

interface Step1UploadProps {
  wizardData: WizardData;
  onChange: (data: Partial<WizardData> | ((prev: WizardData) => Partial<WizardData>)) => void;
  userId: string;
}

const PLATFORMS = ['Instagram', 'LinkedIn', 'Facebook', 'TikTok', 'Sonstige'];

interface ReferenzTippsProps {
  confirmed: boolean;
  onConfirm: (v: boolean) => void;
}

const ReferenzTipps: React.FC<ReferenzTippsProps> = ({ confirmed, onConfirm }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={`rounded-2xl border overflow-hidden transition-colors ${
      confirmed
        ? 'border-[rgba(73,214,158,0.4)] bg-[#F0FBF6]'
        : 'border-[rgba(73,183,227,0.22)] bg-[#EBF8FE]'
    }`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <Info className={`w-4 h-4 flex-shrink-0 ${confirmed ? 'text-[#49D69E]' : 'text-[#49B7E3]'}`} />
          <span className={`text-sm font-semibold ${confirmed ? 'text-[#1A7A52]' : 'text-[#1A6E8E]'}`}>
            Welche Designs eignen sich als Referenz?
          </span>
          {!confirmed && (
            <span className="text-xs font-medium text-[#FA7E70] bg-[#FFF0EE] border border-[rgba(250,126,112,0.3)] px-2 py-0.5 rounded-full">
              Pflichtfeld
            </span>
          )}
          {confirmed && (
            <span className="text-xs font-medium text-[#49D69E] bg-[#F0FBF6] border border-[rgba(73,214,158,0.4)] px-2 py-0.5 rounded-full">
              Gelesen
            </span>
          )}
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-[#49B7E3] flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#49B7E3] flex-shrink-0" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white rounded-[var(--vektrus-radius-md)] p-3 border border-[rgba(73,214,158,0.25)]">
              <div className="flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="w-4 h-4 text-[#49D69E]" />
                <span className="text-xs font-semibold text-[#1A7A52]">Geeignet</span>
              </div>
              <ul className="space-y-1.5">
                {[
                  'Designs mit klarem Layout und Typografie',
                  'Posts ohne Sponsoren oder Werbeflächen',
                  'Saubere Vorlagen mit deinen Brand-Farben',
                  'Einfache Grafiken mit Text-Overlay',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-1.5 text-xs text-[#3A3A3A]">
                    <span className="w-1 h-1 rounded-full bg-[#49D69E] mt-1.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-[var(--vektrus-radius-md)] p-3 border border-[rgba(250,126,112,0.2)]">
              <div className="flex items-center gap-1.5 mb-2">
                <XCircle className="w-4 h-4 text-[#FA7E70]" />
                <span className="text-xs font-semibold text-[#8A2A20]">Nicht geeignet</span>
              </div>
              <ul className="space-y-1.5">
                {[
                  'Posts mit Sponsoren-Logos oder Partnern',
                  'Designs mit Statistiken, Zahlen oder Spielergebnissen',
                  'Event-spezifische Grafiken (Matchday, Veranstaltungen)',
                  'Bilder mit vielen verschiedenen Logos',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-1.5 text-xs text-[#3A3A3A]">
                    <span className="w-1 h-1 rounded-full bg-[#FA7E70] mt-1.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-xs text-[#7A7A7A] leading-relaxed">
            Je sauberer dein Referenz-Design, desto besser überträgt die KI deinen Stil auf neue Fotos.
          </p>

          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => onConfirm(e.target.checked)}
                className="sr-only"
              />
              <div
                onClick={() => onConfirm(!confirmed)}
                className={`w-5 h-5 rounded-[var(--vektrus-radius-sm)] border-2 flex items-center justify-center transition-all duration-200 ${
                  confirmed
                    ? 'bg-[#49D69E] border-[#49D69E]'
                    : 'bg-white border-[#49B7E3] group-hover:border-[#49D69E]'
                }`}
              >
                {confirmed && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm text-[#3A3A3A] leading-snug">
              Ich habe die Hinweise gelesen und verstanden, welche Designs sich als Referenz eignen.
            </span>
          </label>
        </div>
      )}

      {!open && (
        <div className="px-4 pb-3">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => onConfirm(e.target.checked)}
                className="sr-only"
              />
              <div
                onClick={() => onConfirm(!confirmed)}
                className={`w-5 h-5 rounded-[var(--vektrus-radius-sm)] border-2 flex items-center justify-center transition-all duration-200 ${
                  confirmed
                    ? 'bg-[#49D69E] border-[#49D69E]'
                    : 'bg-white border-[#49B7E3] group-hover:border-[#49D69E]'
                }`}
              >
                {confirmed && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm text-[#3A3A3A] leading-snug">
              Ich habe die Hinweise gelesen und verstanden, welche Designs sich als Referenz eignen.
            </span>
          </label>
        </div>
      )}
    </div>
  );
};

const Step1Upload: React.FC<Step1UploadProps> = ({ wizardData, onChange, userId }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (design: UploadedDesign): Promise<UploadedDesign> => {
    const fileExt = design.file.name.split('.').pop();
    const filePath = `${userId}/references/design_${design.id}_${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from('brand-assets')
      .upload(filePath, design.file, { cacheControl: '3600', upsert: false });

    if (error) {
      return { ...design, error: error.message, uploadProgress: 0 };
    }

    const { data: urlData } = supabase.storage
      .from('brand-assets')
      .getPublicUrl(filePath);

    return { ...design, publicUrl: urlData.publicUrl, uploaded: true, uploadProgress: 100 };
  };

  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArr = Array.from(files).slice(0, 10 - wizardData.designs.length);
      const newDesigns: UploadedDesign[] = fileArr.map((file) => ({
        id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        platform: 'Instagram',
        uploadProgress: 0,
        uploaded: false,
      }));

      onChange((prev) => ({ designs: [...prev.designs, ...newDesigns] }));

      for (const design of newDesigns) {
        const updated = await uploadFile(design);
        onChange((prev) => ({
          designs: prev.designs.map((d) => (d.id === design.id ? updated : d)),
        }));
      }
    },
    [wizardData.designs.length, userId, onChange]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(e.target.files);
    e.target.value = '';
  };

  const removeDesign = (id: string) => {
    const design = wizardData.designs.find((d) => d.id === id);
    if (design?.previewUrl) URL.revokeObjectURL(design.previewUrl);
    onChange({ designs: wizardData.designs.filter((d) => d.id !== id) });
  };

  const updatePlatform = (id: string, platform: string) => {
    onChange({
      designs: wizardData.designs.map((d) =>
        d.id === id ? { ...d, platform } : d
      ),
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#111111] mb-1 font-manrope">Designs hochladen</h2>
        <p className="text-[#7A7A7A] text-base">
          Lade bestehende Social Media Posts hoch – die KI analysiert deinen Stil.
        </p>
      </div>

      <ReferenzTipps
        confirmed={wizardData.referenzConfirmed}
        onConfirm={(v) => onChange({ referenzConfirmed: v })}
      />

      {wizardData.designs.length < 10 && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-4 p-10 rounded-[var(--vektrus-radius-lg)] cursor-pointer transition-all duration-200 border-2 ${
            isDragOver
              ? 'border-[#49B7E3] bg-[#E6F7FD]'
              : 'border-dashed border-[rgba(73,183,227,0.35)] bg-[#F4FCFE] hover:border-[#49B7E3] hover:bg-[#EBF8FE]'
          }`}
        >
          <Upload className="w-12 h-12 text-[#49B7E3]" />
          <div className="text-center">
            <p className="text-[#111111] font-medium text-base">
              Ziehe deine bestehenden Social Media Posts hierher
            </p>
            <p className="text-[#7A7A7A] text-sm mt-1">oder klicke zum Auswählen</p>
          </div>
          <p className="text-[#7A7A7A] text-xs">
            PNG, JPG, WEBP · Max. {10 - wizardData.designs.length} weitere Bilder · Max. 10 MB pro Bild
          </p>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            className="px-5 py-2.5 rounded-[var(--vektrus-radius-sm)] border border-[#49B7E3] text-[#49B7E3] text-sm font-semibold hover:bg-[#E6F7FD] transition-colors"
          >
            Dateien auswählen
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      )}

      <div className="flex items-start gap-3 p-4 rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.18)] bg-[#F4FCFE]">
        <Lightbulb className="w-5 h-5 text-[#49B7E3] flex-shrink-0 mt-0.5" />
        <p className="text-sm text-[#7A7A7A] leading-relaxed">
          Tipp: Lade 3-5 bestehende Social Media Posts oder Designs hoch, die deinen typischen Stil zeigen. Je mehr Beispiele, desto besser erkennt die KI dein Branding.
        </p>
      </div>

      {wizardData.designs.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {wizardData.designs.map((design) => (
            <div
              key={design.id}
              className={`rounded-[var(--vektrus-radius-lg)] overflow-hidden bg-white border transition-all shadow-card ${
                design.error ? 'border-[#FA7E70]' : 'border-[rgba(73,183,227,0.18)]'
              }`}
            >
              <div className="relative aspect-square">
                <img
                  src={design.previewUrl}
                  alt="Design preview"
                  className="w-full h-full object-cover"
                />
                {!design.uploaded && !design.error && (
                  <div className="absolute inset-0 bg-black/20 flex items-end">
                    <div className="w-full h-1 bg-white/30">
                      <div
                        className="h-full bg-[#49B7E3] transition-all duration-300"
                        style={{ width: `${design.uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
                {design.error && (
                  <div className="absolute inset-0 bg-[#FA7E70]/10 flex items-center justify-center">
                    <span className="text-xs text-[#FA7E70] px-2 text-center">{design.error}</span>
                  </div>
                )}
                <button
                  onClick={() => removeDesign(design.id)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
              <div className="p-2">
                <select
                  value={design.platform}
                  onChange={(e) => updatePlatform(design.id, e.target.value)}
                  className="w-full text-xs text-[#111111] border border-[rgba(73,183,227,0.25)] rounded-[var(--vektrus-radius-sm)] px-2 py-1.5 focus:outline-none focus:border-[#49B7E3] bg-white"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Step1Upload;
