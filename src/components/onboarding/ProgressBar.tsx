import React from 'react';
import { Check, Building2, Sparkles, Share2, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  currentStep: number;
}

const STEPS = [
  { label: 'Unternehmen', icon: Building2 },
  { label: 'Markenprofil', icon: Sparkles },
  { label: 'Social Accounts', icon: Share2 },
  { label: 'Fertig', icon: Rocket },
];

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex items-center justify-center w-full max-w-xl mx-auto mb-10"
    >
      {STEPS.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isActive = stepNumber === currentStep;
        const Icon = step.icon;

        return (
          <React.Fragment key={stepNumber}>
            {/* Step circle + label */}
            <div className="flex flex-col items-center relative">
              <div
                className={`
                  w-10 h-10 flex items-center justify-center text-sm font-semibold
                  transition-all duration-300
                  ${isCompleted
                    ? 'rounded-full bg-[var(--vektrus-success)] text-white'
                    : isActive
                      ? 'rounded-full bg-[var(--vektrus-blue)] text-white shadow-[0_2px_12px_rgba(73,183,227,0.3)]'
                      : 'rounded-full bg-[rgba(73,183,227,0.08)] text-[var(--vektrus-gray)]'
                  }
                `}
              >
                {isCompleted ? (
                  <Check className="w-4.5 h-4.5" />
                ) : (
                  <Icon className="w-[18px] h-[18px]" />
                )}
              </div>
              <span
                className={`
                  mt-2.5 text-[11px] font-semibold whitespace-nowrap tracking-wide
                  transition-colors duration-200
                  ${isActive
                    ? 'text-[var(--vektrus-blue)]'
                    : isCompleted
                      ? 'text-[var(--vektrus-success)]'
                      : 'text-[var(--vektrus-gray)]'
                  }
                `}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {index < STEPS.length - 1 && (
              <div className="flex-1 mx-3 self-start translate-y-5 relative h-[2px] rounded-full bg-[rgba(73,183,227,0.10)] overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-[var(--vektrus-success)] rounded-full"
                  initial={{ width: '0%' }}
                  animate={{
                    width: stepNumber < currentStep ? '100%' : '0%',
                  }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </motion.div>
  );
};

export default ProgressBar;
