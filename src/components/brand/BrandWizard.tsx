import React, { useState } from 'react';
import { Brush, ArrowLeft, Sparkles, ArrowRight, Loader as Loader2 } from 'lucide-react';
import StepIndicator from './wizard/StepIndicator';
import Step1Upload from './wizard/Step1Upload';
import Step2Details from './wizard/Step2Details';
import Step3Start from './wizard/Step3Start';
import { WizardData, WizardStep } from './types';

interface BrandWizardProps {
  userId: string;
  onStartAnalysis: (data: WizardData) => void;
}

const defaultWizardData: WizardData = {
  designs: [],
  slogan: '',
  primaryColor: '',
  secondaryColor: '',
  visualStyle: '',
  addressing: '',
  referenzConfirmed: false,
  headingFont: '',
  bodyFont: '',
};

const BrandWizard: React.FC<BrandWizardProps> = ({ userId, onStartAnalysis }) => {
  const [step, setStep] = useState<WizardStep>(1);
  const [wizardData, setWizardData] = useState<WizardData>(defaultWizardData);

  const updateData = (patch: Partial<WizardData> | ((prev: WizardData) => Partial<WizardData>)) => {
    if (typeof patch === 'function') {
      setWizardData((prev) => ({ ...prev, ...patch(prev) }));
    } else {
      setWizardData((prev) => ({ ...prev, ...patch }));
    }
  };

  const isUploading = wizardData.designs.some((d) => !d.uploaded && !d.error);

  const canAdvance = () => {
    if (step === 1) {
      return wizardData.designs.length > 0 && !isUploading && wizardData.referenzConfirmed;
    }
    if (step === 3) {
      return wizardData.designs.length > 0;
    }
    return true;
  };

  const handleNext = () => {
    if (step < 3) setStep((step + 1) as WizardStep);
    else onStartAnalysis(wizardData);
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as WizardStep);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-shrink-0 px-8 pt-8 pb-6 border-b border-[rgba(73,183,227,0.18)] bg-white">
        <div className="max-w-[1240px] mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-[var(--vektrus-radius-sm)] bg-[#E6F7FD] flex items-center justify-center">
              <Brush className="w-5 h-5 text-[#49B7E3]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#111111] font-manrope">Brand Studio</h1>
              <p className="text-sm text-[#7A7A7A]">
                Lade bestehende Designs hoch – Vektrus erkennt deinen Stil.
              </p>
            </div>
          </div>
          <StepIndicator currentStep={step} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-[640px] mx-auto">
          {step === 1 && (
            <Step1Upload wizardData={wizardData} onChange={updateData} userId={userId} />
          )}
          {step === 2 && (
            <Step2Details wizardData={wizardData} onChange={updateData} userId={userId} />
          )}
          {step === 3 && <Step3Start wizardData={wizardData} />}
        </div>
      </div>

      <div className="flex-shrink-0 px-8 py-5 border-t border-[rgba(73,183,227,0.18)] bg-white">
        <div className="max-w-[640px] mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="flex items-center gap-2 text-sm text-[#7A7A7A] hover:text-[#111111] disabled:opacity-0 disabled:pointer-events-none transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück
          </button>

          <button
            onClick={handleNext}
            disabled={!canAdvance()}
            className={`flex items-center gap-2 px-6 py-3 rounded-[var(--vektrus-radius-sm)] text-sm font-semibold transition-all duration-200 ${
              step === 3
                ? canAdvance()
                  ? 'bg-[var(--vektrus-ai-violet)] text-white hover:bg-[#6B5BD6] hover:shadow-elevated shadow-card'
                  : 'bg-[#F4FCFE] text-[#7A7A7A] cursor-not-allowed'
                : !canAdvance()
                ? 'bg-[#F4FCFE] text-[#7A7A7A] cursor-not-allowed'
                : 'bg-[#49B7E3] text-white hover:bg-[#2E9FD0] hover:shadow-elevated shadow-card'
            }`}
          >
            {step === 1 && isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Hochladen...
              </>
            ) : step === 3 ? (
              <>
                <Sparkles className="w-4 h-4" />
                Analyse starten
              </>
            ) : (
              <>
                Weiter
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrandWizard;
