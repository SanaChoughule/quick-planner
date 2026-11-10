import React, { useState } from 'react';
import { Habit, CategoryId } from '../../types/planner';
import { CATEGORIES } from '../../utils/constants';
import { formatDate, getRelativeDate } from '../../utils/storage';
import { 
  Flame, 
  Check, 
  Plus, 
  Trash2, 
  Award, 
  Sparkles, 
  TrendingUp, 
  Calendar 
} from 'lucide-react';
import { sound } from '../../utils/audio';
import confetti from 'canvas-confetti';

interface HabitsViewProps {
  habits: Habit[];
  onUpdateHabit: (habit: Habit) => void;
  onAddHabit: (habit: Habit) => void;
  onDeleteHabit: (id: string) => void;
}

export const HabitsView: React.FC<HabitsViewProps> = ({
  habits,
  onUpdateHabit,
  onAddHabit,
  onDeleteHabit,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryId>('deep_work');
  const [targetDays, setTargetDays] = useState(5);
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'anytime'>('morning');

  const today = formatDate();
  // Last 7 days for the weekly check-in matrix
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const offset = 6 - i; // 6 days ago up to today
    const dateStr = getRelativeDate(-offset);
    const d = new Date(dateStr + 'T00:00:00');
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'narrow' });
    const isToday = dateStr === today;
    return { dateStr, dayLabel, isToday };
  });

  const handleToggleHabitDay = (habit: Habit, dateStr: string) => {
    sound.playStartBlip();
    const currentVal = !!habit.history[dateStr];
    const nextVal = !currentVal;
    const newHistory = { ...habit.history, [dateStr]: nextVal };

    // Recalculate streak
    let newStreak = habit.streak;
    if (nextVal) {
      newStreak += 1;
      if (dateStr === today) {
        sound.playCompletionChime();
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      }
    } else {
      newStreak = Math.max(0, newStreak - 1);
    }
    const newBest = Math.max(habit.bestStreak, newStreak);

    onUpdateHabit({
      ...habit,
      history: newHistory,
      streak: newStreak,
      bestStreak: newBest,
    });
  };

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    sound.playStartBlip();
    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      title: title.trim(),
      category,
      streak: 0,
      bestStreak: 0,
      targetDaysPerWeek: targetDays,
      timeOfDay,
      history: {},
    };

    onAddHabit(newHabit);
    setTitle('');
    setShowAddForm(false);
  };

  // Metrics
  const habitsDoneToday = habits.filter((h) => !!h.history[today]).length;
  const habitCompletionRate = habits.length > 0
    ? Math.round((habitsDoneToday / habits.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner & Metrics */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0c101c]/90 border border-slate-800/80 rounded-2xl p-4 lg:p-5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Flame className="w-5 h-5 fill-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-display">
              Daily Rituals & Consistency Streaks
            </h2>
            <p className="text-xs text-slate-400">
              Repetition compounds into operational mastery
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <div className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2">
            <span className="text-slate-400">Today's Rituals:</span>
            <span className="text-cyan-400 font-bold tabular-nums">
              {habitsDoneToday} / {habits.length} ({habitCompletionRate}%)
            </span>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-black bg-[#00f0ff] hover:bg-[#3cf9ff] rounded-xl shadow-[0_0_12px_rgba(0,240,255,0.3)] transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Ritual</span>
          </button>
        </div>
      </div>

      {/* Inline New Habit Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreateHabit}
          className="bg-[#0c101c] border border-cyan-500/30 rounded-2xl p-5 shadow-[0_0_30px_rgba(0,240,255,0.1)] space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white font-display">
              Design a Non-Negotiable Ritual
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Habit Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 30m Systems Architecture Reading"
                className="w-full bg-[#111728] border border-slate-800 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryId)}
                className="w-full bg-[#111728] border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                {Object.values(CATEGORIES).map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Target Days / Wk
              </label>
              <select
                value={targetDays}
                onChange={(e) => setTargetDays(Number(e.target.value))}
                className="w-full bg-[#111728] border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
              >
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <option key={num} value={num}>
                    {num} Days / Week
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-black bg-[#00f0ff] hover:bg-[#3cf9ff] rounded-lg cursor-pointer"
            >
              Save Ritual
            </button>
          </div>
        </form>
      )}

      {/* Habits List Grid */}
      <div className="grid grid-cols-1 gap-4">
        {habits.map((habit) => {
          const cat = CATEGORIES[habit.category];
          const isDoneToday = !!habit.history[today];

          return (
            <div
              key={habit.id}
              className="bg-[#0c101c] border border-slate-800/80 hover:border-slate-700 rounded-2xl p-4 lg:p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              {/* Left: Habit info and category */}
              <div className="flex items-start md:items-center gap-3.5 flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => handleToggleHabitDay(habit, today)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 border ${
                    isDoneToday
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_12px_rgba(0,245,155,0.3)]'
                      : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'
                  }`}
                  title={isDoneToday ? 'Completed Today!' : 'Mark Completed Today'}
                >
                  <Check className={`w-5 h-5 ${isDoneToday ? 'stroke-[2.5]' : ''}`} />
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${cat.bgSubtle} ${cat.textBadge} border ${cat.neonBorder}`}>
                      {cat.label}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-[11px] font-mono text-slate-400 capitalize">
                      {habit.timeOfDay}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Goal: {habit.targetDaysPerWeek}d/wk
                    </span>
                  </div>
                  <h3 className={`text-sm font-semibold text-white truncate ${isDoneToday ? 'text-slate-200' : ''}`}>
                    {habit.title}
                  </h3>
                </div>
              </div>

              {/* Right: Streak & 7-Day History Matrix */}
              <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800/60">
                {/* 7-Day Mini Checkin Boxes */}
                <div className="flex items-center gap-1.5">
                  {past7Days.map((day) => {
                    const checked = !!habit.history[day.dateStr];
                    return (
                      <button
                        key={day.dateStr}
                        onClick={() => handleToggleHabitDay(habit, day.dateStr)}
                        className={`w-7 h-7 rounded-lg flex flex-col items-center justify-center text-[9px] font-mono transition-all cursor-pointer border ${
                          checked
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_8px_rgba(0,240,255,0.2)]'
                            : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:border-slate-700'
                        } ${day.isToday ? 'ring-1 ring-cyan-400/50' : ''}`}
                        title={`${day.dateStr}: ${checked ? 'Completed' : 'Missed'}`}
                      >
                        <span>{day.dayLabel}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Streak Counter */}
                <div className="flex items-center gap-2 font-mono text-xs text-amber-400 bg-amber-950/30 border border-amber-500/30 px-3 py-1.5 rounded-xl shadow-[0_0_12px_rgba(245,158,11,0.15)]">
                  <Flame className="w-4 h-4 fill-amber-400" />
                  <span className="font-bold text-sm tabular-nums">{habit.streak}</span>
                  <span className="text-[10px] text-amber-300/80">streak</span>
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Delete this habit ritual?')) {
                      onDeleteHabit(habit.id);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 transition-opacity cursor-pointer"
                  title="Delete Habit"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
