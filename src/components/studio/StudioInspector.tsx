import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera, Clock, Type, Wand2, Subtitles, Scissors, MousePointerClick,
  Clapperboard, Film, Timer, Check, RefreshCw, Loader, X, User,
  Video, Smartphone, Monitor, Hand, ScanLine, Focus,
} from 'lucide-react';
import type { Scene, ReelConcept, CameraType } from '../../types/reelConcept';
import { CAMERA_LABELS, CAMERA_OPTIONS, FORMAT_LABELS } from '../../types/reelConcept';
import type { SceneVideo } from '../../hooks/useSceneVideos';
import { supabase } from '../../lib/supabase';
import { callN8n } from '../../lib/n8n';
import { useAuth } from '../../hooks/useAuth';

const FAILED_MESSAGES: Record<string, string> = {
  failed_timeout: 'Die Generierung hat zu lange gedauert.',
  failed_generation: 'Die Video-Generierung ist fehlgeschlagen.',
  failed_download: 'Das Video konnte nicht gespeichert werden.',
  failed: 'Ein Fehler ist aufgetreten.',
};

// ── Camera icon map ──
const CAMERA_ICONS: Record<string, React.ReactNode> = {
  frontal_selfie: <User className="w-5 h-5" />,
  detail_nah: <Focus className="w-5 h-5" />,
  weitwinkel: <Monitor className="w-5 h-5" />,
  screen_recording: <ScanLine className="w-5 h-5" />,
  produkt_fokus: <Video className="w-5 h-5" />,
  'hände_fokus': <Hand className="w-5 h-5" />,
};

