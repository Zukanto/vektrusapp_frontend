import React from 'react';
import type { ReelScene } from '../../services/reelService';
import type { SceneVideoMap } from '../../hooks/useSceneVideos';
import StudioSceneCard from './StudioSceneCard';

interface StudioSceneListProps {
  scenes: ReelScene[];
  selectedSceneIndex: number | null;
  sceneVideos: SceneVideoMap;
  onSelectScene: (index: number) => void;
}

const StudioSceneList: React.FC<StudioSceneListProps> = ({
  scenes,
  selectedSceneIndex,
  sceneVideos,
  onSelectScene,
}) => {
  return (
    <div className="h-full overflow-y-auto px-2 studio-scrollbar">
      <div className="pb-6 pt-1">
        {scenes.map((scene, index) => (
          <StudioSceneCard
            key={scene.nr}
            scene={scene}
            isSelected={selectedSceneIndex === index}
            isLast={index === scenes.length - 1}
            sceneVideo={sceneVideos[scene.nr] || null}
            onClick={() => onSelectScene(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default StudioSceneList;
