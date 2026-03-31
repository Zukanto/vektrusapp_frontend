import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Film, ArrowLeft, Sparkles, Clapperboard, Image, FolderOpen, Plus, Clock, Camera, User, Wand2 } from 'lucide-react';
import { useReelConcept } from '../../hooks/useReelConcept';
import { useSceneVideos } from '../../hooks/useSceneVideos';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { enterStudio, exitStudio } from './studioTransition';
import StudioTopBar from './StudioTopBar';
import StudioContent from './StudioContent';
import StudioStoryboard from './StudioStoryboard';
import StudioBRoll from './StudioBRoll';
import StudioThumbnails from './StudioThumbnails';
import StudioMyVideos from './StudioMyVideos';
import StudioDock, { StudioView } from './StudioDock';
import ReelAutoModal from './ReelAutoModal';
import type { ReelContent } from '../../services/reelService';

interface ReelConceptRow {
  id: string;
  content: ReelContent;
  created_at: string;
}

const StudioPage: React.FC = () => {
  const { reelId } = useParams<{ reelId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<StudioView>('storyboard');

  // Load single reel concept when reelId is present
  const { record, loading, error } = useReelConcept(reelId);
  const concept = record?.content ?? null;

  // Scene videos for this reel (polling-based)
  const { sceneVideos, refetch: refetchSceneVideos } = useSceneVideos(reelId);

  // Auto-generate modal
  const [showAutoModal, setShowAutoModal] = useState(false);

  // Hub: load all reel concepts when no reelId
  const [reelConcepts, setReelConcepts] = useState<ReelConceptRow[]>([]);
  const [hubLoading, setHubLoading] = useState(!reelId);
  const [hubLoadCount, setHubLoadCount] = useState(0);

  const loadHubConcepts = useCallback(async () => {
    if (reelId || !user?.id) return;
    setHubLoading(true);
    const { data } = await supabase
      .from('pulse_generated_content')
      .select('id, content, created_at')
      .eq('user_id', user.id)
      .eq('source', 'pulse_reels')
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) {
      setReelConcepts(
        data
          .filter((r: any) => r.content?.type === 'reel')
          .map((r: any) => ({ id: r.id, content: r.content as ReelContent, created_at: r.created_at }))
      );
    }
    setHubLoading(false);
  }, [reelId, user?.id]);

  useEffect(() => {
    loadHubConcepts();
  }, [loadHubConcepts, hubLoadCount]);

  const handleAutoModalClose = () => {
    setShowAutoModal(false);
  };

  const handleConceptsGenerated = (_ids: string[]) => {
    // Reload hub to show new concepts
    setHubLoadCount(c => c + 1);
  };

  // ── Loading State ──
  if (reelId && loading) {
    return (
      <div
        data-studio-root
        className="fixed inset-0 flex flex-col"
        style={{ backgroundColor: '#09090b' }}
      >
        <div className="studio-reveal-topbar flex-shrink-0">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="h-4 w-40 rounded bg-[#FAFAFA]/5 animate-pulse" />
            <div className="h-4 w-48 rounded bg-[#FAFAFA]/5 animate-pulse" />
            <div className="h-9 w-44 rounded-xl bg-[#FAFAFA]/5 animate-pulse" />
          </div>
        </div>
        <div className="studio-reveal-content flex-1 flex flex-col xl:flex-row min-h-0 gap-2 px-5 py-3">
          <div className="xl:w-[28%] flex-shrink-0 space-y-4">
            <div className="h-8 w-3/4 rounded bg-[#FAFAFA]/5 animate-pulse" />
            <div className="h-24 w-full rounded-xl bg-[#121214] animate-pulse" />
            <div className="h-20 w-full rounded-xl bg-[#121214] animate-pulse" />
            <div className="h-20 w-full rounded-xl bg-[#121214] animate-pulse" />
          </div>
          <div className="xl:w-[47%] flex-shrink-0 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-5">
                <div className="w-10 h-10 rounded-full bg-[#FAFAFA]/5 animate-pulse flex-shrink-0" />
                <div className="flex-1 h-32 rounded-2xl bg-[#121214] animate-pulse" />
              </div>
            ))}
          </div>
          <div className="xl:w-1/4 flex-shrink-0 space-y-4">
            <div className="h-6 w-1/2 rounded bg-[#FAFAFA]/5 animate-pulse" />
            <div className="h-40 w-full rounded-xl bg-[#121214] animate-pulse" />
            <div className="h-32 w-full rounded-xl bg-[#121214] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // ── Studio Hub (no reelId) ──
  if (!reelId) {
    const FORMAT_LABELS: Record<string, string> = {
      talking_head: 'Talking Head',
      produkt_showcase: 'Produkt-Showcase',
      tutorial: 'Tutorial',
      behind_the_scenes: 'Behind the Scenes',
      vorher_nachher: 'Vorher/Nachher',
      b_roll_montage: 'B-Roll Montage',
      listicle: 'Listicle',
    };

    const formatDate = (d: string) =>
      new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

    // Hub loading skeleton
    if (hubLoading) {
      return (
        <div
          data-studio-root
          className="fixed inset-0 flex flex-col"
          style={{ backgroundColor: '#09090b' }}
        >
          <div className="flex-1 overflow-auto px-6 md:px-10 py-10">
            <div className="max-w-5xl mx-auto">
              <div className="h-8 w-48 rounded-lg bg-[#FAFAFA]/5 animate-pulse mb-2" />
              <div className="h-4 w-72 rounded bg-[#FAFAFA]/5 animate-pulse mb-10" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-40 rounded-2xl bg-[#121214] animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // True empty — no reels at all
    if (reelConcepts.length === 0) {
      return (
        <div
          data-studio-root
          className="fixed inset-0 flex flex-col items-center justify-center"
          style={{ backgroundColor: '#09090b' }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 60% 40% at 50% 45%, rgba(73,183,227,0.04) 0%, transparent 70%)',
            }}
          />
          <div className="relative z-10 text-center px-6 max-w-lg">
            {/* Brand icon cluster */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-[#FAFAFA]/[0.04] border border-[#FAFAFA]/[0.06] flex items-center justify-center">
                <Clapperboard className="w-[18px] h-[18px] text-[#49B7E3]/50" />
              </div>
              <div
                className="w-14 h-14 rounded-2xl border border-[#FAFAFA]/[0.08] flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(73,183,227,0.10) 0%, rgba(124,108,242,0.08) 50%, rgba(236,72,153,0.06) 100%)',
                }}
              >
                <Film className="w-6 h-6 text-[#FAFAFA]/60" />
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#FAFAFA]/[0.04] border border-[#FAFAFA]/[0.06] flex items-center justify-center">
                <Image className="w-[18px] h-[18px] text-[#EC4899]/40" />
              </div>
            </div>

            <h1 className="font-manrope font-bold text-2xl text-[#FAFAFA] mb-2 tracking-tight">
              Vektrus Studio
            </h1>
            <p className="text-[#FAFAFA]/35 text-sm leading-relaxed mb-10 max-w-sm mx-auto">
              Dein kreatives Cockpit für Reels — vom Storyboard bis zum fertigen Video.
            </p>

            {/* Capability hints */}
            <div className="grid grid-cols-2 gap-2.5 mb-10 max-w-sm mx-auto">
              {[
                { icon: <Clapperboard className="w-4 h-4" />, label: 'Storyboard', desc: 'Szenen planen & ordnen' },
                { icon: <Film className="w-4 h-4" />, label: 'B-Roll', desc: 'KI-Videos generieren' },
                { icon: <Image className="w-4 h-4" />, label: 'Thumbnails', desc: 'Cover-Bilder erstellen' },
                { icon: <FolderOpen className="w-4 h-4" />, label: 'Meine Videos', desc: 'Alle Ergebnisse im Blick' },
              ].map((cap) => (
                <div
                  key={cap.label}
                  className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-[#FAFAFA]/[0.03] border border-[#FAFAFA]/[0.05] text-left"
                >
                  <span className="text-[#FAFAFA]/30 flex-shrink-0">{cap.icon}</span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[#FAFAFA]/70 leading-tight">{cap.label}</p>
                    <p className="text-[11px] text-[#FAFAFA]/25 leading-tight mt-0.5">{cap.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowAutoModal(true)}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer border-0"
              style={{
                background: 'linear-gradient(135deg, #49B7E3 0%, #7C6CF2 50%, #E8A0D6 100%)',
                boxShadow: '0 0 20px rgba(124,108,242,0.15), 0 4px 12px rgba(0,0,0,0.3)',
              }}
            >
              <Sparkles className="w-4 h-4" />
              KI-Ideen generieren
            </button>

            <p className="text-[#FAFAFA]/20 text-xs mt-4">
              oder{' '}
              <button
                onClick={() => navigate('/pulse')}
                className="text-[#49B7E3]/60 hover:text-[#49B7E3] transition-colors underline bg-transparent border-none cursor-pointer text-xs"
              >
                manuell in Pulse erstellen
              </button>
            </p>
          </div>

          {showAutoModal && (
            <ReelAutoModal
              onClose={handleAutoModalClose}
              onConceptsGenerated={handleConceptsGenerated}
            />
          )}
        </div>
      );
    }

    // Hub with reel concept cards
    return (
      <div
        data-studio-root
        className="fixed inset-0 flex flex-col"
        style={{ backgroundColor: '#09090b' }}
      >
        {/* TopBar — stagger layer 1 (reveals first at 450ms) */}
        <div className="studio-reveal-topbar flex items-center justify-between px-6 md:px-10 py-4 flex-shrink-0">
          <button
            onClick={() => exitStudio(navigate, '/dashboard')}
            className="flex items-center gap-2 text-[#FAFAFA]/50 hover:text-[#FAFAFA] transition-colors text-sm font-medium bg-transparent border-none cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Zurück</span>
          </button>
          <button
            onClick={() => setShowAutoModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer border-0 flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #49B7E3 0%, #7C6CF2 50%, #E8A0D6 100%)',
              boxShadow: '0 0 16px rgba(124,108,242,0.12), 0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            <Wand2 className="w-4 h-4" />
            Neue Reel-Ideen
          </button>
        </div>

        {/* Content — stagger layer 2 (reveals at 650ms) */}
        <div className="studio-reveal-content flex-1 overflow-auto px-6 md:px-10 pb-10">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="font-manrope font-bold text-2xl text-[#FAFAFA] tracking-tight mb-1">
                Vektrus Studio
              </h1>
              <p className="text-[#FAFAFA]/35 text-sm">
                Wähle ein Reel-Konzept, um im Studio zu arbeiten.
              </p>
            </div>

            {/* Reel grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {reelConcepts.map((row) => {
                const c = row.content;
                return (
                  <button
                    key={row.id}
                    onClick={() => enterStudio(navigate, row.id)}
                    className="group relative bg-[#121214] hover:bg-[#18181b] rounded-2xl border border-[#FAFAFA]/[0.06] hover:border-[#FAFAFA]/[0.12] transition-all text-left p-5 cursor-pointer"
                  >
                    {/* Format badge */}
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FAFAFA]/[0.06] text-[#FAFAFA]/50 mb-3">
                      {FORMAT_LABELS[c.format] || c.format}
                    </span>

                    {/* Title */}
                    <h3 className="font-manrope font-bold text-[15px] text-[#FAFAFA]/90 leading-snug mb-3 group-hover:text-[#49B7E3] transition-colors line-clamp-2">
                      {c.title}
                    </h3>

                    {/* Meta row */}
                    <div className="flex items-center gap-3 text-[11px] text-[#FAFAFA]/30">
                      <span className="inline-flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        {c.scenes.length} Szenen
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {c.total_duration_seconds}s
                      </span>
                      {c.needs_face && (
                        <span className="inline-flex items-center gap-1">
                          <User className="w-3 h-3" />
                          Gesicht
                        </span>
                      )}
                    </div>

                    {/* Date */}
                    <p className="text-[11px] text-[#FAFAFA]/20 mt-3 pt-3 border-t border-[#FAFAFA]/[0.04]">
                      {formatDate(row.created_at)}
                    </p>

                    {/* Hover accent line */}
                    <div className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full bg-[#49B7E3] opacity-0 group-hover:opacity-40 transition-opacity" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {showAutoModal && (
          <ReelAutoModal
            onClose={handleAutoModalClose}
            onConceptsGenerated={handleConceptsGenerated}
          />
        )}
      </div>
    );
  }

  // ── Error: reelId present but concept not found ──
  if (!concept) {
    return (
      <div
        data-studio-root
        className="fixed inset-0 flex flex-col items-center justify-center"
        style={{ backgroundColor: '#09090b' }}
      >
        <div className="text-center px-6 max-w-md">
          <div className="w-16 h-16 rounded-full bg-[#49B7E3]/10 flex items-center justify-center mx-auto mb-5">
            <Film className="w-8 h-8 text-[#49B7E3]/40" />
          </div>
          <h2 className="font-manrope font-bold text-xl text-[#FAFAFA] mb-2">
            Konzept nicht gefunden
          </h2>
          <p className="text-[#FAFAFA]/40 text-sm mb-8 leading-relaxed">
            Dieses Reel-Konzept konnte nicht geladen werden.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/studio')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-[#FAFAFA]/60 hover:text-[#FAFAFA] border border-[#FAFAFA]/10 hover:border-[#FAFAFA]/20 transition-colors cursor-pointer bg-transparent"
            >
              <ArrowLeft className="w-4 h-4" />
              Zur Übersicht
            </button>
            <button
              onClick={() => navigate('/pulse')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#49B7E3] text-white hover:bg-[#3aa5d1] transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Neues Reel in Pulse
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Studio View ──
  return (
    <div
      data-studio-root
      className="fixed inset-0 flex flex-col"
      style={{ backgroundColor: '#09090b' }}
    >
      {/* Stagger Layer 1: TopBar */}
      <div className="studio-reveal-topbar flex-shrink-0">
        <StudioTopBar title={concept.title} reelConceptId={reelId} />
      </div>

      {/* Stagger Layer 3: Content */}
      <div className="studio-reveal-content flex-1 flex flex-col min-h-0">
        <StudioContent>
          {activeView === 'storyboard' && (
            <StudioStoryboard
              concept={concept}
              reelConceptId={reelId}
              sceneVideos={sceneVideos}
              onVideoGenerated={refetchSceneVideos}
            />
          )}
          {activeView === 'b-roll' && (
            <StudioBRoll />
          )}
          {activeView === 'thumbnails' && (
            <StudioThumbnails reelTitle={concept.title} reelConceptId={reelId} />
          )}
          {activeView === 'videos' && (
            <StudioMyVideos onSwitchView={setActiveView} />
          )}
        </StudioContent>
      </div>

      {/* Stagger Layer 2: Dock */}
      <StudioDock
        activeView={activeView}
        onViewChange={setActiveView}
        className="studio-reveal-dock"
      />
    </div>
  );
};

export default StudioPage;
