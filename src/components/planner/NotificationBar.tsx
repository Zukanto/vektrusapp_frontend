import React from 'react';
import { Lightbulb, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { useModuleColors } from '../../hooks/useModuleColors';

interface NotificationBarProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  type?: 'info' | 'warning' | 'success';
}

const NotificationBar: React.FC<NotificationBarProps> = ({
  message,
  actionLabel,
  onAction,
  onDismiss,
  type = 'info'
}) => {
  const colors = useModuleColors('planner');

  const getStyles = () => {
    switch (type) {
      case 'warning':
        return {
          bg: '#FEF3C7',
          border: '#F4BE9D',
          icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
          iconBg: '#FEF3C7'
        };
      case 'success':
        return {
          bg: 'rgba(73, 214, 158, 0.1)',
          border: 'rgba(73, 214, 158, 0.3)',
          icon: <CheckCircle className="w-4 h-4 text-[#49D69E]" />,
          iconBg: 'rgba(73, 214, 158, 0.1)'
        };
      default:
        return {
          bg: '#E6F6FB',
          border: '#B6EBF7',
          icon: <Lightbulb className="w-4 h-4" style={{ color: colors.primary }} />,
          iconBg: colors.primaryVeryLight
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className="px-6 py-3 border-b"
      style={{
        backgroundColor: styles.bg,
        borderBottomColor: styles.border
      }}
    >
      <div className="max-w-[1240px] mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: styles.iconBg }}
          >
            {styles.icon}
          </div>
          <span className="text-sm text-gray-700">
            <span className="font-semibold">Pulse-Tipp:</span> {message}
          </span>
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="text-sm font-medium underline transition-colors"
              style={{ color: colors.primary }}
            >
              {actionLabel}
            </button>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="w-6 h-6 flex items-center justify-center rounded-[var(--vektrus-radius-sm)] hover:bg-[#F4FCFE] transition-colors text-gray-500"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationBar;
