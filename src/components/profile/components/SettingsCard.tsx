import React from 'react';

interface SettingsCardProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** Use 'danger' for destructive sections like account deletion */
  variant?: 'default' | 'danger';
}

/**
 * SettingsCard — reusable settings section container.
 * White surface, subtle shadow, brand-consistent border and radius.
 * Token-first: no hardcoded hex values.
 */
const SettingsCard: React.FC<SettingsCardProps> = ({
  title,
  description,
  action,
  children,
  className = '',
  variant = 'default',
}) => {
  const borderClass = variant === 'danger'
    ? 'border-[var(--vektrus-error)]'
    : 'border-[var(--vektrus-border-default)]';

  return (
    <div
      className={`
        bg-white
        rounded-[var(--vektrus-radius-md)]
        shadow-subtle
        border ${borderClass}
        ${className}
      `}
    >
      {/* Header — only rendered when title is provided */}
      {title && (
        <div className="flex items-start justify-between px-6 pt-6 pb-0">
          <div className="min-w-0">
            <h3
              className={`
                text-[15px] font-semibold font-manrope leading-tight
                ${variant === 'danger' ? 'text-[var(--vektrus-error)]' : 'text-[var(--vektrus-anthrazit)]'}
              `}
            >
              {title}
            </h3>
            {description && (
              <p className="text-sm text-[var(--vektrus-gray)] mt-1 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {action && (
            <div className="flex-shrink-0 ml-4">
              {action}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className={title ? 'px-6 pb-6 pt-4' : 'p-6'}>
        {children}
      </div>
    </div>
  );
};

export default SettingsCard;
