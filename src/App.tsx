import React, { useState, useEffect } from 'react';
import { Task, TimeBlock, Habit, FocusSession, ActiveTab } from './types/planner';
import { 
  getInitialSeedData, 
  loadData, 
  saveData, 
  STORAGE_KEYS, 
  formatDate 
} from './utils/storage';
import { Header } from './components/Header';
import { TimelineView } from './components/views/TimelineView';
import { MatrixView } from './components/views/MatrixView';
import { FocusView } from './components/views/FocusView';
import { HabitsView } from './components/views/HabitsView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { QuickAddModal } from './components/QuickAddModal';
import { TaskDetailModal } from './components/TaskDetailModal';
import { sound } from './utils/audio';
import confetti from 'canvas-confetti';

export default function App() {
  const initialData = getInitialSeedData();

  const [tasks, setTasks] = useState<Task[]>(() =>
    loadData(STORAGE_KEYS.TASKS, initialData.tasks)
  );
  const [timeblocks, setTimeblocks] = useState<TimeBlock[]>(() =>
    loadData(STORAGE_KEYS.TIMEBLOCKS, initialData.timeblocks)
  );
  const [habits, setHabits] = useState<Habit[]>(() =>
    loadData(STORAGE_KEYS.HABITS, initialData.habits)
  );
  const [sessions, setSessions] = useState<FocusSession[]>(() =>
    loadData(STORAGE_KEYS.FOCUS_SESSIONS, initialData.sessions)
  );

  const [activeTab, setActiveTab] = useState<ActiveTab>('timeline');
  const [selectedDate, setSelectedDate] = useState<string>(formatDate());

  // Modals & Active Selections
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddTime, setQuickAddTime] = useState('09:00');
  const [quickAddDate, setQuickAddDate] = useState(formatDate());

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<TimeBlock | null>(null);
  const [activeTaskForFocus, setActiveTaskForFocus] = useState<Task | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // Sync to local storage
  useEffect(() => {
    saveData(STORAGE_KEYS.TASKS, tasks);
  }, [tasks]);

  useEffect(() => {
    saveData(STORAGE_KEYS.TIMEBLOCKS, timeblocks);
  }, [timeblocks]);

  useEffect(() => {
    saveData(STORAGE_KEYS.HABITS, habits);
  }, [habits]);

  useEffect(() => {
    saveData(STORAGE_KEYS.FOCUS_SESSIONS, sessions);
  }, [sessions]);

  // Global Keyboard Shortcuts (Cmd+K for quick add, 1-5 for tab switching)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        if (e.key === 'Escape' && isQuickAddOpen) {
          setIsQuickAddOpen(false);
        }
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsQuickAddOpen(true);
      } else if (e.key === '1') {
        setActiveTab('timeline');
      } else if (e.key === '2') {
        setActiveTab('matrix');
      } else if (e.key === '3') {
        setActiveTab('focus');
      } else if (e.key === '4') {
        setActiveTab('habits');
      } else if (e.key === '5') {
        setActiveTab('velocity');
      } else if (e.key === 'Escape') {
        setIsQuickAddOpen(false);
        setSelectedTask(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQuickAddOpen]);

  // Add Task handler
  const handleAddTask = (newTask: Task, autoScheduleBlock: boolean = true) => {
    setTasks((prev) => [newTask, ...prev]);

    if (autoScheduleBlock && newTask.dueTime) {
      // Compute end time based on duration
      const [h, m] = newTask.dueTime.split(':').map(Number);
      const totalMinutes = h * 60 + m + (newTask.estimatedMinutes || 30);
      const endH = Math.min(23, Math.floor(totalMinutes / 60));
      const endM = totalMinutes % 60;
      const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

      const newBlock: TimeBlock = {
        id: `tb-${Date.now()}`,
        taskId: newTask.id,
        title: newTask.title,
        category: newTask.category,
        date: newTask.dueDate || selectedDate,
        startTime: newTask.dueTime,
        endTime: endTime,
        isCompleted: false,
        notes: newTask.description,
      };

      setTimeblocks((prev) => [...prev, newBlock]);
    }
  };

  // Update Task handler
  const handleUpdateTask = (updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    // Also sync completion to any linked timeblocks
    if (updated.status === 'completed') {
      setTimeblocks((prev) =>
        prev.map((b) => (b.taskId === updated.id ? { ...b, isCompleted: true } : b))
      );
    }
    if (selectedTask?.id === updated.id) {
      setSelectedTask(updated);
    }
  };

  // Delete Task handler
  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setTimeblocks((prev) => prev.filter((b) => b.taskId !== id));
    if (selectedTask?.id === id) {
      setSelectedTask(null);
    }
    if (activeTaskForFocus?.id === id) {
      setActiveTaskForFocus(null);
    }
  };

  // Toggle TimeBlock completion
  const handleToggleBlockComplete = (blockId: string) => {
    setTimeblocks((prev) =>
      prev.map((b) => {
        if (b.id === blockId) {
          const nextState = !b.isCompleted;
          // If linked to task, sync task completion
          if (b.taskId) {
            setTasks((tList) =>
              tList.map((t) =>
                t.id === b.taskId
                  ? { ...t, status: nextState ? 'completed' : 'todo' }
                  : t
              )
            );
          }
          return { ...b, isCompleted: nextState };
        }
        return b;
      })
    );
  };

  // Delete TimeBlock
  const handleDeleteTimeBlock = (blockId: string) => {
    setTimeblocks((prev) => prev.filter((b) => b.id !== blockId));
  };

  // Auto-schedule unscheduled backlog tasks into day's empty time gaps
  const handleAutoScheduleGaps = (dateStr: string) => {
    sound.playStartBlip();
    const unscheduledTasks = tasks.filter(
      (t) => t.status !== 'completed' && !timeblocks.some((b) => b.taskId === t.id && b.date === dateStr)
    );

    if (unscheduledTasks.length === 0) {
      alert('All pending tasks are already scheduled on your calendar!');
      return;
    }

    // Existing blocks on this date
    const dayBlocks = timeblocks.filter((b) => b.date === dateStr);
    let nextStartHour = 10;
    const newBlocks: TimeBlock[] = [];

    unscheduledTasks.slice(0, 3).forEach((task) => {
      // Find a slot
      let slotFound = false;
      while (nextStartHour <= 19 && !slotFound) {
        const startStr = `${String(nextStartHour).padStart(2, '0')}:00`;
        const dur = Math.min(90, Math.max(30, task.estimatedMinutes || 45));
        const endTotal = nextStartHour * 60 + dur;
        const endH = Math.floor(endTotal / 60);
        const endM = endTotal % 60;
        const endStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

        // Check conflict
        const hasConflict = dayBlocks.some(
          (b) =>
            (startStr >= b.startTime && startStr < b.endTime) ||
            (endStr > b.startTime && endStr <= b.endTime)
        );

        if (!hasConflict) {
          newBlocks.push({
            id: `tb-${Date.now()}-${task.id}`,
            taskId: task.id,
            title: task.title,
            category: task.category,
            date: dateStr,
            startTime: startStr,
            endTime: endStr,
            isCompleted: false,
            notes: task.description,
          });
          slotFound = true;
          nextStartHour = endH + 1;
        } else {
          nextStartHour += 1;
        }
      }
    });

    if (newBlocks.length > 0) {
      setTimeblocks((prev) => [...prev, ...newBlocks]);
      sound.playCompletionChime();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    }
  };

  // Focus session completed
  const handleSessionComplete = (session: FocusSession) => {
    setSessions((prev) => [session, ...prev]);

    // If attached to a task, update completedMinutes
    if (session.taskId) {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === session.taskId) {
            const newMinutes = (t.completedMinutes || 0) + session.durationMinutes;
            const isCompleted = newMinutes >= t.estimatedMinutes;
            return {
              ...t,
              completedMinutes: newMinutes,
              status: isCompleted ? 'completed' : t.status,
              completedAt: isCompleted ? new Date().toISOString() : t.completedAt,
            };
          }
          return t;
        })
      );
    }
  };

  // Reset to original seed data
  const handleResetData = () => {
    if (confirm('Reset QuickPlanner to default demo dataset? This will restore sample tasks and timeblocks.')) {
      const fresh = getInitialSeedData();
      setTasks(fresh.tasks);
      setTimeblocks(fresh.timeblocks);
      setHabits(fresh.habits);
      setSessions(fresh.sessions);
      setSelectedDate(formatDate());
      sound.playStartBlip();
    }
  };

  const pendingTasksCount = tasks.filter((t) => t.status !== 'completed').length;

  return (
    <div className="min-h-screen bg-[#07090e] bg-grid-midnight text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Bar Header adhering strictly to Top Bar Contract */}
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
        }}
        onOpenQuickAdd={() => {
          setQuickAddDate(selectedDate);
          setQuickAddTime('10:00');
          setIsQuickAddOpen(true);
        }}
        isMuted={isMuted}
        onToggleMute={() => {
          sound.isMuted = !isMuted;
          setIsMuted(!isMuted);
        }}
        pendingTasksCount={pendingTasksCount}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'timeline' && (
          <TimelineView
            tasks={tasks}
            timeblocks={timeblocks}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onSelectTask={(task, block) => {
              setSelectedTask(task);
              setSelectedBlock(block || null);
            }}
            onToggleBlockComplete={handleToggleBlockComplete}
            onOpenQuickAddWithTime={(date, time) => {
              setQuickAddDate(date);
              setQuickAddTime(time);
              setIsQuickAddOpen(true);
            }}
            onAutoScheduleGaps={handleAutoScheduleGaps}
          />
        )}

        {activeTab === 'matrix' && (
          <MatrixView
            tasks={tasks}
            onSelectTask={(task) => {
              setSelectedTask(task);
              setSelectedBlock(null);
            }}
            onUpdateTask={handleUpdateTask}
            onStartFocus={(task) => {
              setActiveTaskForFocus(task);
              setActiveTab('focus');
            }}
            onOpenQuickAdd={() => {
              setQuickAddDate(selectedDate);
              setQuickAddTime('10:00');
              setIsQuickAddOpen(true);
            }}
          />
        )}

        {activeTab === 'focus' && (
          <FocusView
            tasks={tasks}
            activeTask={activeTaskForFocus}
            onSelectActiveTask={setActiveTaskForFocus}
            onSessionComplete={handleSessionComplete}
            completedSessions={sessions}
          />
        )}

        {activeTab === 'habits' && (
          <HabitsView
            habits={habits}
            onUpdateHabit={(updated) => {
              setHabits((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
            }}
            onAddHabit={(newHabit) => {
              setHabits((prev) => [newHabit, ...prev]);
            }}
            onDeleteHabit={(id) => {
              setHabits((prev) => prev.filter((h) => h.id !== id));
            }}
          />
        )}

        {activeTab === 'velocity' && (
          <AnalyticsView
            tasks={tasks}
            sessions={sessions}
            habits={habits}
            timeblocks={timeblocks}
          />
        )}
      </main>

      {/* Clean Footer (No AI slop or fake telemetry tickers) */}
      <footer className="border-t border-slate-900 bg-[#080b13]/80 px-6 py-4 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-sans font-medium">QuickPlanner</span>
            <span>·</span>
            <span>Midnight Neon Architecture</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="hidden md:inline text-slate-500">
              Shortcuts: <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-300">⌘K</kbd> Quick Capture · <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-300">1-5</kbd> Switch Views
            </span>
            <button
              onClick={handleResetData}
              className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            >
              Reset Demo Data
            </button>
          </div>
        </div>
      </footer>

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onAddTask={handleAddTask}
        initialDate={quickAddDate}
        initialTime={quickAddTime}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        timeBlock={selectedBlock}
        isOpen={!!selectedTask}
        onClose={() => {
          setSelectedTask(null);
          setSelectedBlock(null);
        }}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        onStartFocus={(task) => {
          setActiveTaskForFocus(task);
          setActiveTab('focus');
        }}
        onDeleteTimeBlock={handleDeleteTimeBlock}
      />
    </div>
  );
}
