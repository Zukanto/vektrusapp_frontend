import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, ArrowLeft, Sparkles, Image } from 'lucide-react';
import VisualStep1Upload from './VisualStep1Upload';
import VisualStep2Platforms from './VisualStep2Platforms';
import VisualStep3Schedule from './VisualStep3Schedule';
import VisualStep4Style from './VisualStep4Style';
import VisualStep5Summary from './VisualStep5Summary';
import GeneratingOverlay from '../GeneratingOverlay';
import PostResultsList from '../PostResultsList';
import ReviewModal from '../ReviewModal';
import { VisualWizardData, getMonday, getSunday } from './types';
import { ContentSlot } from '../../types';
import { usePulseGeneration } from '../../../../hooks/usePulseGeneration';
import { ContentGeneratorService } from '../../../../services/contentGenerator';
import { supabase } from '../../../../lib/supabase';
import { getSmartDefaults, hasSmartDefaults } from '../../../../lib/brandProfileDefaults';

interface VisualWizardRootProps {
  onComplete: (slots: ContentSlot[]) => void;
  onClose: () => void;
  onBack: () => void;
}

const stepTitles = ['Bilder hochladen', 'Plattformen', 'Zeitraum', 'Stil & Ton', 'Zusammenfassung'];

interface BrandProfile {
  id: string;
  tonality: Record<string, string> | null;
  slogan: string | null;
  colors: any;
  reference_images?: Array<{ url?: string; thumbnail_url?: string; platform?: string } | string> | null;
}

