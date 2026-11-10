import { Task, TimeBlock, Habit, FocusSession } from '../types/planner';

const STORAGE_KEYS = {
  TASKS: 'qp_tasks_v1',
  TIMEBLOCKS: 'qp_timeblocks_v1',
  HABITS: 'qp_habits_v1',
  FOCUS_SESSIONS: 'qp_sessions_v1',
};

// Format Date to YYYY-MM-DD
export function formatDate(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Generate relative dates
export function getRelativeDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return formatDate(d);
}

// Initial realistic seed data
export function getInitialSeedData(): {
  tasks: Task[];
  timeblocks: TimeBlock[];
  habits: Habit[];
  sessions: FocusSession[];
} {
  const today = formatDate();
  const yesterday = getRelativeDate(-1);
  const tomorrow = getRelativeDate(1);
  const dayAfter = getRelativeDate(2);

  const tasks: Task[] = [
    {
      id: 'task-1',
      title: 'Architect Real-Time Notification Pipeline',
      description: 'Review WebSocket vs SSE benchmarks, draft schema payload, finalize idempotency headers.',
      category: 'deep_work',
      priority: 'p1_urgent',
      quadrant: 'do_first',
      status: 'in_progress',
      estimatedMinutes: 90,
      completedMinutes: 50,
      dueDate: today,
      dueTime: '11:30',
      subtasks: [
        { id: 'st-1', title: 'Draft WebSocket reconnect backoff strategy', completed: true },
        { id: 'st-2', title: 'Benchmark message queuing broker throughput', completed: true },
        { id: 'st-3', title: 'Write OpenAPI schema spec & unit tests', completed: false },
      ],
      tags: ['backend', 'distributed-systems', 'rfc'],
      createdAt: yesterday,
    },
    {
      id: 'task-2',
      title: 'Q4 Product Roadmap & Velocity Synthesis',
      description: 'Synthesize user telemetry feedback, cross-functional engineering deliverables, and resource allocation.',
      category: 'strategy',
      priority: 'p2_high',
      quadrant: 'schedule',
      status: 'todo',
      estimatedMinutes: 60,
      completedMinutes: 0,
      dueDate: today,
      dueTime: '15:00',
      subtasks: [
        { id: 'st-4', title: 'Aggregate telemetry metrics from customer cohort A', completed: false },
        { id: 'st-5', title: 'Align milestone dates with platform team', completed: false },
      ],
      tags: ['roadmap', 'exec', 'planning'],
      createdAt: yesterday,
    },
    {
      id: 'task-3',
      title: 'Enterprise Security Vulnerability Audit',
      description: 'Verify CSP headers, review token rotation rules, sanitize third-party webhooks.',
      category: 'deep_work',
      priority: 'p1_urgent',
      quadrant: 'do_first',
      status: 'todo',
      estimatedMinutes: 45,
      completedMinutes: 0,
      dueDate: today,
      dueTime: '16:30',
      subtasks: [
        { id: 'st-6', title: 'Run static analysis pass on auth middleware', completed: false },
        { id: 'st-7', title: 'Rotate stale staging service credentials', completed: false },
      ],
      tags: ['security', 'compliance'],
      createdAt: yesterday,
    },
    {
      id: 'task-4',
      title: 'Customer Advisory Board Demo Walkthrough',
      description: 'Present the midnight neon analytics dashboard prototype to top 5 design partners.',
      category: 'client',
      priority: 'p1_urgent',
      quadrant: 'do_first',
      status: 'todo',
      estimatedMinutes: 45,
      completedMinutes: 0,
      dueDate: today,
      dueTime: '14:00',
      subtasks: [
        { id: 'st-8', title: 'Prepare interactive staging link', completed: true },
        { id: 'st-9', title: 'Review 3 key workflow highlight slides', completed: false },
      ],
      tags: ['demo', 'feedback'],
      createdAt: yesterday,
    },
    {
      id: 'task-5',
      title: 'High-Intensity Zone 2 Aerobic & Core Reset',
      description: '45-minute continuous ergometer interval session followed by mobility & hip decompression.',
      category: 'health',
      priority: 'p2_high',
      quadrant: 'schedule',
      status: 'completed',
      estimatedMinutes: 50,
      completedMinutes: 50,
      dueDate: today,
      dueTime: '07:30',
      subtasks: [
        { id: 'st-10', title: '10m warm-up & dynamic mobility', completed: true },
        { id: 'st-11', title: '35m Zone 2 aerobic threshold maintain', completed: true },
        { id: 'st-12', title: 'Electrolyte hydration protocol', completed: true },
      ],
      tags: ['fitness', 'recovery'],
      createdAt: yesterday,
      completedAt: today,
    },
    {
      id: 'task-6',
      title: 'Triage Engineering Pull Requests & Review Queue',
      description: 'Clear pending pull requests, leave actionable inline code reviews.',
      category: 'team',
      priority: 'p3_medium',
      quadrant: 'delegate',
      status: 'completed',
      estimatedMinutes: 30,
      completedMinutes: 30,
      dueDate: today,
      dueTime: '10:00',
      subtasks: [
        { id: 'st-13', title: 'PR #342: Database index migration', completed: true },
        { id: 'st-14', title: 'PR #348: UI neon theme contrast update', completed: true },
      ],
      tags: ['code-review', 'mentorship'],
      createdAt: yesterday,
      completedAt: today,
    },
    {
      id: 'task-7',
      title: 'Weekly Budget Reconciliation & AWS Cloud Cost Trim',
      description: 'Inspect unused compute instances, terminate unattached EBS snapshots.',
      category: 'strategy',
      priority: 'p3_medium',
      quadrant: 'delegate',
      status: 'todo',
      estimatedMinutes: 40,
      completedMinutes: 0,
      dueDate: tomorrow,
      subtasks: [
        { id: 'st-15', title: 'Audit CloudWatch logs retention policies', completed: false },
      ],
      tags: ['devops', 'finance'],
      createdAt: yesterday,
    },
    {
      id: 'task-8',
      title: 'Deep Rest & Sleep Hygiene Calibration',
      description: 'Dim screen luminescence by 21:30, 20m non-sleep deep rest session, read physical book.',
      category: 'health',
      priority: 'p2_high',
      quadrant: 'schedule',
      status: 'todo',
      estimatedMinutes: 30,
      completedMinutes: 0,
      dueDate: today,
      dueTime: '21:30',
      subtasks: [
        { id: 'st-16', title: 'Activate blue-light suppression', completed: false },
        { id: 'st-17', title: 'Read 20 pages of Systems Architecture manual', completed: false },
      ],
      tags: ['sleep', 'recharge'],
      createdAt: today,
    },
  ];

  const timeblocks: TimeBlock[] = [
    {
      id: 'tb-1',
      taskId: 'task-5',
      title: 'Zone 2 Cardio & Physical Calibration',
      category: 'health',
      date: today,
      startTime: '07:30',
      endTime: '08:30',
      isCompleted: true,
      notes: 'Maintained 138bpm target HR. Hydrated with minerals.',
    },
    {
      id: 'tb-2',
      taskId: 'task-1',
      title: 'Deep Work: Real-Time Event Pipeline Architecture',
      category: 'deep_work',
      date: today,
      startTime: '09:00',
      endTime: '11:00',
      isCompleted: false,
      notes: 'No slack, no email. Focus on WebSocket payload optimization.',
    },
    {
      id: 'tb-3',
      taskId: 'task-6',
      title: 'Engineering Review & Async PR Triage',
      category: 'team',
      date: today,
      startTime: '11:15',
      endTime: '12:00',
      isCompleted: true,
      notes: 'Approved core schema PR.',
    },
    {
      id: 'tb-4',
      taskId: 'task-4',
      title: 'Executive Demo: Partner Advisory Walkthrough',
      category: 'client',
      date: today,
      startTime: '13:30',
      endTime: '14:30',
      isCompleted: false,
      notes: 'Showcase neon scheduler and speed workflow.',
    },
    {
      id: 'tb-5',
      taskId: 'task-2',
      title: 'Strategic Synthesis: Q4 Milestone Blueprint',
      category: 'strategy',
      date: today,
      startTime: '15:00',
      endTime: '16:30',
      isCompleted: false,
    },
    {
      id: 'tb-6',
      taskId: 'task-3',
      title: 'Security Vulnerability Audit & Token Rotation',
      category: 'deep_work',
      date: today,
      startTime: '17:00',
      endTime: '18:00',
      isCompleted: false,
    },
    {
      id: 'tb-7',
      taskId: 'task-8',
      title: 'Evening Shutdown & Non-Screen Reading',
      category: 'health',
      date: today,
      startTime: '21:00',
      endTime: '22:00',
      isCompleted: false,
    },
  ];

  const habits: Habit[] = [
    {
      id: 'habit-1',
      title: 'Morning Deep Work Block (90m zero distraction)',
      category: 'deep_work',
      streak: 14,
      bestStreak: 21,
      targetDaysPerWeek: 5,
      timeOfDay: 'morning',
      history: {
        [getRelativeDate(-4)]: true,
        [getRelativeDate(-3)]: true,
        [getRelativeDate(-2)]: true,
        [yesterday]: true,
        [today]: true,
      },
    },
    {
      id: 'habit-2',
      title: 'Daily Aerobic or Resistance Training (45m)',
      category: 'health',
      streak: 8,
      bestStreak: 16,
      targetDaysPerWeek: 6,
      timeOfDay: 'morning',
      history: {
        [getRelativeDate(-4)]: true,
        [getRelativeDate(-3)]: true,
        [getRelativeDate(-2)]: false,
        [yesterday]: true,
        [today]: true,
      },
    },
    {
      id: 'habit-3',
      title: 'Inbox Zero & Queue Triage (Batch at 11am & 4pm)',
      category: 'team',
      streak: 5,
      bestStreak: 12,
      targetDaysPerWeek: 5,
      timeOfDay: 'afternoon',
      history: {
        [getRelativeDate(-3)]: true,
        [getRelativeDate(-2)]: true,
        [yesterday]: true,
        [today]: true,
      },
    },
    {
      id: 'habit-4',
      title: 'Strategic Architecture Reading & Notes (30m)',
      category: 'strategy',
      streak: 11,
      bestStreak: 19,
      targetDaysPerWeek: 5,
      timeOfDay: 'evening',
      history: {
        [getRelativeDate(-4)]: true,
        [getRelativeDate(-3)]: true,
        [getRelativeDate(-2)]: true,
        [yesterday]: true,
        [today]: false,
      },
    },
    {
      id: 'habit-5',
      title: 'Shutdown Protocol & Next-Day Pre-Planning',
      category: 'personal',
      streak: 19,
      bestStreak: 24,
      targetDaysPerWeek: 7,
      timeOfDay: 'evening',
      history: {
        [getRelativeDate(-4)]: true,
        [getRelativeDate(-3)]: true,
        [getRelativeDate(-2)]: true,
        [yesterday]: true,
        [today]: false,
      },
    },
  ];

  const sessions: FocusSession[] = [
    {
      id: 'sess-1',
      taskId: 'task-5',
      taskTitle: 'Zone 2 Cardio Calibration',
      category: 'health',
      durationMinutes: 50,
      mode: 'power_hour',
      completedAt: `${today}T08:20:00.000Z`,
    },
    {
      id: 'sess-2',
      taskId: 'task-1',
      taskTitle: 'Architect Real-Time Notification Pipeline',
      category: 'deep_work',
      durationMinutes: 50,
      mode: 'deep_flow',
      completedAt: `${today}T10:15:00.000Z`,
    },
    {
      id: 'sess-3',
      taskId: 'task-6',
      taskTitle: 'Triage Engineering Pull Requests',
      category: 'team',
      durationMinutes: 25,
      mode: 'pomodoro',
      completedAt: `${today}T11:45:00.000Z`,
    },
  ];

  return { tasks, timeblocks, habits, sessions };
}

export function loadData<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultVal;
    return JSON.parse(raw);
  } catch {
    return defaultVal;
  }
}

export function saveData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage quota or restriction handled
  }
}

export { STORAGE_KEYS };
