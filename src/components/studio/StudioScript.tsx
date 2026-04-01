import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, Copy, Check, Music, ChevronDown, X, Plus } from 'lucide-react';
import type { ReelConcept } from '../../types/reelConcept';
import {
  HOOK_TYPE_LABELS,
  HOOK_TYPE_OPTIONS,
  HOOK_TYPE_STYLES,
  DELIVERY_LABELS,
  DELIVERY_OPTIONS,
  AUDIO_TYPE_LABELS,
  AUDIO_TYPE_OPTIONS,
  PLATFORM_CAPTION_LIMITS,
} from '../../types/reelConcept';

// ── Shared: Dark-mode Dropdown ──
interface DropdownProps {
  value: string;
  options: string[];
  labels: Record<string, string>;
  styles?: Record<string, { bg: string; text: string }>;
  onChange: (value: string) => void;
}

const StudioDropdown: React.FC<DropdownProps> = ({ value, options, labels, styles, onChange }) => {
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleToggle = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUp(spaceBelow < 160);
    }
    setOpen(!open);
  };

  const style = styles?.[value];

  return (
    <div ref={ref} className="relative inline-block">
      <button
        ref={btnRef}
        onClick={handleToggle}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer border-none"
        style={
          style
            ? { backgroundColor: style.bg, color: style.text }
            : { backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(250,250,250,0.6)' }
        }
      >
        {labels[value] || value}
        <ChevronDown className="w-3 h-3 opacity-50" />
      </button>
      {open && (
        <div
          className={`absolute z-50 min-w-[140px] rounded-xl border border-[rgba(255,255,255,0.1)] py-1 shadow-lg ${openUp ? 'bottom-full mb-1' : 'top-full mt-1'}`}
          style={{ backgroundColor: '#1A1A1E' }}
        >
          {options.map((opt) => {
            const optStyle = styles?.[opt];
            return (
              <button
                key={opt}
                onClick={() => { onChange(opt); setOpen(false); }}
                className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer border-none ${
                  opt === value ? 'bg-[rgba(255,255,255,0.08)]' : 'hover:bg-[rgba(255,255,255,0.04)]'
                }`}
                style={optStyle ? { color: optStyle.text } : { color: 'rgba(250,250,250,0.7)' }}
              >
                {labels[opt] || opt}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Auto-resize Textarea ──
interface AutoTextareaProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  className?: string;
  placeholder?: string;
  rows?: number;
}

const AutoTextarea: React.FC<AutoTextareaProps> = ({ value, onChange, maxLength, className = '', placeholder, rows = 1 }) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = useCallback(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }, []);

  useEffect(resize, [value, resize]);

  return (
    <div className="relative">
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => {
          if (maxLength && e.target.value.length > maxLength) return;
          onChange(e.target.value);
        }}
        placeholder={placeholder}
        rows={rows}
        className={`w-full bg-transparent resize-none focus:outline-none transition-colors ${className}`}
        style={{
          boxShadow: 'none',
        }}
        onFocus={(e) => {
          (e.target as HTMLTextAreaElement).style.boxShadow = '0 0 0 2px rgba(124, 108, 242, 0.3)';
          (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(124, 108, 242, 0.5)';
          (e.target as HTMLTextAreaElement).style.borderRadius = '8px';
        }}
        onBlur={(e) => {
          (e.target as HTMLTextAreaElement).style.boxShadow = 'none';
          (e.target as HTMLTextAreaElement).style.borderColor = '';
        }}
      />
      {maxLength && (
        <span className={`absolute bottom-1 right-1 text-[10px] ${
          value.length >= maxLength * 0.9 ? 'text-[#FA7E70]' : 'text-[#FAFAFA]/20'
        }`}>
          {value.length}/{maxLength}
        </span>
      )}
    </div>
  );
};

// ── Hashtag Editor ──
interface HashtagEditorProps {
  hashtags: string[];
  onChange: (hashtags: string[]) => void;
}

const HashtagEditor: React.FC<HashtagEditorProps> = ({ hashtags, onChange }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const addTag = () => {
    let tag = input.trim();
    if (!tag) return;
    if (!tag.startsWith('#')) tag = `#${tag}`;
    if (tag.includes(' ')) {
      setError('Keine Leerzeichen erlaubt');
      return;
    }
    if (hashtags.includes(tag)) {
      setError('Bereits vorhanden');
      return;
    }
    setError('');
    onChange([...hashtags, tag]);
    setInput('');
  };

  const removeTag = (index: number) => {
    onChange(hashtags.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {hashtags.map((tag, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#49B7E3]/10 text-[#49B7E3]/80"
          >
            {tag}
            <button
              onClick={() => removeTag(i)}
              className="hover:text-[#FA7E70] transition-colors bg-transparent border-none cursor-pointer p-0"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(''); }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
          placeholder="#neuer_hashtag"
          className="flex-1 bg-[rgba(255,255,255,0.06)] text-[#FAFAFA]/80 text-xs rounded-lg border border-[rgba(255,255,255,0.1)] px-2.5 py-1.5 focus:outline-none transition-colors"
          style={{ boxShadow: 'none' }}
          onFocus={(e) => { e.target.style.boxShadow = '0 0 0 2px rgba(124, 108, 242, 0.3)'; e.target.style.borderColor = 'rgba(124, 108, 242, 0.5)'; }}
          onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'; }}
        />
        <button
          onClick={addTag}
          className="flex items-center justify-center w-7 h-7 rounded-lg bg-[rgba(255,255,255,0.06)] text-[#FAFAFA]/40 hover:text-[#FAFAFA]/70 border border-[rgba(255,255,255,0.1)] transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
      {error && <p className="text-[10px] text-[#FA7E70] mt-1">{error}</p>}
    </div>
  );
};

// ── Main Component ──

interface StudioScriptProps {
  concept: ReelConcept;
  onConceptChange?: (concept: ReelConcept) => void;
}

const StudioScript: React.FC<StudioScriptProps> = ({ concept, onConceptChange }) => {
  const [copied, setCopied] = useState(false);

  const update = useCallback(
    (partial: Partial<ReelConcept>) => {
      if (!onConceptChange) return;
      onConceptChange({ ...concept, ...partial });
    },
    [concept, onConceptChange]
  );

  const updateHook = useCallback(
    (partial: Partial<ReelConcept['hook']>) => {
      update({ hook: { ...concept.hook, ...partial } });
    },
    [concept.hook, update]
  );

  const updateAudio = useCallback(
    (partial: Partial<ReelConcept['audio_suggestion']>) => {
      update({ audio_suggestion: { ...concept.audio_suggestion, ...partial } });
    },
    [concept.audio_suggestion, update]
  );

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

  const captionLimit = PLATFORM_CAPTION_LIMITS[concept.platform_optimization] || 2200;

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Hook — always visible, never scrolls */}
      <div className="flex-shrink-0 pb-5">
        <p className="text-[#FAFAFA]/40 text-[11px] uppercase tracking-wider font-medium mb-2">
          Der Hook
        </p>
        <AutoTextarea
          value={concept.hook.text}
          onChange={(text) => updateHook({ text })}
          maxLength={120}
          className="text-2xl font-manrope font-bold text-[#FAFAFA] leading-tight mb-3 border-none p-0"
          rows={1}
        />
        <div className="flex gap-2">
          <StudioDropdown
            value={concept.hook.type}
            options={HOOK_TYPE_OPTIONS}
            labels={HOOK_TYPE_LABELS}
            styles={HOOK_TYPE_STYLES}
            onChange={(type) => updateHook({ type })}
          />
          <StudioDropdown
            value={concept.hook.delivery}
            options={DELIVERY_OPTIONS}
            labels={DELIVERY_LABELS}
            onChange={(delivery) => updateHook({ delivery })}
          />
        </div>
      </div>

      {/* Scrollable info cards */}
      <div className="flex-1 overflow-y-auto pr-2 studio-scrollbar min-h-0">
      <div className="space-y-4 pb-6">
        {/* Why it works (read-only) */}
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

        {/* Voiceover Script (editable) */}
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
          <AutoTextarea
            value={concept.voiceover_script || ''}
            onChange={(text) => update({ voiceover_script: text || null })}
            className="text-[#FAFAFA]/70 text-sm leading-relaxed border-none p-0"
            placeholder="Kein Voiceover für dieses Format"
            rows={2}
          />
        </div>

        {/* Caption (editable) */}
        <div className="rounded-xl bg-[#121214] p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider font-medium text-[#FAFAFA]/40">
              Caption
            </span>
            <span className={`text-[10px] ${
              concept.caption.length >= captionLimit * 0.9 ? 'text-[#FA7E70]' : 'text-[#FAFAFA]/20'
            }`}>
              max {captionLimit}
            </span>
          </div>
          <AutoTextarea
            value={concept.caption}
            onChange={(text) => update({ caption: text })}
            maxLength={captionLimit}
            className="text-[#FAFAFA]/70 text-sm leading-relaxed border-none p-0"
            placeholder="Caption eingeben..."
            rows={2}
          />
        </div>

        {/* Hashtags (editable) */}
        <div className="rounded-xl bg-[#121214] p-5">
          <span className="text-[11px] uppercase tracking-wider font-medium text-[#FAFAFA]/40 block mb-3">
            Hashtags
          </span>
          <HashtagEditor
            hashtags={concept.hashtags}
            onChange={(hashtags) => update({ hashtags })}
          />
        </div>

        {/* Audio Suggestion (editable) */}
        <div className="rounded-xl bg-[#121214] p-5">
          <div className="flex items-center gap-2 mb-2">
            <Music className="w-3.5 h-3.5 text-[#FAFAFA]/30" />
            <span className="text-[11px] uppercase tracking-wider font-medium text-[#FAFAFA]/40">
              Audio Empfehlung
            </span>
          </div>
          <div className="mb-2">
            <StudioDropdown
              value={concept.audio_suggestion.type}
              options={AUDIO_TYPE_OPTIONS}
              labels={AUDIO_TYPE_LABELS}
              onChange={(type) => updateAudio({ type })}
            />
          </div>
          <input
            value={concept.audio_suggestion.note}
            onChange={(e) => updateAudio({ note: e.target.value })}
            className="w-full bg-[rgba(255,255,255,0.06)] text-[#FAFAFA]/60 text-xs rounded-lg border border-[rgba(255,255,255,0.1)] px-3 py-2 focus:outline-none transition-colors"
            placeholder="Hinweis zur Audio-Wahl..."
            style={{ boxShadow: 'none' }}
            onFocus={(e) => { e.target.style.boxShadow = '0 0 0 2px rgba(124, 108, 242, 0.3)'; e.target.style.borderColor = 'rgba(124, 108, 242, 0.5)'; }}
            onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'; }}
          />
        </div>
      </div>
      </div>
    </div>
  );
};

export default StudioScript;
