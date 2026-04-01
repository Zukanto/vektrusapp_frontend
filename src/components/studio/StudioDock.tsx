import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Clapperboard, Film, Image, FolderOpen } from 'lucide-react';

export type StudioView = 'storyboard' | 'b-roll' | 'thumbnails' | 'videos';

interface StudioDockItem {
  id: StudioView;
  icon: React.ReactNode;
  label: string;
  gradient: string;
  iconColor: string;
}

const dockItems: StudioDockItem[] = [
  {
    id: 'storyboard',
    icon: <Clapperboard className="h-5 w-5" />,
    label: 'Storyboard',
    gradient:
      'radial-gradient(circle, rgba(73,183,227,0.18) 0%, rgba(73,183,227,0.07) 50%, rgba(73,183,227,0) 100%)',
    iconColor: 'group-hover:text-[#49B7E3]',
  },
  {
    id: 'b-roll',
    icon: <Film className="h-5 w-5" />,
    label: 'B-Roll',
    gradient:
      'radial-gradient(circle, rgba(236,72,153,0.18) 0%, rgba(236,72,153,0.07) 50%, rgba(236,72,153,0) 100%)',
    iconColor: 'group-hover:text-[#EC4899]',
  },
  {
    id: 'thumbnails',
    icon: <Image className="h-5 w-5" />,
    label: 'Thumbnails',
    gradient:
      'radial-gradient(circle, rgba(244,190,157,0.18) 0%, rgba(244,190,157,0.07) 50%, rgba(244,190,157,0) 100%)',
    iconColor: 'group-hover:text-[#F4BE9D]',
  },
  {
    id: 'videos',
    icon: <FolderOpen className="h-5 w-5" />,
    label: 'Meine Videos',
    gradient:
      'radial-gradient(circle, rgba(73,214,158,0.18) 0%, rgba(73,214,158,0.07) 50%, rgba(73,214,158,0) 100%)',
    iconColor: 'group-hover:text-[#49D69E]',
  },
];

const itemVariants: Variants = {
  initial: { rotateX: 0, opacity: 1 },
  hover: { rotateX: -90, opacity: 0 },
};

const backVariants: Variants = {
  initial: { rotateX: 90, opacity: 0 },
  hover: { rotateX: 0, opacity: 1 },
};

const glowVariants: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  hover: {
    opacity: 1,
    scale: 2,
    transition: {
      opacity: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
      scale: { duration: 0.5, type: 'spring', stiffness: 300, damping: 25 },
    },
  },
};

const sharedTransition = {
  type: 'spring' as const,
  stiffness: 100,
  damping: 20,
  duration: 0.5,
};

interface StudioDockProps {
  activeView: StudioView;
  onViewChange: (view: StudioView) => void;
  className?: string;
}

const StudioDock: React.FC<StudioDockProps> = ({ activeView, onViewChange, className }) => {
  return (
    <div data-tour="studio-dock" className={`fixed bottom-4 left-0 right-0 flex justify-center z-50 ${className || ''}`}>
      <motion.nav
        className="w-fit mx-auto px-4 py-3 rounded-3xl bg-[#121214]/90 backdrop-blur-lg border border-[#FAFAFA]/[0.06] shadow-xl relative"
        initial="initial"
      >
        <ul className="flex items-center justify-center gap-3 relative z-10">
          {dockItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <motion.li key={item.id} className="relative">
                <motion.div
                  className="block rounded-2xl overflow-visible group relative cursor-pointer"
                  style={{ perspective: '600px' }}
                  whileHover="hover"
                  initial="initial"
                >
                  {/* Per-item glow */}
                  <motion.div
                    className="absolute inset-0 z-0 pointer-events-none rounded-2xl"
                    variants={glowVariants}
                    style={{
                      background: item.gradient,
                      opacity: 0,
                    }}
                  />

                  {/* Active indicator glow (always visible for active item) */}
                  {isActive && (
                    <div
                      className="absolute inset-0 z-0 pointer-events-none rounded-2xl"
                      style={{
                        background: item.gradient,
                        opacity: 0.7,
                        transform: 'scale(1.5)',
                      }}
                    />
                  )}

                  {/* Front-facing */}
                  <motion.button
                    onClick={() => onViewChange(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 relative z-10 bg-transparent border-none transition-colors rounded-2xl text-sm cursor-pointer ${
                      isActive ? 'text-[#FAFAFA]' : 'text-[#FAFAFA]/50 group-hover:text-[#FAFAFA]'
                    }`}
                    variants={itemVariants}
                    transition={sharedTransition}
                    style={{
                      transformStyle: 'preserve-3d',
                      transformOrigin: 'center bottom',
                    }}
                  >
                    <span
                      className={`transition-colors duration-300 ${
                        isActive ? item.iconColor.replace('group-hover:', '') : item.iconColor
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="font-medium">{item.label}</span>
                  </motion.button>

                  {/* Back-facing */}
                  <motion.button
                    onClick={() => onViewChange(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 absolute inset-0 z-10 bg-transparent border-none transition-colors rounded-2xl text-sm cursor-pointer ${
                      isActive ? 'text-[#FAFAFA]' : 'text-[#FAFAFA]/50 group-hover:text-[#FAFAFA]'
                    }`}
                    variants={backVariants}
                    transition={sharedTransition}
                    style={{
                      transformStyle: 'preserve-3d',
                      transformOrigin: 'center top',
                      transform: 'rotateX(90deg)',
                    }}
                  >
                    <span
                      className={`transition-colors duration-300 ${
                        isActive ? item.iconColor.replace('group-hover:', '') : item.iconColor
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="font-medium">{item.label}</span>
                  </motion.button>
                </motion.div>
              </motion.li>
            );
          })}
        </ul>
      </motion.nav>
    </div>
  );
};

export default StudioDock;
