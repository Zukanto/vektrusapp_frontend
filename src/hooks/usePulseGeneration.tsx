import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { ContentGeneratorService, WebhookResponse } from '../services/contentGenerator';
import { parseContent } from '../lib/contentParser';
import { supabase } from '../lib/supabase';
import { PulseToastData } from '../components/planner/wizard/PulseCompletionToast';

export interface GeneratedPost {
  id: string;
  platform: string;
  title: string;
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
  scheduledTime: string;
  scheduledDate: Date;
  imageUrl?: string;
  designImageUrl?: string;
  applyCI?: boolean;
  contentScore?: { total: number; readability: number; hookStrength: number; hashtagQuality: number; ctaClarity: number; platformFit: number };
}

export type PulseStatus = 'idle' | 'starting' | 'generating' | 'completed' | 'partial' | 'failed' | 'timeout';

export interface PulseProgress {
  current: number;
  total: number;
  status: PulseStatus;
  designProgress?: string;
}

interface PulseGenerationState {
  isGenerating: boolean;
  pulseId: string | null;
  progress: PulseProgress;
  generatedPosts: GeneratedPost[];
  webhookResponse: WebhookResponse | null;
  error: string | null;
  popupOpen: boolean;
}

interface PulseGenerationContextType extends PulseGenerationState {
  startGeneration: (wizardData: any) => Promise<void>;
  dismissPopup: () => void;
  reopenPopup: (mode?: 'theme' | 'visual') => void;
  reset: () => void;
  toastData: PulseToastData | null;
  dismissToast: () => void;
  initialMode: 'theme' | 'visual' | null;
  clearInitialMode: () => void;
}

const initialProgress: PulseProgress = { current: 0, total: 0, status: 'idle' };

const PulseGenerationContext = createContext<PulseGenerationContextType | undefined>(undefined);

export const usePulseGeneration = () => {
  const context = useContext(PulseGenerationContext);
  if (!context) {
    throw new Error('usePulseGeneration must be used within a PulseGenerationProvider');
  }
  return context;
};

function checkPostQuality(posts: any[]): { good: any[]; bad: any[]; } {
  const good: any[] = [];
  const bad: any[] = [];

  for (const post of posts) {
    const content = typeof post.content === 'string'
      ? (() => { try { return JSON.parse(post.content); } catch { return post.content; } })()
      : post.content;

    const isError =
      (typeof content === 'object' && content?.parse_error === true) ||
      (typeof content === 'object' && content?.primary_text === 'Content-Generierung fehlgeschlagen. Bitte erneut versuchen.');

    if (isError) {
      bad.push(post);
    } else {
      good.push(post);
    }
  }

  return { good, bad };
}

function buildPostResponse(posts: any[], result: WebhookResponse): WebhookResponse {
  return {
    ...result,
    processing_complete: true,
    content_plan: posts.map((post: any) => {
      const parsed = parseContent(post.content);
      return {
        post_id: post.id,
        platform: post.platform,
        type: parsed.content_type || 'post',
        content: parsed.primary_text,
        caption: parsed.hook || parsed.primary_text?.substring(0, 50),
        hashtags: parsed.hashtags,
        ready_to_publish: post.status === 'approved',
        image_url: parsed.image_url,
        design_image_url: parsed.design_image_url,
        design_status: parsed.design_status,
        design_status_message: parsed.design_status_message,
        content_format: parsed.content_format,
        carousel_slides: parsed.carousel_slides,
      };
    }),
  };
}

