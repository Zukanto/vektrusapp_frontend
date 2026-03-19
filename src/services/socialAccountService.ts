import { supabase } from '../lib/supabase';

export interface LateAccount {
  id: string;
  user_id: string;
  late_profile_id: string;
  late_account_id: string;
  platform: string;
  username: string | null;
  display_name: string | null;
  profile_picture: string | null;
  platform_user_id: string | null;
  account_type: string | null;
  late_api_data: Record<string, unknown> | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

async function getInternalUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  return data?.id || null;
}

export interface ConnectResponse {
  success: boolean;
  authUrl?: string;
  platform?: string;
  error?: string;
  message?: string;
}

export interface SyncResponse {
  success: boolean;
  synced?: number;
  accounts?: Array<{
    platform: string;
    username: string | null;
    display_name: string | null;
    is_active: boolean;
  }>;
  error?: string;
  message?: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export const SocialAccountService = {
  async getConnectedAccounts(): Promise<LateAccount[]> {
    const internalUserId = await getInternalUserId();
    if (!internalUserId) return [];

    const { data, error } = await supabase
      .from('late_accounts')
      .select('*')
      .eq('user_id', internalUserId)
      .eq('is_active', true)
      .order('platform', { ascending: true });

    if (error) {
      console.error('Error fetching connected accounts:', error);
      return [];
    }

    return data || [];
  },

  async getAllAccounts(): Promise<LateAccount[]> {
    const internalUserId = await getInternalUserId();
    if (!internalUserId) return [];

    const { data, error } = await supabase
      .from('late_accounts')
      .select('*')
      .eq('user_id', internalUserId)
      .order('platform', { ascending: true });

    if (error) {
      console.error('Error fetching all accounts:', error);
      return [];
    }

    return data || [];
  },

  async connectPlatform(platform: string, redirectUrl: string): Promise<ConnectResponse> {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        return { success: false, error: 'UNAUTHORIZED', message: 'Nicht angemeldet' };
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/social-connect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform,
          redirect_url: redirectUrl
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error, message: data.message };
      }

      return data;
    } catch (error) {
      console.error('Error connecting platform:', error);
      return { success: false, error: 'NETWORK_ERROR', message: 'Verbindungsfehler' };
    }
  },

  async syncAccounts(): Promise<SyncResponse> {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        return { success: false, error: 'UNAUTHORIZED', message: 'Nicht angemeldet' };
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/sync-accounts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error, message: data.message };
      }

      return data;
    } catch (error) {
      console.error('Error syncing accounts:', error);
      return { success: false, error: 'NETWORK_ERROR', message: 'Verbindungsfehler' };
    }
  },

  async disconnectAccount(lateAccountId: string): Promise<{ success: boolean; error?: string; message?: string }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        return { success: false, error: 'UNAUTHORIZED', message: 'Nicht angemeldet' };
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/social-disconnect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accountId: lateAccountId })
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error, message: data.message };
      }

      return data;
    } catch (error) {
      console.error('Error disconnecting account:', error);
      return { success: false, error: 'NETWORK_ERROR', message: 'Verbindungsfehler' };
    }
  },

  async hasLateProfile(): Promise<boolean> {
    const internalUserId = await getInternalUserId();
    if (!internalUserId) return false;

    const { data } = await supabase
      .from('late_profiles')
      .select('id')
      .eq('user_id', internalUserId)
      .maybeSingle();

    return !!data;
  },

  openAuthPopup(authUrl: string, onSuccess?: () => void): Window | null {
    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      authUrl,
      'social-auth',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
    );

    if (popup && onSuccess) {
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          onSuccess();
        }
      }, 500);
    }

    return popup;
  }
};
