import React from 'react';

interface SettingsToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

/**
 * SettingsToggle — labeled toggle switch for settings pages.
 * Label + description on the left, toggle on the right.
 * Uses Vektrus Blue for the active state. Token-first.
 */
const SettingsToggle: React.FC<SettingsToggleProps> = ({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}) => {
  const toggleId = React.useId();

  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div className="min-w-0">
        <label
          htmlFor={toggleId}
          className="text-sm font-medium text-[var(--vektrus-anthrazit)] cursor-pointer"
        >
          {label}
        </label>
        {description && (
          <p className="text-[13px] text-[var(--vektrus-gray)] mt-0.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <button
        id={toggleId}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`
          relative flex-shrink-0
          w-10 h-[22px] rounded-full
          transition-colors duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vektrus-blue-light)] focus-visible:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${checked ? 'bg-[var(--vektrus-blue)]' : 'bg-[var(--vektrus-neutral)]'}
        `}
      >
        <span
          className={`
            block w-[18px] h-[18px] rounded-full bg-white
            shadow-subtle
            transition-transform duration-200
            ${checked ? 'translate-x-[20px]' : 'translate-x-[2px]'}
            mt-[2px]
          `}
        />
      </button>
    </div>
  );
};

export default SettingsToggle;
