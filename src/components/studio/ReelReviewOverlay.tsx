import React, { useState } from 'react';
import { Check, Trash2, Sparkles, Clock, Camera, User, ChevronDown, ChevronUp, Music, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import type { ReelContent, ReelScene } from '../../services/reelService';

const FORMAT_LABELS: Record<string, string> = {
  talking_head: 'Talking Head',
  produkt_showcase: 'Produkt-Showcase',
  tutorial: 'Tutorial',
  behind_the_scenes: 'Behind the Scenes',
  vorher_nachher: 'Vorher/Nachher',
  b_roll_montage: 'B-Roll Montage',
  listicle: 'Listicle',
};

const CAMERA_LABELS: Record<string, string> = {
  frontal_selfie: 'Frontal',
  detail_nahaufnahme: 'Nahaufnahme',
  over_the_shoulder: 'Über die Schulter',
  pov: 'POV',
  stativ_weit: 'Weitwinkel',
  drohne: 'Drohne',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  einfach: '#49D69E',
  mittel: '#49B7E3',
  fortgeschritten: '#7C6CF2',
};

export interface ReviewConcept {
  id: string;
  content: ReelContent;
}

interface ReelReviewOverlayProps {
  concepts: ReviewConcept[];
  pulseConfigId: string;
  onDone: () => void;
}

const ReelReviewOverlay: React.FC<ReelReviewOverlayProps> = ({
  concepts,
  pulseConfigId,
  onDone,
}) => {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(concepts.map(c => c.id))
  );
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  const toggleConcept = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedCount = selected.size;
  const totalCount = concepts.length;
  const allSelected = selectedCount === totalCount;

  const handleAdopt = async () => {
    if (selectedCount === 0) return;
    setSubmitting(true);

    const deselectedIds = concepts
      .filter(c => !selected.has(c.id))
      .map(c => c.id);

    if (deselectedIds.length > 0) {
      await supabase
        .from('pulse_generated_content')
        .delete()
        .in('id', deselectedIds);
    }

    setSubmitting(false);
    onDone();
  };

  const handleDiscardAll = async () => {
    setSubmitting(true);
    await supabase
      .from('pulse_generated_content')
      .delete()
      .eq('pulse_config_id', pulseConfigId);
    setSubmitting(false);
    onDone();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: 'rgba(9, 9, 11, 0.60)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-2xl mx-4 rounded-2xl overflow-hidden flex flex-col"
        style={{
          backgroundColor: 'rgba(18, 18, 20, 0.88)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          maxHeight: '88vh',
        }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex-shrink-0">
          <h2 className="text-lg font-manrope font-bold text-[#FAFAFA] text-center">
            {totalCount} neue {totalCount === 1 ? 'Reel-Idee' : 'Reel-Ideen'} generiert
          </h2>
          <p className="text-xs text-[#FAFAFA]/35 text-center mt-1">
            Klappe ein Konzept auf, um Details zu sehen. Deaktiviere was du nicht brauchst.
          </p>
        </div>

        {/* Concept Cards */}
        <div className="flex-1 overflow-y-auto px-6 pb-2 studio-scrollbar">
          <div className="space-y-2.5">
            {concepts.map((concept, index) => {
              const c = concept.content;
              const isOn = selected.has(concept.id);
              const isExpanded = expanded.has(concept.id);
              const diffColor = DIFFICULTY_COLORS[c.difficulty] || '#7A7A7A';

              return (
                <motion.div
                  key={concept.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.35 }}
                  className={`rounded-xl transition-all overflow-hidden ${
                    isOn
                      ? 'bg-[#FAFAFA]/[0.06] border border-[#49B7E3]/25'
                      : 'bg-[#FAFAFA]/[0.02] border border-transparent opacity-40'
                  }`}
                >
                  {/* Header Row — always visible */}
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    {/* Toggle */}
                    <button
                      onClick={() => toggleConcept(concept.id)}
                      disabled={submitting}
                      className="flex-shrink-0"
                    >
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                          isOn
                            ? 'bg-[#49B7E3]'
                            : 'bg-transparent border-2 border-[#FAFAFA]/15'
                        }`}
                      >
                        {isOn && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>

                    {/* Content summary */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FAFAFA]/[0.06] text-[#FAFAFA]/50">
                          {FORMAT_LABELS[c.format] || c.format}
                        </span>
                        <span
                          className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${diffColor}15`,
                            color: diffColor,
                          }}
                        >
                          {c.difficulty}
                        </span>
                      </div>
                      <p className={`text-sm font-medium text-[#FAFAFA]/80 ${isExpanded ? '' : 'truncate'}`}>
                        {c.title}
                      </p>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-2.5 text-[10px] text-[#FAFAFA]/30 flex-shrink-0">
                      <span className="inline-flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        {c.scenes.length}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {c.total_duration_seconds}s
                      </span>
                      {c.needs_face && (
                        <User className="w-3 h-3" />
                      )}
                    </div>

                    {/* Expand toggle */}
                    <button
                      onClick={(e) => toggleExpand(concept.id, e)}
                      className="flex-shrink-0 p-1 text-[#FAFAFA]/25 hover:text-[#FAFAFA]/50 transition-colors rounded-lg hover:bg-[#FAFAFA]/5"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Expanded Detail */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-1 space-y-3 border-t border-[#FAFAFA]/[0.04]">
                          {/* Hook */}
                          <div>
                            <p className="text-[10px] uppercase tracking-wider font-medium text-[#FAFAFA]/30 mb-1">
                              Hook
                            </p>
                            <p className="text-sm text-[#FAFAFA]/70 leading-relaxed">
                              „{c.hook.text}"
                            </p>
                            <div className="flex gap-1.5 mt-1">
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#49B7E3]/10 text-[#49B7E3]/70">
                                {c.hook.type}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#FAFAFA]/[0.04] text-[#FAFAFA]/40">
                                {c.hook.delivery}
                              </span>
                            </div>
                          </div>

                          {/* Scenes */}
                          <div>
                            <p className="text-[10px] uppercase tracking-wider font-medium text-[#FAFAFA]/30 mb-1.5">
                              Szenen ({c.scenes.length})
                            </p>
                            <div className="space-y-1.5">
                              {c.scenes.map((scene: ReelScene) => (
                                <div
                                  key={scene.nr}
                                  className="flex gap-2.5 px-3 py-2 rounded-lg bg-[#FAFAFA]/[0.03]"
                                >
                                  <span className="text-[11px] font-bold text-[#49B7E3]/60 w-4 flex-shrink-0 pt-0.5">
                                    {scene.nr}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-[#FAFAFA]/60 leading-relaxed">
                                      {scene.action}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1 text-[10px] text-[#FAFAFA]/25">
                                      <span>{scene.duration_seconds}s</span>
                                      <span>·</span>
                                      <span>{CAMERA_LABELS[scene.camera] || scene.camera}</span>
                                      {scene.text_overlay && (
                                        <>
                                          <span>·</span>
                                          <span className="truncate">„{scene.text_overlay}"</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Voiceover */}
                          {c.voiceover_script && (
                            <div>
                              <p className="text-[10px] uppercase tracking-wider font-medium text-[#FAFAFA]/30 mb-1 flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                Voiceover
                              </p>
                              <p className="text-xs text-[#FAFAFA]/50 leading-relaxed italic">
                                „{c.voiceover_script}"
                              </p>
                            </div>
                          )}

                          {/* Audio + Why it works */}
                          <div className="flex gap-3">
                            {c.audio_suggestion && (
                              <div className="flex-1">
                                <p className="text-[10px] uppercase tracking-wider font-medium text-[#FAFAFA]/30 mb-1 flex items-center gap-1">
                                  <Music className="w-3 h-3" />
                                  Audio
                                </p>
                                <p className="text-[11px] text-[#FAFAFA]/40">
                                  {c.audio_suggestion.type} — {c.audio_suggestion.note}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Why it works */}
                          {c.why_it_works && (
                            <div className="rounded-lg bg-[#7C6CF2]/[0.06] border-l-2 border-[#7C6CF2]/30 px-3 py-2">
                              <p className="text-[10px] uppercase tracking-wider font-medium text-[#7C6CF2]/50 mb-0.5">
                                Warum es funktioniert
                              </p>
                              <p className="text-xs text-[#FAFAFA]/50 leading-relaxed">
                                {c.why_it_works}
                              </p>
                            </div>
                          )}

                          {/* Caption + Hashtags */}
                          {c.caption && (
                            <div>
                              <p className="text-[10px] uppercase tracking-wider font-medium text-[#FAFAFA]/30 mb-1">
                                Caption
                              </p>
                              <p className="text-xs text-[#FAFAFA]/45 leading-relaxed">
                                {c.caption}
                              </p>
                              {c.hashtags && c.hashtags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  {c.hashtags.map((tag, i) => (
                                    <span key={i} className="text-[10px] text-[#49B7E3]/50">
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex items-center justify-between flex-shrink-0 border-t border-[#FAFAFA]/[0.05]">
          <button
            onClick={handleDiscardAll}
            disabled={submitting}
            className="flex items-center gap-1.5 text-xs text-[#FAFAFA]/30 hover:text-[#FA7E70]/70 transition-colors cursor-pointer bg-transparent border-none"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Alle verwerfen
          </button>

          <button
            onClick={handleAdopt}
            disabled={selectedCount === 0 || submitting}
            className={`reel-ideas-btn flex items-center gap-2 px-5 py-2.5 text-sm cursor-pointer ${
              selectedCount === 0 || submitting ? 'opacity-30 cursor-not-allowed' : ''
            }`}
          >
            <Sparkles className="w-4 h-4" />
            {allSelected
              ? 'Alle übernehmen'
              : `${selectedCount} von ${totalCount} übernehmen`}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ReelReviewOverlay;
