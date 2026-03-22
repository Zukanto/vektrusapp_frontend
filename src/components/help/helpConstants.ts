import {
  Rocket, Zap, Calendar, BarChart3, Palette, Image, Link,
  CreditCard, Lightbulb, BookOpen,
} from 'lucide-react';
import type React from 'react';

export const CATEGORY_ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Rocket, Zap, Calendar, BarChart3, Palette, Image, Link, CreditCard, Lightbulb,
};

export const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Einsteiger',
  intermediate: 'Fortgeschritten',
  advanced: 'Experte',
};

export function getCategoryIcon(iconName: string): React.FC<{ className?: string }> {
  return CATEGORY_ICON_MAP[iconName] || BookOpen;
}
