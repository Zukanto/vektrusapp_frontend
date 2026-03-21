import React from 'react';
import SettingsCard from '../components/SettingsCard';
import SettingsToggle from '../components/SettingsToggle';

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyReports: boolean;
  aiSuggestions: boolean;
  performanceAlerts: boolean;
}

export const NOTIFICATION_DEFAULTS: NotificationSettings = {
  emailNotifications: true,
  pushNotifications: true,
  weeklyReports: true,
  aiSuggestions: true,
  performanceAlerts: false,
};

const NOTIFICATION_OPTIONS: {
  key: keyof NotificationSettings;
  label: string;
  description: string;
}[] = [
  {
    key: 'emailNotifications',
    label: 'E-Mail-Benachrichtigungen',
    description: 'Wichtige Updates und Statusänderungen per E-Mail erhalten',
  },
  {
    key: 'pushNotifications',
    label: 'Push-Benachrichtigungen',
    description: 'Browser-Benachrichtigungen für zeitkritische Ereignisse',
  },
  {
    key: 'weeklyReports',
    label: 'Wöchentliche Berichte',
    description: 'Performance-Zusammenfassung jeden Montag per E-Mail',
  },
  {
    key: 'aiSuggestions',
    label: 'KI-Empfehlungen',
    description: 'Benachrichtigungen bei neuen Content-Vorschlägen von Vektrus',
  },
  {
    key: 'performanceAlerts',
    label: 'Performance-Alerts',
    description: 'Hinweise bei ungewöhnlichen Veränderungen deiner Reichweite',
  },
];

interface NotificationsTabProps {
  settings: NotificationSettings;
  onChange: (key: keyof NotificationSettings, value: boolean) => void;
}

const NotificationsTab: React.FC<NotificationsTabProps> = ({ settings, onChange }) => {
  return (
    <div className="space-y-6">
      <SettingsCard
        title="Benachrichtigungen"
        description="Lege fest, worüber Vektrus dich informiert."
      >
        <div className="divide-y divide-[var(--vektrus-border-subtle)]">
          {NOTIFICATION_OPTIONS.map(option => (
            <SettingsToggle
              key={option.key}
              label={option.label}
              description={option.description}
              checked={settings[option.key]}
              onChange={(value) => onChange(option.key, value)}
            />
          ))}
        </div>
      </SettingsCard>
    </div>
  );
};

export default NotificationsTab;
