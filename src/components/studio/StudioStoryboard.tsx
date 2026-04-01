import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ReelConcept, Scene } from '../../types/reelConcept';
import type { SceneVideoMap } from '../../hooks/useSceneVideos';
import StudioScript from './StudioScript';
import StudioSceneList from './StudioSceneList';
import StudioInspector from './StudioInspector';
import StudioMetaBar from './StudioMetaBar';
import StudioPreview from './StudioPreview';

interface StudioStoryboardProps {
  concept: ReelConcept;
  reelConceptId?: string;
  sceneVideos: SceneVideoMap;
  onVideoGenerated?: () => void;
  onConceptChange?: (concept: ReelConcept) => void;
  onPreviewActiveChange?: (active: boolean) => void;
}

const StudioStoryboard: React.FC<StudioStoryboardProps> = ({
  concept,
  reelConceptId,
  sceneVideos,
  onVideoGenerated,
  onConceptChange,
  onPreviewActiveChange,
}) => {
  const [selectedSceneIndex, setSelectedSceneIndex] = useState<number | null>(null);
  const [previewActive, setPreviewActive] = useState(false);

  const selectedScene =
    selectedSceneIndex !== null ? concept.scenes[selectedSceneIndex] ?? null : null;

  // ── Sync finished video URLs into scene objects ──
  // This ensures broll_video_url travels with the scene during DnD reorder.
  const syncedRef = useRef<string>('');
  useEffect(() => {
    if (!onConceptChange) return;
    const fingerprint = Object.entries(sceneVideos)
      .filter(([, v]) => v.status === 'finished' && v.video_url)
      .map(([nr, v]) => `${nr}:${v.video_url}`)
      .join('|');
    if (fingerprint === syncedRef.current || !fingerprint) return;
    syncedRef.current = fingerprint;

    let hasChanges = false;
    const updatedScenes = concept.scenes.map((scene) => {
      const video = sceneVideos[scene.nr];
      if (
        video?.status === 'finished' &&
        video.video_url &&
        scene.broll_video_url !== video.video_url
      ) {
        hasChanges = true;
        return { ...scene, broll_video_url: video.video_url, broll_status: 'finished' as const };
      }
      return scene;
    });
    if (hasChanges) {
      onConceptChange({ ...concept, scenes: updatedScenes });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneVideos]);

  // ── Scene update handler (used by both SceneCard and Inspector) ──
  const handleSceneChange = useCallback(
    (sceneIndex: number, updatedScene: Scene) => {
      if (!onConceptChange) return;
      const newScenes = [...concept.scenes];
      newScenes[sceneIndex] = updatedScene;
      onConceptChange({ ...concept, scenes: newScenes });
    },
    [concept, onConceptChange]
  );

  // ── Scenes reorder handler ──
  const handleScenesReorder = useCallback(
    (newScenes: Scene[]) => {
      if (!onConceptChange) return;
      onConceptChange({ ...concept, scenes: newScenes });
    },
    [concept, onConceptChange]
  );

  // ── Scene add/delete ──
  const handleSceneAdd = useCallback(
    (afterIndex: number) => {
      if (!onConceptChange) return;
      const newScene: Scene = {
        nr: 0, // will be recalculated
        action: '',
        duration_seconds: 4,
        camera: 'frontal_selfie',
        tip: '',
        text_overlay: null,
      };
      const newScenes = [...concept.scenes];
      newScenes.splice(afterIndex + 1, 0, newScene);
      onConceptChange({ ...concept, scenes: newScenes });
      // Select the new scene
      setSelectedSceneIndex(afterIndex + 1);
    },
    [concept, onConceptChange]
  );

  const handleSceneDelete = useCallback(
    (index: number) => {
      if (!onConceptChange || concept.scenes.length <= 1) return;
      const newScenes = concept.scenes.filter((_, i) => i !== index);
      onConceptChange({ ...concept, scenes: newScenes });
      // Adjust selection
      if (selectedSceneIndex === index) {
        setSelectedSceneIndex(null);
      } else if (selectedSceneIndex !== null && selectedSceneIndex > index) {
        setSelectedSceneIndex(selectedSceneIndex - 1);
      }
    },
    [concept, onConceptChange, selectedSceneIndex]
  );

  const dimTransition = { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Meta bar above scenes */}
      <StudioMetaBar
        concept={concept}
        onConceptChange={onConceptChange}
        previewActive={previewActive}
        onPreviewToggle={() => {
          const next = !previewActive;
          setPreviewActive(next);
          onPreviewActiveChange?.(next);
        }}
      />

      <div className="flex-1 flex flex-col xl:flex-row min-h-0 gap-2">
        {/* Column 1: Das Drehbuch */}
        <motion.div
          data-tour="studio-script-panel"
          animate={{ opacity: previewActive ? 0.3 : 1 }}
          transition={dimTransition}
          className="xl:w-[28%] flex-shrink-0 px-5 py-3 min-h-0 max-h-[40vh] xl:max-h-none overflow-hidden"
          style={{ pointerEvents: previewActive ? 'none' : 'auto' }}
        >
          <StudioScript concept={concept} onConceptChange={onConceptChange} />
        </motion.div>

        {/* Column 2: Die Stage */}
        <div data-tour="studio-scene-list" className="xl:w-[47%] flex-shrink-0 py-3 min-h-0 flex-1 xl:flex-initial">
          <AnimatePresence mode="wait">
            {previewActive ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={dimTransition}
                className="h-full"
              >
                <StudioPreview
                  concept={concept}
                  onClose={() => {
                    setPreviewActive(false);
                    onPreviewActiveChange?.(false);
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="scenes"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={dimTransition}
                className="h-full"
              >
                <StudioSceneList
                  scenes={concept.scenes}
                  selectedSceneIndex={selectedSceneIndex}
                  sceneVideos={sceneVideos}
                  needsFace={concept.needs_face}
                  onSelectScene={setSelectedSceneIndex}
                  onSceneChange={handleSceneChange}
                  onScenesReorder={handleScenesReorder}
                  onSceneAdd={handleSceneAdd}
                  onSceneDelete={handleSceneDelete}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Column 3: KI-Inspektor */}
        <motion.div
          data-tour="studio-inspector-panel"
          animate={{ opacity: previewActive ? 0.3 : 1 }}
          transition={dimTransition}
          className="xl:w-1/4 flex-shrink-0 px-5 py-3 min-h-0"
          style={{ pointerEvents: previewActive ? 'none' : 'auto' }}
        >
          <StudioInspector
            scene={selectedScene}
            sceneIndex={selectedSceneIndex}
            concept={concept}
            reelConceptId={reelConceptId}
            sceneVideo={selectedScene ? sceneVideos[selectedScene.nr] || null : null}
            onVideoGenerated={onVideoGenerated}
            onSceneChange={handleSceneChange}
            onConceptChange={onConceptChange}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default StudioStoryboard;
