import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import {
  Video,
  Film,
  Image as ImageIcon,
  FolderOpen,
  Clock,
  Camera,
  User,
  Loader,
  Sparkles,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../ui/toast';
import VisionProjectList from './VisionProjectList';
import VisionCreatorWizard from './VisionCreatorWizard';
import VisionVideoPreview from './VisionVideoPreview';
import { VisionProject, WizardFormData } from './types';
import type { ReelContent } from '../../services/reelService';

type TabId = 'reels' | 'b-roll' | 'thumbnails' | 'videos';

interface ReelConceptRow {
  id: string;
  content: ReelContent;
  created_at: string;
}

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'reels', label: 'Video-Konzepte', icon: <Film className="w-4 h-4" /> },
  { id: 'b-roll', label: 'B-Roll Studio', icon: <Video className="w-4 h-4" /> },
  { id: 'thumbnails', label: 'Thumbnails', icon: <ImageIcon className="w-4 h-4" /> },
  { id: 'videos', label: 'Meine Videos', icon: <FolderOpen className="w-4 h-4" /> },
];

const FORMAT_LABELS: Record<string, string> = {
  talking_head: 'Talking Head',
  produkt_showcase: 'Produkt-Showcase',
  tutorial: 'Tutorial',
  behind_the_scenes: 'Behind the Scenes',
  vorher_nachher: 'Vorher/Nachher',
  b_roll_montage: 'B-Roll Montage',
  listicle: 'Listicle',
};

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string }> = {
  einfach: { bg: 'rgba(73, 214, 158, 0.12)', text: '#49D69E' },
  mittel: { bg: 'rgba(244, 190, 157, 0.15)', text: '#c07a3a' },
  fortgeschritten: { bg: 'rgba(124, 108, 242, 0.12)', text: '#7C6CF2' },
};

const VisionPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>('reels');

  // Reel concepts state
  const [reelConcepts, setReelConcepts] = useState<ReelConceptRow[]>([]);
  const [reelLoading, setReelLoading] = useState(true);

  // Videos tab state (legacy VisionProjectList)
  const [projects, setProjects] = useState<VisionProject[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [previewProject, setPreviewProject] = useState<VisionProject | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modelFilter, setModelFilter] = useState('all');

  // Load reel concepts
  const loadReelConcepts = useCallback(async () => {
    if (!user?.id) return;
    setReelLoading(true);

    const { data } = await supabase
      .from('pulse_generated_content')
      .select('id, content, created_at')
      .eq('user_id', user.id)
      .eq('source', 'pulse_reels')
      .order('created_at', { ascending: false });

    if (data) {
      setReelConcepts(
        data
          .filter((row: any) => row.content?.type === 'reel')
          .map((row: any) => ({ id: row.id, content: row.content as ReelContent, created_at: row.created_at }))
      );
    }
    setReelLoading(false);
  }, [user?.id]);

  // Load vision projects (for videos tab)
  const loadProjects = useCallback(async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('vision_projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data && !error) {
      setProjects(data);
    }
    setProjectsLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadReelConcepts();
    loadProjects();
  }, [loadReelConcepts, loadProjects]);

  // Polling for pending vision projects
  useEffect(() => {
    const pendingProjects = projects.filter(
      (p) => p.status === 'queued' || p.status === 'generating'
    );
    if (pendingProjects.length === 0) return;

    const interval = setInterval(async () => {
      if (!user?.id) return;

      const { data } = await supabase
        .from('vision_projects')
        .select('*')
        .eq('user_id', user.id)
        .in('id', pendingProjects.map((p) => p.id));

      if (data) {
        setProjects((prev) =>
          prev.map((p) => {
            const updated = data.find((d) => d.id === p.id);
            if (updated) {
              if (p.status !== 'finished' && updated.status === 'finished') {
                addToast({
                  type: 'success',
                  title: 'Video fertig!',
                  description: `${updated.product_name} wurde erfolgreich generiert.`,
                  duration: 6000,
                });
              }
              return updated;
            }
            return p;
          })
        );
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [projects, user?.id, addToast]);

  const handleSubmit = async (formData: WizardFormData) => {
    if (!user?.id || !session) return;
    setSubmitting(true);

    try {
      const { data: project, error } = await supabase
        .from('vision_projects')
        .insert({
          user_id: user.id,
          product_name: formData.productName,
          user_description: formData.description,
          target_audience: formData.targetAudience,
          style_tags: formData.styleTags,
          extra_notes: formData.productFeatures,
          reference_images: formData.referenceImages.map((img) => ({ url: img.url })),
          model_selection: formData.modelSelection,
          output_type: 'video',
          status: 'queued',
        })
        .select()
        .single();

      if (error) throw error;

      try {
        await fetch('https://n8n.vektrus.ai/webhook/vektrus-vision', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.id,
            vision_project_id: project.id,
          }),
        });
      } catch {
        addToast({
          type: 'warning',
          title: 'Hinweis',
          description: 'Projekt erstellt, Generierung wird in Kürze gestartet.',
          duration: 4000,
        });
      }

      setShowWizard(false);
      setProjects((prev) => [project, ...prev]);
      addToast({
        type: 'success',
        title: 'Vision-Projekt gestartet!',
        description: 'Die Generierung dauert einige Minuten.',
        duration: 5000,
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Fehler',
        description: 'Projekt konnte nicht erstellt werden. Bitte versuche es erneut.',
        duration: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (projectId: string) => {
    const { error } = await supabase
      .from('vision_projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', user?.id);

    if (!error) {
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    }
  };

  const handleProjectClick = (project: VisionProject) => {
    if (project.status === 'finished') {
      setPreviewProject(project);
    }
  };

  const handleTabChange = (tab: TabId) => {
    if (tab === 'b-roll') {
      navigate('/vision/b-roll');
      return;
    }
    if (tab === 'thumbnails') {
      navigate('/vision/thumbnails');
      return;
    }
    setActiveTab(tab);
  };

  const normalizeModel = (m?: string) => {
    if (!m) return '';
    if (m === 'veo' || m === 'veo_image') return 'Veo 3.1';
    return m;
  };

  const filteredProjects = projects.filter((p) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!p.product_name?.toLowerCase().includes(q) && !p.user_description?.toLowerCase().includes(q))
        return false;
    }
    if (statusFilter !== 'all') {
      if (statusFilter === 'failed') {
        if (!p.status.startsWith('failed')) return false;
      } else if (p.status !== statusFilter) {
        return false;
      }
    }
    if (modelFilter !== 'all' && normalizeModel(p.model_selection) !== modelFilter) return false;
    return true;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="h-full flex flex-col bg-[var(--vektrus-mint)] overflow-auto">
      {/* Header */}
      <div className="px-6 md:px-8 pt-8 pb-0">
        <div className="max-w-[1240px] mx-auto">
          <div className="flex items-center space-x-4 mb-2">
            <div
              className="w-11 h-11 rounded-[var(--vektrus-radius-md)] flex items-center justify-center rotate-3 shadow-card"
              style={{ backgroundColor: '#EC4899' }}
            >
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#111111] font-manrope">Video-Werkstatt</h1>
              <p className="text-[#7A7A7A] text-sm mt-0.5">
                Konzipiere, produziere und plane deine Videos an einem Ort.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 md:px-8 pt-6 pb-0">
        <div className="max-w-[1240px] mx-auto">
          <div className="flex gap-1 overflow-x-auto border-b border-[rgba(73,183,227,0.10)]">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? 'border-[#EC4899] text-[#111111]'
                    : 'border-transparent text-[#7A7A7A] hover:text-[#111111] hover:border-[rgba(236,72,153,0.3)]'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 px-6 md:px-8 py-6">
        <div className="max-w-[1240px] mx-auto">
          {/* Reel-Konzepte Tab */}
          {activeTab === 'reels' && (
            <>
              {reelLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-48 bg-white rounded-[var(--vektrus-radius-md)] shadow-subtle animate-pulse"
                    />
                  ))}
                </div>
              ) : reelConcepts.length === 0 ? (
                <div className="bg-white rounded-[var(--vektrus-radius-lg)] border border-[rgba(73,183,227,0.10)] shadow-card p-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-[rgba(236,72,153,0.08)] flex items-center justify-center mx-auto mb-4">
                    <Film className="w-8 h-8 text-[#EC4899]/40" />
                  </div>
                  <h3 className="font-manrope font-bold text-lg text-[#111111] mb-2">
                    Noch keine Video-Konzepte
                  </h3>
                  <p className="text-[#7A7A7A] text-sm mb-6 max-w-md mx-auto">
                    Gehe zu Pulse → Video, um dein erstes Konzept zu generieren.
                  </p>
                  <button
                    onClick={() => navigate('/pulse')}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#49B7E3] text-white rounded-[var(--vektrus-radius-md)] font-semibold shadow-card hover:shadow-elevated transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    Zu Pulse
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {reelConcepts.map((row) => {
                    const c = row.content;
                    const diffColor = DIFFICULTY_COLORS[c.difficulty] || DIFFICULTY_COLORS.mittel;
                    return (
                      <button
                        key={row.id}
                        onClick={() => navigate(`/vision/reel/${row.id}`)}
                        className="bg-white rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.10)] shadow-subtle hover:shadow-card transition-all text-left p-5 group"
                      >
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F3F4F6] text-[#374151]">
                            {FORMAT_LABELS[c.format] || c.format}
                          </span>
                          <span
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold"
                            style={{ backgroundColor: diffColor.bg, color: diffColor.text }}
                          >
                            {c.difficulty}
                          </span>
                        </div>
                        <h3 className="font-manrope font-bold text-base text-[#111111] leading-snug mb-2 group-hover:text-[#EC4899] transition-colors">
                          {c.title}
                        </h3>
                        <div className="flex items-center gap-3 text-[11px] text-[#7A7A7A]">
                          <span className="inline-flex items-center gap-1">
                            <Camera className="w-3 h-3" />
                            {c.scenes.length} Szenen
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {c.total_duration_seconds}s
                          </span>
                          {c.needs_face && (
                            <span className="inline-flex items-center gap-1">
                              <User className="w-3 h-3" />
                              Gesicht
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#7A7A7A]/60 mt-2">{formatDate(row.created_at)}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Videos Tab */}
          {activeTab === 'videos' && (
            <VisionProjectList
              projects={filteredProjects}
              loading={projectsLoading}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              modelFilter={modelFilter}
              onModelFilterChange={setModelFilter}
              onProjectClick={handleProjectClick}
              onDelete={handleDelete}
              onStartCreator={() => setShowWizard(true)}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showWizard && (
          <VisionCreatorWizard
            onSubmit={handleSubmit}
            onClose={() => setShowWizard(false)}
            submitting={submitting}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {previewProject && (
          <VisionVideoPreview
            project={previewProject}
            onClose={() => setPreviewProject(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default VisionPage;
