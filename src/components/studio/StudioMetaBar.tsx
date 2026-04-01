import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Clock, Camera, Play, X } from 'lucide-react';
import type { ReelConcept } from '../../types/reelConcept';
import {
  FORMAT_LABELS,
  FORMAT_OPTIONS,
  DIFFICULTY_LABELS,
  DIFFICULTY_OPTIONS,
  DIFFICULTY_STYLES,
  PLATFORM_LABELS,
  PLATFORM_OPTIONS,
} from '../../types/reelConcept';

// ── Inline Dropdown Badge ──
interface BadgeDropdownProps {
  value: string;
  options: string[];
  labels: Record<string, string>;
  styles?: Record<string, { bg: string; text: string }>;
  onChange: (value: string) => void;
}

const BadgeDropdown: React.FC<BadgeDropdownProps> = ({ value, options, labels, styles, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const style = styles?.[value];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors cursor-pointer border-none"
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
          className="absolute z-50 mt-1 min-w-[160px] rounded-xl border border-[rgba(255,255,255,0.1)] py-1 shadow-lg"
          style={{ backgroundColor: '#1A1A1E' }}
        >
          {options.map((opt) => {
            const optStyle = styles?.[opt];
            return (
              <button
                key={opt}
                onClick={() => { onChange(opt); setOpen(false); }}
                className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer border-none bg-transparent ${
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

// ── Click-to-Edit Title ──
interface EditableTitleProps {
  value: string;
  onChange: (value: string) => void;
}

const EditableTitle: React.FC<EditableTitleProps> = ({ value, onChange }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);

  const commit = () => {
    setEditing(false);
    if (draft.trim() && draft !== value) {
      onChange(draft.trim());
    } else {
      setDraft(value);
    }
  };

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="font-manrope font-bold text-lg text-[#FAFAFA] tracking-tight cursor-text bg-transparent border-none text-left p-0 hover:text-[#49B7E3] transition-colors truncate max-w-[300px]"
      >
        {value}
      </button>
    );
  }

  return (
    <input
      ref={inputRef}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(value); setEditing(false); } }}
      className="font-manrope font-bold text-lg text-[#FAFAFA] tracking-tight bg-transparent border-none p-0 focus:outline-none w-[300px]"
      style={{ boxShadow: '0 0 0 2px rgba(124, 108, 242, 0.3)', borderRadius: '6px', padding: '2px 6px' }}
    />
  );
};

// ── Meta Bar ──

interface StudioMetaBarProps {
  concept: ReelConcept;
  onConceptChange?: (concept: ReelConcept) => void;
  previewActive?: boolean;
  onPreviewToggle?: () => void;
}

const StudioMetaBar: React.FC<StudioMetaBarProps> = ({ concept, onConceptChange, previewActive, onPreviewToggle }) => {
  const update = (partial: Partial<ReelConcept>) => {
    if (!onConceptChange) return;
    onConceptChange({ ...concept, ...partial });
  };

  return (
    <div className="flex items-center gap-3 px-5 py-3 flex-shrink-0 flex-wrap">
      {/* Title */}
      <EditableTitle
        value={concept.title}
        onChange={(title) => update({ title })}
      />

      <div className="w-[1px] h-5 bg-[#FAFAFA]/10 mx-1" />

      {/* Format */}
      <BadgeDropdown
        value={concept.format}
        options={FORMAT_OPTIONS}
        labels={FORMAT_LABELS}
        onChange={(format) => update({ format })}
      />

      {/* Difficulty */}
      <BadgeDropdown
        value={concept.difficulty}
        options={DIFFICULTY_OPTIONS}
        labels={DIFFICULTY_LABELS}
        styles={DIFFICULTY_STYLES}
        onChange={(difficulty) => update({ difficulty })}
      />

      {/* Platform */}
      <BadgeDropdown
        value={concept.platform_optimization || 'instagram'}
        options={PLATFORM_OPTIONS}
        labels={PLATFORM_LABELS}
        onChange={(platform_optimization) => update({ platform_optimization })}
      />

      <div className="w-[1px] h-5 bg-[#FAFAFA]/10 mx-1" />

      {/* Read-only stats */}
      <span className="inline-flex items-center gap-1 text-[12px] text-[#FAFAFA]/40">
        <Camera className="w-3.5 h-3.5" />
        {concept.scenes.length} Szenen
      </span>
      <span className="inline-flex items-center gap-1 text-[12px] text-[#FAFAFA]/40">
        <Clock className="w-3.5 h-3.5" />
        {concept.total_duration_seconds}s
      </span>

      {/* Preview toggle button */}
      {onPreviewToggle && (
        <button
          data-tour="studio-preview-button"
          onClick={onPreviewToggle}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-transparent border transition-colors cursor-pointer ${
            previewActive
              ? 'text-[#FAFAFA]/60 border-[#FAFAFA]/10 hover:bg-[#FAFAFA]/5'
              : 'text-[#49B7E3] border-[#49B7E3]/20 hover:bg-[#49B7E3]/10'
          }`}
        >
          {previewActive ? (
            <><X className="w-3.5 h-3.5" /> Vorschau beenden</>
          ) : (
            <><Play className="w-3.5 h-3.5" /> Vorschau</>
          )}
        </button>
      )}
    </div>
  );
};

export default StudioMetaBar;
