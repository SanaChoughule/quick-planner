import React, { useState } from 'react';
import { Task, TimeBlock, CategoryId, PriorityId, QuadrantId } from '../types/planner';
import { CATEGORIES, PRIORITIES, QUADRANTS } from '../utils/constants';
import { X, Play, CheckCircle2, Circle, Trash2, Clock, Calendar, CheckSquare, Plus } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';

interface TaskDetailModalProps {
  task: Task | null;
  timeBlock?: TimeBlock | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (updated: Task) => void;
  onDeleteTask: (id: string) => void;
  onStartFocus: (task: Task) => void;
  onDeleteTimeBlock?: (blockId: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  timeBlock,
  isOpen,
  onClose,
  onUpdateTask,
  onDeleteTask,
  onStartFocus,
  onDeleteTimeBlock,
}) => {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  if (!isOpen || !task) return null;

  const cat = CATEGORIES[task.category];
  const prio = PRIORITIES[task.priority];
  const completedSubtasksCount = task.subtasks.filter((s) => s.completed).length;
  const subtaskProgress = task.subtasks.length > 0
    ? Math.round((completedSubtasksCount / task.subtasks.length) * 100)
    : 0;

  const handleToggleSubtask = (subtaskId: string) => {
    const updatedSubtasks = task.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    const allDone = updatedSubtasks.length > 0 && updatedSubtasks.every((st) => st.completed);
    
    if (allDone && task.status !== 'completed') {
      sound.playCompletionChime();
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    }

    onUpdateTask({
      ...task,
      subtasks: updatedSubtasks,
      status: allDone ? 'completed' : task.status,
    });
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSt = {
      id: `st-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    onUpdateTask({
      ...task,
      subtasks: [...task.subtasks, newSt],
    });
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (subtaskId: string) => {
    onUpdateTask({
      ...task,
      subtasks: task.subtasks.filter((s) => s.id !== subtaskId),
    });
  };

  const handleToggleCompleted = () => {
    const isNowCompleted = task.status !== 'completed';
    if (isNowCompleted) {
      sound.playCompletionChime();
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    }
    onUpdateTask({
      ...task,
      status: isNowCompleted ? 'completed' : 'todo',
      completedAt: isNowCompleted ? new Date().toISOString() : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-[#0c101c] border border-slate-800 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleCompleted}
              className="text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
            >
              {task.status === 'completed' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              ) : (
                <Circle className="w-6 h-6 hover:text-cyan-400" />
              )}
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs mb-1">
                <span className={`px-2 py-0.5 rounded font-mono text-[11px] font-medium ${cat.bgSubtle} ${cat.textBadge} border ${cat.neonBorder}`}>
                  {cat.label}
                </span>
                <span className="text-slate-500">·</span>
                <span className={`font-mono text-xs ${prio.color}`}>{prio.label}</span>
                <span className="text-slate-500">·</span>
                <span className="text-xs text-slate-400 font-mono">{QUADRANTS[task.quadrant].badge}</span>
              </div>
              <h2 className={`text-lg font-semibold text-white font-display ${task.status === 'completed' ? 'line-through text-slate-400' : ''}`}>
                {task.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="py-4 space-y-4">
          {task.description && (
            <p className="text-xs text-slate-300 leading-relaxed bg-[#111728]/60 p-3 rounded-xl border border-slate-800">
              {task.description}
            </p>
          )}

          {/* Time & Scheduling info */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-900/40 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-slate-300">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>Due: {task.dueDate} {task.dueTime ? `@ ${task.dueTime}` : ''}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300 font-mono">
              <Clock className="w-4 h-4 text-purple-400" />
              <span>Est: {task.estimatedMinutes}m · Done: {task.completedMinutes}m</span>
            </div>
          </div>

          {/* Subtasks / Checklist */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-medium text-slate-300">
                Checklist ({completedSubtasksCount}/{task.subtasks.length})
              </span>
              <span className="text-[11px] font-mono text-cyan-400">
                {subtaskProgress}% Complete
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-cyan-400 transition-all duration-300 shadow-[0_0_8px_#00f0ff]"
                style={{ width: `${subtaskProgress}%` }}
              />
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {task.subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs"
                >
                  <label className="flex items-center gap-2.5 flex-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => handleToggleSubtask(st.id)}
                      className="rounded bg-slate-800 border-slate-700 text-cyan-400 focus:ring-cyan-400"
                    />
                    <span className={`text-slate-200 ${st.completed ? 'line-through text-slate-500' : ''}`}>
                      {st.title}
                    </span>
                  </label>
                  <button
                    onClick={() => handleRemoveSubtask(st.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add subtask */}
            <div className="flex gap-2 mt-2">
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
                placeholder="Add subtask and hit enter..."
                className="flex-1 bg-[#111728] border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={() => {
              if (confirm('Delete this task?')) {
                onDeleteTask(task.id);
                onClose();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 px-2.5 py-1.5 rounded-lg border border-transparent hover:border-rose-900 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onStartFocus(task);
                onClose();
              }}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-black bg-[#00f0ff] hover:bg-[#3bf8ff] rounded-lg shadow-[0_0_16px_rgba(0,240,255,0.4)] transition-all cursor-pointer font-sans"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>Launch Focus Session</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
