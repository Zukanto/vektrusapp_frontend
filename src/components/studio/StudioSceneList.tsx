import React, { useCallback } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import type { Scene } from '../../types/reelConcept';
import type { SceneVideoMap } from '../../hooks/useSceneVideos';
import StudioSceneCard from './StudioSceneCard';

interface StudioSceneListProps {
  scenes: Scene[];
  selectedSceneIndex: number | null;
  sceneVideos: SceneVideoMap;
  needsFace: boolean;
  onSelectScene: (index: number) => void;
  onSceneChange: (index: number, scene: Scene) => void;
  onScenesReorder: (scenes: Scene[]) => void;
  onSceneAdd: (afterIndex: number) => void;
  onSceneDelete: (index: number) => void;
}

const StudioSceneList: React.FC<StudioSceneListProps> = ({
  scenes,
  selectedSceneIndex,
  sceneVideos,
  needsFace,
  onSelectScene,
  onSceneChange,
  onScenesReorder,
  onSceneAdd,
  onSceneDelete,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = scenes.findIndex((s) => s.nr === active.id);
      const newIndex = scenes.findIndex((s) => s.nr === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(scenes, oldIndex, newIndex).map((s, i) => ({
        ...s,
        nr: i + 1,
      }));
      onScenesReorder(reordered);
    },
    [scenes, onScenesReorder]
  );

  return (
    <div className="h-full overflow-y-auto px-2 studio-scrollbar">
      <div className="pb-24 pt-1">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={scenes.map((s) => s.nr)}
            strategy={verticalListSortingStrategy}
          >
            {scenes.map((scene, index) => (
              <React.Fragment key={scene.nr}>
                <StudioSceneCard
                  scene={scene}
                  isSelected={selectedSceneIndex === index}
                  isLast={index === scenes.length - 1}
                  isOnly={scenes.length <= 1}
                  needsFace={needsFace}
                  sceneVideo={sceneVideos[scene.nr] || null}
                  onClick={() => onSelectScene(index)}
                  onChange={(s) => onSceneChange(index, s)}
                  onDelete={() => onSceneDelete(index)}
                />

                {/* Add-between button — outside sortable item */}
                <div className="relative flex gap-5">
                  <div className="flex flex-col items-center flex-shrink-0 w-10" />
                  <div className="flex-1 flex justify-center -mt-3 mb-1">
                    <button
                      onClick={() => onSceneAdd(index)}
                      className="group/add w-7 h-7 rounded-full flex items-center justify-center bg-transparent border border-dashed border-[#FAFAFA]/10 hover:border-[#49B7E3]/40 hover:bg-[#49B7E3]/5 transition-all cursor-pointer opacity-0 hover:opacity-100 focus:opacity-100"
                      title="Szene hinzufügen"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#FAFAFA]/20 group-hover/add:text-[#49B7E3]" />
                    </button>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </SortableContext>
        </DndContext>

        {/* Prominent add button at end */}
        <div className="flex gap-5 mt-2">
          <div className="flex-shrink-0 w-10" />
          <button
            onClick={() => onSceneAdd(scenes.length - 1)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-[#FAFAFA]/12 bg-[#FAFAFA]/[0.03] hover:border-[#49B7E3]/30 hover:bg-[#49B7E3]/5 transition-all cursor-pointer text-[#FAFAFA]/30 hover:text-[#49B7E3] group"
          >
            <Plus className="w-4 h-4" />
            <span className="text-[13px] font-medium">Szene hinzufügen</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudioSceneList;
