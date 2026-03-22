import React, { useRef, useState } from 'react';
import { User, Mail, Calendar, Link, Camera, Edit3, Save, X, Plus, Loader2, ImageIcon } from 'lucide-react';
import SettingsCard from '../components/SettingsCard';

export interface ProfileData {
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

interface ProfileTabProps {
  profileData: ProfileData;
  onProfileDataChange: (updater: (prev: ProfileData) => ProfileData) => void;
  isEditing: boolean;
  onEditingChange: (editing: boolean) => void;
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
  connectedAccountsCount: number;
  brandLogoUrl: string | null;
  onAvatarUpload: (file: File) => Promise<void>;
}

const INPUT_CLASS = `
  w-full p-3 text-sm text-[var(--vektrus-anthrazit)]
  border border-[var(--vektrus-border-default)]
  rounded-[var(--vektrus-radius-sm)]
  placeholder:text-[var(--vektrus-gray)]
  focus:outline-none focus:ring-2 focus:ring-[var(--vektrus-blue-light)]
  transition-shadow duration-150
`;

const ACCEPTED_IMAGE_TYPES = 'image/png,image/jpeg,image/webp,image/gif';
const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5 MB

const ProfileTab: React.FC<ProfileTabProps> = ({
  profileData,
  onProfileDataChange,
  isEditing,
  onEditingChange,
  isSaving,
  onSave,
  onCancel,
  connectedAccountsCount,
  brandLogoUrl,
  onAvatarUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const daysSinceJoin = Math.floor(
    (Date.now() - new Date(profileData.joinDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Resolve display avatar: custom > brand logo > fallback icon
  const displayAvatar = profileData.avatar || brandLogoUrl || null;
  const avatarIsBrandLogo = !profileData.avatar && !!brandLogoUrl;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_AVATAR_SIZE) {
      alert('Die Datei ist zu groß. Maximale Größe: 5 MB.');
      return;
    }

    setIsUploading(true);
    try {
      await onAvatarUpload(file);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">

      {/* Avatar & identity card */}
      <SettingsCard>
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0 group">
            <div className="w-20 h-20 bg-[var(--vektrus-blue-light)] rounded-full flex items-center justify-center overflow-hidden">
              {isUploading ? (
                <Loader2 className="w-8 h-8 text-[var(--vektrus-blue)] animate-spin" />
              ) : displayAvatar ? (
                <img src={displayAvatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-[var(--vektrus-blue)]" />
              )}
            </div>
            {avatarIsBrandLogo && (
              <span className="absolute -top-1 -left-1 px-1.5 py-0.5 text-[10px] font-medium bg-[var(--vektrus-blue)] text-white rounded-full leading-tight">
                Logo
              </span>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES}
              onChange={handleFileSelect}
              className="sr-only"
              aria-label="Profilbild hochladen"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="
                absolute -bottom-0.5 -right-0.5 w-7 h-7
                bg-[var(--vektrus-blue)] rounded-full
                flex items-center justify-center text-white
                hover:opacity-90 transition-opacity
                disabled:opacity-50 disabled:cursor-not-allowed
              "
              aria-label="Profilbild ändern"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Name + meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="min-w-0">
                <h2 className="text-xl font-bold font-manrope text-[var(--vektrus-anthrazit)] truncate">
                  {profileData.firstName} {profileData.lastName}
                </h2>
                {(profileData.role || profileData.company) && (
                  <p className="text-sm text-[var(--vektrus-gray)] mt-0.5">
                    {profileData.role}{profileData.role && profileData.company ? ' bei ' : ''}{profileData.company}
                  </p>
                )}
              </div>
              <button
                onClick={() => onEditingChange(!isEditing)}
                className={`
                  flex items-center gap-2 px-3.5 py-2 text-sm font-medium
                  rounded-[var(--vektrus-radius-sm)] transition-colors duration-150
                  flex-shrink-0
                  ${isEditing
                    ? 'bg-[var(--vektrus-success)] hover:opacity-90 text-white'
                    : 'bg-[var(--vektrus-mint)] hover:bg-[var(--vektrus-blue-light)] text-[var(--vektrus-anthrazit)] border border-[var(--vektrus-border-default)]'
                  }
                `}
              >
                {isEditing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                <span>{isEditing ? 'Speichern' : 'Bearbeiten'}</span>
              </button>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <div className="flex items-center gap-2 text-[13px] text-[var(--vektrus-gray)]">
                <Mail className="w-3.5 h-3.5" />
                <span>{profileData.email}</span>
              </div>
              <div className="flex items-center gap-2 text-[13px] text-[var(--vektrus-gray)]">
                <Calendar className="w-3.5 h-3.5" />
                <span>Mitglied seit {new Date(profileData.joinDate).toLocaleDateString('de-DE')}</span>
              </div>
              {profileData.website && (
                <div className="flex items-center gap-2 text-[13px]">
                  <Link className="w-3.5 h-3.5 text-[var(--vektrus-gray)]" />
                  <a
                    href={profileData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--vektrus-blue)] hover:underline"
                  >
                    {profileData.website}
                  </a>
                </div>
              )}
            </div>
            {avatarIsBrandLogo && (
              <p className="text-[12px] text-[var(--vektrus-gray)] mt-3 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                Dein Brand-Studio-Logo wird als Profilbild verwendet. Klicke auf das Kamera-Symbol, um ein eigenes Bild hochzuladen.
              </p>
            )}
          </div>
        </div>
      </SettingsCard>

      {/* Edit form — visible only in edit mode */}
      {isEditing && (
        <SettingsCard title="Profil bearbeiten">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[var(--vektrus-gray)] block mb-2">Vorname</label>
              <input
                type="text"
                value={profileData.firstName}
                onChange={(e) => onProfileDataChange(prev => ({ ...prev, firstName: e.target.value }))}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--vektrus-gray)] block mb-2">Nachname</label>
              <input
                type="text"
                value={profileData.lastName}
                onChange={(e) => onProfileDataChange(prev => ({ ...prev, lastName: e.target.value }))}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--vektrus-gray)] block mb-2">Unternehmen</label>
              <input
                type="text"
                value={profileData.company}
                onChange={(e) => onProfileDataChange(prev => ({ ...prev, company: e.target.value }))}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--vektrus-gray)] block mb-2">Rolle</label>
              <input
                type="text"
                value={profileData.role}
                onChange={(e) => onProfileDataChange(prev => ({ ...prev, role: e.target.value }))}
                className={INPUT_CLASS}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-[var(--vektrus-gray)] block mb-2">Website</label>
              <input
                type="url"
                value={profileData.website}
                onChange={(e) => onProfileDataChange(prev => ({ ...prev, website: e.target.value }))}
                className={INPUT_CLASS}
                placeholder="https://deine-website.com"
              />
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-[var(--vektrus-gray)]">Bio</label>
                <span className={`text-xs ${profileData.bio.length > 500 ? 'text-[var(--vektrus-error)]' : 'text-[var(--vektrus-gray)]'}`}>
                  {profileData.bio.length} / 500
                </span>
              </div>
              <textarea
                value={profileData.bio}
                onChange={(e) => {
                  if (e.target.value.length <= 500) {
                    onProfileDataChange(prev => ({ ...prev, bio: e.target.value }));
                  }
                }}
                rows={3}
                maxLength={500}
                className={`${INPUT_CLASS} resize-none`}
                placeholder="Erzähle etwas über dich..."
              />
            </div>
          </div>

          {/* Save / Cancel actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onSave}
              disabled={isSaving}
              className="
                flex items-center gap-2 px-4 py-2 text-sm font-medium
                bg-[var(--vektrus-success)] hover:opacity-90 text-white
                rounded-[var(--vektrus-radius-sm)]
                transition-colors duration-150
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
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
              onClick={onCancel}
              disabled={isSaving}
              className="
                flex items-center gap-2 px-4 py-2 text-sm font-medium
                border border-[var(--vektrus-border-default)]
                hover:border-[var(--vektrus-blue-light)]
                text-[var(--vektrus-gray)] hover:text-[var(--vektrus-anthrazit)]
                rounded-[var(--vektrus-radius-sm)]
                transition-colors duration-150
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              <X className="w-4 h-4" />
              <span>Abbrechen</span>
            </button>
          </div>
        </SettingsCard>
      )}

      {/* Bio section — visible only when not editing */}
      {!isEditing && (
        <SettingsCard title="Über mich">
          {profileData.bio ? (
            <p className="text-sm text-[var(--vektrus-gray)] leading-relaxed">{profileData.bio}</p>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-[var(--vektrus-gray)] italic">
                Noch keine Bio hinterlegt.
              </p>
              <button
                onClick={() => onEditingChange(true)}
                className="
                  flex items-center gap-2 px-3.5 py-2 text-sm font-medium
                  bg-[var(--vektrus-mint)] hover:bg-[var(--vektrus-blue-light)]
                  text-[var(--vektrus-anthrazit)]
                  border border-[var(--vektrus-border-default)]
                  rounded-[var(--vektrus-radius-sm)]
                  transition-colors duration-150
                "
              >
                <Plus className="w-4 h-4" />
                <span>Hinzufügen</span>
              </button>
            </div>
          )}
        </SettingsCard>
      )}

      {/* Activity overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SettingsCard>
          <div className="text-center py-1">
            <div className="text-2xl font-bold text-[var(--vektrus-blue)] mb-0.5">
              {connectedAccountsCount}
            </div>
            <div className="text-[13px] text-[var(--vektrus-gray)]">Verbundene Konten</div>
          </div>
        </SettingsCard>
        <SettingsCard>
          <div className="text-center py-1">
            <div className="text-2xl font-bold text-[var(--vektrus-success)] mb-0.5">
              {daysSinceJoin}
            </div>
            <div className="text-[13px] text-[var(--vektrus-gray)]">Tage bei Vektrus</div>
          </div>
        </SettingsCard>
      </div>
    </div>
  );
};

export default ProfileTab;
