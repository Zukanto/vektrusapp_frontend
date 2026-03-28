import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Share2, Check, Loader2, Shield, ArrowRight, ArrowLeft } from 'lucide-react';
import { callN8n } from '../../lib/n8n';
import { supabase } from '../../lib/supabase';

interface ConnectedAccount {
  platform: string;
  username: string | null;
  display_name: string | null;
  is_active: boolean;
}

interface StepConnectAccountsProps {
  onNext: () => void;
  onBack: () => void;
}

// ── Platform definitions with tint colors ──────────────────────────────

const ONBOARDING_PLATFORMS = [
  {
    id: 'instagram',
    name: 'Instagram',
    tint: 'rgba(225, 48, 108, 0.06)',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="ig-onb-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFDC80" />
            <stop offset="25%" stopColor="#F77737" />
            <stop offset="50%" stopColor="#E1306C" />
            <stop offset="75%" stopColor="#C13584" />
            <stop offset="100%" stopColor="#833AB4" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="20" height="20" rx="6" stroke="url(#ig-onb-grad)" strokeWidth="2" />
        <circle cx="12" cy="12" r="4.5" stroke="url(#ig-onb-grad)" strokeWidth="2" />
        <circle cx="17.5" cy="6.5" r="1.5" fill="url(#ig-onb-grad)" />
      </svg>
    ),
  },
  {
    id: 'facebook',
    name: 'Facebook',
    tint: 'rgba(24, 119, 242, 0.06)',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    tint: 'rgba(10, 102, 194, 0.06)',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#0A66C2">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    tint: 'rgba(17, 17, 17, 0.04)',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#111111">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V7.56a8.16 8.16 0 0 0 4.77 1.52v-3.39a4.85 4.85 0 0 1-1.04 0z" />
      </svg>
    ),
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    tint: 'rgba(17, 17, 17, 0.03)',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#111111">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

// ── Component ──────────────────────────────────────────────────────────

