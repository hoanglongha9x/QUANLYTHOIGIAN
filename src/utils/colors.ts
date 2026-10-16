import { SubjectColor } from '../types';

export const COLOR_PALETTES: Record<string, SubjectColor> = {
  indigo: {
    name: 'Indigo',
    badgeBg: 'bg-indigo-500/15 dark:bg-indigo-500/25',
    badgeText: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-500/40',
    chartColor: '#6366f1',
  },
  emerald: {
    name: 'Xanh ngọc',
    badgeBg: 'bg-emerald-500/15 dark:bg-emerald-500/25',
    badgeText: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/40',
    chartColor: '#10b981',
  },
  amber: {
    name: 'Hổ phách',
    badgeBg: 'bg-amber-500/15 dark:bg-amber-500/25',
    badgeText: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/40',
    chartColor: '#f59e0b',
  },
  violet: {
    name: 'Tím hoa cà',
    badgeBg: 'bg-violet-500/15 dark:bg-violet-500/25',
    badgeText: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-500/40',
    chartColor: '#8b5cf6',
  },
  rose: {
    name: 'Hồng lựu',
    badgeBg: 'bg-rose-500/15 dark:bg-rose-500/25',
    badgeText: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/40',
    chartColor: '#f43f5e',
  },
  sky: {
    name: 'Xanh dương',
    badgeBg: 'bg-sky-500/15 dark:bg-sky-500/25',
    badgeText: 'text-sky-600 dark:text-sky-400',
    border: 'border-sky-500/40',
    chartColor: '#0ea5e9',
  },
  teal: {
    name: 'Xanh Teal',
    badgeBg: 'bg-teal-500/15 dark:bg-teal-500/25',
    badgeText: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-500/40',
    chartColor: '#14b8a6',
  },
  fuchsia: {
    name: 'Hồng Fuchsia',
    badgeBg: 'bg-fuchsia-500/15 dark:bg-fuchsia-500/25',
    badgeText: 'text-fuchsia-600 dark:text-fuchsia-400',
    border: 'border-fuchsia-500/40',
    chartColor: '#d946ef',
  },
};

export function getSubjectColor(colorKey?: string): SubjectColor {
  if (colorKey && COLOR_PALETTES[colorKey]) {
    return COLOR_PALETTES[colorKey];
  }
  return COLOR_PALETTES.indigo;
}

export const AVATAR_OPTIONS = [
  '🦉', '⚡', '🚀', '📚', '🧠', '🎯', 
  '💻', '☕', '🌟', '🦊', '🎨', '🔬',
  '🌱', '🦁', '🏆', '🔥'
];

export const SUBJECT_ICONS = [
  '📐', '💻', '🇬🇧', '📚', '🧠', '🔬',
  '🎨', '💼', '📊', '🎸', '🌐', '✍️'
];
