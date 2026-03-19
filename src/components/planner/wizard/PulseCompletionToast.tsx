import React, { useEffect, useState } from 'react';
import { X, Calendar, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type PulseToastVariant = 'success' | 'partial' | 'error' | 'timeout';

export interface PulseToastData {
  variant: PulseToastVariant;
  title: string;
  message: string;
  actionLabel: string;
}

interface PulseCompletionToastProps {
  data: PulseToastData;
  onAction: () => void;
  onDismiss: () => void;
}

const AUTO_DISMISS_MS = 15000;

const variantConfig: Record<PulseToastVariant, {
  accentColor: string;
  progressGradient: string;
  iconBg: string;
  icon: React.FC<{ className?: string }>;
  actionColor: string;
}> = {
  success: {
    accentColor: 'bg-[#7C6CF2]',
    progressGradient: 'from-[#49B7E3] via-[#7C6CF2] to-[#E8A0D6]',
    iconBg: 'from-[#49B7E3] via-[#7C6CF2] to-[#E8A0D6]',
    icon: Zap,
    actionColor: 'text-[#49B7E3] hover:text-[#3a9fd1]',
  },
  partial: {
    accentColor: 'bg-[#F4BE9D]',
    progressGradient: 'from-[#F4BE9D] to-[#F8D4BC]',
    iconBg: 'from-[#F4BE9D] to-[#F8D4BC]',
    icon: Zap,
    actionColor: 'text-[#E8A87C] hover:text-[#D4956A]',
  },
  error: {
    accentColor: 'bg-[#FA7E70]',
    progressGradient: 'from-[#FA7E70] to-[#FCB0A6]',
    iconBg: 'from-[#FA7E70] to-[#FCB0A6]',
    icon: Zap,
    actionColor: 'text-[#FA7E70] hover:text-[#E06A5E]',
  },
  timeout: {
    accentColor: 'bg-[#F4BE9D]',
    progressGradient: 'from-[#F4BE9D] to-[#F8D4BC]',
    iconBg: 'from-[#F4BE9D] to-[#49B7E3]',
    icon: Zap,
    actionColor: 'text-[#49B7E3] hover:text-[#3a9fd1]',
  },
};

const PulseCompletionToast: React.FC<PulseCompletionToastProps> = ({ data, onAction, onDismiss }) => {
  const [progress, setProgress] = useState(100);
  const config = variantConfig[data.variant];
  const IconComponent = config.icon;

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / AUTO_DISMISS_MS) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onDismiss();
      }
    }, 50);
    return () => clearInterval(interval);
  }, [onDismiss]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 80, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 80, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed top-5 right-5 z-[9999] w-[380px] bg-white rounded-[var(--vektrus-radius-lg)] shadow-modal border border-[rgba(73,183,227,0.10)] overflow-hidden"
      >
        <div
          className="absolute top-0 left-0 w-1 h-full"
          style={data.variant === 'success'
            ? { background: 'linear-gradient(180deg, #49B7E3 0%, #7C6CF2 50%, #E8A0D6 100%)' }
            : undefined
          }
        >
          {data.variant !== 'success' && <div className={`w-full h-full ${config.accentColor}`} />}
        </div>

        <div className="p-5 pl-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start space-x-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${config.iconBg} rounded-[var(--vektrus-radius-md)] flex items-center justify-center flex-shrink-0 shadow-sm`}>
                <IconComponent className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-[#111111]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {data.title}
                </h4>
                <p className="text-xs text-[#7A7A7A] mt-0.5 leading-relaxed">
                  {data.message}
                </p>
                <button
                  onClick={onAction}
                  className={`mt-2.5 flex items-center space-x-1.5 text-xs font-semibold ${config.actionColor} transition-colors group`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{data.actionLabel}</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                </button>
              </div>
            </div>
            <button
              onClick={onDismiss}
              className="p-1 text-[#7A7A7A] hover:text-[#111111] hover:bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="h-0.5 bg-[#F4FCFE]">
          <div
            className={`h-full bg-gradient-to-r ${config.progressGradient} transition-all duration-100 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PulseCompletionToast;
