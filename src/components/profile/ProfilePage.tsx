import React, { useState, useEffect } from 'react';
import { User, Mail, Building, Calendar, Settings, Shield, CreditCard, Bell, Link, Camera, Edit3, Save, X, Check, AlertTriangle, Crown, Trash2, Plus, RefreshCw, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import { useToast } from '../ui/toast';
import SubscriptionStatus from '../subscription/SubscriptionStatus';
import ModuleWrapper from '../ui/ModuleWrapper';
import { SocialAccountService, LateAccount } from '../../services/socialAccountService';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  role: string;
  bio: string;
  website: string;
  joinDate: string;
  avatar: string;
}

interface SupportedPlatform {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyReports: boolean;
  aiSuggestions: boolean;
  performanceAlerts: boolean;
}

const ProfilePage: React.FC = () => {
  const { user, userProfile, signOut, updateProfile, refreshProfile } = useAuth();
  const { subscription, isActive } = useSubscription();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'accounts' | 'billing' | 'notifications' | 'security'>('profile');
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

  // Update profileData when userProfile changes
  React.useEffect(() => {
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

  const SUPPORTED_PLATFORMS: SupportedPlatform[] = [
    { id: 'instagram', name: 'Instagram', icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="ig-profile-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFDC80" />
            <stop offset="25%" stopColor="#F77737" />
            <stop offset="50%" stopColor="#E1306C" />
            <stop offset="75%" stopColor="#C13584" />
            <stop offset="100%" stopColor="#833AB4" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="20" height="20" rx="6" stroke="url(#ig-profile-grad)" strokeWidth="2" />
        <circle cx="12" cy="12" r="4.5" stroke="url(#ig-profile-grad)" strokeWidth="2" />
        <circle cx="17.5" cy="6.5" r="1.5" fill="url(#ig-profile-grad)" />
      </svg>
    )},
    { id: 'linkedin', name: 'LinkedIn', icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#0A66C2">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    )},
    { id: 'tiktok', name: 'TikTok', icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#111111">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V7.56a8.16 8.16 0 0 0 4.77 1.52v-3.39a4.85 4.85 0 0 1-1.04 0z" />
      </svg>
    )},
    { id: 'facebook', name: 'Facebook', icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    )},
    { id: 'twitter', name: 'X (Twitter)', icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#111111">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    )},
    { id: 'youtube', name: 'YouTube', icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#FF0000">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    )},
    { id: 'threads', name: 'Threads', icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#111111">
        <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.432 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.17.408-2.246 1.331-3.029.864-.733 2.05-1.146 3.431-1.196 1.132-.04 2.174.093 3.104.382-.02-.96-.175-1.746-.472-2.342-.386-.773-1.032-1.172-1.92-1.187h-.053c-.671 0-1.553.197-2.18.878l-1.476-1.378c.964-1.044 2.239-1.62 3.593-1.62h.087c2.648.06 4.12 1.835 4.316 5.197.093.026.186.054.277.084 1.095.366 1.97.944 2.598 1.72.876 1.08 1.2 2.42 1.025 3.903h0z" />
      </svg>
    )},
    { id: 'pinterest', name: 'Pinterest', icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#E60023">
        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z" />
      </svg>
    )},
  ];

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
    if (activeTab === 'accounts') {
      loadConnectedAccounts();
    }
  }, [activeTab]);

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    aiSuggestions: true,
    performanceAlerts: false
  });

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


  const renderProfileTab = () => (
    <div className="space-y-8">
      {/* Avatar & Basic Info */}
      <div className="bg-white rounded-[var(--vektrus-radius-md)] p-6 border border-[rgba(73,183,227,0.18)]">
        <div className="flex items-start space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-[#B6EBF7] rounded-full flex items-center justify-center">
              {profileData.avatar ? (
                <img src={profileData.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-[#49B7E3]" />
              )}
            </div>
            <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#49B7E3] rounded-full flex items-center justify-center text-white hover:bg-[#49B7E3]/90 transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-[#111111]">
                  {profileData.firstName} {profileData.lastName}
                </h1>
                <p className="text-[#7A7A7A]">{profileData.role} bei {profileData.company}</p>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-[var(--vektrus-radius-md)] font-medium transition-all duration-200 ${
                  isEditing 
                    ? 'bg-[#49D69E] hover:bg-[#49D69E]/90 text-white'
                    : 'bg-[#B6EBF7] hover:bg-[#49B7E3] text-[#111111]'
                }`}
              >
                {isEditing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                <span>{isEditing ? 'Speichern' : 'Bearbeiten'}</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 text-sm text-[#7A7A7A]">
                <Mail className="w-4 h-4" />
                <span>{profileData.email}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-[#7A7A7A]">
                <Calendar className="w-4 h-4" />
                <span>Mitglied seit {new Date(profileData.joinDate).toLocaleDateString('de-DE')}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-[#7A7A7A]">
                <Link className="w-4 h-4" />
                {profileData.website ? (
                  <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="text-[#49B7E3] hover:underline">
                    {profileData.website}
                  </a>
                ) : (
                  <span className="text-[#7A7A7A]">Keine Website hinterlegt</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editable Profile Form */}
      {isEditing && (
        <div className="bg-white rounded-[var(--vektrus-radius-md)] p-6 border border-[rgba(73,183,227,0.18)]">
          <h3 className="text-lg font-semibold text-[#111111] mb-4">Profil bearbeiten</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[#7A7A7A] block mb-2">Vorname</label>
              <input
                type="text"
                value={profileData.firstName}
                onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full p-3 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-sm)] focus:outline-none focus:ring-2 focus:ring-[#B6EBF7]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#7A7A7A] block mb-2">Nachname</label>
              <input
                type="text"
                value={profileData.lastName}
                onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full p-3 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-sm)] focus:outline-none focus:ring-2 focus:ring-[#B6EBF7]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#7A7A7A] block mb-2">Unternehmen</label>
              <input
                type="text"
                value={profileData.company}
                onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                className="w-full p-3 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-sm)] focus:outline-none focus:ring-2 focus:ring-[#B6EBF7]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#7A7A7A] block mb-2">Rolle</label>
              <input
                type="text"
                value={profileData.role}
                onChange={(e) => setProfileData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full p-3 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-sm)] focus:outline-none focus:ring-2 focus:ring-[#B6EBF7]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-[#7A7A7A] block mb-2">Website</label>
              <input
                type="url"
                value={profileData.website}
                onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                className="w-full p-3 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-sm)] focus:outline-none focus:ring-2 focus:ring-[#B6EBF7]"
                placeholder="https://deine-website.com"
              />
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-[#7A7A7A]">Bio</label>
                <span className={`text-xs ${profileData.bio.length > 500 ? 'text-[#FA7E70]' : 'text-[#7A7A7A]'}`}>
                  {profileData.bio.length} / 500
                </span>
              </div>
              <textarea
                value={profileData.bio}
                onChange={(e) => {
                  if (e.target.value.length <= 500) {
                    setProfileData(prev => ({ ...prev, bio: e.target.value }));
                  }
                }}
                rows={3}
                maxLength={500}
                className="w-full p-3 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-sm)] focus:outline-none focus:ring-2 focus:ring-[#B6EBF7] resize-none"
                placeholder="Erzähle etwas über dich..."
              />
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="flex items-center space-x-2 px-4 py-2 bg-[#49D69E] hover:bg-[#49D69E]/90 text-white rounded-[var(--vektrus-radius-md)] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Speichern...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Speichern</span>
                </>
              )}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                // Reset form to current profile data
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
              }}
              disabled={isSaving}
              className="flex items-center space-x-2 px-4 py-2 border border-[rgba(73,183,227,0.18)] hover:border-[#B6EBF7] text-[#7A7A7A] hover:text-[#111111] rounded-[var(--vektrus-radius-md)] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-4 h-4" />
              <span>Abbrechen</span>
            </button>
          </div>
        </div>
      )}

      {/* Bio Section */}
      {!isEditing && (
        <div className="bg-white rounded-[var(--vektrus-radius-md)] p-6 border border-[rgba(73,183,227,0.18)]">
          <h3 className="text-lg font-semibold text-[#111111] mb-3">Über mich</h3>
          {profileData.bio ? (
            <p className="text-[#7A7A7A] leading-relaxed">{profileData.bio}</p>
          ) : (
            <div className="flex items-center justify-between py-4">
              <p className="text-[#7A7A7A] italic">Noch keine Bio hinterlegt. Erzähle etwas über dich...</p>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-[#B6EBF7] hover:bg-[#49B7E3] text-[#111111] rounded-[var(--vektrus-radius-md)] font-medium transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Jetzt hinzufügen</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-[var(--vektrus-radius-md)] p-6 border border-[rgba(73,183,227,0.18)] text-center">
          <div className="text-2xl font-bold text-[#49B7E3] mb-1">
            {connectedAccounts.filter(a => a.connected).length}
          </div>
          <div className="text-sm text-[#7A7A7A]">Verbundene Konten</div>
        </div>
        
        <div className="bg-white rounded-[var(--vektrus-radius-md)] p-6 border border-[rgba(73,183,227,0.18)] text-center">
          <div className="text-2xl font-bold text-[#49D69E] mb-1">
            {Math.floor((new Date().getTime() - new Date(profileData.joinDate).getTime()) / (1000 * 60 * 60 * 24))}
          </div>
          <div className="text-sm text-[#7A7A7A]">Tage bei Vektrus</div>
        </div>
        
        <div className="bg-white rounded-[var(--vektrus-radius-md)] p-6 border border-[rgba(73,183,227,0.18)] text-center">
          <div className="text-2xl font-bold text-[#49B7E3] mb-1">247</div>
          <div className="text-sm text-[#7A7A7A]">Generierte Posts</div>
        </div>
      </div>
    </div>
  );

  const renderAccountsTab = () => {
    const getConnectedAccount = (platformId: string) => {
      return connectedAccounts.find(a => a.platform === platformId);
    };

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-[var(--vektrus-radius-md)] p-6 border border-[rgba(73,183,227,0.18)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#111111]">Verbundene Social Media Konten</h3>
            {hasLateProfile && (
              <button
                onClick={handleSyncAccounts}
                disabled={isSyncing}
                className="flex items-center space-x-2 px-4 py-2 text-sm bg-[#B6EBF7] hover:bg-[#49B7E3] text-[#111111] rounded-[var(--vektrus-radius-sm)] font-medium transition-colors disabled:opacity-50"
              >
                {isSyncing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span>{isSyncing ? 'Synchronisiere...' : 'Alle synchronisieren'}</span>
              </button>
            )}
          </div>

          {isLoadingAccounts ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#49B7E3] animate-spin" />
            </div>
          ) : !hasLateProfile ? (
            <div className="p-6 bg-[#F4BE9D]/20 rounded-[var(--vektrus-radius-sm)] border border-[#F4BE9D]">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-[#D97706] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-[#111111] mb-1">Late-Profil erforderlich</h4>
                  <p className="text-sm text-[#7A7A7A]">
                    Um Social Media Konten zu verbinden, wird ein Late-Profil benötigt.
                    Bitte kontaktiere den Support um dein Profil einzurichten.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {SUPPORTED_PLATFORMS.map(platform => {
                const connectedAccount = getConnectedAccount(platform.id);
                const isConnected = !!connectedAccount;
                const isConnecting = connectingPlatform === platform.id;
                const isDisconnecting = disconnectingAccount === connectedAccount?.id;

                return (
                  <div key={platform.id} className="flex items-center justify-between p-4 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-sm)]">
                    <div className="flex items-center space-x-4">
                      {platform.icon}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-[#111111]">{platform.name}</h4>
                          {isConnected && (
                            <div className="flex items-center space-x-1">
                              <Check className="w-4 h-4 text-[#49D69E]" />
                              <span className="text-xs text-[#49D69E] font-medium">Verbunden</span>
                            </div>
                          )}
                        </div>
                        {isConnected ? (
                          <div className="text-sm text-[#7A7A7A]">
                            {connectedAccount.username || connectedAccount.display_name || 'Verbunden'}
                            {connectedAccount.updated_at && (
                              <div className="text-xs text-[#7A7A7A] mt-1">
                                Letzte Sync: {new Date(connectedAccount.updated_at).toLocaleDateString('de-DE')}
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-[#7A7A7A]">Nicht verbunden</p>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {isConnected ? (
                        <>
                          <button
                            onClick={handleSyncAccounts}
                            disabled={isSyncing}
                            className="px-3 py-2 text-sm text-[#7A7A7A] hover:text-[#111111] border border-[rgba(73,183,227,0.18)] hover:border-[#B6EBF7] rounded-[var(--vektrus-radius-sm)] transition-colors disabled:opacity-50"
                          >
                            {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sync'}
                          </button>
                          {showDisconnectConfirm === connectedAccount.id ? (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleDisconnectAccount(connectedAccount.late_account_id, connectedAccount.id, platform.name)}
                                disabled={isDisconnecting}
                                className="px-3 py-2 text-sm text-white bg-[#FA7E70] hover:bg-[#FA7E70]/90 rounded-[var(--vektrus-radius-sm)] transition-colors disabled:opacity-50"
                              >
                                {isDisconnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ja, trennen'}
                              </button>
                              <button
                                onClick={() => setShowDisconnectConfirm(null)}
                                className="px-3 py-2 text-sm text-[#7A7A7A] border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-sm)] hover:bg-[#F4FCFE] transition-colors"
                              >
                                Abbrechen
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setShowDisconnectConfirm(connectedAccount.id)}
                              className="px-3 py-2 text-sm text-[#FA7E70] hover:text-white hover:bg-[#FA7E70] border border-[#FA7E70] rounded-[var(--vektrus-radius-sm)] transition-colors"
                            >
                              Trennen
                            </button>
                          )}
                        </>
                      ) : (
                        <button
                          onClick={() => handleConnectAccount(platform.id)}
                          disabled={isConnecting}
                          className="flex items-center space-x-2 px-4 py-2 text-sm bg-[#B6EBF7] hover:bg-[#49B7E3] text-[#111111] rounded-[var(--vektrus-radius-sm)] font-medium transition-colors disabled:opacity-50"
                        >
                          {isConnecting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
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

          <div className="mt-6 p-4 bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] border border-[#B6EBF7]">
            <h4 className="font-medium text-[#111111] mb-2">Warum Konten verbinden?</h4>
            <ul className="text-sm text-[#7A7A7A] space-y-1">
              <li>Automatische Performance-Analyse</li>
              <li>Personalisierte Content-Empfehlungen</li>
              <li>Optimale Posting-Zeiten basierend auf deiner Audience</li>
              <li>Cross-Platform Content-Planung</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const renderBillingTab = () => (
    <div className="space-y-6">
      {/* Subscription Status */}
      <SubscriptionStatus />

      {/* Billing History */}
      <div className="bg-white rounded-[var(--vektrus-radius-md)] p-6 border border-[rgba(73,183,227,0.18)]">
        <h3 className="text-lg font-semibold text-[#111111] mb-4">Rechnungshistorie</h3>
        
        <div className="space-y-3">
          {[
            { date: '2024-01-01', amount: '€99,00', status: 'Bezahlt', invoice: 'VKT-2024-001' },
            { date: '2023-12-01', amount: '€99,00', status: 'Bezahlt', invoice: 'VKT-2023-012' },
            { date: '2023-11-01', amount: '€99,00', status: 'Bezahlt', invoice: 'VKT-2023-011' }
          ].map((bill, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-sm)]">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-[#B6EBF7] rounded-[var(--vektrus-radius-sm)] flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-[#49B7E3]" />
                </div>
                <div>
                  <div className="font-medium text-[#111111]">{bill.invoice}</div>
                  <div className="text-sm text-[#7A7A7A]">{new Date(bill.date).toLocaleDateString('de-DE')}</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-medium text-[#111111]">{bill.amount}</div>
                <div className="text-sm text-[#49D69E]">{bill.status}</div>
              </div>
              
              <button className="px-3 py-2 text-sm text-[#49B7E3] hover:text-[#49B7E3]/80 border border-[#49B7E3] hover:bg-[#49B7E3]/10 rounded-[var(--vektrus-radius-sm)] transition-colors">
                PDF
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-[var(--vektrus-radius-md)] p-6 border border-[rgba(73,183,227,0.18)]">
        <h3 className="text-lg font-semibold text-[#111111] mb-4">Zahlungsmethode</h3>
        
        <div className="flex items-center justify-between p-4 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-sm)]">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-[#B6EBF7] rounded-[var(--vektrus-radius-sm)] flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-[#49B7E3]" />
            </div>
            <div>
              <div className="font-medium text-[#111111]">Visa •••• 4242</div>
              <div className="text-sm text-[#7A7A7A]">Läuft ab 12/2025</div>
            </div>
          </div>
          
          <button className="px-4 py-2 text-sm bg-[#B6EBF7] hover:bg-[#49B7E3] text-[#111111] rounded-[var(--vektrus-radius-sm)] font-medium transition-colors">
            Ändern
          </button>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-[var(--vektrus-radius-md)] p-6 border border-[rgba(73,183,227,0.18)]">
        <h3 className="text-lg font-semibold text-[#111111] mb-4">Benachrichtigungseinstellungen</h3>
        
        <div className="space-y-4">
          {[
            { key: 'emailNotifications', label: 'E-Mail Benachrichtigungen', description: 'Wichtige Updates per E-Mail erhalten' },
            { key: 'pushNotifications', label: 'Push-Benachrichtigungen', description: 'Browser-Benachrichtigungen aktivieren' },
            { key: 'weeklyReports', label: 'Wöchentliche Berichte', description: 'Performance-Zusammenfassung jeden Montag' },
            { key: 'aiSuggestions', label: 'KI-Empfehlungen', description: 'Benachrichtigungen für neue Content-Vorschläge' },
            { key: 'performanceAlerts', label: 'Performance-Alerts', description: 'Bei ungewöhnlichen Aktivitäten benachrichtigen' }
          ].map(setting => (
            <div key={setting.key} className="flex items-center justify-between p-4 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-sm)]">
              <div>
                <div className="font-medium text-[#111111]">{setting.label}</div>
                <div className="text-sm text-[#7A7A7A]">{setting.description}</div>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings[setting.key as keyof NotificationSettings]}
                  onChange={(e) => setNotificationSettings(prev => ({
                    ...prev,
                    [setting.key]: e.target.checked
                  }))}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-[#B6EBF7]/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#B6EBF7]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[rgba(73,183,227,0.18)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#49B7E3]"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      {/* Password Change */}
      <div className="bg-white rounded-[var(--vektrus-radius-md)] p-6 border border-[rgba(73,183,227,0.18)]">
        <h3 className="text-lg font-semibold text-[#111111] mb-4">Passwort ändern</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[#7A7A7A] block mb-2">Aktuelles Passwort</label>
            <input
              type="password"
              className="w-full p-3 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-sm)] focus:outline-none focus:ring-2 focus:ring-[#B6EBF7]"
              placeholder="Aktuelles Passwort eingeben"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#7A7A7A] block mb-2">Neues Passwort</label>
            <input
              type="password"
              className="w-full p-3 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-sm)] focus:outline-none focus:ring-2 focus:ring-[#B6EBF7]"
              placeholder="Neues Passwort eingeben"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#7A7A7A] block mb-2">Passwort bestätigen</label>
            <input
              type="password"
              className="w-full p-3 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-sm)] focus:outline-none focus:ring-2 focus:ring-[#B6EBF7]"
              placeholder="Neues Passwort wiederholen"
            />
          </div>
          
          <button className="px-4 py-2 bg-[#B6EBF7] hover:bg-[#49B7E3] text-[#111111] rounded-[var(--vektrus-radius-md)] font-medium transition-colors">
            Passwort aktualisieren
          </button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white rounded-[var(--vektrus-radius-md)] p-6 border border-[rgba(73,183,227,0.18)]">
        <h3 className="text-lg font-semibold text-[#111111] mb-4">Zwei-Faktor-Authentifizierung</h3>
        
        <div className="flex items-center justify-between p-4 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-sm)]">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-[#F4BE9D] rounded-[var(--vektrus-radius-sm)] flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#D97706]" />
            </div>
            <div>
              <div className="font-medium text-[#111111]">2FA deaktiviert</div>
              <div className="text-sm text-[#7A7A7A]">Erhöhe die Sicherheit deines Kontos</div>
            </div>
          </div>
          
          <button className="px-4 py-2 bg-[#B6EBF7] hover:bg-[#49B7E3] text-[#111111] rounded-[var(--vektrus-radius-md)] font-medium transition-colors">
            Aktivieren
          </button>
        </div>
      </div>

      {/* Login Sessions */}
      <div className="bg-white rounded-[var(--vektrus-radius-md)] p-6 border border-[rgba(73,183,227,0.18)]">
        <h3 className="text-lg font-semibold text-[#111111] mb-4">Aktive Sitzungen</h3>
        
        <div className="space-y-3">
          {[
            { device: 'Chrome auf Windows', location: 'München, Deutschland', current: true, lastActive: 'Jetzt aktiv' },
            { device: 'Safari auf iPhone', location: 'München, Deutschland', current: false, lastActive: 'Vor 2 Stunden' }
          ].map((session, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-sm)]">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${session.current ? 'bg-[#49D69E]' : 'bg-[rgba(73,183,227,0.25)]'}`}></div>
                <div>
                  <div className="font-medium text-[#111111]">{session.device}</div>
                  <div className="text-sm text-[#7A7A7A]">{session.location} • {session.lastActive}</div>
                </div>
              </div>
              
              {!session.current && (
                <button className="px-3 py-2 text-sm text-[#FA7E70] hover:text-white hover:bg-[#FA7E70] border border-[#FA7E70] rounded-[var(--vektrus-radius-sm)] transition-colors">
                  Beenden
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-[var(--vektrus-radius-md)] p-6 border border-[#FA7E70]">
        <h3 className="text-lg font-semibold text-[#FA7E70] mb-4">Gefahrenbereich</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50 border border-[#FA7E70]/30 rounded-[var(--vektrus-radius-sm)]">
            <div>
              <div className="font-medium text-[#111111]">Konto löschen</div>
              <div className="text-sm text-[#7A7A7A]">Alle Daten werden permanent gelöscht</div>
            </div>
            
            <button className="px-4 py-2 bg-[#FA7E70] hover:bg-[#FA7E70]/90 text-white rounded-[var(--vektrus-radius-md)] font-medium transition-colors">
              Konto löschen
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'accounts', label: 'Konten', icon: Link },
    { id: 'billing', label: 'Abrechnung', icon: CreditCard },
    { id: 'notifications', label: 'Benachrichtigungen', icon: Bell },
    { id: 'security', label: 'Sicherheit', icon: Shield }
  ];

  return (
    <ModuleWrapper module="profile" showTopAccent={true}>
      <div className="h-full bg-[#F4FCFE] overflow-auto">
      <div className="max-w-[1240px] mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#111111] mb-2">Mein Profil</h1>
          <p className="text-[#7A7A7A]">Verwalte deine Kontoinformationen und Einstellungen</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.18)] p-4">
              <nav className="space-y-2">
                {tabs.map(tab => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-[var(--vektrus-radius-md)] text-left transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-[#B6EBF7] text-[#111111] font-medium'
                          : 'text-[#7A7A7A] hover:text-[#111111] hover:bg-[#F4FCFE]'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'accounts' && renderAccountsTab()}
            {activeTab === 'billing' && renderBillingTab()}
            {activeTab === 'notifications' && renderNotificationsTab()}
            {activeTab === 'security' && renderSecurityTab()}
          </div>
        </div>
      </div>
      </div>
    </ModuleWrapper>
  );
};

export default ProfilePage;