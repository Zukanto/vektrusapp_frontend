import React, { useState } from 'react';
import { Sparkles, Copy, Check, Music, Clock, User } from 'lucide-react';
import type { ReelContent } from '../../services/reelService';

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

const DIFFICULTY_STYLES: Record<string, { bg: string; text: string }> = {
  einfach: { bg: 'rgba(73, 214, 158, 0.15)', text: '#49D69E' },
  mittel: { bg: 'rgba(244, 190, 157, 0.15)', text: '#F4BE9D' },
  fortgeschritten: { bg: 'rgba(124, 108, 242, 0.15)', text: '#7C6CF2' },
};

interface StudioScriptProps {
  concept: ReelContent;
}

const StudioScript: React.FC<StudioScriptProps> = ({ concept }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyVoiceover = async () => {
    if (!concept.voiceover_script) return;
    try {
      await navigator.clipboard.writeText(concept.voiceover_script);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  const diffStyle = DIFFICULTY_STYLES[concept.difficulty] || DIFFICULTY_STYLES.mittel;

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Hook — always visible, never scrolls */}
      <div className="flex-shrink-0 pb-5">
        <p className="text-[#FAFAFA]/40 text-[11px] uppercase tracking-wider font-medium mb-2">
          Der Hook
        </p>
        <h2 className="text-2xl font-manrope font-bold text-[#FAFAFA] leading-tight mb-3">
          {concept.hook.text}
        </h2>
        <div className="flex gap-2">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#49B7E3]/15 text-[#49B7E3]">
            {HOOK_TYPE_LABELS[concept.hook.type] || concept.hook.type}
          </span>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#FAFAFA]/5 text-[#FAFAFA]/60">
            {DELIVERY_LABELS[concept.hook.delivery] || concept.hook.delivery}
          </span>
        </div>
      </div>

      {/* Scrollable info cards */}
      <div className="flex-1 overflow-y-auto pr-2 studio-scrollbar min-h-0">
      <div className="space-y-4 pb-6">
        {/* Why it works */}
        <div className="rounded-xl bg-[#121214] p-5 border-l-2 border-[#7C6CF2]/40">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#7C6CF2]" />
            <span className="text-[11px] uppercase tracking-wider font-medium text-[#FAFAFA]/40">
              Warum dieses Konzept funktioniert
            </span>
          </div>
          <p className="text-[#FAFAFA]/70 text-sm leading-relaxed">
            {concept.why_it_works}
          </p>
        </div>

        {/* Voiceover Script */}
        <div className="rounded-xl bg-[#121214] p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider font-medium text-[#FAFAFA]/40">
              Voiceover Skript
            </span>
            {concept.voiceover_script && (
              <button
                onClick={handleCopyVoiceover}
                className="flex items-center gap-1.5 text-[11px] text-[#FAFAFA]/40 hover:text-[#FAFAFA]/70 transition-colors bg-transparent border-none cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-[#49D69E]" />
                    <span className="text-[#49D69E]">Kopiert</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Kopieren</span>
                  </>
                )}
              </button>
            )}
          </div>
          {concept.voiceover_script ? (
            <p className="text-[#FAFAFA]/70 text-sm leading-relaxed">
              {concept.voiceover_script}
            </p>
          ) : (
            <p className="text-[#FAFAFA]/30 text-sm italic">
              Kein Voiceover für dieses Format
            </p>
          )}
        </div>

        {/* Audio Suggestion */}
        <div className="rounded-xl bg-[#121214] p-5">
          <div className="flex items-center gap-2 mb-2">
            <Music className="w-3.5 h-3.5 text-[#FAFAFA]/30" />
            <span className="text-[11px] uppercase tracking-wider font-medium text-[#FAFAFA]/40">
              Audio Empfehlung
            </span>
          </div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#FAFAFA]/5 text-[#FAFAFA]/60">
              {concept.audio_suggestion.type}
            </span>
          </div>
          <p className="text-[#FAFAFA]/50 text-xs leading-relaxed">
            {concept.audio_suggestion.note}
          </p>
        </div>

        {/* Metadata */}
        <div className="rounded-xl bg-[#121214] p-5">
          <span className="text-[11px] uppercase tracking-wider font-medium text-[#FAFAFA]/40 block mb-3">
            Konzept-Details
          </span>
          <div className="flex flex-wrap gap-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#FAFAFA]/5 text-[#FAFAFA]/60">
              {FORMAT_LABELS[concept.format] || concept.format}
            </span>
            <span
              className="px-2.5 py-1 rounded-full text-[11px] font-medium"
              style={{ backgroundColor: diffStyle.bg, color: diffStyle.text }}
            >
              {concept.difficulty}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#FAFAFA]/5 text-[#FAFAFA]/60">
              <Clock className="w-3 h-3" />
              {concept.total_duration_seconds}s
            </span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#FAFAFA]/5 text-[#FAFAFA]/60">
              {concept.estimated_effort}
            </span>
            {concept.needs_face && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#FAFAFA]/5 text-[#FAFAFA]/60">
                <User className="w-3 h-3" />
                Gesicht nötig
              </span>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default StudioScript;
