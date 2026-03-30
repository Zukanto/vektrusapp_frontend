import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Clock,
  Sparkles,
  Check,
  X,
  Video as VideoIcon,
  Image as ImageIcon,
  MoreVertical,
} from 'lucide-react';
import { VisionProject } from './types';

interface VisionProjectListProps {
  projects: VisionProject[];
  loading: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: string;
  onStatusFilterChange: (s: string) => void;
  modelFilter: string;
  onModelFilterChange: (m: string) => void;
  onProjectClick: (p: VisionProject) => void;
  onDelete: (id: string) => void;
  onStartCreator: () => void;
}

const VisionProjectList: React.FC<VisionProjectListProps> = ({
  projects,
  loading,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  modelFilter,
  onModelFilterChange,
  onProjectClick,
  onDelete,
  onStartCreator,
}) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const getStatusBadge = (status: VisionProject['status']) => {
    const config: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
      queued: {
        label: 'In Warteschlange',
        cls: 'bg-[#F4FCFE] text-[#7A7A7A]',
        icon: <Clock className="w-3 h-3" />,
      },
      generating: {
        label: 'Wird generiert',
        cls: 'bg-[rgba(124,108,242,0.1)] text-[var(--vektrus-ai-violet)]',
        icon: <span className="w-2 h-2 bg-[var(--vektrus-ai-violet)] rounded-full animate-pulse inline-block" />,
      },
      finished: {
        label: 'Fertig',
        cls: 'bg-green-100 text-green-700',
        icon: <Check className="w-3 h-3" />,
      },
      failed: {
        label: 'Fehler',
        cls: 'bg-red-100 text-red-700',
        icon: <X className="w-3 h-3" />,
      },
      failed_timeout: {
        label: 'Timeout',
        cls: 'bg-red-100 text-red-700',
        icon: <X className="w-3 h-3" />,
      },
      failed_generation: {
        label: 'Fehler',
        cls: 'bg-red-100 text-red-700',
        icon: <X className="w-3 h-3" />,
      },
      failed_download: {
        label: 'Download-Fehler',
        cls: 'bg-red-100 text-red-700',
        icon: <X className="w-3 h-3" />,
      },
      draft: {
        label: 'Entwurf',
        cls: 'bg-[#F4FCFE] text-[#7A7A7A]',
        icon: null,
      },
    };
    const c = config[status] || config.draft;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${c.cls}`}>
        {c.icon}
        <span>{c.label}</span>
      </span>
    );
  };

  const PURPOSE_LABELS: Record<string, string> = {
    b_roll: 'B-Roll',
    intro: 'Intro',
    outro: 'Outro',
    transition: 'Transition',
  };

  const getModelBadge = (model?: string) => {
    if (!model) return null;
    const normalized = model === 'veo' ? 'Veo 3.1' : model;
    const config: Record<string, string> = {
      'Veo 3.1': 'bg-green-100 text-green-700',
      'Nano + Veo 3.1': 'bg-blue-100 text-blue-700',
      'Sora 2': 'bg-orange-100 text-orange-700',
    };
    return (
      <span
        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
          config[normalized] || 'bg-[#F4FCFE] text-[#7A7A7A]'
        }`}
      >
        {normalized}
      </span>
    );
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex-1 px-8 py-6">
        <div className="max-w-[1240px] mx-auto space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-[#B6EBF7]/20 rounded-[var(--vektrus-radius-md)] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 px-8 py-6">
      <div className="max-w-[1240px] mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A7A7A]/70" />
            <input
              type="text"
              placeholder="Suche nach Produkt, Beschreibung..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] text-sm focus:outline-none focus:border-[#49B7E3] focus:ring-2 focus:ring-[#49B7E3]/20"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="px-4 py-2.5 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] text-sm bg-white focus:outline-none focus:border-[#49B7E3] cursor-pointer"
          >
            <option value="all">Alle Status</option>
            <option value="queued">In Warteschlange</option>
            <option value="generating">Wird generiert</option>
            <option value="finished">Fertig</option>
            <option value="failed">Fehler</option>
          </select>
          <select
            value={modelFilter}
            onChange={(e) => onModelFilterChange(e.target.value)}
            className="px-4 py-2.5 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] text-sm bg-white focus:outline-none focus:border-[#49B7E3] cursor-pointer"
          >
            <option value="all">Alle Modelle</option>
            <option value="Veo 3.1">Veo 3.1</option>
            <option value="Nano + Veo 3.1">Nano + Veo 3.1</option>
            <option value="Sora 2">Sora 2</option>
          </select>
          <button
            onClick={onStartCreator}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-[var(--vektrus-ai-violet)] bg-white text-[var(--vektrus-ai-violet)] rounded-[var(--vektrus-radius-md)] text-sm font-medium hover:bg-[rgba(124,108,242,0.06)] transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Creator</span>
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white rounded-[var(--vektrus-radius-lg)] border border-[rgba(73,183,227,0.10)] p-16 text-center">
            <div className="w-20 h-20 rounded-full bg-[rgba(124,108,242,0.06)] flex items-center justify-center mx-auto mb-6">
              <VideoIcon className="w-10 h-10 text-[var(--vektrus-ai-violet)]/30" />
            </div>
            <h3 className="text-xl font-semibold text-[#111111] mb-2">Noch keine Videos</h3>
            <p className="text-[#7A7A7A] mb-6">
              Starte den Creator und erstelle dein erstes Video!
            </p>
            <button
              onClick={onStartCreator}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--vektrus-ai-violet)] text-white rounded-[var(--vektrus-radius-md)] font-semibold shadow-card hover:shadow-elevated transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Video erstellen</span>
            </button>
          </div>
        ) : (
          <div
            ref={menuRef}
            className="bg-white rounded-[var(--vektrus-radius-lg)] border border-[rgba(73,183,227,0.10)] overflow-hidden divide-y divide-[rgba(73,183,227,0.10)]"
          >
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => onProjectClick(project)}
                className="flex items-center px-6 py-4 hover:bg-[#F4FCFE] cursor-pointer transition-colors relative"
              >
                <div className="w-[20%] pr-4 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-[#111111] truncate">
                      {project.product_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-[#7A7A7A]/70 truncate">
                      {project.output_type || 'video'}
                    </span>
                    {project.clip_purpose && (
                      <span className="text-[10px] font-medium text-[#49B7E3] bg-[rgba(73,183,227,0.08)] px-1.5 py-0.5 rounded-full">
                        {PURPOSE_LABELS[project.clip_purpose] || project.clip_purpose}
                      </span>
                    )}
                    {project.generation_mode && (
                      <span className="text-[10px] font-medium text-[#7A7A7A] bg-[#F4FCFE] px-1.5 py-0.5 rounded-full">
                        {project.generation_mode === 'image_to_video' ? 'Bild → Video' : 'Text → Video'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-[12%] pr-4">
                  <div className="flex -space-x-2">
                    {(project.reference_images || []).slice(0, 3).map((img, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-[var(--vektrus-radius-sm)] border-2 border-white overflow-hidden flex-shrink-0"
                      >
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-[24%] pr-4 min-w-0">
                  <p className="text-sm text-[#7A7A7A] truncate">{project.user_description}</p>
                </div>

                <div className="w-[14%] pr-4">{getModelBadge(project.model_selection)}</div>

                <div className="w-[6%] pr-4 flex items-center gap-1 text-[#7A7A7A]/70">
                  <ImageIcon className="w-4 h-4" />
                  <VideoIcon className="w-4 h-4" />
                </div>

                <div className="w-[14%] pr-4">{getStatusBadge(project.status)}</div>

                <div className="w-[8%] pr-4">
                  <span className="text-sm text-[#7A7A7A]/70">{formatDate(project.created_at)}</span>
                </div>

                <div className="w-[2%] relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenu(openMenu === project.id ? null : project.id);
                    }}
                    className="p-1.5 hover:bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-[#7A7A7A]/70" />
                  </button>
                  {openMenu === project.id && (
                    <div className="absolute right-0 top-8 bg-white border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] shadow-elevated py-1 z-10 min-w-[160px]">
                      {project.status === 'finished' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onProjectClick(project);
                              setOpenMenu(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-[#111111] hover:bg-[#F4FCFE]"
                          >
                            Video ansehen
                          </button>
                          {project.video_url && (
                            <a
                              href={project.video_url}
                              download
                              onClick={(e) => e.stopPropagation()}
                              className="block px-4 py-2 text-sm text-[#111111] hover:bg-[#F4FCFE]"
                            >
                              Herunterladen
                            </a>
                          )}
                        </>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(project.id);
                          setOpenMenu(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Löschen
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VisionProjectList;
