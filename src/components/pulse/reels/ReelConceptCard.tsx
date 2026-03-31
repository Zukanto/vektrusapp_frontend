import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ChevronDown, ChevronUp, Clock, Copy, Eye, Music, Sparkles, Type, ArrowRight, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { ReelContent } from '../../../services/reelService';

interface ReelConceptCardProps {
  content: ReelContent;
  index: number;
  contentId?: string;
}

const FORMAT_LABELS: Record<string, string> = {
  talking_head: 'Talking Head',
  produkt_showcase: 'Produkt-Showcase',
  tutorial: 'Tutorial',
  behind_the_scenes: 'Behind the Scenes',
  vorher_nachher: 'Vorher/Nachher',
  b_roll_montage: 'B-Roll Montage',
  listicle: 'Listicle',
};

const HOOK_TYPE_LABELS: Record<string, string> = {
  widerspruch: 'Widerspruch',
  zahl: 'Zahl',
  visuell: 'Visuell',
  frage: 'Frage',
  statement: 'Statement',
};

const DELIVERY_LABELS: Record<string, string> = {
  gesprochen: 'Gesprochen',
  text_overlay: 'Text-Overlay',
  beides: 'Beides',
};

const DIFFICULTY_STYLES: Record<string, { bg: string; color: string }> = {
  einfach: { bg: 'rgba(73, 214, 158, 0.12)', color: 'var(--vektrus-success)' },
  mittel: { bg: 'rgba(73, 183, 227, 0.12)', color: 'var(--vektrus-blue)' },
  fortgeschritten: { bg: 'rgba(124, 108, 242, 0.12)', color: 'var(--vektrus-ai-violet)' },
};

