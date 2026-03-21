import React, { useState, useEffect } from 'react';
import { Zap, PenLine, Image, ArrowRight, Calendar, Check, Clock, CircleAlert as AlertCircle, Loader as Loader2, Eye, FileText, X, FlaskConical } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePulseGeneration } from '../../hooks/usePulseGeneration';
import { supabase } from '../../lib/supabase';
import { useModuleColors } from '../../hooks/useModuleColors';
import ModuleWrapper from '../ui/ModuleWrapper';
import { PulseWaitHint } from '../ui/BetaHint';
import { parseContent } from '../../lib/contentParser';
import ReviewModal from '../planner/wizard/ReviewModal';
import { GeneratedPost } from '../planner/wizard/types';
import { ContentSlot } from '../planner/types';
import { CalendarService } from '../../services/calendarService';

interface PulsePageProps {
  onModuleChange?: (module: string) => void;
}

interface PulseRun {
  id: string;
  status: string;
  created_at: string;
  updated_at?: string;
  completed_at: string | null;
  configuration: {
    topic?: string;
    topic_description?: string;
    description?: string;
    mode?: string;
    platforms?: Array<{ id: string; enabled: boolean }>;
    posting_frequency?: { posts_per_week: number };
    schedule?: { start_date: string; end_date: string };
  };
  postCount?: number;
  platformNames?: string[];
}

const PLATFORM_CONFIG: Record<string, { label: string; color: string }> = {
  instagram: { label: 'Instagram', color: '#E4405F' },
  linkedin: { label: 'LinkedIn', color: '#0A66C2' },
  tiktok: { label: 'TikTok', color: '#111111' },
  facebook: { label: 'Facebook', color: '#1877F2' },
  twitter: { label: 'Twitter', color: '#1DA1F2' },
};

function mapDbRowToGeneratedPost(row: any): GeneratedPost {
  const parsed = parseContent(row.content);

  const scheduledDate = row.scheduled_date
    ? new Date(row.scheduled_date)
    : new Date();

  const scheduledTime = row.scheduled_time || CalendarService.formatScheduledTime(row.scheduled_date || new Date().toISOString());

  return {
    id: row.id,
    platform: row.platform || '',
    title: parsed.hook?.substring(0, 60) || parsed.primary_text?.substring(0, 60) || 'Post',
    hook: parsed.hook || '',
    body: parsed.primary_text || '',
    cta: parsed.cta || '',
    hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
    scheduledTime,
    scheduledDate,
    imageUrl: parsed.image_url,
    designImageUrl: parsed.design_image_url,
    applyCI: !!parsed.design_image_url,
    designStatus: (parsed.design_status as any) || undefined,
    designStatusMessage: parsed.design_status_message,
    contentScore: undefined,
    contentFormat: (parsed.content_format as any) || 'single_image',
    carouselSlides: Array.isArray(parsed.carousel_slides) ? parsed.carousel_slides : undefined,
  };
}

