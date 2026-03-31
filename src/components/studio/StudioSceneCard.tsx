import React, { useState } from 'react';
import { Plus, Clock, Camera, Play, Pause } from 'lucide-react';
import type { ReelScene } from '../../services/reelService';
import type { SceneVideo } from '../../hooks/useSceneVideos';

const CAMERA_LABELS: Record<string, string> = {
  frontal_selfie: 'Frontal',
  detail_nahaufnahme: 'Nahaufnahme',
  over_the_shoulder: 'Über die Schulter',
  pov: 'POV',
  stativ_weit: 'Weitwinkel',
  drohne: 'Drohne',
};

interface StudioSceneCardProps {
  scene: ReelScene;
  isSelected: boolean;
  isLast: boolean;
  sceneVideo?: SceneVideo | null;
  onClick: () => void;
}

const StudioSceneCard: React.FC<StudioSceneCardProps> = ({
  scene,
  isSelected,
  isLast,
  sceneVideo,
  onClick,
}) => {
  const [paused, setPaused] = useState(false);

  const isGenerating = sceneVideo?.status === 'generating' || sceneVideo?.status === 'queued';
  const isFinished = sceneVideo?.status === 'finished' && !!sceneVideo?.video_url;

  const handleVideoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = e.currentTarget.querySelector('video');
    if (video) {
      if (video.paused) {
        video.play();
        setPaused(false);
      } else {
        video.pause();
        setPaused(true);
      }
    }
  };

  return (
    <div className="relative flex gap-5">
      {/* Timeline connector */}
      <div className="flex flex-col items-center flex-shrink-0 w-10">
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

      {/* Card */}
      <button
        onClick={onClick}
        className={`flex-1 rounded-[16px] p-5 text-left transition-all cursor-pointer border mb-4 ${
          isSelected
            ? 'bg-[#121214] border-[#49B7E3]/40'
            : 'bg-[#121214] border-transparent hover:border-[rgba(255,255,255,0.08)]'
        }`}
      >
        <div className="flex gap-4">
          {/* Left side: Regie */}
          <div className="flex-1 min-w-0">
            <p className="text-[#FAFAFA] text-sm leading-relaxed mb-3">
              {scene.action}
            </p>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium bg-[#FAFAFA]/5 text-[#FAFAFA]/60">
                <Clock className="w-3 h-3" />
                {scene.duration_seconds} Sek
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium bg-[#FAFAFA]/5 text-[#FAFAFA]/60">
                <Camera className="w-3 h-3" />
                {CAMERA_LABELS[scene.camera] || scene.camera}
              </span>
            </div>

            {/* Tip */}
            <p className="text-[#7A7A7A] text-xs leading-relaxed">
              💡 {scene.tip}
            </p>

            {/* Text Overlay */}
            {scene.text_overlay && (
              <div className="mt-2 px-2.5 py-1.5 rounded-lg bg-[#FAFAFA]/5 border border-[#FAFAFA]/5">
                <span className="text-[11px] text-[#FAFAFA]/40 uppercase tracking-wider font-medium">
                  Text-Overlay
                </span>
                <p className="text-[#FAFAFA]/80 text-xs mt-0.5">
                  {scene.text_overlay}
                </p>
              </div>
            )}
          </div>

          {/* Right side: 9:16 Media Container */}
          <div className="flex-shrink-0 w-[100px]">
            {isGenerating ? (
              /* State 2: Generating — Violet glow + shimmer */
              <div
                className="aspect-[9/16] rounded-xl overflow-hidden relative flex items-center justify-center"
                style={{
                  backgroundColor: '#1A1A1E',
                  animation: 'studioGeneratingGlow 2s ease-in-out infinite',
                  boxShadow: '0 0 20px rgba(124,108,242,0.25), inset 0 0 12px rgba(124,108,242,0.05)',
                }}
              >
                {/* Shimmer overlay */}
                <div
                  className="absolute inset-0 opacity-15"
                  style={{
                    background:
                      'linear-gradient(135deg, transparent 30%, rgba(124,108,242,0.4) 50%, transparent 70%)',
                    backgroundSize: '200% 200%',
                    animation: 'studioShimmer 2s ease-in-out infinite',
                  }}
                />
              </div>
            ) : isFinished ? (
              /* State 3: Finished — Video with fade-in */
              <div
                className="aspect-[9/16] rounded-xl overflow-hidden relative group/video"
                style={{ animation: 'studioVideoFadeIn 300ms ease-out' }}
                onClick={handleVideoClick}
              >
                <video
                  src={sceneVideo.video_url!}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
                {/* Play/Pause overlay on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/video:opacity-100 transition-opacity bg-black/20">
                  {paused ? (
                    <Play className="w-6 h-6 text-white/80" />
                  ) : (
                    <Pause className="w-6 h-6 text-white/80" />
                  )}
                </div>
              </div>
            ) : (
              /* State 1: No video — dark placeholder */
              <div className="aspect-[9/16] rounded-xl bg-[#1A1A1E] border border-[#FAFAFA]/5 flex items-center justify-center">
                <Plus className="w-5 h-5 text-[#FAFAFA]/20" />
              </div>
            )}
          </div>
        </div>
      </button>
    </div>
  );
};

export default StudioSceneCard;
