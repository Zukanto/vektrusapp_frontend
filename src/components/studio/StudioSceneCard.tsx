import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Clock, Camera, Play, Pause, Minus, X, ChevronDown, GripVertical, AlertTriangle } from 'lucide-react';
import type { Scene } from '../../types/reelConcept';
import { CAMERA_LABELS, CAMERA_OPTIONS } from '../../types/reelConcept';
import type { SceneVideo } from '../../hooks/useSceneVideos';

// ── Inline Camera Dropdown ──
const CameraDropdown: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium bg-[#FAFAFA]/5 text-[#FAFAFA]/60 hover:bg-[#FAFAFA]/10 transition-colors cursor-pointer border-none"
      >
        <Camera className="w-3 h-3" />
        {CAMERA_LABELS[value] || value}
        <ChevronDown className="w-2.5 h-2.5 opacity-50" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 min-w-[150px] rounded-xl border border-[rgba(255,255,255,0.1)] py-1 shadow-lg" style={{ backgroundColor: '#1A1A1E' }}>
          {CAMERA_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={(e) => { e.stopPropagation(); onChange(opt); setOpen(false); }}
              className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer border-none bg-transparent text-[#FAFAFA]/70 ${
                opt === value ? 'bg-[rgba(255,255,255,0.08)]' : 'hover:bg-[rgba(255,255,255,0.04)]'
              }`}
            >
              {CAMERA_LABELS[opt] || opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Auto-resize Textarea for scene action ──
const SceneTextarea: React.FC<{
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
  className?: string;
  placeholder?: string;
}> = ({ value, onChange, maxLength, className = '', placeholder }) => {
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
        onClick={(e) => e.stopPropagation()}
        placeholder={placeholder}
        rows={1}
        className={`w-full bg-transparent resize-none focus:outline-none transition-colors ${className}`}
        style={{ boxShadow: 'none' }}
        onFocus={(e) => { (e.target as HTMLTextAreaElement).style.boxShadow = '0 0 0 2px rgba(124, 108, 242, 0.3)'; (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(124, 108, 242, 0.5)'; (e.target as HTMLTextAreaElement).style.borderRadius = '8px'; }}
        onBlur={(e) => { (e.target as HTMLTextAreaElement).style.boxShadow = 'none'; (e.target as HTMLTextAreaElement).style.borderColor = ''; }}
      />
      {maxLength && (
        <span className="absolute bottom-0 right-0 text-[9px] text-[#FAFAFA]/15">
          {value.length}/{maxLength}
        </span>
      )}
    </div>
  );
};

// ── Delete Confirmation Dialog ──
const DeleteDialog: React.FC<{
  sceneNr: number;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ sceneNr, onConfirm, onCancel }) => (
  <div
    className="fixed inset-0 z-[100] flex items-center justify-center"
    style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
    onClick={(e) => { e.stopPropagation(); onCancel(); }}
  >
    <div
      className="rounded-2xl p-6 max-w-sm w-full mx-4 border border-[rgba(255,255,255,0.1)]"
      style={{ backgroundColor: '#1A1A1E' }}
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="font-manrope font-bold text-[#FAFAFA] text-base mb-2">
        Szene {sceneNr} wirklich löschen?
      </h3>
      <p className="text-[#FAFAFA]/50 text-sm mb-5">
        Diese Aktion kann nicht rückgängig gemacht werden.
      </p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-[#FAFAFA]/60 hover:text-[#FAFAFA] border border-[rgba(255,255,255,0.1)] rounded-xl transition-colors cursor-pointer bg-transparent"
        >
          Abbrechen
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 text-sm font-semibold text-white bg-[#FA7E70] hover:bg-[#e86b5e] rounded-xl transition-colors cursor-pointer"
        >
          Löschen
        </button>
      </div>
    </div>
  </div>
);

// ── Main Scene Card ──

interface StudioSceneCardProps {
  scene: Scene;
  isSelected: boolean;
  isLast: boolean;
  isOnly: boolean;
  needsFace: boolean;
  sceneVideo?: SceneVideo | null;
  onClick: () => void;
  onChange: (scene: Scene) => void;
  onDelete: () => void;
}

const StudioSceneCard: React.FC<StudioSceneCardProps> = ({
  scene,
  isSelected,
  isLast,
  isOnly,
  needsFace,
  sceneVideo,
  onClick,
  onChange,
  onDelete,
}) => {
  const [paused, setPaused] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: scene.nr });

  const sortableStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 10 : 1,
    position: 'relative',
  };

  const isGenerating = sceneVideo?.status === 'generating' || sceneVideo?.status === 'queued';
  const videoUrl = sceneVideo?.video_url || scene.broll_video_url;
  const isFinished = (sceneVideo?.status === 'finished' && !!sceneVideo?.video_url) || !!scene.broll_video_url;

  const showFaceWarning = !needsFace && scene.camera === 'frontal_selfie';

  const handleVideoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = e.currentTarget.querySelector('video');
    if (video) {
      if (video.paused) { video.play(); setPaused(false); }
      else { video.pause(); setPaused(true); }
    }
  };

  const updateScene = (partial: Partial<Scene>) => {
    onChange({ ...scene, ...partial });
  };

  const adjustDuration = (delta: number) => {
    const newDuration = Math.max(1, Math.min(15, scene.duration_seconds + delta));
    updateScene({ duration_seconds: newDuration });
  };

  return (
    <div ref={setNodeRef} style={sortableStyle} className="group/card relative flex gap-5">
        {/* Timeline connector: Handle + Scene number */}
        <div className="flex flex-shrink-0">
          {/* Drag handle */}
          <div
            {...listeners}
            {...attributes}
            className="flex items-center px-2 py-1 opacity-40 group-hover/card:opacity-100 transition-opacity cursor-grab active:cursor-grabbing touch-none"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-4 h-4 text-[#FAFAFA]" />
          </div>
          <div className="flex flex-col items-center w-10">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 transition-colors ${
                isSelected
                  ? 'bg-[#49B7E3]/20 text-[#49B7E3]'
                  : 'bg-[#FAFAFA]/5 text-[#FAFAFA]/30'
              }`}
            >
              {scene.nr}
            </div>
            {!isLast && (
              <div className="w-[2px] flex-1 min-h-[16px] bg-[#49B7E3]/30 mt-2" />
            )}
          </div>
        </div>

        {/* Card */}
        <div
          onClick={onClick}
          className={`flex-1 rounded-[16px] p-5 text-left transition-all cursor-pointer border mb-4 relative ${
            isSelected
              ? 'bg-[#121214] border-[#49B7E3]/40'
              : 'bg-[#121214] border-transparent hover:border-[rgba(255,255,255,0.08)]'
          }`}
        >
          {/* Delete button */}
          {!isOnly && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowDeleteDialog(true); }}
              className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-[#FAFAFA]/20 hover:text-[#FA7E70] hover:bg-[#FA7E70]/10 opacity-0 group-hover/card:opacity-100 transition-all z-10 cursor-pointer bg-transparent border-none"
              title="Szene löschen"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="flex gap-4">
            {/* Left side */}
            <div className="flex-1 min-w-0">
              {/* Action (editable textarea) */}
              <SceneTextarea
                value={scene.action}
                onChange={(action) => updateScene({ action })}
                maxLength={200}
                className="text-[#FAFAFA] text-sm leading-relaxed mb-3 border-none p-0"
                placeholder="Szenen-Beschreibung..."
              />

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-3 items-center">
                {/* Duration with +/- */}
                <div className="inline-flex items-center gap-0 rounded-full bg-[#FAFAFA]/5 overflow-hidden">
                  <button
                    onClick={(e) => { e.stopPropagation(); adjustDuration(-1); }}
                    className="px-1.5 py-1 text-[#FAFAFA]/40 hover:text-[#FAFAFA]/70 hover:bg-[#FAFAFA]/5 transition-colors cursor-pointer bg-transparent border-none"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="inline-flex items-center gap-1 px-1.5 py-1 text-[11px] font-medium text-[#FAFAFA]/60">
                    <Clock className="w-3 h-3" />
                    {scene.duration_seconds} Sek
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); adjustDuration(1); }}
                    className="px-1.5 py-1 text-[#FAFAFA]/40 hover:text-[#FAFAFA]/70 hover:bg-[#FAFAFA]/5 transition-colors cursor-pointer bg-transparent border-none"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Camera dropdown */}
                <CameraDropdown
                  value={scene.camera}
                  onChange={(camera) => updateScene({ camera })}
                />

                {/* Face warning */}
                {showFaceWarning && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium bg-[#F4BE9D]/15 text-[#F4BE9D]">
                    <AlertTriangle className="w-3 h-3" />
                    Kein Gesicht nötig
                  </span>
                )}
              </div>

              {/* Tip (editable) */}
              <div className="flex items-start gap-1.5">
                <span className="text-[#7A7A7A] text-xs flex-shrink-0 mt-0.5">Tipp:</span>
                <input
                  value={scene.tip}
                  onChange={(e) => updateScene({ tip: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 text-[#7A7A7A] text-xs bg-transparent border-none focus:outline-none focus:text-[#FAFAFA]/60 transition-colors p-0"
                  placeholder="Tipp eingeben..."
                  style={{ boxShadow: 'none' }}
                  onFocus={(e) => { e.target.style.boxShadow = '0 0 0 2px rgba(124, 108, 242, 0.3)'; e.target.style.borderColor = 'rgba(124, 108, 242, 0.5)'; e.target.style.borderRadius = '4px'; e.target.style.padding = '2px 4px'; }}
                  onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = ''; e.target.style.padding = '0'; }}
                />
              </div>

              {/* Text Overlay (editable) */}
              <div className="mt-2 px-2.5 py-1.5 rounded-lg bg-[#FAFAFA]/5 border border-[#FAFAFA]/5">
                <span className="text-[11px] text-[#FAFAFA]/40 uppercase tracking-wider font-medium">
                  Text-Overlay
                </span>
                <input
                  value={scene.text_overlay || ''}
                  onChange={(e) => updateScene({ text_overlay: e.target.value || null })}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full text-[#FAFAFA]/80 text-xs mt-0.5 bg-transparent border-none focus:outline-none p-0"
                  placeholder="Text-Overlay eingeben..."
                  style={{ boxShadow: 'none' }}
                  onFocus={(e) => { e.target.style.boxShadow = '0 0 0 2px rgba(124, 108, 242, 0.3)'; e.target.style.borderColor = 'rgba(124, 108, 242, 0.5)'; e.target.style.borderRadius = '4px'; e.target.style.padding = '2px 4px'; }}
                  onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = ''; e.target.style.padding = '0'; }}
                />
              </div>
            </div>

            {/* Right side: 9:16 Media Container */}
            <div className="flex-shrink-0 w-[100px]">
              {isGenerating ? (
                <div
                  className="aspect-[9/16] rounded-xl overflow-hidden relative flex items-center justify-center"
                  style={{
                    backgroundColor: '#1A1A1E',
                    animation: 'studioGeneratingGlow 2s ease-in-out infinite',
                    boxShadow: '0 0 20px rgba(124,108,242,0.25), inset 0 0 12px rgba(124,108,242,0.05)',
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-15"
                    style={{
                      background: 'linear-gradient(135deg, transparent 30%, rgba(124,108,242,0.4) 50%, transparent 70%)',
                      backgroundSize: '200% 200%',
                      animation: 'studioShimmer 2s ease-in-out infinite',
                    }}
                  />
                </div>
              ) : isFinished ? (
                <div
                  className="aspect-[9/16] rounded-xl overflow-hidden relative group/video"
                  style={{ animation: 'studioVideoFadeIn 300ms ease-out' }}
                  onClick={handleVideoClick}
                >
                  <video
                    src={videoUrl!}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/video:opacity-100 transition-opacity bg-black/20">
                    {paused ? <Play className="w-6 h-6 text-white/80" /> : <Pause className="w-6 h-6 text-white/80" />}
                  </div>
                </div>
              ) : (
                <div className="aspect-[9/16] rounded-xl bg-[#1A1A1E] border border-[#FAFAFA]/5 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-[#FAFAFA]/20" />
                </div>
              )}
            </div>
          </div>
        </div>

      {/* Delete confirmation dialog */}
      {showDeleteDialog && (
        <DeleteDialog
          sceneNr={scene.nr}
          onConfirm={() => { setShowDeleteDialog(false); onDelete(); }}
          onCancel={() => setShowDeleteDialog(false)}
        />
      )}
    </div>
  );
};

export default StudioSceneCard;
