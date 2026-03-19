export interface UploadedImage {
  id: string;
  file: File;
  previewUrl: string;
  publicUrl: string;
  description: string;
  uploading: boolean;
  error?: string;
}

export interface VisualWizardData {
  images: UploadedImage[];
  platforms: string[];
  scheduleType: 'next_7_days' | 'next_week' | 'next_14_days' | 'custom';
  timeframe: {
    startDate: Date;
    endDate: Date;
  };
  tone: string;
  goal: string;
  language: string;
  apply_ci: boolean;
}

export function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function getSunday(monday: Date): Date {
  const sun = new Date(monday);
  sun.setDate(monday.getDate() + 6);
  sun.setHours(23, 59, 59, 999);
  return sun;
}

export function computeDates(type: string): { start: Date; end: Date } {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  switch (type) {
    case 'next_7_days': {
      const end = new Date(now);
      end.setDate(now.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { start: now, end };
    }
    case 'next_week': {
      const thisMonday = getMonday(now);
      const nextMon = new Date(thisMonday);
      nextMon.setDate(thisMonday.getDate() + 7);
      return { start: nextMon, end: getSunday(nextMon) };
    }
    case 'next_14_days': {
      const end = new Date(now);
      end.setDate(now.getDate() + 13);
      end.setHours(23, 59, 59, 999);
      return { start: now, end };
    }
    default:
      return { start: now, end: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000) };
  }
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function toInputDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
