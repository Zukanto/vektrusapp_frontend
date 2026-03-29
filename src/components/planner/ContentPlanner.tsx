import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Zap, X, Link2, RefreshCw, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PlannerHeader from './PlannerHeader';
import type { StatusFilter, ContentTypeFilter } from './PlannerHeader';
import WeeklyIntelligenceCard from './WeeklyIntelligenceCard';
import WeekView from './WeekView';
import ContentSlotEditor from './ContentSlotEditor';
import MonthView from './MonthView';
import { ContentSlot, PlannerContext } from './types';
import { useToast } from '../ui/toast';
import ModuleWrapper from '../ui/ModuleWrapper';
import { CalendarService } from '../../services/calendarService';
import { supabase } from '../../lib/supabase';
import { useMediaInsert } from '../../hooks/useMediaInsert';
import { useConnectedPlatforms } from '../../hooks/useConnectedPlatforms';
import { usePulseGeneration } from '../../hooks/usePulseGeneration';
import PulseEntryModal from './PulseEntryModal';
import { PlannerTutorial } from '../OnboardingTour';
import { usePlannerPerformance } from '../../hooks/usePlannerPerformance';

const ContentPlanner: React.FC = () => {
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const stored = sessionStorage.getItem('planner-target-date');
    if (stored) {
      sessionStorage.removeItem('planner-target-date');
      return new Date(stored);
    }
    return new Date();
  });
  const [plannerContext, setPlannerContext] = useState<PlannerContext>({
    goal: 'engagement',
    platforms: [],
    frequency: 4,
    tone: 'professional'
  });

  const [contentSlots, setContentSlots] = useState<ContentSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<ContentSlot | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [contentTypeFilter, setContentTypeFilter] = useState<ContentTypeFilter>('all');
  const { addToast } = useToast();
  const { selectedMedia, triggerPostCreation, clearSelection } = useMediaInsert();
  const { connectedPlatforms, isLoading: isPlatformsLoading, hasError: platformsError, retry: retryPlatforms } = useConnectedPlatforms();
  const pulse = usePulseGeneration();
  const { performanceData } = usePlannerPerformance();
  const [showPulseEntry, setShowPulseEntry] = useState(false);
  const loadRequestId = useRef(0);
  const realtimeUnsub = useRef<(() => void) | null>(null);

  // Sync connected platforms into plannerContext when loaded
  useEffect(() => {
    if (!isPlatformsLoading) {
      setPlannerContext(prev => ({ ...prev, platforms: connectedPlatforms }));
    }
  }, [isPlatformsLoading, connectedPlatforms]);

  const loadCalendarPostsLatest = useCallback(async () => {
    const requestId = ++loadRequestId.current;
    try {
      setIsLoading(true);
      const startDate = viewMode === 'week'
        ? getStartOfWeek(selectedWeek)
        : getStartOfMonth(selectedWeek);
      const endDate = viewMode === 'week'
        ? getEndOfWeek(selectedWeek)
        : getEndOfMonth(selectedWeek);

      const posts = await CalendarService.loadPosts(startDate, endDate);
      if (requestId !== loadRequestId.current) return;
      const slots = posts.map(post => CalendarService.convertToContentSlot(post));
      setContentSlots(slots);
    } catch (error) {
      if (requestId !== loadRequestId.current) return;
      console.error('Error loading calendar posts:', error);
      addToast({
        type: 'error',
        title: 'Fehler beim Laden',
        description: 'Posts konnten nicht geladen werden.',
        duration: 3000
      });
    } finally {
      if (requestId === loadRequestId.current) {
        setIsLoading(false);
      }
    }
  }, [selectedWeek, viewMode]);

  const loadRef = useRef(loadCalendarPostsLatest);
  loadRef.current = loadCalendarPostsLatest;

  useEffect(() => {
    loadCalendarPostsLatest();
  }, [loadCalendarPostsLatest]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        if (realtimeUnsub.current) {
          realtimeUnsub.current();
          realtimeUnsub.current = null;
        }
        realtimeUnsub.current = CalendarService.subscribeToUpdates(session.user.id, () => {
          loadRef.current();
        });
      }
    });

    return () => {
      subscription?.unsubscribe();
      if (realtimeUnsub.current) {
        realtimeUnsub.current();
        realtimeUnsub.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (selectedMedia && triggerPostCreation && !isLoading) {
      const now = new Date();
      now.setHours(now.getHours() + 1, 0, 0, 0);

      const isVideo = selectedMedia.file_type.startsWith('video/');

      const newSlot: ContentSlot = {
        id: `temp-${Date.now()}`,
        date: now,
        time: '18:00',
        platform: 'instagram',
        status: 'draft',
        title: 'Neuer Post',
        content: '',
        body: '',
        contentType: isVideo ? 'reel' : 'post',
        hashtags: [],
        tone: 'professional',
        media: {
          type: isVideo ? 'video' : 'image',
          url: selectedMedia.public_url
        }
      };

      setSelectedSlot(newSlot);
      setIsEditorOpen(true);
      clearSelection();

      addToast({
        type: 'success',
        title: 'Post-Editor geöffnet',
        description: isVideo ? 'Das ausgewählte Video wurde hinzugefügt.' : 'Das ausgewählte Bild wurde hinzugefügt.',
        duration: 2000
      });
    }
  }, [selectedMedia, triggerPostCreation, isLoading]);

  const getStartOfWeek = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const getEndOfWeek = (date: Date): Date => {
    const start = getStartOfWeek(date);
    const end = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
    end.setHours(23, 59, 59, 999);
    return end;
  };

  const getStartOfMonth = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
  };

  const getEndOfMonth = (date: Date): Date => {
    const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    d.setHours(23, 59, 59, 999);
    return d;
  };

  const combineDateTime = (date: Date, time?: string): Date => {
    const combined = new Date(date);
    if (time) {
      const [hours, minutes] = time.split(':').map(Number);
      combined.setHours(hours, minutes, 0, 0);
    }
    return combined;
  };

  const handleSlotSelect = (slot: ContentSlot) => {
    setSelectedSlot(slot);
    setIsEditorOpen(true);
  };

  const handleSlotUpdate = async (updatedSlot: ContentSlot) => {
    try {
      const scheduledDate = combineDateTime(updatedSlot.date, updatedSlot.time);

      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const checkDate = new Date(scheduledDate);
      checkDate.setHours(0, 0, 0, 0);
      if (checkDate < now) {
        addToast({
          type: 'error',
          title: 'Ungültiges Datum',
          description: 'Posts können nicht in der Vergangenheit geplant werden.',
          duration: 3000
        });
        return;
      }

      const contentJsonb = CalendarService.buildContentJsonb(updatedSlot);

      if (updatedSlot.id.startsWith('temp-')) {
        const createdPost = await CalendarService.createPost({
          platform: updatedSlot.platform,
          content: contentJsonb,
          scheduled_date: scheduledDate,
          status: updatedSlot.status,
          content_type: updatedSlot.contentType
        });

        const newSlot = CalendarService.convertToContentSlot(createdPost);

        if (updatedSlot.media && !newSlot.media) {
          newSlot.media = updatedSlot.media;
        }

        setContentSlots(prev => [...prev, newSlot]);

        addToast({
          type: 'success',
          title: 'Post erstellt',
          description: 'Der neue Post wurde gespeichert.',
          duration: 2000
        });
      } else {
        await CalendarService.updatePost(updatedSlot.id, {
          content: contentJsonb,
          scheduled_date: scheduledDate,
          status: updatedSlot.status,
          platform: updatedSlot.platform,
          content_type: updatedSlot.contentType
        });

        setContentSlots(prev =>
          prev.map(slot => slot.id === updatedSlot.id ? updatedSlot : slot)
        );

        addToast({
          type: 'success',
          title: 'Post aktualisiert',
          description: 'Änderungen wurden gespeichert.',
          duration: 2000
        });
      }
    } catch (error) {
      console.error('Error updating slot:', error);
      addToast({
        type: 'error',
        title: 'Fehler',
        description: 'Post konnte nicht gespeichert werden.',
        duration: 3000
      });
    }
  };

  const handleSlotCreate = async (newSlot: Omit<ContentSlot, 'id'>) => {
    try {
      const contentJsonb = CalendarService.buildContentJsonb(newSlot as ContentSlot);
      const createdPost = await CalendarService.createPost({
        platform: newSlot.platform,
        content: contentJsonb,
        scheduled_date: combineDateTime(newSlot.date, newSlot.time),
        status: newSlot.status,
        content_type: newSlot.contentType
      });

      const slot = CalendarService.convertToContentSlot(createdPost);
      setContentSlots(prev => [...prev, slot]);
      setSelectedSlot(slot);
      setIsEditorOpen(true);

      addToast({
        type: 'success',
        title: 'Post erstellt',
        description: 'Der Post wurde gespeichert.',
        duration: 2000
      });
    } catch (error) {
      console.error('Error creating slot:', error);
      addToast({
        type: 'error',
        title: 'Fehler',
        description: 'Post konnte nicht erstellt werden.',
        duration: 3000
      });
    }
  };

  const handleSlotDelete = async (slotId: string) => {
    try {
      await CalendarService.deletePost(slotId);
      setContentSlots(prev => prev.filter(slot => slot.id !== slotId));
      addToast({
        type: 'info',
        title: 'Post gelöscht',
        description: 'Der Post wurde entfernt.',
        duration: 2000
      });
    } catch (error) {
      console.error('Error deleting slot:', error);
      addToast({
        type: 'error',
        title: 'Fehler',
        description: 'Post konnte nicht gelöscht werden.',
        duration: 3000
      });
    }
  };

  const handleSlotDuplicate = (slot: ContentSlot) => {
    const duplicatedSlot: ContentSlot = {
      ...slot,
      id: Date.now().toString(),
      title: `${slot.title} (Kopie)`,
      status: 'draft'
    };
    setContentSlots(prev => [...prev, duplicatedSlot]);
    addToast({
      type: 'success',
      title: 'Post dupliziert',
      description: 'Eine Kopie wurde erstellt.',
      duration: 2000
    });
  };

  const handlePostStatusChange = async (slotId: string, status: ContentSlot['status'], publishedAt?: string) => {
    setContentSlots(prev =>
      prev.map(slot =>
        slot.id === slotId
          ? { ...slot, status, publishedAt: publishedAt || slot.publishedAt }
          : slot
      )
    );

    if (!slotId.startsWith('temp-')) {
      try {
        await CalendarService.updatePost(slotId, {
          status: status as any,
          published_at: publishedAt,
        });
      } catch (error) {
        console.error('Error updating post status:', error);
      }
    }

    if (status === 'published') {
      addToast({
        type: 'success',
        title: 'Post veröffentlicht',
        description: 'Dein Post wurde erfolgreich gepostet.',
        duration: 3000,
      });
    } else if (status === 'scheduled') {
      addToast({
        type: 'success',
        title: 'Post geplant',
        description: 'Dein Post wird zum geplanten Zeitpunkt veröffentlicht.',
        duration: 3000,
      });
    } else if (status === 'failed') {
      addToast({
        type: 'error',
        title: 'Posting fehlgeschlagen',
        description: 'Der Post konnte nicht veröffentlicht werden.',
        duration: 4000,
      });
    }
  };

  const handleSlotCopyToPlatform = (slot: ContentSlot, platform: string) => {
    const copiedSlot: ContentSlot = {
      ...slot,
      id: Date.now().toString(),
      platform: platform as any,
      title: `${slot.title} (${platform})`,
      status: 'draft'
    };
    setContentSlots(prev => [...prev, copiedSlot]);
    addToast({
      type: 'success',
      title: `Auf ${platform} kopiert`,
      description: 'Post wurde für andere Plattform angepasst.',
      duration: 2000
    });
  };

  const generateContextualTitle = (platform: string, goal: string): string => {
    const titles: Record<string, Record<string, string[]>> = {
      instagram: {
        engagement: ['Frage an euch', 'Was denkst du?', 'Behind the Scenes'],
        leads: ['Kostenloser Guide', 'Link in Bio', 'Exklusiver Tipp'],
        awareness: ['Unser Warum', 'Team Spotlight', 'Transformation']
      },
      linkedin: {
        engagement: ['Diskussion starten', 'Eure Erfahrungen?', 'Meinungsaustausch'],
        leads: ['Whitepaper Download', 'Kostenlose Beratung', 'Case Study'],
        awareness: ['Branche-Insights', 'Marktanalyse', 'Zukunftstrends']
      }
    };
    
    const platformTitles = titles[platform] || titles.instagram;
    const goalTitles = platformTitles[goal] || platformTitles.engagement;
    return goalTitles[Math.floor(Math.random() * goalTitles.length)];
  };

  const generateContextualContent = (platform: string, goal: string): string => {
    const contents: Record<string, Record<string, string>> = {
      instagram: {
        engagement: 'Was ist euer größter Social Media Fehler? Teilt eure Erfahrungen in den Kommentaren! 👇',
        leads: 'Kostenloser Guide: "5 Schritte zu mehr Reichweite" - Link in Bio! 🔗',
        awareness: 'Behind the Scenes: So entstehen unsere Posts. Authentizität ist alles! ✨'
      },
      linkedin: {
        engagement: 'Wie seht ihr die Zukunft von Social Media Marketing? Lasst uns diskutieren! 💬',
        leads: 'Kostenlose Beratung: Wie ihr eure LinkedIn-Strategie optimiert. DM für Details! 📈',
        awareness: 'Warum Personal Branding 2024 wichtiger denn je ist. Meine 3 wichtigsten Learnings: 🧠'
      }
    };
    
    const platformContents = contents[platform] || contents.instagram;
    return platformContents[goal] || platformContents.engagement;
  };

  const generateContextualHashtags = (platform: string, goal: string): string[] => {
    const hashtags: Record<string, Record<string, string[]>> = {
      instagram: {
        engagement: ['community', 'frage', 'meinung', 'diskussion', 'austausch'],
        leads: ['kostenlos', 'guide', 'tipps', 'lernen', 'wachstum'],
        awareness: ['authentisch', 'transparent', 'team', 'werte', 'mission']
      },
      linkedin: {
        engagement: ['networking', 'diskussion', 'meinung', 'austausch', 'community'],
        leads: ['beratung', 'strategie', 'optimierung', 'erfolg', 'wachstum'],
        awareness: ['personalbranding', 'expertise', 'insights', 'trends', 'zukunft']
      }
    };
    
    const platformHashtags = hashtags[platform] || hashtags.instagram;
    return platformHashtags[goal] || platformHashtags.engagement;
  };

  const handleApproveAllDrafts = async () => {
    const weekStart = getStartOfWeek(selectedWeek);
    const weekEnd = getEndOfWeek(selectedWeek);
    const weekDrafts = contentSlots.filter(s => {
      const d = s.date instanceof Date ? s.date : new Date(s.date);
      return d >= weekStart && d <= weekEnd && s.status === 'draft';
    });

    if (weekDrafts.length === 0) {
      addToast({ type: 'info', title: 'Keine Entwürfe', description: 'Es gibt keine offenen Entwürfe diese Woche.', duration: 2000 });
      return;
    }

    for (const draft of weekDrafts) {
      await handlePostStatusChange(draft.id, 'scheduled');
    }

    addToast({
      type: 'success',
      title: `${weekDrafts.length} Posts freigegeben`,
      description: 'Alle Entwürfe wurden als geplant markiert.',
      duration: 3000,
    });
  };

  const openPulseFromPlanner = useCallback(() => {
    setShowPulseEntry(true);
  }, []);

  const handlePulseEntrySelect = useCallback((mode: 'theme' | 'visual') => {
    // Store selected platforms for Pulse WizardRoot to pick up
    if (plannerContext.platforms.length > 0) {
      sessionStorage.setItem('planner-pulse-platforms', JSON.stringify(plannerContext.platforms));
    }
    setShowPulseEntry(false);
    pulse.reopenPopup(mode);
  }, [plannerContext.platforms, pulse]);

  const handleFillGaps = () => {
    if (plannerContext.platforms.length === 0) {
      addToast({ type: 'warning', title: 'Keine Plattformen', description: 'Wähle mindestens eine Plattform.', duration: 3000 });
      return;
    }
    openPulseFromPlanner();
  };

  const handleGenerateWeek = () => {
    if (!plannerContext.goal || plannerContext.platforms.length === 0) {
      addToast({
        type: 'warning',
        title: 'Kontext fehlt',
        description: 'Bitte wähle zuerst ein Ziel und mindestens eine Plattform.',
        duration: 3000
      });
      return;
    }
    openPulseFromPlanner();
  };

  const handleExport = () => {
    addToast({
      type: 'info',
      title: 'Export wird vorbereitet',
      description: 'PDF-Export kommt bald!',
      duration: 2000
    });
  };

  const handleMonthView = () => {
    setViewMode(viewMode === 'week' ? 'month' : 'week');
  };

  // Zielwechsel löst neue Vorschläge aus
  React.useEffect(() => {
    if (plannerContext.goal && contentSlots.some(slot => slot.status === 'ai_suggestion')) {
      // Aktualisiere KI-Vorschläge basierend auf neuem Ziel
      const updatedSlots = contentSlots.map(slot => {
        if (slot.status === 'ai_suggestion') {
          return {
            ...slot,
            title: generateContextualTitle(slot.platform, plannerContext.goal),
            content: generateContextualContent(slot.platform, plannerContext.goal),
            hashtags: generateContextualHashtags(slot.platform, plannerContext.goal)
          };
        }
        return slot;
      });
      setContentSlots(updatedSlots);
    }
  }, [plannerContext.goal]);

  const [bannerDismissed, setBannerDismissed] = useState(false);

  const pulseBannerData = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const isMondayOrTuesday = dayOfWeek === 1 || dayOfWeek === 2;
    if (!isMondayOrTuesday) return null;

    const weekKey = `pulse-banner-${getStartOfWeek(selectedWeek).toISOString().split('T')[0]}`;
    if (typeof localStorage !== 'undefined' && localStorage.getItem(weekKey)) return null;

    const weekStart = getStartOfWeek(selectedWeek);
    const weekEnd = getEndOfWeek(selectedWeek);
    const weekPosts = contentSlots.filter(s => {
      const d = s.date instanceof Date ? s.date : new Date(s.date);
      return d >= weekStart && d <= weekEnd;
    });

    if (weekPosts.length >= 3) return null;

    const hasPulseThisWeek = weekPosts.some(
      s => s.source === 'pulse' || s.generatedBy === 'pulse'
    );
    if (hasPulseThisWeek) return null;

    const freeSlots = 7 - weekPosts.length;
    return { freeSlots, weekKey };
  }, [contentSlots, selectedWeek]);

  const handleDismissBanner = () => {
    setBannerDismissed(true);
    if (pulseBannerData?.weekKey) {
      localStorage.setItem(pulseBannerData.weekKey, '1');
    }
  };


  return (
    <ModuleWrapper module="planner" showTopAccent={true}>
      <div className="h-full flex flex-col bg-[#F4FCFE]">
        {/* Weekly Intelligence Card — unified strategic context + insights + actions */}
        {viewMode === 'week' && (
          <WeeklyIntelligenceCard
            contentSlots={contentSlots}
            selectedWeek={selectedWeek}
            context={plannerContext}
            onContextChange={setPlannerContext}
            onNavigatePulse={openPulseFromPlanner}
            onFillGaps={handleFillGaps}
            onApproveAll={handleApproveAllDrafts}
            performanceData={performanceData}
          />
        )}

        {/* Toolbar — navigation + filters + actions */}
        <PlannerHeader
          selectedWeek={selectedWeek}
          onWeekChange={setSelectedWeek}
          context={plannerContext}
          onContextChange={setPlannerContext}
          connectedPlatforms={connectedPlatforms}
          onStartWizard={openPulseFromPlanner}
          onGenerateWeek={handleGenerateWeek}
          onExport={handleExport}
          onMonthView={handleMonthView}
          viewMode={viewMode}
          weekPostsCount={contentSlots.filter(s => {
            const weekStart = getStartOfWeek(selectedWeek);
            const weekEnd = getEndOfWeek(selectedWeek);
            return s.date >= weekStart && s.date <= weekEnd;
          }).length}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          contentTypeFilter={contentTypeFilter}
          onContentTypeFilterChange={setContentTypeFilter}
        />

        <div className="flex items-center justify-between px-6 pt-2">
          <PlannerTutorial />
        </div>

      <AnimatePresence>
        {pulseBannerData && !bannerDismissed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-2.5 bg-[#E6F6FB] border-b border-[#B6EBF7]/30">
              <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-[#49B7E3]" />
                <span className="text-sm text-[#111111]">
                  Deine Woche hat noch {pulseBannerData.freeSlots} freie Slots. Pulse kann dir helfen.
                </span>
                <button
                  onClick={openPulseFromPlanner}
                  className="text-sm font-semibold text-[#49B7E3] hover:text-[#3A9FD1] transition-colors px-3 py-1 rounded-[var(--vektrus-radius-sm)] hover:bg-[#49B7E3]/10"
                >
                  Starten
                </button>
              </div>
              <button
                onClick={handleDismissBanner}
                className="p-1 text-[#7A7A7A] hover:text-[#111111] rounded-[var(--vektrus-radius-sm)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Week/Month View or Platform States */}
        <div className={`transition-all duration-300 ${isEditorOpen ? 'flex-1' : 'w-full'}`} data-tour="planner-calendar">
          {isPlatformsLoading ? (
            /* Loading state while fetching connected platforms */
            <div className="h-full flex items-center justify-center p-6">
              <div className="text-center">
                <div className="w-10 h-10 rounded-[var(--vektrus-radius-sm)] bg-[#F4FCFE] flex items-center justify-center mx-auto mb-3">
                  <RefreshCw className="w-4.5 h-4.5 text-[#49B7E3] animate-spin" />
                </div>
                <p className="text-sm text-[#7A7A7A]">Plattformen werden geladen...</p>
              </div>
            </div>
          ) : platformsError ? (
            /* Fetch error state */
            <div className="h-full flex items-center justify-center p-6">
              <div className="max-w-sm text-center">
                <div className="w-11 h-11 rounded-[var(--vektrus-radius-sm)] bg-[#FA7E70]/8 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-5 h-5 text-[#FA7E70]" />
                </div>
                <h3 className="text-[15px] font-semibold text-[#111111] mb-1.5">
                  Plattformen konnten nicht geladen werden
                </h3>
                <p className="text-sm text-[#7A7A7A] leading-relaxed mb-5">
                  Deine verbundenen Accounts konnten nicht abgerufen werden. Pruefe deine Verbindung und versuche es erneut.
                </p>
                <button
                  onClick={retryPlatforms}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--vektrus-radius-sm)] text-sm font-semibold text-[#49B7E3] border border-[#49B7E3]/30 bg-white hover:bg-[#F4FCFE] transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Erneut versuchen
                </button>
              </div>
            </div>
          ) : connectedPlatforms.length === 0 ? (
            /* Zero connected platforms — guide user to Profile page */
            <div className="h-full flex items-center justify-center p-6">
              <div className="max-w-sm text-center">
                <div className="w-11 h-11 rounded-[var(--vektrus-radius-sm)] bg-[#F4FCFE] flex items-center justify-center mx-auto mb-4">
                  <Link2 className="w-5 h-5 text-[#49B7E3]" />
                </div>
                <h3 className="text-[15px] font-semibold text-[#111111] mb-1.5">
                  Keine Plattformen verbunden
                </h3>
                <p className="text-sm text-[#7A7A7A] leading-relaxed mb-5">
                  Verbinde deine Social-Media-Accounts auf der Profil-Seite, um den Content Planner zu nutzen.
                </p>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-profile'))}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--vektrus-radius-sm)] text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: '#49B7E3' }}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  Accounts verbinden
                </button>
              </div>
            </div>
          ) : viewMode === 'week' ? (
            <WeekView
              selectedWeek={selectedWeek}
              contentSlots={contentSlots}
              onSlotSelect={handleSlotSelect}
              onSlotCreate={handleSlotCreate}
              onSlotUpdate={handleSlotUpdate}
              onSlotDelete={handleSlotDelete}
              onSlotDuplicate={handleSlotDuplicate}
              onSlotCopyToPlatform={handleSlotCopyToPlatform}
              plannerContext={plannerContext}
              onNavigatePulse={openPulseFromPlanner}
              statusFilter={statusFilter}
              contentTypeFilter={contentTypeFilter}
            />
          ) : (
            <MonthView
              selectedMonth={selectedWeek}
              contentSlots={contentSlots}
              onWeekSelect={(week) => {
                setSelectedWeek(week);
                setViewMode('week');
              }}
              activePlatforms={plannerContext.platforms}
            />
          )}
        </div>

        {/* Content Editor */}
        {isEditorOpen && selectedSlot && (
          <ContentSlotEditor
            key={selectedSlot.id}
            slot={selectedSlot}
            onUpdate={handleSlotUpdate}
            onClose={() => setIsEditorOpen(false)}
            onPostStatusChange={handlePostStatusChange}
          />
        )}
      </div>

      {showPulseEntry && (
        <PulseEntryModal
          onSelect={handlePulseEntrySelect}
          onClose={() => setShowPulseEntry(false)}
        />
      )}

      </div>
    </ModuleWrapper>
  );
};

export default ContentPlanner;