import React from 'react';
import { ActiveTab } from '../types/planner';
import { Plus, Zap, Volume2, VolumeX } from 'lucide-react';
import { sound } from '../utils/audio';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenQuickAdd: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  pendingTasksCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenQuickAdd,
  isMuted,
  onToggleMute,
  pendingTasksCount,
}) => {
  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'timeline', label: 'Timeline' },
    { id: 'matrix', label: 'Priority Matrix' },
    { id: 'focus', label: 'Focus Mode' },
    { id: 'habits', label: 'Habits' },
    { id: 'velocity', label: 'Velocity' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#080b13]/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element in display face) */}
        <button
          onClick={() => onSelectTab('timeline')}
          className="text-lg font-bold tracking-tight text-white font-display flex items-center gap-2.5 whitespace-nowrap shrink-0 hover:opacity-95 transition-opacity cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-black font-black text-xs shadow-[0_0_12px_rgba(0,240,255,0.4)] group-hover:shadow-[0_0_18px_rgba(0,240,255,0.7)] transition-all">
            <Zap className="w-4 h-4 fill-black text-black" />
          </div>
          <span className="text-slate-100">
            Quick<span className="text-cyan-400">Planner</span>
          </span>
          <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded border border-cyan-500/30 text-cyan-400/90 bg-cyan-950/40">
            Midnight Neon
          </span>
        </button>

        {/* Zone 2: 4-5 Clean single-line navigation links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  sound.playStartBlip();
                  onSelectTab(item.id);
                }}
                className={`relative px-3.5 py-1.5 text-xs font-medium tracking-wide transition-all whitespace-nowrap shrink-0 cursor-pointer rounded-md ${
                  isActive
                    ? 'text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 shadow-[0_0_12px_rgba(0,240,255,0.15)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {item.label}
                {item.id === 'matrix' && pendingTasksCount > 0 && (
                  <span className="ml-1.5 text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {pendingTasksCount}
                  </span>
                )}
                {isActive && (
                  <span className="absolute -bottom-3.5 left-2 right-2 h-[2px] bg-cyan-400 rounded-full shadow-[0_0_8px_#00f0ff]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action + Quick audio control */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Audio Feedback' : 'Mute Audio Feedback'}
            aria-label={isMuted ? 'Unmute Audio Feedback' : 'Mute Audio Feedback'}
            className="p-2 text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60 rounded-lg transition-colors border border-slate-800 cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#080b13] bg-[#00f0ff] hover:bg-[#38f8ff] active:scale-95 rounded-lg transition-all shadow-[0_0_16px_rgba(0,240,255,0.4)] hover:shadow-[0_0_22px_rgba(0,240,255,0.65)] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Quick Capture</span>
            <kbd className="hidden sm:inline-block text-[10px] font-mono bg-cyan-950/40 text-cyan-950 px-1 py-0.5 rounded border border-cyan-800/30">
              ⌘K
            </kbd>
          </button>
        </div>
      </div>
    </header>
  );
};
