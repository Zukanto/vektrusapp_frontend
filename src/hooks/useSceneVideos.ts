import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface SceneVideo {
  id: string;
  video_url: string | null;
  status: string;
}

export type SceneVideoMap = Record<number, SceneVideo>;

/**
 * Loads all vision_projects assigned to scenes of a given reel concept.
 * Returns a map keyed by scene_nr (latest video per scene).
 * Polls every 4s while any video is in "generating"/"queued" status.
 */
export function useSceneVideos(reelConceptId: string | undefined): {
  sceneVideos: SceneVideoMap;
  refetch: () => void;
} {
  const [sceneVideos, setSceneVideos] = useState<SceneVideoMap>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchVideos = useCallback(async () => {
    if (!reelConceptId) {
      setSceneVideos({});
      return;
    }

    const { data } = await supabase
      .from('vision_projects')
      .select('id, scene_nr, video_url, status, created_at')
      .eq('reel_concept_id', reelConceptId)
      .not('scene_nr', 'is', null)
      .order('created_at', { ascending: false });

    if (!data) return;

    // Build map: newest video per scene_nr
    const map: SceneVideoMap = {};
    for (const row of data as any[]) {
      const nr = row.scene_nr as number;
      if (!map[nr]) {
        map[nr] = {
          id: row.id,
          video_url: row.video_url,
          status: row.status,
        };
      }
    }
    setSceneVideos(map);
  }, [reelConceptId]);

  // Initial fetch
  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // Polling: run every 4s while any video is generating/queued
  useEffect(() => {
    const hasGenerating = Object.values(sceneVideos).some(
      (v) => v.status === 'generating' || v.status === 'queued'
    );

    if (hasGenerating) {
      if (!intervalRef.current) {
        intervalRef.current = setInterval(fetchVideos, 4000);
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [sceneVideos, fetchVideos]);

  return { sceneVideos, refetch: fetchVideos };
}
