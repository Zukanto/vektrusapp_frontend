import React, { useState, useEffect } from 'react';
import { Camera, Clock, Type, Wand2, Subtitles, Scissors, MousePointerClick, Clapperboard, Film, Timer, Check, RefreshCw, Loader, X } from 'lucide-react';
import type { ReelScene, ReelContent } from '../../services/reelService';
import type { SceneVideo } from '../../hooks/useSceneVideos';
import { supabase } from '../../lib/supabase';
import { callN8n } from '../../lib/n8n';
import { useAuth } from '../../hooks/useAuth';

const CAMERA_LABELS: Record<string, string> = {
  frontal_selfie: 'Frontal',
  detail_nahaufnahme: 'Nahaufnahme',
  over_the_shoulder: 'Über die Schulter',
  pov: 'POV',
  stativ_weit: 'Weitwinkel',
  drohne: 'Drohne',
};

const FORMAT_LABELS: Record<string, string> = {
  talking_head: 'Talking Head',
  produkt_showcase: 'Produkt-Showcase',
  tutorial: 'Tutorial',
  behind_the_scenes: 'Behind the Scenes',
  vorher_nachher: 'Vorher/Nachher',
  b_roll_montage: 'B-Roll Montage',
  listicle: 'Listicle',
};

const DURATION_OPTIONS = [3, 4, 5, 6, 7, 8] as const;

const FAILED_MESSAGES: Record<string, string> = {
  failed_timeout: 'Die Generierung hat zu lange gedauert.',
  failed_generation: 'Die Video-Generierung ist fehlgeschlagen.',
  failed_download: 'Das Video konnte nicht gespeichert werden.',
  failed: 'Ein Fehler ist aufgetreten.',
};

interface StudioInspectorProps {
  scene: ReelScene | null;
  concept?: ReelContent;
  reelConceptId?: string;
  sceneVideo?: SceneVideo | null;
  onVideoGenerated?: () => void;
}

const StudioInspector: React.FC<StudioInspectorProps> = ({
  scene,
  concept,
  reelConceptId,
  sceneVideo,
  onVideoGenerated,
}) => {
  const { user } = useAuth();
  const [brollDescription, setBrollDescription] = useState(scene?.action || '');
  const [clipDuration, setClipDuration] = useState(scene?.duration_seconds || 5);
  const [submitting, setSubmitting] = useState(false);

  // Sync textarea + duration when scene changes
  useEffect(() => {
    setBrollDescription(scene?.action || '');
    setClipDuration(scene?.duration_seconds || 5);
  }, [scene?.nr, scene?.action, scene?.duration_seconds]);

  // Determine display state from sceneVideo
  const isGenerating = sceneVideo?.status === 'generating' || sceneVideo?.status === 'queued';
  const isFinished = sceneVideo?.status === 'finished' && !!sceneVideo?.video_url;
  const isFailed = sceneVideo?.status?.startsWith('failed') || false;

  const handleGenerate = async () => {
    if (!user?.id || !scene || !reelConceptId) return;
    setSubmitting(true);

    try {
      // 1. Insert vision_project with scene_nr + reel_concept_id
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

      // 2. Call n8n webhook
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
        // Webhook fire-and-forget; polling will pick up status
      }

      // 3. Trigger refetch so useSceneVideos picks up the new record
      onVideoGenerated?.();
    } catch {
      // Error handled silently — user sees the scene stays without video
    } finally {
      setSubmitting(false);
    }
  };

  if (!scene) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6">
        {/* Icon with subtle pulse */}
        <div className="mb-4 opacity-30" style={{ animation: 'studio-inspector-pulse 3s ease-in-out infinite' }}>
          <MousePointerClick className="w-8 h-8 text-[#49B7E3]" />
        </div>
        <p className="text-[#FAFAFA]/30 text-sm text-center mb-1 font-medium">
          Wähle eine Szene aus
        </p>
        <p className="text-[#FAFAFA]/15 text-xs text-center">
          um Details und Bearbeitungsoptionen zu sehen
        </p>

        {/* Concept summary below */}
        {concept && (
          <div className="mt-8 w-full rounded-xl bg-[#121214] p-4 border border-[rgba(255,255,255,0.04)]">
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
        )}
      </div>
    );
  }

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
          <p className="text-[#FAFAFA]/60 text-sm mt-1 leading-relaxed">
            {scene.action}
          </p>
        </div>

        {/* B-Roll Inline Generation */}
        <div className="rounded-xl bg-[#121214] p-4">
          <span className="text-[11px] uppercase tracking-wider font-medium text-[#FAFAFA]/40 block mb-2">
            B-Roll Beschreibung
          </span>
          <textarea
            value={brollDescription}
            onChange={(e) => setBrollDescription(e.target.value)}
            className="w-full bg-[#1A1A1E] text-[#FAFAFA]/80 text-sm rounded-lg border border-[#FAFAFA]/5 p-3 resize-none focus:outline-none focus:border-[#49B7E3]/30 transition-colors"
            rows={3}
            disabled={isGenerating || submitting}
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

          {/* Generate / Status area */}
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

        {/* Scene Details */}
        <div className="rounded-xl bg-[#121214] p-4">
          <span className="text-[11px] uppercase tracking-wider font-medium text-[#FAFAFA]/40 block mb-3">
            Dreh-Details
          </span>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Camera className="w-4 h-4 text-[#FAFAFA]/30 flex-shrink-0" />
              <div>
                <p className="text-[11px] text-[#FAFAFA]/30">Kamera</p>
                <p className="text-sm text-[#FAFAFA]/70">
                  {CAMERA_LABELS[scene.camera] || scene.camera}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-[#FAFAFA]/30 flex-shrink-0" />
              <div>
                <p className="text-[11px] text-[#FAFAFA]/30">Dauer</p>
                <p className="text-sm text-[#FAFAFA]/70">
                  {scene.duration_seconds} Sek
                </p>
              </div>
            </div>
            {scene.text_overlay && (
              <div className="flex items-center gap-3">
                <Type className="w-4 h-4 text-[#FAFAFA]/30 flex-shrink-0" />
                <div>
                  <p className="text-[11px] text-[#FAFAFA]/30">Text-Overlay</p>
                  <p className="text-sm text-[#FAFAFA]/70">
                    {scene.text_overlay}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Auto-Edit Toggles (Placeholder) */}
        <div className="rounded-xl bg-[#121214] p-4">
          <span className="text-[11px] uppercase tracking-wider font-medium text-[#FAFAFA]/40 block mb-3">
            Auto-Edit
          </span>
          <div className="space-y-4">
            {/* Jump-Cuts Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Scissors className="w-4 h-4 text-[#FAFAFA]/30" />
                <span className="text-sm text-[#FAFAFA]/50">
                  Jump-Cuts anwenden
                </span>
              </div>
              <div className="w-10 h-[22px] rounded-full bg-[#FAFAFA]/10 opacity-50 cursor-not-allowed relative">
                <div className="absolute left-[3px] top-[3px] w-4 h-4 rounded-full bg-[#FAFAFA]/30 transition-transform" />
              </div>
            </div>

            {/* Subtitles Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Subtitles className="w-4 h-4 text-[#FAFAFA]/30" />
                <span className="text-sm text-[#FAFAFA]/50">
                  Untertitel generieren
                </span>
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
