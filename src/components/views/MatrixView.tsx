import React, { useState, useMemo } from 'react';
import { Task, CategoryId, PriorityId, QuadrantId, TaskStatus } from '../../types/planner';
import { CATEGORIES, PRIORITIES, QUADRANTS } from '../../utils/constants';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Search, 
  Filter, 
  Plus, 
  Play, 
  ArrowRight,
  ListFilter,
  Kanban,
  LayoutGrid,
  CheckSquare
} from 'lucide-react';
import { sound } from '../../utils/audio';

interface MatrixViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
  onStartFocus: (task: Task) => void;
  onOpenQuickAdd: () => void;
}

export const MatrixView: React.FC<MatrixViewProps> = ({
  tasks,
  onSelectTask,
  onUpdateTask,
  onStartFocus,
  onOpenQuickAdd,
}) => {
  const [subView, setSubView] = useState<'matrix' | 'kanban' | 'list'>('matrix');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchCat = selectedCategory === 'all' || t.category === selectedCategory;
      const matchPrio = selectedPriority === 'all' || t.priority === selectedPriority;
      return matchSearch && matchCat && matchPrio;
    });
  }, [tasks, searchQuery, selectedCategory, selectedPriority]);

  const handleToggleTaskStatus = (task: Task) => {
    const isNowCompleted = task.status !== 'completed';
    if (isNowCompleted) {
      sound.playCompletionChime();
    }
    onUpdateTask({
      ...task,
      status: isNowCompleted ? 'completed' : 'todo',
      completedAt: isNowCompleted ? new Date().toISOString() : undefined,
    });
  };

  const handleMoveQuadrant = (task: Task, newQuad: QuadrantId) => {
    sound.playStartBlip();
    onUpdateTask({ ...task, quadrant: newQuad });
  };

  const handleMoveStatus = (task: Task, newStatus: TaskStatus) => {
    sound.playStartBlip();
    onUpdateTask({
      ...task,
      status: newStatus,
      completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Search, Filters, and Subview Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0c101c]/90 border border-slate-800/80 rounded-2xl p-4 lg:p-5 backdrop-blur-md">
        {/* Left: View Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setSubView('matrix')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              subView === 'matrix'
                ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Eisenhower Matrix</span>
          </button>

          <button
            onClick={() => setSubView('kanban')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              subView === 'kanban'
                ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Kanban Sprint</span>
          </button>

          <button
            onClick={() => setSubView('list')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              subView === 'list'
                ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Compact Table</span>
          </button>
        </div>

        {/* Right: Search & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter tasks or tags..."
              className="w-full bg-[#111728] border border-slate-800 focus:border-cyan-400 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#111728] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {Object.values(CATEGORIES).map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>

          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-black bg-[#00f0ff] hover:bg-[#38f8ff] rounded-xl shadow-[0_0_12px_rgba(0,240,255,0.3)] transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: EISENHOWER 4-QUADRANT MATRIX */}
      {subView === 'matrix' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {(['do_first', 'schedule', 'delegate', 'eliminate'] as QuadrantId[]).map((qId) => {
            const quad = QUADRANTS[qId];
            const quadTasks = filteredTasks.filter((t) => t.quadrant === qId);

            return (
              <div
                key={qId}
                className={`bg-[#0c101c] border ${quad.border} rounded-2xl p-5 transition-all flex flex-col justify-between min-h-[340px]`}
              >
                <div>
                  {/* Quadrant Header */}
                  <div className="flex items-start justify-between pb-3 border-b border-slate-800/80 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-bold">
                          {quad.badge}
                        </span>
                        <h3 className="text-sm font-bold text-white font-display">
                          {quad.title}
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {quad.subtitle}
                      </p>
                    </div>
                    <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                      {quadTasks.length}
                    </span>
                  </div>

                  {/* Tasks List in this Quadrant */}
                  <div className="space-y-2.5">
                    {quadTasks.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-500">
                        No tasks in this quadrant.
                      </div>
                    ) : (
                      quadTasks.map((task) => {
                        const cat = CATEGORIES[task.category];
                        const prio = PRIORITIES[task.priority];
                        const completedSubtasks = task.subtasks.filter((s) => s.completed).length;

                        return (
                          <div
                            key={task.id}
                            onClick={() => onSelectTask(task)}
                            className={`p-3 rounded-xl bg-[#111728]/70 border border-slate-800/80 hover:border-cyan-500/40 hover:bg-[#131b30] transition-all cursor-pointer group select-none ${
                              task.status === 'completed' ? 'opacity-60 saturate-50' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleTaskStatus(task);
                                  }}
                                  className="text-slate-400 hover:text-cyan-400 pt-0.5 cursor-pointer"
                                >
                                  {task.status === 'completed' ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                  ) : (
                                    <Circle className="w-4 h-4" />
                                  )}
                                </button>
                                <div className="flex-1 min-w-0">
                                  <h4 className={`text-xs font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors truncate ${task.status === 'completed' ? 'line-through text-slate-500' : ''}`}>
                                    {task.title}
                                  </h4>
                                  <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] font-mono text-slate-400">
                                    <span className={cat.textBadge}>{cat.label}</span>
                                    <span className="text-slate-600">·</span>
                                    <span className={prio.color}>{prio.short}</span>
                                    <span className="text-slate-600">·</span>
                                    <span className="text-slate-300 flex items-center gap-0.5">
                                      <Clock className="w-2.5 h-2.5" /> {task.estimatedMinutes}m
                                    </span>
                                    {task.subtasks.length > 0 && (
                                      <>
                                        <span className="text-slate-600">·</span>
                                        <span className="text-cyan-400">
                                          {completedSubtasks}/{task.subtasks.length} subtasks
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onStartFocus(task);
                                  }}
                                  className="p-1 text-cyan-400 hover:bg-cyan-950/60 rounded"
                                  title="Launch Focus Session"
                                >
                                  <Play className="w-3 h-3 fill-cyan-400" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800/60 text-[11px] font-mono text-slate-500 flex items-center justify-between">
                  <span>Strategy: {quad.action}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: KANBAN SPRINT BOARD */}
      {subView === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {(['todo', 'in_progress', 'completed'] as TaskStatus[]).map((status) => {
            const statusConfig = {
              todo: { label: 'Backlog & Ready', color: 'text-slate-300', border: 'border-slate-800', glow: '' },
              in_progress: { label: 'In Progress (Active Sprint)', color: 'text-cyan-400', border: 'border-cyan-500/30', glow: 'shadow-[0_0_20px_-5px_rgba(0,240,255,0.1)]' },
              completed: { label: 'Completed Deliverables', color: 'text-emerald-400', border: 'border-emerald-500/30', glow: 'shadow-[0_0_20px_-5px_rgba(0,245,155,0.1)]' },
            }[status];

            const columnTasks = filteredTasks.filter((t) => t.status === status);

            return (
              <div
                key={status}
                className={`bg-[#0c101c] border ${statusConfig.border} rounded-2xl p-4 flex flex-col justify-between min-h-[500px]`}
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                    <h3 className={`text-xs font-bold uppercase tracking-wider font-mono ${statusConfig.color}`}>
                      {statusConfig.label}
                    </h3>
                    <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                      {columnTasks.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {columnTasks.length === 0 ? (
                      <div className="py-12 text-center text-xs text-slate-500">
                        No tasks in this column.
                      </div>
                    ) : (
                      columnTasks.map((task) => {
                        const cat = CATEGORIES[task.category];
                        const prio = PRIORITIES[task.priority];

                        return (
                          <div
                            key={task.id}
                            onClick={() => onSelectTask(task)}
                            className="p-3.5 rounded-xl bg-[#111728]/80 border border-slate-800/80 hover:border-cyan-500/50 hover:bg-[#131b30] transition-all cursor-pointer group shadow-sm select-none"
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium ${cat.bgSubtle} ${cat.textBadge} border ${cat.neonBorder}`}>
                                {cat.label}
                              </span>
                              <span className={`text-[10px] font-mono ${prio.color}`}>
                                {prio.short}
                              </span>
                            </div>

                            <h4 className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors mb-2">
                              {task.title}
                            </h4>

                            {task.description && (
                              <p className="text-[11px] text-slate-400 line-clamp-2 mb-3">
                                {task.description}
                              </p>
                            )}

                            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px] font-mono text-slate-400">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-cyan-400" />
                                {task.estimatedMinutes}m
                              </span>

                              <div className="flex items-center gap-1.5">
                                {status === 'todo' && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMoveStatus(task, 'in_progress');
                                    }}
                                    className="px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 hover:bg-cyan-900 border border-cyan-500/30 text-[10px]"
                                  >
                                    Start →
                                  </button>
                                )}
                                {status === 'in_progress' && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMoveStatus(task, 'completed');
                                    }}
                                    className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 hover:bg-emerald-900 border border-emerald-500/30 text-[10px]"
                                  >
                                    Finish ✓
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 3: COMPACT DATA TABLE */}
      {subView === 'list' && (
        <div className="bg-[#0c101c] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase font-mono tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 w-10">Done</th>
                  <th className="py-3 px-4">Task Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Quadrant</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4 text-right">Duration</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No matching tasks found.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => {
                    const cat = CATEGORIES[task.category];
                    const prio = PRIORITIES[task.priority];
                    const quad = QUADRANTS[task.quadrant];

                    return (
                      <tr
                        key={task.id}
                        onClick={() => onSelectTask(task)}
                        className="hover:bg-[#111728] transition-colors cursor-pointer group"
                      >
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleToggleTaskStatus(task)}
                            className="text-slate-400 hover:text-cyan-400 cursor-pointer"
                          >
                            {task.status === 'completed' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-semibold text-white group-hover:text-cyan-300 transition-colors ${task.status === 'completed' ? 'line-through text-slate-500' : ''}`}>
                            {task.title}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${cat.bgSubtle} ${cat.textBadge} border ${cat.neonBorder}`}>
                            {cat.label}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-slate-400">
                            {quad.badge} · {quad.title}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-mono ${prio.color}`}>{prio.short}</span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-300 tabular-nums">
                          {task.estimatedMinutes}m
                        </td>
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onStartFocus(task)}
                            className="p-1.5 text-cyan-400 hover:bg-cyan-950/60 rounded cursor-pointer"
                            title="Launch Focus Session"
                          >
                            <Play className="w-3.5 h-3.5 fill-cyan-400" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
