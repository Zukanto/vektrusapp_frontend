import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Camera,
  Clapperboard,
  Clock,
  Copy,
  Info,
  Loader,
  Music,
  Sparkles,
  Type,
  User,
  Calendar,
  Film,
  Trash2,
  Image as ImageIcon,
  Compass,
} from 'lucide-react';
import { enterStudio } from '../studio/studioTransition';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../ui/toast';
import type { ReelContent } from '../../services/reelService';

const FORMAT_LABELS: Record<string, string> = {
  talking_head: 'Talking Head',
  produkt_showcase: 'Produkt-Showcase',
  tutorial: 'Tutorial',
  behind_the_scenes: 'Behind the Scenes',
  vorher_nachher: 'Vorher/Nachher',
  b_roll_montage: 'B-Roll Montage',
  listicle: 'Listicle',
};

const HOOK_TYPE_LABELS: Record<string, string> = {
  widerspruch: 'Widerspruch',
  zahl: 'Zahl',
  visuell: 'Visuell',
  frage: 'Frage',
  statement: 'Statement',
};

const DELIVERY_LABELS: Record<string, string> = {
  gesprochen: 'Gesprochen',
  text_overlay: 'Text-Overlay',
  beides: 'Beides',
};

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string }> = {
  einfach: { bg: 'rgba(73, 214, 158, 0.12)', text: '#49D69E' },
  mittel: { bg: 'rgba(244, 190, 157, 0.15)', text: '#c07a3a' },
  fortgeschritten: { bg: 'rgba(124, 108, 242, 0.12)', text: '#7C6CF2' },
};

interface PlannerModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (date: string, time: string) => void;
  submitting: boolean;
}