// ── Auto-resize textarea ──
const AutoTextarea: React.FC<{
  value: string;
  onChange: (v: string) => void;
  className?: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}> = ({ value, onChange, className = '', placeholder, rows = 2, disabled }) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  const resize = useCallback(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }, []);
  useEffect(resize, [value, resize]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className={`w-full bg-[rgba(255,255,255,0.06)] text-[#FAFAFA]/80 text-sm rounded-lg border border-[rgba(255,255,255,0.1)] p-3 resize-none focus:outline-none transition-colors ${className}`}
      style={{ boxShadow: 'none' }}
      onFocus={(e) => { (e.target as HTMLTextAreaElement).style.boxShadow = '0 0 0 2px rgba(124, 108, 242, 0.3)'; (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(124, 108, 242, 0.5)'; }}
      onBlur={(e) => { (e.target as HTMLTextAreaElement).style.boxShadow = 'none'; (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(255, 255, 255, 0.1)'; }}
    />
  );
};

interface StudioInspectorProps {
  scene: Scene | null;
  sceneIndex: number | null;
  concept?: ReelConcept;
  reelConceptId?: string;
  sceneVideo?: SceneVideo | null;
  onVideoGenerated?: () => void;
  onSceneChange?: (index: number, scene: Scene) => void;
  onConceptChange?: (concept: ReelConcept) => void;
}

const StudioInspector: React.FC<StudioInspectorProps> = ({
  scene,
  sceneIndex,
  concept,
  reelConceptId,
  sceneVideo,
  onVideoGenerated,
  onSceneChange,
  onConceptChange,
}) => {
  const { user } = useAuth();
  const [brollDescription, setBrollDescription] = useState(scene?.action || '');
  const [clipDuration, setClipDuration] = useState(scene?.duration_seconds || 5);
  const [submitting, setSubmitting] = useState(false);

  // Sync when scene changes externally
  useEffect(() => {
    setBrollDescription(scene?.action || '');
    setClipDuration(scene?.duration_seconds || 5);
  }, [scene?.nr, scene?.action, scene?.duration_seconds]);

  const isGenerating = sceneVideo?.status === 'generating' || sceneVideo?.status === 'queued';
  const isFinished = sceneVideo?.status === 'finished' && !!sceneVideo?.video_url;
  const isFailed = sceneVideo?.status?.startsWith('failed') || false;

  // ── Update scene (bidirectional) ──
  const updateScene = useCallback(
    (partial: Partial<Scene>) => {
      if (!scene || sceneIndex === null || !onSceneChange) return;
      onSceneChange(sceneIndex, { ...scene, ...partial });
    },
    [scene, sceneIndex, onSceneChange]
  );

  // ── needs_face toggle ──
  const toggleNeedsFace = useCallback(() => {
    if (!concept || !onConceptChange) return;
    onConceptChange({ ...concept, needs_face: !concept.needs_face });
  }, [concept, onConceptChange]);

  const DURATION_OPTIONS = [3, 4, 5, 6, 7, 8] as const;

  const handleGenerate = async () => {
    if (!user?.id || !scene || !reelConceptId) return;
    setSubmitting(true);

    try {
      const { data: project, error: insertError } = await supabase
        .from('vision_projects')
        .insert({
          user_id: user.id,
          product_name: (brollDescription || scene.action).substring(0, 100),
          user_description: brollDescription || scene.action,
          status: 'queued',
          model_selection: 'veo',
          reel_concept_id: reelConceptId,
          scene_nr: scene.nr,
        })
        .select()
        .single();

      if (insertError || !project) throw insertError || new Error('Insert fehlgeschlagen');

      try {
        await callN8n('vektrus-vision-broll', {
          user_id: user.id,
          vision_project_id: project.id,
          clip_description: brollDescription || scene.action,
          clip_duration: clipDuration,
          clip_purpose: 'b_roll',
          reel_concept_id: reelConceptId,
          reference_images: [],
        });
      } catch {
        // fire-and-forget
      }

      onVideoGenerated?.();
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  };

  // ── Empty state ──
  if (!scene) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6">
        <div className="mb-4 opacity-30" style={{ animation: 'studio-inspector-pulse 3s ease-in-out infinite' }}>
          <MousePointerClick className="w-8 h-8 text-[#49B7E3]" />
        </div>
        <p className="text-[#FAFAFA]/30 text-sm text-center mb-1 font-medium">
          Wähle eine Szene aus
        </p>
        <p className="text-[#FAFAFA]/15 text-xs text-center">
          um Details und Bearbeitungsoptionen zu sehen
        </p>

        {concept && (
          <div className="mt-8 w-full space-y-4">
            <div className="rounded-xl bg-[#121214] p-4 border border-[rgba(255,255,255,0.04)]">
              <p className="text-[#FAFAFA]/30 text-[11px] uppercase tracking-wider font-medium mb-3">
                Konzept-Übersicht
              </p>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <Clapperboard className="w-3.5 h-3.5 text-[#FAFAFA]/20 flex-shrink-0" />
                  <span className="text-[#FAFAFA]/50 text-xs truncate">{concept.title}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Film className="w-3.5 h-3.5 text-[#FAFAFA]/20 flex-shrink-0" />
                  <span className="text-[#FAFAFA]/50 text-xs">
                    {FORMAT_LABELS[concept.format] || concept.format}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Timer className="w-3.5 h-3.5 text-[#FAFAFA]/20 flex-shrink-0" />
                  <span className="text-[#FAFAFA]/50 text-xs">{concept.total_duration_seconds}s Gesamtdauer</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Camera className="w-3.5 h-3.5 text-[#FAFAFA]/20 flex-shrink-0" />
                  <span className="text-[#FAFAFA]/50 text-xs">{concept.scenes.length} Szenen</span>
                </div>
              </div>
            </div>

            {/* needs_face toggle */}
            <div className="rounded-xl bg-[#121214] p-4 border border-[rgba(255,255,255,0.04)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <User className="w-3.5 h-3.5 text-[#FAFAFA]/20 flex-shrink-0" />
                  <span className="text-[#FAFAFA]/50 text-xs">Gesicht im Video</span>
                </div>
                <button
                  onClick={toggleNeedsFace}
                  className={`w-10 h-[22px] rounded-full relative transition-colors cursor-pointer border-none ${
                    concept.needs_face ? 'bg-[#49B7E3]' : 'bg-[#FAFAFA]/10'
                  }`}
                >
                  <div
                    className={`absolute top-[3px] w-4 h-4 rounded-full bg-white transition-transform ${
                      concept.needs_face ? 'left-[23px]' : 'left-[3px]'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Scene selected ──
  return (
    <div className="h-full overflow-y-auto pl-2 studio-scrollbar">
      <div className="space-y-5 pb-6">
        {/* Scene Header */}
        <div>
          <p className="text-[#FAFAFA]/40 text-[11px] uppercase tracking-wider font-medium mb-1">
            Inspektor
          </p>
          <h3 className="text-lg font-manrope font-bold text-[#FAFAFA]">
            Szene {scene.nr}
          </h3>
        </div>

        {/* Editable scene action */}
        <div className="rounded-xl bg-[#121214] p-4">
          <span className="text-[11px] uppercase tracking-wider font-medium text-[#FAFAFA]/40 block mb-2">
            Szenen-Beschreibung
          </span>
          <AutoTextarea
            value={scene.action}
            onChange={(action) => updateScene({ action })}
            placeholder="Was passiert in dieser Szene..."
          />
        </div>

        {/* Camera type as icon selector */}
        <div className="rounded-xl bg-[#121214] p-4">
          <span className="text-[11px] uppercase tracking-wider font-medium text-[#FAFAFA]/40 block mb-3">
            Kamera-Typ
          </span>
          <div className="grid grid-cols-3 gap-2">
            {CAMERA_OPTIONS.map((cam) => {
              const isActive = scene.camera === cam;
              return (
                <button
                  key={cam}
                  onClick={() => updateScene({ camera: cam })}
                  className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-[#49B7E3]/10 border-[#49B7E3]/40 text-[#49B7E3]'
                      : 'bg-transparent border-[rgba(255,255,255,0.06)] text-[#FAFAFA]/30 hover:border-[rgba(255,255,255,0.15)] hover:text-[#FAFAFA]/50'
                  }`}
                >
                  {CAMERA_ICONS[cam] || <Camera className="w-5 h-5" />}
                  <span className="text-[10px] font-medium leading-tight text-center">
                    {CAMERA_LABELS[cam]?.split(' / ')[0] || cam}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Duration */}
        <div className="rounded-xl bg-[#121214] p-4">
          <span className="text-[11px] uppercase tracking-wider font-medium text-[#FAFAFA]/40 block mb-2">
            Dauer
          </span>
          <div className="flex gap-1.5">
            {DURATION_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => updateScene({ duration_seconds: d })}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer border ${
                  scene.duration_seconds === d
                    ? 'bg-[#49B7E3]/15 text-[#49B7E3] border-[#49B7E3]/40'
                    : 'bg-[#1A1A1E] text-[#FAFAFA]/40 border-transparent hover:border-[rgba(255,255,255,0.08)]'
                }`}
              >
                {d}s
              </button>
            ))}
          </div>
        </div>

        {/* Text overlay */}
        <div className="rounded-xl bg-[#121214] p-4">
          <span className="text-[11px] uppercase tracking-wider font-medium text-[#FAFAFA]/40 block mb-2">
            Text-Overlay
          </span>
          <input
            value={scene.text_overlay || ''}
            onChange={(e) => updateScene({ text_overlay: e.target.value || null })}
            className="w-full bg-[rgba(255,255,255,0.06)] text-[#FAFAFA]/80 text-sm rounded-lg border border-[rgba(255,255,255,0.1)] px-3 py-2 focus:outline-none transition-colors"
            placeholder="Text-Overlay eingeben..."
            style={{ boxShadow: 'none' }}
            onFocus={(e) => { e.target.style.boxShadow = '0 0 0 2px rgba(124, 108, 242, 0.3)'; e.target.style.borderColor = 'rgba(124, 108, 242, 0.5)'; }}
            onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'; }}
          />
        </div>

        {/* Tip */}
        <div className="rounded-xl bg-[#121214] p-4">
          <span className="text-[11px] uppercase tracking-wider font-medium text-[#FAFAFA]/40 block mb-2">
            Tipp
          </span>
          <input
            value={scene.tip}
            onChange={(e) => updateScene({ tip: e.target.value })}
            className="w-full bg-[rgba(255,255,255,0.06)] text-[#FAFAFA]/80 text-sm rounded-lg border border-[rgba(255,255,255,0.1)] px-3 py-2 focus:outline-none transition-colors"
            placeholder="Tipp für diese Szene..."
            style={{ boxShadow: 'none' }}
            onFocus={(e) => { e.target.style.boxShadow = '0 0 0 2px rgba(124, 108, 242, 0.3)'; e.target.style.borderColor = 'rgba(124, 108, 242, 0.5)'; }}
            onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'; }}
          />
        </div>

        {/* B-Roll Generation */}
        <div className="rounded-xl bg-[#121214] p-4">
          <span className="text-[11px] uppercase tracking-wider font-medium text-[#FAFAFA]/40 block mb-2">
            B-Roll Beschreibung
          </span>
          <AutoTextarea
            value={brollDescription}
            onChange={setBrollDescription}
            disabled={isGenerating || submitting}
            placeholder="Beschreibung für das B-Roll-Video..."
          />

          {/* Duration chips */}
          <div className="mt-3">
            <span className="text-[10px] uppercase tracking-wider font-medium text-[#FAFAFA]/30 block mb-1.5">
              Clip-Dauer
            </span>
            <div className="flex gap-1.5">
              {DURATION_OPTIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setClipDuration(d)}
                  disabled={isGenerating || submitting}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer border ${
                    clipDuration === d
                      ? 'bg-[#49B7E3]/15 text-[#49B7E3] border-[#49B7E3]/40'
                      : 'bg-[#1A1A1E] text-[#FAFAFA]/40 border-transparent hover:border-[rgba(255,255,255,0.08)]'
                  }`}
                >
                  {d}s
                </button>
              ))}
            </div>
          </div>

          {/* Generate / Status */}
          <div className="mt-3">
            {isGenerating ? (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#7C6CF2]/10 border border-[#7C6CF2]/20">
                <Loader className="w-4 h-4 text-[#7C6CF2] animate-spin flex-shrink-0" />
                <span className="text-sm text-[#7C6CF2]/80 font-medium">Video wird erstellt...</span>
              </div>
            ) : isFinished ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#49D69E]/10 border border-[#49D69E]/20">
                  <Check className="w-4 h-4 text-[#49D69E] flex-shrink-0" />
                  <span className="text-sm text-[#49D69E]/80 font-medium">Video erstellt</span>
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-[#FAFAFA]/50 hover:text-[#FAFAFA]/70 border border-[#FAFAFA]/10 hover:border-[#FAFAFA]/20 transition-colors cursor-pointer bg-transparent"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Nochmal generieren
                </button>
              </div>
            ) : isFailed ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FA7E70]/10 border border-[#FA7E70]/20">
                  <X className="w-4 h-4 text-[#FA7E70] flex-shrink-0" />
                  <span className="text-sm text-[#FA7E70]/80 font-medium">
                    {FAILED_MESSAGES[sceneVideo?.status || ''] || FAILED_MESSAGES.failed}
                  </span>
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#7C6CF2] text-white hover:bg-[#6b5ce0] transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  Erneut versuchen
                </button>
              </div>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={submitting || !reelConceptId}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                  submitting
                    ? 'bg-[#7C6CF2]/50 text-white/70 cursor-wait'
                    : 'bg-[#7C6CF2] text-white hover:bg-[#6b5ce0]'
                }`}
              >
                {submitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Wird gestartet...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    KI-Video generieren
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* needs_face toggle */}
        {concept && (
          <div className="rounded-xl bg-[#121214] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-[#FAFAFA]/30" />
                <span className="text-sm text-[#FAFAFA]/50">Gesicht im Video</span>
              </div>
              <button
                onClick={toggleNeedsFace}
                className={`w-10 h-[22px] rounded-full relative transition-colors cursor-pointer border-none ${
                  concept.needs_face ? 'bg-[#49B7E3]' : 'bg-[#FAFAFA]/10'
                }`}
              >
                <div
                  className={`absolute top-[3px] w-4 h-4 rounded-full bg-white transition-transform ${
                    concept.needs_face ? 'left-[23px]' : 'left-[3px]'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Auto-Edit Toggles (Placeholder) */}
        <div className="rounded-xl bg-[#121214] p-4">
          <span className="text-[11px] uppercase tracking-wider font-medium text-[#FAFAFA]/40 block mb-3">
            Auto-Edit
          </span>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Scissors className="w-4 h-4 text-[#FAFAFA]/30" />
                <span className="text-sm text-[#FAFAFA]/50">Jump-Cuts anwenden</span>
              </div>
              <div className="w-10 h-[22px] rounded-full bg-[#FAFAFA]/10 opacity-50 cursor-not-allowed relative">
                <div className="absolute left-[3px] top-[3px] w-4 h-4 rounded-full bg-[#FAFAFA]/30 transition-transform" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Subtitles className="w-4 h-4 text-[#FAFAFA]/30" />
                <span className="text-sm text-[#FAFAFA]/50">Untertitel generieren</span>
              </div>
              <div className="w-10 h-[22px] rounded-full bg-[#FAFAFA]/10 opacity-50 cursor-not-allowed relative">
                <div className="absolute left-[3px] top-[3px] w-4 h-4 rounded-full bg-[#FAFAFA]/30 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudioInspector;
