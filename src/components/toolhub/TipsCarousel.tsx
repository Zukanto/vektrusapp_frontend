import React, { useState, useEffect, useRef } from 'react';
import { Lightbulb, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Tip {
  id: string;
  title: string;
  content: string;
  related_tool: string;
}

const TOOL_LABELS: Record<string, string> = {
  chat: 'Chat',
  pulse: 'Pulse',
  planner: 'Planner',
  analytics: 'Insights',
  image: 'Media',
  profile: 'Profil',
  general: 'Allgemein',
};

const TOOL_COLORS: Record<string, string> = {
  chat: 'bg-[#49B7E3]/10 text-[#49B7E3]',
  pulse: 'bg-[#49D69E]/10 text-[#49D69E]',
  planner: 'bg-[#49B7E3]/10 text-[#49B7E3]',
  analytics: 'bg-[rgba(124,108,242,0.08)] text-[var(--vektrus-ai-violet)]',
  image: 'bg-[#F4BE9D]/10 text-[#D4864A]',
  profile: 'bg-[rgba(124,108,242,0.08)] text-[var(--vektrus-ai-violet)]',
  general: 'bg-[#F4FCFE] text-[#7A7A7A]',
};

export const TipsCarousel: React.FC = () => {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadTips = async () => {
    setLoading(true);
    setError(false);
    const { data, error: err } = await supabase
      .from('tips')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (err) {
      setError(true);
    } else {
      setTips(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { loadTips(); }, []);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 320;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="mb-16">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Lightbulb className="w-5 h-5 text-[#F4BE9D]" />
          <h2 className="text-2xl font-semibold text-[#111111]">Tipps & Tricks</h2>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="min-w-[300px] h-40 rounded-[var(--vektrus-radius-lg)] bg-[#F4FCFE] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-16">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Lightbulb className="w-5 h-5 text-[#F4BE9D]" />
          <h2 className="text-2xl font-semibold text-[#111111]">Tipps & Tricks</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-[#7A7A7A] mb-3">Konnte nicht geladen werden</p>
          <button onClick={loadTips} className="flex items-center gap-2 mx-auto text-sm text-[#49B7E3] hover:text-[#3AA0CC] font-medium transition-colors">
            <RefreshCw className="w-4 h-4" />
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  if (tips.length === 0) return null;

  return (
    <div className="mb-16">
      <div className="flex items-center justify-center gap-2 mb-8">
        <Lightbulb className="w-5 h-5 text-[#F4BE9D]" />
        <h2 className="text-2xl font-semibold text-[#111111]">Tipps & Tricks</h2>
      </div>

      <div className="relative">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-card border border-[rgba(73,183,227,0.10)] flex items-center justify-center text-[#7A7A7A] hover:text-[#111111] transition-colors -ml-3"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div ref={scrollRef} className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 pb-2" style={{ scrollbarWidth: 'none' }}>
          {tips.map((tip) => (
            <div
              key={tip.id}
              className="min-w-[300px] max-w-[300px] snap-start bg-white rounded-[var(--vektrus-radius-lg)] shadow-subtle border border-[rgba(73,183,227,0.10)] p-5 flex flex-col"
            >
              <div className="flex items-start gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-[#F4BE9D] flex-shrink-0 mt-0.5" />
                <h3 className="font-semibold text-[#111111] text-sm leading-tight">{tip.title}</h3>
              </div>
              <p className="text-xs text-[#7A7A7A] leading-relaxed flex-1 mb-3">{tip.content}</p>
              <div>
                <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${TOOL_COLORS[tip.related_tool] || TOOL_COLORS.general}`}>
                  {TOOL_LABELS[tip.related_tool] || tip.related_tool}
                </span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-card border border-[rgba(73,183,227,0.10)] flex items-center justify-center text-[#7A7A7A] hover:text-[#111111] transition-colors -mr-3"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
