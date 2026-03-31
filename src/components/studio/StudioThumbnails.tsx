import React, { useState, useEffect } from 'react';
import {
  Check,
  Download,
  Image as ImageIcon,
  Loader,
  RefreshCw,
  Sparkles,
  Palette,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { callN8n } from '../../lib/n8n';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../ui/toast';

type StyleOption = 'modern' | 'bold' | 'minimal' | 'elegant';

const STYLE_CONFIG: { id: StyleOption; label: string }[] = [
  { id: 'modern', label: 'Modern' },
  { id: 'bold', label: 'Bold' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'elegant', label: 'Elegant' },
];

interface BrandColors {
  primary?: string;
  secondary?: string;
  accent?: string;
}

interface StudioThumbnailsProps {
  reelTitle?: string;
  reelConceptId?: string;
}

const StudioThumbnails: React.FC<StudioThumbnailsProps> = ({ reelTitle, reelConceptId }) => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [headline, setHeadline] = useState(reelTitle || '');
  const [style, setStyle] = useState<StyleOption>('modern');
  const [generating, setGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Existing thumbnail from reel concept
  const [existingThumbnail, setExistingThumbnail] = useState<string | null>(null);
  const [savedConfirmation, setSavedConfirmation] = useState(false);

  // Brand colors
  const [brandColors, setBrandColors] = useState<BrandColors | null>(null);
  const [useBrandColors, setUseBrandColors] = useState(true);
  const [brandLoading, setBrandLoading] = useState(true);

  // Pre-fill headline from reel title
  useEffect(() => {
    if (reelTitle && !headline) setHeadline(reelTitle);
  }, [reelTitle, headline]);

  // Load existing thumbnail from reel concept
  useEffect(() => {
    if (!reelConceptId) return;
    const load = async () => {
      const { data } = await supabase
        .from('pulse_generated_content')
        .select('thumbnail_url')
        .eq('id', reelConceptId)
        .single();
      if (data?.thumbnail_url) {
        setExistingThumbnail(data.thumbnail_url);
      }
    };
    load();
  }, [reelConceptId]);

  // Load brand colors
  useEffect(() => {
    if (!user?.id) {
      setBrandLoading(false);
      return;
    }
    const load = async () => {
      const { data } = await supabase
        .from('brand_profiles')
        .select('colors')
        .eq('user_id', user.id)
        .single();

      if (data?.colors) {
        const colors =
          typeof data.colors === 'string'
            ? JSON.parse(data.colors)
            : data.colors;
        setBrandColors(colors);
      }
      setBrandLoading(false);
    };
    load();
  }, [user?.id]);

  const buildPrompt = () => {
    const colorInstruction =
      useBrandColors && brandColors?.primary
        ? `Use brand color palette: Primary ${brandColors.primary}${brandColors.secondary ? `, Secondary ${brandColors.secondary}` : ''}${brandColors.accent ? `, Accent ${brandColors.accent}` : ''}`
        : 'Use vibrant, modern colors';

    return `Create a 9:16 social media thumbnail design for a Reel video.
Display this text prominently: "${headline}"
${colorInstruction}
Style: ${style} and eye-catching
The text must be large, bold, and clearly readable.
Professional social media design aesthetic.
No photos of people, use abstract or geometric backgrounds.
Clean layout, high contrast between text and background.`;
  };

  const saveThumbnailToReel = async (url: string) => {
    if (!reelConceptId) return;
    const { error } = await supabase
      .from('pulse_generated_content')
      .update({ thumbnail_url: url })
      .eq('id', reelConceptId);

    if (!error) {
      setExistingThumbnail(url);
      setSavedConfirmation(true);
      setTimeout(() => setSavedConfirmation(false), 3000);
    }
  };

  const handleGenerate = async () => {
    if (!headline.trim()) return;
    setGenerating(true);
    setImageUrl(null);
    setSavedConfirmation(false);

    try {
      const response = await callN8n('vektrus-image-simple', {
        prompt: buildPrompt(),
        aspect_ratio: '9:16',
      });

      const result =
        response?.data?.image_url ||
        response?.data?.images?.[0]?.image_url ||
        response?.image_url;

      if (!result) throw new Error('Kein Bild in der Antwort');

      setImageUrl(result);

      // Auto-save to reel if in reel context
      if (reelConceptId) {
        await saveThumbnailToReel(result);
      }

      addToast({
        type: 'success',
        title: 'Thumbnail generiert',
        description: reelConceptId
          ? 'Thumbnail für dieses Reel gespeichert.'
          : 'Dein Thumbnail ist fertig.',
        duration: 4000,
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Fehler',
        description: 'Thumbnail konnte nicht generiert werden. Bitte versuche es erneut.',
        duration: 5000,
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto studio-scrollbar">
      <div className="flex-1 flex flex-col xl:flex-row items-start px-6 py-8 gap-8 max-w-5xl mx-auto w-full">
        {/* Left: Input area */}
        <div className="w-full xl:w-1/2 space-y-5">
          <div>
            <h2 className="text-2xl font-manrope font-bold text-[#FAFAFA]">
              Thumbnail erstellen
            </h2>
            <p className="text-[#7A7A7A] text-sm mt-1">
              Erstelle ein 9:16 Thumbnail für dein Video mit KI.
            </p>
          </div>

          {/* Existing thumbnail indicator */}
          {existingThumbnail && !imageUrl && (
            <div className="rounded-xl bg-[#121214] p-4 border border-[rgba(255,255,255,0.06)]">
              <span className="text-[11px] uppercase tracking-wider font-medium text-[#FAFAFA]/40 block mb-2">
                Aktuelles Thumbnail
              </span>
              <div className="flex items-center gap-3">
                <img
                  src={existingThumbnail}
                  alt="Aktuelles Thumbnail"
                  className="w-10 h-[72px] object-cover rounded-lg border border-[rgba(255,255,255,0.06)]"
                  style={{ aspectRatio: '9/16' }}
                />
                <p className="text-xs text-[#FAFAFA]/50">
                  Dieses Reel hat bereits ein Thumbnail. Generiere ein neues, um es zu ersetzen.
                </p>
              </div>
            </div>
          )}

          {/* Headline */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-medium text-[#FAFAFA]/40 mb-2">
              Thumbnail-Text
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value.slice(0, 60))}
              placeholder="Dein Reel-Titel..."
              className="w-full rounded-xl text-sm text-[#FAFAFA]/80 placeholder-[#FAFAFA]/20 px-4 py-3 focus:outline-none transition-colors"
              style={{
                backgroundColor: '#121214',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#49B7E3')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
            />
            <p className="text-[11px] text-[#FAFAFA]/20 mt-1">{headline.length}/60</p>
          </div>

          {/* Style selection */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-medium text-[#FAFAFA]/40 mb-2">
              Stil
            </label>
            <div className="flex gap-2">
              {STYLE_CONFIG.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border ${
                    style === s.id
                      ? 'bg-[#49B7E3]/15 text-[#49B7E3] border-[#49B7E3]/40'
                      : 'bg-[#121214] text-[#FAFAFA]/50 border-transparent hover:border-[rgba(255,255,255,0.08)]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Brand Colors */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-medium text-[#FAFAFA]/40 mb-2">
              Brand-Farben
            </label>
            {brandLoading ? (
              <div className="h-10 rounded-xl bg-[#121214] animate-pulse" />
            ) : brandColors?.primary ? (
              <div className="rounded-xl bg-[#121214] p-4 border border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Palette className="w-4 h-4 text-[#FAFAFA]/30" />
                    <div className="flex gap-2">
                      {brandColors.primary && (
                        <div
                          className="w-6 h-6 rounded-full border border-[rgba(255,255,255,0.1)]"
                          style={{ backgroundColor: brandColors.primary }}
                          title={`Primary: ${brandColors.primary}`}
                        />
                      )}
                      {brandColors.secondary && (
                        <div
                          className="w-6 h-6 rounded-full border border-[rgba(255,255,255,0.1)]"
                          style={{ backgroundColor: brandColors.secondary }}
                          title={`Secondary: ${brandColors.secondary}`}
                        />
                      )}
                      {brandColors.accent && (
                        <div
                          className="w-6 h-6 rounded-full border border-[rgba(255,255,255,0.1)]"
                          style={{ backgroundColor: brandColors.accent }}
                          title={`Accent: ${brandColors.accent}`}
                        />
                      )}
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs text-[#FAFAFA]/40">Verwenden</span>
                    <button
                      onClick={() => setUseBrandColors(!useBrandColors)}
                      className={`w-9 h-5 rounded-full relative transition-colors ${
                        useBrandColors ? 'bg-[#49B7E3]' : 'bg-[#FAFAFA]/10'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                          useBrandColors ? 'left-[18px]' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </label>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-[#121214] p-4 border border-[rgba(255,255,255,0.06)]">
                <p className="text-xs text-[#FAFAFA]/30">
                  Keine Brand-Farben hinterlegt. Es werden lebhafte Farben verwendet.
                </p>
              </div>
            )}
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={!headline.trim() || generating}
            className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              headline.trim() && !generating
                ? 'bg-[#7C6CF2] text-white hover:bg-[#6b5ce0]'
                : 'bg-[#121214] text-[#FAFAFA]/20 cursor-not-allowed'
            }`}
          >
            {generating ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Wird erstellt...
              </>
            ) : existingThumbnail ? (
              <>
                <RefreshCw className="w-4 h-4" />
                Neu generieren
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Thumbnail erstellen
              </>
            )}
          </button>

          {/* Saved confirmation */}
          {savedConfirmation && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#49D69E]/10 border border-[#49D69E]/20">
              <Check className="w-4 h-4 text-[#49D69E] flex-shrink-0" />
              <span className="text-sm text-[#49D69E]/80 font-medium">
                Thumbnail für dieses Reel gespeichert
              </span>
            </div>
          )}
        </div>

        {/* Right: Preview area */}
        <div className="w-full xl:w-1/2 flex flex-col items-center">
          <div
            className={`w-full max-w-[280px] aspect-[9/16] rounded-2xl overflow-hidden flex items-center justify-center transition-all relative ${
              generating ? 'studio-generating-glow' : ''
            }`}
            style={{
              backgroundColor: '#121214',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {generating ? (
              <div className="text-center p-6">
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    background:
                      'linear-gradient(135deg, transparent 30%, rgba(124,108,242,0.3) 50%, transparent 70%)',
                    backgroundSize: '200% 200%',
                    animation: 'studioShimmer 2s ease-in-out infinite',
                  }}
                />
                <Loader className="w-6 h-6 text-[#7C6CF2] animate-spin mx-auto mb-2" />
                <p className="text-xs text-[#FAFAFA]/30">Wird generiert...</p>
              </div>
            ) : imageUrl ? (
              <img
                src={imageUrl}
                alt="Generiertes Thumbnail"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-6">
                <ImageIcon className="w-10 h-10 text-[#FAFAFA]/10 mx-auto mb-2" />
                <p className="text-xs text-[#FAFAFA]/20">
                  Dein Thumbnail erscheint hier
                </p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          {imageUrl && !generating && (
            <div className="flex gap-3 mt-5">
              <a
                href={imageUrl}
                download="vektrus-thumbnail.png"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-[#FAFAFA]/60 hover:text-[#FAFAFA] border border-[#FAFAFA]/10 hover:border-[#FAFAFA]/20 transition-colors bg-transparent"
              >
                <Download className="w-4 h-4" />
                Herunterladen
              </a>
              <button
                onClick={() => {
                  setImageUrl(null);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#49B7E3] text-white hover:bg-[#3aa5d1] transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Nochmal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudioThumbnails;