const PulsePage: React.FC<PulsePageProps> = ({ onModuleChange }) => {
  const pulse = usePulseGeneration();
  const colors = useModuleColors('pulse');
  const [history, setHistory] = useState<PulseRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [reviewPosts, setReviewPosts] = useState<GeneratedPost[]>([]);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewLoading, setReviewLoading] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const STALE_THRESHOLD_MS = 2 * 60 * 60 * 1000;
  const RUNNING_STATUSES = ['processing', 'generating', 'starting', 'pending'];

  const loadHistory = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsLoading(false);
        return;
      }

      const { data: configs } = await supabase
        .from('pulse_configurations')
        .select('id, configuration, status, created_at, updated_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!configs || configs.length === 0) {
        setHistory([]);
        setIsLoading(false);
        return;
      }

      const now = Date.now();
      const staleIds: string[] = [];

      for (const config of configs) {
        if (RUNNING_STATUSES.includes(config.status)) {
          const createdAt = new Date(config.created_at).getTime();
          if (now - createdAt > STALE_THRESHOLD_MS) {
            staleIds.push(config.id);
          }
        }
      }

      if (staleIds.length > 0) {
        await supabase
          .from('pulse_configurations')
          .update({ status: 'failed' })
          .in('id', staleIds);
      }

      const enriched: PulseRun[] = [];
      for (const config of configs) {
        const { count } = await supabase
          .from('pulse_generated_content')
          .select('*', { count: 'exact', head: true })
          .eq('pulse_config_id', config.id);

        const cfg = typeof config.configuration === 'string'
          ? JSON.parse(config.configuration)
          : config.configuration;

        const enabledPlatforms = (cfg?.platforms || [])
          .filter((p: any) => p.enabled)
          .map((p: any) => p.id);

        const resolvedStatus = staleIds.includes(config.id) ? 'failed' : config.status;

        enriched.push({
          ...config,
          status: resolvedStatus,
          configuration: cfg,
          postCount: count || 0,
          platformNames: enabledPlatforms,
        });
      }

      setHistory(enriched);
    } catch (err) {
      console.error('Failed to load pulse history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRun = async (runId: string) => {
    setHistory(prev => prev.filter(r => r.id !== runId));
    try {
      await supabase.from('pulse_generated_content').delete().eq('pulse_config_id', runId);
      await supabase.from('pulse_configurations').delete().eq('id', runId);
    } catch (err) {
      console.error('Failed to delete pulse run:', err);
      loadHistory();
    }
  };

  const handleStartPulse = (mode: 'theme' | 'visual') => {
    pulse.reset();
    pulse.reopenPopup(mode);
  };

  const handleOpenReview = async (run: PulseRun) => {
    setReviewLoading(run.id);
    try {
      let data: any[] | null = null;

      const { data: byConfigId, error: e1 } = await supabase
        .from('pulse_generated_content')
        .select('*')
        .eq('pulse_config_id', run.id)
        .order('scheduled_date');

      if (!e1 && byConfigId && byConfigId.length > 0) {
        data = byConfigId;
      } else {
        const startDate = run.configuration?.schedule?.start_date;
        const endDate = run.configuration?.schedule?.end_date;

        if (startDate && endDate) {
          const rangeStart = new Date(startDate);
          rangeStart.setDate(rangeStart.getDate() - 1);
          const rangeEnd = new Date(endDate);
          rangeEnd.setDate(rangeEnd.getDate() + 1);

          const { data: byDate } = await supabase
            .from('pulse_generated_content')
            .select('*')
            .gte('scheduled_date', rangeStart.toISOString())
            .lte('scheduled_date', rangeEnd.toISOString())
            .order('scheduled_date');

          if (byDate && byDate.length > 0) {
            data = byDate;
          }
        }
      }

      if (!data || data.length === 0) {
        const startDate = run.configuration?.schedule?.start_date;
        if (startDate) sessionStorage.setItem('planner-target-date', startDate);
        onModuleChange?.('planner');
        return;
      }

      const posts = data.map(mapDbRowToGeneratedPost);
      setReviewPosts(posts);
      setReviewOpen(true);
    } catch (err) {
      console.error('Failed to load posts for review:', err);
    } finally {
      setReviewLoading(null);
    }
  };

  const handleReviewConfirm = (_confirmedPosts: ContentSlot[]) => {
    setReviewOpen(false);
    setReviewPosts([]);
    onModuleChange?.('planner');
  };

  const handleReviewClose = () => {
    setReviewOpen(false);
    setReviewPosts([]);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return { label: 'Abgeschlossen', icon: <Check className="w-3 h-3" />, bg: '#49D69E', textColor: '#FFFFFF' };
      case 'processing':
      case 'generating':
      case 'starting':
        return { label: 'Läuft...', icon: <Loader2 className="w-3 h-3 animate-spin" />, bg: '#49B7E3', textColor: '#FFFFFF' };
      case 'failed':
      case 'timeout':
        return { label: 'Fehlgeschlagen', icon: <AlertCircle className="w-3 h-3" />, bg: '#FA7E70', textColor: '#FFFFFF' };
      case 'pending':
        return { label: 'Ausstehend', icon: <Clock className="w-3 h-3" />, bg: '#F4BE9D', textColor: '#111111' };
      default:
        return { label: status, icon: <Clock className="w-3 h-3" />, bg: '#E5E7EB', textColor: '#6B7280' };
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const getModeLabel = (mode?: string) => {
    if (mode === 'visual') return 'Visual';
    return 'Themen-basiert';
  };

  const modes = [
    {
      id: 'theme',
      icon: PenLine,
      title: 'Themen-basiert',
      description: 'Beschreibe dein Thema und Vektrus erstellt passende Posts für deine Plattformen.',
    },
    {
      id: 'visual',
      icon: Image,
      title: 'Bilder zu Posts',
      description: 'Lade Bilder hoch und Vektrus schreibt den perfekten Post-Text, Hashtags und CTAs dazu.',
    },
  ];

  return (
    <ModuleWrapper module="pulse" showTopAccent={true}>
      <div className="h-full flex flex-col bg-[#F4FCFE]">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1000px] mx-auto px-6 py-10">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-2 relative">
                <div
                  className="w-10 h-10 rounded-[var(--vektrus-radius-sm)] flex items-center justify-center pulse-gradient-icon"
                >
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-[#111111] font-manrope relative">
                  Vektrus Pulse
                  {/* Subtle AI hero glow behind heading */}
                  <span className="ai-hero-glow -z-10" style={{ top: '-10px', left: '-20px' }} />
                </h1>
              </div>
              <p className="text-[#7A7A7A] mb-10 ml-[52px]">
                Dein AI Content Generator
              </p>
            </motion.div>

            <PulseWaitHint
              status={
                pulse.isGenerating
                  ? 'processing'
                  : pulse.progress.status === 'completed' || pulse.progress.status === 'partial'
                    ? 'completed'
                    : 'idle'
              }
              onViewResults={() => onModuleChange?.('planner')}
              className="mb-6"
            />

            <div
              className="flex items-start gap-3 px-4 py-3.5 rounded-[var(--vektrus-radius-md)] mb-8 border"
              style={{
                backgroundColor: 'rgba(244, 190, 157, 0.10)',
                borderColor: 'rgba(244, 190, 157, 0.45)',
              }}
            >
              <div
                className="w-7 h-7 rounded-[var(--vektrus-radius-sm)] flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: 'rgba(244, 190, 157, 0.25)' }}
              >
                <FlaskConical className="w-3.5 h-3.5" style={{ color: '#D4864A' }} />
              </div>
              <div>
                <p className="text-[13px] font-semibold mb-0.5" style={{ color: '#D4864A' }}>
                  Pulse befindet sich in der Beta-Phase
                </p>
                <p className="text-[12px] leading-relaxed" style={{ color: '#7A7A7A' }}>
                  Bei der Generierung kann es vereinzelt zu Fehlern oder Qualitätsunterschieden bei Bildern kommen.
                  Wir testen parallel neue Bildmodelle und arbeiten aktiv an der Verbesserung.
                </p>
              </div>
            </div>

            {/* Card grid with ambient gradient blobs behind for glass effect */}
            <div className="relative mb-12">
              {/* Ambient blobs — these sit BEHIND the cards so backdrop-filter has something to blur */}
              <div className="absolute inset-0 -inset-x-8 -inset-y-4 pointer-events-none overflow-hidden rounded-[var(--vektrus-radius-xl)]" aria-hidden="true">
                <div
                  className="absolute rounded-full"
                  style={{
                    width: '320px', height: '320px',
                    top: '-40px', left: '-30px',
                    background: 'rgba(73, 183, 227, 0.12)',
                    filter: 'blur(50px)',
                    animation: 'ai-blob-drift-1 8s ease-in-out infinite',
                  }}
                />
                <div
                  className="absolute rounded-full"
                  style={{
                    width: '280px', height: '280px',
                    bottom: '-50px', right: '-20px',
                    background: 'rgba(124, 108, 242, 0.10)',
                    filter: 'blur(45px)',
                    animation: 'ai-blob-drift-2 7s ease-in-out infinite',
                  }}
                />
                <div
                  className="absolute rounded-full"
                  style={{
                    width: '200px', height: '200px',
                    top: '50%', left: '45%',
                    background: 'rgba(232, 160, 214, 0.08)',
                    filter: 'blur(40px)',
                    animation: 'ai-blob-drift-3 6.5s ease-in-out infinite',
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
                {modes.map((mode, i) => {
                  const Icon = mode.icon;
                  return (
                    <motion.button
                      key={mode.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.1, duration: 0.4 }}
                      onClick={() => handleStartPulse(mode.id as 'theme' | 'visual')}
                      className="group relative p-7 rounded-[var(--vektrus-radius-md)] glass-ai-layer border-gradient-ai text-left transition-all duration-300 hover:shadow-elevated hover:scale-[1.01]"
                    >
                      <div
                        className="w-14 h-14 rounded-[var(--vektrus-radius-lg)] flex items-center justify-center mb-5 pulse-gradient-icon"
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </div>

                      <h3 className="text-lg font-bold text-[#111111] mb-2">
                        {mode.title}
                      </h3>
                      <p className="text-sm text-[#7A7A7A] leading-relaxed mb-6">
                        {mode.description}
                      </p>

                      <div
                        className="flex items-center gap-2 text-sm font-semibold transition-colors"
                        style={{ color: 'var(--vektrus-ai-violet)' }}
                      >
                        <span>Starten</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <h2 className="text-lg font-bold text-[#111111] mb-4 font-manrope">
                Letzte Generierungen
              </h2>

              {isLoading ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="rounded-[var(--vektrus-radius-md)] bg-white p-4 shadow-card"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="h-3.5 w-24 bg-[#B6EBF7]/20 rounded-full animate-pulse" />
                            <div className="h-3.5 w-16 bg-[#B6EBF7]/20 rounded-full animate-pulse" />
                            <div className="h-3.5 w-20 bg-[#B6EBF7]/20 rounded-full animate-pulse" />
                          </div>
                          <div className="h-4 w-48 bg-[#B6EBF7]/20 rounded-full animate-pulse" />
                        </div>
                        <div className="h-6 w-24 bg-[#B6EBF7]/20 rounded-[var(--vektrus-radius-sm)] animate-pulse ml-4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : history.length === 0 ? (
                <div
                  className="rounded-[var(--vektrus-radius-md)] bg-white p-10 text-center shadow-card"
                >
                  <div
                    className="w-12 h-12 rounded-[var(--vektrus-radius-md)] flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: 'rgba(124, 108, 242, 0.08)' }}
                  >
                    <Zap className="w-5 h-5" style={{ color: 'var(--vektrus-ai-violet)' }} />
                  </div>
                  <p className="text-[15px] font-semibold text-[#111111] mb-1.5">
                    Noch keine Generierungen
                  </p>
                  <p className="text-sm text-[#7A7A7A] leading-relaxed mb-5 max-w-xs mx-auto">
                    Starte deinen ersten Pulse-Run und lass Vektrus deine Social-Media-Woche planen.
                  </p>
                  <button
                    onClick={() => handleStartPulse('theme')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--vektrus-radius-sm)] text-sm font-semibold transition-all duration-200"
                    style={{
                      border: '1px solid var(--vektrus-ai-violet)',
                      color: 'var(--vektrus-ai-violet)',
                      backgroundColor: 'white',
                    }}
                  >
                    <Zap className="w-4 h-4" />
                    Ersten Pulse starten
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((run, i) => {
                    const statusCfg = getStatusConfig(run.status);
                    const topic = run.configuration?.topic || run.configuration?.topic_description || run.configuration?.description || 'Pulse-Run';
                    const modeLabel = getModeLabel(run.configuration?.mode);
                    const isClickable = run.status === 'completed';
                    const isLoadingThis = reviewLoading === run.id;

                    return (
                      <motion.div
                        key={run.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ delay: 0.05 * i, duration: 0.3 }}
                        onClick={isClickable ? () => handleOpenReview(run) : undefined}
                        className={[
                          'rounded-[var(--vektrus-radius-md)] bg-white p-4 transition-all relative group shadow-card border border-transparent',
                          isClickable
                            ? 'cursor-pointer hover:shadow-elevated hover:border-[#49B7E3]/25 hover:-translate-y-px'
                            : '',
                        ].join(' ')}
                      >
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteRun(run.id); }}
                          className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-[#AEAEAE] hover:text-[#FA7E70] hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-150 z-10"
                          title="Eintrag entfernen"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <div className="flex items-center gap-1.5 text-xs text-[#7A7A7A]">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{formatDate(run.created_at)}</span>
                              </div>

                              {run.postCount !== undefined && run.postCount > 0 && (
                                <span className="text-xs text-[#7A7A7A] font-medium">
                                  {run.postCount} {run.postCount === 1 ? 'Post' : 'Posts'}
                                </span>
                              )}

                              <span className="inline-flex items-center gap-1 text-xs text-[#7A7A7A] bg-[#F4FCFE] px-2 py-0.5 rounded-full">
                                {run.configuration?.mode === 'visual' ? (
                                  <Image className="w-3 h-3" />
                                ) : (
                                  <PenLine className="w-3 h-3" />
                                )}
                                {modeLabel}
                              </span>
                            </div>

                            <p className="text-sm font-medium text-[#111111] truncate mb-2">
                              {topic}
                            </p>

                            {run.platformNames && run.platformNames.length > 0 && (
                              <div className="flex items-center gap-1.5">
                                {run.platformNames.map((pid) => {
                                  const pCfg = PLATFORM_CONFIG[pid];
                                  if (!pCfg) return null;
                                  return (
                                    <span
                                      key={pid}
                                      className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                                      style={{ backgroundColor: pCfg.color }}
                                    >
                                      {pCfg.label}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                              style={{ backgroundColor: statusCfg.bg, color: statusCfg.textColor }}
                            >
                              {statusCfg.icon}
                              {statusCfg.label}
                            </span>

                            {isClickable && (
                              <span className="flex items-center gap-1 text-xs font-semibold text-[#49B7E3]">
                                {isLoadingThis ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Eye className="w-3.5 h-3.5" />
                                )}
                                {isLoadingThis ? 'Laden...' : 'Posts bearbeiten'}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {reviewOpen && reviewPosts.length > 0 && (
        <ReviewModal
          generatedPosts={reviewPosts}
          wizardMode="guided"
          webhookResponse={null}
          onConfirm={handleReviewConfirm}
          onClose={handleReviewClose}
        />
      )}
    </ModuleWrapper>
  );
};

export default PulsePage;
