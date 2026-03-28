import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useOnboarding } from '../../hooks/useOnboarding';
import ProgressBar from './ProgressBar';
import StepCompanyInfo from './StepCompanyInfo';
import StepBrandProfile from './StepBrandProfile';
import StepConnectAccounts from './StepConnectAccounts';
import StepComplete from './StepComplete';

interface OnboardingWizardProps {
  initialStep?: number;
  initialData?: Record<string, any>;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ initialStep, initialData }) => {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const {
    currentStep,
    formData,
    saving,
    error,
    nextStep,
    prevStep,
    setStep,
    prefill,
    updateField,
    saveStep1,
    saveStep2,
    completeOnboarding,
  } = useOnboarding();

  const userId = user?.id || '';
  const userEmail = session?.user?.email || user?.email || '';

  // Track direction for slide animation
  const [direction, setDirection] = useState(1);
  const prevStepRef = useRef(currentStep);

  React.useEffect(() => {
    if (currentStep !== prevStepRef.current) {
      setDirection(currentStep > prevStepRef.current ? 1 : -1);
      prevStepRef.current = currentStep;
    }
  }, [currentStep]);

  // Apply initial step + prefill from page-level resume logic (once)
  const appliedRef = useRef(false);
  React.useEffect(() => {
    if (appliedRef.current) return;
    appliedRef.current = true;

    if (initialData && Object.keys(initialData).length > 0) {
      prefill(initialData);
    }
    if (initialStep && initialStep > 1) {
      setStep(initialStep);
    }
  }, [initialStep, initialData, prefill, setStep]);

  const handleComplete = async () => {
    const success = await completeOnboarding();
    if (success) {
      navigate('/dashboard', { replace: true });
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 24 : -24,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -24 : 24,
      opacity: 0,
    }),
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepCompanyInfo
            formData={formData}
            updateField={updateField}
            userEmail={userEmail}
            onNext={() => saveStep1(userId)}
            saving={saving}
          />
        );
      case 2:
        return (
          <StepBrandProfile
            formData={formData}
            updateField={updateField}
            onNext={() => saveStep2(userId)}
            onBack={prevStep}
            saving={saving}
          />
        );
      case 3:
        return (
          <StepConnectAccounts
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 4:
        return (
          <StepComplete
            formData={formData}
            onComplete={handleComplete}
            saving={saving}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--vektrus-mint)] flex items-start justify-center py-12 px-4 relative">
      {/* Subtle brand watermark */}
      <img
        src="/vektrus-logo.svg"
        alt=""
        aria-hidden
        className="fixed top-6 left-6 h-7 opacity-[0.12] pointer-events-none select-none"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />

      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/vektrus-logo.svg"
            alt="Vektrus"
            className="h-8 mx-auto"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>

        {/* Progress */}
        <ProgressBar currentStep={currentStep} />

        {/* Wizard card */}
        <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(73,183,227,0.08)] p-8 sm:p-10 overflow-hidden">
          {/* Global error */}
          {error && (
            <div className="mb-6 rounded-xl bg-[rgba(250,126,112,0.08)] border border-[rgba(250,126,112,0.15)] px-4 py-3 text-sm text-[var(--vektrus-error)]">
              {error}
            </div>
          )}

          {/* Animated step content */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
