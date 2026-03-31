import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Check,
  Download,
  Film,
  Loader,
  RefreshCw,
  Rocket,
  Upload,
  X,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { callN8n } from '../../lib/n8n';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../ui/toast';

type ClipPurpose = 'b_roll' | 'intro' | 'outro' | 'transition';
type Phase = 'form' | 'processing' | 'finished' | 'error';

const PURPOSE_OPTIONS: { id: ClipPurpose; label: string }[] = [
  { id: 'b_roll', label: 'B-Roll' },
  { id: 'intro', label: 'Intro' },
  { id: 'outro', label: 'Outro' },
  { id: 'transition', label: 'Transition' },
];

const DURATION_OPTIONS = [3, 4, 5, 6, 7, 8] as const;

const FAILED_MESSAGES: Record<string, string> = {
  failed_timeout: 'Die Generierung hat zu lange gedauert. Bitte versuche es erneut.',
  failed_generation: 'Die Video-Generierung ist fehlgeschlagen. Bitte versuche es erneut.',
  failed_download: 'Das Video konnte nicht gespeichert werden. Bitte versuche es erneut.',
  failed: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.',
};

const StudioBRoll: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [clipDescription, setClipDescription] = useState('');
  const [clipDuration, setClipDuration] = useState(5);
  const [clipPurpose, setClipPurpose] = useState<ClipPurpose>('b_roll');
  const [referenceImages, setReferenceImages] = useState<{ url: string }[]>([]);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  // Processing state
  const [phase, setPhase] = useState<Phase>('form');
  const [submitting, setSubmitting] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Polling cancellation
  const pollingCancelledRef = useRef(false);
  useEffect(() => {
    return () => { pollingCancelledRef.current = true; };
  }, []);

  // Recent clips
  const [recentClips, setRecentClips] = useState<
    { id: string; video_url: string; product_name: string; created_at: string }[]
  >([]);
  const [selectedClipUrl, setSelectedClipUrl] = useState<string | null>(null);

  // Load recent finished clips
  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      const { data } = await supabase
        .from('vision_projects')
        .select('id, video_url, product_name, created_at')
        .eq('user_id', user.id)
        .eq('status', 'finished')
        .not('video_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(12);
      if (data) setRecentClips(data as any);
    };
    load();
  }, [user?.id, phase]);

  // Upload to Supabase Storage
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
      } else {
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

  // Polling with cancellation
  const pollProject = useCallback(
    async (pid: string) => {
      pollingCancelledRef.current = false;

      const poll = async () => {
        if (pollingCancelledRef.current) return;

        const { data } = await supabase
          .from('vision_projects')
          .select('status, video_url')
          .eq('id', pid)
          .single();

        if (!data || pollingCancelledRef.current) return;

        if (data.status === 'finished' && data.video_url) {
          setVideoUrl(data.video_url);
          setPhase('finished');
          addToast({
            type: 'success',
            title: 'B-Roll fertig!',
            description: 'Dein Clip wurde generiert.',
            duration: 5000,
          });
          return;
        }

        if (data.status?.startsWith('failed')) {
          setErrorMessage(FAILED_MESSAGES[data.status] || FAILED_MESSAGES.failed);
          setPhase('error');
          return;
        }

        setTimeout(() => poll(), 4000);
      };
      poll();
    },
    [addToast]
  );

  // Submit
  const handleSubmit = async () => {
    if (!user?.id || clipDescription.trim().length < 5) return;
    setSubmitting(true);

    try {
      // 1. Insert vision_project
      const { data: project, error: insertError } = await supabase
        .from('vision_projects')
        .insert({
          user_id: user.id,
          product_name: clipDescription.substring(0, 100),
          user_description: clipDescription,
          reference_images:
            referenceImages.length > 0
              ? referenceImages.map((img) => ({ url: img.url }))
              : null,
          model_selection: 'veo',
          status: 'queued',
          clip_purpose: clipPurpose,
          generation_mode: referenceImages.length > 0 ? 'image_to_video' : 'text_to_video',
          reel_concept_id: null,
        })
        .select()
        .single();

      if (insertError || !project) throw insertError || new Error('Insert fehlgeschlagen');

      // 2. Call webhook
      try {
        await callN8n('vektrus-vision-broll', {
          user_id: user.id,
          vision_project_id: project.id,
          clip_description: clipDescription,
          clip_duration: clipDuration,
          clip_purpose: clipPurpose,
          reel_concept_id: null,
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

      // 3. Start polling
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
    setVideoUrl(null);
    setErrorMessage('');
    setSelectedClipUrl(null);
  };

  const canSubmit = clipDescription.trim().length >= 5;

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto studio-scrollbar">
      <div className="flex-1 flex flex-col items-center px-6 py-8">
        <div className="w-full max-w-2xl">
          {/* ── FORM PHASE ── */}
          {phase === 'form' && (
            <div className="space-y-5">
              <div className="text-center mb-2">
                <h2 className="text-2xl font-manrope font-bold text-[#FAFAFA]">
                  B-Roll generieren
                </h2>
                <p className="text-[#7A7A7A] text-sm mt-1">
                  Beschreibe eine Szene und die KI erstellt einen passenden Video-Clip.
                </p>
              </div>

              {/* Clip Description */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-medium text-[#FAFAFA]/40 mb-2">
                  Szenenbeschreibung
                </label>
                <textarea
                  value={clipDescription}
                  onChange={(e) => setClipDescription(e.target.value.slice(0, 500))}
                  placeholder="z.B. Nahaufnahme einer dampfenden Kaffeetasse auf einem Holztisch..."
                  rows={4}
                  className="w-full rounded-xl text-sm text-[#FAFAFA]/80 placeholder-[#FAFAFA]/20 p-4 resize-none focus:outline-none transition-colors"
                  style={{
                    backgroundColor: '#121214',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#49B7E3')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                />
                <p className="text-[11px] text-[#FAFAFA]/20 mt-1">
                  {clipDescription.length}/500 · Min. 5 Zeichen
                </p>
              </div>

              {/* Duration chips */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-medium text-[#FAFAFA]/40 mb-2">
                  Clip-Dauer
                </label>
                <div className="flex gap-2">
                  {DURATION_OPTIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setClipDuration(d)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border ${
                        clipDuration === d
                          ? 'bg-[#49B7E3]/15 text-[#49B7E3] border-[#49B7E3]/40'
                          : 'bg-[#121214] text-[#FAFAFA]/50 border-transparent hover:border-[rgba(255,255,255,0.08)]'
                      }`}
                    >
                      {d}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Purpose segmented control */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-medium text-[#FAFAFA]/40 mb-2">
                  Clip-Typ
                </label>
                <div className="flex gap-2">
                  {PURPOSE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setClipPurpose(opt.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border ${
                        clipPurpose === opt.id
                          ? 'bg-[#49B7E3]/15 text-[#49B7E3] border-[#49B7E3]/40'
                          : 'bg-[#121214] text-[#FAFAFA]/50 border-transparent hover:border-[rgba(255,255,255,0.08)]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reference Images Upload */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-medium text-[#FAFAFA]/40 mb-2">
                  Startbild (optional)
                </label>
                {referenceImages.length < 2 && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                      dragOver
                        ? 'border-[#7C6CF2]/50 bg-[#7C6CF2]/5'
                        : 'border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)]'
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
                      <Loader className="w-6 h-6 text-[#7C6CF2] mx-auto animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6 text-[#FAFAFA]/15 mx-auto" />
                    )}
                    <p className="text-sm text-[#FAFAFA]/30 mt-2">
                      Bilder hochladen oder hierher ziehen
                    </p>
                    <p className="text-[11px] text-[#FAFAFA]/15 mt-1">
                      JPG, PNG, WebP · Max. 8 MB · Max. 2 Bilder
                    </p>
                  </div>
                )}

                {uploadError && (
                  <p className="text-sm text-[#FA7E70] mt-2">{uploadError}</p>
                )}

                {referenceImages.length > 0 && (
                  <div className="flex gap-3 mt-3">
                    {referenceImages.map((img, i) => (
                      <div
                        key={i}
                        className="relative w-20 h-20 rounded-xl overflow-hidden border border-[rgba(255,255,255,0.06)]"
                      >
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 bg-black/70 rounded-full p-0.5 text-[#FAFAFA]/60 hover:text-[#FA7E70] transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <span className="absolute bottom-1 left-1 bg-black/70 text-[#FAFAFA]/80 text-[9px] font-bold px-1.5 py-0.5 rounded">
                          {i === 0 ? 'Start' : 'Ende'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Generate button */}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  canSubmit && !submitting
                    ? 'bg-[#7C6CF2] text-white hover:bg-[#6b5ce0]'
                    : 'bg-[#121214] text-[#FAFAFA]/20 cursor-not-allowed'
                }`}
              >
                {submitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Wird erstellt...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    KI-Video generieren
                  </>
                )}
              </button>
            </div>
          )}

          {/* ── PROCESSING PHASE ── */}
          {phase === 'processing' && (
            <div className="flex flex-col items-center py-12">
              <div className="relative">
                {/* 9:16 container with violet glow */}
                <div
                  className="w-[200px] aspect-[9/16] rounded-2xl flex items-center justify-center relative overflow-hidden"
                  style={{ backgroundColor: '#121214' }}
                >
                  {/* Pulsing glow border */}
                  <div
                    className="absolute inset-0 rounded-2xl studio-generating-glow"
                    style={{
                      boxShadow: '0 0 30px rgba(124,108,242,0.3), inset 0 0 20px rgba(124,108,242,0.05)',
                    }}
                  />
                  {/* Shimmer inside */}
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{
                      background:
                        'linear-gradient(135deg, transparent 30%, rgba(124,108,242,0.3) 50%, transparent 70%)',
                      backgroundSize: '200% 200%',
                      animation: 'studioShimmer 2s ease-in-out infinite',
                    }}
                  />
                  <Film className="w-8 h-8 text-[#7C6CF2]/40" />
                </div>
              </div>
              <p className="text-[#FAFAFA]/50 text-sm mt-6 font-medium">
                Dein Video wird erstellt...
              </p>
              <p className="text-[#FAFAFA]/20 text-xs mt-1">
                Das kann 1–3 Minuten dauern.
              </p>
            </div>
          )}

          {/* ── FINISHED PHASE ── */}
          {phase === 'finished' && (videoUrl || selectedClipUrl) && (
            <div className="flex flex-col items-center py-6">
              <div className="flex items-center gap-2 mb-4">
                <Check className="w-5 h-5 text-[#49D69E]" />
                <h3 className="text-lg font-manrope font-bold text-[#FAFAFA]">
                  B-Roll fertig
                </h3>
              </div>

              <div className="rounded-2xl overflow-hidden bg-black" style={{ maxHeight: '60vh' }}>
                <video
                  key={videoUrl || selectedClipUrl}
                  src={videoUrl || selectedClipUrl || ''}
                  controls
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-auto max-h-[60vh]"
                />
              </div>

              <div className="flex gap-3 mt-5">
                <a
                  href={videoUrl || selectedClipUrl || ''}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-[#FAFAFA]/60 hover:text-[#FAFAFA] border border-[#FAFAFA]/10 hover:border-[#FAFAFA]/20 transition-colors bg-transparent"
                >
                  <Download className="w-4 h-4" />
                  Herunterladen
                </a>
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#49B7E3] text-white hover:bg-[#3aa5d1] transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  Neuen Clip erstellen
                </button>
              </div>
            </div>
          )}

          {/* ── ERROR PHASE ── */}
          {phase === 'error' && (
            <div className="flex flex-col items-center py-12">
              <div className="w-16 h-16 rounded-full bg-[#FA7E70]/10 flex items-center justify-center mb-5">
                <X className="w-8 h-8 text-[#FA7E70]/60" />
              </div>
              <h3 className="font-manrope font-bold text-xl text-[#FAFAFA] mb-2">
                Generierung fehlgeschlagen
              </h3>
              <p className="text-[#FAFAFA]/40 text-sm mb-6 max-w-md text-center">
                {errorMessage}
              </p>
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#7C6CF2] text-white hover:bg-[#6b5ce0] transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Erneut versuchen
              </button>
            </div>
          )}
        </div>

        {/* ── Recent Clips Grid ── */}
        {recentClips.length > 0 && phase === 'form' && (
          <div className="w-full max-w-4xl mt-12">
            <p className="text-[11px] uppercase tracking-wider font-medium text-[#FAFAFA]/30 mb-4">
              Letzte Clips
            </p>
            <div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
              {recentClips.map((clip) => (
                <button
                  key={clip.id}
                  onClick={() => {
                    setSelectedClipUrl(clip.video_url);
                    setVideoUrl(null);
                    setPhase('finished');
                  }}
                  className="group relative aspect-[9/16] rounded-xl overflow-hidden bg-[#121214] border border-transparent hover:border-[#49B7E3]/30 transition-all cursor-pointer"
                >
                  <video
                    src={clip.video_url}
                    muted
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="absolute bottom-2 left-2 right-2 text-[10px] text-white truncate opacity-0 group-hover:opacity-100 transition-opacity">
                    {clip.product_name}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudioBRoll;
