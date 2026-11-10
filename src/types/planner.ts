export type CategoryId = 'deep_work' | 'strategy' | 'health' | 'client' | 'team' | 'personal';

export type PriorityId = 'p1_urgent' | 'p2_high' | 'p3_medium' | 'p4_low';

export type QuadrantId = 'do_first' | 'schedule' | 'delegate' | 'eliminate';

export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: CategoryId;
  priority: PriorityId;
  quadrant: QuadrantId;
  status: TaskStatus;
  estimatedMinutes: number;
  completedMinutes: number;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM
  subtasks: Subtask[];
  tags: string[];
  createdAt: string;
  completedAt?: string;
}

export interface TimeBlock {
  id: string;
  taskId?: string;
  title: string;
  category: CategoryId;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM in 24hr format
  endTime: string; // HH:MM in 24hr format
  isCompleted: boolean;
  notes?: string;
}

export interface Habit {
  id: string;
  title: string;
  category: CategoryId;
  streak: number;
  bestStreak: number;
  targetDaysPerWeek: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'anytime';
  history: Record<string, boolean>; // 'YYYY-MM-DD' -> true
}

export interface FocusSession {
  id: string;
  taskId?: string;
  taskTitle: string;
  category: CategoryId;
  durationMinutes: number;
  mode: 'pomodoro' | 'deep_flow' | 'power_hour' | 'short_break' | 'long_break';
  completedAt: string;
}

export interface CategoryTheme {
  id: CategoryId;
  label: string;
  color: string;
  neonBorder: string;
  neonGlow: string;
  bgSubtle: string;
  textBadge: string;
  dotColor: string;
}

export type ActiveTab = 'timeline' | 'matrix' | 'focus' | 'habits' | 'velocity';
