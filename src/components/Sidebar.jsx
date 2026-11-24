import React from 'react';
import { Dna, Sparkles, RotateCw, Pause, Layers, Atom, Link2, Compass, PanelLeftOpen, PanelLeftClose } from 'lucide-react';

const TOPIC_ICONS = {
  overview: Dna,
  backbone: Layers,
  'at-pair': Atom,
  'gc-pair': Atom,
  'hydrogen-bonds': Link2,
  grooves: Compass,
};

const LEGEND = [
  { label: 'Adenine (A)', dot: 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]' },
  { label: 'Thymine (T)', dot: 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' },
  { label: 'Guanine (G)', dot: 'bg-emerald-400 shadow-[0_0_8px_#34d399]' },
  { label: 'Cytosine (C)', dot: 'bg-fuchsia-400 shadow-[0_0_8px_#e879f9]' },
];

export default function Sidebar({
  topics,
  activeTopicId,
  onSelectTopic,
  isSpinning,
  onToggleSpin,
  selectedRung,
  collapsed = false,
  open = false,
  onToggleCollapse,
  onOpenMobile,
  onCloseMobile,
}) {
  const asideClass = `relative z-20 flex h-full shrink-0 flex-col overflow-hidden border-r border-white/10 bg-[#070b18]/90 backdrop-blur-xl transition-all duration-300 ease-out ${
    collapsed ? 'w-0 border-r-0 opacity-0 pointer-events-none lg:w-0 lg:border-r-0' : 'w-80 opacity-100 lg:w-80'
  }`;

  return (
    <>
      {/* Mobile slide-over backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside className={asideClass}>
        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 via-indigo-500/20 to-fuchsia-500/20 ring-1 ring-cyan-400/40 shadow-[0_0_20px_rgba(34,211,238,0.25)]">
                <Dna className="h-5 w-5 text-cyan-300" />
              </div>
              <div className="hidden lg:block">
                <h1 className="text-base font-semibold tracking-tight text-white">
                  bio<span className="text-cyan-400">ONE</span>
                </h1>
                <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
                  3D Molecular Atlas
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/25 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
                <Sparkles className="h-3 w-3" />
                3D
              </span>
              <button
                type="button"
                onClick={onToggleCollapse}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-300 transition-colors hover:border-cyan-400/40 hover:bg-cyan-500/10 hover:text-cyan-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                aria-expanded={!collapsed}
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {collapsed ? (
                  <PanelLeftOpen className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="custom-scrollbar flex-1 overflow-y-auto px-3.5 py-4">
          <div className="mb-2.5 flex items-center justify-between px-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
              Learning Topics
            </span>
            <span className="text-[11px] text-slate-500">{topics.length} modules</span>
          </div>

          <nav className="space-y-1.5" aria-label="DNA learning topics">
            {topics.map((topic, index) => {
              const Icon = TOPIC_ICONS[topic.id] || Dna;
              const isActive = topic.id === activeTopicId;
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => {
                    onSelectTopic(topic.id);
                    onCloseMobile?.();
                  }}
                  className={`group relative flex w-full items-start gap-3 rounded-xl px-3.5 py-3 text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-white/[0.08] text-white ring-1 ring-white/20 shadow-[0_8px_24px_-8px_rgba(34,211,238,0.25)]'
                      : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                  }`}
                >
                  {isActive && (
                    <span className="absolute inset-y-2.5 left-0 w-1 rounded-r-full" style={{ backgroundColor: topic.accent }} />
                  )}
                  <div
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors"
                    style={{
                      borderColor: isActive ? `${topic.accent}66` : 'rgba(255,255,255,0.08)',
                      backgroundColor: isActive ? `${topic.accent}1f` : 'rgba(15,23,42,0.6)',
                      color: isActive ? topic.accent : '#94a3b8',
                    }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">{topic.shortLabel}</span>
                      <span className="font-mono text-[10px] text-slate-500">0{index + 1}</span>
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-slate-400/90">{topic.badge}</p>
                  </div>
                </button>
              );
            })}
          </nav>
          <div className="mt-6 rounded-xl border border-white/10 bg-slate-900/50 p-3.5">
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
              Base & Strand Key
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
              {LEGEND.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${item.dot}`} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            {selectedRung && (
              <div className="mt-3 border-t border-white/10 pt-2.5 text-[11px] text-cyan-200">
                Inspected rung #{selectedRung.id + 1}:{' '}
                <span className="font-semibold">
                  {selectedRung.left}–{selectedRung.right}
                </span>{' '}
                ({selectedRung.bonds} H-bonds)
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={onToggleSpin}
            className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-xs font-medium text-slate-200 transition hover:border-cyan-400/40 hover:bg-cyan-400/10"
          >
            <span className="flex items-center gap-2">
              {isSpinning ? (
                <RotateCw className="h-3.5 w-3.5 animate-spin text-cyan-400" />
              ) : (
                <Pause className="h-3.5 w-3.5 text-slate-400" />
              )}
              Helix Auto-Rotation
            </span>
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${
                isSpinning ? 'bg-cyan-400/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isSpinning ? 'Active' : 'Paused'}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}