const ReelConceptCard: React.FC<ReelConceptCardProps> = ({ content, index, contentId }) => {
  const navigate = useNavigate();
  const [voiceoverOpen, setVoiceoverOpen] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const diffStyle = DIFFICULTY_STYLES[content.difficulty] || DIFFICULTY_STYLES.mittel;

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(
        content.caption + '\n\n' + content.hashtags.map(h => (h.startsWith('#') ? h : `#${h}`)).join(' ')
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.35 }}
      className="rounded-[var(--vektrus-radius-lg)] bg-white border border-[var(--vektrus-border-subtle)] shadow-card overflow-hidden"
    >
      {/* Header */}
      <div className="p-5 pb-4">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F3F4F6] text-[#374151]">
              {FORMAT_LABELS[content.format] || content.format}
            </span>
            <span
              className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold"
              style={{ backgroundColor: diffStyle.bg, color: diffStyle.color }}
            >
              {content.difficulty}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] text-[var(--vektrus-gray)]">
            <Clock className="w-3 h-3" />
            {content.estimated_effort}
          </span>
        </div>

        <h3 className="font-manrope font-bold text-[20px] text-[var(--vektrus-anthrazit)] leading-tight">
          {content.title}
        </h3>
      </div>

      {/* Hook — AI Layer (Ebene 1) */}
      <div className="mx-5 mb-4 p-4 rounded-[var(--vektrus-radius-md)] glass-panel">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
            style={{ backgroundColor: 'var(--vektrus-blue)' }}
          >
            Hook: {HOOK_TYPE_LABELS[content.hook.type] || content.hook.type}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F3F4F6] text-[#6B7280]">
            {DELIVERY_LABELS[content.hook.delivery] || content.hook.delivery}
          </span>
        </div>
        <p className="text-[15px] font-semibold text-[var(--vektrus-anthrazit)] leading-snug">
          „{content.hook.text}"
        </p>
      </div>

      {/* Szenen-Timeline */}
      <div className="px-5 mb-4">
        <p className="text-xs font-semibold text-[var(--vektrus-gray)] uppercase tracking-wide mb-3">
          Szenen ({content.scenes.length}) · {content.total_duration_seconds}s gesamt
        </p>
        <div className="space-y-3">
          {content.scenes.map(scene => (
            <div key={scene.nr} className="flex gap-3">
              {/* Left: Number + Duration */}
              <div className="flex flex-col items-center flex-shrink-0 w-10">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                  style={{ backgroundColor: 'var(--vektrus-blue)' }}
                >
                  {scene.nr}
                </div>
                <span className="text-[10px] text-[var(--vektrus-gray)] mt-1">
                  {scene.duration_seconds}s
                </span>
              </div>

              {/* Right: Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--vektrus-anthrazit)] leading-snug">
                  {scene.action}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[10px] text-[var(--vektrus-gray)] bg-[#F3F4F6] px-1.5 py-0.5 rounded">
                    <Camera className="w-2.5 h-2.5" />
                    {scene.camera}
                  </span>
                  {scene.text_overlay && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                      <Type className="w-2.5 h-2.5" />
                      {scene.text_overlay}
                    </span>
                  )}
                </div>
                {scene.tip && (
                  <p className="text-[11px] text-[var(--vektrus-gray)] italic mt-1">
                    Tipp: {scene.tip}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Voiceover Script (collapsible) */}
      {content.voiceover_script && (
        <div className="mx-5 mb-4">
          <button
            onClick={() => setVoiceoverOpen(!voiceoverOpen)}
            className="flex items-center gap-2 text-sm font-semibold text-[var(--vektrus-anthrazit)] hover:text-[var(--vektrus-blue)] transition-colors w-full text-left"
          >
            {voiceoverOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Voiceover-Skript anzeigen
          </button>
          {voiceoverOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
              className="mt-2 p-4 rounded-[var(--vektrus-radius-sm)] bg-[#F9FAFB] text-sm text-[var(--vektrus-anthrazit)] leading-relaxed"
              style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: '13px' }}
            >
              {content.voiceover_script}
            </motion.div>
          )}
        </div>
      )}

      {/* Audio Suggestion */}
      {content.audio_suggestion && (
        <div className="mx-5 mb-4 flex items-center gap-2 text-sm">
          <Music className="w-3.5 h-3.5 text-[var(--vektrus-gray)]" />
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F3F4F6] text-[#374151]">
            {content.audio_suggestion.type}
          </span>
          <span className="text-xs text-[var(--vektrus-gray)]">{content.audio_suggestion.note}</span>
        </div>
      )}

      {/* "Warum es funktioniert" (collapsible, AI accent) */}
      <div className="mx-5 mb-4">
        <button
          onClick={() => setWhyOpen(!whyOpen)}
          className="flex items-center gap-2 text-sm font-semibold text-[var(--vektrus-anthrazit)] hover:text-[var(--vektrus-ai-violet)] transition-colors w-full text-left"
        >
          <Sparkles className="w-4 h-4" style={{ color: 'var(--vektrus-ai-violet)' }} />
          {whyOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          Warum es funktioniert
        </button>
        {whyOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.2 }}
            className="mt-2 p-4 rounded-[var(--vektrus-radius-sm)] text-sm text-[var(--vektrus-anthrazit)] leading-relaxed"
            style={{ borderLeft: '3px solid var(--vektrus-ai-violet)', backgroundColor: 'rgba(124, 108, 242, 0.04)' }}
          >
            {content.why_it_works}
          </motion.div>
        )}
      </div>

      {/* Caption + Hashtags */}
      <div className="mx-5 mb-4 space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-semibold text-[var(--vektrus-gray)] uppercase tracking-wide">Caption</p>
            <button
              onClick={handleCopyCaption}
              className="flex items-center gap-1 text-[11px] font-medium text-[var(--vektrus-blue)] hover:text-[var(--vektrus-ai-violet)] transition-colors"
            >
              <Copy className="w-3 h-3" />
              {copied ? 'Kopiert!' : 'Kopieren'}
            </button>
          </div>
          <p className="text-sm text-[var(--vektrus-anthrazit)] leading-relaxed bg-[#F9FAFB] rounded-[var(--vektrus-radius-sm)] p-3">
            {content.caption}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {content.hashtags.map((tag, i) => (
            <span
              key={i}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium"
              style={{ backgroundColor: 'var(--vektrus-mint)', color: 'var(--vektrus-blue)' }}
            >
              {tag.startsWith('#') ? tag : `#${tag}`}
            </span>
          ))}
        </div>
      </div>

      {/* Footer CTAs */}
      <div className="px-5 py-4 border-t border-[var(--vektrus-border-subtle)] flex items-center justify-between">
        <button
          className="flex items-center gap-2 text-sm font-medium text-[var(--vektrus-gray)] hover:text-[var(--vektrus-anthrazit)] transition-colors"
          disabled
          title="Kommt in einem zukünftigen Update"
        >
          <RefreshCw className="w-4 h-4" />
          Neu generieren
        </button>
        {contentId ? (
          <button
            onClick={() => navigate(`/studio/${contentId}`)}
            className="flex items-center gap-2 text-sm font-semibold text-white px-4 py-2 rounded-[var(--vektrus-radius-sm)] transition-all shadow-card hover:shadow-elevated"
            style={{ backgroundColor: 'var(--vektrus-blue)' }}
          >
            <Eye className="w-4 h-4" />
            In Vision öffnen
          </button>
        ) : (
          <button
            className="flex items-center gap-2 text-sm font-semibold text-white px-4 py-2 rounded-[var(--vektrus-radius-sm)] opacity-50 cursor-not-allowed"
            style={{ backgroundColor: 'var(--vektrus-blue)' }}
            disabled
          >
            In Vision öffnen
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ReelConceptCard;
