import React, { useState, useEffect, useCallback } from 'react';
import { Megaphone, Bug, Star, ChevronUp, Plus, X, MessageCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../ui/toast';

interface FeedbackTicket {
  id: string;
  user_id: string;
  type: 'bug' | 'feature';
  title: string;
  description: string;
  tool: string;
  severity: string | null;
  status: string;
  vote_count: number;
  admin_response: string | null;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  open: { label: 'Offen', className: 'bg-[#F4FCFE] text-[#7A7A7A]' },
  acknowledged: { label: 'Gesehen', className: 'bg-[#49B7E3]/10 text-[#49B7E3]' },
  in_progress: { label: 'In Arbeit', className: 'bg-[#F4BE9D]/10 text-[#D4864A]' },
  resolved: { label: 'Geloest', className: 'bg-[#49D69E]/10 text-[#49D69E]' },
  declined: { label: 'Abgelehnt', className: 'bg-[#FA7E70]/10 text-[#FA7E70]' },
};

const SEVERITY_LABELS: Record<string, string> = {
  hint: 'Nur ein Hinweis',
  minor: 'Nervig aber nutzbar',
  blocking: 'Blockiert mich komplett',
};

const SEVERITY_COLORS: Record<string, string> = {
  hint: 'bg-[#F4FCFE] text-[#7A7A7A]',
  minor: 'bg-[#F4BE9D]/10 text-[#D4864A]',
  blocking: 'bg-[#FA7E70]/10 text-[#FA7E70]',
};

const TOOL_OPTIONS: { value: string; label: string }[] = [
  { value: 'general', label: 'Allgemein' },
  { value: 'chat', label: 'Chat' },
  { value: 'pulse', label: 'Pulse' },
  { value: 'planner', label: 'Content Planner' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'image', label: 'Image Advanced' },
  { value: 'profile', label: 'Profil' },
];

const TOOL_DISPLAY: Record<string, string> = Object.fromEntries(
  TOOL_OPTIONS.map((t) => [t.value, t.label])
);

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'gerade eben';
  if (mins < 60) return `vor ${mins} Min.`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `vor ${hours} Std.`;
  const days = Math.floor(hours / 24);
  return `vor ${days} Tag${days > 1 ? 'en' : ''}`;
}

