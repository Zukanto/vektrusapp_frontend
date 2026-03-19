import React from 'react';
import { CircleCheck as CheckCircle, Clock, TriangleAlert as AlertTriangle, Download, Palette, CircleMinus as MinusCircle, Image, Loader as Loader2 } from 'lucide-react';
import { DesignStatus } from './types';

interface DesignStatusConfig {
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  label: string;
  showRetry: boolean;
  showBrandStudio: boolean;
  showSkeleton: boolean;
}

function getDesignStatusConfig(status: DesignStatus | undefined): DesignStatusConfig {
  switch (status) {
    case 'pending':
      return {
        icon: <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: '#7C6CF2' }} />,
        color: '#F4BE9D',
        bgColor: '#FFF8F4',
        borderColor: 'rgba(244, 190, 157, 0.4)',
        label: 'Design wird erstellt...',
        showRetry: false,
        showBrandStudio: false,
        showSkeleton: true,
      };
    case 'success':
      return {
        icon: <CheckCircle className="w-3.5 h-3.5" style={{ color: '#49D69E' }} />,
        color: '#49D69E',
        bgColor: '#F0FBF5',
        borderColor: 'rgba(73, 214, 158, 0.3)',
        label: 'Design erstellt',
        showRetry: false,
        showBrandStudio: false,
        showSkeleton: false,
      };
    case 'failed_timeout':
      return {
        icon: <Clock className="w-3.5 h-3.5" style={{ color: '#FA7E70' }} />,
        color: '#FA7E70',
        bgColor: '#FFF5F4',
        borderColor: 'rgba(250, 126, 112, 0.3)',
        label: 'Design-Erstellung fehlgeschlagen',
        showRetry: true,
        showBrandStudio: false,
        showSkeleton: false,
      };
    case 'failed_generation':
      return {
        icon: <AlertTriangle className="w-3.5 h-3.5" style={{ color: '#FA7E70' }} />,
        color: '#FA7E70',
        bgColor: '#FFF5F4',
        borderColor: 'rgba(250, 126, 112, 0.3)',
        label: 'Design-Erstellung fehlgeschlagen',
        showRetry: true,
        showBrandStudio: false,
        showSkeleton: false,
      };
    case 'failed_download':
      return {
        icon: <Download className="w-3.5 h-3.5" style={{ color: '#FA7E70' }} />,
        color: '#FA7E70',
        bgColor: '#FFF5F4',
        borderColor: 'rgba(250, 126, 112, 0.3)',
        label: 'Design-Download fehlgeschlagen',
        showRetry: true,
        showBrandStudio: false,
        showSkeleton: false,
      };
    case 'failed_quality':
      return {
        icon: <AlertTriangle className="w-3.5 h-3.5" style={{ color: '#FA7E70' }} />,
        color: '#FA7E70',
        bgColor: '#FFF5F4',
        borderColor: 'rgba(250, 126, 112, 0.3)',
        label: 'Design-Qualität unzureichend',
        showRetry: true,
        showBrandStudio: false,
        showSkeleton: false,
      };
    case 'no_brand_profile':
      return {
        icon: <Palette className="w-3.5 h-3.5" style={{ color: '#7A7A7A' }} />,
        color: '#7A7A7A',
        bgColor: '#F4FCFE',
        borderColor: 'rgba(73, 183, 227, 0.2)',
        label: 'Kein Brand-Design',
        showRetry: false,
        showBrandStudio: true,
        showSkeleton: false,
      };
    case 'skipped':
      return {
        icon: <MinusCircle className="w-3.5 h-3.5" style={{ color: '#7A7A7A' }} />,
        color: '#7A7A7A',
        bgColor: '#F4FCFE',
        borderColor: 'rgba(122, 122, 122, 0.2)',
        label: 'Design übersprungen',
        showRetry: false,
        showBrandStudio: false,
        showSkeleton: false,
      };
    default:
      return {
        icon: <Image className="w-3.5 h-3.5" style={{ color: '#7A7A7A' }} />,
        color: '#7A7A7A',
        bgColor: '#F4FCFE',
        borderColor: 'rgba(122, 122, 122, 0.15)',
        label: 'Originalfoto',
        showRetry: false,
        showBrandStudio: false,
        showSkeleton: false,
      };
  }
}

interface DesignStatusBannerProps {
  status: DesignStatus | undefined;
  statusMessage?: string;
  onBrandStudio?: () => void;
}

export const DesignStatusBanner: React.FC<DesignStatusBannerProps> = ({
  status,
  statusMessage,
  onBrandStudio,
}) => {
  const config = getDesignStatusConfig(status);

  if (!status || status === 'success') return null;

  const isFailed = status === 'failed_timeout' || status === 'failed_generation' ||
    status === 'failed_download' || status === 'failed_quality';

  return (
    <div
      className="px-4 py-2.5 flex items-start gap-3 border-b"
      style={{ backgroundColor: config.bgColor, borderColor: config.borderColor }}
    >
      <div className="mt-0.5 flex-shrink-0">{config.icon}</div>
      <div className="flex-1 min-w-0">
        <p
          className="text-[11px] font-semibold mb-0.5"
          style={{ color: config.color }}
        >
          {config.label}
        </p>
        {statusMessage && (
          <p className="text-[11px] leading-relaxed" style={{ color: '#7A7A7A' }}>
            {statusMessage}
          </p>
        )}
        {isFailed && (
          <button
            disabled
            title="Kommt bald"
            className="mt-1.5 px-2.5 py-1 rounded-[var(--vektrus-radius-sm)] text-[10px] font-medium cursor-not-allowed opacity-60 border"
            style={{ color: '#49B7E3', borderColor: '#B6EBF7', backgroundColor: 'transparent' }}
          >
            Später erneut versuchen
          </button>
        )}
        {config.showBrandStudio && onBrandStudio && (
          <button
            onClick={onBrandStudio}
            className="mt-1.5 text-[11px] font-medium hover:underline transition-all"
            style={{ color: '#49B7E3' }}
          >
            Brand Studio einrichten →
          </button>
        )}
      </div>
    </div>
  );
};

interface DesignSkeletonProps {
  label?: string;
}

export const DesignSkeleton: React.FC<DesignSkeletonProps> = ({ label = 'Design wird erstellt...' }) => {
  return (
    <div className="w-full h-44 relative overflow-hidden flex flex-col items-center justify-center gap-2">
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, #E8E8E8 0%, #F4F4F4 50%, #E8E8E8 100%)',
          backgroundSize: '200% 100%',
          animation: 'design-shimmer 1.5s linear infinite',
        }}
      />
      {/* Keyframes in index.css: design-shimmer, pulse-dot */}
      <div className="relative z-10 flex flex-col items-center gap-2">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'rgba(124, 108, 242, 0.1)', animation: 'pulse-dot 2s ease-in-out infinite' }}
        >
          <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#7C6CF2' }} />
        </div>
        <span className="text-[11px] font-medium" style={{ color: '#7A7A7A' }}>{label}</span>
      </div>
    </div>
  );
};

export { getDesignStatusConfig };
export default DesignStatusBanner;
