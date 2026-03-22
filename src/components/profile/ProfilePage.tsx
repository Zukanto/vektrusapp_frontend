import React, { useState, useEffect } from 'react';
import { User, Building, Palette } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../ui/toast';
import ModuleWrapper from '../ui/ModuleWrapper';
import { supabase } from '../../lib/supabase';
import { SocialAccountService, LateAccount } from '../../services/socialAccountService';
import SettingsNav from './components/SettingsNav';
import ProfileTab, { type ProfileData } from './tabs/ProfileTab';
import NotificationsTab, { type NotificationSettings, NOTIFICATION_DEFAULTS } from './tabs/NotificationsTab';
import SecurityTab from './tabs/SecurityTab';
import BillingTab from './tabs/BillingTab';
import SocialAccountsTab from './tabs/SocialAccountsTab';
import { SETTINGS_TABS } from './constants';

const ProfilePage: React.FC = () => {
  const { user, userProfile, signOut, updateProfile, refreshProfile } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<string>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: userProfile?.first_name || user?.first_name || '',
    lastName: userProfile?.last_name || '',
    email: userProfile?.email || user?.email || '',
    company: userProfile?.company_name || '',
    role: userProfile?.role || '',
    bio: userProfile?.bio || '',
    website: userProfile?.website || '',
    joinDate: userProfile?.created_at || new Date().toISOString(),
    avatar: userProfile?.avatar_url || ''
  });

  useEffect(() => {
    if (userProfile) {
      setProfileData({
        firstName: userProfile.first_name || '',
        lastName: userProfile.last_name || '',
        email: userProfile.email || '',
        company: userProfile.company_name || '',
        role: userProfile.role || '',
        bio: userProfile.bio || '',
        website: userProfile.website || '',
        joinDate: userProfile.created_at || new Date().toISOString(),
        avatar: userProfile.avatar_url || ''
      });
    }
  }, [userProfile]);

  const [connectedAccounts, setConnectedAccounts] = useState<LateAccount[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [disconnectingAccount, setDisconnectingAccount] = useState<string | null>(null);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState<string | null>(null);
  const [hasLateProfile, setHasLateProfile] = useState(false);

  // Brand logo — used as fallback profile picture
  const [brandLogoUrl, setBrandLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadBrandLogo = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase
        .from('brand_profiles')
        .select('logo_url')
        .eq('user_id', session.user.id)
        .maybeSingle();
      if (data?.logo_url) setBrandLogoUrl(data.logo_url);
    };
    loadBrandLogo();
  }, []);

  // Avatar upload handler
  const handleAvatarUpload = async (file: File) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filePath = `${session.user.id}/profile/avatar.${ext}`;

    const { error } = await supabase.storage
      .from('brand-assets')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (error) {
      addToast({ type: 'error', title: 'Upload fehlgeschlagen', description: error.message });
      return;
    }

    const { data: urlData } = supabase.storage
      .from('brand-assets')
      .getPublicUrl(filePath);

    const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;
    setProfileData(prev => ({ ...prev, avatar: avatarUrl }));

    await updateProfile({ avatar_url: avatarUrl });
    await refreshProfile();
    addToast({ type: 'success', title: 'Profilbild aktualisiert', description: 'Dein neues Profilbild wurde gespeichert.' });
  };

  // Notification settings — state lives here so it survives tab switches
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(NOTIFICATION_DEFAULTS);
  const handleNotificationChange = (key: keyof NotificationSettings, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [key]: value }));
  };

  const loadConnectedAccounts = async () => {
    setIsLoadingAccounts(true);
    try {
      const accounts = await SocialAccountService.getConnectedAccounts();
      setConnectedAccounts(accounts);
      const hasProfile = await SocialAccountService.hasLateProfile();
      setHasLateProfile(hasProfile);
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'social') {
      loadConnectedAccounts();
    }
  }, [activeTab]);

  const handleSaveProfile = async () => {
    // Validation
    if (!profileData.firstName || profileData.firstName.trim().length < 2) {
      addToast({
        type: 'error',
        title: 'Validierungsfehler',
        description: 'Vorname muss mindestens 2 Zeichen lang sein.',
      });
      return;
    }

    if (profileData.website && !isValidUrl(profileData.website)) {
      addToast({
        type: 'error',
        title: 'Validierungsfehler',
        description: 'Bitte gib eine gültige Website-URL ein (z.B. https://example.com).',
      });
      return;
    }

    if (profileData.bio && profileData.bio.length > 500) {
      addToast({
        type: 'error',
        title: 'Validierungsfehler',
        description: 'Bio darf maximal 500 Zeichen lang sein.',
      });
      return;
    }

    setIsSaving(true);

    try {
      const { success, error } = await updateProfile({
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        company_name: profileData.company,
        role: profileData.role,
        website: profileData.website,
        bio: profileData.bio,
        avatar_url: profileData.avatar
      });

      if (success) {
        setIsEditing(false);
        await refreshProfile();
        addToast({
          type: 'success',
          title: 'Profil gespeichert',
          description: 'Deine Änderungen wurden erfolgreich gespeichert.',
        });
      } else {
        addToast({
          type: 'error',
          title: 'Fehler beim Speichern',
          description: error?.message || 'Profil konnte nicht gespeichert werden.',
        });
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Fehler beim Speichern',
        description: 'Ein unerwarteter Fehler ist aufgetreten.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isValidUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (userProfile) {
      setProfileData({
        firstName: userProfile.first_name || '',
        lastName: userProfile.last_name || '',
        email: userProfile.email || '',
        company: userProfile.company_name || '',
        role: userProfile.role || '',
        bio: userProfile.bio || '',
        website: userProfile.website || '',
        joinDate: userProfile.created_at || new Date().toISOString(),
        avatar: userProfile.avatar_url || ''
      });
    }
  };

  const handleConnectAccount = async (platform: string) => {
    if (!hasLateProfile) {
      addToast({
        type: 'error',
        title: 'Kein Late-Profil',
        description: 'Bitte kontaktiere den Support um dein Late-Profil einzurichten.',
      });
      return;
    }

    setConnectingPlatform(platform);

    try {
      const redirectUrl = `${window.location.origin}/profile/callback`;
      const result = await SocialAccountService.connectPlatform(platform, redirectUrl);

      if (result.success && result.authUrl) {
        SocialAccountService.openAuthPopup(result.authUrl, async () => {
          await loadConnectedAccounts();
          addToast({
            type: 'success',
            title: 'Account synchronisiert',
            description: 'Die Kontenliste wurde aktualisiert.',
          });
        });
      } else {
        addToast({
          type: 'error',
          title: 'Verbindung fehlgeschlagen',
          description: result.message || 'Konnte OAuth-URL nicht abrufen.',
        });
      }
    } catch (error) {
      console.error('Error connecting account:', error);
      addToast({
        type: 'error',
        title: 'Verbindungsfehler',
        description: 'Ein unerwarteter Fehler ist aufgetreten.',
      });
    } finally {
      setConnectingPlatform(null);
    }
  };

  const handleSyncAccounts = async () => {
    setIsSyncing(true);

    try {
      const result = await SocialAccountService.syncAccounts();

      if (result.success) {
        await loadConnectedAccounts();
        addToast({
          type: 'success',
          title: 'Synchronisation erfolgreich',
          description: `${result.synced || 0} Konten wurden aktualisiert.`,
        });
      } else {
        addToast({
          type: 'error',
          title: 'Synchronisation fehlgeschlagen',
          description: result.message || 'Konten konnten nicht synchronisiert werden.',
        });
      }
    } catch (error) {
      console.error('Error syncing accounts:', error);
      addToast({
        type: 'error',
        title: 'Synchronisationsfehler',
        description: 'Ein unerwarteter Fehler ist aufgetreten.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnectAccount = async (lateAccountId: string, internalId: string, platform: string) => {
    setDisconnectingAccount(internalId);

    try {
      const result = await SocialAccountService.disconnectAccount(lateAccountId);

      if (result.success) {
        setConnectedAccounts(prev => prev.filter(a => a.id !== internalId));
        addToast({
          type: 'info',
          title: `${platform} getrennt`,
          description: 'Account wurde erfolgreich getrennt.',
        });
      } else {
        addToast({
          type: 'error',
          title: 'Fehler beim Trennen',
          description: result.message || 'Account konnte nicht getrennt werden.',
        });
      }
    } catch (error) {
      console.error('Error disconnecting account:', error);
      addToast({
        type: 'error',
        title: 'Fehler',
        description: 'Ein unerwarteter Fehler ist aufgetreten.',
      });
    } finally {
      setDisconnectingAccount(null);
      setShowDisconnectConfirm(null);
    }
  };

  const activeTabDef = SETTINGS_TABS.find(t => t.id === activeTab);

  const renderWorkspaceTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-[var(--vektrus-radius-md)] shadow-subtle border border-[var(--vektrus-border-default)] p-6">
        <h3 className="text-[15px] font-semibold font-manrope text-[var(--vektrus-anthrazit)] mb-1">Workspace-Informationen</h3>
        <p className="text-sm text-[var(--vektrus-gray)] mb-5">Dein Arbeitsbereich bei Vektrus.</p>
        <div className="flex items-center gap-4 py-3 border-t border-[var(--vektrus-border-subtle)]">
          <div className="w-10 h-10 rounded-[var(--vektrus-radius-sm)] bg-[var(--vektrus-mint)] flex items-center justify-center">
            <Building className="w-5 h-5 text-[var(--vektrus-blue)]" />
          </div>
          <div>
            <div className="text-sm font-medium text-[var(--vektrus-anthrazit)]">{profileData.company || 'Kein Unternehmen hinterlegt'}</div>
            <div className="text-[13px] text-[var(--vektrus-gray)]">Workspace</div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-[var(--vektrus-radius-md)] shadow-subtle border border-[var(--vektrus-border-default)] p-6">
        <div className="flex flex-col items-center justify-center text-center py-6">
          <div className="w-12 h-12 bg-[var(--vektrus-mint)] rounded-[var(--vektrus-radius-md)] flex items-center justify-center mb-3">
            <User className="w-6 h-6 text-[var(--vektrus-blue)]" />
          </div>
          <h3 className="text-sm font-semibold text-[var(--vektrus-anthrazit)] font-manrope mb-1">Teamfunktionen</h3>
          <p className="text-[13px] text-[var(--vektrus-gray)] max-w-xs leading-relaxed">
            Mitgliederverwaltung, Rollen und Einladungen werden in einer zukünftigen Version verfügbar sein.
          </p>
        </div>
      </div>
    </div>
  );

  const renderBrandAiTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-[var(--vektrus-radius-md)] shadow-subtle border border-[var(--vektrus-border-default)] p-6">
        <h3 className="text-[15px] font-semibold font-manrope text-[var(--vektrus-anthrazit)] mb-1">Dein Markenprofil</h3>
        <p className="text-sm text-[var(--vektrus-gray)] mb-5">
          Im Brand Studio analysiert Vektrus deine Marke und erstellt ein personalisiertes Profil für alle KI-generierten Inhalte.
        </p>
        <button
          onClick={() => window.dispatchEvent(new Event('navigate-to-brand-studio'))}
          className="
            inline-flex items-center gap-2 px-4 py-2.5
            bg-[var(--vektrus-mint)] hover:bg-[var(--vektrus-blue-light)]
            text-[var(--vektrus-anthrazit)] text-sm font-medium
            rounded-[var(--vektrus-radius-sm)]
            border border-[var(--vektrus-border-default)]
            transition-colors duration-150
          "
        >
          <Palette className="w-4 h-4 text-[var(--vektrus-blue)]" />
          Brand Studio öffnen
        </button>
      </div>
      <div className="bg-white rounded-[var(--vektrus-radius-md)] shadow-subtle border border-[var(--vektrus-border-default)] p-6">
        <h3 className="text-[15px] font-semibold font-manrope text-[var(--vektrus-anthrazit)] mb-1">KI-Personalisierung</h3>
        <p className="text-sm text-[var(--vektrus-gray)] leading-relaxed">
          Vektrus nutzt dein Markenprofil, um Tonalität, Stil und Inhalte an dein Unternehmen anzupassen.
          Je vollständiger dein Markenprofil ist, desto besser werden die Ergebnisse.
        </p>
      </div>
    </div>
  );

  return (
    <ModuleWrapper module="profile" showTopAccent={true}>
      <div className="h-full bg-[var(--vektrus-mint)] overflow-auto">
        <div className="max-w-[1240px] mx-auto px-6 py-6 lg:px-8 lg:py-8">

          {/* Page header */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl font-bold font-manrope text-[var(--vektrus-anthrazit)] mb-1">
              Einstellungen
            </h1>
            {activeTabDef && (
              <p className="text-sm text-[var(--vektrus-gray)]">
                {activeTabDef.description}
              </p>
            )}
          </div>

          {/* Settings layout: nav + content */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

            {/* Left navigation */}
            <SettingsNav activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Right content area */}
            <div className="flex-1 min-w-0">
              {/* Extracted tabs */}
              {activeTab === 'profile' && (
                <ProfileTab
                  profileData={profileData}
                  onProfileDataChange={setProfileData}
                  isEditing={isEditing}
                  onEditingChange={setIsEditing}
                  isSaving={isSaving}
                  onSave={handleSaveProfile}
                  onCancel={handleCancelEdit}
                  connectedAccountsCount={connectedAccounts.filter(a => a.is_active).length}
                  brandLogoUrl={brandLogoUrl}
                  onAvatarUpload={handleAvatarUpload}
                />
              )}
              {activeTab === 'notifications' && (
                <NotificationsTab
                  settings={notificationSettings}
                  onChange={handleNotificationChange}
                />
              )}

              {activeTab === 'social' && (
                <SocialAccountsTab
                  connectedAccounts={connectedAccounts}
                  isLoading={isLoadingAccounts}
                  isSyncing={isSyncing}
                  hasLateProfile={hasLateProfile}
                  connectingPlatform={connectingPlatform}
                  disconnectingAccount={disconnectingAccount}
                  showDisconnectConfirm={showDisconnectConfirm}
                  onConnect={handleConnectAccount}
                  onSync={handleSyncAccounts}
                  onDisconnect={handleDisconnectAccount}
                  onShowDisconnectConfirm={setShowDisconnectConfirm}
                />
              )}
              {activeTab === 'security' && <SecurityTab />}
              {activeTab === 'billing' && <BillingTab />}

              {/* Placeholder tabs */}
              {activeTab === 'workspace' && renderWorkspaceTab()}
              {activeTab === 'brand-ai' && renderBrandAiTab()}
            </div>
          </div>
        </div>
      </div>
    </ModuleWrapper>
  );
};

export default ProfilePage;