const PlannerModal: React.FC<PlannerModalProps> = ({ open, onClose, onConfirm, submitting }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('12:00');

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-modal rounded-[var(--vektrus-radius-lg)] shadow-modal max-w-sm w-full p-6 space-y-5"
      >
        <div>
          <h3 className="font-manrope font-bold text-lg text-[#111111]">In Planner übernehmen</h3>
          <p className="text-sm text-[#7A7A7A] mt-1">Wähle Datum und Uhrzeit für dein Video.</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-[#111111] mb-1.5">Datum</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] text-sm focus:outline-none focus:border-[#49B7E3] focus:ring-2 focus:ring-[#49B7E3]/20"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#111111] mb-1.5">Uhrzeit</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2.5 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] text-sm focus:outline-none focus:border-[#49B7E3] focus:ring-2 focus:ring-[#49B7E3]/20"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] text-sm font-medium text-[#7A7A7A] hover:bg-[#F4FCFE] transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={() => date && onConfirm(date, time)}
            disabled={!date || submitting}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-[var(--vektrus-radius-md)] text-sm font-semibold transition-all ${
              date && !submitting
                ? 'bg-[#49B7E3] text-white shadow-card hover:shadow-elevated'
                : 'bg-[#F4FCFE] text-[#7A7A7A]/70 cursor-not-allowed'
            }`}
          >
            {submitting ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Calendar className="w-4 h-4" />
            )}
            Einplanen
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface DeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  deleting: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ open, onClose, onConfirm, deleting }) => {
  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[var(--vektrus-radius-lg)] shadow-modal max-w-sm w-full p-6 space-y-4"
      >
        <h3 className="font-manrope font-bold text-lg text-[#111111]">Konzept neu generieren?</h3>
        <p className="text-sm text-[#7A7A7A]">
          Dieses Konzept wird gelöscht. Du wirst zu Pulse Video weitergeleitet.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] text-sm font-medium text-[#7A7A7A] hover:bg-[#F4FCFE] transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-[var(--vektrus-radius-md)] text-sm font-semibold bg-[#FA7E70] text-white hover:bg-[#e86b5d] transition-colors"
          >
            {deleting ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Löschen & neu starten
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const VisionReelConceptView: React.FC = () => {
  const { contentId } = useParams<{ contentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<{ id: string; content: ReelContent; created_at: string } | null>(null);
  const [error, setError] = useState('');

  const [plannerOpen, setPlannerOpen] = useState(false);
  const [plannerSubmitting, setPlannerSubmitting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [captionCopied, setCaptionCopied] = useState(false);
  const [voiceoverCopied, setVoiceoverCopied] = useState(false);

  const loadContent = useCallback(async () => {
    if (!contentId) return;
    setLoading(true);

    const { data, error: fetchError } = await supabase
      .from('pulse_generated_content')
      .select('id, content, created_at')
      .eq('id', contentId)
      .single();

    if (fetchError || !data) {
      setError('Video-Konzept nicht gefunden.');
    } else {
      setRecord({ id: data.id, content: data.content as ReelContent, created_at: data.created_at });
    }
    setLoading(false);
  }, [contentId]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const handlePlannerConfirm = async (date: string, time: string) => {
    if (!record) return;
    setPlannerSubmitting(true);

    const scheduledDate = new Date(`${date}T${time}:00`).toISOString();

    const { error: updateError } = await supabase
      .from('pulse_generated_content')
      .update({
        scheduled_date: scheduledDate,
        status: 'draft',
        updated_at: new Date().toISOString(),
      })
      .eq('id', record.id);

    if (updateError) {
      addToast({ type: 'error', title: 'Fehler', description: 'Konnte nicht eingeplant werden.', duration: 4000 });
    } else {
      addToast({ type: 'success', title: 'Video eingeplant', description: 'Du findest es jetzt im Planner.', duration: 4000 });
      navigate('/planner');
    }
    setPlannerSubmitting(false);
    setPlannerOpen(false);
  };

  const handleDelete = async () => {
    if (!record) return;
    setDeleting(true);

    const { error: deleteError } = await supabase
      .from('pulse_generated_content')
      .delete()
      .eq('id', record.id);

    if (deleteError) {
      addToast({ type: 'error', title: 'Fehler', description: 'Konzept konnte nicht gelöscht werden.', duration: 4000 });
    } else {
      navigate('/pulse');
    }
    setDeleting(false);
    setDeleteOpen(false);
  };

  const handleCopyCaption = async () => {
    if (!record) return;
    const c = record.content;
    const text = c.caption + '\n\n' + c.hashtags.map((h: string) => (h.startsWith('#') ? h : `#${h}`)).join(' ');
    try {
      await navigator.clipboard.writeText(text);
      setCaptionCopied(true);
      setTimeout(() => setCaptionCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  const handleCopyVoiceover = async () => {
    if (!record?.content.voiceover_script) return;
    try {
      await navigator.clipboard.writeText(record.content.voiceover_script);
      setVoiceoverCopied(true);
      setTimeout(() => setVoiceoverCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-full flex flex-col bg-[var(--vektrus-mint)] overflow-auto">
        <div className="max-w-[1240px] mx-auto w-full px-6 md:px-8 py-8 space-y-6">
          <div className="h-4 w-48 bg-[#B6EBF7]/30 rounded animate-pulse" />
          <div className="h-8 w-96 bg-[#B6EBF7]/30 rounded animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-white rounded-[var(--vektrus-radius-md)] shadow-subtle animate-pulse" />
              ))}
            </div>
            <div className="h-80 bg-white rounded-[var(--vektrus-radius-md)] shadow-subtle animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !record) {
    return (
      <div className="h-full flex flex-col bg-[var(--vektrus-mint)] overflow-auto">
        <div className="max-w-[1240px] mx-auto w-full px-6 md:px-8 py-8">
          <button
            onClick={() => navigate('/vision')}
            className="flex items-center gap-2 text-sm text-[#7A7A7A] hover:text-[#111111] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zur Video-Werkstatt
          </button>
          <div className="bg-white rounded-[var(--vektrus-radius-lg)] border border-[rgba(73,183,227,0.10)] shadow-card p-16 text-center">
            <div className="w-16 h-16 rounded-full bg-[rgba(250,126,112,0.1)] flex items-center justify-center mx-auto mb-4">
              <Film className="w-8 h-8 text-[#FA7E70]" />
            </div>
            <h2 className="font-manrope font-bold text-xl text-[#111111] mb-2">Konzept nicht gefunden</h2>
            <p className="text-[#7A7A7A] text-sm mb-6">{error || 'Das Video-Konzept existiert nicht mehr.'}</p>
            <button
              onClick={() => navigate('/vision')}
              className="px-6 py-2.5 bg-[#49B7E3] text-white rounded-[var(--vektrus-radius-md)] font-semibold shadow-card hover:shadow-elevated transition-all"
            >
              Zur Video-Werkstatt
            </button>
          </div>
        </div>
      </div>
    );
  }

  const c = record.content;
  const diffColor = DIFFICULTY_COLORS[c.difficulty] || DIFFICULTY_COLORS.mittel;
  const createdDate = new Date(record.created_at).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="h-full flex flex-col bg-[var(--vektrus-mint)] overflow-auto">
      <div className="max-w-[1240px] mx-auto w-full px-6 md:px-8 py-8">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate('/vision')}
          className="flex items-center gap-2 text-sm text-[#7A7A7A] hover:text-[#111111] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Video-Werkstatt</span>
          <span className="text-[#7A7A7A]/50">/</span>
          <span>Video-Konzepte</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* Left Column — Main Content */}
          <div className="space-y-5">
            {/* Title + Meta */}
            <div>
              <h1 className="font-manrope font-bold text-2xl md:text-3xl text-[#111111] leading-tight mb-3">
                {c.title}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F3F4F6] text-[#374151]">
                  {FORMAT_LABELS[c.format] || c.format}
                </span>
                <span
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold"
                  style={{ backgroundColor: diffColor.bg, color: diffColor.text }}
                >
                  {c.difficulty}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-[#7A7A7A]">
                  <Clock className="w-3 h-3" />
                  {c.total_duration_seconds}s
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-[#7A7A7A]">
                  <Film className="w-3 h-3" />
                  {c.scenes.length} Szenen
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-[#7A7A7A]">
                  {c.estimated_effort}
                </span>
                {c.needs_face && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#7A7A7A] bg-[#F3F4F6] px-2 py-1 rounded-full">
                    <User className="w-3 h-3" />
                    Braucht dein Gesicht
                  </span>
                )}
                <span className="text-[11px] text-[#7A7A7A]/60">{createdDate}</span>
              </div>
            </div>

            {/* Hook Section */}
            <div className="bg-white rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.10)] shadow-subtle p-5">
              <p className="text-xs font-semibold text-[#7A7A7A] uppercase tracking-wide mb-3">Hook</p>
              <p className="text-lg font-semibold text-[#111111] leading-snug mb-3">
                „{c.hook.text}"
              </p>
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                  style={{ backgroundColor: '#49B7E3' }}
                >
                  {HOOK_TYPE_LABELS[c.hook.type] || c.hook.type}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F3F4F6] text-[#6B7280]">
                  {DELIVERY_LABELS[c.hook.delivery] || c.hook.delivery}
                </span>
              </div>
            </div>

            {/* Storyboard Section */}
            <div className="bg-white rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.10)] shadow-subtle p-5">
              <p className="text-xs font-semibold text-[#7A7A7A] uppercase tracking-wide mb-4">
                Storyboard ({c.scenes.length} Szenen · {c.total_duration_seconds}s gesamt)
              </p>
              <div className="space-y-4">
                {c.scenes.map((scene) => (
                  <div key={scene.nr} className="flex gap-3">
                    <div className="flex flex-col items-center flex-shrink-0 w-10">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                        style={{ backgroundColor: '#49B7E3' }}
                      >
                        {scene.nr}
                      </div>
                      <span className="text-[10px] text-[#7A7A7A] mt-1">{scene.duration_seconds}s</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#111111] leading-snug">{scene.action}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[10px] text-[#7A7A7A] bg-[#F3F4F6] px-1.5 py-0.5 rounded">
                          <Camera className="w-2.5 h-2.5" />
                          {scene.camera}
                        </span>
                        {scene.text_overlay && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                            <Type className="w-2.5 h-2.5" />
                            {scene.text_overlay}
                          </span>
                        )}
                      </div>
                      {scene.tip && (
                        <p className="flex items-start gap-1 text-[11px] text-[#7A7A7A] mt-1.5 italic">
                          <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
                          {scene.tip}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Caption & Hashtags */}
            <div className="bg-white rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.10)] shadow-subtle p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-[#7A7A7A] uppercase tracking-wide">Caption & Hashtags</p>
                <button
                  onClick={handleCopyCaption}
                  className="flex items-center gap-1 text-[11px] font-medium text-[#49B7E3] hover:text-[#7C6CF2] transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  {captionCopied ? 'Kopiert!' : 'Kopieren'}
                </button>
              </div>
              <p className="text-sm text-[#111111] leading-relaxed bg-[#F9FAFB] rounded-[var(--vektrus-radius-sm)] p-3 mb-3 max-h-40 overflow-y-auto">
                {c.caption}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {c.hashtags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#F4FCFE] text-[#49B7E3]"
                  >
                    {tag.startsWith('#') ? tag : `#${tag}`}
                  </span>
                ))}
              </div>
            </div>

            {/* Audio Suggestion */}
            {c.audio_suggestion && (
              <div className="bg-white rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.10)] shadow-subtle p-5">
                <p className="text-xs font-semibold text-[#7A7A7A] uppercase tracking-wide mb-3">Audio-Empfehlung</p>
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-[#7A7A7A]" />
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F3F4F6] text-[#374151]">
                    {c.audio_suggestion.type}
                  </span>
                  <span className="text-sm text-[#7A7A7A]">{c.audio_suggestion.note}</span>
                </div>
              </div>
            )}

            {/* Why it works */}
            <div className="bg-white rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.10)] shadow-subtle p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[#7C6CF2]" />
                <p className="text-xs font-semibold text-[#7A7A7A] uppercase tracking-wide">Warum funktioniert das?</p>
              </div>
              <p
                className="text-sm text-[#111111] leading-relaxed p-3 rounded-[var(--vektrus-radius-sm)]"
                style={{ borderLeft: '3px solid #7C6CF2', backgroundColor: 'rgba(124, 108, 242, 0.04)' }}
              >
                {c.why_it_works}
              </p>
            </div>

            {/* Voiceover Script */}
            {c.voiceover_script && (
              <div className="bg-white rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.10)] shadow-subtle p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-[#7A7A7A] uppercase tracking-wide">Voiceover-Skript</p>
                  <button
                    onClick={handleCopyVoiceover}
                    className="flex items-center gap-1 text-[11px] font-medium text-[#49B7E3] hover:text-[#7C6CF2] transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    {voiceoverCopied ? 'Kopiert!' : 'Kopieren'}
                  </button>
                </div>
                <div
                  className="p-4 rounded-[var(--vektrus-radius-sm)] bg-[#F9FAFB] text-sm text-[#111111] leading-relaxed max-h-60 overflow-y-auto"
                  style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: '13px' }}
                >
                  {c.voiceover_script}
                </div>
              </div>
            )}
          </div>

          {/* Right Column — Action Panel */}
          <div className="lg:sticky lg:top-8 self-start space-y-4">
            <div className="bg-white rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.10)] shadow-card p-5 space-y-3">
              {/* Primary: Im Studio öffnen */}
              <button
                onClick={() => enterStudio(navigate, record.id)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#49B7E3] text-white rounded-[var(--vektrus-radius-md)] font-semibold shadow-card hover:shadow-elevated transition-all"
              >
                <Clapperboard className="w-4 h-4" />
                Im Studio öffnen
              </button>

              {/* Secondary: In Planner übernehmen */}
              <button
                onClick={() => setPlannerOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-[rgba(73,183,227,0.18)] bg-white text-[#111111] rounded-[var(--vektrus-radius-md)] text-sm font-medium hover:bg-[#F4FCFE] transition-colors"
              >
                <Calendar className="w-4 h-4" />
                In Planner übernehmen
              </button>

              {/* Secondary: B-Roll generieren */}
              <button
                onClick={() => navigate(`/vision/b-roll?reelId=${record.id}`)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-[rgba(73,183,227,0.18)] bg-white text-[#111111] rounded-[var(--vektrus-radius-md)] text-sm font-medium hover:bg-[#F4FCFE] transition-colors"
              >
                <Film className="w-4 h-4" />
                B-Roll generieren
              </button>

              {/* Secondary: Thumbnail erstellen */}
              <button
                onClick={() => navigate('/vision/thumbnails')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-[rgba(73,183,227,0.18)] bg-white text-[#111111] rounded-[var(--vektrus-radius-md)] text-sm font-medium hover:bg-[#F4FCFE] transition-colors"
              >
                <ImageIcon className="w-4 h-4" />
                Thumbnail erstellen
              </button>

              {/* Coming Soon: Dreh-Begleiter */}
              <button
                disabled
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-[rgba(73,183,227,0.10)] bg-[#F4FCFE] text-[#7A7A7A]/50 rounded-[var(--vektrus-radius-md)] text-sm font-medium cursor-not-allowed"
              >
                <Compass className="w-4 h-4" />
                Dreh-Begleiter
                <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[rgba(73,183,227,0.12)] text-[#49B7E3]">
                  Bald
                </span>
              </button>

              {/* Danger: Neu generieren */}
              <div className="border-t border-[rgba(73,183,227,0.10)] pt-3 mt-3">
                <button
                  onClick={() => setDeleteOpen(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-[#7A7A7A] hover:text-[#FA7E70] transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Neu generieren
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        <PlannerModal
          open={plannerOpen}
          onClose={() => setPlannerOpen(false)}
          onConfirm={handlePlannerConfirm}
          submitting={plannerSubmitting}
        />
      </AnimatePresence>
      <AnimatePresence>
        <DeleteConfirmModal
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      </AnimatePresence>

      {/* Mobile sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[rgba(73,183,227,0.10)] p-4 z-40">
        <button
          onClick={() => setPlannerOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#49B7E3] text-white rounded-[var(--vektrus-radius-md)] font-semibold shadow-card"
        >
          <Calendar className="w-4 h-4" />
          In Planner übernehmen
        </button>
      </div>
    </div>
  );
};

export default VisionReelConceptView;
