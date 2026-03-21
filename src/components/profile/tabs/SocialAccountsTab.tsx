import React from 'react';
import { Check, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';
import type { LateAccount } from '../../../services/socialAccountService';
import SettingsCard from '../components/SettingsCard';

/* ------------------------------------------------------------------ */
/*  Platform definitions — third-party brand colors are intentional   */
/* ------------------------------------------------------------------ */

export interface SupportedPlatform {
  id: string;
  name: string;
  icon: React.ReactNode;
}

export const SUPPORTED_PLATFORMS: SupportedPlatform[] = [
  { id: 'instagram', name: 'Instagram', icon: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="ig-social-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFDC80" />
          <stop offset="25%" stopColor="#F77737" />
          <stop offset="50%" stopColor="#E1306C" />
          <stop offset="75%" stopColor="#C13584" />
          <stop offset="100%" stopColor="#833AB4" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="6" stroke="url(#ig-social-grad)" strokeWidth="2" />
      <circle cx="12" cy="12" r="4.5" stroke="url(#ig-social-grad)" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="url(#ig-social-grad)" />
    </svg>
  )},
  { id: 'linkedin', name: 'LinkedIn', icon: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#0A66C2">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )},
  { id: 'tiktok', name: 'TikTok', icon: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#111111">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V7.56a8.16 8.16 0 0 0 4.77 1.52v-3.39a4.85 4.85 0 0 1-1.04 0z" />
    </svg>
  )},
  { id: 'facebook', name: 'Facebook', icon: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )},
  { id: 'twitter', name: 'X (Twitter)', icon: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#111111">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )},
  { id: 'youtube', name: 'YouTube', icon: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#FF0000">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )},
  { id: 'threads', name: 'Threads', icon: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#111111">
      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.432 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.17.408-2.246 1.331-3.029.864-.733 2.05-1.146 3.431-1.196 1.132-.04 2.174.093 3.104.382-.02-.96-.175-1.746-.472-2.342-.386-.773-1.032-1.172-1.92-1.187h-.053c-.671 0-1.553.197-2.18.878l-1.476-1.378c.964-1.044 2.239-1.62 3.593-1.62h.087c2.648.06 4.12 1.835 4.316 5.197.093.026.186.054.277.084 1.095.366 1.97.944 2.598 1.72.876 1.08 1.2 2.42 1.025 3.903h0z" />
    </svg>
  )},
  { id: 'pinterest', name: 'Pinterest', icon: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#E60023">
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z" />
    </svg>
  )},
];

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export interface SocialAccountsTabProps {
  connectedAccounts: LateAccount[];
  isLoading: boolean;
  isSyncing: boolean;
  hasLateProfile: boolean;
  connectingPlatform: string | null;
  disconnectingAccount: string | null;
  showDisconnectConfirm: string | null;
  onConnect: (platformId: string) => void;
  onSync: () => void;
  onDisconnect: (lateAccountId: string, internalId: string, platformName: string) => void;
  onShowDisconnectConfirm: (accountId: string | null) => void;
}

/**
 * SocialAccountsTab — Social-Konten.
 *
 * Controlled component: all state and handlers live in ProfilePage.
 * This component is purely presentational.
 *
 * DO NOT modify: onConnect, onDisconnect, onSync handlers.
 * DO NOT change the LateAccount shape or service interactions.
 * Platform SVG icons use third-party brand colors intentionally.
 */
