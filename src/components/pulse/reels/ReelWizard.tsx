import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Sparkles, Clapperboard, X, Zap, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateReels, pollReelStatus, loadReelResults, ReelConfiguration } from '../../../services/reelService';
import PlatformIcon from '../../ui/PlatformIcon';
import ReelResultsView from './ReelResultsView';

type ReelPhase = 'wizard' | 'generating' | 'results';

interface ReelWizardProps {
  onClose: () => void;
  onBack: () => void;
}

interface ReelWizardData {
  platforms: string[];
  theme: string;
  topic_description: string;
  reel_count: number;
  difficulty: 'einfach' | 'mittel' | 'fortgeschritten';
  show_face: boolean;
}

const PLATFORM_OPTIONS = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'youtube_shorts', label: 'YouTube Shorts' },
];

const DIFFICULTY_OPTIONS = [
  {
    id: 'einfach' as const,
    label: 'Einfach',
    description: '3 Szenen, 3–5 Min. Dreh, ideal zum Starten',
    color: 'var(--vektrus-success)',
  },
  {
    id: 'mittel' as const,
    label: 'Mittel',
    description: '3–4 Szenen, 5–10 Min. Dreh, gute Balance',
    color: 'var(--vektrus-blue)',
  },
  {
    id: 'fortgeschritten' as const,
    label: 'Fortgeschritten',
    description: '4–5 Szenen, 10–15 Min., maximale Wirkung',
    color: 'var(--vektrus-ai-violet)',
  },
];

const GENERATING_PHASES = [
  'Video-Konzepte werden entwickelt...',
  'Hook-Strategien werden analysiert...',
  'Szenenplan wird erstellt...',
  'Voiceover-Skripte werden formuliert...',
  'Audio-Empfehlungen werden abgeglichen...',
  'Konzepte werden finalisiert...',
];

const stepTitles = ['Plattformen', 'Thema & Umfang', 'Stil'];