export const FeedbackSection: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'bug' | 'feature'>('bug');
  const [tickets, setTickets] = useState<FeedbackTicket[]>([]);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedResponse, setExpandedResponse] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    tool: 'general',
    severity: 'minor' as string,
  });

  const currentUserId = user?.id;

  const loadData = useCallback(async () => {
    if (!currentUserId) return;
    setLoading(true);
    setError(false);

    const [ticketsRes, votesRes] = await Promise.all([
      supabase.from('feedback_tickets').select('*').eq('type', activeTab).order('vote_count', { ascending: false }),
      supabase.from('feedback_votes').select('ticket_id').eq('user_id', currentUserId),
    ]);

    if (ticketsRes.error || votesRes.error) {
      setError(true);
    } else {
      setTickets((ticketsRes.data || []) as FeedbackTicket[]);
      setUserVotes(new Set((votesRes.data || []).map((v: { ticket_id: string }) => v.ticket_id)));
    }
    setLoading(false);
  }, [activeTab, currentUserId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleVote = async (ticketId: string) => {
    if (!currentUserId) return;
    const hasVoted = userVotes.has(ticketId);

    setUserVotes((prev) => {
      const next = new Set(prev);
      if (hasVoted) next.delete(ticketId); else next.add(ticketId);
      return next;
    });
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId ? { ...t, vote_count: t.vote_count + (hasVoted ? -1 : 1) } : t
      )
    );

    if (hasVoted) {
      await supabase.from('feedback_votes').delete().eq('ticket_id', ticketId).eq('user_id', currentUserId);
    } else {
      await supabase.from('feedback_votes').insert({ ticket_id: ticketId, user_id: currentUserId });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId || !form.title.trim() || !form.description.trim()) return;

    setSubmitting(true);
    const { error: err } = await supabase.from('feedback_tickets').insert({
      user_id: currentUserId,
      type: activeTab,
      title: form.title.trim(),
      description: form.description.trim(),
      tool: form.tool,
      severity: activeTab === 'bug' ? form.severity : null,
    });

    if (err) {
      addToast({ type: 'error', title: 'Fehler', description: 'Ticket konnte nicht erstellt werden.', duration: 3000 });
    } else {
      addToast({ type: 'success', title: 'Gesendet', description: 'Dein Feedback wurde erfolgreich eingereicht.', duration: 3000 });
      setForm({ title: '', description: '', tool: 'general', severity: 'minor' });
      setShowModal(false);
      loadData();
    }
    setSubmitting(false);
  };

  return (
    <div className="mb-16">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Megaphone className="w-5 h-5 text-[#49B7E3]" />
        <h2 className="text-2xl font-semibold text-[#111111]">Feedback & Probleme</h2>
      </div>
      <p className="text-sm text-[#7A7A7A] text-center mb-6">
        Melde Bugs, wünsche dir Features -- und vote für Probleme die du auch hast.
      </p>

      <div className="flex items-center justify-between mb-4">
        <div className="flex bg-[#F4FCFE] rounded-[var(--vektrus-radius-md)] p-1">
          <button
            onClick={() => setActiveTab('bug')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-[var(--vektrus-radius-sm)] text-sm font-medium transition-all ${
              activeTab === 'bug' ? 'bg-white shadow-subtle text-[#111111]' : 'text-[#7A7A7A] hover:text-[#111111]'
            }`}
          >
            <Bug className="w-4 h-4" />
            Probleme melden
          </button>
          <button
            onClick={() => setActiveTab('feature')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-[var(--vektrus-radius-sm)] text-sm font-medium transition-all ${
              activeTab === 'feature' ? 'bg-white shadow-subtle text-[#111111]' : 'text-[#7A7A7A] hover:text-[#111111]'
            }`}
          >
            <Star className="w-4 h-4" />
            Feature-Wuensche
          </button>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#B6EBF7] hover:bg-[#49B7E3] text-[#111111] text-sm font-medium rounded-[var(--vektrus-radius-md)] transition-all"
        >
          <Plus className="w-4 h-4" />
          Neues Ticket
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-[#F4FCFE] rounded-[var(--vektrus-radius-md)] animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-[#7A7A7A] mb-3">Konnte nicht geladen werden</p>
          <button onClick={loadData} className="flex items-center gap-2 mx-auto text-sm text-[#49B7E3] font-medium">
            <RefreshCw className="w-4 h-4" />
            Erneut versuchen
          </button>
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-[var(--vektrus-radius-lg)] border border-[rgba(73,183,227,0.10)]">
          <p className="text-[#7A7A7A] mb-2">Noch keine {activeTab === 'bug' ? 'Probleme' : 'Feature-Wuensche'} gemeldet.</p>
          <button
            onClick={() => setShowModal(true)}
            className="text-sm text-[#49B7E3] font-medium hover:text-[#3AA0CC] transition-colors"
          >
            Erstelle den ersten Eintrag
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {tickets.map((ticket) => {
            const statusConf = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
            const hasVoted = userVotes.has(ticket.id);
            return (
              <div key={ticket.id} className="flex items-start gap-3 bg-white rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.10)] shadow-subtle p-4">
                <button
                  onClick={() => handleVote(ticket.id)}
                  className={`flex flex-col items-center gap-0.5 pt-0.5 min-w-[40px] ${
                    hasVoted ? 'text-[#49B7E3]' : 'text-[#7A7A7A] hover:text-[#49B7E3]'
                  } transition-colors`}
                >
                  <ChevronUp className={`w-5 h-5 ${hasVoted ? 'fill-[#49B7E3]/20' : ''}`} />
                  <span className="text-xs font-semibold">{ticket.vote_count}</span>
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-sm text-[#111111]">{ticket.title}</h4>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${statusConf.className}`}>
                      {statusConf.label}
                    </span>
                  </div>
                  <p className="text-xs text-[#7A7A7A] mt-1 line-clamp-2">{ticket.description}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-[var(--vektrus-radius-sm)] bg-[#F4FCFE] text-[#7A7A7A]">{TOOL_DISPLAY[ticket.tool] || ticket.tool}</span>
                    {ticket.severity && (
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-[var(--vektrus-radius-sm)] ${SEVERITY_COLORS[ticket.severity] || ''}`}>
                        {SEVERITY_LABELS[ticket.severity] || ticket.severity}
                      </span>
                    )}
                    <span className="text-[10px] text-[#7A7A7A]">{timeAgo(ticket.created_at)}</span>
                    {ticket.admin_response && (
                      <button
                        onClick={() => setExpandedResponse(expandedResponse === ticket.id ? null : ticket.id)}
                        className="text-[10px] text-[#49B7E3] flex items-center gap-0.5 font-medium hover:text-[#3AA0CC]"
                      >
                        <MessageCircle className="w-3 h-3" />
                        Antwort
                      </button>
                    )}
                  </div>
                  <AnimatePresence>
                    {expandedResponse === ticket.id && ticket.admin_response && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 p-3 bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] border border-[#B6EBF7]/30">
                          <p className="text-xs text-[#111111]">{ticket.admin_response}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[var(--vektrus-radius-lg)] shadow-card border border-[rgba(73,183,227,0.10)] p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-lg text-[#111111]">
                  {activeTab === 'bug' ? 'Problem melden' : 'Feature wuenschen'}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-[#7A7A7A] hover:text-[#111111]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-[#7A7A7A] block mb-1.5">Titel</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value.slice(0, 100) })}
                    placeholder="Kurze Beschreibung..."
                    className="w-full rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.18)] bg-white px-4 py-3 text-sm focus:outline-none focus:border-[#B6EBF7] transition-colors"
                    required
                  />
                  <span className="text-[10px] text-[#7A7A7A] mt-1 block text-right">{form.title.length}/100</span>
                </div>

                <div>
                  <label className="text-xs font-medium text-[#7A7A7A] block mb-1.5">Beschreibung</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value.slice(0, 500) })}
                    placeholder="Beschreibe das Problem oder deinen Wunsch..."
                    rows={3}
                    className="w-full rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.18)] bg-white px-4 py-3 text-sm focus:outline-none focus:border-[#B6EBF7] transition-colors resize-none"
                    required
                  />
                  <span className="text-[10px] text-[#7A7A7A] mt-1 block text-right">{form.description.length}/500</span>
                </div>

                <div>
                  <label className="text-xs font-medium text-[#7A7A7A] block mb-1.5">Betroffenes Tool</label>
                  <select
                    value={form.tool}
                    onChange={(e) => setForm({ ...form, tool: e.target.value })}
                    className="w-full rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.18)] bg-white px-4 py-3 text-sm focus:outline-none focus:border-[#B6EBF7] transition-colors"
                  >
                    {TOOL_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>

                {activeTab === 'bug' && (
                  <div>
                    <label className="text-xs font-medium text-[#7A7A7A] block mb-1.5">Schweregrad</label>
                    <select
                      value={form.severity}
                      onChange={(e) => setForm({ ...form, severity: e.target.value })}
                      className="w-full rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.18)] bg-white px-4 py-3 text-sm focus:outline-none focus:border-[#B6EBF7] transition-colors"
                    >
                      <option value="hint">Nur ein Hinweis</option>
                      <option value="minor">Nervig aber nutzbar</option>
                      <option value="blocking">Blockiert mich komplett</option>
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !form.title.trim() || !form.description.trim()}
                  className="w-full py-3 rounded-[var(--vektrus-radius-md)] font-medium text-sm bg-[#B6EBF7] text-[#111111] hover:bg-[#49B7E3] disabled:bg-[#B6EBF7]/20 disabled:text-[#7A7A7A]/70 disabled:cursor-not-allowed transition-all"
                >
                  {submitting ? 'Wird gesendet...' : 'Absenden'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
