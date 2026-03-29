import React, { useState, useCallback, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Zap, Sparkles } from 'lucide-react';
import Step1Topic from './Step1Topic';
import Step2PlatformSchedule from './Step2PlatformSchedule';
import Step3GoalStyle from './Step3GoalStyle';
import Step4Summary from './Step4Summary';
import GeneratingOverlay from './GeneratingOverlay';
import PostResultsList from './PostResultsList';
import ReviewModal from './ReviewModal';
import ModeSelection, { PulseMode } from './ModeSelection';
import VisualWizardRoot from './visual/VisualWizardRoot';
import ReelWizard from '../../pulse/reels/ReelWizard';
import BrandStyleIndicator from './visual/BrandStyleIndicator';
import { PulseWizardData } from './types';
import { ContentSlot } from '../types';
import { usePulseGeneration } from '../../../hooks/usePulseGeneration';
import { supabase } from '../../../lib/supabase';
import { getSmartDefaults } from '../../../lib/brandProfileDefaults';
import BrandNudgeModal, { isBrandNudgeDismissed, dismissBrandNudge } from './BrandNudgeModal';

interface WizardRootProps {
  onComplete: (slots: ContentSlot[]) => void;
  onClose: () => void;
}

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getSunday(monday: Date): Date {
  const sun = new Date(monday);
  sun.setDate(monday.getDate() + 6);
  sun.setHours(23, 59, 59, 999);
  return sun;
}

const stepTitles = ['Thema', 'Plattformen & Zeitraum', 'Ziel & Stil', 'Zusammenfassung'];

interface BrandProfile {
  id: string;
  tonality: Record<string, string> | null;
  slogan: string | null;
  colors: any;
  prompt_guidelines: string | null;
}

