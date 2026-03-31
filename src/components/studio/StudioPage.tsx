import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Film, ArrowLeft, Sparkles } from 'lucide-react';
import { useReelConcept } from '../../hooks/useReelConcept';
import StudioTopBar from './StudioTopBar';
import StudioContent from './StudioContent';
import StudioStoryboard from './StudioStoryboard';
import StudioBRoll from './StudioBRoll';
import type { BRollPrefill } from './StudioBRoll';
import StudioThumbnails from './StudioThumbnails';
import StudioMyVideos from './StudioMyVideos';
import StudioDock, { StudioView } from './StudioDock';
import { mockReelConcept } from './mockReelConcept';

const StudioPage: React.FC = () => {
  const { reelId } = useParams<{ reelId: string }>();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<StudioView>('storyboard');

  // B-Roll prefill from Storyboard Inspector
  const [brollPrefill, setBrollPrefill] = useState<BRollPrefill | null>(null);

  // Load real data when reelId is present, otherwise use mock for dev
  const { record, loading, error } = useReelConcept(reelId);

  const concept = record?.content ?? (reelId ? null : mockReelConcept);

  // When Inspector's "KI-Video generieren" is clicked
  const handleGenerateBRoll = useCallback(
    (description: string, duration: number) => {
      setBrollPrefill({
        description,
        duration,
        reelConceptId: reelId || undefined,
      });
      setActiveView('b-roll');
    },
    [reelId]
  );

  const handlePrefillConsumed = useCallback(() => {
    setBrollPrefill(null);
  }, []);

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

  // ── Error State ──
  if (reelId && error) {
    return (
      <div
        data-studio-root
        className="fixed inset-0 flex flex-col items-center justify-center"
        style={{ backgroundColor: '#09090b' }}
      >
        <div className="text-center px-6 max-w-md">
          <div className="w-16 h-16 rounded-full bg-[#FA7E70]/10 flex items-center justify-center mx-auto mb-5">
            <Film className="w-8 h-8 text-[#FA7E70]/60" />
          </div>
          <h2 className="font-manrope font-bold text-xl text-[#FAFAFA] mb-2">
            Konzept nicht gefunden
          </h2>
          <p className="text-[#FAFAFA]/40 text-sm mb-8 leading-relaxed">
            {error}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/planner')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-[#FAFAFA]/60 hover:text-[#FAFAFA] border border-[#FAFAFA]/10 hover:border-[#FAFAFA]/20 transition-colors cursor-pointer bg-transparent"
            >
              <ArrowLeft className="w-4 h-4" />
              Zum Planner
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

  // ── No reelId and no fallback ──
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
            Kein Reel-Konzept ausgewählt
          </h2>
          <p className="text-[#FAFAFA]/40 text-sm mb-8 leading-relaxed">
            Öffne ein Reel-Konzept aus der Video-Werkstatt oder erstelle ein neues in Pulse.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/vision')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-[#FAFAFA]/60 hover:text-[#FAFAFA] border border-[#FAFAFA]/10 hover:border-[#FAFAFA]/20 transition-colors cursor-pointer bg-transparent"
            >
              <Film className="w-4 h-4" />
              Video-Werkstatt
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
        <StudioTopBar title={concept.title} />
      </div>

      {/* Stagger Layer 3: Content */}
      <div className="studio-reveal-content flex-1 flex flex-col min-h-0">
        <StudioContent>
          {activeView === 'storyboard' && (
            <StudioStoryboard concept={concept} onGenerateBRoll={handleGenerateBRoll} />
          )}
          {activeView === 'b-roll' && (
            <StudioBRoll
              prefill={brollPrefill}
              onPrefillConsumed={handlePrefillConsumed}
            />
          )}
          {activeView === 'thumbnails' && (
            <StudioThumbnails reelTitle={concept.title} />
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
