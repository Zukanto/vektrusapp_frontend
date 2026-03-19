import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, ChevronDown, Upload, Loader as Loader2, RefreshCw, Download, Plus, Check, Palette, Package } from 'lucide-react';
import { ImageGenerationService, AdvancedImageVariant, GenerationProgress } from '../../services/imageGenerationService';
import { ImageGeneration } from '../ui/ai-chat-image-generation';
import { supabase } from '../../lib/supabase';

interface AiImageGenerationModalProps {
  onGenerate: (imageUrl: string) => void;
  onClose: () => void;
  initialPrompt?: string;
  onNavigateToPlanner?: (mediaFileId: string, imageUrl: string) => void;
}

type AspectRatio = '1:1' | '4:5' | '9:16' | '16:9';

interface PlatformTag {
  label: string;
  ratio: AspectRatio;
  badge: string | null;
}

interface ContentTag {
  label: string;
  prompt: string;
}

const PLATFORM_TAGS: PlatformTag[] = [
  { label: 'Instagram Feed', ratio: '4:5', badge: 'Empfohlen für Instagram Feed' },
  { label: 'Instagram Story', ratio: '9:16', badge: 'Empfohlen für Stories & Reels' },
  { label: 'LinkedIn', ratio: '1:1', badge: 'Empfohlen für LinkedIn' },
  { label: 'TikTok / Reels', ratio: '9:16', badge: 'Empfohlen für TikTok & Reels' },
  { label: 'Allgemein', ratio: '1:1', badge: null },
];

const CONTENT_TAGS: ContentTag[] = [
  { label: 'Produkt vorstellen', prompt: 'Professionelle Produktpräsentation, cleaner Hintergrund, hochwertige Qualität, ansprechende Komposition' },
  { label: 'Angebot bewerben', prompt: 'Attraktives Werbebild für ein besonderes Angebot, auffällig und klar strukturiert, call-to-action orientiert' },
  { label: 'Team zeigen', prompt: 'Authentisches Teamfoto, moderne Arbeitsumgebung, professionell aber sympathisch, natürliches Licht' },
  { label: 'Event ankündigen', prompt: 'Einladendes Event-Bild, professionelle Atmosphäre, Vorfreude weckend, modernes Design' },
  { label: 'Tipp teilen', prompt: 'Ansprechendes Wissensbild, klare visuelle Struktur, professionell und vertrauenswürdig' },
];

const FORMAT_CARDS = [
  { ratio: '1:1' as AspectRatio, label: 'Quadrat', sub: '1:1', w: 32, h: 32 },
  { ratio: '4:5' as AspectRatio, label: 'Portrait', sub: '4:5', w: 26, h: 32 },
  { ratio: '9:16' as AspectRatio, label: 'Story', sub: '9:16', w: 18, h: 32 },
  { ratio: '16:9' as AspectRatio, label: 'Quer', sub: '16:9', w: 40, h: 25 },
];

