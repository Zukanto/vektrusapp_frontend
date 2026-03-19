import React, { useState, useEffect } from 'react';
import { Lightbulb, FlaskConical, Construction, Loader2, Check, X, ArrowRight } from 'lucide-react';

type HintType = 'info' | 'demo' | 'wait';

interface BetaHintProps {
  type: HintType;
  title: string;
  description: string;
  dismissable?: boolean;
  storageKey?: string;
  linkLabel?: string;
  onLinkClick?: () => void;
  className?: string;
}

const typeConfig = {
  info: {
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    iconColor: 'text-cyan-500',
    titleColor: 'text-cyan-900',
    textColor: 'text-cyan-700',
    linkColor: 'text-cyan-600 hover:text-cyan-800',
    dismissColor: 'text-cyan-400 hover:text-cyan-600',
    Icon: Lightbulb,
  },
  demo: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconColor: 'text-amber-500',
    titleColor: 'text-amber-900',
    textColor: 'text-amber-700',
    linkColor: 'text-amber-700 hover:text-amber-900',
    dismissColor: 'text-amber-400 hover:text-amber-600',
    Icon: FlaskConical,
  },
  wait: {
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    iconColor: 'text-violet-500',
    titleColor: 'text-violet-900',
    textColor: 'text-violet-800',
    linkColor: 'text-violet-600 hover:text-violet-800',
    dismissColor: 'text-violet-400 hover:text-violet-600',
    Icon: Loader2,
  },
};

export const BetaHint: React.FC<BetaHintProps> = ({
  type,
  title,
  description,
  dismissable = false,
  storageKey,
  linkLabel,
  onLinkClick,
  className = '',
}) => {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (storageKey && localStorage.getItem(storageKey) === 'dismissed') {
      setDismissed(true);
    }
  }, [storageKey]);

  if (dismissed) return null;

  const config = typeConfig[type];
  const IconComponent = config.Icon;

  const handleDismiss = () => {
    setDismissed(true);
    if (storageKey) {
      localStorage.setItem(storageKey, 'dismissed');
    }
  };

  return (
    <div className={`${config.bg} border ${config.border} rounded-[var(--vektrus-radius-md)] p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <IconComponent
          className={`w-5 h-5 ${config.iconColor} mt-0.5 flex-shrink-0 ${type === 'wait' ? 'animate-spin' : ''}`}
        />
        <div className="flex-1 min-w-0">
          <p className={`font-medium ${config.titleColor}`}>{title}</p>
          <p className={`text-sm ${config.textColor} mt-1`}>{description}</p>
          {linkLabel && onLinkClick && (
            <button
              onClick={onLinkClick}
              className={`inline-flex items-center gap-1 text-sm font-medium ${config.linkColor} mt-2 transition-colors`}
            >
              {linkLabel}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {dismissable && (
          <button
            onClick={handleDismiss}
            className={`${config.dismissColor} transition-colors flex-shrink-0`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

interface PulseWaitHintProps {
  status: 'processing' | 'completed' | 'idle';
  onViewResults?: () => void;
  className?: string;
}

export const PulseWaitHint: React.FC<PulseWaitHintProps> = ({
  status,
  onViewResults,
  className = '',
}) => {
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (status === 'completed') {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  if (status === 'processing') {
    return (
      <div className={`bg-violet-50 border border-violet-200 rounded-[var(--vektrus-radius-md)] p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-violet-500 animate-spin flex-shrink-0" />
          <p className="text-sm text-violet-800">
            Dein Wochenplan wird erstellt -- das dauert ca. 3-5 Minuten. Du kannst die Seite verlassen, deine Ergebnisse werden automatisch gespeichert.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'completed' && showSuccess) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-[var(--vektrus-radius-md)] p-4 ${className}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-sm text-green-800 font-medium">Dein Wochenplan ist fertig!</p>
          </div>
          {onViewResults && (
            <button
              onClick={() => {
                onViewResults();
                setShowSuccess(false);
              }}
              className="inline-flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-800 transition-colors"
            >
              Ergebnisse ansehen
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
};
