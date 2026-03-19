export interface TourStep {
  id: string;
  type: 'modal' | 'spotlight';
  selector?: string;
  title: string;
  subtitle?: string;
  body: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'bottom-right' | 'bottom-left';
  icon: 'rocket' | 'chart' | 'chat' | 'pulse' | 'calendar' | 'brand' | 'check' | 'filter' | 'post' | 'approve';
  cta?: string;
}

export const ONBOARDING_STEPS: TourStep[] = [
  {
    id: 'welcome',
    type: 'modal',
    title: 'Willkommen bei Vektrus',
    subtitle: 'Social Media. Automatisiert. Für dich.',
    body: 'In den nächsten Schritten zeige ich dir, wie du mit Vektrus deine Social-Media-Strategie auf Autopilot stellst — in unter 3 Minuten.',
    icon: 'rocket',
    cta: "Los geht's",
  },
  {
    id: 'dashboard',
    type: 'spotlight',
    selector: "[data-tour='dashboard']",
    title: 'Dein Dashboard',
    body: 'Hier siehst du alle wichtigen Kennzahlen deiner Social-Media-Kanäle auf einen Blick — Reichweite, Engagement und Wachstum.',
    position: 'right',
    icon: 'chart',
  },
  {
    id: 'chat',
    type: 'spotlight',
    selector: "[data-tour='chat']",
    title: 'Vektrus Chat',
    body: 'Dein persönlicher KI-Assistent. Frag ihn nach Post-Ideen, Strategien oder lass dir einen kompletten Contentplan erstellen.',
    position: 'right',
    icon: 'chat',
  },
  {
    id: 'pulse',
    type: 'spotlight',
    selector: "[data-tour='pulse']",
    title: 'Vektrus Pulse',
    body: 'Ein Klick — eine ganze Woche Content. Pulse generiert Posts für all deine Plattformen, passend zu deiner Marke und deinen Zielen.',
    position: 'right',
    icon: 'pulse',
  },
  {
    id: 'planner',
    type: 'spotlight',
    selector: "[data-tour='planner']",
    title: 'Content-Planer',
    body: 'Alle generierten Posts landen hier. Bearbeite, genehmige oder plane sie — alles in einer Kalender-Ansicht.',
    position: 'right',
    icon: 'calendar',
  },
  {
    id: 'brand',
    type: 'spotlight',
    selector: "[data-tour='brand']",
    title: 'Deine Marke',
    body: 'Lade dein Logo und bestehende Designs hoch — Vektrus lernt deinen visuellen Stil und generiert Content, der zu deiner Marke passt.',
    position: 'right',
    icon: 'brand',
  },
  {
    id: 'complete',
    type: 'modal',
    title: 'Du bist startklar!',
    subtitle: 'Weniger Aufwand. Mehr Wirkung.',
    body: 'Starte am besten mit dem Chat — frag Vektrus einfach, was du brauchst. Deine KI lernt mit jeder Interaktion dazu.',
    icon: 'check',
    cta: 'Jetzt loslegen',
  },
];

export const PLANNER_STEPS: TourStep[] = [
  {
    id: 'planner-welcome',
    type: 'modal',
    title: 'Dein Content-Planer',
    subtitle: 'Alles auf einen Blick',
    body: 'Hier verwaltest du alle deine Social-Media-Posts — von Vektrus generiert oder manuell erstellt. Kurze Einführung in 4 Schritten.',
    icon: 'calendar',
    cta: 'Zeig mir wie',
  },
  {
    id: 'planner-calendar',
    type: 'spotlight',
    selector: "[data-tour='planner-calendar']",
    title: 'Kalender-Ansicht',
    body: 'Deine Posts werden hier im Kalender angezeigt. Du siehst auf einen Blick, wann welcher Post geplant ist. Klicke auf einen Post, um ihn zu bearbeiten.',
    position: 'bottom',
    icon: 'calendar',
  },
  {
    id: 'planner-pulse-button',
    type: 'spotlight',
    selector: "[data-tour='planner-pulse-button']",
    title: 'Mit Pulse generieren',
    body: 'Noch keine Posts? Klicke hier, um mit Vektrus Pulse automatisch Content für die ganze Woche zu erstellen.',
    position: 'bottom',
    icon: 'pulse',
  },
  {
    id: 'planner-filter',
    type: 'spotlight',
    selector: "[data-tour='planner-filter']",
    title: 'Plattform-Filter',
    body: 'Filtere nach Instagram, LinkedIn, TikTok und mehr — so siehst du nur die Posts für die Plattform, die dich gerade interessiert.',
    position: 'bottom',
    icon: 'filter',
  },
  {
    id: 'planner-done',
    type: 'modal',
    title: 'Bereit zum Planen!',
    body: 'Tipp: Starte mit Pulse, um automatisch Posts zu generieren — und bearbeite sie hier im Planer nach deinen Wünschen.',
    icon: 'check',
    cta: 'Verstanden',
  },
];
