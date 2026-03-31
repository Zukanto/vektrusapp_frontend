import React, { useState } from 'react';
import { Check, Trash2, Sparkles, Clock, Camera, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
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
  const [submitting, setSubmitting] = useState(false);

  const toggleConcept = (id: string) => {
    setSelected(prev => {
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

    // Delete deselected concepts
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
      {/* Backdrop — same as generating overlay for seamless transition */}
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
        className="relative z-10 w-full max-w-lg mx-4 rounded-2xl overflow-hidden flex flex-col"
        style={{
          backgroundColor: 'rgba(18, 18, 20, 0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          maxHeight: '85vh',
        }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex-shrink-0">
          <h2 className="text-lg font-manrope font-bold text-[#FAFAFA] text-center">
            {totalCount} neue Reel-Ideen generiert
          </h2>
          <p className="text-xs text-[#FAFAFA]/35 text-center mt-1">
            Wähle aus, welche du behalten möchtest.
          </p>
        </div>

        {/* Concept Cards */}
        <div className="flex-1 overflow-y-auto px-6 pb-2 studio-scrollbar">
          <div className="space-y-2">
            {concepts.map((concept, index) => {
              const c = concept.content;
              const isOn = selected.has(concept.id);

              return (
                <motion.button
                  key={concept.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.35 }}
                  onClick={() => toggleConcept(concept.id)}
                  disabled={submitting}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all ${
                    isOn
                      ? 'bg-[#FAFAFA]/[0.06] border border-[#49B7E3]/30'
                      : 'bg-[#FAFAFA]/[0.02] border border-transparent opacity-50'
                  }`}
                >
                  {/* Toggle */}
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                      isOn
                        ? 'bg-[#49B7E3]'
                        : 'bg-transparent border-2 border-[#FAFAFA]/15'
                    }`}
                  >
                    {isOn && <Check className="w-3 h-3 text-white" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FAFAFA]/[0.06] text-[#FAFAFA]/50">
                        {FORMAT_LABELS[c.format] || c.format}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-[#FAFAFA]/80 truncate">
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
                      <span className="inline-flex items-center gap-1">
                        <User className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </motion.button>
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
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              selectedCount > 0 && !submitting
                ? 'text-white'
                : 'bg-[#FAFAFA]/5 text-[#FAFAFA]/20 cursor-not-allowed'
            }`}
            style={
              selectedCount > 0 && !submitting
                ? {
                    background: 'linear-gradient(135deg, #49B7E3 0%, #7C6CF2 50%, #E8A0D6 100%)',
                    boxShadow: '0 0 16px rgba(124,108,242,0.15), 0 4px 12px rgba(0,0,0,0.2)',
                  }
                : undefined
            }
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