export const PulseGenerationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PulseGenerationState>({
    isGenerating: false,
    pulseId: null,
    progress: initialProgress,
    generatedPosts: [],
    webhookResponse: null,
    error: null,
    popupOpen: false,
  });

  const [toastData, setToastData] = useState<PulseToastData | null>(null);
  const [initialMode, setInitialMode] = useState<'theme' | 'visual' | null>(null);
  const popupOpenRef = useRef(false);
  const wizardDataRef = useRef<any>(null);

  const dismissPopup = useCallback(() => {
    popupOpenRef.current = false;
    setState(prev => ({ ...prev, popupOpen: false }));
  }, []);

  const reopenPopup = useCallback((mode?: 'theme' | 'visual') => {
    popupOpenRef.current = true;
    if (mode) setInitialMode(mode);
    setState(prev => ({ ...prev, popupOpen: true }));
  }, []);

  const clearInitialMode = useCallback(() => {
    setInitialMode(null);
  }, []);

  const dismissToast = useCallback(() => {
    setToastData(null);
  }, []);

  const reset = useCallback(() => {
    popupOpenRef.current = false;
    wizardDataRef.current = null;
    setInitialMode(null);
    setState({
      isGenerating: false,
      pulseId: null,
      progress: initialProgress,
      generatedPosts: [],
      webhookResponse: null,
      error: null,
      popupOpen: false,
    });
  }, []);

  const showToastForStatus = useCallback((
    status: 'completed' | 'partial' | 'failed' | 'timeout',
    goodCount: number,
    totalCount: number,
    badCount: number,
  ) => {
    switch (status) {
      case 'completed':
        setToastData({
          variant: 'success',
          title: 'Dein Pulse Content ist fertig!',
          message: `${goodCount} ${goodCount === 1 ? 'Post wurde' : 'Posts wurden'} erfolgreich erstellt.`,
          actionLabel: 'Zum Kalender',
        });
        break;
      case 'partial':
        setToastData({
          variant: 'partial',
          title: 'Pulse teilweise fertig',
          message: `${goodCount} von ${totalCount} Posts erstellt. ${badCount} ${badCount === 1 ? 'Post konnte' : 'Posts konnten'} nicht generiert werden.`,
          actionLabel: 'Details ansehen',
        });
        break;
      case 'failed':
        setToastData({
          variant: 'error',
          title: 'Content-Generierung fehlgeschlagen',
          message: 'Die Posts konnten nicht erstellt werden.',
          actionLabel: 'Erneut versuchen',
        });
        break;
      case 'timeout':
        setToastData({
          variant: 'timeout',
          title: 'Generierung dauert länger als erwartet',
          message: 'Prüfe den Kalender in ein paar Minuten.',
          actionLabel: 'Zum Kalender',
        });
        break;
    }
  }, []);

  const markPulseStatusInDb = useCallback(async (pulseId: string | null, dbStatus: string) => {
    if (!pulseId) return;
    try {
      await supabase
        .from('pulse_configurations')
        .update({ status: dbStatus })
        .eq('id', pulseId);
    } catch {
      // best-effort
    }
  }, []);

  const handlePollResult = useCallback((
    posts: any[],
    pollStatus: string,
    totalPosts: number,
    result: WebhookResponse,
    wizardData: any,
    pulseId?: string | null,
  ) => {
    if (pollStatus === 'completed' && posts.length > 0) {
      const { good, bad } = checkPostQuality(posts);

      if (good.length === 0) {
        markPulseStatusInDb(pulseId ?? null, 'failed');
        setState(prev => ({
          ...prev,
          isGenerating: false,
          error: 'Alle Posts konnten nicht generiert werden. Bitte versuche es erneut.',
          progress: { current: 0, total: totalPosts, status: 'failed' },
        }));
        showToastForStatus('failed', 0, posts.length, bad.length);
        return;
      }

      const finalResponse = buildPostResponse(good, result);
      const convertedPosts = ContentGeneratorService.convertWebhookResponseToPosts(finalResponse, wizardData);

      if (bad.length > 0) {
        markPulseStatusInDb(pulseId ?? null, 'completed');
        setState(prev => ({
          ...prev,
          isGenerating: false,
          webhookResponse: finalResponse,
          generatedPosts: convertedPosts,
          progress: { current: good.length, total: totalPosts, status: 'partial' },
        }));
        showToastForStatus('partial', good.length, posts.length, bad.length);
      } else {
        markPulseStatusInDb(pulseId ?? null, 'completed');
        setState(prev => ({
          ...prev,
          isGenerating: false,
          webhookResponse: finalResponse,
          generatedPosts: convertedPosts,
          progress: { current: good.length, total: totalPosts, status: 'completed' },
        }));
        showToastForStatus('completed', good.length, totalPosts, 0);
      }
    } else if (pollStatus === 'failed') {
      markPulseStatusInDb(pulseId ?? null, 'failed');
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: 'Content-Generierung fehlgeschlagen. Bitte versuche es erneut.',
        progress: { ...prev.progress, status: 'failed' },
      }));
      showToastForStatus('failed', 0, totalPosts, 0);
    } else if (pollStatus === 'timeout' || pollStatus === 'partial') {
      if (posts.length > 0) {
        const { good, bad } = checkPostQuality(posts);

        if (good.length > 0) {
          markPulseStatusInDb(pulseId ?? null, 'completed');
          const partialResponse = buildPostResponse(good, result);
          const convertedPosts = ContentGeneratorService.convertWebhookResponseToPosts(partialResponse, wizardData);

          setState(prev => ({
            ...prev,
            isGenerating: false,
            webhookResponse: partialResponse,
            generatedPosts: convertedPosts,
            progress: { current: good.length, total: totalPosts, status: 'partial' },
          }));
          showToastForStatus('partial', good.length, totalPosts, bad.length);
        } else {
          markPulseStatusInDb(pulseId ?? null, 'failed');
          setState(prev => ({
            ...prev,
            isGenerating: false,
            error: 'Generierung dauert ungewöhnlich lange.',
            progress: { ...prev.progress, status: 'timeout' },
          }));
          showToastForStatus('timeout', 0, totalPosts, 0);
        }
      } else {
        markPulseStatusInDb(pulseId ?? null, 'failed');
        setState(prev => ({
          ...prev,
          isGenerating: false,
          error: 'Generierung dauert ungewöhnlich lange. Bitte prüfe den Kalender in ein paar Minuten.',
          progress: { ...prev.progress, status: 'timeout' },
        }));
        showToastForStatus('timeout', 0, totalPosts, 0);
      }
    }
  }, [showToastForStatus, markPulseStatusInDb]);

  const startGeneration = useCallback(async (wizardData: any) => {
    popupOpenRef.current = true;
    wizardDataRef.current = wizardData;
    setToastData(null);
    setState(prev => ({
      ...prev,
      isGenerating: true,
      popupOpen: true,
      error: null,
      generatedPosts: [],
      webhookResponse: null,
      progress: { current: 0, total: 0, status: 'starting' },
    }));

    try {
      const result = await ContentGeneratorService.generateContent(wizardData, false);

      if (!result.success || !result.pulse_id) {
        throw new Error(result.error || 'Generierung fehlgeschlagen');
      }

      const totalPosts = result.summary?.total_posts || result.metadata?.total_posts || 0;

      setState(prev => ({
        ...prev,
        pulseId: result.pulse_id!,
        webhookResponse: result,
        progress: { current: 0, total: totalPosts, status: 'generating' },
      }));

      const { posts, status } = await ContentGeneratorService.pollForCompletion(
        result.pulse_id!,
        totalPosts,
        (currentPosts, totalExpected, pulseStatus, designProgress, currentPostsData) => {
          if (currentPostsData && currentPostsData.length > 0) {
            const partialResponse = buildPostResponse(currentPostsData, result);
            const partialConverted = ContentGeneratorService.convertWebhookResponseToPosts(partialResponse, wizardData);
            setState(prev => ({
              ...prev,
              webhookResponse: partialResponse,
              generatedPosts: partialConverted,
              progress: {
                current: currentPosts,
                total: totalExpected,
                status: pulseStatus as PulseStatus,
                designProgress: designProgress || undefined,
              },
            }));
          } else {
            setState(prev => ({
              ...prev,
              progress: {
                current: currentPosts,
                total: totalExpected,
                status: pulseStatus as PulseStatus,
                designProgress: designProgress || undefined,
              },
            }));
          }
        },
        { intervalMs: 4000, maxAttempts: 90 }
      );

      handlePollResult(posts, status, totalPosts, result, wizardData, result.pulse_id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unbekannter Fehler';
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: msg,
        progress: { ...prev.progress, status: 'failed' },
      }));
      showToastForStatus('failed', 0, 0, 0);
    }
  }, [handlePollResult, showToastForStatus]);

  const resumePolling = useCallback(async (pulseId: string, totalPosts: number) => {
    setState(prev => ({
      ...prev,
      isGenerating: true,
      pulseId,
      popupOpen: false,
      error: null,
      progress: { current: 0, total: totalPosts, status: 'generating' },
    }));

    try {
      const { posts, status } = await ContentGeneratorService.pollForCompletion(
        pulseId,
        totalPosts,
        (currentPosts, totalExpected, pulseStatus, designProgress) => {
          setState(prev => ({
            ...prev,
            progress: {
              current: currentPosts,
              total: totalExpected,
              status: pulseStatus as PulseStatus,
              designProgress: designProgress || undefined,
            },
          }));
        },
        { intervalMs: 4000, maxAttempts: 90 }
      );

      const dummyResult: WebhookResponse = {
        success: true,
        pulse_id: pulseId,
        processing_complete: true,
        content_plan: [],
      };

      const dummyWizardData = wizardDataRef.current || {
        platforms: ['instagram'],
        frequency: 3,
        timeframe: { startDate: new Date(), endDate: new Date() },
      };

      handlePollResult(posts, status, totalPosts, dummyResult, dummyWizardData, pulseId);
    } catch (err) {
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: 'Polling fehlgeschlagen.',
        progress: { ...prev.progress, status: 'failed' },
      }));
      showToastForStatus('failed', 0, totalPosts, 0);
    }
  }, [handlePollResult, showToastForStatus]);

  const resumePollingRef = useRef(resumePolling);
  useEffect(() => {
    resumePollingRef.current = resumePolling;
  }, [resumePolling]);

  useEffect(() => {
    const checkPendingPulse = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

        await supabase
          .from('pulse_configurations')
          .update({ status: 'failed' })
          .eq('status', 'processing')
          .eq('user_id', session.user.id)
          .lt('created_at', fifteenMinAgo)
          .gte('created_at', twoHoursAgo);

        const { data: pending } = await supabase
          .from('pulse_configurations')
          .select('id, status, configuration, created_at')
          .eq('status', 'processing')
          .eq('user_id', session.user.id)
          .gte('created_at', fifteenMinAgo)
          .order('created_at', { ascending: false })
          .limit(1);

        if (pending && pending.length > 0) {
          const pendingPulse = pending[0];
          const config = typeof pendingPulse.configuration === 'string'
            ? JSON.parse(pendingPulse.configuration)
            : pendingPulse.configuration;

          const platforms = (config?.platforms || []).filter((p: any) => p.enabled);
          const postsPerWeek = config?.posting_frequency?.posts_per_week || 3;
          const start = config?.schedule?.start_date ? new Date(config.schedule.start_date) : new Date();
          const end = config?.schedule?.end_date ? new Date(config.schedule.end_date) : new Date();
          const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
          const weeks = Math.max(1, Math.ceil(days / 7));
          const totalPosts = postsPerWeek * weeks * Math.max(1, platforms.length);

          resumePollingRef.current(pendingPulse.id, totalPosts);
        }
      } catch {
        // silently fail
      }
    };

    checkPendingPulse();
  }, []);

  return (
    <PulseGenerationContext.Provider
      value={{
        ...state,
        startGeneration,
        dismissPopup,
        reopenPopup,
        reset,
        toastData,
        dismissToast,
        initialMode,
        clearInitialMode,
      }}
    >
      {children}
    </PulseGenerationContext.Provider>
  );
};
