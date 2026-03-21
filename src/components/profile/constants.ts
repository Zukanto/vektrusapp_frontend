import { User, Building, Palette, Share2, Bell, CreditCard, Shield } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface SettingsTabDefinition {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
  group: 'identity' | 'product' | 'admin' | 'control';
}

/**
 * Settings navigation tabs — ordered and grouped semantically.
 *
 * Groups:
 *   identity — Profil, Workspace
 *   product  — Brand & KI, Social-Konten
 *   admin    — Benachrichtigungen, Plan & Abrechnung
 *   control  — Datenschutz & Sicherheit
 */
export const SETTINGS_TABS: SettingsTabDefinition[] = [
  { id: 'profile',       label: 'Profil',                      icon: User,       description: 'Deine persönlichen Informationen',     group: 'identity' },
  { id: 'workspace',     label: 'Workspace',                   icon: Building,   description: 'Dein Workspace und Teameinstellungen', group: 'identity' },
  { id: 'brand-ai',      label: 'Brand & KI',                  icon: Palette,    description: 'Wie Vektrus deine Marke versteht',     group: 'product'  },
  { id: 'social',        label: 'Social-Konten',               icon: Share2,     description: 'Verbundene Social-Media-Konten',       group: 'product'  },
  { id: 'notifications', label: 'Benachrichtigungen',          icon: Bell,       description: 'Deine Benachrichtigungseinstellungen', group: 'admin'    },
  { id: 'billing',       label: 'Plan & Abrechnung',           icon: CreditCard, description: 'Dein Abo und Rechnungen',              group: 'admin'    },
  { id: 'security',      label: 'Datenschutz & Sicherheit',    icon: Shield,     description: 'Deine Daten und Kontosicherheit',      group: 'control'  },
];
