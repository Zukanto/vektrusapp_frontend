import React, { useState } from 'react';
import { X, RefreshCw, Loader as Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface RegenerateDesignModalProps {
  postId: string;
  currentImageUrl?: string;
  onClose: () => void;
  onSuccess: (newDesignUrl: string) => void;
}

const REGENERATE_ENDPOINT = 'https://n8n.vektrus.ai/webhook/vektrus-regenerate-design';
const POLL_INTERVAL_MS = 3000;
const POLL_MAX_ATTEMPTS = 30;

async function pollForDesignUpdate(
  contentRecordId: string
): Promise<{ success: boolean; design_url?: string; status?: string; message: string }> {
  for (let i = 0; i < POLL_MAX_ATTEMPTS; i++) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

    const { data, error } = await supabase
      .from('pulse_generated_content')
      .select('content')
      .eq('id', contentRecordId)
      .maybeSingle();

    if (error || !data) continue;

    const content =
      typeof data.content === 'string' ? JSON.parse(data.content) : data.content;

    const status: string | undefined = content?.design_status;

    if (status === 'regenerating') continue;

    if (status === 'success' && content?.design_url) {
      return {
        success: true,
        design_url: content.design_url,
        status,
        message: content.design_status_message || 'Design erfolgreich neu generiert!',
      };
    }

    if (
      status?.startsWith('failed_') ||
      status === 'no_brand_profile' ||
      status === 'skipped'
    ) {
      return {
        success: false,
        status,
        message: content.design_status_message || 'Design-Generierung fehlgeschlagen.',
      };
    }
  }

  return {
    success: false,
    status: 'timeout',
    message: 'Die Regeneration dauert ungewöhnlich lange. Bitte lade die Seite später neu.',
  };
}

const RegenerateDesignModal: React.FC<RegenerateDesignModalProps> = ({
  postId,
  currentImageUrl,
  onClose,
  onSuccess,
}) => {
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleRegenerate = async () => {
    setIsLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('Nicht eingeloggt');
      }

      const response = await fetch(REGENERATE_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content_record_id: postId,
          user_feedback: feedback.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Anfrage fehlgeschlagen (${response.status})`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Regeneration konnte nicht gestartet werden.');
      }

      const pollResult = await pollForDesignUpdate(postId);
      setResult({ success: pollResult.success, message: pollResult.message });

      if (pollResult.success && pollResult.design_url) {
        onSuccess(pollResult.design_url);
      }
    } catch (err: any) {
      setResult({ success: false, message: err.message || 'Unbekannter Fehler.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[var(--vektrus-radius-lg)] max-w-md w-full shadow-modal overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[rgba(73,183,227,0.10)]">
          <h3 className="text-base font-semibold text-[#111111]">Design neu generieren</h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-[var(--vektrus-radius-sm)] hover:bg-[#F4FCFE] transition-colors disabled:opacity-40"
          >
            <X className="w-4 h-4 text-[#7A7A7A]" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {currentImageUrl && (
            <div className="rounded-[var(--vektrus-radius-md)] overflow-hidden border border-[rgba(73,183,227,0.18)] aspect-square bg-[#F4FCFE]">
              <img
                src={currentImageUrl}
                alt="Aktuelles Design"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div>
            <label className="block text-[13px] font-medium text-[#111111] mb-1.5">
              Feedback <span className="font-normal text-[#7A7A7A]">(optional)</span>
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder='z.B. "Die Saison sollte 25/26 sein. Schrift größer machen."'
              rows={3}
              disabled={isLoading}
              className="w-full border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] px-3 py-2.5 text-[13px] text-[#111111] placeholder:text-[#B0B0B0] focus:outline-none focus:border-[#49B7E3] focus:ring-1 focus:ring-[#49B7E3] resize-none disabled:bg-[#F4FCFE] disabled:opacity-60 transition-colors"
            />
            <p className="text-[11px] text-[#7A7A7A] mt-1">
              Beschreibe was geändert werden soll. Leer lassen für eine komplett neue Version.
            </p>
          </div>

          {isLoading && (
            <div className="flex items-center gap-3 p-3 rounded-[var(--vektrus-radius-md)]" style={{ backgroundColor: '#F4FCFE', border: '1px solid #B6EBF7' }}>
              <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" style={{ color: '#49B7E3' }} />
              <div>
                <p className="text-[13px] font-medium text-[#111111]">Design wird generiert…</p>
                <p className="text-[11px] text-[#7A7A7A]">Das dauert ca. 30–90 Sekunden.</p>
              </div>
            </div>
          )}

          {result && !isLoading && (
            <div
              className="p-3 rounded-[var(--vektrus-radius-md)] text-[13px]"
              style={{
                backgroundColor: result.success ? '#F0FBF4' : '#FEF2F2',
                border: `1px solid ${result.success ? '#49D69E' : '#FA7E70'}`,
                color: result.success ? '#1a6b3c' : '#9b2335',
              }}
            >
              {result.message}
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 pb-5">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] text-[13px] font-medium text-[#7A7A7A] hover:bg-[#F4FCFE] disabled:opacity-40 transition-colors"
          >
            {result ? 'Schließen' : 'Abbrechen'}
          </button>
          {!result && (
            <button
              onClick={handleRegenerate}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-[var(--vektrus-radius-md)] text-[13px] font-medium text-white disabled:opacity-50 transition-colors"
              style={{ backgroundColor: '#49B7E3' }}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {isLoading ? 'Generiert…' : 'Neu generieren'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegenerateDesignModal;
