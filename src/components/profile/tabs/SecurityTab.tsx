import React from 'react';
import { Shield, Lock, FileText } from 'lucide-react';
import SettingsCard from '../components/SettingsCard';

/**
 * SecurityTab — Datenschutz & Sicherheit.
 *
 * Stateless extraction: no handlers have backend wiring yet.
 * Password change, 2FA, sessions, and account deletion are placeholder UI.
 * Each section is honest about its current readiness.
 */
const SecurityTab: React.FC = () => {
  return (
    <div className="space-y-6">

      {/* Password change */}
      <SettingsCard
        title="Passwort ändern"
        description="Aktualisiere dein Passwort regelmäßig für mehr Sicherheit."
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[var(--vektrus-gray)] block mb-2">
              Aktuelles Passwort
            </label>
            <input
              type="password"
              className="
                w-full p-3
                border border-[var(--vektrus-border-default)]
                rounded-[var(--vektrus-radius-sm)]
                text-sm text-[var(--vektrus-anthrazit)]
                placeholder:text-[var(--vektrus-gray)]
                focus:outline-none focus:ring-2 focus:ring-[var(--vektrus-blue-light)]
                transition-shadow duration-150
              "
              placeholder="Aktuelles Passwort eingeben"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--vektrus-gray)] block mb-2">
              Neues Passwort
            </label>
            <input
              type="password"
              className="
                w-full p-3
                border border-[var(--vektrus-border-default)]
                rounded-[var(--vektrus-radius-sm)]
                text-sm text-[var(--vektrus-anthrazit)]
                placeholder:text-[var(--vektrus-gray)]
                focus:outline-none focus:ring-2 focus:ring-[var(--vektrus-blue-light)]
                transition-shadow duration-150
              "
              placeholder="Neues Passwort eingeben"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--vektrus-gray)] block mb-2">
              Passwort bestätigen
            </label>
            <input
              type="password"
              className="
                w-full p-3
                border border-[var(--vektrus-border-default)]
                rounded-[var(--vektrus-radius-sm)]
                text-sm text-[var(--vektrus-anthrazit)]
                placeholder:text-[var(--vektrus-gray)]
                focus:outline-none focus:ring-2 focus:ring-[var(--vektrus-blue-light)]
                transition-shadow duration-150
              "
              placeholder="Neues Passwort wiederholen"
            />
          </div>

          <p className="text-[13px] text-[var(--vektrus-gray)] leading-relaxed">
            Die Passwortänderung wird in einer kommenden Version verfügbar sein.
          </p>
        </div>
      </SettingsCard>

      {/* Two-Factor Authentication */}
      <SettingsCard
        title="Zwei-Faktor-Authentifizierung"
        description="Zusätzliche Sicherheitsebene für dein Konto."
      >
        <div
          className="
            flex items-center justify-between gap-4
            p-4 rounded-[var(--vektrus-radius-sm)]
            border border-[var(--vektrus-border-default)]
          "
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-[var(--vektrus-radius-sm)] bg-[var(--vektrus-mint)] flex items-center justify-center">
              <Shield className="w-5 h-5 text-[var(--vektrus-blue)]" />
            </div>
            <div>
              <div className="text-sm font-medium text-[var(--vektrus-anthrazit)]">2FA aktuell nicht verfügbar</div>
              <div className="text-[13px] text-[var(--vektrus-gray)]">
                Wird in einer zukünftigen Version unterstützt
              </div>
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* Active Sessions */}
      <SettingsCard
        title="Aktive Sitzungen"
        description="Geräte, auf denen du aktuell angemeldet bist."
      >
        <div className="space-y-3">
          <div
            className="
              flex items-center justify-between gap-4
              p-4 rounded-[var(--vektrus-radius-sm)]
              border border-[var(--vektrus-border-default)]
            "
          >
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--vektrus-success)] flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-[var(--vektrus-anthrazit)]">Aktuelle Sitzung</div>
                <div className="text-[13px] text-[var(--vektrus-gray)]">Dieses Gerät — jetzt aktiv</div>
              </div>
            </div>
          </div>

          <p className="text-[13px] text-[var(--vektrus-gray)] leading-relaxed">
            Die Verwaltung weiterer Sitzungen wird in einer kommenden Version verfügbar sein.
          </p>
        </div>
      </SettingsCard>

      {/* DSGVO & Datenschutz */}
      <SettingsCard
        title="Datenschutz & DSGVO"
        description="Informationen zur Verarbeitung deiner Daten."
      >
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-[var(--vektrus-radius-sm)] bg-[var(--vektrus-mint)] flex items-center justify-center flex-shrink-0 mt-0.5">
              <FileText className="w-5 h-5 text-[var(--vektrus-blue)]" />
            </div>
            <div>
              <div className="text-sm font-medium text-[var(--vektrus-anthrazit)] mb-1">Datenverarbeitung</div>
              <p className="text-[13px] text-[var(--vektrus-gray)] leading-relaxed">
                Vektrus verarbeitet deine Daten DSGVO-konform auf Servern in der EU.
                Deine Inhalte, Markendaten und Kontoinformationen werden ausschließlich für die
                Bereitstellung der Vektrus-Dienste verwendet und nicht an Dritte weitergegeben.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-[var(--vektrus-radius-sm)] bg-[var(--vektrus-mint)] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Lock className="w-5 h-5 text-[var(--vektrus-blue)]" />
            </div>
            <div>
              <div className="text-sm font-medium text-[var(--vektrus-anthrazit)] mb-1">Datenkontrolle</div>
              <p className="text-[13px] text-[var(--vektrus-gray)] leading-relaxed">
                Du kannst jederzeit eine Kopie deiner Daten anfordern oder die Löschung deines Kontos beantragen.
                Datenexport und erweiterte Datenschutzoptionen werden in einer kommenden Version direkt verfügbar sein.
              </p>
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* Danger Zone — account deletion */}
      <SettingsCard title="Gefahrenbereich" variant="danger">
        <div
          className="
            flex items-center justify-between gap-4
            p-4 rounded-[var(--vektrus-radius-sm)]
            bg-red-50
            border border-red-200
          "
        >
          <div>
            <div className="text-sm font-medium text-[var(--vektrus-anthrazit)]">Konto löschen</div>
            <div className="text-[13px] text-[var(--vektrus-gray)]">
              Alle Daten werden unwiderruflich gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.
            </div>
          </div>

          <button
            className="
              flex-shrink-0 px-4 py-2
              bg-[var(--vektrus-error)] hover:opacity-90
              text-white text-sm font-medium
              rounded-[var(--vektrus-radius-sm)]
              transition-colors duration-150
            "
          >
            Konto löschen
          </button>
        </div>
      </SettingsCard>
    </div>
  );
};

export default SecurityTab;
