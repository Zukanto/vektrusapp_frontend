import React, { useState, useEffect } from 'react';
import { Rocket, Check, Loader2, Clock, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface RoadmapItem {
  id: string;
  title: string;
  related_tool: string;
  status: 'done' | 'in_progress' | 'planned';
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

const TOOL_BADGE_COLORS: Record<string, string> = {
  chat: 'bg-[#49B7E3]/10 text-[#49B7E3]',
  pulse: 'bg-[#49D69E]/10 text-[#49D69E]',
  planner: 'bg-[#49B7E3]/10 text-[#49B7E3]',
  analytics: 'bg-[rgba(124,108,242,0.08)] text-[var(--vektrus-ai-violet)]',
  image: 'bg-[#F4BE9D]/10 text-[#D4864A]',
  profile: 'bg-[rgba(124,108,242,0.08)] text-[var(--vektrus-ai-violet)]',
  general: 'bg-[#F4FCFE] text-[#7A7A7A]',
};

export const RoadmapSection: React.FC = () => {
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadRoadmap = async () => {
    setLoading(true);
    setError(false);
    const { data, error: err } = await supabase
      .from('roadmap_items')
      .select('*')
      .order('sort_order');

    if (err) {
      setError(true);
    } else {
      setItems((data || []) as RoadmapItem[]);
    }
    setLoading(false);
  };

  useEffect(() => { loadRoadmap(); }, []);

  const done = items.filter((i) => i.status === 'done');
  const inProgress = items.filter((i) => i.status === 'in_progress');
  const planned = items.filter((i) => i.status === 'planned');

  if (loading) {
    return (
      <div className="mb-16">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Rocket className="w-5 h-5 text-[#49B7E3]" />
          <h2 className="text-2xl font-semibold text-[#111111]">Aktueller Entwicklungsstand</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-[var(--vektrus-radius-lg)] bg-[#F4FCFE] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-16">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Rocket className="w-5 h-5 text-[#49B7E3]" />
          <h2 className="text-2xl font-semibold text-[#111111]">Aktueller Entwicklungsstand</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-[#7A7A7A] mb-3">Konnte nicht geladen werden</p>
          <button onClick={loadRoadmap} className="flex items-center gap-2 mx-auto text-sm text-[#49B7E3] hover:text-[#3AA0CC] font-medium transition-colors">
            <RefreshCw className="w-4 h-4" />
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  const columns = [
    {
      title: 'Erledigt',
      icon: <Check className="w-4 h-4" />,
      badge: 'bg-[#49D69E]/10 text-[#49D69E] border-[#49D69E]/20',
      dotClass: 'bg-[#49D69E]',
      items: done,
    },
    {
      title: 'In Arbeit',
      icon: <Loader2 className="w-4 h-4" />,
      badge: 'bg-[#F4BE9D]/10 text-[#D4864A] border-[#F4BE9D]/20',
      dotClass: 'bg-[#F4BE9D] animate-pulse',
      items: inProgress,
    },
    {
      title: 'Geplant',
      icon: <Clock className="w-4 h-4" />,
      badge: 'bg-[#49B7E3]/10 text-[#49B7E3] border-[#49B7E3]/20',
      dotClass: 'bg-[rgba(73,183,227,0.25)]',
      items: planned,
    },
  ];

  return (
    <div className="mb-16">
      <div className="flex items-center justify-center gap-2 mb-8">
        <Rocket className="w-5 h-5 text-[#49B7E3]" />
        <h2 className="text-2xl font-semibold text-[#111111]">Aktueller Entwicklungsstand</h2>
      </div>

      <div className="bg-white rounded-[var(--vektrus-radius-lg)] border border-[rgba(73,183,227,0.10)] shadow-subtle overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[rgba(73,183,227,0.10)]">
          {columns.map((col) => (
            <div key={col.title} className="p-5">
              <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border mb-4 ${col.badge}`}>
                {col.icon}
                {col.title}
              </div>
              <div className="space-y-3">
                {col.items.map((item) => (
                  <div key={item.id} className={`flex items-start gap-2.5 ${col.title === 'Geplant' ? 'opacity-60' : ''}`}>
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${col.dotClass}`} />
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm text-[#111111] ${col.title === 'Erledigt' ? 'line-through text-[#7A7A7A]' : ''}`}>
                        {item.title}
                      </span>
                      {item.related_tool && (
                        <span className={`ml-2 inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-[var(--vektrus-radius-sm)] ${TOOL_BADGE_COLORS[item.related_tool] || TOOL_BADGE_COLORS.general}`}>
                          {TOOL_LABELS[item.related_tool] || item.related_tool}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {col.items.length === 0 && (
                  <p className="text-xs text-[#7A7A7A] italic">Keine Eintraege</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