const AiImageGenerationModal: React.FC<AiImageGenerationModalProps> = ({
  onGenerate,
  onClose,
  initialPrompt,
  onNavigateToPlanner,
}) => {
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<HTMLDivElement>(null);

  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>('1:1');
  const [badge, setBadge] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);

  const [inspirationUrl, setInspirationUrl] = useState<string | null>(null);
  const [productUrl, setProductUrl] = useState<string | null>(null);
  const [inspirationUploading, setInspirationUploading] = useState(false);
  const [productUploading, setProductUploading] = useState(false);
  const [inspirationError, setInspirationError] = useState<string | null>(null);
  const [productError, setProductError] = useState<string | null>(null);
  const [stilOpen, setStilOpen] = useState(false);
  const [produktOpen, setProduktOpen] = useState(false);

  const [variants, setVariants] = useState(1);

  const [isGenerating, setIsGenerating] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [simpleResult, setSimpleResult] = useState<{ url: string; mediaFileId: string } | null>(null);
  const [advancedResults, setAdvancedResults] = useState<AdvancedImageVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);

  const [showLightbox, setShowLightbox] = useState(false);
  const [confirmContent, setConfirmContent] = useState<ContentTag | null>(null);

  const MAX_CHARS = 500;
  const hasResult = simpleResult !== null || advancedResults.length > 0;
  const hasRefs = !!(inspirationUrl || productUrl);
  const anyUploading = inspirationUploading || productUploading;
  const canGenerate = prompt.trim().length > 0 && !isGenerating && !anyUploading;

  useEffect(() => {
    const t = setTimeout(() => promptRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!isGenerating && showAnimation && hasResult) {
      const t = setTimeout(() => setShowAnimation(false), 1800);
      return () => clearTimeout(t);
    }
  }, [isGenerating, showAnimation, hasResult]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape' && showLightbox) setShowLightbox(false); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [showLightbox]);

  const uploadReferenceImage = async (file: File, userId: string): Promise<string> => {
    const timestamp = Date.now();
    const sanitized = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `reference-images/${userId}/${timestamp}-${sanitized}`;
    const { data, error } = await supabase.storage
      .from('user-images')
      .upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type });
    if (error) throw new Error(error.message);
    const { data: { publicUrl } } = supabase.storage.from('user-images').getPublicUrl(data.path);
    return publicUrl;
  };

  const handleInspirationFile = async (file: File | null) => {
    if (!file) { setInspirationUrl(null); setInspirationError(null); return; }
    setInspirationUploading(true);
    setInspirationError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Nicht eingeloggt');
      const url = await uploadReferenceImage(file, session.user.id);
      setInspirationUrl(url);
    } catch {
      setInspirationError('Upload fehlgeschlagen, bitte erneut versuchen');
      setInspirationUrl(null);
    } finally {
      setInspirationUploading(false);
    }
  };

  const handleProductFile = async (file: File | null) => {
    if (!file) { setProductUrl(null); setProductError(null); return; }
    setProductUploading(true);
    setProductError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Nicht eingeloggt');
      const url = await uploadReferenceImage(file, session.user.id);
      setProductUrl(url);
    } catch {
      setProductError('Upload fehlgeschlagen, bitte erneut versuchen');
      setProductUrl(null);
    } finally {
      setProductUploading(false);
    }
  };

  const handlePlatformClick = (tag: PlatformTag) => {
    if (selectedPlatform === tag.label) {
      setSelectedPlatform(null);
      setBadge(null);
    } else {
      setSelectedPlatform(tag.label);
      setSelectedRatio(tag.ratio);
      setBadge(tag.badge);
    }
  };

  const applyContent = (tag: ContentTag) => {
    if (prompt.trim() && prompt !== tag.prompt) {
      setConfirmContent(tag);
    } else {
      doApplyContent(tag);
    }
  };

  const doApplyContent = (tag: ContentTag) => {
    setPrompt(tag.prompt);
    setSelectedContent(tag.label);
    setConfirmContent(null);
  };

  const selectFormat = (r: AspectRatio) => {
    setSelectedRatio(r);
    setBadge(null);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) { setError('Bitte gib eine Bildbeschreibung ein'); return; }
    setIsGenerating(true);
    setShowAnimation(true);
    setError(null);
    setSimpleResult(null);
    setAdvancedResults([]);
    setSelectedVariant(null);
    setProgress(null);
    setTimeout(() => {
      animationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
    try {
      if (hasRefs || variants > 1) {
        const res = await ImageGenerationService.generateAdvancedImage({
          prompt,
          inspirationImageUrl: inspirationUrl || undefined,
          productImageUrl: productUrl || undefined,
          count: variants,
          aspect_ratio: selectedRatio,
          onProgress: (p) => setProgress(p),
        });
        if (res.success && res.data?.images?.length > 0) {
          const valid = res.data.images.filter((i: AdvancedImageVariant) => i.image_url?.trim());
          if (!valid.length) throw new Error('Keine gültigen Bild-URLs erhalten.');
          setAdvancedResults(valid);
          setSelectedVariant(valid[0].variant_number);
        } else {
          throw new Error(res.message || 'Keine Bilder generiert');
        }
      } else {
        const res = await ImageGenerationService.generateImage(prompt, 'gpt-image-1', selectedRatio);
        if (res.success && res.data.image_url) {
          setSimpleResult({ url: res.data.image_url, mediaFileId: res.data.media_file_id });
        } else {
          throw new Error(res.message || 'Bildgenerierung fehlgeschlagen');
        }
      }
    } catch (e: any) {
      setError(e.message || 'Fehler bei der Bildgenerierung');
      setShowAnimation(false);
    } finally {
      setIsGenerating(false);
      setProgress(null);
    }
  };

  const handleUseImage = () => {
    if (simpleResult) {
      onGenerate(simpleResult.url);
      onNavigateToPlanner?.(simpleResult.mediaFileId, simpleResult.url);
    } else if (selectedVariant !== null) {
      const img = advancedResults.find(i => i.variant_number === selectedVariant);
      if (img) { onGenerate(img.image_url); onNavigateToPlanner?.(img.media_file_id, img.image_url); }
    }
  };

  const handleDownload = async (url?: string, num?: number) => {
    const target = url || simpleResult?.url;
    if (!target) return;
    try {
      const blob = await (await fetch(target)).blob();
      const a = Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(blob),
        download: num ? `vektrus-variant-${num}-${Date.now()}.png` : `vektrus-${Date.now()}.png`,
      });
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } catch {}
  };

  const btnLabel = variants === 1 ? 'Bild generieren' : `${variants} Varianten generieren`;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-[var(--vektrus-radius-lg)] w-full max-w-[580px] max-h-[92vh] flex flex-col shadow-modal overflow-hidden">

          {/* ── Header ── */}
          <div className="flex items-center justify-between px-6 pt-[18px] pb-4 border-b border-[rgba(73,183,227,0.10)] flex-shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-[#49B7E3]" />
              <span className="font-manrope text-lg font-bold text-[#111111]">Bild generieren</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#7A7A7A] hover:text-[#111111] hover:bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* ── Scrollable body ── */}
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-[18px]">

            {/* Section 1 — Prompt */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#111111]">Beschreibe dein Bild</label>
              <textarea
                ref={promptRef}
                value={prompt}
                onChange={e => { if (e.target.value.length <= MAX_CHARS) setPrompt(e.target.value); }}
                rows={4}
                placeholder="z.B. Unser neues Produkt auf weißem Hintergrund, professionell und modern..."
                className="w-full border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] p-3 text-[15px] text-[#111111] resize-none outline-none leading-relaxed transition-colors focus:border-[#49B7E3] focus:ring-1 focus:ring-[#49B7E3]/20 placeholder:text-[#B0B0B0]"
              />
              <div className="text-right text-xs text-[#7A7A7A]">
                {prompt.length} / {MAX_CHARS}
              </div>
            </div>

            {/* Section 2 — Platform + Content rows */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <span className="text-xs text-[#7A7A7A]">Plattform</span>
                <div className="flex flex-wrap gap-[7px]">
                  {PLATFORM_TAGS.map(tag => (
                    <QuickTagPill
                      key={tag.label}
                      label={tag.label}
                      active={selectedPlatform === tag.label}
                      onClick={() => handlePlatformClick(tag)}
                    />
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs text-[#7A7A7A]">Schnellstart</span>
                <div className="flex flex-wrap gap-[7px]">
                  {CONTENT_TAGS.map(tag => (
                    <QuickTagPill
                      key={tag.label}
                      label={tag.label}
                      active={selectedContent === tag.label}
                      onClick={() => applyContent(tag)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Section 3 — Format */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#111111]">Format</label>
              <div className="flex gap-2">
                {FORMAT_CARDS.map(f => {
                  const sel = selectedRatio === f.ratio;
                  return (
                    <button
                      key={f.ratio}
                      onClick={() => selectFormat(f.ratio)}
                      className={`flex-1 flex flex-col items-center gap-2 py-3 px-2 rounded-[var(--vektrus-radius-sm)] border-2 transition-all ${
                        sel
                          ? 'border-[#49B7E3] bg-[#F4FCFE] shadow-subtle'
                          : 'border-[rgba(73,183,227,0.18)] bg-white hover:shadow-subtle'
                      }`}
                    >
                      <div
                        className={`rounded-[3px] flex-shrink-0 ${sel ? 'bg-[#49B7E3]' : 'bg-[#CBD5E1]'}`}
                        style={{ width: f.w, height: f.h }}
                      />
                      <div className="text-center">
                        <div className="text-[13px] font-semibold text-[#111111] leading-tight">{f.label}</div>
                        <div className="text-[11px] text-[#7A7A7A] mt-0.5">{f.sub}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {badge && (
                <span className="text-xs text-[#49B7E3]">{badge}</span>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-[rgba(73,183,227,0.10)]" />

            {/* Section 4 — Collapsibles */}
            <div className="flex flex-col">
              <CollapsibleSection
                icon={<Palette size={16} className="text-[#7A7A7A]" />}
                label="Stil-Referenz"
                sub="Visuellen Stil vorgeben"
                open={stilOpen}
                onToggle={() => setStilOpen(v => !v)}
                hasFile={!!inspirationUrl}
              >
                <p className="text-[13px] text-[#7A7A7A] mb-3">
                  Lade ein Bild hoch, dessen Stil übernommen werden soll.
                </p>
                <FileUploadArea
                  uploadedUrl={inspirationUrl}
                  onFile={handleInspirationFile}
                  isUploading={inspirationUploading}
                  uploadError={inspirationError}
                  disabled={isGenerating}
                />
              </CollapsibleSection>

              <div className="h-px bg-[rgba(73,183,227,0.10)]" />

              <CollapsibleSection
                icon={<Package size={16} className="text-[#7A7A7A]" />}
                label="Produktbild"
                sub="Produkt einbauen"
                open={produktOpen}
                onToggle={() => setProduktOpen(v => !v)}
                hasFile={!!productUrl}
              >
                <p className="text-[13px] text-[#7A7A7A] mb-3">
                  Lade ein Produktbild hoch, das im generierten Bild erscheinen soll.
                </p>
                <FileUploadArea
                  uploadedUrl={productUrl}
                  onFile={handleProductFile}
                  isUploading={productUploading}
                  uploadError={productError}
                  disabled={isGenerating}
                />
              </CollapsibleSection>
            </div>

            {/* Divider */}
            <div className="h-px bg-[rgba(73,183,227,0.10)]" />

            {/* Section 5 — Varianten */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#111111]">Anzahl Varianten</span>
                <span className="text-sm font-bold text-[#49B7E3]">{variants}</span>
              </div>
              <VariantSlider value={variants} onChange={setVariants} disabled={isGenerating} />
              {variants > 1 && (
                <span className="text-xs text-[#7A7A7A]">
                  Je mehr Varianten, desto länger dauert die Generierung (ca. 30–90 Sek.)
                </span>
              )}
            </div>

            {/* Loading */}
            {showAnimation && (
              <div ref={animationRef} className="flex flex-col items-center gap-3">
                <ImageGeneration isGenerating={isGenerating}>
                  <img
                    className="aspect-square w-full object-cover max-w-[300px]"
                    src={
                      advancedResults[0]?.image_url ||
                      simpleResult?.url ||
                      'https://res.cloudinary.com/dcgwtngml/image/upload/v1770988078/image_generationbild_mvckif.png'
                    }
                    alt="Generierung läuft"
                  />
                </ImageGeneration>
                {isGenerating && (
                  <div className="text-center">
                    {progress ? (
                      <>
                        <p className="text-sm font-medium text-[#111111] mb-1.5">{progress.message}</p>
                        {progress.percent != null && (
                          <div className="w-[300px] mx-auto">
                            <div className="h-[5px] bg-[rgba(73,183,227,0.18)] rounded-full">
                              <div className="h-full bg-[#49B7E3] rounded-full transition-[width] duration-400" style={{ width: `${progress.percent}%` }} />
                            </div>
                            <p className="text-[11px] text-[#7A7A7A] mt-1">{progress.percent}%</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-[#111111] mb-1">
                          {variants === 1 ? 'Bild wird generiert...' : `${variants} Varianten werden generiert...`}
                        </p>
                        <p className="text-xs text-[#7A7A7A]">Dies kann bis zu 2 Minuten dauern</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Error */}
            {error && !isGenerating && !showAnimation && (
              <div className="p-3 bg-[rgba(250,126,112,0.08)] border border-[#FA7E70]/30 rounded-[var(--vektrus-radius-sm)]">
                <p className="text-[13px] text-[#FA7E70]">{error}</p>
              </div>
            )}

            {/* Simple result */}
            {simpleResult && !isGenerating && !showAnimation && (
              <div className="flex flex-col gap-2.5">
                <div
                  className="rounded-[var(--vektrus-radius-md)] overflow-hidden shadow-card cursor-zoom-in"
                  onClick={() => setShowLightbox(true)}
                >
                  <img src={simpleResult.url} alt="Generiert" className="w-full block max-h-[360px] object-contain bg-[#F4FCFE]" />
                </div>
                <div className="flex gap-2">
                  <ActionBtn icon={<RefreshCw size={14} />} label="Neu generieren" variant="outline-blue" onClick={handleGenerate} />
                  <ActionBtn icon={<Download size={14} />} label="Herunterladen" variant="outline-gray" onClick={() => handleDownload()} />
                </div>
              </div>
            )}

            {/* Advanced results */}
            {advancedResults.length > 0 && !isGenerating && !showAnimation && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2.5 p-2.5 px-3.5 rounded-[var(--vektrus-radius-sm)] bg-[#F4FCFE] border border-[rgba(73,183,227,0.18)]">
                  <div className="w-7 h-7 rounded-full bg-[#49B7E3] flex items-center justify-center flex-shrink-0">
                    <Check size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="font-manrope text-[13px] font-bold text-[#111111]">
                      {advancedResults.length} {advancedResults.length === 1 ? 'Variante' : 'Varianten'} generiert
                    </p>
                    <p className="text-[11px] text-[#7A7A7A]">Klicke zum Auswählen</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {advancedResults.map(img => {
                    const sel = selectedVariant === img.variant_number;
                    return (
                      <div
                        key={img.variant_number}
                        onClick={() => setSelectedVariant(img.variant_number)}
                        className={`relative rounded-[var(--vektrus-radius-sm)] overflow-hidden cursor-pointer transition-all ${
                          sel ? 'ring-2 ring-[#49B7E3] ring-offset-2' : 'ring-2 ring-transparent'
                        }`}
                      >
                        <img
                          src={img.image_url}
                          alt={`Variante ${img.variant_number}`}
                          className="w-full aspect-square object-cover block"
                          onError={e => { (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjwvc3ZnPg=='; }}
                        />
                        <span className="absolute top-1.5 left-1.5 px-[7px] py-0.5 bg-black/55 text-white text-[10px] font-medium rounded-full">
                          V{img.variant_number}
                        </span>
                        <button
                          onClick={e => { e.stopPropagation(); handleDownload(img.image_url, img.variant_number); }}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/55 hover:bg-black/70 flex items-center justify-center transition-colors"
                        >
                          <Download size={11} className="text-white" />
                        </button>
                        {sel && (
                          <div className="absolute inset-0 bg-[rgba(73,183,227,0.08)] flex items-center justify-center pointer-events-none">
                            <div className="w-7 h-7 rounded-full bg-[#49B7E3] flex items-center justify-center">
                              <Check size={14} className="text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <ActionBtn icon={<RefreshCw size={14} />} label="Neu generieren" variant="outline-blue" onClick={handleGenerate} />
                  {selectedVariant !== null && (
                    <>
                      <ActionBtn
                        icon={<Download size={14} />}
                        label="Herunterladen"
                        variant="outline-gray"
                        onClick={() => { const i = advancedResults.find(x => x.variant_number === selectedVariant); if (i) handleDownload(i.image_url, i.variant_number); }}
                      />
                      <ActionBtn icon={<Plus size={14} />} label="Bild verwenden" variant="primary" onClick={handleUseImage} />
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="px-6 py-4 border-t border-[rgba(73,183,227,0.10)] flex items-center justify-between flex-shrink-0 bg-white">
            <button
              onClick={onClose}
              className="text-sm font-medium text-[#7A7A7A] hover:text-[#111111] py-2.5 px-1 transition-colors"
            >
              Abbrechen
            </button>

            {hasResult ? (
              <button
                onClick={handleUseImage}
                className="flex items-center gap-[7px] px-5 py-2.5 rounded-[10px] bg-[#49B7E3] text-white text-sm font-semibold shadow-card hover:shadow-elevated transition-all"
              >
                <Sparkles size={15} />
                In Post verwenden
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className={`flex items-center gap-[7px] px-5 py-2.5 rounded-[10px] text-sm font-semibold transition-all ${
                  canGenerate
                    ? 'bg-[var(--vektrus-ai-violet)] text-white shadow-card hover:shadow-elevated'
                    : 'bg-[rgba(73,183,227,0.12)] text-[#7A7A7A] cursor-not-allowed'
                }`}
              >
                {isGenerating ? (
                  <><Loader2 size={15} className="animate-spin" />Wird generiert...</>
                ) : anyUploading ? (
                  <><Loader2 size={15} className="animate-spin" />Bilder werden hochgeladen...</>
                ) : (
                  <><Sparkles size={15} />{btnLabel}</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirm content replacement */}
      {confirmContent && (
        <div className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[var(--vektrus-radius-lg)] p-6 max-w-[360px] w-full shadow-elevated">
            <h3 className="font-manrope text-base font-bold text-[#111111] mb-2">Text ersetzen?</h3>
            <p className="text-sm text-[#7A7A7A] mb-5">Du hast bereits Text eingegeben. Soll er durch die Vorlage ersetzt werden?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmContent(null)}
                className="px-4 py-2 rounded-[10px] border border-[rgba(73,183,227,0.18)] bg-white text-[#7A7A7A] text-sm font-medium hover:bg-[#F4FCFE] transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={() => doApplyContent(confirmContent)}
                className="px-4 py-2 rounded-[10px] bg-[#49B7E3] text-white text-sm font-medium shadow-card hover:shadow-elevated transition-all"
              >
                Ersetzen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {showLightbox && simpleResult && (
        <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4" onClick={() => setShowLightbox(false)}>
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X size={28} />
          </button>
          <img src={simpleResult.url} alt="Vollbild" className="max-w-full max-h-full object-contain" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </>
  );
};

/* ── Sub-components ── */

const QuickTagPill: React.FC<{ label: string; active?: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3.5 py-1.5 rounded-full border text-[13px] whitespace-nowrap transition-all ${
      active
        ? 'border-[#49B7E3] bg-[#F4FCFE] text-[#49B7E3] font-medium'
        : 'border-[rgba(73,183,227,0.18)] bg-white text-[#111111] hover:border-[#49B7E3] hover:bg-[#F4FCFE] hover:text-[#49B7E3]'
    }`}
  >
    {label}
  </button>
);

const CollapsibleSection: React.FC<{
  icon: React.ReactNode;
  label: string;
  sub: string;
  open: boolean;
  onToggle: () => void;
  hasFile: boolean;
  children: React.ReactNode;
}> = ({ icon, label, sub, open, onToggle, hasFile, children }) => (
  <div>
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between py-3.5 bg-transparent border-none cursor-pointer"
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium text-[#111111]">
          {label}
          {hasFile && <span className="inline-block w-[7px] h-[7px] rounded-full bg-[#49B7E3] ml-1.5 align-middle" />}
        </span>
        <span className="text-xs text-[#7A7A7A]">{sub}</span>
      </div>
      <ChevronDown
        size={16}
        className={`text-[#7A7A7A] flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      />
    </button>
    {open && <div className="pb-3.5">{children}</div>}
  </div>
);

const FileUploadArea: React.FC<{
  uploadedUrl: string | null;
  onFile: (f: File | null) => void;
  isUploading: boolean;
  uploadError: string | null;
  disabled: boolean;
}> = ({ uploadedUrl, onFile, isUploading, uploadError, disabled }) => {
  if (isUploading) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] p-6 bg-[#F4FCFE]">
        <Loader2 size={20} className="text-[#49B7E3] animate-spin" />
        <span className="text-[13px] text-[#7A7A7A]">Wird hochgeladen...</span>
      </div>
    );
  }

  if (uploadError) {
    return (
      <div className="flex flex-col gap-2">
        <div className="p-2.5 px-3.5 bg-[rgba(250,126,112,0.08)] border border-[#FA7E70]/30 rounded-[var(--vektrus-radius-sm)]">
          <p className="text-[13px] text-[#FA7E70]">{uploadError}</p>
        </div>
        <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] border border-[rgba(73,183,227,0.18)] bg-white hover:border-[#49B7E3] hover:bg-[#F4FCFE] cursor-pointer transition-all w-fit text-[13px] text-[#7A7A7A] hover:text-[#49B7E3]">
          <Upload size={14} />
          <span>Erneut versuchen</span>
          <input type="file" accept="image/*" onChange={e => { if (e.target.files?.[0]) onFile(e.target.files[0]); }} disabled={disabled} className="hidden" />
        </label>
      </div>
    );
  }

  if (uploadedUrl) {
    return (
      <div className="relative inline-block">
        <img src={uploadedUrl} alt="Preview" className="w-20 h-20 object-cover rounded-[var(--vektrus-radius-sm)] block border border-[rgba(73,183,227,0.18)]" />
        <button
          onClick={() => onFile(null)}
          disabled={disabled}
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#FA7E70] hover:bg-[#f96555] flex items-center justify-center transition-colors"
        >
          <X size={10} className="text-white" />
        </button>
      </div>
    );
  }

  return (
    <label className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-[rgba(73,183,227,0.18)] hover:border-[#49B7E3] rounded-[var(--vektrus-radius-md)] p-6 bg-[#FAFCFE] hover:bg-[#F4FCFE] cursor-pointer transition-all">
      <Upload size={18} className="text-[#7A7A7A]" />
      <span className="text-sm text-[#7A7A7A]">Bild auswählen</span>
      <input type="file" accept="image/*" onChange={e => { if (e.target.files?.[0]) onFile(e.target.files[0]); }} disabled={disabled} className="hidden" />
    </label>
  );
};

const VariantSlider: React.FC<{ value: number; onChange: (v: number) => void; disabled: boolean }> = ({ value, onChange, disabled }) => {
  const pct = ((value - 1) / 2) * 100;
  return (
    <div className="relative">
      <input
        type="range"
        min={1}
        max={3}
        step={1}
        value={value}
        disabled={disabled}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1 appearance-none rounded-full outline-none cursor-pointer disabled:cursor-not-allowed"
        style={{
          background: `linear-gradient(to right, #49B7E3 ${pct}%, rgba(73,183,227,0.18) ${pct}%)`,
        }}
      />
      <style>{`
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #49B7E3; cursor: pointer; box-shadow: 0 1px 4px rgba(73,183,227,0.4); }
        input[type=range]::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%; background: #49B7E3; cursor: pointer; border: none; box-shadow: 0 1px 4px rgba(73,183,227,0.4); }
      `}</style>
    </div>
  );
};

const ActionBtn: React.FC<{ icon: React.ReactNode; label: string; variant: 'outline-blue' | 'outline-gray' | 'primary'; onClick: () => void }> = ({ icon, label, variant, onClick }) => {
  const styles: Record<string, string> = {
    'outline-blue': 'border border-[#49B7E3] bg-white text-[#49B7E3] hover:bg-[#F4FCFE]',
    'outline-gray': 'border border-[rgba(73,183,227,0.18)] bg-white text-[#7A7A7A] hover:border-[#49B7E3] hover:text-[#49B7E3]',
    'primary': 'bg-[#49B7E3] text-white shadow-card hover:shadow-elevated',
  };
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] text-[13px] font-medium transition-all ${styles[variant]}`}
    >
      {icon}{label}
    </button>
  );
};

export default AiImageGenerationModal;
