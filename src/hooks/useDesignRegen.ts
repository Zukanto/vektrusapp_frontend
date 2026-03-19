import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';

type RegenState = 'idle' | 'loading' | 'polling' | 'success' | 'error' | 'no_brand';

interface UseDesignRegenResult {
  state: RegenState;
  message: string | null;
  newImageUrl: string | null;
  trigger: () => void;
  reset: () => void;
}

export function useDesignRegen(
  postId: string,
  onSuccess: (newDesignUrl: string) => void
): UseDesignRegenResult {
  const [state, setState] = useState<RegenState>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const startPolling = useCallback(() => {
    stopPolling();

    timeoutRef.current = setTimeout(() => {
      stopPolling();
      setState('error');
      setMessage('Design konnte nicht erstellt werden. Erneut versuchen?');
    }, 90_000);

    intervalRef.current = setInterval(async () => {
      const { data, error } = await supabase
        .from('pulse_generated_content')
        .select('content')
        .eq('id', postId)
        .maybeSingle();

      if (error || !data) return;

      const content = data.content as Record<string, any>;
      const designStatus: string = content?.design_status ?? '';
      const designImageUrl: string = content?.design_image_url ?? '';

      if (designStatus === 'success' && designImageUrl) {
        stopPolling();
        setNewImageUrl(designImageUrl);
        setState('success');
        setMessage('Design erfolgreich erstellt');
        onSuccess(designImageUrl);
        setTimeout(() => {
          setState('idle');
          setMessage(null);
        }, 3000);
      } else if (designStatus.startsWith('failed_')) {
        stopPolling();
        setState('error');
        setMessage('Design konnte nicht erstellt werden. Erneut versuchen?');
      }
    }, 3_000);
  }, [postId, stopPolling, onSuccess]);

  const trigger = useCallback(async () => {
    setState('loading');
    setMessage(null);

    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;

    if (!session) {
      setState('error');
      setMessage('Keine aktive Sitzung gefunden.');
      return;
    }

    try {
      const response = await fetch('https://n8n.vektrus.ai/webhook/vektrus-design-regen', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content_record_id: postId,
          user_id: session.user.id,
        }),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (body?.code === 'NO_BRAND_PROFILE') {
          setState('no_brand');
          setMessage('Richte zuerst dein Brand Studio ein, um Designs zu generieren.');
        } else {
          setState('error');
          setMessage('Design konnte nicht erstellt werden. Erneut versuchen?');
        }
        return;
      }

      setState('polling');
      startPolling();
    } catch {
      setState('error');
      setMessage('Design konnte nicht erstellt werden. Erneut versuchen?');
    }
  }, [postId, startPolling]);

  const reset = useCallback(() => {
    stopPolling();
    setState('idle');
    setMessage(null);
    setNewImageUrl(null);
  }, [stopPolling]);

  return { state, message, newImageUrl, trigger, reset };
}
