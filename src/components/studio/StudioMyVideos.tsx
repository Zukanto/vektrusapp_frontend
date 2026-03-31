import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Check,
  Download,
  Film,
  FolderOpen,
  Loader,
  X,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import type { StudioView } from './StudioDock';

interface VisionProject {
  id: string;
  product_name: string;
  user_description?: string;
  status: string;
  video_url?: string;
  clip_purpose?: string;
  created_at?: string;
}

const PURPOSE_LABELS: Record<string, string> = {
  b_roll: 'B-Roll',
  intro: 'Intro',
  outro: 'Outro',
  transition: 'Transition',
};

interface StudioMyVideosProps {
  onSwitchView?: (view: StudioView) => void;
}

const StudioMyVideos: React.FC<StudioMyVideosProps> = ({ onSwitchView }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<VisionProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<VisionProject | null>(null);

  const loadProjects = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    const { data } = await supabase
      .from('vision_projects')
      .select('id, product_name, user_description, status, video_url, clip_purpose, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setProjects(data as VisionProject[]);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Poll generating projects — use ref to avoid interval recreation on state changes
  const pendingIdsRef = useRef<string[]>([]);
  useEffect(() => {
    pendingIdsRef.current = projects
      .filter((p) => p.status === 'queued' || p.status === 'generating')
      .map((p) => p.id);
  }, [projects]);

  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(async () => {
      const ids = pendingIdsRef.current;
      if (ids.length === 0) return;

      const { data } = await supabase
        .from('vision_projects')
        .select('id, product_name, user_description, status, video_url, clip_purpose, created_at')
        .eq('user_id', user.id)
        .in('id', ids);

      if (data) {
        setProjects((prev) =>
          prev.map((p) => {
            const updated = (data as VisionProject[]).find((d) => d.id === p.id);
            return updated || p;
          })
        );
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [user?.id]);

  const formatRelativeDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Gerade eben';
    if (mins < 60) return `vor ${mins} Min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `vor ${hours} Std`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `vor ${days} Tagen`;
    return new Date(dateStr).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusInfo = (status: string) => {
    if (status === 'finished')
      return { label: 'Fertig', color: '#49D69E', icon: <Check className="w-3 h-3" /> };
    if (status === 'generating' || status === 'queued')
      return {
        label: 'Wird generiert',
        color: '#7C6CF2',
        icon: <Loader className="w-3 h-3 animate-spin" />,
      };
    if (status.startsWith('failed'))
      return { label: 'Fehlgeschlagen', color: '#FA7E70', icon: <X className="w-3 h-3" /> };
    return { label: status, color: '#7A7A7A', icon: null };
  };

  const handleCardClick = (project: VisionProject) => {
    if (project.status === 'finished' && project.video_url) {
      setSelectedProject(project);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto studio-scrollbar px-6 py-8">
        <h2 className="text-2xl font-manrope font-bold text-[#FAFAFA] mb-6">
          Meine Videos
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="aspect-[9/16] rounded-2xl bg-[#121214] animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (projects.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-16 h-16 rounded-full bg-[#49B7E3]/10 flex items-center justify-center mb-5">
          <FolderOpen className="w-8 h-8 text-[#49B7E3]/40" />
        </div>
        <h3 className="font-manrope font-bold text-xl text-[#FAFAFA] mb-2">
          Noch keine Videos erstellt
        </h3>
        <p className="text-[#FAFAFA]/40 text-sm mb-6 text-center max-w-sm">
          Wechsle zum B-Roll Studio und generiere deinen ersten Clip.
        </p>
        <button
          onClick={() => onSwitchView?.('b-roll')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#49B7E3] text-white hover:bg-[#3aa5d1] transition-colors cursor-pointer"
        >
          <Film className="w-4 h-4" />
          Zum B-Roll Studio
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto studio-scrollbar px-6 py-8">
      <h2 className="text-2xl font-manrope font-bold text-[#FAFAFA] mb-6">
        Meine Videos
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
        {projects.map((project) => {
          const statusInfo = getStatusInfo(project.status);
          const isFinished = project.status === 'finished' && project.video_url;

          return (
            <button
              key={project.id}
              onClick={() => handleCardClick(project)}
              className={`group relative aspect-[9/16] rounded-2xl overflow-hidden text-left transition-all ${
                isFinished
                  ? 'cursor-pointer hover:ring-2 hover:ring-[#49B7E3]/40'
                  : 'cursor-default'
              }`}
              style={{ backgroundColor: '#121214' }}
            >
              {/* Video preview */}
              {isFinished && (
                <video
                  src={project.video_url}
                  muted
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}

              {/* Generating glow */}
              {(project.status === 'generating' || project.status === 'queued') && (
                <div className="absolute inset-0 studio-generating-glow flex items-center justify-center">
                  <div className="text-center">
                    <Loader className="w-6 h-6 text-[#7C6CF2] animate-spin mx-auto mb-2" />
                    <p className="text-[11px] text-[#FAFAFA]/30">Wird generiert...</p>
                  </div>
                </div>
              )}

              {/* Failed overlay */}
              {project.status.startsWith('failed') && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <X className="w-6 h-6 text-[#FA7E70]/40 mx-auto mb-1" />
                    <p className="text-[11px] text-[#FA7E70]/60">Fehlgeschlagen</p>
                  </div>
                </div>
              )}

              {/* Gradient overlay for info */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

              {/* Bottom info */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-[12px] text-[#FAFAFA]/80 font-medium truncate mb-1.5">
                  {project.product_name}
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                    style={{
                      backgroundColor: `${statusInfo.color}15`,
                      color: statusInfo.color,
                    }}
                  >
                    {statusInfo.icon}
                    {statusInfo.label}
                  </span>
                  {project.clip_purpose && (
                    <span className="text-[10px] text-[#FAFAFA]/30">
                      {PURPOSE_LABELS[project.clip_purpose] || project.clip_purpose}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-[#FAFAFA]/20 mt-1">
                  {formatRelativeDate(project.created_at)}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Video Player Overlay */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(9,9,11,0.95)' }}
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="relative max-w-lg w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute -top-10 right-0 text-[#FAFAFA]/40 hover:text-[#FAFAFA] transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Video */}
            <div className="rounded-2xl overflow-hidden bg-black">
              <video
                src={selectedProject.video_url}
                controls
                autoPlay
                playsInline
                className="w-full"
              />
            </div>

            {/* Info + actions */}
            <div className="flex items-center justify-between mt-4">
              <div>
                <p className="text-sm text-[#FAFAFA] font-medium">
                  {selectedProject.product_name}
                </p>
                <p className="text-[11px] text-[#FAFAFA]/30 mt-0.5">
                  {formatRelativeDate(selectedProject.created_at)}
                </p>
              </div>
              <a
                href={selectedProject.video_url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-[#FAFAFA]/60 hover:text-[#FAFAFA] border border-[#FAFAFA]/10 hover:border-[#FAFAFA]/20 transition-colors bg-transparent"
              >
                <Download className="w-4 h-4" />
                Herunterladen
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudioMyVideos;
