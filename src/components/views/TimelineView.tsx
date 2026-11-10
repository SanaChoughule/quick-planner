import React, { useState } from 'react';
import { Task, TimeBlock, CategoryId } from '../../types/planner';
import { CATEGORIES } from '../../utils/constants';
import { formatDate } from '../../utils/storage';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  Circle,
  Zap,
  Layers
} from 'lucide-react';
import { sound } from '../../utils/audio';

interface TimelineViewProps {
  tasks: Task[];
  timeblocks: TimeBlock[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onSelectTask: (task: Task, block?: TimeBlock) => void;
  onToggleBlockComplete: (blockId: string) => void;
  onOpenQuickAddWithTime: (date: string, time: string) => void;
  onAutoScheduleGaps: (date: string) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  tasks,
  timeblocks,
  selectedDate,
  onSelectDate,
  onSelectTask,
  onToggleBlockComplete,
  onOpenQuickAddWithTime,
  onAutoScheduleGaps,
}) => {
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  // Generate 7-day strip centered around selectedDate
  const baseDate = new Date(selectedDate);
  const dayOfWeek = baseDate.getDay(); // 0 is Sun
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + mondayOffset + i);
    const dateStr = formatDate(d);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNumber = d.getDate();
    const isToday = dateStr === formatDate();
    const isSelected = dateStr === selectedDate;
    const blocksCount = timeblocks.filter((b) => b.date === dateStr).length;
    return { dateStr, dayName, dayNumber, isToday, isSelected, blocksCount };
  });

  // Hours: 07:00 to 22:00
  const hours = Array.from({ length: 16 }, (_, i) => i + 7);

  // Time conversion helper: "09:30" -> minutes from 07:00
  const timeToMinutesFromStart = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return (h - 7) * 60 + m;
  };

  const dayBlocks = timeblocks.filter((b) => b.date === selectedDate);
  
  // Calculate day metrics
  const totalScheduledMinutes = dayBlocks.reduce((acc, b) => {
    const start = timeToMinutesFromStart(b.startTime);
    const end = timeToMinutesFromStart(b.endTime);
    return acc + Math.max(0, end - start);
  }, 0);

  const deepWorkMinutes = dayBlocks
    .filter((b) => b.category === 'deep_work')
    .reduce((acc, b) => {
      const start = timeToMinutesFromStart(b.startTime);
      const end = timeToMinutesFromStart(b.endTime);
      return acc + Math.max(0, end - start);
    }, 0);

  const completedBlocksCount = dayBlocks.filter((b) => b.isCompleted).length;

  // Current time marker calculation
  const now = new Date();
  const nowMinutesFromStart = (now.getHours() - 7) * 60 + now.getMinutes();
  const isCurrentDate = selectedDate === formatDate();
  const showNowLine = isCurrentDate && nowMinutesFromStart >= 0 && nowMinutesFromStart <= 16 * 60;

  const navigateDay = (offset: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    onSelectDate(formatDate(d));
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Metrics Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0c101c]/90 border border-slate-800/80 rounded-2xl p-4 lg:p-5 backdrop-blur-md">
        {/* Date Navigator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => navigateDay(-1)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSelectDate(formatDate())}
              className="px-3 py-1 text-xs font-semibold text-slate-300 hover:text-cyan-400 rounded-lg transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={() => navigateDay(1)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white font-display">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              {isCurrentDate && (
                <span className="text-[10px] font-mono font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
                  Active Today
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400">
              {dayBlocks.length} planned blocks · {completedBlocksCount} completed
            </div>
          </div>
        </div>

        {/* Quick Day Metrics */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-xl">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">Scheduled:</span>
            <span className="text-white font-semibold tabular-nums">
              {(totalScheduledMinutes / 60).toFixed(1)}h
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-xl">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">Deep Work:</span>
            <span className="text-cyan-300 font-semibold tabular-nums">
              {(deepWorkMinutes / 60).toFixed(1)}h
            </span>
          </div>

          <button
            onClick={() => onAutoScheduleGaps(selectedDate)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 hover:border-cyan-400 rounded-xl transition-all shadow-[0_0_12px_rgba(0,240,255,0.15)] cursor-pointer"
            title="Auto-pack unscheduled high-priority tasks into open daylight blocks"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Auto-Schedule Gaps</span>
          </button>
        </div>
      </div>

      {/* Week Calendar Strip */}
      <div className="grid grid-cols-7 gap-2 bg-[#0c101c]/50 p-2 rounded-2xl border border-slate-800/80">
        {weekDays.map((wd) => (
          <button
            key={wd.dateStr}
            onClick={() => onSelectDate(wd.dateStr)}
            className={`p-2.5 rounded-xl text-center transition-all cursor-pointer relative ${
              wd.isSelected
                ? 'bg-[#11182c] border border-cyan-500/50 shadow-[0_0_18px_rgba(0,240,255,0.2)] text-white'
                : 'hover:bg-slate-900/60 border border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="text-[11px] font-medium tracking-wide uppercase font-mono">
              {wd.dayName}
            </div>
            <div className={`text-base font-bold font-display mt-0.5 ${wd.isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
              {wd.dayNumber}
            </div>
            <div className="flex items-center justify-center gap-1 mt-1">
              {wd.blocksCount > 0 ? (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_5px_#00f0ff]" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-transparent" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Timeline Schedule Canvas */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-4 lg:p-6 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-mono uppercase tracking-wider text-[11px] text-slate-500">
              07:00 — 22:00 Timeline Matrix
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-cyan-400/80 shadow-[0_0_6px_#00f0ff]" />
              Deep Work
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-purple-400/80 shadow-[0_0_6px_#c084fc]" />
              Strategy
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-400/80 shadow-[0_0_6px_#00f59b]" />
              Health
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-400/80 shadow-[0_0_6px_#f59e0b]" />
              Client
            </span>
          </div>
        </div>

        {/* The hourly grid */}
        <div className="relative min-h-[960px] select-none">
          {/* Hour row lines */}
          {hours.map((hour, idx) => {
            const timeString = `${String(hour).padStart(2, '0')}:00`;
            const topPx = idx * 60; // 60px per hour
            return (
              <div
                key={hour}
                className="absolute left-0 right-0 border-t border-slate-800/60 flex items-start group hover:border-slate-700/80 transition-colors"
                style={{ top: `${topPx}px`, height: '60px' }}
                onClick={() => onOpenQuickAddWithTime(selectedDate, timeString)}
              >
                {/* Time label */}
                <div className="w-16 shrink-0 -mt-2.5 pr-3 text-right font-mono text-xs text-slate-500 group-hover:text-cyan-400 transition-colors">
                  {timeString}
                </div>
                
                {/* Half hour dotted guide */}
                <div className="flex-1 h-full relative cursor-pointer">
                  <div className="absolute top-[30px] left-0 right-0 border-t border-dashed border-slate-800/30" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-end pr-4 text-[11px] text-cyan-400/80 font-mono transition-opacity">
                    <span className="flex items-center gap-1 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                      <Plus className="w-3 h-3" /> Quick Add @ {timeString}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Current Time Red Glowing Line */}
          {showNowLine && (
            <div
              className="absolute left-14 right-0 z-20 pointer-events-none flex items-center"
              style={{ top: `${nowMinutesFromStart}px` }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_10px_#f43f5e] -ml-1.5" />
              <div className="flex-1 h-[2px] bg-rose-500/80 shadow-[0_0_8px_#f43f5e]" />
              <span className="text-[10px] font-mono text-rose-400 bg-rose-950 px-1.5 py-0.5 rounded border border-rose-500/40 ml-2">
                NOW {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}

          {/* Render Scheduled Blocks */}
          <div className="absolute left-16 right-0 top-0 bottom-0 pointer-events-none">
            {dayBlocks.map((block) => {
              const startMinutes = timeToMinutesFromStart(block.startTime);
              const endMinutes = timeToMinutesFromStart(block.endTime);
              const durationMinutes = Math.max(25, endMinutes - startMinutes);
              const topPx = startMinutes;
              const heightPx = durationMinutes;

              const cat = CATEGORIES[block.category];
              const linkedTask = block.taskId
                ? tasks.find((t) => t.id === block.taskId)
                : null;

              return (
                <div
                  key={block.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (linkedTask) {
                      onSelectTask(linkedTask, block);
                    } else {
                      // Fake a transient task wrapper for viewing
                      onSelectTask({
                        id: `task-from-block-${block.id}`,
                        title: block.title,
                        description: block.notes,
                        category: block.category,
                        priority: 'p2_high',
                        quadrant: 'schedule',
                        status: block.isCompleted ? 'completed' : 'todo',
                        estimatedMinutes: durationMinutes,
                        completedMinutes: block.isCompleted ? durationMinutes : 0,
                        dueDate: block.date,
                        dueTime: block.startTime,
                        subtasks: [],
                        tags: [],
                        createdAt: block.date,
                      }, block);
                    }
                  }}
                  className={`absolute left-2 right-4 rounded-xl p-3 pointer-events-auto border transition-all cursor-pointer select-none group ${
                    cat.bgSubtle
                  } ${cat.neonBorder} ${cat.neonGlow} ${
                    block.isCompleted ? 'opacity-70 saturate-50' : 'hover:scale-[1.005]'
                  }`}
                  style={{
                    top: `${topPx}px`,
                    height: `${heightPx}px`,
                    zIndex: 10,
                  }}
                >
                  <div className="flex items-start justify-between gap-2 h-full overflow-hidden">
                    <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                      <div>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-300 mb-0.5">
                          <span className="font-semibold text-white">
                            {block.startTime} – {block.endTime}
                          </span>
                          <span className="text-slate-500">·</span>
                          <span className={cat.textBadge}>{cat.label}</span>
                          <span className="text-slate-500">·</span>
                          <span className="text-slate-400 font-mono">{durationMinutes}m</span>
                        </div>
                        <h4 className={`text-xs font-semibold text-white truncate font-sans ${block.isCompleted ? 'line-through text-slate-400' : ''}`}>
                          {block.title}
                        </h4>
                      </div>

                      {block.notes && heightPx >= 75 && (
                        <p className="text-[11px] text-slate-300 line-clamp-1 opacity-80 mt-1">
                          {block.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playCompletionChime();
                          onToggleBlockComplete(block.id);
                        }}
                        className="text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer p-1"
                        title={block.isCompleted ? 'Mark Incomplete' : 'Mark Completed'}
                      >
                        {block.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5 hover:text-cyan-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
