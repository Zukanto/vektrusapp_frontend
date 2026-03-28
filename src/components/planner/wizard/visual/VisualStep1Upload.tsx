import React, { useCallback, useRef, useState } from 'react';
import { Upload, X, ImagePlus, CircleAlert as AlertCircle, Loader as Loader2, Palette, Sparkles, Lightbulb, ExternalLink, PenLine, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { VisualWizardData, UploadedImage } from './types';
import { supabase } from '../../../../lib/supabase';

type BrandProfileRef = {
  reference_images?: Array<{ url?: string; thumbnail_url?: string; platform?: string } | string> | null;
} | null;

interface VisualStep1UploadProps {
  data: VisualWizardData;
  onUpdate: (partial: Partial<VisualWizardData>) => void;
  brandProfile?: BrandProfileRef;
  onNavigateToBrandStudio?: () => void;
}

const getDesignUrl = (design: { url?: string; thumbnail_url?: string } | string): string => {
  if (typeof design === 'string') return design;
  return design.url || design.thumbnail_url || '';
};

const POSTING_DIRECTIONS = [
  'Produkt vorstellen',
  'Behind the Scenes',
  'Angebot / Aktion',
  'Inspiration / Motivation',
  'Kundenstimme',
  'Teameinblick',
  'Tipp / Tutorial',
  'Story erzählen',
];

const BrandProfileBadge: React.FC<{
  brandProfile: BrandProfileRef;
  onNavigateToBrandStudio?: () => void;
}> = ({ brandProfile, onNavigateToBrandStudio }) => {
  const [dismissed, setDismissed] = useState(() =>
    localStorage.getItem('pulse-visual-brand-tip-dismissed') === 'true'
  );

  const hasProfile =
    brandProfile &&
    Array.isArray(brandProfile.reference_images) &&
    brandProfile.reference_images.length > 0;

  if (hasProfile) {
    const designs = brandProfile!.reference_images!;
    const designCount = designs.length;
    const thumbnails = designs.slice(0, 3);

    return (
      <div
        className="rounded-[var(--vektrus-radius-md)] p-3"
        style={{ background: '#F4FCFE', border: '1px solid #B6EBF7' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 flex-shrink-0" style={{ color: '#49D69E' }} />
          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px', color: '#111111' }}>
            Dein Stil ist aktiv
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {thumbnails.map((design, i) => {
              const url = getDesignUrl(design);
              return url ? (
                <img
                  key={i} src={url} alt={`Referenz ${i + 1}`}
                  style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover', border: '1px solid #E0E0E0', flexShrink: 0 }}
                />
              ) : (
                <div key={i} style={{ width: 32, height: 32, borderRadius: 6, background: '#E8F4F8', border: '1px solid #E0E0E0', flexShrink: 0 }} />
              );
            })}
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '13px', color: '#7A7A7A', lineHeight: '1.4' }}>
            Posts werden im Stil deiner {designCount} Referenz-Design{designCount !== 1 ? 's' : ''} erstellt.
          </p>
        </div>
      </div>
    );
  }

  if (dismissed) return null;

  return (
    <div className="rounded-[var(--vektrus-radius-md)] p-3 relative" style={{ background: '#FFFBF5', border: '1px solid #F0E6D8' }}>
      <button
        onClick={() => { setDismissed(true); localStorage.setItem('pulse-visual-brand-tip-dismissed', 'true'); }}
        className="absolute top-2.5 right-2.5 w-5 h-5 flex items-center justify-center rounded-full hover:bg-black/8 transition-colors"
        aria-label="Schließen"
      >
        <X className="w-3.5 h-3.5" style={{ color: '#ABABAB' }} />
      </button>
      <div className="flex items-center gap-2 mb-1.5">
        <Lightbulb className="w-4 h-4 flex-shrink-0" style={{ color: '#F4BE9D' }} />
        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px', color: '#111111' }}>
          Tipp: Richte dein Brand Studio ein
        </span>
      </div>
      <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '13px', color: '#7A7A7A', lineHeight: '1.4', marginBottom: 8 }}>
        Lade bestehende Designs hoch und Vektrus erstellt neue Posts in deinem Stil.
      </p>
      <button
        onClick={onNavigateToBrandStudio}
        className="inline-flex items-center gap-1 hover:underline transition-all"
        style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '13px', color: '#49B7E3', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
      >
        Zum Brand Studio <ExternalLink className="w-3 h-3" />
      </button>
    </div>
  );
};

