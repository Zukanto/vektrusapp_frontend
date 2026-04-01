import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../ui/sidebar";
import { LayoutGrid, CalendarRange, TrendingUp, FolderOpen, Clapperboard, Fingerprint, CircleHelp, LogOut, User, Loader2, CheckCircle, XCircle, MessageSquare, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from '../../hooks/useAuth';
import { getDisplayName } from '../../lib/utils';
import { usePulseGeneration } from '../../hooks/usePulseGeneration';
import { MODULE_TO_PATH } from '../../routes';

interface VektrusSidebarProps {
  activeModule?: string;
  onModuleChange?: (module: string) => void;
}

export function VektrusSidebar({ activeModule = 'dashboard', onModuleChange }: VektrusSidebarProps) {
  const { signOut, user, userProfile } = useAuth();
  const pulse = usePulseGeneration();


  const [showDoneIndicator, setShowDoneIndicator] = useState(false);
  const doneStatus = pulse.progress.status;

  useEffect(() => {
    if ((doneStatus === 'completed' || doneStatus === 'partial' || doneStatus === 'failed') && !pulse.isGenerating && !pulse.popupOpen) {
      setShowDoneIndicator(true);
      const timer = setTimeout(() => setShowDoneIndicator(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [doneStatus, pulse.isGenerating, pulse.popupOpen]);

  const showFloatingIndicator = (pulse.isGenerating && !pulse.popupOpen) || showDoneIndicator;

  const ACTIVE_COLOR = '#49B7E3'; // Vektrus Blue for all active icons
  const INACTIVE_COLOR = '#7A7A7A';

  // Block 1 — no overline
  const coreLinks = [
    {
      label: "Dashboard",
      href: MODULE_TO_PATH.dashboard,
      icon: (
        <LayoutGrid
          className="h-5 w-5 flex-shrink-0"
          style={{ color: activeModule === 'dashboard' ? ACTIVE_COLOR : INACTIVE_COLOR }}
        />
      ),
      id: 'dashboard'
    },
    {
      label: "Chat",
      href: MODULE_TO_PATH.chat,
      icon: (
        <MessageSquare
          className="h-5 w-5 flex-shrink-0"
          style={{ color: activeModule === 'chat' ? ACTIVE_COLOR : INACTIVE_COLOR }}
        />
      ),
      id: 'chat'
    },
  ];

  // Block 2 — overline: WORKSPACE
  const workspaceLinks = [
    {
      label: "Pulse",
      href: MODULE_TO_PATH.pulse,
      icon: (
        <Zap
          className="h-5 w-5 flex-shrink-0"
          style={{ color: activeModule === 'pulse' ? ACTIVE_COLOR : INACTIVE_COLOR }}
        />
      ),
      id: 'pulse'
    },
    {
      label: "Studio",
      href: MODULE_TO_PATH.studio,
      icon: (
        <Clapperboard
          className="h-5 w-5 flex-shrink-0"
          style={{ color: activeModule === 'studio' ? ACTIVE_COLOR : INACTIVE_COLOR }}
        />
      ),
      id: 'studio'
    },
    {
      label: "Planner",
      href: MODULE_TO_PATH.planner,
      icon: (
        <CalendarRange
          className="h-5 w-5 flex-shrink-0"
          style={{ color: activeModule === 'planner' ? ACTIVE_COLOR : INACTIVE_COLOR }}
        />
      ),
      id: 'planner'
    },
  ];

  // Block 3 — overline: LIBRARY
  const libraryLinks = [
    {
      label: "Media",
      href: MODULE_TO_PATH.media,
      icon: (
        <FolderOpen
          className="h-5 w-5 flex-shrink-0"
          style={{ color: activeModule === 'media' ? ACTIVE_COLOR : INACTIVE_COLOR }}
        />
      ),
      id: 'media'
    },
    {
      label: "Brand DNA",
      href: MODULE_TO_PATH.brand,
      icon: (
        <Fingerprint
          className="h-5 w-5 flex-shrink-0"
          style={{ color: activeModule === 'brand' ? ACTIVE_COLOR : INACTIVE_COLOR }}
        />
      ),
      id: 'brand'
    },
    {
      label: "Insights",
      href: MODULE_TO_PATH.insights,
      icon: (
        <TrendingUp
          className="h-5 w-5 flex-shrink-0"
          style={{ color: activeModule === 'insights' ? ACTIVE_COLOR : INACTIVE_COLOR }}
        />
      ),
      id: 'insights'
    },
  ];

  const bottomLinks = [
    {
      label: "Hilfe",
      href: MODULE_TO_PATH.help,
      icon: (
        <CircleHelp
          className="h-5 w-5 flex-shrink-0"
          style={{ color: activeModule === 'help' ? ACTIVE_COLOR : INACTIVE_COLOR }}
        />
      ),
      id: 'help'
    },
    {
      label: "Abmelden",
      href: "#",
      icon: (
        <LogOut className="text-[#7A7A7A] h-5 w-5 flex-shrink-0" />
      ),
      id: 'logout'
    },
  ];

  const handleLinkClick = (linkId: string) => {
    if (linkId === 'logout') {
      signOut().then(() => {
        window.location.href = '/logged-out';
      });
    } else {
      onModuleChange?.(linkId);
    }
  };

  const handleIndicatorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    pulse.reopenPopup();
  };

  const [open, setOpen] = useState(false);

  return (
    <>
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <VektrusLogo /> : <VektrusLogoIcon />}
            {/* Block 1 — Core (no overline) */}
            <div className="mt-8 flex flex-col gap-1">
              {coreLinks.map((link, idx) => {
                const isActive = activeModule === link.id;
                return (
                  <div key={idx} onClick={() => handleLinkClick(link.id)} data-tour={link.id}>
                    <SidebarLink
                      link={link}
                      className={isActive ? 'sidebar-link-active' : ''}
                      style={isActive ? {
                        backgroundColor: 'rgba(73, 183, 227, 0.06)',
                        borderLeft: `2px solid ${ACTIVE_COLOR}`,
                      } : undefined}
                    />
                  </div>
                );
              })}
            </div>

            {/* Block 2 — Workspace */}
            <div className="mt-4 flex flex-col gap-1">
              {open && (
                <span className="px-2.5 pt-2 pb-1 text-[10px] font-manrope font-semibold uppercase tracking-[0.08em] text-[#7A7A7A] select-none">
                  Workspace
                </span>
              )}
              {workspaceLinks.map((link, idx) => {
                const isActive = activeModule === link.id;
                return (
                  <div key={idx} onClick={() => handleLinkClick(link.id)} data-tour={link.id}>
                    <SidebarLink
                      link={link}
                      className={isActive ? 'sidebar-link-active' : ''}
                      style={isActive ? {
                        backgroundColor: 'rgba(73, 183, 227, 0.06)',
                        borderLeft: `2px solid ${ACTIVE_COLOR}`,
                      } : undefined}
                    />
                  </div>
                );
              })}
            </div>

            {/* Block 3 — Library */}
            <div className="mt-4 flex flex-col gap-1">
              {open && (
                <span className="px-2.5 pt-2 pb-1 text-[10px] font-manrope font-semibold uppercase tracking-[0.08em] text-[#7A7A7A] select-none">
                  Library
                </span>
              )}
              {libraryLinks.map((link, idx) => {
                const isActive = activeModule === link.id;
                return (
                  <div key={idx} onClick={() => handleLinkClick(link.id)} data-tour={link.id}>
                    <SidebarLink
                      link={link}
                      className={isActive ? 'sidebar-link-active' : ''}
                      style={isActive ? {
                        backgroundColor: 'rgba(73, 183, 227, 0.06)',
                        borderLeft: `2px solid ${ACTIVE_COLOR}`,
                      } : undefined}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            {bottomLinks.map((link, idx) => {
              const isActive = activeModule === link.id;
              return (
                <div key={idx} onClick={() => link.id ? handleLinkClick(link.id) : undefined}>
                  <SidebarLink
                    link={link}
                    className={isActive ? 'sidebar-link-active' : ''}
                    style={isActive ? {
                      backgroundColor: 'rgba(73, 183, 227, 0.06)',
                      borderLeft: `2px solid ${ACTIVE_COLOR}`,
                    } : undefined}
                  />
                </div>
              );
            })}
            <div
              onClick={() => onModuleChange?.('toolhub')}
              className="cursor-pointer"
            >
              <SidebarLink
                link={{
                  label: (
                    <span className="flex items-center gap-1.5">
                      <span className="text-xs">Beta &middot; Feedback</span>
                      <span className="w-1.5 h-1.5 bg-[#49B7E3] rounded-full animate-pulse" />
                    </span>
                  ) as any,
                  href: MODULE_TO_PATH.toolhub,
                  icon: (
                    <MessageSquare className="h-3.5 w-3.5 flex-shrink-0 text-[#7A7A7A]" />
                  ),
                }}
              />
            </div>
            <div onClick={() => handleLinkClick('profile')} className="cursor-pointer">
              <SidebarLink
                link={{
                  label: getDisplayName(user, userProfile),
                  href: MODULE_TO_PATH.profile,
                  icon: (
                    <div className="w-7 h-7 bg-[#49B7E3] rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  ),
                }}
                className={activeModule === 'profile' ? 'sidebar-link-active' : ''}
                style={activeModule === 'profile' ? {
                  backgroundColor: 'rgba(73, 183, 227, 0.06)',
                  borderLeft: `2px solid ${ACTIVE_COLOR}`,
                } : undefined}
              />
            </div>
          </div>
        </SidebarBody>
      </Sidebar>

      <AnimatePresence>
        {showFloatingIndicator && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={handleIndicatorClick}
            title="Pulse-Status anzeigen"
            className="fixed bottom-5 left-5 z-[100] flex items-center space-x-2.5 px-4 py-3 bg-white rounded-[var(--vektrus-radius-lg)] shadow-elevated border border-[rgba(73,183,227,0.10)] cursor-pointer hover:shadow-modal hover:scale-[1.02] transition-all duration-200 group"
          >
            {pulse.isGenerating ? (
              <>
                <div className="w-8 h-8 bg-gradient-to-br from-[#49B7E3] to-[#B6EBF7] rounded-[var(--vektrus-radius-md)] flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-[#111111]">Pulse generiert</p>
                  <p className="text-[10px] text-[#7A7A7A]">
                    {pulse.progress.total > 0
                      ? `${pulse.progress.current}/${pulse.progress.total} Posts`
                      : 'Starte...'}
                  </p>
                </div>
              </>
            ) : doneStatus === 'completed' || doneStatus === 'partial' ? (
              <>
                <div className={`w-8 h-8 rounded-[var(--vektrus-radius-md)] flex items-center justify-center ${
                  doneStatus === 'completed'
                    ? 'bg-gradient-to-br from-[#49D69E] to-[#B4E8E5]'
                    : 'bg-gradient-to-br from-[#F4BE9D] to-[#F8D4BC]'
                }`}>
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-[#111111]">
                    {doneStatus === 'completed' ? 'Pulse fertig' : 'Teilweise fertig'}
                  </p>
                  <p className="text-[10px] text-[#7A7A7A]">
                    {pulse.progress.current} Posts erstellt
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 bg-gradient-to-br from-[#FA7E70] to-[#FCB0A6] rounded-[var(--vektrus-radius-md)] flex items-center justify-center">
                  <XCircle className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-[#111111]">Fehler</p>
                  <p className="text-[10px] text-[#7A7A7A]">Pulse fehlgeschlagen</p>
                </div>
              </>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}

export const VektrusLogo = () => {
  return (
    <a
      href="/toolhub"
      onClick={(e) => e.preventDefault()}
      className="font-normal flex items-center text-sm text-[#111111] py-1 relative z-20 border-b border-[rgba(73,183,227,0.10)]/60 pb-4"
    >
      <img
        src="https://res.cloudinary.com/dcgwtngml/image/upload/v1756215064/vektrus_H15_sp8eco.png"
        alt="Vektrus Logo"
        className="h-8 w-auto flex-shrink-0"
      />
    </a>
  );
};

/**
 * Collapsed sidebar logo — shows a compact symbol.
 * When a dedicated symbol-only Cloudinary asset becomes available,
 * swap the src here. Currently uses the combination mark cropped
 * via overflow to show the V-symbol portion.
 */
export const VektrusLogoIcon = () => {
  return (
    <a
      href="/toolhub"
      onClick={(e) => e.preventDefault()}
      className="flex items-center justify-center py-1 relative z-20 border-b border-[rgba(73,183,227,0.10)]/60 pb-4"
    >
      <div className="w-8 h-8 overflow-hidden flex-shrink-0 rounded-[var(--vektrus-radius-sm)]">
        <img
          src="https://res.cloudinary.com/dcgwtngml/image/upload/v1756215064/vektrus_H15_sp8eco.png"
          alt="Vektrus"
          className="h-8 w-auto max-w-none"
        />
      </div>
    </a>
  );
};
