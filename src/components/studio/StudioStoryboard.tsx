import React, { useState } from 'react';
import type { ReelContent } from '../../services/reelService';
import StudioScript from './StudioScript';
import StudioSceneList from './StudioSceneList';
import StudioInspector from './StudioInspector';

interface StudioStoryboardProps {
  concept: ReelContent;
  onGenerateBRoll?: (description: string, duration: number) => void;
}

const StudioStoryboard: React.FC<StudioStoryboardProps> = ({ concept, onGenerateBRoll }) => {
  const [selectedSceneIndex, setSelectedSceneIndex] = useState<number | null>(null);

  const selectedScene =
    selectedSceneIndex !== null ? concept.scenes[selectedSceneIndex] ?? null : null;

  return (
    <div className="flex-1 flex flex-col xl:flex-row min-h-0 gap-2">
      {/* Column 1: Das Drehbuch */}
      <div className="xl:w-[28%] flex-shrink-0 px-5 py-3 min-h-0 max-h-[40vh] xl:max-h-none overflow-hidden">
        <StudioScript concept={concept} />
      </div>

      {/* Column 2: Die Stage */}
      <div className="xl:w-[47%] flex-shrink-0 py-3 min-h-0 flex-1 xl:flex-initial">
        <StudioSceneList
          scenes={concept.scenes}
          selectedSceneIndex={selectedSceneIndex}
          onSelectScene={setSelectedSceneIndex}
        />
      </div>

      {/* Column 3: KI-Inspektor */}
      <div className="xl:w-1/4 flex-shrink-0 px-5 py-3 min-h-0">
        <StudioInspector scene={selectedScene} concept={concept} onGenerateBRoll={onGenerateBRoll} />
      </div>
    </div>
  );
};

export default StudioStoryboard;
