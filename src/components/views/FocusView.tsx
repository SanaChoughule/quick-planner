import React, { useState, useEffect, useRef } from 'react';
import { Task, FocusSession, CategoryId } from '../../types/planner';
import { FOCUS_MODES, CATEGORIES } from '../../utils/constants';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Headphones, 
  ListTodo 
} from 'lucide-react';
import { sound } from '../../utils/audio';
import confetti from 'canvas-confetti';

interface FocusViewProps {
  tasks: Task[];
  activeTask: Task | null;
  onSelectActiveTask: (task: Task | null) => void;
  onSessionComplete: (session: FocusSession) => void;
  completedSessions: FocusSession[];
}

export const FocusView: React.FC<FocusViewProps> = ({
  tasks,
  activeTask,
  onSelectActiveTask,
  onSessionComplete,
  completedSessions,
}) => {
  const [selectedModeIndex, setSelectedModeIndex] = useState(0);
  const currentMode = FOCUS_MODES[selectedModeIndex];

  // Seconds remaining
  const [secondsLeft, setSecondsLeft] = useState(currentMode.minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Ambient sound generator
  const [ambientType, setAmbientType] = useState<'none' | 'binaural' | 'cyber_rain' | 'deep_space'>('none');
  const [ambientVol, setAmbientVol] = useState(0.25);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync mode changes
  const switchMode = (idx: number) => {
    setIsRunning(false);
    setSelectedModeIndex(idx);
    setSecondsLeft(FOCUS_MODES[idx].minutes * 60);
    sound.playStartBlip();
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  // Handle ambient sound effect toggle
  useEffect(() => {
    if (ambientType === 'none') {
      sound.stopAmbient();
    } else {
      sound.startAmbient(ambientType, ambientVol);
    }
    return () => {
      sound.stopAmbient();
    };
  }, [ambientType]);

  const handleTogglePlay = () => {
    sound.playStartBlip();
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(currentMode.minutes * 60);
  };

  const handleComplete = () => {
    setIsRunning(false);
    sound.playCompletionChime();
    confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });

    const newSession: FocusSession = {
      id: `sess-${Date.now()}`,
      taskId: activeTask?.id,
      taskTitle: activeTask ? activeTask.title : 'Deep Focus Sprint',
      category: activeTask ? activeTask.category : 'deep_work',
      durationMinutes: currentMode.minutes,
      mode: currentMode.id as any,
      completedAt: new Date().toISOString(),
    };

    onSessionComplete(newSession);
    setSecondsLeft(currentMode.minutes * 60);
  };

  // Time calculations
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  const totalModeSeconds = currentMode.minutes * 60;
  const progressRatio = (totalModeSeconds - secondsLeft) / totalModeSeconds;
  
  // SVG Radial stroke calculation
  const circleRadius = 130;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference * (1 - progressRatio);

  const todaySessions = completedSessions.filter(
    (s) => new Date(s.completedAt).toDateString() === new Date().toDateString()
  );
  const totalMinutesFocusedToday = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-[#07090e] p-8 overflow-y-auto flex flex-col justify-between' : ''}`}>
      {/* Top Controls / HUD */}
      <div className="flex items-center justify-between bg-[#0c101c]/90 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
          <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
            Midnight Flow Engine
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-xs font-mono text-cyan-400">
            {todaySessions.length} Cycles Completed ({totalMinutesFocusedToday}m)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Focus Mode HUD'}</span>
          </button>
        </div>
      </div>

      {/* Main Focus Console Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Interactive Radial Timer & Sound Controls (7 cols) */}
        <div className="lg:col-span-7 bg-[#0c101c] border border-cyan-500/20 rounded-2xl p-6 lg:p-8 flex flex-col items-center justify-between relative shadow-[0_0_40px_rgba(0,240,255,0.06)] overflow-hidden">
          {/* Subtle neon bloom backdrop */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Mode Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 relative z-10 mb-8 max-w-full">
            {FOCUS_MODES.map((mode, idx) => (
              <button
                key={mode.id}
                onClick={() => switchMode(idx)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  selectedModeIndex === idx
                    ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,240,255,0.25)] font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode.label} ({mode.minutes}m)
              </button>
            ))}
          </div>

          {/* Circular SVG Timer */}
          <div className="relative flex items-center justify-center my-4 z-10">
            <svg className="w-72 h-72 sm:w-80 sm:h-80 -rotate-90 transform">
              {/* Background track */}
              <circle
                cx="50%"
                cy="50%"
                r={circleRadius}
                fill="transparent"
                stroke="rgba(30, 41, 59, 0.4)"
                strokeWidth="10"
              />
              {/* Animated Progress Neon Ring */}
              <circle
                cx="50%"
                cy="50%"
                r={circleRadius}
                fill="transparent"
                stroke="#00f0ff"
                strokeWidth="10"
                strokeDasharray={circleCircumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear shadow-[0_0_20px_#00f0ff]"
                style={{
                  filter: 'drop-shadow(0 0 10px rgba(0, 240, 255, 0.6))',
                }}
              />
            </svg>

            {/* Center Digital Readout */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-5xl sm:text-6xl font-black font-mono tracking-tighter text-white tabular-nums drop-shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                {timeFormatted}
              </span>
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 mt-2 font-medium">
                {currentMode.tag}
              </span>
              {activeTask && (
                <div className="mt-2 text-[11px] font-sans text-slate-300 max-w-[200px] truncate bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                  {activeTask.title}
                </div>
              )}
            </div>
          </div>

          {/* Primary Timer Controls */}
          <div className="flex items-center gap-4 z-10 mt-6">
            <button
              onClick={handleReset}
              className="p-3 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={handleTogglePlay}
              className="flex items-center gap-2.5 px-6 py-3 text-sm font-bold text-black bg-[#00f0ff] hover:bg-[#3cf9ff] active:scale-95 rounded-xl shadow-[0_0_25px_rgba(0,240,255,0.5)] hover:shadow-[0_0_35px_rgba(0,240,255,0.8)] transition-all cursor-pointer font-sans"
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 fill-black" />
                  <span>Pause Immersion</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-black" />
                  <span>Start Immersion</span>
                </>
              )}
            </button>

            <button
              onClick={handleComplete}
              className="p-3 text-slate-400 hover:text-cyan-300 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors cursor-pointer"
              title="Fast Complete Session"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Ambient Soundscapes Engine */}
          <div className="w-full mt-8 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs z-10">
            <div className="flex items-center gap-2 text-slate-400">
              <Headphones className="w-4 h-4 text-cyan-400" />
              <span>Ambient Soundscape:</span>
            </div>

            <div className="flex items-center gap-1.5">
              {[
                { id: 'none', label: 'Muted' },
                { id: 'binaural', label: '40Hz Alpha' },
                { id: 'cyber_rain', label: 'Cyber Rain' },
                { id: 'deep_space', label: 'Deep Cosmic' },
              ].map((snd) => (
                <button
                  key={snd.id}
                  onClick={() => setAmbientType(snd.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                    ambientType === snd.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
                  }`}
                >
                  {snd.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Active Task Tether & Daily Focus History (5 cols) */}
        <div className="lg:col-span-5 space-y-5 flex flex-col">
          {/* Active Task Selector */}
          <div className="bg-[#0c101c] border border-slate-800 rounded-2xl p-5 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                <div className="flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-white">
                    Tethered Task
                  </h3>
                </div>
                {activeTask && (
                  <button
                    onClick={() => onSelectActiveTask(null)}
                    className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    Clear Tether
                  </button>
                )}
              </div>

              {activeTask ? (
                <div className="p-4 rounded-xl bg-[#111728] border border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.1)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${CATEGORIES[activeTask.category].bgSubtle} ${CATEGORIES[activeTask.category].textBadge} border ${CATEGORIES[activeTask.category].neonBorder}`}>
                      {CATEGORIES[activeTask.category].label}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Est {activeTask.estimatedMinutes}m
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-white">
                    {activeTask.title}
                  </h4>

                  {activeTask.description && (
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {activeTask.description}
                    </p>
                  )}

                  {activeTask.subtasks.length > 0 && (
                    <div className="pt-2 border-t border-slate-800 text-xs text-slate-300 space-y-1">
                      <div className="text-[10px] uppercase font-mono text-slate-500">
                        Subtasks ({activeTask.subtasks.filter((s) => s.completed).length}/{activeTask.subtasks.length})
                      </div>
                      {activeTask.subtasks.slice(0, 3).map((st) => (
                        <div key={st.id} className="flex items-center gap-2 text-xs">
                          <CheckCircle2 className={`w-3.5 h-3.5 ${st.completed ? 'text-emerald-400' : 'text-slate-600'}`} />
                          <span className={st.completed ? 'line-through text-slate-500' : 'text-slate-300'}>
                            {st.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl space-y-2">
                  <p className="text-xs text-slate-400">
                    No task currently tethered to this timer.
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Select a priority task below to track minutes automatically.
                  </p>
                </div>
              )}

              {/* Task quick select list */}
              <div className="mt-4">
                <div className="text-[11px] uppercase tracking-wider font-mono text-slate-400 mb-2">
                  Select from Today's Queue:
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {tasks
                    .filter((t) => t.status !== 'completed')
                    .slice(0, 5)
                    .map((t) => (
                      <button
                        key={t.id}
                        onClick={() => onSelectActiveTask(t)}
                        className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between cursor-pointer ${
                          activeTask?.id === t.id
                            ? 'bg-cyan-950/40 border-cyan-500/50 text-white'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                        }`}
                      >
                        <span className="truncate flex-1 pr-2">{t.title}</span>
                        <span className="text-[10px] font-mono text-slate-500 shrink-0">
                          {t.estimatedMinutes}m
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Today's Focus Session Log */}
          <div className="bg-[#0c101c] border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-white">
                Completed Today ({todaySessions.length})
              </h3>
              <span className="text-xs font-mono text-cyan-400">
                {totalMinutesFocusedToday}m logged
              </span>
            </div>

            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {todaySessions.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-500">
                  Ready for your first immersion cycle today.
                </div>
              ) : (
                todaySessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-slate-200 truncate">{sess.taskTitle}</span>
                    </div>
                    <span className="text-[11px] font-mono text-cyan-400 shrink-0 ml-2">
                      +{sess.durationMinutes}m
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
