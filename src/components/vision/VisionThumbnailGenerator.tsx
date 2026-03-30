import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Download,
  Image as ImageIcon,
  Loader,
  Sparkles,
  Type,
} from 'lucide-react';
import { callN8n } from '../../lib/n8n';
import { useToast } from '../ui/toast';

type StyleOption = 'minimalistisch' | 'farbig' | 'dramatisch';

const STYLE_CONFIG: { id: StyleOption; label: string; description: string }[] = [
  { id: 'minimalistisch', label: 'Minimalistisch', description: 'Heller Hintergrund, klarer Text' },
  { id: 'farbig', label: 'Farbig', description: 'Brand-Farben prominent' },
  { id: 'dramatisch', label: 'Dramatisch', description: 'Dunkler Hintergrund, starker Kontrast' },
];

const VisionThumbnailGenerator: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [headline, setHeadline] = useState('');
  const [style, setStyle] = useState<StyleOption>('minimalistisch');
  const [context, setContext] = useState('');
  const [generating, setGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const buildPrompt = () => {
    return `Professional social media reel thumbnail, 9:16 vertical format.
Headline text: "${headline}"
Style: ${style}
Context: ${context || 'social media content'}
Clean, modern design. Text must be clearly readable.
No faces, no stock photo look. Graphic design aesthetic.`.trim();
  };

  const handleGenerate = async () => {
    if (!headline.trim()) return;
    setGenerating(true);
    setImageUrl(null);

    try {
      const prompt = buildPrompt();
      const response = await callN8n('vektrus-image-advanced', {
        prompt,
        use_brand_ci: true,
        aspect_ratio: '9:16',
        platform: 'instagram',
      });

      const imageResult = response?.data?.images?.[0]?.image_url;
      if (!imageResult) {
        throw new Error('Kein Bild in der Antwort');
      }

      setImageUrl(imageResult);
      addToast({
        type: 'success',
        title: 'Thumbnail generiert',
        description: 'Dein Thumbnail ist fertig.',
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
    <div className="h-full flex flex-col bg-[var(--vektrus-mint)] overflow-auto">
      <div className="max-w-[1240px] mx-auto w-full px-6 md:px-8 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate('/vision')}
          className="flex items-center gap-2 text-sm text-[#7A7A7A] hover:text-[#111111] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück zur Video-Werkstatt
        </button>

        {/* Page header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <ImageIcon className="w-6 h-6 text-[#EC4899]" />
            <h1 className="text-2xl font-bold text-[#111111] font-manrope">Thumbnail Generator</h1>
          </div>
          <p className="text-[#7A7A7A] text-sm">Erstelle ein Thumbnail für dein Video mit KI</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Input area */}
          <div className="space-y-5">
            {/* Headline */}
            <div className="bg-white rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.10)] shadow-subtle p-5">
              <label className="block text-sm font-semibold text-[#111111] mb-1.5">
                <Type className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                Headline *
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value.slice(0, 60))}
                placeholder="z.B. 3 Fehler, die du beim Posting machst"
                className="w-full px-3 py-3 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] text-sm focus:outline-none focus:border-[#49B7E3] focus:ring-2 focus:ring-[#49B7E3]/20"
              />
              <p className="text-xs text-[#7A7A7A]/70 mt-1">{headline.length}/60 Zeichen</p>
            </div>

            {/* Style selection */}
            <div className="bg-white rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.10)] shadow-subtle p-5">
              <label className="block text-sm font-semibold text-[#111111] mb-3">Stil</label>
              <div className="grid grid-cols-3 gap-3">
                {STYLE_CONFIG.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    className={`text-left p-3 rounded-[var(--vektrus-radius-md)] border-2 transition-all ${
                      style === s.id
                        ? 'border-[#EC4899] bg-[rgba(236,72,153,0.04)] shadow-subtle'
                        : 'border-[rgba(73,183,227,0.12)] hover:border-[rgba(236,72,153,0.3)]'
                    }`}
                  >
                    <p className="text-sm font-semibold text-[#111111]">{s.label}</p>
                    <p className="text-[11px] text-[#7A7A7A] mt-0.5">{s.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Context */}
            <div className="bg-white rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.10)] shadow-subtle p-5">
              <label className="block text-sm font-semibold text-[#111111] mb-1.5">
                Thema / Kontext (optional)
              </label>
              <input
                type="text"
                value={context}
                onChange={(e) => setContext(e.target.value.slice(0, 120))}
                placeholder="z.B. Social-Media-Strategie für Startups"
                className="w-full px-3 py-3 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] text-sm focus:outline-none focus:border-[#49B7E3] focus:ring-2 focus:ring-[#49B7E3]/20"
              />
              <p className="text-xs text-[#7A7A7A]/70 mt-1">{context.length}/120 Zeichen</p>
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={!headline.trim() || generating}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-[var(--vektrus-radius-md)] font-semibold transition-all ${
                headline.trim() && !generating
                  ? 'bg-[#49B7E3] text-white shadow-card hover:shadow-elevated'
                  : 'bg-[#F4FCFE] text-[#7A7A7A]/70 cursor-not-allowed'
              }`}
            >
              {generating ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Wird generiert...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Thumbnail generieren
                </>
              )}
            </button>
          </div>

          {/* Right: Preview area */}
          <div className="flex flex-col">
            <div
              className={`flex-1 min-h-[400px] rounded-[var(--vektrus-radius-lg)] border border-[rgba(73,183,227,0.10)] overflow-hidden flex items-center justify-center transition-all ${
                generating
                  ? 'bg-white shadow-elevated relative'
                  : imageUrl
                  ? 'bg-black shadow-card'
                  : 'bg-white shadow-subtle'
              }`}
            >
              {generating ? (
                <div className="text-center p-8 relative z-10">
                  {/* Pulse gradient glow during generation — Ebene 1 AI moment */}
                  <div
                    className="absolute inset-0 opacity-20 rounded-[var(--vektrus-radius-lg)]"
                    style={{
                      background: 'linear-gradient(135deg, #49B7E3 0%, #7C6CF2 33%, #E8A0D6 66%, #F4BE9D 100%)',
                      filter: 'blur(40px)',
                      animation: 'pulse 3s ease-in-out infinite',
                    }}
                  />
                  <Loader className="w-8 h-8 text-[#7C6CF2] animate-spin mx-auto mb-3 relative z-10" />
                  <p className="text-sm font-medium text-[#111111] relative z-10">Thumbnail wird generiert...</p>
                  <p className="text-xs text-[#7A7A7A] mt-1 relative z-10">Das dauert einige Sekunden</p>
                </div>
              ) : imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Generiertes Thumbnail"
                  className="w-auto max-w-full max-h-[600px] object-contain"
                />
              ) : (
                <div className="text-center p-8">
                  <div className="w-16 h-16 rounded-full bg-[rgba(236,72,153,0.08)] flex items-center justify-center mx-auto mb-3">
                    <ImageIcon className="w-8 h-8 text-[#EC4899]/30" />
                  </div>
                  <p className="text-sm text-[#7A7A7A]">Dein Thumbnail erscheint hier</p>
                </div>
              )}
            </div>

            {/* Download button */}
            {imageUrl && !generating && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <a
                  href={imageUrl}
                  download="vektrus-thumbnail.png"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#49B7E3] text-white rounded-[var(--vektrus-radius-md)] font-semibold shadow-card hover:shadow-elevated transition-all"
                >
                  <Download className="w-4 h-4" />
                  Thumbnail herunterladen
                </a>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisionThumbnailGenerator;