const VisualWizardRoot: React.FC<VisualWizardRootProps> = ({ onComplete, onClose, onBack }) => {
  const pulse = usePulseGeneration();
  const [currentStep, setCurrentStep] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [hasBrandDefaults, setHasBrandDefaults] = useState(false);
  const [postOverrides, setPostOverrides] = useState<Record<string, Partial<import('../types').GeneratedPost>>>({});

  const handlePostUpdate = useCallback((postId: string, updates: Partial<import('../types').GeneratedPost>) => {
    setPostOverrides(prev => ({ ...prev, [postId]: { ...(prev[postId] || {}), ...updates } }));
  }, []);

  const mergedPosts = (pulse.generatedPosts as import('../types').GeneratedPost[]).map(p =>
    postOverrides[p.id] ? { ...p, ...postOverrides[p.id] } : p
  );

  const nextMonday = (() => {
    const mon = getMonday(new Date());
    mon.setDate(mon.getDate() + 7);
    return mon;
  })();

  const [data, setData] = useState<VisualWizardData>({
    images: [],
    platforms: [],
    scheduleType: 'next_7_days',
    timeframe: (() => { const s = new Date(); s.setHours(0,0,0,0); const e = new Date(s); e.setDate(s.getDate() + 6); e.setHours(23,59,59,999); return { startDate: s, endDate: e }; })(),
    tone: '',
    goal: '',
    language: 'DE',
    apply_ci: true,
  });

  const update = (partial: Partial<VisualWizardData>) => {
    setData(prev => ({ ...prev, ...partial }));
  };

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase
        .from('brand_profiles')
        .select('user_id, tonality, slogan, colors, visual_style, reference_images')
        .eq('user_id', session.user.id)
        .maybeSingle();
      if (data) {
        setBrandProfile({ ...data, id: data.user_id } as BrandProfile);
        const defaults = getSmartDefaults({ tonality: data.tonality });
        setHasBrandDefaults(hasSmartDefaults(defaults));
        setData(prev => ({
          ...prev,
          tone: prev.tone || defaults.tone || '',
          language: prev.language || defaults.language || 'DE',
        }));
      }
    })();
  }, []);

  const handleNavigateToBrandStudio = useCallback(() => {
    window.dispatchEvent(new CustomEvent('navigate-to-brand-studio'));
    onClose();
  }, [onClose]);

  const derivePhase = (): 'wizard' | 'generating' | 'results' => {
    const s = pulse.progress.status;
    if (pulse.isGenerating || s === 'starting' || s === 'generating') return 'generating';
    if ((s === 'completed' || s === 'partial') && pulse.generatedPosts.length > 0) return 'results';
    if (s === 'failed' || s === 'timeout') return 'generating';
    return 'wizard';
  };

  const [phase, setPhase] = useState<'wizard' | 'generating' | 'results'>(derivePhase);

  useEffect(() => {
    if (phase !== 'generating') return;
    const s = pulse.progress.status;
    if ((s === 'completed' || s === 'partial') && pulse.generatedPosts.length > 0) {
      setPhase('results');
    }
    if (s === 'generating' && pulse.generatedPosts.length > 0) {
      setPhase('results');
    }
  }, [phase, pulse.progress.status, pulse.generatedPosts.length]);

  const validImages = data.images.filter(i => i.publicUrl && !i.error && !i.uploading);
  const isUploading = data.images.some(i => i.uploading);

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0: return validImages.length > 0 && !isUploading;
      case 1: return data.platforms.length > 0;
      case 2: return !!data.timeframe.startDate && !!data.timeframe.endDate;
      case 3: return !!data.tone && !!data.goal;
      case 4: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
    else onBack();
  };

  const handleGenerate = useCallback(async () => {
    setPhase('generating');

    const visualWizardData = {
      ...data,
      mode: 'visual',
      images: validImages.map(img => {
        const parts: string[] = [];
        if (img.description) parts.push(img.description);
        const notes = img.additionalNotes?.trim();
        if (notes) parts.push(notes);
        return {
          url: img.publicUrl,
          description: parts.join('. '),
        };
      }),
      frequency: validImages.length,
      theme: 'visual',
      topicDescription: '',
      imageGeneration: { enabled: false, quality: 'standard' as const },
      apply_ci: data.apply_ci,
    };

    pulse.startGeneration(visualWizardData);
  }, [data, validImages, pulse]);

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
    setPhase('wizard');
    setCurrentStep(4);
  }, [pulse]);

  return (
    <>
      {phase === 'wizard' && (
        <div className="flex items-center space-x-2 mb-0">
          {[0, 1, 2, 3, 4].map(i => (
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

      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {phase === 'wizard' && currentStep === 0 && (
            <VisualStep1Upload data={data} onUpdate={update} brandProfile={brandProfile} onNavigateToBrandStudio={handleNavigateToBrandStudio} />
          )}
          {phase === 'wizard' && currentStep === 1 && (
            <VisualStep2Platforms data={data} onUpdate={update} />
          )}
          {phase === 'wizard' && currentStep === 2 && (
            <VisualStep3Schedule data={data} onUpdate={update} />
          )}
          {phase === 'wizard' && currentStep === 3 && (
            <VisualStep4Style
              data={data}
              onUpdate={update}
              brandProfile={brandProfile}
              onNavigateToBrandStudio={handleNavigateToBrandStudio}
              hasBrandDefaults={hasBrandDefaults}
            />
          )}
          {phase === 'wizard' && currentStep === 4 && (
            <VisualStep5Summary data={data} onJumpToStep={setCurrentStep} />
          )}
          {phase === 'generating' && (
            <GeneratingOverlay
              hasImages={false}
              error={pulse.error}
              onRetry={handleRetry}
              progress={pulse.progress}
              onDismiss={handleDismissPopup}
              onClose={onClose}
              onViewResults={handleViewResults}
            />
          )}
          {phase === 'results' && (
            <PostResultsList
              posts={mergedPosts}
              webhookResponse={pulse.webhookResponse}
              onViewInCalendar={handleViewInCalendar}
              onPostUpdate={handlePostUpdate}
              pulseStatus={
                pulse.progress.status === 'generating'
                  ? 'processing'
                  : pulse.progress.status === 'completed' || pulse.progress.status === 'partial'
                  ? 'completed'
                  : pulse.progress.status === 'timeout'
                  ? 'timeout'
                  : undefined
              }
              totalExpectedPosts={pulse.progress.total || undefined}
              onNavigateToBrandStudio={handleNavigateToBrandStudio}
            />
          )}
        </div>
      </div>

      {phase === 'wizard' && (
        <div className="px-6 py-4 border-t border-[rgba(73,183,227,0.10)] flex items-center justify-between flex-shrink-0">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-sm text-[#7A7A7A] hover:text-[#111111] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{currentStep === 0 ? 'Zurück zur Auswahl' : 'Zurück'}</span>
          </button>

          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              disabled={!isStepValid(currentStep)}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-[var(--vektrus-radius-sm)] font-semibold text-sm transition-all duration-200 ${
                isStepValid(currentStep)
                  ? 'text-white hover:scale-[1.03] shadow-sm hover:shadow-md'
                  : 'bg-[#B6EBF7]/20 text-[#7A7A7A] cursor-not-allowed'
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
              disabled={!isStepValid(0) || !isStepValid(1) || !isStepValid(2) || !isStepValid(3)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-[var(--vektrus-radius-sm)] font-semibold text-sm transition-all duration-300 ${
                isStepValid(0) && isStepValid(1) && isStepValid(2) && isStepValid(3)
                  ? 'text-white hover:scale-[1.03] shadow-md hover:shadow-lg'
                  : 'bg-[#B6EBF7]/20 text-[#7A7A7A] cursor-not-allowed'
              }`}
              style={
                isStepValid(0) && isStepValid(1) && isStepValid(2) && isStepValid(3)
                  ? { background: 'var(--vektrus-ai-violet)' }
                  : undefined
              }
              onMouseEnter={(e) => {
                if (isStepValid(0) && isStepValid(1) && isStepValid(2) && isStepValid(3)) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #49B7E3 0%, #7C6CF2 33%, #E8A0D6 66%, #F4BE9D 100%)';
                }
              }}
              onMouseLeave={(e) => {
                if (isStepValid(0) && isStepValid(1) && isStepValid(2) && isStepValid(3)) {
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

      {showReviewModal && createPortal(
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
        />,
        document.body
      )}
    </>
  );
};

export default VisualWizardRoot;
