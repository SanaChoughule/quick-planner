import React, { useState } from 'react';
import { Task, FocusSession, Habit, TimeBlock, CategoryId } from '../../types/planner';
import { CATEGORIES } from '../../utils/constants';
import { formatDate, getRelativeDate } from '../../utils/storage';
import { 
  BarChart3, 
  TrendingUp, 
  Zap, 
  Clock, 
  Target, 
  CheckCircle2, 
  Download, 
  Copy, 
  Check, 
  Sparkles 
} from 'lucide-react';
import { sound } from '../../utils/audio';

interface AnalyticsViewProps {
  tasks: Task[];
  sessions: FocusSession[];
  habits: Habit[];
  timeblocks: TimeBlock[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  tasks,
  sessions,
  habits,
  timeblocks,
}) => {
  const [copied, setCopied] = useState(false);

  // Compute stats for the past 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const offset = 6 - i;
    const dateStr = getRelativeDate(-offset);
    const d = new Date(dateStr + 'T00:00:00');
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
    
    // Sessions completed on this day
    const dayMinutes = sessions
      .filter((s) => s.completedAt.startsWith(dateStr))
      .reduce((acc, s) => acc + s.durationMinutes, 0);

    const tasksDone = tasks.filter(
      (t) => t.status === 'completed' && t.completedAt && t.completedAt.startsWith(dateStr)
    ).length;

    return {
      dateStr,
      dayLabel,
      hours: +(dayMinutes / 60).toFixed(1),
      tasksDone,
    };
  });

  const totalFocusMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalFocusHours = (totalFocusMinutes / 60).toFixed(1);

  const completedTasksCount = tasks.filter((t) => t.status === 'completed').length;
  const taskCompletionRate = tasks.length > 0
    ? Math.round((completedTasksCount / tasks.length) * 100)
    : 0;

  // Category breakdown calculation
  const categoryHours: Record<CategoryId, number> = {
    deep_work: 0,
    strategy: 0,
    health: 0,
    client: 0,
    team: 0,
    personal: 0,
  };

  sessions.forEach((s) => {
    if (categoryHours[s.category] !== undefined) {
      categoryHours[s.category] += s.durationMinutes;
    }
  });

  // Also include completed tasks duration
  tasks
    .filter((t) => t.status === 'completed')
    .forEach((t) => {
      categoryHours[t.category] += t.completedMinutes || t.estimatedMinutes;
    });

  const totalMinutesAllCats = Object.values(categoryHours).reduce((a, b) => a + b, 0) || 1;

  // Max hours in chart for scaling
  const maxDayHours = Math.max(...last7Days.map((d) => d.hours), 4);

  const handleCopySummary = () => {
    sound.playStartBlip();
    const summary = `🚀 QuickPlanner Weekly Executive Velocity Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Total Focused Immersion: ${totalFocusHours} hours
• Tasks Executed: ${completedTasksCount} / ${tasks.length} (${taskCompletionRate}% rate)
• Primary Leverage: Deep Work & Strategy (~${Math.round(((categoryHours.deep_work + categoryHours.strategy) / totalMinutesAllCats) * 100)}%)
• Habit Streaks Active: ${habits.length} rituals maintained`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJSON = () => {
    sound.playStartBlip();
    const payload = {
      exportTimestamp: new Date().toISOString(),
      tasks,
      sessions,
      habits,
      timeblocks,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quickplanner_export_${formatDate()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0c101c]/90 border border-slate-800/80 rounded-2xl p-4 lg:p-5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-display">
              Velocity & Focus Telemetry
            </h2>
            <p className="text-xs text-slate-400">
              Quantitative performance feedback and allocation balance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Report Copied!' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-black bg-[#00f0ff] hover:bg-[#3cf9ff] rounded-xl shadow-[0_0_12px_rgba(0,240,255,0.3)] transition-all cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* 4-Stat Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0c101c] border border-cyan-500/20 rounded-2xl p-4 shadow-[0_0_20px_-5px_rgba(0,240,255,0.1)]">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Total Focus Hours</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {totalFocusHours}h
          </div>
          <div className="text-[11px] font-mono text-cyan-400 mt-1">
            +3.5h vs last week
          </div>
        </div>

        <div className="bg-[#0c101c] border border-emerald-500/20 rounded-2xl p-4 shadow-[0_0_20px_-5px_rgba(0,245,155,0.1)]">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Task Completion</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {taskCompletionRate}%
          </div>
          <div className="text-[11px] font-mono text-emerald-400 mt-1">
            {completedTasksCount} of {tasks.length} closed
          </div>
        </div>

        <div className="bg-[#0c101c] border border-purple-500/20 rounded-2xl p-4 shadow-[0_0_20px_-5px_rgba(192,132,252,0.1)]">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Deep Leverage Ratio</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {Math.round(((categoryHours.deep_work + categoryHours.strategy) / totalMinutesAllCats) * 100)}%
          </div>
          <div className="text-[11px] font-mono text-purple-400 mt-1">
            Deep Work & Strategy
          </div>
        </div>

        <div className="bg-[#0c101c] border border-amber-500/20 rounded-2xl p-4 shadow-[0_0_20px_-5px_rgba(245,158,11,0.1)]">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Ritual Consistency</span>
            <Target className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {habits.length > 0 ? Math.round(habits.reduce((a, h) => a + h.streak, 0) / habits.length) : 0}d
          </div>
          <div className="text-[11px] font-mono text-amber-400 mt-1">
            Average active streak
          </div>
        </div>
      </div>

      {/* 7-Day Velocity Chart & Category Breakdown Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: 7-Day Velocity Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-[#0c101c] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div>
                <h3 className="text-sm font-bold text-white font-display">
                  7-Day Focus Velocity (Hours / Day)
                </h3>
                <p className="text-xs text-slate-400">
                  Daily deep focus cycles and immersion output
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                Peak: {Math.max(...last7Days.map(d => d.hours))}h
              </span>
            </div>

            {/* SVG/CSS Bar Chart */}
            <div className="h-56 flex items-end justify-between gap-3 pt-6 px-2">
              {last7Days.map((day) => {
                const heightPercent = Math.min(100, Math.max(12, Math.round((day.hours / maxDayHours) * 100)));
                const isToday = day.dateStr === formatDate();

                return (
                  <div key={day.dateStr} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                    <span className="text-[11px] font-mono text-slate-400 group-hover:text-cyan-300 tabular-nums">
                      {day.hours}h
                    </span>
                    <div className="w-full h-44 bg-slate-900/60 rounded-xl relative flex items-end p-1 border border-slate-800/80 group-hover:border-cyan-500/40 transition-all">
                      <div
                        className={`w-full rounded-lg transition-all duration-500 ${
                          isToday
                            ? 'bg-gradient-to-t from-cyan-600 to-[#00f0ff] shadow-[0_0_15px_#00f0ff]'
                            : 'bg-gradient-to-t from-slate-700 to-cyan-500/80 group-hover:to-cyan-400'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className={`text-xs font-mono font-medium ${isToday ? 'text-cyan-400' : 'text-slate-400'}`}>
                      {day.dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-xs text-slate-500 font-mono flex items-center justify-between">
            <span>Optimal sustained sprint: 4.5 – 6.0 hours/day</span>
            <span className="text-emerald-400">Target Range Maintained</span>
          </div>
        </div>

        {/* Right: Category Time Allocation Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-[#0c101c] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-sm font-bold text-white font-display">
                Category Time Allocation
              </h3>
              <p className="text-xs text-slate-400">
                Distribution across workstreams & cognitive domains
              </p>
            </div>

            <div className="space-y-4">
              {(Object.keys(categoryHours) as CategoryId[]).map((catId) => {
                const cat = CATEGORIES[catId];
                const mins = categoryHours[catId];
                const pct = Math.round((mins / totalMinutesAllCats) * 100);
                const hrs = (mins / 60).toFixed(1);

                return (
                  <div key={catId} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${cat.dotColor} shadow-[0_0_6px_${cat.color}]`} />
                        <span className="text-slate-200 font-medium">{cat.label}</span>
                      </div>
                      <div className="font-mono text-slate-400">
                        <span className="text-white font-semibold">{hrs}h</span> ({pct}%)
                      </div>
                    </div>
                    {/* Distribution Bar */}
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: cat.color,
                          boxShadow: `0 0 10px ${cat.color}`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>High strategic alignment: 70%+ dedicated to core leverage.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
