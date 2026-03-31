import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { exitStudio } from './studioTransition';

interface StudioTopBarProps {
  title?: string;
  onAdoptToPlanner?: () => void;
}

const StudioTopBar: React.FC<StudioTopBarProps> = ({ title, onAdoptToPlanner }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    exitStudio(navigate, '/planner');
  };

  const handleAdopt = () => {
    if (onAdoptToPlanner) {
      onAdoptToPlanner();
    } else {
      exitStudio(navigate, '/planner');
    }
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 flex-shrink-0">
      {/* Left: Back button */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-[#FAFAFA]/70 hover:text-[#FAFAFA] transition-colors text-sm font-medium bg-transparent border-none cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Zurück zum Planner</span>
      </button>

      {/* Center: Title */}
      {title && (
        <span className="text-[#FAFAFA]/50 text-sm font-medium truncate max-w-[40%]">
          {title}
        </span>
      )}

      {/* Right: Primary CTA */}
      <button
        onClick={handleAdopt}
        className="px-5 py-2 bg-[#49B7E3] hover:bg-[#3aa5d1] text-white text-sm font-semibold rounded-[12px] transition-colors cursor-pointer"
      >
        In Planner übernehmen
      </button>
    </div>
  );
};

export default StudioTopBar;
