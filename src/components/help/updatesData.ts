// Product Updates data model for Vektrus App
// TypeScript-based, no Supabase dependency. Easy to maintain and extend.

export type UpdateStatus = 'live' | 'improved' | 'in-progress';

export interface ProductUpdate {
  id: string;
  title: string;
  teaser: string;
  status: UpdateStatus;
  module: string;
  date: string;
  impact?: string;
  linkTo?: string;
}

export interface InProgressItem {
  title: string;
  description: string;
  module: string;
}

// ─── Status-Labels ──────────────────────────────────────────────────────────

export const UPDATE_STATUS_CONFIG: Record<UpdateStatus, { label: string; className: string }> = {
  live: {
    label: 'Neu',
    className: 'bg-[#49D69E]/10 text-[#2DA775] border border-[#49D69E]/20',
  },
  improved: {
    label: 'Verbessert',
    className: 'bg-[#49B7E3]/10 text-[#49B7E3] border border-[#49B7E3]/20',
  },
  'in-progress': {
    label: 'In Arbeit',
    className: 'bg-[#F4FCFE] text-[#7A7A7A] border border-[rgba(73,183,227,0.18)]',
  },
};

// ─── Seed-Content: Live Updates ─────────────────────────────────────────────

export const productUpdates: ProductUpdate[] = [
  {
    id: 'update-help-redesign',
    title: 'Neuer Hilfe-Bereich',
    teaser: 'Die Hilfe wurde komplett neu aufgebaut — mit Suche, strukturierten Kategorien und produktnahen Artikeln zu allen Vektrus-Funktionen.',
    status: 'live',
    module: 'Hilfe',
    date: '2026-03-22',
    impact: 'Du findest Antworten jetzt schneller und gezielter.',
    linkTo: '/help',
  },
  {
    id: 'update-pulse-visual',
    title: 'Pulse Visual: Text und Bild in einem Schritt',
    teaser: 'Mit Pulse Visual erstellst du Beiträge mit automatisch generiertem Bild — abgestimmt auf deinen Text und deine Marke.',
    status: 'live',
    module: 'Pulse',
    date: '2026-03-18',
    impact: 'Weniger Schritte für visuell starken Content.',
    linkTo: '/help/pulse/pulse-visual-nutzen',
  },
  {
    id: 'update-pulse-auto',
    title: 'Pulse Auto: Content für eine ganze Woche',
    teaser: 'Mit Pulse Auto generierst du einen vollständigen Wochenplan mit mehreren Beiträgen — in einem einzigen Schritt.',
    status: 'live',
    module: 'Pulse',
    date: '2026-03-16',
    impact: 'Regelmäßiger Content mit minimalem Aufwand.',
    linkTo: '/help/pulse/pulse-auto-wochenplan',
  },
  {
    id: 'update-planner-redesign',
    title: 'Content Planner: Überarbeitetes Layout und Filter',
    teaser: 'Der Planner wurde überarbeitet — mit klarerer Monatsansicht, Plattform-Filtern und verbesserter Statuslogik.',
    status: 'improved',
    module: 'Content Planner',
    date: '2026-03-15',
    impact: 'Besserer Überblick über geplante und veröffentlichte Beiträge.',
    linkTo: '/help/content-planner/beitraege-bearbeiten',
  },
  {
    id: 'update-brand-studio',
    title: 'Brand Studio: CI-Material hochladen',
    teaser: 'Lade Logo, Farben und Schriften hoch. Vektrus nutzt dein Material, um generierte Inhalte besser an deine Marke anzupassen.',
    status: 'live',
    module: 'Brand Studio',
    date: '2026-03-12',
    impact: 'Konsistentere Ergebnisse bei der Content-Generierung.',
    linkTo: '/help/brand-studio/brand-studio-einrichten',
  },
  {
    id: 'update-dashboard-kpis',
    title: 'Dashboard: Erweiterte KPIs und Empfehlungen',
    teaser: 'Das Dashboard zeigt jetzt Engagement-Trends, deinen Content-Mix und KI-basierte Empfehlungen für bessere Performance.',
    status: 'improved',
    module: 'Dashboard',
    date: '2026-03-10',
    impact: 'Datenbasierte Entscheidungen direkt im Überblick.',
    linkTo: '/help/dashboard-insights/dashboard-ueberblick',
  },
  {
    id: 'update-chat-planner-handoff',
    title: 'Beitragsideen direkt in den Planner übernehmen',
    teaser: 'Im Chat erarbeitete Ideen kannst du jetzt mit einem Klick als Entwurf in den Content Planner übernehmen.',
    status: 'live',
    module: 'Chat',
    date: '2026-03-08',
    impact: 'Kürzerer Weg von der Idee zum geplanten Beitrag.',
  },
  {
    id: 'update-posting-popup',
    title: 'Überarbeitetes Posting-Popup',
    teaser: 'Das Popup beim Veröffentlichen wurde für Klarheit neu gestaltet — mit besserem Status-Feedback und übersichtlicherem Aufbau.',
    status: 'improved',
    module: 'Content Planner',
    date: '2026-03-05',
    impact: 'Klarerer Veröffentlichungsprozess.',
  },
];

// ─── Seed-Content: In Arbeit ────────────────────────────────────────────────

export const inProgressItems: InProgressItem[] = [
  {
    title: 'Verbesserungen für Planner und Publishing',
    description: 'Optimierungen an Planungsflows, Statusübergängen und der Veröffentlichungslogik.',
    module: 'Content Planner',
  },
  {
    title: 'Ausbau der Hilfe und Onboarding-Flows',
    description: 'Weitere Artikel, kontextbezogene Hilfe und ein verbesserter Einstieg für neue Nutzer.',
    module: 'Hilfe',
  },
  {
    title: 'Optimierungen für Integrationen',
    description: 'Stabilere Verbindungen, erweiterte Plattformunterstützung und besseres Fehlermanagement.',
    module: 'Integrationen',
  },
  {
    title: 'Mehr Klarheit im Dashboard',
    description: 'Verbesserungen an der Darstellung und Lesbarkeit von KPIs und Empfehlungen.',
    module: 'Dashboard',
  },
];

// ─── Lookup-Helfer ──────────────────────────────────────────────────────────

export function getRecentUpdates(count?: number): ProductUpdate[] {
  const sorted = [...productUpdates].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  return count ? sorted.slice(0, count) : sorted;
}

export function getLiveUpdates(): ProductUpdate[] {
  return productUpdates.filter(u => u.status === 'live' || u.status === 'improved');
}
