import { CategoryId, CategoryTheme, PriorityId, QuadrantId } from '../types/planner';

export const CATEGORIES: Record<CategoryId, CategoryTheme> = {
  deep_work: {
    id: 'deep_work',
    label: 'Deep Work',
    color: '#00f0ff',
    neonBorder: 'border-cyan-400/40',
    neonGlow: 'shadow-[0_0_15px_-3px_rgba(0,240,255,0.25)]',
    bgSubtle: 'bg-cyan-950/30',
    textBadge: 'text-cyan-300',
    dotColor: 'bg-cyan-400',
  },
  strategy: {
    id: 'strategy',
    label: 'Strategy & Arch',
    color: '#c084fc',
    neonBorder: 'border-purple-400/40',
    neonGlow: 'shadow-[0_0_15px_-3px_rgba(192,132,252,0.25)]',
    bgSubtle: 'bg-purple-950/30',
    textBadge: 'text-purple-300',
    dotColor: 'bg-purple-400',
  },
  health: {
    id: 'health',
    label: 'Health & Vitality',
    color: '#00f59b',
    neonBorder: 'border-emerald-400/40',
    neonGlow: 'shadow-[0_0_15px_-3px_rgba(0,245,155,0.25)]',
    bgSubtle: 'bg-emerald-950/30',
    textBadge: 'text-emerald-300',
    dotColor: 'bg-emerald-400',
  },
  client: {
    id: 'client',
    label: 'Client & Revenue',
    color: '#f59e0b',
    neonBorder: 'border-amber-400/40',
    neonGlow: 'shadow-[0_0_15px_-3px_rgba(245,158,11,0.25)]',
    bgSubtle: 'bg-amber-950/30',
    textBadge: 'text-amber-300',
    dotColor: 'bg-amber-400',
  },
  team: {
    id: 'team',
    label: 'Team & Sync',
    color: '#38bdf8',
    neonBorder: 'border-sky-400/40',
    neonGlow: 'shadow-[0_0_15px_-3px_rgba(56,189,248,0.25)]',
    bgSubtle: 'bg-sky-950/30',
    textBadge: 'text-sky-300',
    dotColor: 'bg-sky-400',
  },
  personal: {
    id: 'personal',
    label: 'Personal & Life',
    color: '#f43f5e',
    neonBorder: 'border-rose-400/40',
    neonGlow: 'shadow-[0_0_15px_-3px_rgba(244,63,94,0.25)]',
    bgSubtle: 'bg-rose-950/30',
    textBadge: 'text-rose-300',
    dotColor: 'bg-rose-400',
  },
};

export const PRIORITIES: Record<PriorityId, { label: string; short: string; color: string; border: string }> = {
  p1_urgent: {
    label: 'P1 · Critical Urgent',
    short: 'P1',
    color: 'text-rose-400',
    border: 'border-rose-500/50',
  },
  p2_high: {
    label: 'P2 · High Priority',
    short: 'P2',
    color: 'text-amber-400',
    border: 'border-amber-500/50',
  },
  p3_medium: {
    label: 'P3 · Normal Priority',
    short: 'P3',
    color: 'text-cyan-400',
    border: 'border-cyan-500/50',
  },
  p4_low: {
    label: 'P4 · Low / Backlog',
    short: 'P4',
    color: 'text-slate-400',
    border: 'border-slate-600/50',
  },
};

export const QUADRANTS: Record<QuadrantId, { title: string; subtitle: string; action: string; badge: string; border: string; glow: string }> = {
  do_first: {
    title: 'Urgent & Important',
    subtitle: 'High stakes, immediate deadline',
    action: 'Do Immediately',
    badge: 'Q1',
    border: 'border-rose-500/30 hover:border-rose-500/60',
    glow: 'shadow-[0_0_20px_-5px_rgba(244,63,94,0.15)]',
  },
  schedule: {
    title: 'Important & Non-Urgent',
    subtitle: 'Strategic compounding & deep work',
    action: 'Block Time on Calendar',
    badge: 'Q2',
    border: 'border-cyan-500/30 hover:border-cyan-500/60',
    glow: 'shadow-[0_0_20px_-5px_rgba(0,240,255,0.15)]',
  },
  delegate: {
    title: 'Urgent & Non-Important',
    subtitle: 'Interruptions, syncs, logistics',
    action: 'Delegate or Batch',
    badge: 'Q3',
    border: 'border-amber-500/30 hover:border-amber-500/60',
    glow: 'shadow-[0_0_20px_-5px_rgba(245,158,11,0.15)]',
  },
  eliminate: {
    title: 'Non-Urgent & Non-Important',
    subtitle: 'Low leverage, distraction risks',
    action: 'Prune or Automate',
    badge: 'Q4',
    border: 'border-slate-700/50 hover:border-slate-600/80',
    glow: 'shadow-[0_0_20px_-5px_rgba(100,116,139,0.1)]',
  },
};

export const FOCUS_MODES = [
  { id: 'pomodoro', label: 'Pomodoro', minutes: 25, type: 'focus', tag: 'Standard Cycle' },
  { id: 'deep_flow', label: 'Deep Flow', minutes: 50, type: 'focus', tag: 'High Immersion' },
  { id: 'power_hour', label: 'Power Hour', minutes: 60, type: 'focus', tag: 'Sprint Mode' },
  { id: 'short_break', label: 'Short Rest', minutes: 5, type: 'break', tag: 'Recalibrate' },
  { id: 'long_break', label: 'Long Rest', minutes: 15, type: 'break', tag: 'Full Reset' },
] as const;
