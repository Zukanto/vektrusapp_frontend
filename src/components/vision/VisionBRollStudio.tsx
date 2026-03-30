import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  Download,
  Film,
  Image as ImageIcon,
  Info,
  Loader,
  RefreshCw,
  Rocket,
  Sparkles,
  Upload,
  Video,
  X,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { callN8n } from '../../lib/n8n';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../ui/toast';
import type { ReelContent } from '../../services/reelService';

type ClipPurpose = 'b_roll' | 'intro' | 'outro' | 'transition';
type ClipDuration = 4 | 6 | 8;
type Phase = 'form' | 'processing' | 'finished' | 'error';

const PURPOSE_OPTIONS: { id: ClipPurpose; label: string }[] = [
  { id: 'b_roll', label: 'B-Roll' },
  { id: 'intro', label: 'Intro' },
  { id: 'outro', label: 'Outro' },
  { id: 'transition', label: 'Transition' },
];

const DURATION_OPTIONS: { value: ClipDuration; label: string }[] = [
  { value: 4, label: '4s' },
  { value: 6, label: '6s' },
  { value: 8, label: '8s' },
];

interface ReelOption {
  id: string;
  title: string;
}

const FAILED_MESSAGES: Record<string, string> = {
  failed_timeout: 'Die Generierung hat zu lange gedauert. Bitte versuche es erneut.',
  failed_generation: 'Die Video-Generierung ist fehlgeschlagen. Bitte versuche es erneut.',
  failed_download: 'Das Video konnte nicht gespeichert werden. Bitte versuche es erneut.',
  failed: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.',
};

