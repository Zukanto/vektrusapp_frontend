import React, { useState } from 'react';
import { Clapperboard, Sparkles, Loader, Clock, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { callN8n } from '../../../lib/n8n';
import { useAuth } from '../../../hooks/useAuth';

export interface ReelSuggestion {
  title: string;
  format: string;
  why: string;
  difficulty: string;
  estimated_duration: number;
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

const DIFFICULTY_COLORS: Record<string, string> = {
  einfach: '#49D69E',
  mittel: '#49B7E3',
  fortgeschritten: '#7C6CF2',
};

interface ReelSuggestionsSectionProps {
  suggestions: ReelSuggestion[];
  platforms: string[];
}

const ReelSuggestionsSection: React.FC<ReelSuggestionsSectionProps> = ({
  suggestions,
  platforms,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Set<number>>(
    () => new Set(suggestions.map((_, i) => i))
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!suggestions || suggestions.length === 0) return null;

  const toggleSelection = (idx: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const selectedSuggestions = suggestions.filter((_, i) => selected.has(i));

  const handleGenerate = async () => {
    if (!user?.id || selectedSuggestions.length === 0) return;
    setSubmitting(true);

    try {
      // Build theme from selected titles
      const theme = selectedSuggestions.map(s => s.title).join(', ');
      const reelPlatforms = platforms.length > 0 ? platforms : ['instagram'];

      await callN8n('vektrus-pulse-reels', {
        user_id: user.id,
        reel_configuration: {
          platforms: reelPlatforms,
          theme,
          reel_count: selectedSuggestions.length,
          difficulty: 'einfach',
          show_face: true,
          language: 'DE',
        },
      });

      setSubmitted(true);

      // Navigate to Studio after short delay so user sees the confirmation
      setTimeout(() => {
        navigate('/studio');
      }, 1200);
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="w-full max-w-2xl rounded-[var(--vektrus-radius-md)] p-5 mt-6"
      style={{
        backgroundColor: '#F4FCFE',
        border: '1px solid rgba(73,183,227,0.15)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-1">
        <Clapperboard className="w-4 h-4 text-[#7C6CF2]" />
        <h4 className="text-sm font-manrope font-bold text-[#111111]">
          Reel-Empfehlungen zu deinem Thema
        </h4>
      </div>
      <p className="text-xs text-[#7A7A7A] mb-4 ml-[26px]">
        Pulse hat Themen erkannt, die als Kurzvideo besser performen würden.
      </p>

      {/* Suggestions */}
      <div className="space-y-2 mb-4">
        {suggestions.map((s, i) => {
          const isSelected = selected.has(i);
          const diffColor = DIFFICULTY_COLORS[s.difficulty] || '#7A7A7A';

          return (
            <button
              key={i}
              onClick={() => toggleSelection(i)}
              disabled={submitting || submitted}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-[var(--vektrus-radius-sm)] text-left transition-all ${
                isSelected
                  ? 'bg-white border border-[#49B7E3]/30 shadow-subtle'
                  : 'bg-white/60 border border-transparent hover:border-[rgba(73,183,227,0.15)]'
              }`}
            >
              {/* Checkbox */}
              <div
                className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-[#49B7E3] border-[#49B7E3]'
                    : 'bg-white border-2 border-[#B6EBF7]'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#111111] truncate">
                  {s.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F4FCFE] text-[#7A7A7A]">
                    {FORMAT_LABELS[s.format] || s.format}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-[#7A7A7A]">
                    <Clock className="w-3 h-3" />
                    {s.estimated_duration}s
                  </span>
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${diffColor}15`,
                      color: diffColor,
                    }}
                  >
                    {s.difficulty}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* CTA */}
      {submitted ? (
        <div className="flex items-center justify-center gap-2 px-5 py-3 rounded-[var(--vektrus-radius-sm)] bg-[#49D69E]/10 border border-[#49D69E]/20">
          <Check className="w-4 h-4 text-[#49D69E]" />
          <span className="text-sm font-medium text-[#49D69E]">
            Reel-Konzepte werden generiert — weiter zum Studio...
          </span>
        </div>
      ) : (
        <button
          onClick={handleGenerate}
          disabled={selected.size === 0 || submitting}
          className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-[var(--vektrus-radius-sm)] text-sm font-semibold transition-all ${
            selected.size > 0 && !submitting
              ? 'text-white cursor-pointer'
              : 'bg-[#B6EBF7]/20 text-gray-400 cursor-not-allowed'
          }`}
          style={
            selected.size > 0 && !submitting
              ? {
                  background: 'linear-gradient(135deg, #49B7E3 0%, #7C6CF2 50%, #E8A0D6 100%)',
                  boxShadow: '0 0 16px rgba(124,108,242,0.12), 0 2px 8px rgba(0,0,0,0.08)',
                }
              : undefined
          }
        >
          {submitting ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Wird gestartet...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {selected.size} {selected.size === 1 ? 'Reel-Konzept' : 'Reel-Konzepte'} generieren
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default ReelSuggestionsSection;
