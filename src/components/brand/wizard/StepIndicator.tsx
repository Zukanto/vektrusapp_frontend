import React from 'react';
import { Check } from 'lucide-react';
import { WizardStep } from '../types';

interface StepIndicatorProps {
  currentStep: WizardStep;
}

const steps = [
  { label: 'Designs hochladen' },
  { label: 'Logo & Details' },
  { label: 'Analyse starten' },
];

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  return (
    <div className="flex items-center w-full max-w-md mx-auto mb-10">
      {steps.map((step, index) => {
        const stepNumber = (index + 1) as WizardStep;
        const isDone = stepNumber < currentStep;
        const isActive = stepNumber === currentStep;

        return (
          <React.Fragment key={stepNumber}>
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  isDone
                    ? 'bg-[#49D69E] text-white'
                    : isActive
                    ? 'bg-[#49B7E3] text-white'
                    : 'bg-white border-2 border-[rgba(73,183,227,0.25)] text-[#7A7A7A]'
                }`}
              >
                {isDone ? <Check className="w-4 h-4" /> : stepNumber}
              </div>
              <span
                className={`text-xs font-medium whitespace-nowrap ${
                  isActive ? 'text-[#111111]' : 'text-[#7A7A7A]'
                }`}
              >
                {step.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-3 mb-5 transition-all duration-300 ${
                  isDone ? 'bg-[#B6EBF7]' : 'bg-[rgba(73,183,227,0.18)]'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepIndicator;
