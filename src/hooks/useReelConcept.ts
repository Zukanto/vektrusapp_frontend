import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { ReelContent } from '../services/reelService';

interface ReelConceptRecord {
  id: string;
  content: ReelContent;
  created_at: string;
}

interface UseReelConceptResult {
  record: ReelConceptRecord | null;
  loading: boolean;
  error: string | null;
}

/**
 * Loads a single reel concept from pulse_generated_content by ID.
 * Extracts the JSONB `content` field and validates it contains a reel.
 */
export function useReelConcept(reelId: string | undefined): UseReelConceptResult {
  const [record, setRecord] = useState<ReelConceptRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!reelId) {
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('pulse_generated_content')
      .select('id, content, created_at')
      .eq('id', reelId)
      .single();

    if (fetchError || !data) {
      setError('Dieses Reel-Konzept wurde nicht gefunden.');
      setRecord(null);
    } else if (!data.content || (data.content as any).type !== 'reel') {
      setError('Ungültiges Reel-Konzept.');
      setRecord(null);
    } else {
      setRecord({
        id: data.id,
        content: data.content as ReelContent,
        created_at: data.created_at,
      });
    }

    setLoading(false);
  }, [reelId]);

  useEffect(() => {
    load();
  }, [load]);

  return { record, loading, error };
}
