import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Zap, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PlannerHeader from './PlannerHeader';
import NotificationBar from './NotificationBar';
import WeekView from './WeekView';
import ContentSlotEditor from './ContentSlotEditor';
import PostReviewModal from './PostReviewModal';
import MonthView from './MonthView';
import { ContentSlot, PlannerContext } from './types';
import { useToast } from '../ui/toast';
import ModuleWrapper from '../ui/ModuleWrapper';
import { BetaHint } from '../ui/BetaHint';
import { CalendarService } from '../../services/calendarService';
import { supabase } from '../../lib/supabase';
import { useMediaInsert } from '../../hooks/useMediaInsert';
import { usePulseGeneration } from '../../hooks/usePulseGeneration';
import { PlannerTutorial } from '../OnboardingTour';

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
    platforms: ['instagram', 'linkedin', 'tiktok'],
    frequency: 4,
    tone: 'professional'
  });

  const [contentSlots, setContentSlots] = useState<ContentSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<ContentSlot | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [generatedSlots, setGeneratedSlots] = useState<ContentSlot[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [isGeneratingWeek, setIsGeneratingWeek] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();
  const { selectedMedia, triggerPostCreation, clearSelection } = useMediaInsert();
  const pulse = usePulseGeneration();

  const loadRequestId = useRef(0);
  const realtimeUnsub = useRef<(() => void) | null>(null);

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

  const loadCalendarPosts = loadCalendarPostsLatest;

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

  const getOptimalTime = (platform: string): string => {
    const times: Record<string, string> = {
      instagram: '18:00',
      linkedin: '09:00',
      tiktok: '19:00',
      facebook: '15:00',
      twitter: '12:00'
    };
    return times[platform] || '18:00';
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

  const getOptimalContentType = (platform: string): ContentSlot['contentType'] => {
    const types: Record<string, ContentSlot['contentType'][]> = {
      instagram: ['post', 'reel', 'carousel', 'story'],
      linkedin: ['post', 'carousel'],
      tiktok: ['reel'],
      facebook: ['post', 'story']
    };
    
    const platformTypes = types[platform] || ['post'];
    return platformTypes[Math.floor(Math.random() * platformTypes.length)];
  };


  const handleGenerateWeek = async () => {
    if (!plannerContext.goal || plannerContext.platforms.length === 0) {
      addToast({
        type: 'warning',
        title: 'Kontext fehlt',
        description: 'Bitte wähle zuerst ein Ziel und mindestens eine Plattform.',
        duration: 3000
      });
      return;
    }

    setIsGeneratingWeek(true);

    await new Promise(resolve => setTimeout(resolve, 2500));

    const slots = generateWeekPlan(plannerContext, selectedWeek);
    setGeneratedSlots(slots);
    setIsGeneratingWeek(false);
    setShowReviewModal(true);
  };

  const handleReviewComplete = async (confirmedSlots: ContentSlot[]) => {
    try {
      const savedPosts = [];

      for (const slot of confirmedSlots) {
        try {
          const createdPost = await CalendarService.createPost({
            platform: slot.platform,
            content: CalendarService.buildContentJsonb(slot),
            scheduled_date: combineDateTime(slot.date, slot.time),
            status: slot.status === 'planned' ? 'scheduled' : slot.status,
            content_type: slot.contentType
          });

          savedPosts.push(CalendarService.convertToContentSlot(createdPost));
        } catch (error) {
          console.error('Error saving post:', error);
        }
      }

      if (savedPosts.length > 0) {
        setContentSlots(prev => [...prev, ...savedPosts]);
        addToast({
          type: 'success',
          title: 'Posts eingeplant!',
          description: `${savedPosts.length} Posts wurden in den Kalender übertragen.`,
          duration: 4000
        });
      } else {
        addToast({
          type: 'error',
          title: 'Fehler',
          description: 'Posts konnten nicht gespeichert werden.',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error in handleReviewComplete:', error);
      addToast({
        type: 'error',
        title: 'Fehler',
        description: 'Posts konnten nicht gespeichert werden.',
        duration: 3000
      });
    } finally {
      setShowReviewModal(false);
    }
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

  const generateWeekPlan = (context: PlannerContext, week: Date): ContentSlot[] => {
    // Mock KI-Generierung - würde normalerweise API-Call sein
    const slots: ContentSlot[] = [];
    const weekStart = new Date(week);
    weekStart.setDate(week.getDate() - week.getDay() + 1); // Montag

    context.platforms.forEach(platform => {
      for (let day = 0; day < 7; day += Math.ceil(7 / context.frequency)) {
        const slotDate = new Date(weekStart);
        slotDate.setDate(weekStart.getDate() + day);

        slots.push({
          id: `${platform}-${day}-${Date.now()}`,
          date: slotDate,
          time: '18:00',
          platform,
          status: 'ai_suggestion',
          title: generateContextualTitle(platform, context.goal),
          content: generateContextualContent(platform, context.goal),
          contentType: getContentType(platform),
          hashtags: generateContextualHashtags(platform, context.goal),
          tone: context.tone as any,
          contentScore: (() => {
            const readability = Math.floor(Math.random() * 25) + 70;
            const hookStrength = Math.floor(Math.random() * 30) + 65;
            const hashtagQuality = Math.floor(Math.random() * 30) + 60;
            const ctaClarity = Math.floor(Math.random() * 25) + 70;
            const platformFit = Math.floor(Math.random() * 20) + 75;
            const total = Math.round((readability + hookStrength + hashtagQuality + ctaClarity + platformFit) / 5);
            return { total, readability, hookStrength, hashtagQuality, ctaClarity, platformFit };
          })()
        });
      }
    });

    return slots;
  };

  const getContentType = (platform: string): 'post' | 'story' | 'reel' | 'carousel' => {
    const types: Record<string, ('post' | 'story' | 'reel' | 'carousel')[]> = {
      instagram: ['post', 'story', 'reel', 'carousel'],
      linkedin: ['post', 'carousel'],
      tiktok: ['reel'],
      facebook: ['post', 'story']
    };
    const platformTypes = types[platform] || types.instagram;
    return platformTypes[Math.floor(Math.random() * platformTypes.length)];
  };
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

  const getNotificationData = (): { message: string; type: 'info' | 'warning' | 'success'; actionLabel?: string; onAction?: () => void } => {
    const today = new Date();
    const isMonday = today.getDay() === 1;
    const weekStart = getStartOfWeek(selectedWeek);
    const weekEnd = getEndOfWeek(selectedWeek);
    const weekPosts = contentSlots.filter(s => s.date >= weekStart && s.date <= weekEnd);
    const pulsePosts = weekPosts.filter(s => s.generatedBy === 'pulse' || s.status === 'ai_suggestion');

    if (plannerContext.platforms.length === 0) {
      return {
        message: '⚠️ Verbinde zu erst deine Social Media Accounts',
        type: 'warning',
        actionLabel: 'Jetzt verbinden'
      };
    }

    if (weekPosts.length === 0 && isMonday) {
      return {
        message: 'Neue Woche! Lasse Pulse neue Postings generieren',
        type: 'info',
        actionLabel: 'Start Pulse',
        onAction: () => { pulse.reset(); pulse.reopenPopup(); }
      };
    }

    if (weekPosts.length > 0 && weekPosts.length < 5) {
      return {
        message: `⚠️ Nur ${weekPosts.length} Posts geplant. Vektrus empfiehlt 5-7 pro Woche`,
        type: 'warning',
        actionLabel: 'Mehr generieren',
        onAction: handleGenerateWeek
      };
    }

    if (pulsePosts.length > 0) {
      return {
        message: `✨ ${pulsePosts.length} of ${weekPosts.length} posts wurden erstellt von Pulse`,
        type: 'success'
      };
    }

    if (plannerContext.goal === 'engagement') {
      return {
        message: 'Deine Reels performen mittwochs um 18:00 besonders gut.',
        type: 'info'
      };
    }

    if (plannerContext.goal === 'leads') {
      return {
        message: 'LinkedIn Posts am Dienstag generieren 40% mehr Leads.',
        type: 'info'
      };
    }

    return {
      message: 'Tipp: Konsistenz ist wichtiger als Perfektion.',
      type: 'info'
    };
  };

  return (
    <ModuleWrapper module="planner" showTopAccent={true}>
      <div className="h-full flex flex-col bg-[#F4FCFE]">
        {/* Header */}
        <PlannerHeader
        selectedWeek={selectedWeek}
        onWeekChange={setSelectedWeek}
        context={plannerContext}
        onContextChange={setPlannerContext}
        onStartWizard={() => { pulse.reset(); pulse.reopenPopup(); }}
        onGenerateWeek={handleGenerateWeek}
        onExport={handleExport}
        onMonthView={handleMonthView}
        viewMode={viewMode}
        weekPostsCount={contentSlots.filter(s => {
          const weekStart = getStartOfWeek(selectedWeek);
          const weekEnd = getEndOfWeek(selectedWeek);
          return s.date >= weekStart && s.date <= weekEnd;
        }).length}
      />

      <div className="flex items-center justify-end px-6 pt-2">
        <PlannerTutorial />
      </div>

      <div className="px-6 pt-1">
        <BetaHint
          type="demo"
          title="Auto-Posting befindet sich in der Entwicklung."
          description="Du kannst deine Posts planen und vorbereiten -- die automatische Veroeffentlichung auf Instagram, LinkedIn und Facebook wird in Kürze verfügbar sein."
          dismissable
          storageKey="planner-auto-posting-hint"
        />
      </div>

      {/* Notification Bar */}
      {(() => {
        const notificationData = getNotificationData();
        return (
          <NotificationBar
            message={notificationData.message}
            type={notificationData.type}
            actionLabel={notificationData.actionLabel}
            onAction={notificationData.onAction}
          />
        );
      })()}

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
                  onClick={() => { pulse.reset(); pulse.reopenPopup(); }}
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
        {/* Week/Month View */}
        <div className={`transition-all duration-300 ${isEditorOpen ? 'flex-1' : 'w-full'}`} data-tour="planner-calendar">
          {viewMode === 'week' ? (
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
              onNavigatePulse={() => { pulse.reset(); pulse.reopenPopup(); }}
            />
          ) : (
            <MonthView
              selectedMonth={selectedWeek}
              contentSlots={contentSlots}
              onWeekSelect={(week) => {
                setSelectedWeek(week);
                setViewMode('week');
              }}
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

      {/* Loading Animation */}
      {isGeneratingWeek && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-[var(--vektrus-radius-lg)] p-8 max-w-md w-full mx-4 shadow-modal">
            <div className="flex flex-col items-center">
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 border-3 border-[rgba(124,108,242,0.15)] rounded-full"></div>
                <div className="absolute inset-0 border-3 border-[var(--vektrus-ai-violet)] rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-2 bg-[rgba(124,108,242,0.06)] rounded-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-[var(--vektrus-ai-violet)]" />
                </div>
              </div>

              <h3 className="text-lg font-bold font-manrope text-[#111111] mb-2">KI plant deine Woche</h3>
              <p className="text-sm text-[#7A7A7A] text-center mb-4">
                Content wird analysiert und für deine Zielgruppe optimiert...
              </p>

              <div className="w-full bg-[#F4FCFE] rounded-full h-2 overflow-hidden">
                <div className="h-full rounded-full animate-pulse" style={{ width: '70%', background: 'var(--vektrus-pulse-gradient)' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post Review Modal */}
      {showReviewModal && (
        <PostReviewModal
          generatedPosts={generatedSlots}
          onConfirm={handleReviewComplete}
          onClose={() => setShowReviewModal(false)}
        />
      )}
      </div>
    </ModuleWrapper>
  );
};

export default ContentPlanner;