const VisionBRollStudio: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reelIdParam = searchParams.get('reelId');
  const { user } = useAuth();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [clipDescription, setClipDescription] = useState('');
  const [clipDuration, setClipDuration] = useState<ClipDuration>(6);
  const [clipPurpose, setClipPurpose] = useState<ClipPurpose>('b_roll');
  const [selectedReelId, setSelectedReelId] = useState<string>(reelIdParam || '');
  const [referenceImages, setReferenceImages] = useState<{ url: string; file?: File }[]>([]);

  // Reel options
  const [reelOptions, setReelOptions] = useState<ReelOption[]>([]);
  const [reelContext, setReelContext] = useState<{ title: string; format: string } | null>(null);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  // Processing state
  const [phase, setPhase] = useState<Phase>('form');
  const [submitting, setSubmitting] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Load available reel concepts for dropdown
  useEffect(() => {
    if (!user?.id) return;
    const loadReels = async () => {
      const { data } = await supabase
        .from('pulse_generated_content')
        .select('id, content')
        .eq('user_id', user.id)
        .eq('source', 'pulse_reels')
        .order('created_at', { ascending: false });

      if (data) {
        const options: ReelOption[] = data
          .filter((r: any) => r.content?.type === 'reel' && r.content?.title)
          .map((r: any) => ({ id: r.id, title: (r.content as ReelContent).title }));
        setReelOptions(options);
      }
    };
    loadReels();
  }, [user?.id]);

  // Load reel context when selected
  useEffect(() => {
    if (!selectedReelId) {
      setReelContext(null);
      return;
    }
    const loadContext = async () => {
      const { data } = await supabase
        .from('pulse_generated_content')
        .select('content')
        .eq('id', selectedReelId)
        .single();
      if (data?.content) {
        const c = data.content as ReelContent;
        setReelContext({ title: c.title, format: c.format });
      }
    };
    loadContext();
  }, [selectedReelId]);

  // Upload files to Supabase Storage
  const uploadFiles = async (files: File[]) => {
    if (!user?.id) return;
    setUploading(true);
    setUploadError('');
    const newImages: { url: string }[] = [];
    const maxFiles = 2 - referenceImages.length;

    for (const file of files.slice(0, maxFiles)) {
      if (file.size > 8 * 1024 * 1024) {
        setUploadError('Maximale Dateigröße: 8 MB');
        continue;
      }
      const ext = file.name.split('.').pop() || 'jpg';
      const filename = `vision/${user.id}/reference/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

      const { data, error } = await supabase.storage
        .from('user-images')
        .upload(filename, file, { contentType: file.type, upsert: false });

      if (!error && data) {
        const { data: urlData } = supabase.storage
          .from('user-images')
          .getPublicUrl(data.path);
        newImages.push({ url: urlData.publicUrl });
      } else if (error) {
        console.error('Upload error:', error);
        setUploadError('Upload fehlgeschlagen. Bitte versuche es erneut.');
      }
    }

    setReferenceImages((prev) => [...prev, ...newImages].slice(0, 2));
    setUploading(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) uploadFiles(Array.from(e.target.files));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) uploadFiles(Array.from(e.dataTransfer.files));
  };

  const removeImage = (index: number) => {
    setReferenceImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Polling
  const pollProject = useCallback(async (pid: string) => {
    const poll = async () => {
      const { data } = await supabase
        .from('vision_projects')
        .select('status, video_url, finished_at')
        .eq('id', pid)
        .single();

      if (!data) return;

      if (data.status === 'finished' && data.video_url) {
        setVideoUrl(data.video_url);
        setPhase('finished');
        addToast({ type: 'success', title: 'B-Roll fertig!', description: 'Dein Clip wurde generiert.', duration: 5000 });
        return;
      }

      if (data.status?.startsWith('failed')) {
        setErrorMessage(FAILED_MESSAGES[data.status] || FAILED_MESSAGES.failed);
        setPhase('error');
        return;
      }

      // Still processing — poll again
      setTimeout(() => poll(), 5000);
    };
    poll();
  }, [addToast]);

  // Submit
  const handleSubmit = async () => {
    if (!user?.id || clipDescription.trim().length < 5) return;
    setSubmitting(true);

    try {
      const generationMode = referenceImages.length > 0 ? 'image_to_video' : 'text_to_video';

      // 1. INSERT into vision_projects
      const { data: project, error: insertError } = await supabase
        .from('vision_projects')
        .insert({
          user_id: user.id,
          product_name: clipDescription.substring(0, 100),
          user_description: clipDescription,
          reference_images: referenceImages.length > 0
            ? referenceImages.map((img) => ({ url: img.url }))
            : null,
          model_selection: 'veo',
          status: 'queued',
          clip_purpose: clipPurpose,
          generation_mode: generationMode,
          reel_concept_id: selectedReelId || null,
        })
        .select()
        .single();

      if (insertError || !project) {
        console.error('INSERT FAILED:', JSON.stringify(insertError, null, 2));
        throw insertError || new Error('Insert fehlgeschlagen');
      }

      setProjectId(project.id);

      // 2. Call webhook
      try {
        await callN8n('vektrus-vision-broll', {
          user_id: user.id,
          vision_project_id: project.id,
          clip_description: clipDescription,
          clip_duration: clipDuration,
          clip_purpose: clipPurpose,
          reel_concept_id: selectedReelId || null,
          reference_images: referenceImages.map((img) => img.url),
        });
      } catch {
        addToast({
          type: 'warning',
          title: 'Hinweis',
          description: 'Projekt erstellt, Generierung wird in Kürze gestartet.',
          duration: 4000,
        });
      }

      // 3. Switch to processing + start polling
      setPhase('processing');
      pollProject(project.id);
    } catch {
      addToast({
        type: 'error',
        title: 'Fehler',
        description: 'Projekt konnte nicht erstellt werden.',
        duration: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setPhase('form');
    setProjectId(null);
    setVideoUrl(null);
    setErrorMessage('');
  };

  const canSubmit = clipDescription.trim().length >= 5;
  const generationMode = referenceImages.length > 0 ? 'image_to_video' : 'text_to_video';

  return (
    <div className="h-full flex flex-col bg-[var(--vektrus-mint)] overflow-auto">
      <div className="max-w-3xl mx-auto w-full px-6 md:px-8 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate('/vision')}
          className="flex items-center gap-2 text-sm text-[#7A7A7A] hover:text-[#111111] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück zur Video-Werkstatt
        </button>

        {/* Page header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <Film className="w-6 h-6 text-[#EC4899]" />
            <h1 className="text-2xl font-bold text-[#111111] font-manrope">B-Roll Studio</h1>
          </div>
          <p className="text-[#7A7A7A] text-sm">Erstelle Ergänzungsclips für deine Videos</p>
        </div>

        {/* === FORM PHASE === */}
        {phase === 'form' && (
          <div className="space-y-5">
            {/* Reel context banner */}
            {reelContext && (
              <div className="bg-white border border-[rgba(236,72,153,0.15)] rounded-[var(--vektrus-radius-md)] p-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-[#EC4899] flex-shrink-0" />
                <p className="text-sm text-[#111111]">
                  Kontext: <span className="font-semibold">{reelContext.title}</span>
                  <span className="text-[#7A7A7A] ml-1">({reelContext.format})</span>
                </p>
              </div>
            )}

            {/* Generation mode badge */}
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold ${
                  generationMode === 'image_to_video'
                    ? 'bg-[rgba(124,108,242,0.1)] text-[var(--vektrus-ai-violet)]'
                    : 'bg-[#F4FCFE] text-[#7A7A7A]'
                }`}
              >
                {generationMode === 'image_to_video' ? (
                  <><ImageIcon className="w-3 h-3" /> Bild → Video</>
                ) : (
                  <><Film className="w-3 h-3" /> Text → Video</>
                )}
              </span>
            </div>

            {/* Clip Description */}
            <div className="bg-white rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.10)] shadow-subtle p-5">
              <label className="block text-sm font-semibold text-[#111111] mb-1.5">
                Szenenbeschreibung *
              </label>
              <textarea
                value={clipDescription}
                onChange={(e) => setClipDescription(e.target.value.slice(0, 500))}
                placeholder="Beschreibe deine B-Roll-Szene, z.B. 'Dampfender Kaffee in Nahaufnahme, warmes Licht, Holztisch'"
                rows={4}
                className="w-full px-3 py-3 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] text-sm focus:outline-none focus:border-[#49B7E3] focus:ring-2 focus:ring-[#49B7E3]/20 resize-none"
              />
              <p className="text-xs text-[#7A7A7A]/70 mt-1">
                {clipDescription.length}/500 Zeichen · Min. 5 Zeichen
              </p>
            </div>

            {/* Duration + Purpose row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Clip Duration */}
              <div className="bg-white rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.10)] shadow-subtle p-5">
                <label className="block text-sm font-semibold text-[#111111] mb-3">Clip-Länge</label>
                <div className="flex gap-2">
                  {DURATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setClipDuration(opt.value)}
                      className={`flex-1 py-2.5 rounded-[var(--vektrus-radius-sm)] text-sm font-semibold transition-all ${
                        clipDuration === opt.value
                          ? 'bg-[var(--vektrus-ai-violet)] text-white shadow-card'
                          : 'bg-[#F4FCFE] text-[#111111] hover:bg-[rgba(73,183,227,0.08)]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clip Purpose */}
              <div className="bg-white rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.10)] shadow-subtle p-5">
                <label className="block text-sm font-semibold text-[#111111] mb-3">Clip-Typ</label>
                <div className="flex gap-2 flex-wrap">
                  {PURPOSE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setClipPurpose(opt.id)}
                      className={`px-4 py-2 rounded-[var(--vektrus-radius-sm)] text-sm font-medium transition-all ${
                        clipPurpose === opt.id
                          ? 'bg-[var(--vektrus-ai-violet)] text-white shadow-card'
                          : 'bg-[#F4FCFE] text-[#111111] hover:bg-[rgba(73,183,227,0.08)]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Reel Context Dropdown */}
            {reelOptions.length > 0 && (
              <div className="bg-white rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.10)] shadow-subtle p-5">
                <label className="block text-sm font-semibold text-[#111111] mb-1.5">
                  Für welches Video? <span className="font-normal text-[#7A7A7A]">(optional)</span>
                </label>
                <select
                  value={selectedReelId}
                  onChange={(e) => setSelectedReelId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] text-sm bg-white focus:outline-none focus:border-[#49B7E3] cursor-pointer"
                >
                  <option value="">Kein Video-Konzept</option>
                  {reelOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.title}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Reference Images Upload */}
            <div className="bg-white rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.10)] shadow-subtle p-5">
              <label className="block text-sm font-semibold text-[#111111] mb-1.5">
                Referenzbilder <span className="font-normal text-[#7A7A7A]">(optional, max. 2)</span>
              </label>
              <p className="text-xs text-[#7A7A7A] mb-3">
                Lade ein Startbild hoch, um dein Video davon animieren zu lassen. Mit zwei Bildern wird zwischen Start- und Endbild animiert.
              </p>

              {referenceImages.length < 2 && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-[var(--vektrus-radius-md)] p-8 text-center cursor-pointer transition-colors ${
                    dragOver
                      ? 'border-[var(--vektrus-ai-violet)] bg-[rgba(124,108,242,0.06)]'
                      : 'border-[rgba(73,183,227,0.18)] hover:border-[rgba(124,108,242,0.3)] hover:bg-[rgba(124,108,242,0.02)]'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {uploading ? (
                    <Loader className="w-8 h-8 text-[var(--vektrus-ai-violet)] mx-auto animate-spin" />
                  ) : (
                    <Upload className="w-8 h-8 text-[#7A7A7A]/40 mx-auto" />
                  )}
                  <p className="text-sm font-medium text-[#111111] mt-2">Bilder hochladen oder hierher ziehen</p>
                  <p className="text-xs text-[#7A7A7A]/70 mt-1">JPG, PNG, WebP · Max. 8 MB</p>
                </div>
              )}

              {uploadError && <p className="text-sm text-[#FA7E70] mt-2">{uploadError}</p>}

              {referenceImages.length > 0 && (
                <div className="flex gap-3 mt-3">
                  {referenceImages.map((img, i) => (
                    <div key={i} className="relative w-24 h-24 rounded-[var(--vektrus-radius-sm)] overflow-hidden border border-[rgba(73,183,227,0.10)]">
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 bg-white/90 rounded-full p-0.5 text-[#7A7A7A] hover:text-[#FA7E70] transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        {i === 0 ? 'Start' : 'Ende'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-[var(--vektrus-radius-md)] font-semibold transition-all ${
                canSubmit && !submitting
                  ? 'bg-[var(--vektrus-ai-violet)] text-white shadow-card hover:shadow-elevated'
                  : 'bg-[#F4FCFE] text-[#7A7A7A]/70 cursor-not-allowed'
              }`}
            >
              {submitting ? (
                <><Loader className="w-4 h-4 animate-spin" /> Wird erstellt...</>
              ) : (
                <><Rocket className="w-4 h-4" /> B-Roll generieren</>
              )}
            </button>
          </div>
        )}

        {/* === PROCESSING PHASE === */}
        {phase === 'processing' && (
          <div className="bg-white rounded-[var(--vektrus-radius-lg)] border border-[rgba(73,183,227,0.10)] shadow-card p-12 text-center relative overflow-hidden">
            {/* Pulse gradient glow */}
            <div
              className="absolute inset-0 opacity-15 rounded-[var(--vektrus-radius-lg)]"
              style={{
                background: 'linear-gradient(135deg, #49B7E3 0%, #7C6CF2 33%, #E8A0D6 66%, #F4BE9D 100%)',
                filter: 'blur(50px)',
                animation: 'pulse 4s ease-in-out infinite',
              }}
            />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-full bg-[rgba(124,108,242,0.1)] flex items-center justify-center mx-auto mb-5">
                <Sparkles className="w-8 h-8 text-[var(--vektrus-ai-violet)] animate-pulse" />
              </div>
              <h2 className="font-manrope font-bold text-xl text-[#111111] mb-2">B-Roll wird generiert...</h2>
              <p className="text-sm text-[#7A7A7A] mb-1">
                {clipDuration}s {PURPOSE_OPTIONS.find(p => p.id === clipPurpose)?.label}-Clip · {generationMode === 'image_to_video' ? 'Bild → Video' : 'Text → Video'}
              </p>
              <p className="text-xs text-[#7A7A7A]/60">Das kann 1–3 Minuten dauern. Du kannst diese Seite geöffnet lassen.</p>

              <div className="mt-8">
                <div className="h-1.5 bg-[rgba(124,108,242,0.1)] rounded-full overflow-hidden max-w-xs mx-auto">
                  <div
                    className="h-full rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, #49B7E3, #7C6CF2, #E8A0D6)',
                      animation: 'shimmer 2s ease-in-out infinite',
                      width: '60%',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === FINISHED PHASE === */}
        {phase === 'finished' && videoUrl && (
          <div className="space-y-5">
            <div className="bg-white rounded-[var(--vektrus-radius-lg)] border border-[rgba(73,183,227,0.10)] shadow-card overflow-hidden">
              <div className="p-5 border-b border-[rgba(73,183,227,0.10)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-[#49D69E]" />
                  <h2 className="font-manrope font-bold text-lg text-[#111111]">B-Roll fertig</h2>
                </div>
                <span className="text-[11px] text-[#7A7A7A] bg-[#F4FCFE] px-2 py-1 rounded-full">
                  {clipDuration}s · {PURPOSE_OPTIONS.find(p => p.id === clipPurpose)?.label}
                </span>
              </div>

              <div className="bg-black flex items-center justify-center" style={{ maxHeight: '60vh' }}>
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-auto max-h-[60vh]"
                />
              </div>

              <div className="p-5 flex gap-3">
                <a
                  href={videoUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#49B7E3] text-white rounded-[var(--vektrus-radius-md)] font-medium shadow-card hover:shadow-elevated transition-all"
                >
                  <Download className="w-4 h-4" />
                  Herunterladen
                </a>
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-2 px-5 py-2.5 border border-[rgba(73,183,227,0.18)] bg-white text-[#111111] rounded-[var(--vektrus-radius-md)] font-medium hover:bg-[#F4FCFE] transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Neuen Clip erstellen
                </button>
              </div>
            </div>
          </div>
        )}

        {/* === ERROR PHASE === */}
        {phase === 'error' && (
          <div className="bg-white rounded-[var(--vektrus-radius-lg)] border border-[rgba(73,183,227,0.10)] shadow-card p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-[rgba(250,126,112,0.1)] flex items-center justify-center mx-auto mb-5">
              <X className="w-8 h-8 text-[#FA7E70]" />
            </div>
            <h2 className="font-manrope font-bold text-xl text-[#111111] mb-2">Generierung fehlgeschlagen</h2>
            <p className="text-sm text-[#7A7A7A] mb-6 max-w-md mx-auto">{errorMessage}</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 px-6 py-3 bg-[var(--vektrus-ai-violet)] text-white rounded-[var(--vektrus-radius-md)] font-semibold shadow-card hover:shadow-elevated transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Erneut versuchen
              </button>
              <button
                onClick={() => navigate('/vision')}
                className="px-5 py-3 text-sm text-[#7A7A7A] hover:text-[#111111] hover:bg-[#F4FCFE] rounded-[var(--vektrus-radius-md)] transition-colors"
              >
                Zurück
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisionBRollStudio;
