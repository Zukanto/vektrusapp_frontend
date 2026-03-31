import React, { useState, useEffect } from 'react';
import { Camera, Clock, Type, Wand2, Subtitles, Scissors, MousePointerClick, Clapperboard, Film, Timer } from 'lucide-react';
import type { ReelScene, ReelContent } from '../../services/reelService';

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

interface StudioInspectorProps {
  scene: ReelScene | null;
  concept?: ReelContent;
  onGenerateBRoll?: (description: string, duration: number) => void;
}

const StudioInspector: React.FC<StudioInspectorProps> = ({ scene, concept, onGenerateBRoll }) => {
  const [brollDescription, setBrollDescription] = useState(scene?.action || '');

  // Sync textarea when scene changes
  useEffect(() => {
    setBrollDescription(scene?.action || '');
  }, [scene?.nr, scene?.action]);

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

        {/* B-Roll Input */}
        <div className="rounded-xl bg-[#121214] p-4">
          <span className="text-[11px] uppercase tracking-wider font-medium text-[#FAFAFA]/40 block mb-2">
            B-Roll Beschreibung
          </span>
          <textarea
            value={brollDescription}
            onChange={(e) => setBrollDescription(e.target.value)}
            className="w-full bg-[#1A1A1E] text-[#FAFAFA]/80 text-sm rounded-lg border border-[#FAFAFA]/5 p-3 resize-none focus:outline-none focus:border-[#49B7E3]/30 transition-colors"
            rows={3}
          />
          <button
            onClick={() => onGenerateBRoll?.(brollDescription || scene.action, scene.duration_seconds)}
            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#7C6CF2] text-white hover:bg-[#6b5ce0] transition-colors cursor-pointer"
          >
            <Wand2 className="w-4 h-4" />
            KI-Video generieren
          </button>
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
