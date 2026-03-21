import React from 'react';
import { SETTINGS_TABS, type SettingsTabDefinition } from '../constants';

interface SettingsNavProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

/**
 * SettingsNav — left-side settings navigation.
 *
 * Desktop (lg+): vertical list in a white card, sticky.
 * Mobile (<lg): horizontal scrollable strip.
 *
 * Groups are separated by subtle dividers (identity / product / admin / control).
 * Active state: Mint White background + left Vektrus Blue accent bar.
 * Token-first: uses --vektrus-* CSS custom properties exclusively.
 */
const SettingsNav: React.FC<SettingsNavProps> = ({ activeTab, onTabChange }) => {
  const renderNavItem = (tab: SettingsTabDefinition, showDivider: boolean) => {
    const Icon = tab.icon;
    const isActive = activeTab === tab.id;

    return (
      <React.Fragment key={tab.id}>
        {showDivider && (
          <div className="my-1.5 mx-3 border-t border-[var(--vektrus-border-subtle)]" />
        )}
        <button
          onClick={() => onTabChange(tab.id)}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5
            rounded-[var(--vektrus-radius-sm)] text-left text-sm
            transition-colors duration-150 relative
            ${isActive
              ? 'bg-[var(--vektrus-mint)] text-[var(--vektrus-anthrazit)] font-medium'
              : 'text-[var(--vektrus-gray)] hover:text-[var(--vektrus-anthrazit)] hover:bg-[var(--vektrus-mint)]'
            }
          `}
        >
          {/* Active indicator bar */}
          {isActive && (
            <span
              className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-[var(--vektrus-blue)]"
              aria-hidden="true"
            />
          )}
          <Icon className="w-[18px] h-[18px] flex-shrink-0" />
          <span className="truncate">{tab.label}</span>
        </button>
      </React.Fragment>
    );
  };

  // Build items with group dividers
  let prevGroup: string | null = null;
  const navItems = SETTINGS_TABS.map((tab) => {
    const showDivider = prevGroup !== null && prevGroup !== tab.group;
    prevGroup = tab.group;
    return renderNavItem(tab, showDivider);
  });

  return (
    <>
      {/* Desktop navigation */}
      <div className="hidden lg:block w-60 flex-shrink-0">
        <nav
          className="
            sticky top-6
            bg-white
            rounded-[var(--vektrus-radius-md)]
            shadow-subtle
            border border-[var(--vektrus-border-default)]
            p-2
          "
        >
          {navItems}
        </nav>
      </div>

      {/* Mobile navigation — horizontal scroll strip */}
      <div className="lg:hidden -mx-6 px-6 mb-4">
        <nav
          className="flex gap-1 overflow-x-auto pb-2"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          } as React.CSSProperties}
        >
          {SETTINGS_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex items-center gap-2 px-3 py-2 whitespace-nowrap
                  rounded-[var(--vektrus-radius-sm)] text-sm
                  transition-colors duration-150 flex-shrink-0
                  border
                  ${isActive
                    ? 'bg-[var(--vektrus-mint)] text-[var(--vektrus-anthrazit)] font-medium border-[var(--vektrus-border-default)]'
                    : 'text-[var(--vektrus-gray)] hover:text-[var(--vektrus-anthrazit)] border-transparent hover:border-[var(--vektrus-border-subtle)]'
                  }
                `}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default SettingsNav;
