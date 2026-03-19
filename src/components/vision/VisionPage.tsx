import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../ui/toast';
import VisionHeader from './VisionHeader';
import VisionProjectList from './VisionProjectList';
import VisionCreatorWizard from './VisionCreatorWizard';
import VisionVideoPreview from './VisionVideoPreview';
import { VisionProject, WizardFormData } from './types';
import { DEMO_PROJECTS } from './visionDemoData';

const VisionPage: React.FC = () => {
  const { user, session } = useAuth();
  const { addToast } = useToast();
  const [projects, setProjects] = useState<VisionProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDemo, setShowDemo] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [previewProject, setPreviewProject] = useState<VisionProject | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modelFilter, setModelFilter] = useState('all');

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
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

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
        .in(
          'id',
          pendingProjects.map((p) => p.id)
        );

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

  const allProjects = showDemo ? [...projects, ...DEMO_PROJECTS] : projects;

  const filteredProjects = allProjects.filter((p) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !p.product_name?.toLowerCase().includes(q) &&
        !p.user_description?.toLowerCase().includes(q)
      )
        return false;
    }
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (modelFilter !== 'all' && p.model_selection !== modelFilter) return false;
    return true;
  });

  return (
    <div className="h-full flex flex-col bg-white overflow-auto">
      <VisionHeader onStartCreator={() => setShowWizard(true)} />

      <VisionProjectList
        projects={filteredProjects}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        modelFilter={modelFilter}
        onModelFilterChange={setModelFilter}
        onProjectClick={handleProjectClick}
        onDelete={handleDelete}
        onStartCreator={() => setShowWizard(true)}
        showDemo={showDemo}
        onToggleDemo={() => setShowDemo(!showDemo)}
      />

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