const WizardRoot: React.FC<WizardRootProps> = ({ onComplete, onClose }) => {
  const pulse = usePulseGeneration();
  const [selectedMode, setSelectedMode] = useState<PulseMode | null>(pulse.initialMode);
  const [currentStep, setCurrentStep] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [hasBrandDefaults, setHasBrandDefaults] = useState(false);
  const [hasBrandReference, setHasBrandReference] = useState(false);
  const [showBrandNudge, setShowBrandNudge] = useState(false);
  const [postOverrides, setPostOverrides] = useState<Record<string, Partial<import('./types').GeneratedPost>>>({});

  const handlePostUpdate = useCallback((postId: string, updates: Partial<import('./types').GeneratedPost>) => {
    setPostOverrides(prev => ({ ...prev, [postId]: { ...(prev[postId] || {}), ...updates } }));
  }, []);

  const mergedPosts = (pulse.generatedPosts as import('./types').GeneratedPost[]).map(p =>
    postOverrides[p.id] ? { ...p, ...postOverrides[p.id] } : p
  );

  const derivePhase = (): 'wizard' | 'generating' | 'results' => {
    const s = pulse.progress.status;
    if (pulse.isGenerating || s === 'starting' || s === 'generating') return 'generating';
    if ((s === 'completed' || s === 'partial') && pulse.generatedPosts.length > 0) return 'results';
    if (s === 'failed' || s === 'timeout') return 'generating';
    return 'wizard';
  };

  const [phase, setPhase] = useState<'wizard' | 'generating' | 'results'>(derivePhase);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thisMonday = getMonday(today);
  const thisWeekStart = today > thisMonday ? today : thisMonday;

  // Pre-fill platforms from Planner handoff (if available)
  const [data, setData] = useState<PulseWizardData>(() => {
    let prefilledPlatforms: string[] = [];
    try {
      const stored = sessionStorage.getItem('planner-pulse-platforms');
      if (stored) {
        prefilledPlatforms = JSON.parse(stored);
        sessionStorage.removeItem('planner-pulse-platforms');
      }
    } catch { /* ignore */ }

    return {
      theme: '',
      topicDescription: '',
      platforms: prefilledPlatforms,
      frequency: 3,
      scheduleType: 'next_7_days',
      timeframe: { startDate: today, endDate: (() => { const e = new Date(today); e.setDate(today.getDate() + 6); e.setHours(23, 59, 59, 999); return e; })() },
      goal: '',
      tone: '',
      imageGeneration: { enabled: true, quality: 'standard' },
      storiesEnabled: false,
    };
  });

  const update = (partial: Partial<PulseWizardData>) => {
    setData(prev => ({ ...prev, ...partial }));
  };

  useEffect(() => {
    if (phase !== 'generating') return;
    const s = pulse.progress.status;
    if ((s === 'completed' || s === 'partial') && pulse.generatedPosts.length > 0) {
      setPhase('results');
    }
  }, [phase, pulse.progress.status, pulse.generatedPosts.length]);

  useEffect(() => {
    const initialPhase = derivePhase();
    if (initialPhase === 'generating') {
      setSelectedMode('theme');
    }
  }, []);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase
        .from('brand_profiles')
        .select('user_id, tonality, slogan, colors, prompt_guidelines, visual_style, reference_images')
        .eq('user_id', session.user.id)
        .maybeSingle();
      if (data) {
        setBrandProfile({ ...data, id: data.user_id } as BrandProfile);
        const defaults = getSmartDefaults({ tonality: data.tonality });
        setHasBrandDefaults(!!(defaults.tone || defaults.language));
        setData(prev => ({
          ...prev,
          tone: prev.tone || defaults.tone || '',
        }));
        const refs = data.reference_images;
        setHasBrandReference(Array.isArray(refs) && refs.length > 0);
      }
    })();
  }, []);

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0: return !!data.theme;
      case 1: return data.platforms.length > 0 && !!data.timeframe.startDate && !!data.timeframe.endDate;
      case 2: return !!data.goal && !!data.tone;
      case 3: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else if (pulse.initialMode) {
      onClose();
    } else {
      setSelectedMode(null);
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!hasBrandReference && !isBrandNudgeDismissed()) {
      setShowBrandNudge(true);
      return;
    }
    setPhase('generating');
    pulse.startGeneration(data);
  }, [data, pulse, hasBrandReference]);

  const handleNudgeSkip = useCallback(() => {
    dismissBrandNudge();
    setShowBrandNudge(false);
    setPhase('generating');
    pulse.startGeneration(data);
  }, [data, pulse]);

  const handleNudgeBrandStudio = useCallback(() => {
    setShowBrandNudge(false);
    window.dispatchEvent(new CustomEvent('navigate-to-brand-studio'));
    onClose();
  }, [onClose]);

  const handleDismissPopup = useCallback(() => {
    pulse.dismissPopup();
    onClose();
  }, [pulse, onClose]);

  const handleViewResults = useCallback(() => {
    if (pulse.generatedPosts.length > 0) {
      setPhase('results');
    }
  }, [pulse.generatedPosts.length]);

  const handleViewInCalendar = () => {
    if (pulse.generatedPosts.length > 0) {
      setShowReviewModal(true);
    } else {
      onClose();
    }
  };

  const handleReviewComplete = (confirmedPosts: ContentSlot[]) => {
    setShowReviewModal(false);
    pulse.reset();
    onComplete(confirmedPosts);
  };

  const handleRetry = useCallback(() => {
    pulse.reset();
    setPhase('generating');
    pulse.startGeneration(data);
  }, [data, pulse]);

  const handleModeSelect = (mode: PulseMode) => {
    setSelectedMode(mode);
  };

  const getHeaderSubtitle = () => {
    if (!selectedMode) return 'W\u00e4hle deinen Modus';
    if (selectedMode === 'visual') return 'Visual Modus';
    if (phase === 'wizard') return `Schritt ${currentStep + 1} von 4 \u2014 ${stepTitles[currentStep]}`;
    if (phase === 'generating' && !['completed', 'partial', 'failed', 'timeout'].includes(pulse.progress.status)) {
      return 'Content wird generiert...';
    }
    return '';
  };

  const subtitleColor = () => {
    if (phase === 'generating' && selectedMode === 'theme' && !['completed', 'partial', 'failed', 'timeout'].includes(pulse.progress.status)) {
      return 'text-[#49B7E3]';
    }
    return 'text-[#7A7A7A]';
  };

  if (selectedMode === 'reels') {
    return (
      <ReelWizard
        onClose={onClose}
        onBack={() => pulse.initialMode ? onClose() : setSelectedMode(null)}
      />
    );
  }

  if (selectedMode === 'visual') {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        {/* Frosted overlay with glow blobs — same treatment as theme mode */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: 'rgba(244, 252, 254, 0.4)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <div className="absolute rounded-full" style={{ top: '10%', left: '5%', width: '500px', height: '500px', opacity: 0.35, filter: 'blur(80px)', background: 'rgba(73, 183, 227, 0.6)', animation: 'ai-blob-drift-1 8s ease-in-out infinite' }} />
          <div className="absolute rounded-full" style={{ bottom: '5%', right: '8%', width: '450px', height: '450px', opacity: 0.30, filter: 'blur(75px)', background: 'rgba(124, 108, 242, 0.5)', animation: 'ai-blob-drift-2 7s ease-in-out infinite' }} />
          <div className="absolute rounded-full" style={{ top: '45%', right: '25%', width: '350px', height: '350px', opacity: 0.25, filter: 'blur(65px)', background: 'rgba(232, 160, 214, 0.45)', animation: 'ai-blob-drift-3 6.5s ease-in-out infinite' }} />
        </div>
        <div className="glass-modal w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden relative z-10">
          <div className="px-6 pt-6 pb-4 border-b border-[rgba(73,183,227,0.10)] flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 pulse-gradient-icon rounded-[var(--vektrus-radius-sm)] flex items-center justify-center shadow-md">
                  <Zap className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#111111] font-manrope">
                    Pulse Visual
                  </h2>
                  <p className="text-xs text-[#7A7A7A]">
                    Bilder zu Posts
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-[#7A7A7A] hover:text-[#111111] hover:bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <VisualWizardRoot
            onComplete={onComplete}
            onClose={onClose}
            onBack={() => pulse.initialMode ? onClose() : setSelectedMode(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        {/* Bright frosted overlay — blurs the dashboard behind, lets blobs glow through */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: 'rgba(244, 252, 254, 0.4)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <div className="absolute rounded-full" style={{ top: '10%', left: '5%', width: '500px', height: '500px', opacity: 0.35, filter: 'blur(80px)', background: 'rgba(73, 183, 227, 0.6)', animation: 'ai-blob-drift-1 8s ease-in-out infinite' }} />
          <div className="absolute rounded-full" style={{ bottom: '5%', right: '8%', width: '450px', height: '450px', opacity: 0.30, filter: 'blur(75px)', background: 'rgba(124, 108, 242, 0.5)', animation: 'ai-blob-drift-2 7s ease-in-out infinite' }} />
          <div className="absolute rounded-full" style={{ top: '45%', right: '25%', width: '350px', height: '350px', opacity: 0.25, filter: 'blur(65px)', background: 'rgba(232, 160, 214, 0.45)', animation: 'ai-blob-drift-3 6.5s ease-in-out infinite' }} />
        </div>
        <div className="glass-modal w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden relative z-10">
          <div className="px-6 pt-6 pb-4 border-b border-[rgba(73,183,227,0.10)] flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 pulse-gradient-icon rounded-[var(--vektrus-radius-sm)] flex items-center justify-center shadow-md">
                  <Zap className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#111111] font-manrope">
                    Vektrus Pulse
                  </h2>
                  <p className={`text-xs ${subtitleColor()}`}>
                    {getHeaderSubtitle()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  const s = pulse.progress.status;
                  if (s === 'failed' || s === 'timeout') {
                    pulse.reset();
                    onClose();
                  } else if (phase === 'generating' && pulse.isGenerating) {
                    handleDismissPopup();
                  } else {
                    onClose();
                  }
                }}
                className="p-2 text-[#7A7A7A] hover:text-[#111111] hover:bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] transition-all"
                title={phase === 'generating' && pulse.isGenerating && !['failed','timeout'].includes(pulse.progress.status) ? 'Im Hintergrund weitergenerieren' : 'Schließen'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedMode === 'theme' && phase === 'wizard' && (
              <div className="flex items-center space-x-2">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="flex-1 h-1.5 rounded-full overflow-hidden bg-[#B6EBF7]/20">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: i <= currentStep ? '100%' : '0%',
                        background: i <= currentStep
                          ? 'linear-gradient(90deg, #49B7E3 0%, #7C6CF2 50%, #E8A0D6 100%)'
                          : 'transparent',
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {!selectedMode && (
                <ModeSelection onSelect={handleModeSelect} />
              )}
              {selectedMode === 'theme' && phase === 'wizard' && currentStep === 0 && (
                <Step1Topic data={data} onUpdate={update} />
              )}
              {selectedMode === 'theme' && phase === 'wizard' && currentStep === 1 && (
                <Step2PlatformSchedule data={data} onUpdate={update} />
              )}
              {selectedMode === 'theme' && phase === 'wizard' && currentStep === 2 && (
                <Step3GoalStyle
                  data={data}
                  onUpdate={update}
                  brandProfile={brandProfile}
                  hasBrandDefaults={hasBrandDefaults}
                  onNavigateToBrandStudio={() => {
                    window.dispatchEvent(new CustomEvent('navigate-to-brand-studio'));
                    onClose();
                  }}
                />
              )}
              {selectedMode === 'theme' && phase === 'wizard' && currentStep === 3 && (
                <Step4Summary data={data} onUpdate={update} onJumpToStep={setCurrentStep} />
              )}
              {selectedMode === 'theme' && phase === 'generating' && (
                <GeneratingOverlay
                  hasImages={data.imageGeneration.enabled}
                  error={pulse.error}
                  onRetry={handleRetry}
                  progress={pulse.progress}
                  onDismiss={handleDismissPopup}
                  onClose={onClose}
                  onViewResults={handleViewResults}
                />
              )}
              {selectedMode === 'theme' && phase === 'results' && (
                <PostResultsList
                  posts={mergedPosts}
                  webhookResponse={pulse.webhookResponse}
                  onViewInCalendar={handleViewInCalendar}
                  onPostUpdate={handlePostUpdate}
                />
              )}
            </div>
          </div>

          {selectedMode === 'theme' && phase === 'wizard' && (
            <div className="px-6 py-4 border-t border-[rgba(73,183,227,0.10)] flex items-center justify-between flex-shrink-0">
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 text-sm text-[#7A7A7A] hover:text-[#111111] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{currentStep === 0 ? (pulse.initialMode ? 'Schließen' : 'Zur\u00fcck zur Auswahl') : 'Zur\u00fcck'}</span>
              </button>

              {currentStep < 3 ? (
                <button
                  onClick={handleNext}
                  disabled={!isStepValid(currentStep)}
                  className={`flex items-center space-x-2 px-5 py-2.5 rounded-[var(--vektrus-radius-sm)] font-semibold text-sm transition-all duration-200 ${
                    isStepValid(currentStep)
                      ? 'text-white hover:scale-[1.03] shadow-sm hover:shadow-md'
                      : 'bg-[#B6EBF7]/20 text-gray-400 cursor-not-allowed'
                  }`}
                  style={
                    isStepValid(currentStep)
                      ? { background: 'linear-gradient(135deg, #49B7E3 0%, #7C6CF2 33%, #E8A0D6 66%, #F4BE9D 100%)' }
                      : undefined
                  }
                >
                  <span>Weiter</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleGenerate}
                  disabled={!isStepValid(0) || !isStepValid(1) || !isStepValid(2)}
                  className={`group/cta flex items-center space-x-2 px-6 py-3 rounded-[var(--vektrus-radius-sm)] font-semibold text-sm transition-all duration-300 ${
                    isStepValid(0) && isStepValid(1) && isStepValid(2)
                      ? 'text-white hover:scale-[1.03] shadow-md hover:shadow-lg'
                      : 'bg-[#B6EBF7]/20 text-gray-400 cursor-not-allowed'
                  }`}
                  style={
                    isStepValid(0) && isStepValid(1) && isStepValid(2)
                      ? { background: 'var(--vektrus-ai-violet)' }
                      : undefined
                  }
                  onMouseEnter={(e) => {
                    if (isStepValid(0) && isStepValid(1) && isStepValid(2)) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #49B7E3 0%, #7C6CF2 33%, #E8A0D6 66%, #F4BE9D 100%)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isStepValid(0) && isStepValid(1) && isStepValid(2)) {
                      e.currentTarget.style.background = 'var(--vektrus-ai-violet)';
                    }
                  }}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Content generieren</span>
                </button>
              )}
            </div>
          )}

          {!selectedMode && (
            <div className="px-6 py-4 border-t border-[rgba(73,183,227,0.10)] flex items-center justify-start flex-shrink-0">
              <button
                onClick={onClose}
                className="flex items-center space-x-2 text-sm text-[#7A7A7A] hover:text-[#111111] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Abbrechen</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {showBrandNudge && (
        <BrandNudgeModal
          onSetupStyle={handleNudgeBrandStudio}
          onSkip={handleNudgeSkip}
        />
      )}

      {showReviewModal && (
        <ReviewModal
          generatedPosts={pulse.generatedPosts as any}
          wizardMode="guided"
          webhookResponse={pulse.webhookResponse}
          onConfirm={handleReviewComplete}
          onClose={() => {
            setShowReviewModal(false);
            pulse.reset();
            onClose();
          }}
        />
      )}
    </>
  );
};

export default WizardRoot;
