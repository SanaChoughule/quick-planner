import React, { useState, useEffect, useRef } from 'react';
import { Task, TimeBlock, CategoryId, PriorityId, QuadrantId } from '../types/planner';
import { CATEGORIES, PRIORITIES, QUADRANTS } from '../utils/constants';
import { parseQuickInput } from '../utils/parser';
import { formatDate } from '../utils/storage';
import { X, Sparkles, Clock, Calendar, CheckSquare, Plus, ArrowRight } from 'lucide-react';
import { sound } from '../utils/audio';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Task, autoScheduleBlock?: boolean) => void;
  initialDate?: string;
  initialTime?: string;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
  initialDate,
  initialTime,
}) => {
  const [mode, setMode] = useState<'smart' | 'structured'>('smart');
  const [smartInput, setSmartInput] = useState('');
  
  // Structured form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CategoryId>('deep_work');
  const [priority, setPriority] = useState<PriorityId>('p2_high');
  const [quadrant, setQuadrant] = useState<QuadrantId>('schedule');
  const [duration, setDuration] = useState<number>(45);
  const [dueDate, setDueDate] = useState<string>(initialDate || formatDate());
  const [dueTime, setDueTime] = useState<string>(initialTime || '10:00');
  const [shouldSchedule, setShouldSchedule] = useState<boolean>(true);
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      if (initialTime) setDueTime(initialTime);
      if (initialDate) setDueDate(initialDate);
    } else {
      setSmartInput('');
      setTitle('');
      setDescription('');
      setSubtasks([]);
    }
  }, [isOpen, initialDate, initialTime]);

  if (!isOpen) return null;

  // Live parsed result for smart mode
  const parsed = parseQuickInput(smartInput || 'Deep Work Session');

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([...subtasks, { id: `st-${Date.now()}`, title: newSubtaskTitle.trim(), completed: false }]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    sound.playStartBlip();

    let taskTitle = '';
    let taskCat = category;
    let taskPrio = priority;
    let taskQuad = quadrant;
    let taskMins = duration;
    let taskTime = dueTime;
    let taskTags: string[] = [];

    if (mode === 'smart') {
      if (!smartInput.trim()) return;
      const res = parseQuickInput(smartInput);
      taskTitle = res.cleanTitle;
      taskCat = res.category;
      taskPrio = res.priority;
      taskQuad = res.quadrant;
      taskMins = res.estimatedMinutes;
      taskTime = res.dueTime || dueTime;
      taskTags = res.tags;
    } else {
      if (!title.trim()) return;
      taskTitle = title.trim();
      taskTags = [taskCat];
    }

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: taskTitle,
      description: description.trim() || undefined,
      category: taskCat,
      priority: taskPrio,
      quadrant: taskQuad,
      status: 'todo',
      estimatedMinutes: taskMins,
      completedMinutes: 0,
      dueDate: dueDate || formatDate(),
      dueTime: taskTime,
      subtasks: subtasks,
      tags: taskTags,
      createdAt: formatDate(),
    };

    onAddTask(newTask, shouldSchedule);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-[#0c101c] border border-cyan-500/30 rounded-2xl p-6 shadow-[0_0_40px_rgba(0,240,255,0.15)] relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative neon flare */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white font-display tracking-wide">
                Quick Capture Command
              </h2>
              <p className="text-xs text-slate-400">
                Log tasks and slot time directly into your schedule
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode switch */}
            <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setMode('smart')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  mode === 'smart'
                    ? 'bg-cyan-500/20 text-cyan-300 font-medium border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Smart NLP
              </button>
              <button
                type="button"
                onClick={() => setMode('structured')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  mode === 'structured'
                    ? 'bg-cyan-500/20 text-cyan-300 font-medium border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Structured
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Smart Mode */}
        {mode === 'smart' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Type natural command (syntax: <code className="text-cyan-400 font-mono">at 14:00</code>, <code className="text-cyan-400 font-mono">for 45m</code>, <code className="text-cyan-400 font-mono">#deep_work</code>, <code className="text-cyan-400 font-mono">!p1</code>):
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={smartInput}
                  onChange={(e) => setSmartInput(e.target.value)}
                  placeholder="e.g. Benchmark distributed vector cache at 14:30 for 60m #strategy !p1"
                  className="w-full bg-[#111728] border border-cyan-500/30 focus:border-cyan-400 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 transition-all font-sans"
                />
              </div>
            </div>

            {/* Live Parsing Preview Card */}
            {smartInput.trim() && (
              <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs space-y-2">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Live Parsed Attributes
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-white">
                    {parsed.cleanTitle}
                  </span>
                  <span className="text-slate-500">·</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${CATEGORIES[parsed.category].bgSubtle} ${CATEGORIES[parsed.category].textBadge} border ${CATEGORIES[parsed.category].neonBorder}`}>
                    {CATEGORIES[parsed.category].label}
                  </span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-300 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    {parsed.estimatedMinutes}m
                  </span>
                  {parsed.dueTime && (
                    <>
                      <span className="text-slate-500">·</span>
                      <span className="text-cyan-300 font-mono font-medium">
                        @{parsed.dueTime}
                      </span>
                    </>
                  )}
                  <span className="text-slate-500">·</span>
                  <span className={`font-mono ${PRIORITIES[parsed.priority].color}`}>
                    {PRIORITIES[parsed.priority].short}
                  </span>
                </div>
              </div>
            )}

            {/* Auto schedule toggle */}
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={shouldSchedule}
                  onChange={(e) => setShouldSchedule(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-cyan-400 focus:ring-cyan-400/40"
                />
                <span>Also place as scheduled block on Timeline calendar</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!smartInput.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-black bg-[#00f0ff] hover:bg-[#3bf8ff] disabled:opacity-40 disabled:pointer-events-none rounded-lg shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all cursor-pointer font-sans"
                >
                  <span>Capture Task</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Structured Mode */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Task Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Conduct RFC review for distributed cache"
                className="w-full bg-[#111728] border border-slate-700 focus:border-cyan-400 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CategoryId)}
                  className="w-full bg-[#111728] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
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
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as PriorityId)}
                  className="w-full bg-[#111728] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  {Object.entries(PRIORITIES).map(([id, p]) => (
                    <option key={id} value={id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Duration (mins)
                </label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  max="480"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 30)}
                  className="w-full bg-[#111728] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-[#111728] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Target Time
                </label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full bg-[#111728] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Eisenhower Quadrant
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(QUADRANTS).map(([id, q]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setQuadrant(id as QuadrantId)}
                    className={`p-2 text-left rounded-lg border transition-all cursor-pointer ${
                      quadrant === id
                        ? 'bg-cyan-950/40 border-cyan-400 text-white shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-semibold text-[11px] text-cyan-300">{q.badge} · {q.title}</div>
                    <div className="text-[10px] text-slate-400 truncate">{q.action}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Subtasks */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Subtasks / Checklist ({subtasks.length})
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                  placeholder="Add a concrete subtask..."
                  className="flex-1 bg-[#111728] border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {subtasks.length > 0 && (
                <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                  {subtasks.map((st) => (
                    <div key={st.id} className="flex items-center justify-between text-xs bg-slate-900/70 px-2.5 py-1 rounded border border-slate-800">
                      <span className="text-slate-300 truncate">{st.title}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubtask(st.id)}
                        className="text-slate-500 hover:text-rose-400 p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={shouldSchedule}
                  onChange={(e) => setShouldSchedule(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-cyan-400"
                />
                <span>Schedule on Timeline at {dueTime}</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!title.trim()}
                  className="px-4 py-2 text-xs font-semibold text-black bg-[#00f0ff] hover:bg-[#3bf8ff] disabled:opacity-40 disabled:pointer-events-none rounded-lg shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all cursor-pointer font-sans"
                >
                  Save Task
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
