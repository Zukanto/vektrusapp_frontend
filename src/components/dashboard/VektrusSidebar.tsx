import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../ui/sidebar";
import { ChartColumn, Calendar, MessageSquare, Image, CircleHelp, LogOut, User, Target, Sparkles, LayoutDashboard, Loader2, CheckCircle, XCircle, Zap, Palette } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from '../../hooks/useAuth';
import { useModuleColors } from '../../hooks/useModuleColors';
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

  const dashboardColors = useModuleColors('dashboard');
  const toolhubColors = useModuleColors('toolhub');
  const chatColors = useModuleColors('chat');
  const plannerColors = useModuleColors('planner');
  const pulseColors = useModuleColors('pulse');
  const insightsColors = useModuleColors('insights');
  const studioColors = useModuleColors('studio');
  const mediaColors = useModuleColors('media');
  const brandColors = useModuleColors('brand');
  const profileColors = useModuleColors('profile');
  const helpColors = useModuleColors('help');

  // Color lookup for active states — maps module ID to its colors
  const moduleColorMap: Record<string, ReturnType<typeof useModuleColors>> = {
    dashboard: dashboardColors,
    toolhub: toolhubColors,
    chat: chatColors,
    planner: plannerColors,
    pulse: pulseColors,
    insights: insightsColors,
    studio: studioColors,
    media: mediaColors,
    brand: brandColors,
    profile: profileColors,
    help: helpColors,
  };

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

  const links = [
    {
      label: "Dashboard",
      href: MODULE_TO_PATH.dashboard,
      icon: (
        <LayoutDashboard
          className="h-5 w-5 flex-shrink-0"
          style={{ color: activeModule === 'dashboard' ? dashboardColors.primary : '#7A7A7A' }}
        />
      ),
      id: 'dashboard'
    },
    {
      label: "Tool-Hub",
      href: MODULE_TO_PATH.toolhub,
      icon: (
        <Target
          className="h-5 w-5 flex-shrink-0"
          style={{ color: activeModule === 'toolhub' ? toolhubColors.primary : '#7A7A7A' }}
        />
      ),
      id: 'toolhub'
    },
    {
      label: "Chat",
      href: MODULE_TO_PATH.chat,
      icon: (
        <MessageSquare
          className="h-5 w-5 flex-shrink-0"
          style={{ color: activeModule === 'chat' ? chatColors.primary : '#7A7A7A' }}
        />
      ),
      id: 'chat'
    },
    {
      label: "Planner",
      href: MODULE_TO_PATH.planner,
      icon: (
        <Calendar
          className="h-5 w-5 flex-shrink-0"
          style={{ color: activeModule === 'planner' ? plannerColors.primary : '#7A7A7A' }}
        />
      ),
      id: 'planner'
    },
    {
      label: "Pulse",
      href: MODULE_TO_PATH.pulse,
      icon: activeModule === 'pulse' ? (
        <span className="h-5 w-5 flex-shrink-0 flex items-center justify-center">
          <Zap
            className="h-5 w-5"
            style={{
              fill: 'url(#pulse-gradient-sidebar)',
              stroke: 'url(#pulse-gradient-sidebar)',
            }}
          />
        </span>
      ) : (
        <Zap
          className="h-5 w-5 flex-shrink-0"
          style={{ color: '#7A7A7A' }}
        />
      ),
      id: 'pulse'
    },
    {
      label: "Insights",
      href: MODULE_TO_PATH.insights,
      icon: (
        <ChartColumn
          className="h-5 w-5 flex-shrink-0"
          style={{ color: activeModule === 'insights' ? insightsColors.primary : '#7A7A7A' }}
        />
      ),
      id: 'insights'
    },
    {
      label: "Studio",
      href: MODULE_TO_PATH.studio,
      icon: (
        <Sparkles
          className="h-5 w-5 flex-shrink-0"
          style={{ color: activeModule === 'studio' ? studioColors.primary : '#7A7A7A' }}
        />
      ),
      id: 'studio'
    },
    {
      label: "Media",
      href: MODULE_TO_PATH.media,
      icon: (
        <Image
          className="h-5 w-5 flex-shrink-0"
          style={{ color: activeModule === 'media' ? mediaColors.primary : '#7A7A7A' }}
        />
      ),
      id: 'media'
    },
    {
      label: "Brand Studio",
      href: MODULE_TO_PATH.brand,
      icon: (
        <Palette
          className="h-5 w-5 flex-shrink-0"
          style={{ color: activeModule === 'brand' ? brandColors.primary : '#7A7A7A' }}
        />
      ),
      id: 'brand'
    },
  ];

  const bottomLinks = [
    {
      label: "Hilfe",
      href: MODULE_TO_PATH.help,
      icon: (
        <CircleHelp
          className="h-5 w-5 flex-shrink-0"
          style={{ color: activeModule === 'help' ? helpColors.primary : '#7A7A7A' }}
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
      {/* SVG gradient definition for Pulse icon */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="pulse-gradient-sidebar" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#49B7E3" />
            <stop offset="33%" stopColor="#7C6CF2" />
            <stop offset="66%" stopColor="#E8A0D6" />
            <stop offset="100%" stopColor="#F4BE9D" />
          </linearGradient>
        </defs>
      </svg>
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <VektrusLogo /> : <VektrusLogoIcon />}
            <div className="mt-8 flex flex-col gap-1">
              {links.map((link, idx) => {
                const isActive = activeModule === link.id;
                const colors = moduleColorMap[link.id];
                const isPulse = link.id === 'pulse';
                return (
                  <div key={idx} onClick={() => handleLinkClick(link.id)} data-tour={link.id}>
                    <SidebarLink
                      link={link}
                      className={isActive ? 'sidebar-link-active' : ''}
                      style={isActive && colors ? (isPulse ? {
                        backgroundColor: 'rgba(124, 108, 242, 0.06)',
                        borderLeft: '2px solid transparent',
                        borderImage: 'linear-gradient(180deg, #49B7E3, #7C6CF2, #E8A0D6) 1',
                      } : {
                        backgroundColor: colors.hoverBg,
                        borderLeft: `2px solid ${colors.primary}`,
                      }) : undefined}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            {bottomLinks.map((link, idx) => {
              const isActive = activeModule === link.id;
              const colors = moduleColorMap[link.id];
              return (
                <div key={idx} onClick={() => link.id ? handleLinkClick(link.id) : undefined}>
                  <SidebarLink
                    link={link}
                    className={isActive ? 'sidebar-link-active' : ''}
                    style={isActive && colors ? {
                      backgroundColor: colors.hoverBg,
                      borderLeft: `2px solid ${colors.primary}`,
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
                  backgroundColor: profileColors.hoverBg,
                  borderLeft: `2px solid ${profileColors.primary}`,
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
