import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { exitStudio } from './studioTransition';
import { supabase } from '../../lib/supabase';

interface StudioTopBarProps {
  title?: string;
  reelConceptId?: string;
  onAdoptToPlanner?: () => void;
  onThumbnailClick?: () => void;
}

const StudioTopBar: React.FC<StudioTopBarProps> = ({
  title,
  reelConceptId,
  onAdoptToPlanner,
  onThumbnailClick,
}) => {
  const navigate = useNavigate();
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  // Load thumbnail from reel concept
  useEffect(() => {
    if (!reelConceptId) return;
    let cancelled = false;

    const load = async () => {
      const { data } = await supabase
        .from('pulse_generated_content')
        .select('thumbnail_url')
        .eq('id', reelConceptId)
        .single();
      if (!cancelled && data?.thumbnail_url) {
        setThumbnailUrl(data.thumbnail_url);
      }
    };
    load();

    // Re-check periodically (thumbnail may be generated while on storyboard tab)
    const interval = setInterval(load, 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [reelConceptId]);

  const handleBack = () => {
    exitStudio(navigate, '/studio');
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
        <span>Zur Übersicht</span>
      </button>

      {/* Center: Title + Thumbnail Preview */}
      <div className="flex items-center gap-3">
        {thumbnailUrl && (
          <button
            onClick={onThumbnailClick}
            className="flex-shrink-0 rounded-lg overflow-hidden border border-[#FAFAFA]/10 hover:border-[#49B7E3]/40 transition-colors cursor-pointer"
            title="Thumbnail anzeigen"
          >
            <img
              src={thumbnailUrl}
              alt="Reel Thumbnail"
              className="w-[40px] h-[72px] object-cover"
              style={{ aspectRatio: '9/16' }}
            />
          </button>
        )}
        {title && (
          <span className="text-[#FAFAFA]/50 text-sm font-medium truncate max-w-[40%]">
            {title}
          </span>
        )}
      </div>

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
