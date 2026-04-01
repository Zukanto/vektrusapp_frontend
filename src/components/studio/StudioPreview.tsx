import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Repeat, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import type { ReelConcept } from '../../types/reelConcept';
import { CAMERA_LABELS } from '../../types/reelConcept';

interface StudioPreviewProps {
  concept: ReelConcept;
  onClose: () => void;
}

const StudioPreview: React.FC<StudioPreviewProps> = ({ concept, onClose }) => {
  const { user } = useAuth();

  // ── Player state ──
  const [playing, setPlaying] = useState(true);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [elapsedInScene, setElapsedInScene] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [loopEnabled, setLoopEnabled] = useState(false);

  // ── Visual state ──
  const [bgGradient, setBgGradient] = useState('linear-gradient(135deg, #1a1a2e, #16213e)');
  const [showSceneInfo, setShowSceneInfo] = useState(true);

  // ── Audio preparation (Feature 3) ──
  const audioRef = useRef<HTMLAudioElement>(null);
  const sceneInfoTimeout = useRef<ReturnType<typeof setTimeout>>();
  const voiceoverUrl = concept.voiceover_audio_url;

  const totalDuration = concept.total_duration_seconds;
  const currentScene = concept.scenes[currentSceneIndex];

  // ── Load brand colors (once) ──
  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      const { data } = await supabase
        .from('brand_profiles')
        .select('colors')
        .eq('user_id', user.id)
        .single();
      const primary = (data?.colors as Record<string, string>)?.primary || '#1a1a2e';
      const secondary = (data?.colors as Record<string, string>)?.secondary || '#16213e';
      setBgGradient(`linear-gradient(135deg, ${primary}, ${secondary})`);
    };
    load();
  }, [user?.id]);

  // ── Scene info overlay — show on change, hide before next scene ──
  useEffect(() => {
    setShowSceneInfo(true);
    clearTimeout(sceneInfoTimeout.current);
    const sceneDur = concept.scenes[currentSceneIndex]?.duration_seconds || 4;
    const hideAfterMs = Math.min(1500, sceneDur * 600);
    sceneInfoTimeout.current = setTimeout(() => setShowSceneInfo(false), hideAfterMs);
    return () => clearTimeout(sceneInfoTimeout.current);
  }, [currentSceneIndex, concept.scenes]);

  // ── Timer loop (100ms interval) ──
  useEffect(() => {
    if (!playing) return;

    const interval = setInterval(() => {
      const sceneDuration = concept.scenes[currentSceneIndex]?.duration_seconds || 4;

      setElapsedInScene((prev) => {
        const newElapsed = prev + 0.1;

        if (newElapsed >= sceneDuration) {
          if (currentSceneIndex < concept.scenes.length - 1) {
            // Advance to next scene
            setCurrentSceneIndex((i) => i + 1);
            return 0;
          } else if (loopEnabled) {
            // Loop: clean reset to start
            setCurrentSceneIndex(0);
            setTotalElapsed(0);
            return 0;
          } else {
            // End: stop and clamp
            setPlaying(false);
            return sceneDuration;
          }
        }
        return newElapsed;
      });

      setTotalElapsed((prev) => Math.min(prev + 0.1, totalDuration));
    }, 100);

    return () => clearInterval(interval);
  }, [playing, currentSceneIndex, loopEnabled, concept.scenes, totalDuration]);

  // ── Audio sync (Feature 3 — currently inactive) ──
  useEffect(() => {
    if (!audioRef.current || !voiceoverUrl) return;
    if (playing) {
      audioRef.current.currentTime = totalElapsed;
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [playing, totalElapsed, voiceoverUrl]);

  // ── Progress calculations ──
  const progress = totalDuration > 0 ? totalElapsed / totalDuration : 0;

  const sceneMarkers = concept.scenes.reduce((acc, scene, i) => {
    if (i === concept.scenes.length - 1) return acc;
    const prevEnd = acc.length > 0 ? acc[acc.length - 1] : 0;
    acc.push(prevEnd + scene.duration_seconds / totalDuration);
    return acc;
  }, [] as number[]);

  // ── Seek on progress bar click ──
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const newTotalElapsed = ratio * totalDuration;

    let elapsed = 0;
    let newSceneIndex = 0;
    for (let i = 0; i < concept.scenes.length; i++) {
      if (newTotalElapsed <= elapsed + concept.scenes[i].duration_seconds) {
        newSceneIndex = i;
        break;
      }
      elapsed += concept.scenes[i].duration_seconds;
      newSceneIndex = i;
    }

    setCurrentSceneIndex(newSceneIndex);
    setTotalElapsed(newTotalElapsed);
    setElapsedInScene(newTotalElapsed - elapsed);
  };

  // ── Controls ──
  const handleRestart = () => {
    setCurrentSceneIndex(0);
    setElapsedInScene(0);
    setTotalElapsed(0);
    setPlaying(false);
  };

  if (!currentScene) return null;

  return (
    <div className="h-full flex flex-col items-center">
      {/* Player area */}
      <div className="flex-1 min-h-0 flex items-center justify-center w-full py-2">
        <div
          className="relative overflow-hidden"
          style={{
            aspectRatio: '9/16',
            height: '100%',
            maxHeight: 'calc(100vh - 180px)',
            maxWidth: '100%',
            backgroundColor: '#09090b',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
          }}
        >
          {/* Scene content with transitions */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSceneIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              {/* Background: B-Roll video or Brand gradient */}
              {currentScene.broll_video_url ? (
                <video
                  src={currentScene.broll_video_url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0" style={{ background: bgGradient }} />
              )}

              {/* Text overlay */}
              {currentScene.text_overlay && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="absolute bottom-1/3 left-4 right-4 text-center"
                >
                  <span className="bg-black/60 backdrop-blur-sm text-white text-lg font-bold px-4 py-2 rounded-lg inline-block">
                    {currentScene.text_overlay}
                  </span>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Scene info overlay (top left) */}
          <AnimatePresence>
            {showSceneInfo && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute top-3 left-3 z-10"
              >
                <span
                  className="text-[11px] font-medium px-2.5 py-1 rounded-md"
                  style={{
                    color: 'rgba(250,250,250,0.6)',
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  Szene {currentScene.nr}/{concept.scenes.length}{' '}
                  · {CAMERA_LABELS[currentScene.camera] || currentScene.camera}{' '}
                  · {currentScene.duration_seconds}s
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress bar — enlarged touch target, 3px visible track */}
          <div
            className="absolute bottom-0 left-0 right-0 cursor-pointer z-10"
            style={{ paddingTop: '8px', paddingBottom: '8px', marginBottom: '-8px' }}
            onClick={handleProgressClick}
          >
            <div
              className="relative w-full"
              style={{ height: '3px', backgroundColor: 'rgba(255,255,255,0.1)' }}
            >
              {/* Fill */}
              <div
                className="absolute top-0 left-0 h-full"
                style={{
                  width: `${Math.min(progress * 100, 100)}%`,
                  backgroundColor: '#49B7E3',
                }}
              />
              {/* Scene markers */}
              {sceneMarkers.map((pos, i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${pos * 100}%`,
                    top: '-2.5px',
                    width: '1px',
                    height: '8px',
                    backgroundColor: 'rgba(255,255,255,0.4)',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 py-3 flex-shrink-0">
        {/* Play / Pause */}
        <button
          onClick={() => setPlaying(!playing)}
          className="w-9 h-9 rounded-full flex items-center justify-center text-[#FAFAFA] hover:bg-[rgba(255,255,255,0.1)] transition-colors cursor-pointer bg-transparent border-none"
          title={playing ? 'Pause' : 'Abspielen'}
        >
          {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>

        {/* Restart */}
        <button
          onClick={handleRestart}
          className="w-9 h-9 rounded-full flex items-center justify-center text-[#FAFAFA] hover:bg-[rgba(255,255,255,0.1)] transition-colors cursor-pointer bg-transparent border-none"
          title="Neustart"
        >
          <RotateCcw className="w-[18px] h-[18px]" />
        </button>

        {/* Loop */}
        <button
          onClick={() => setLoopEnabled(!loopEnabled)}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[rgba(255,255,255,0.1)] transition-colors cursor-pointer bg-transparent border-none"
          style={{ color: loopEnabled ? '#49B7E3' : '#FAFAFA' }}
          title={loopEnabled ? 'Wiederholen: An' : 'Wiederholen: Aus'}
        >
          <Repeat className="w-[18px] h-[18px]" />
        </button>

        {/* Close */}
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center text-[#FAFAFA] hover:bg-[rgba(255,255,255,0.1)] transition-colors cursor-pointer bg-transparent border-none"
          title="Schließen"
        >
          <X className="w-[18px] h-[18px]" />
        </button>
      </div>

      {/* Audio element (Feature 3 preparation — currently invisible) */}
      {voiceoverUrl && <audio ref={audioRef} src={voiceoverUrl} />}
    </div>
  );
};

export default StudioPreview;
