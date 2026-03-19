import React, { useEffect, useState } from 'react';
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import { SocialAccountService } from '../../services/socialAccountService';

interface CallbackParams {
  connected?: string;
  profileId?: string;
  username?: string;
  error?: string;
}

const SocialAuthCallback: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [platform, setPlatform] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const callbackParams: CallbackParams = {
        connected: params.get('connected') || undefined,
        profileId: params.get('profileId') || undefined,
        username: params.get('username') || undefined,
        error: params.get('error') || undefined,
      };

      if (callbackParams.error) {
        setStatus('error');
        setErrorMessage(callbackParams.error);
        return;
      }

      if (callbackParams.connected) {
        setPlatform(callbackParams.connected);
        setUsername(callbackParams.username || '');

        const syncResult = await SocialAccountService.syncAccounts();

        if (syncResult.success) {
          setStatus('success');

          setTimeout(() => {
            if (window.opener) {
              window.close();
            } else {
              window.location.href = '/profile?tab=accounts';
            }
          }, 2000);
        } else {
          setStatus('error');
          setErrorMessage(syncResult.message || 'Synchronisation fehlgeschlagen');
        }
      } else {
        setStatus('error');
        setErrorMessage('Keine Verbindungsdaten erhalten');
      }
    };

    handleCallback();
  }, []);

  const getPlatformLabel = (p: string): string => {
    const labels: Record<string, string> = {
      instagram: 'Instagram',
      facebook: 'Facebook',
      linkedin: 'LinkedIn',
      twitter: 'X (Twitter)',
      tiktok: 'TikTok',
      youtube: 'YouTube',
      threads: 'Threads',
      pinterest: 'Pinterest',
      reddit: 'Reddit',
      bluesky: 'Bluesky',
      googlebusiness: 'Google Business',
      telegram: 'Telegram',
      snapchat: 'Snapchat',
    };
    return labels[p] || p;
  };

  return (
    <div className="min-h-screen bg-[#F4FCFE] flex items-center justify-center p-6">
      <div className="bg-white rounded-[var(--vektrus-radius-lg)] shadow-card p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 bg-[#B6EBF7] rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-[#49B7E3] animate-spin" />
            </div>
            <h1 className="text-xl font-bold text-[#111111] mb-2">
              Verbindung wird hergestellt...
            </h1>
            <p className="text-[#7A7A7A]">
              Bitte warte einen Moment, während wir dein Konto synchronisieren.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-[#49D69E] rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-[#111111] mb-2">
              {getPlatformLabel(platform)} erfolgreich verbunden!
            </h1>
            {username && (
              <p className="text-[#7A7A7A] mb-4">
                Account: <span className="font-medium text-[#111111]">{username}</span>
              </p>
            )}
            <p className="text-sm text-[#7A7A7A]">
              Dieses Fenster schliesst sich automatisch...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-[#FA7E70] rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-[#111111] mb-2">
              Verbindung fehlgeschlagen
            </h1>
            <p className="text-[#7A7A7A] mb-6">
              {errorMessage || 'Ein unbekannter Fehler ist aufgetreten.'}
            </p>
            <button
              onClick={() => window.close()}
              className="px-6 py-3 bg-[#B6EBF7] hover:bg-[#49B7E3] text-[#111111] rounded-[var(--vektrus-radius-md)] font-medium transition-colors"
            >
              Fenster schließen
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SocialAuthCallback;
