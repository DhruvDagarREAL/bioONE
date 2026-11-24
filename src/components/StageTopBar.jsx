import React from 'react';
import { ArrowLeft, PanelLeftClose, PanelLeftOpen, Info } from 'lucide-react';

const STAGE_CONFIG = {
  'b-dna': {
    title: 'B-DNA Molecular Stage',
    subtitle: 'Double Helix · Antiparallel Strands',
    accent: '#22d3ee',
  },
  mitochondria: {
    title: 'Mitochondria & ATP Engine',
    subtitle: 'Inner Membrane · Electron Transport Chain',
    accent: '#fbbf24',
  },
};

export default function StageTopBar({
  onBackToTopics,
  sidebarCollapsed,
  onToggleSidebar,
  infoOpen,
  onToggleInfo,
  activeStage = 'b-dna',
}) {
  const config = STAGE_CONFIG[activeStage] || STAGE_CONFIG['b-dna'];
  return (
    <header className="relative z-20 flex h-16 shrink-0 items-center gap-2 border-b border-white/10 bg-[#070b18]/85 px-3 backdrop-blur-xl sm:gap-3 sm:px-5">
      <button
        type="button"
        onClick={onBackToTopics}
        className="group inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-2 text-xs font-semibold text-slate-300 transition-colors hover:border-cyan-400/40 hover:bg-cyan-500/10 hover:text-cyan-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        aria-label="Back to all topics"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        <span className="hidden sm:inline">All Topics</span>
      </button>

      <button
        type="button"
        onClick={onToggleSidebar}
        className="hidden lg:inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition-colors hover:border-cyan-400/40 hover:bg-cyan-500/10 hover:text-cyan-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-expanded={!sidebarCollapsed}
        title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {sidebarCollapsed ? (
          <PanelLeftOpen className="h-4 w-4" />
        ) : (
          <PanelLeftClose className="h-4 w-4" />
        )}
      </button>

      <span className="hidden h-6 w-px bg-white/10 sm:block" />

      <div className="flex min-w-0 items-center gap-2">
        <span className="relative flex h-2 w-2 shrink-0">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70"
            style={{ backgroundColor: config.accent }}
          />
          <span
            className="relative inline-flex h-2 w-2 rounded-full"
            style={{ backgroundColor: config.accent }}
          />
        </span>
        <h1 className="truncate text-sm font-semibold tracking-tight text-white sm:text-base">
          {config.title}
        </h1>
        <span
          className="hidden shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest md:inline-block"
          style={{
            borderColor: `${config.accent}30`,
            backgroundColor: `${config.accent}10`,
            color: config.accent,
          }}
        >
          Live
        </span>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <span className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-slate-400 lg:inline-block">
          {config.subtitle}
        </span>
        <button
          type="button"
          onClick={onToggleInfo}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-2 text-xs font-semibold text-slate-300 transition-colors hover:border-cyan-400/40 hover:bg-cyan-500/10 hover:text-cyan-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          aria-expanded={infoOpen}
          aria-label="Toggle details panel"
        >
          <Info className="h-4 w-4" />
          <span>Details</span>
        </button>
      </div>
    </header>
  );
}