const ReelWizard: React.FC<ReelWizardProps> = ({ onClose, onBack }) => {
  const [phase, setPhase] = useState<ReelPhase>('wizard');
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<ReelWizardData>({
    platforms: [],
    theme: '',
    topic_description: '',
    reel_count: 2,
    difficulty: 'mittel',
    show_face: true,
  });

  const [pulseId, setPulseId] = useState<string | null>(null);
  const [generatingPhaseIdx, setGeneratingPhaseIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const update = (partial: Partial<ReelWizardData>) => {
    setData(prev => ({ ...prev, ...partial }));
  };

  const togglePlatform = (id: string) => {
    setData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(id)
        ? prev.platforms.filter(p => p !== id)
        : [...prev.platforms, id],
    }));
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0: return data.platforms.length > 0;
      case 1: return data.theme.trim().length > 0;
      case 2: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 2) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  // --- Generating ---
  const startGeneration = useCallback(async () => {
    setPhase('generating');
    setError(null);
    setGeneratingPhaseIdx(0);

    try {
      const config: ReelConfiguration = {
        platforms: data.platforms,
        theme: data.theme,
        topic_description: data.topic_description || undefined,
        reel_count: data.reel_count,
        difficulty: data.difficulty,
        show_face: data.show_face,
      };

      const response = await generateReels(config);

      if (!response.success || !response.pulse_id) {
        throw new Error('Generierung fehlgeschlagen');
      }

      setPulseId(response.pulse_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    }
  }, [data]);

  // Polling
  useEffect(() => {
    if (!pulseId || phase !== 'generating') return;

    let attempts = 0;
    const maxAttempts = 90;

    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const status = await pollReelStatus(pulseId);

        if (status?.status === 'completed') {
          clearInterval(pollRef.current!);
          const reelData = await loadReelResults(pulseId);
          setResults(reelData);
          setPhase('results');
        } else if (status?.status === 'failed') {
          clearInterval(pollRef.current!);
          setError('Generierung fehlgeschlagen. Bitte versuche es erneut.');
        } else if (attempts >= maxAttempts) {
          clearInterval(pollRef.current!);
          setError('Generierung dauert zu lange. Bitte versuche es später erneut.');
        }
      } catch {
        // continue polling
      }
    }, 4000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [pulseId, phase]);

  // Phase text cycling
  useEffect(() => {
    if (phase !== 'generating' || error) return;
    const timer = setInterval(() => {
      setGeneratingPhaseIdx(i => (i + 1) % GENERATING_PHASES.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [phase, error]);

  const handleRetry = () => {
    setError(null);
    setPulseId(null);
    startGeneration();
  };

  const getSubtitle = () => {
    if (phase === 'generating' && !error) return 'Video-Konzepte werden generiert...';
    if (phase === 'results') return `${results.length} Video-Konzepte erstellt`;
    return `Schritt ${currentStep + 1} von 3 \u2014 ${stepTitles[currentStep]}`;
  };

  const subtitleColor = () => {
    if (phase === 'generating' && !error) return 'text-[#49B7E3]';
    return 'text-[#7A7A7A]';
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      {/* Bright frosted overlay — identical to WizardRoot */}
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
        {/* Header — identical structure to WizardRoot */}
        <div className="px-6 pt-6 pb-4 border-b border-[rgba(73,183,227,0.10)] flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 pulse-gradient-icon rounded-[var(--vektrus-radius-sm)] flex items-center justify-center shadow-md">
                <Clapperboard className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#111111] font-manrope">
                  Pulse Video
                </h2>
                <p className={`text-xs ${subtitleColor()}`}>
                  {getSubtitle()}
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

          {/* Progress bar — Pulse Gradient, identical to WizardRoot */}
          {phase === 'wizard' && (
            <div className="flex items-center space-x-2">
              {[0, 1, 2].map(i => (
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Step 1 — Plattformen */}
            {phase === 'wizard' && currentStep === 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-[#111111] font-manrope mb-2">
                    Für welche Plattformen?
                  </h3>
                  <p className="text-sm text-[#7A7A7A]">
                    Wähle mindestens eine Plattform aus.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {PLATFORM_OPTIONS.map(platform => {
                    const selected = data.platforms.includes(platform.id);
                    return (
                      <button
                        key={platform.id}
                        onClick={() => togglePlatform(platform.id)}
                        className={`group relative p-5 rounded-[var(--vektrus-radius-lg)] text-left transition-all duration-300 ${
                          selected
                            ? 'glass-panel border-gradient-ai ai-active shadow-elevated'
                            : 'glass-panel border border-transparent hover:shadow-card hover:scale-[1.02]'
                        }`}
                      >
                        <div className="mb-3">
                          <PlatformIcon platform={platform.id} size={32} />
                        </div>
                        <p className={`text-sm font-semibold ${selected ? 'text-[#111111]' : 'text-[#111111]'}`}>
                          {platform.label}
                        </p>
                        {selected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', damping: 12, stiffness: 300 }}
                            className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: 'var(--vektrus-pulse-gradient)' }}
                          >
                            <Check className="w-3 h-3 text-white" />
                          </motion.div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 2 — Thema & Umfang */}
            {phase === 'wizard' && currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-[#111111] font-manrope mb-2">
                    Thema & Umfang
                  </h3>
                  <p className="text-sm text-[#7A7A7A]">
                    Beschreibe, worum es in deinen Videos gehen soll.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#111111] mb-1.5">
                      Worüber soll das Video sein? *
                    </label>
                    <textarea
                      value={data.theme}
                      onChange={e => update({ theme: e.target.value })}
                      placeholder="z.B. 3 Fehler die KMU bei der Buchhaltung machen"
                      rows={3}
                      className="w-full px-4 py-3 rounded-[var(--vektrus-radius-sm)] border border-[rgba(73,183,227,0.18)] bg-white/60 backdrop-blur-sm text-sm text-[#111111] placeholder:text-[#7A7A7A]/60 focus:outline-none focus:border-[#49B7E3] focus:ring-2 focus:ring-[#49B7E3]/10 transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#111111] mb-1.5">
                      Gibt es einen konkreten Aufhänger?
                      <span className="font-normal text-[#7A7A7A] ml-1">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={data.topic_description}
                      onChange={e => update({ topic_description: e.target.value })}
                      placeholder="z.B. Steuertermin naht, neues Produkt, Event"
                      className="w-full px-4 py-3 rounded-[var(--vektrus-radius-sm)] border border-[rgba(73,183,227,0.18)] bg-white/60 backdrop-blur-sm text-sm text-[#111111] placeholder:text-[#7A7A7A]/60 focus:outline-none focus:border-[#49B7E3] focus:ring-2 focus:ring-[#49B7E3]/10 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#111111] mb-3">
                      Anzahl Videos
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4].map(n => (
                        <button
                          key={n}
                          onClick={() => update({ reel_count: n })}
                          className={`flex-1 py-2.5 rounded-[var(--vektrus-radius-sm)] text-sm font-semibold transition-all duration-200 ${
                            data.reel_count === n
                              ? 'text-white shadow-md'
                              : 'glass-panel text-[#111111] hover:shadow-card'
                          }`}
                          style={data.reel_count === n
                            ? { background: 'linear-gradient(135deg, #49B7E3 0%, #7C6CF2 33%, #E8A0D6 66%, #F4BE9D 100%)' }
                            : undefined
                          }
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3 — Stil */}
            {phase === 'wizard' && currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-[#111111] font-manrope mb-2">
                    Stil & Schwierigkeitsgrad
                  </h3>
                  <p className="text-sm text-[#7A7A7A]">
                    Wie aufwändig sollen die Videos sein?
                  </p>
                </div>

                <div className="space-y-3">
                  {DIFFICULTY_OPTIONS.map(opt => {
                    const selected = data.difficulty === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => update({ difficulty: opt.id })}
                        className={`w-full p-4 rounded-[var(--vektrus-radius-md)] text-left transition-all duration-300 ${
                          selected
                            ? 'glass-panel shadow-elevated'
                            : 'glass-panel hover:shadow-card'
                        }`}
                        style={selected ? { border: `2px solid ${opt.color}` } : { border: '2px solid transparent' }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3.5 h-3.5 rounded-full flex-shrink-0 transition-transform duration-200"
                            style={{
                              backgroundColor: opt.color,
                              transform: selected ? 'scale(1.3)' : 'scale(1)',
                              boxShadow: selected ? `0 0 8px ${opt.color}40` : 'none',
                            }}
                          />
                          <div>
                            <p className="text-sm font-semibold text-[#111111]">
                              {opt.label}
                            </p>
                            <p className="text-xs text-[#7A7A7A] mt-0.5">{opt.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between p-4 rounded-[var(--vektrus-radius-md)] glass-panel">
                    <div>
                      <p className="text-sm font-semibold text-[#111111]">
                        Möchtest du dein Gesicht zeigen?
                      </p>
                      <p className="text-xs text-[#7A7A7A] mt-0.5">
                        {data.show_face
                          ? 'Talking-Head-Videos performen oft besser, sind aber nicht für jeden geeignet.'
                          : 'Wir wählen Formate die ohne Gesicht funktionieren.'
                        }
                      </p>
                    </div>
                    <button
                      onClick={() => update({ show_face: !data.show_face })}
                      className="relative w-11 h-6 rounded-full transition-all duration-200 flex-shrink-0 ml-4"
                      style={{
                        background: data.show_face
                          ? 'linear-gradient(135deg, #49B7E3 0%, #7C6CF2 100%)'
                          : '#E5E7EB',
                      }}
                    >
                      <div
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                          data.show_face ? 'translate-x-[22px]' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Generating Phase */}
            {phase === 'generating' && (
              <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                {error ? (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 15 }}
                      className="w-20 h-20 bg-[#FA7E70]/15 rounded-full flex items-center justify-center mb-6"
                    >
                      <X className="w-10 h-10 text-[#FA7E70]" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-[#111111] mb-3 font-manrope">
                      Generierung fehlgeschlagen
                    </h3>
                    <p className="text-sm text-[#7A7A7A] mb-6 max-w-md leading-relaxed">{error}</p>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleRetry}
                        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#49B7E3] to-[#B6EBF7] text-white rounded-[var(--vektrus-radius-md)] font-medium transition-all hover:scale-105"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Erneut versuchen</span>
                      </button>
                      <button
                        onClick={onClose}
                        className="px-5 py-3 text-sm text-[#7A7A7A] hover:text-[#111111] hover:bg-[#F4FCFE] rounded-[var(--vektrus-radius-md)] transition-colors"
                      >
                        Schließen
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                      className="w-20 h-20 pulse-gradient-icon rounded-full flex items-center justify-center mb-6 shadow-lg"
                    >
                      <Clapperboard className="w-10 h-10 text-white" />
                    </motion.div>

                    <AnimatePresence mode="wait">
                      <motion.p
                        key={generatingPhaseIdx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                        className="text-sm font-semibold text-[#111111] mb-2"
                      >
                        {GENERATING_PHASES[generatingPhaseIdx]}
                      </motion.p>
                    </AnimatePresence>

                    <p className="text-xs text-[#7A7A7A] mb-8">
                      Das kann 30–60 Sekunden dauern.
                    </p>

                    {/* Progress bar — Pulse Gradient */}
                    <div className="w-full max-w-xs">
                      <div className="w-full bg-[#F4FCFE] rounded-full h-2 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full relative overflow-hidden"
                          style={{
                            background: 'linear-gradient(90deg, #49B7E3 0%, #7C6CF2 40%, #E8A0D6 70%, #F4BE9D 100%)',
                            backgroundSize: '200% 100%',
                          }}
                          initial={{ width: '5%' }}
                          animate={{ width: '85%' }}
                          transition={{ duration: 45, ease: 'easeOut' }}
                        >
                          <motion.div
                            className="absolute inset-0 bg-white/30 rounded-full"
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.4 }}
                          />
                        </motion.div>
                      </div>
                    </div>

                    <div className="ai-typing-dots mt-6">
                      <span className="dot" />
                      <span className="dot" />
                      <span className="dot" />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Results Phase */}
            {phase === 'results' && (
              <ReelResultsView
                results={results}
                platforms={data.platforms}
              />
            )}
          </div>
        </div>

        {/* Footer — wizard phase, identical button pattern to WizardRoot */}
        {phase === 'wizard' && (
          <div className="px-6 py-4 border-t border-[rgba(73,183,227,0.10)] flex items-center justify-between flex-shrink-0">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 text-sm text-[#7A7A7A] hover:text-[#111111] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{currentStep === 0 ? 'Zurück zur Auswahl' : 'Zurück'}</span>
            </button>

            {currentStep < 2 ? (
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
                onClick={() => startGeneration()}
                disabled={!isStepValid(0) || !isStepValid(1)}
                className={`group/cta flex items-center space-x-2 px-6 py-3 rounded-[var(--vektrus-radius-sm)] font-semibold text-sm transition-all duration-300 ${
                  isStepValid(0) && isStepValid(1)
                    ? 'text-white hover:scale-[1.03] shadow-md hover:shadow-lg'
                    : 'bg-[#B6EBF7]/20 text-gray-400 cursor-not-allowed'
                }`}
                style={
                  isStepValid(0) && isStepValid(1)
                    ? { background: 'var(--vektrus-ai-violet)' }
                    : undefined
                }
                onMouseEnter={(e) => {
                  if (isStepValid(0) && isStepValid(1)) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #49B7E3 0%, #7C6CF2 33%, #E8A0D6 66%, #F4BE9D 100%)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isStepValid(0) && isStepValid(1)) {
                    e.currentTarget.style.background = 'var(--vektrus-ai-violet)';
                  }
                }}
              >
                <Sparkles className="w-4 h-4" />
                <span>Videos generieren</span>
              </button>
            )}
          </div>
        )}

        {/* Footer for results */}
        {phase === 'results' && (
          <div className="px-6 py-4 border-t border-[rgba(73,183,227,0.10)] flex items-center justify-end flex-shrink-0">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-[#7A7A7A] hover:text-[#111111] hover:bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] transition-colors"
            >
              Schließen
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReelWizard;