const StepConnectAccounts: React.FC<StepConnectAccountsProps> = ({ onNext, onBack }) => {
  const location = useLocation();
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Prüfe ob Late Profile existiert, erstelle es falls nötig (Safety-Net)
  const ensureLateProfile = useCallback(async (userId: string): Promise<boolean> => {
    const { data } = await supabase
      .from('late_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (data) return true;

    // Late Profile fehlt — activate nachholen
    try {
      const result = await callN8n('vektrus-activate-user', {});
      return !!result.success;
    } catch {
      return false;
    }
  }, []);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Safety-Net: Late Profile sicherstellen bevor Accounts geladen werden
      const profileReady = await ensureLateProfile(session.user.id);
      if (!profileReady) {
        setError('Dein Profil konnte nicht eingerichtet werden. Bitte gehe zurück zu Schritt 1 und versuche es erneut.');
        return;
      }

      const { data } = await supabase
        .from('late_accounts')
        .select('platform, username, display_name, is_active')
        .eq('user_id', session.user.id)
        .eq('is_active', true);

      setConnectedAccounts(data || []);
    } catch (err) {
      console.error('Accounts laden fehlgeschlagen:', err);
    } finally {
      setLoading(false);
    }
  }, [ensureLateProfile]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const connectedPlatform = params.get('connected');

    if (connectedPlatform) {
      const syncAfterCallback = async () => {
        setSyncing(true);
        try {
          const syncResult = await callN8n('vektrus-sync-accounts', {});
          if (syncResult.success) {
            await loadAccounts();
            setSuccessMessage(`${connectedPlatform} erfolgreich verbunden!`);
            setTimeout(() => setSuccessMessage(null), 4000);
          } else {
            setError('Synchronisierung fehlgeschlagen. Bitte versuche es erneut.');
          }
        } catch {
          setError('Synchronisierung fehlgeschlagen.');
        } finally {
          setSyncing(false);
          // URL-Parameter entfernen ohne Remount
          window.history.replaceState({}, '', '/onboarding?step=3');
        }
      };
      syncAfterCallback();
    } else {
      loadAccounts();
    }
  }, [location.search, loadAccounts]);

  const handleConnect = async (platformId: string) => {
    setConnectingPlatform(platformId);
    setError(null);
    try {
      const result = await callN8n('vektrus-connect-social', {
        platform: platformId,
        redirect_url: `${window.location.origin}/onboarding?step=3&connected=${platformId}`,
      });

      if (result.success && result.authUrl) {
        window.location.href = result.authUrl;
      } else {
        setError(result.message || 'Verbindung fehlgeschlagen. Bitte versuche es erneut.');
      }
    } catch {
      setError('Verbindung fehlgeschlagen. Bitte überprüfe deine Internetverbindung.');
    } finally {
      setConnectingPlatform(null);
    }
  };

  const getConnectedAccount = (platformId: string) =>
    connectedAccounts.find((a) => a.platform === platformId);

  const hasAnyConnected = connectedAccounts.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[rgba(73,183,227,0.10)] mb-4">
          <Share2 className="w-6 h-6 text-[var(--vektrus-blue)]" />
        </div>
        <p className="text-xs text-[var(--vektrus-gray)] uppercase tracking-wider font-medium mb-1.5">
          Schritt 3 von 4
        </p>
        <h2 className="font-manrope text-[26px] font-bold text-[var(--vektrus-anthrazit)] leading-tight">
          Verbinde deine Social-Media-Konten
        </h2>
        <p className="mt-2 text-[15px] text-[var(--vektrus-gray)] max-w-md mx-auto">
          Vektrus braucht Zugriff, um Inhalte zu planen, zu posten und Statistiken auszuwerten.
        </p>
      </div>

      <div className="border-t border-[rgba(73,183,227,0.08)] pt-6" />

      {/* Success message */}
      {successMessage && (
        <div className="rounded-xl bg-[rgba(73,214,158,0.08)] border border-[rgba(73,214,158,0.15)] px-4 py-3 text-[14px] text-[var(--vektrus-success)] flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          {successMessage}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-[rgba(250,126,112,0.08)] border border-[rgba(250,126,112,0.15)] px-4 py-3 text-[14px] text-[var(--vektrus-error)]">
          {error}
        </div>
      )}

      {/* Platform grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-[var(--vektrus-blue)] animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ONBOARDING_PLATFORMS.map((platform) => {
            const account = getConnectedAccount(platform.id);
            const isConnected = !!account;
            const isConnecting = connectingPlatform === platform.id;

            return (
              <div
                key={platform.id}
                className={`
                  flex items-center justify-between gap-3 rounded-xl border p-4 transition-all duration-200
                  ${isConnected
                    ? 'border-[rgba(73,214,158,0.25)] bg-[rgba(73,214,158,0.04)]'
                    : 'border-[rgba(73,183,227,0.12)] bg-white hover:border-[rgba(73,183,227,0.25)] hover:shadow-[0_2px_12px_rgba(73,183,227,0.06)]'
                  }
                `}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: platform.tint }}
                  >
                    {platform.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium text-[var(--vektrus-anthrazit)]">
                      {platform.name}
                    </p>
                    {isConnected ? (
                      <p className="text-[12px] text-[var(--vektrus-success)] flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        {account.username || account.display_name || 'Verbunden'}
                      </p>
                    ) : (
                      <p className="text-[12px] text-[var(--vektrus-gray)]">Nicht verbunden</p>
                    )}
                  </div>
                </div>

                {isConnected ? (
                  <span className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-[rgba(73,214,158,0.10)] px-3 py-1.5 text-[12px] font-medium text-[var(--vektrus-success)]">
                    <Check className="w-3.5 h-3.5" />
                    Verbunden
                  </span>
                ) : (
                  <button
                    onClick={() => handleConnect(platform.id)}
                    disabled={connectingPlatform !== null || syncing}
                    className="shrink-0 flex items-center gap-2 rounded-xl border border-[var(--vektrus-blue)] px-3.5 py-1.5 text-[12px] font-medium text-[var(--vektrus-blue)] hover:bg-[rgba(73,183,227,0.06)] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Verbinde…
                      </>
                    ) : (
                      'Verbinden'
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Trust info */}
      <div className="flex items-center justify-center gap-2 text-[12px] text-[var(--vektrus-gray)]">
        <Shield className="w-3.5 h-3.5 text-[var(--vektrus-blue)]" />
        <span>Vektrus benötigt niemals deine Login-Daten. Die Verbindung kann jederzeit getrennt werden.</span>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-2">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--vektrus-gray)] hover:text-[var(--vektrus-anthrazit)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück
        </button>
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 bg-[var(--vektrus-blue)] text-white rounded-xl px-6 py-2.5 text-[14px] font-semibold hover:bg-[#3a9fd1] transition-all duration-150 shadow-[0_2px_8px_rgba(73,183,227,0.2)] hover:shadow-[0_4px_16px_rgba(73,183,227,0.25)]"
        >
          Weiter
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Skip link */}
      {!hasAnyConnected && (
        <div className="text-center">
          <button
            onClick={onNext}
            className="text-[13px] text-[var(--vektrus-gray)] underline underline-offset-2 hover:text-[var(--vektrus-anthrazit)] transition-colors"
          >
            Später verbinden – du kannst Accounts jederzeit unter Einstellungen hinzufügen.
          </button>
        </div>
      )}
    </div>
  );
};

export default StepConnectAccounts;