const ImageContextCard: React.FC<{
  img: UploadedImage;
  index: number;
  onRemove: (id: string) => void;
  onUpdateDirection: (id: string, val: string) => void;
  onUpdateNotes: (id: string, val: string) => void;
}> = ({ img, index, onRemove, onUpdateDirection, onUpdateNotes }) => {
  const [expanded, setExpanded] = useState(true);

  const selectedPreset = POSTING_DIRECTIONS.includes(img.description) ? img.description : '';

  const handlePresetClick = (preset: string) => {
    if (selectedPreset === preset) {
      onUpdateDirection(img.id, '');
    } else {
      onUpdateDirection(img.id, preset);
    }
  };

  const hasContext = img.description || img.additionalNotes;

  return (
    <div
      className="rounded-[var(--vektrus-radius-lg)] overflow-hidden"
      style={{ border: '1px solid #E8E8E8', background: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-stretch">
        <div className="relative flex-shrink-0" style={{ width: 120, minHeight: 120 }}>
          <img
            src={img.previewUrl}
            alt=""
            className="w-full h-full object-cover"
            style={{ minHeight: 120 }}
          />
          {img.uploading && (
            <div className="absolute inset-0 bg-white/75 flex flex-col items-center justify-center gap-1">
              <Loader2 className="w-5 h-5 text-[#49B7E3] animate-spin" />
              <span style={{ fontSize: 11, color: '#49B7E3', fontFamily: 'Inter, sans-serif' }}>Lädt hoch…</span>
            </div>
          )}
          {img.error && (
            <div className="absolute inset-0 bg-[#FA7E70]/20 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-[#FA7E70]" />
            </div>
          )}
          <div className="absolute top-2 left-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#111111', opacity: 0.7 }}>
            <span style={{ fontSize: 10, color: '#fff', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>{index + 1}</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(73,183,227,0.10)]">
            <div className="flex items-center gap-2 min-w-0">
              <PenLine className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#49B7E3' }} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', color: '#111111' }}>
                Posting-Richtung
              </span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#ABABAB' }}>(optional)</span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => onRemove(img.id)}
                className="w-6 h-6 flex items-center justify-center rounded-[var(--vektrus-radius-sm)] hover:bg-[#FA7E70]/10 transition-colors"
                aria-label="Bild entfernen"
              >
                <X className="w-3.5 h-3.5" style={{ color: '#FA7E70' }} />
              </button>
              <button
                onClick={() => setExpanded(p => !p)}
                className="w-6 h-6 flex items-center justify-center rounded-[var(--vektrus-radius-sm)] hover:bg-[#F4FCFE] transition-colors"
                aria-label="Auf-/Zuklappen"
              >
                {expanded
                  ? <ChevronUp className="w-3.5 h-3.5 text-[#7A7A7A]" />
                  : <ChevronDown className="w-3.5 h-3.5 text-[#7A7A7A]" />
                }
              </button>
            </div>
          </div>

          {expanded && (
            <div className="px-4 py-3 space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {POSTING_DIRECTIONS.map(preset => (
                  <button
                    key={preset}
                    onClick={() => handlePresetClick(preset)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border-gradient-ai ${
                      selectedPreset === preset
                        ? 'ai-active border-transparent bg-[rgba(124,108,242,0.06)] text-[var(--vektrus-ai-violet)]'
                        : 'text-[#555555] bg-[#FAFAFA]'
                    }`}
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '12px',
                      border: selectedPreset === preset ? 'none' : '1.5px solid #E8E8E8',
                    }}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <div>
                <label
                  htmlFor={`notes-${img.id}`}
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#7A7A7A', display: 'block', marginBottom: 4 }}
                >
                  Zusätzliche Hinweise
                </label>
                <textarea
                  id={`notes-${img.id}`}
                  value={img.additionalNotes || ''}
                  onChange={(e) => onUpdateNotes(img.id, e.target.value)}
                  placeholder="z. B. Bildkontext, Fokus oder Post-Idee …"
                  rows={2}
                  className="w-full text-xs px-3 py-2 rounded-[var(--vektrus-radius-md)] transition-all resize-none focus:ring-1 focus:ring-[#49B7E3]/40"
                  style={{
                    border: img.additionalNotes ? '1.5px solid #49B7E3' : '1.5px solid #E8E8E8',
                    background: '#FAFAFA',
                    color: '#111111',
                    fontFamily: 'Inter, sans-serif',
                    outline: 'none',
                    lineHeight: '1.5',
                  }}
                />
              </div>
            </div>
          )}

          {!expanded && hasContext && (
            <div className="px-4 py-2 flex flex-wrap items-center gap-1.5">
              {img.description && (
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border-gradient-ai ai-active"
                  style={{ background: 'rgba(124,108,242,0.06)', color: 'var(--vektrus-ai-violet)', fontFamily: 'Inter, sans-serif' }}
                >
                  {img.description}
                </span>
              )}
              {img.additionalNotes && (
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs"
                  style={{ background: 'rgba(73,183,227,0.08)', color: '#49B7E3', fontFamily: 'Inter, sans-serif', border: '1px solid rgba(73,183,227,0.2)' }}
                >
                  {img.additionalNotes.length > 40 ? img.additionalNotes.slice(0, 40) + '…' : img.additionalNotes}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MAX_IMAGES = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const VisualStep1Upload: React.FC<VisualStep1UploadProps> = ({ data, onUpdate, brandProfile, onNavigateToBrandStudio }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const uploadToStorage = async (file: File): Promise<string> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Nicht eingeloggt');
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `pulse-visual/${session.user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('user-images').upload(filename, file, { contentType: file.type, upsert: false });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from('user-images').getPublicUrl(filename);
    return urlData.publicUrl;
  };

  const processFiles = useCallback(async (files: File[]) => {
    const remaining = MAX_IMAGES - data.images.length;
    const validFiles = files
      .filter(f => ACCEPTED_TYPES.includes(f.type))
      .filter(f => f.size <= MAX_FILE_SIZE)
      .slice(0, remaining);
    if (validFiles.length === 0) return;

    const newImages: UploadedImage[] = validFiles.map(f => ({
      id: `img-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file: f,
      previewUrl: URL.createObjectURL(f),
      publicUrl: '',
      description: '',
      additionalNotes: '',
      uploading: true,
    }));

    const combined = [...data.images, ...newImages];
    onUpdate({ images: combined });

    for (const img of newImages) {
      try {
        const publicUrl = await uploadToStorage(img.file);
        img.publicUrl = publicUrl;
        img.uploading = false;
        onUpdate({ images: combined.map(i => i.id === img.id ? { ...i, publicUrl, uploading: false } : i) });
      } catch {
        img.uploading = false;
        img.error = 'Upload fehlgeschlagen';
        onUpdate({ images: combined.map(i => i.id === img.id ? { ...i, uploading: false, error: 'Upload fehlgeschlagen' } : i) });
      }
    }
  }, [data.images, onUpdate]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(Array.from(e.dataTransfer.files));
  }, [processFiles]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) { processFiles(Array.from(e.target.files)); e.target.value = ''; }
  };

  const removeImage = (id: string) => {
    const img = data.images.find(i => i.id === id);
    if (img?.previewUrl) URL.revokeObjectURL(img.previewUrl);
    onUpdate({ images: data.images.filter(i => i.id !== id) });
  };

  const updateImageDirection = (id: string, direction: string) => {
    onUpdate({ images: data.images.map(i => i.id === id ? { ...i, description: direction } : i) });
  };

  const updateImageNotes = (id: string, additionalNotes: string) => {
    onUpdate({ images: data.images.map(i => i.id === id ? { ...i, additionalNotes } : i) });
  };

  const hasImages = data.images.length > 0;
  const canAddMore = data.images.length < MAX_IMAGES;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-[#111111] mb-1.5" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Bilder hochladen
        </h3>
        <p style={{ color: '#7A7A7A', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
          Lade deine Bilder hoch — Vektrus erstellt passende Posts dazu.
        </p>
      </div>

      <BrandProfileBadge brandProfile={brandProfile ?? null} onNavigateToBrandStudio={onNavigateToBrandStudio} />

      {!hasImages ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="relative border-2 border-dashed rounded-[var(--vektrus-radius-lg)] p-12 text-center cursor-pointer transition-all duration-200"
          style={{
            borderColor: isDragging ? '#49D69E' : '#D8D8D8',
            background: isDragging ? 'rgba(73,214,158,0.04)' : '#FAFAFA',
          }}
        >
          <input ref={fileInputRef} type="file" accept={ACCEPTED_TYPES.join(',')} multiple onChange={handleFileSelect} className="hidden" />
          <div className="w-16 h-16 mx-auto mb-4 rounded-[var(--vektrus-radius-lg)] flex items-center justify-center transition-colors" style={{ background: isDragging ? 'rgba(73,214,158,0.15)' : '#F0F0F0' }}>
            <Upload className="w-7 h-7" style={{ color: isDragging ? '#49D69E' : '#ABABAB' }} />
          </div>
          <p className="font-semibold text-[#111111] mb-1" style={{ fontFamily: 'Manrope, sans-serif', fontSize: '15px' }}>
            {isDragging ? 'Bilder hier ablegen' : 'Bilder hochladen'}
          </p>
          <p style={{ color: '#ABABAB', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>
            Drag & Drop oder klicken — JPG, PNG, WebP, max. 10 MB
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.images.map((img, i) => (
            <ImageContextCard
              key={img.id}
              img={img}
              index={i}
              onRemove={removeImage}
              onUpdateDirection={updateImageDirection}
              onUpdateNotes={updateImageNotes}
            />
          ))}

          {canAddMore && (
            <button
              onClick={() => addMoreRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 rounded-[var(--vektrus-radius-lg)] py-3 transition-all duration-200 group"
              style={{
                border: '1.5px dashed #D8D8D8',
                background: 'transparent',
                color: '#7A7A7A',
                fontFamily: 'Inter, sans-serif',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#49D69E'; (e.currentTarget as HTMLButtonElement).style.color = '#49D69E'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(73,214,158,0.04)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#D8D8D8'; (e.currentTarget as HTMLButtonElement).style.color = '#7A7A7A'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            >
              <Plus className="w-4 h-4" />
              Weiteres Bild hinzufügen
              <span style={{ color: '#ABABAB', fontWeight: 400 }}>({data.images.length}/{MAX_IMAGES})</span>
            </button>
          )}

          <input
            ref={addMoreRef}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      <div className="rounded-[var(--vektrus-radius-lg)] border border-[rgba(73,183,227,0.18)] p-4" style={{ background: '#FFFFFF' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[var(--vektrus-radius-md)] flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(73,183,227,0.1)' }}>
              <Palette className="w-5 h-5" style={{ color: '#49B7E3' }} />
            </div>
            <div>
              <p className="font-semibold text-[#111111]" style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>Corporate Identity anwenden</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#7A7A7A', marginTop: 2 }}>
                Markenfarben & Templates werden automatisch angewendet.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onUpdate({ apply_ci: !data.apply_ci })}
            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0"
            style={{ background: data.apply_ci ? '#49B7E3' : '#E0E0E0' }}
            aria-pressed={data.apply_ci}
          >
            <span
              className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200"
              style={{ transform: data.apply_ci ? 'translateX(22px)' : 'translateX(4px)' }}
            />
          </button>
        </div>
      </div>

      {data.images.some(i => i.error) && (
        <div className="flex items-start gap-2.5 rounded-[var(--vektrus-radius-md)] p-3" style={{ background: 'rgba(250,126,112,0.08)', border: '1px solid rgba(250,126,112,0.25)' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#FA7E70' }} />
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#FA7E70' }}>
            Einige Bilder konnten nicht hochgeladen werden. Entferne sie und versuche es erneut.
          </p>
        </div>
      )}
    </div>
  );
};

export default VisualStep1Upload;