const SocialAccountsTab: React.FC<SocialAccountsTabProps> = ({
  connectedAccounts,
  isLoading,
  isSyncing,
  hasLateProfile,
  connectingPlatform,
  disconnectingAccount,
  showDisconnectConfirm,
  onConnect,
  onSync,
  onDisconnect,
  onShowDisconnectConfirm,
}) => {
  const getConnectedAccount = (platformId: string) =>
    connectedAccounts.find(a => a.platform === platformId);

  // Sync button shared between header and per-row
  const syncAction = hasLateProfile ? (
    <button
      onClick={onSync}
      disabled={isSyncing}
      className="
        flex items-center gap-2 px-3.5 py-2 text-sm font-medium
        bg-[var(--vektrus-mint)] hover:bg-[var(--vektrus-blue-light)]
        text-[var(--vektrus-anthrazit)]
        border border-[var(--vektrus-border-default)]
        rounded-[var(--vektrus-radius-sm)]
        transition-colors duration-150
        disabled:opacity-50
      "
    >
      {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
      <span>{isSyncing ? 'Synchronisiere...' : 'Alle synchronisieren'}</span>
    </button>
  ) : undefined;

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Verbundene Konten"
        description="Deine Social-Media-Konten, die mit Vektrus verbunden sind."
        action={syncAction}
      >
        {/* Loading state */}
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-7 h-7 text-[var(--vektrus-blue)] animate-spin" />
          </div>

        /* Late-profile warning */
        ) : !hasLateProfile ? (
          <div className="p-4 bg-amber-50 rounded-[var(--vektrus-radius-sm)] border border-[var(--vektrus-warning)]">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[var(--vektrus-warning-dark)] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-[var(--vektrus-anthrazit)] mb-1">
                  Verbindungsprofil erforderlich
                </h4>
                <p className="text-[13px] text-[var(--vektrus-gray)] leading-relaxed">
                  Um Social-Media-Konten zu verbinden, wird ein Verbindungsprofil benötigt.
                  Bitte kontaktiere den Support, um dein Profil einzurichten.
                </p>
              </div>
            </div>
          </div>

        /* Platform list */
        ) : (
          <div className="divide-y divide-[var(--vektrus-border-subtle)]">
            {SUPPORTED_PLATFORMS.map(platform => {
              const account = getConnectedAccount(platform.id);
              const isConnected = !!account;
              const isConnecting = connectingPlatform === platform.id;
              const isDisconnecting = disconnectingAccount === account?.id;

              return (
                <div key={platform.id} className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                  {/* Platform info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-[var(--vektrus-radius-sm)] bg-[var(--vektrus-mint)] flex items-center justify-center flex-shrink-0">
                      {platform.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[var(--vektrus-anthrazit)]">{platform.name}</span>
                        {isConnected && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--vektrus-success)]">
                            <Check className="w-3.5 h-3.5" />
                            Verbunden
                          </span>
                        )}
                      </div>
                      {isConnected ? (
                        <div className="text-[13px] text-[var(--vektrus-gray)] truncate">
                          {account.username || account.display_name || 'Verbunden'}
                          {account.updated_at && (
                            <span className="ml-2 text-xs">
                              · Sync {new Date(account.updated_at).toLocaleDateString('de-DE')}
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-[13px] text-[var(--vektrus-gray)]">Nicht verbunden</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isConnected ? (
                      <>
                        {/* Per-row sync */}
                        <button
                          onClick={onSync}
                          disabled={isSyncing}
                          className="
                            px-2.5 py-1.5 text-[13px]
                            text-[var(--vektrus-gray)] hover:text-[var(--vektrus-anthrazit)]
                            border border-[var(--vektrus-border-default)] hover:border-[var(--vektrus-blue-light)]
                            rounded-[var(--vektrus-radius-sm)]
                            transition-colors duration-150 disabled:opacity-50
                          "
                        >
                          {isSyncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Sync'}
                        </button>

                        {/* Disconnect flow */}
                        {showDisconnectConfirm === account.id ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => onDisconnect(account.late_account_id, account.id, platform.name)}
                              disabled={isDisconnecting}
                              className="
                                px-2.5 py-1.5 text-[13px] font-medium
                                text-white bg-[var(--vektrus-error)] hover:opacity-90
                                rounded-[var(--vektrus-radius-sm)]
                                transition-opacity duration-150 disabled:opacity-50
                              "
                            >
                              {isDisconnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Ja, trennen'}
                            </button>
                            <button
                              onClick={() => onShowDisconnectConfirm(null)}
                              className="
                                px-2.5 py-1.5 text-[13px]
                                text-[var(--vektrus-gray)]
                                border border-[var(--vektrus-border-default)]
                                rounded-[var(--vektrus-radius-sm)]
                                hover:bg-[var(--vektrus-mint)]
                                transition-colors duration-150
                              "
                            >
                              Abbrechen
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => onShowDisconnectConfirm(account.id)}
                            className="
                              px-2.5 py-1.5 text-[13px]
                              text-[var(--vektrus-error)]
                              hover:text-white hover:bg-[var(--vektrus-error)]
                              border border-[var(--vektrus-error)]
                              rounded-[var(--vektrus-radius-sm)]
                              transition-colors duration-150
                            "
                          >
                            Trennen
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        onClick={() => onConnect(platform.id)}
                        disabled={isConnecting}
                        className="
                          flex items-center gap-2 px-3.5 py-1.5 text-[13px] font-medium
                          bg-[var(--vektrus-mint)] hover:bg-[var(--vektrus-blue-light)]
                          text-[var(--vektrus-anthrazit)]
                          border border-[var(--vektrus-border-default)]
                          rounded-[var(--vektrus-radius-sm)]
                          transition-colors duration-150 disabled:opacity-50
                        "
                      >
                        {isConnecting ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Verbinde...</span>
                          </>
                        ) : (
                          <span>Verbinden</span>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SettingsCard>

      {/* Trust / help info */}
      <SettingsCard>
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-[var(--vektrus-anthrazit)]">
            Warum Konten verbinden?
          </h4>
          <ul className="text-[13px] text-[var(--vektrus-gray)] space-y-1.5 leading-relaxed">
            <li>Automatische Performance-Analyse deiner Kanäle</li>
            <li>Personalisierte Content-Empfehlungen basierend auf deinen Daten</li>
            <li>Optimale Posting-Zeiten für deine Audience</li>
            <li>Cross-Platform Content-Planung und -Veröffentlichung</li>
          </ul>
          <p className="text-[13px] text-[var(--vektrus-gray)] pt-1">
            Vektrus speichert keine Zugangsdaten. Die Verbindung erfolgt sicher über OAuth.
          </p>
        </div>
      </SettingsCard>
    </div>
  );
};

export default SocialAccountsTab;
