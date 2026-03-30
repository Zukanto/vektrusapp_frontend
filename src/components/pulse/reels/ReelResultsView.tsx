import React from 'react';
import { Clapperboard } from 'lucide-react';
import { motion } from 'framer-motion';
import ReelConceptCard from './ReelConceptCard';
import PlatformIcon from '../../ui/PlatformIcon';
import { ReelContent } from '../../../services/reelService';

const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube_shorts: 'YouTube Shorts',
};

interface ReelResultsViewProps {
  results: any[];
  platforms: string[];
}

const ReelResultsView: React.FC<ReelResultsViewProps> = ({ results, platforms }) => {
  const reelItems: { id: string; content: ReelContent }[] = results
    .map(r => {
      const c = typeof r.content === 'string' ? (() => { try { return JSON.parse(r.content); } catch { return null; } })() : r.content;
      return c ? { id: r.id, content: c } : null;
    })
    .filter(Boolean) as { id: string; content: ReelContent }[];

  if (reelItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div
          className="w-16 h-16 rounded-[var(--vektrus-radius-md)] flex items-center justify-center mb-4"
          style={{ backgroundColor: 'rgba(124, 108, 242, 0.08)' }}
        >
          <Clapperboard className="w-7 h-7" style={{ color: 'var(--vektrus-ai-violet)' }} />
        </div>
        <p className="text-[15px] font-semibold text-[var(--vektrus-anthrazit)] mb-1">
          Keine Video-Konzepte gefunden
        </p>
        <p className="text-sm text-[var(--vektrus-gray)]">
          Die Generierung hat keine verwertbaren Ergebnisse geliefert.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-1">
          <h3 className="text-xl font-bold text-[var(--vektrus-anthrazit)] font-manrope">
            Deine Video-Konzepte
          </h3>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold text-white"
            style={{ backgroundColor: 'var(--vektrus-blue)' }}
          >
            {reelItems.length}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          {platforms.map(pid => (
            <span
              key={pid}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
              style={{ backgroundColor: 'var(--vektrus-mint)', color: 'var(--vektrus-blue)' }}
            >
              <PlatformIcon platform={pid} size={14} />
              {PLATFORM_LABELS[pid] || pid}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Cards */}
      <div className="space-y-5">
        {reelItems.map((item, i) => (
          <ReelConceptCard key={item.id || i} content={item.content} index={i} contentId={item.id} />
        ))}
      </div>
    </div>
  );
};

export default ReelResultsView;
