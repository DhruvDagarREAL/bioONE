import React, { useState, useEffect, useRef } from 'react';
import { Sliders, Sparkles, Layers, Eye, Compass, Info } from 'lucide-react';

const TABS = [
  {
    id: 1,
    title: '01 / Real-Time Spatial Orbiting',
    desc: 'Inspect nanoscale biological machinery from any angle with fluid 60fps camera controls and rotational dynamics.',
    icon: Compass,
    accent: '#22D3EE',
  },
  {
    id: 2,
    title: '02 / Atomic & Chemical Bond Inspection',
    desc: 'Click individual nucleotides, hydrogen bonds, and backbones to reveal real-time distances, angles, and chemical telemetry.',
    icon: Eye,
    accent: '#10B981',
  },
  {
    id: 3,
    title: '03 / Guided Concept Mastery',
    desc: 'Synchronized structural breakdowns and interactive annotations bridge textbook theory and 3D spatial intuition.',
    icon: Layers,
    accent: '#F59E0B',
  },
];

const ANNOTATIONS = [
  {
    id: 1,
    label: 'Major Groove',
    description: 'The wide DNA groove exposes base-pair edges for protein recognition.',
    x: 70,
    y: 24,
    color: 'text-cyan-300 border-cyan-400/50 bg-cyan-500/15',
  },
  {
    id: 2,
    label: "5' Phosphodiester Linkage",
    description: 'A covalent bridge connecting the 5′ phosphate to the adjacent sugar.',
    x: 68,
    y: 72,
    color: 'text-emerald-300 border-emerald-400/50 bg-emerald-500/15',
  },
  {
    id: 3,
    label: 'Hydrogen Bond Bridge',
    description: 'Two bonds pair A–T; three bonds pair G–C across the helix interior.',
    x: 67,
    y: 47,
    color: 'text-amber-300 border-amber-400/50 bg-amber-500/15',
  },
  {
    id: 4,
    label: 'Backbone Sugar-Phosphate',
    description: 'Alternating sugars and phosphates form each antiparallel DNA backbone.',
    x: 29,
    y: 84,
    color: 'text-indigo-300 border-indigo-400/50 bg-indigo-500/15',
  },
];

const CYCLE_DURATION = 6000;

function HelixGeometry({ accent, annotated = false }) {
  const pairs = Array.from({ length: 16 }, (_, index) => {
    const y = 36 + index * 23;
    const wave = Math.sin(index * 0.82) * 72;
    return {
      left: { x: 150 + wave, y },
      right: { x: 150 - wave, y },
    };
  });
  const toPath = (key) => pairs
    .map((pair, index) => `${index === 0 ? 'M' : 'L'} ${pair[key].x} ${pair[key].y}`)
    .join(' ');

  return (
    <svg viewBox="0 0 300 430" className="h-full w-full" aria-hidden="true">
      <ellipse cx="150" cy="214" rx="125" ry="183" fill="none" stroke={accent} strokeOpacity="0.08" strokeDasharray="4 10" />
      <ellipse cx="150" cy="214" rx="103" ry="160" fill="none" stroke={accent} strokeOpacity="0.06" />
      {pairs.map((pair, index) => (
        <g key={index}>
          <line
            x1={pair.left.x}
            y1={pair.left.y}
            x2={pair.right.x}
            y2={pair.right.y}
            stroke={index % 3 === 0 ? '#F59E0B' : accent}
            strokeOpacity={annotated ? 0.58 : 0.28}
            strokeDasharray={annotated ? '3 4' : undefined}
          />
          {annotated && (
            <circle cx="150" cy={pair.left.y} r="1.7" fill="#F59E0B" fillOpacity="0.85" />
          )}
        </g>
      ))}
      <path d={toPath('left')} fill="none" stroke={accent} strokeWidth={annotated ? 3 : 2} strokeOpacity={annotated ? 0.8 : 0.55} />
      <path d={toPath('right')} fill="none" stroke="#10B981" strokeWidth={annotated ? 3 : 2} strokeOpacity={annotated ? 0.8 : 0.5} />
      {pairs.map((pair, index) => (
        <g key={`nodes-${index}`}>
          {[pair.left, pair.right].map((point, strand) => (
            <g key={strand}>
              <circle cx={point.x} cy={point.y} r={annotated ? 8 : 10} fill={strand === 0 ? accent : '#10B981'} fillOpacity={annotated ? 0.16 : 0.1} />
              <circle cx={point.x} cy={point.y} r={annotated ? 4.5 : 5.5} fill={strand === 0 ? accent : '#10B981'} fillOpacity="0.9" />
              <circle cx={point.x - 1.4} cy={point.y - 1.5} r="1.2" fill="white" fillOpacity="0.75" />
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}

export default function HowItWorksSection() {
  const [activeTab, setActiveTab] = useState(0);
  const [progress, setProgress] = useState(0);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [tabRevision, setTabRevision] = useState(0);
  const sliderRef = useRef(null);
  const dragCleanupRef = useRef(null);
  const progressRef = useRef(0);
  const lastTouchAtRef = useRef(0);

  useEffect(() => {
    if (isHovered || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    let animationFrameId = 0;
    let lastPaintAt = 0;
    const startedAt = performance.now() - (progressRef.current / 100) * CYCLE_DURATION;
    const updateProgress = (now) => {
      const elapsed = now - startedAt;
      if (elapsed >= CYCLE_DURATION) {
        progressRef.current = 0;
        setProgress(0);
        setActiveTab((current) => (current + 1) % TABS.length);
        return;
      }
      if (now - lastPaintAt > 32) {
        lastPaintAt = now;
        const nextProgress = (elapsed / CYCLE_DURATION) * 100;
        progressRef.current = nextProgress;
        setProgress(nextProgress);
      }
      animationFrameId = requestAnimationFrame(updateProgress);
    };

    animationFrameId = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(animationFrameId);
  }, [activeTab, isHovered, tabRevision]);

  useEffect(() => () => {
    dragCleanupRef.current?.();
  }, []);

  const updateSlider = (clientX) => {
    const bounds = sliderRef.current?.getBoundingClientRect();
    if (!bounds || bounds.width === 0) return;
    setSliderPos(Math.min(100, Math.max(0, ((clientX - bounds.left) / bounds.width) * 100)));
  };

  const stopDragging = () => {
    dragCleanupRef.current?.();
    dragCleanupRef.current = null;
    setIsDragging(false);
  };

  const startDragging = (clientX) => {
    dragCleanupRef.current?.();
    setIsDragging(true);
    updateSlider(clientX);

    const handleMouseMove = (event) => updateSlider(event.clientX);
    const handleTouchMove = (event) => {
      if (event.cancelable) event.preventDefault();
      const touch = event.touches[0];
      if (touch) updateSlider(touch.clientX);
    };
    const handleDragEnd = () => stopDragging();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleDragEnd);
    window.addEventListener('touchcancel', handleDragEnd);

    dragCleanupRef.current = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
      window.removeEventListener('touchcancel', handleDragEnd);
    };
  };

  const selectTab = (index) => {
    progressRef.current = 0;
    setProgress(0);
    setActiveTab(index);
    setTabRevision((revision) => revision + 1);
  };

  const handleSliderKeyDown = (event) => {
    const offsets = { ArrowLeft: -2, ArrowDown: -2, ArrowRight: 2, ArrowUp: 2 };
    if (event.key in offsets) {
      event.preventDefault();
      setSliderPos((position) => Math.min(100, Math.max(0, position + offsets[event.key])));
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      setSliderPos(event.key === 'Home' ? 0 : 100);
    }
  };

  const activeFeature = TABS[activeTab];

  return (
    <section id="how-it-works" className="relative scroll-mt-6 overflow-hidden py-20 sm:py-24">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-dot-matrix-overlay opacity-40" />
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3.5 py-1 text-xs font-medium text-cyan-300 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            What We Do &amp; How bioONE Works
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            From raw structure to <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">spatial understanding</span>
          </h2>
          <p className="mt-3 text-base leading-relaxed text-slate-400">
            Three connected learning modes turn molecular geometry into an interactive, inspectable story.
          </p>
        </div>

        <div className="mt-12 grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <div
            className="space-y-4"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onFocusCapture={() => setIsHovered(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setIsHovered(false);
            }}
          >
            {TABS.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === index;
              return (
                <button
                  key={tab.id}
                  type="button"
                  aria-pressed={isActive}
                  aria-controls="how-it-works-preview"
                  onClick={() => selectTab(index)}
                  className={`glass-card group relative block w-full overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 sm:p-6 ${
                    isActive
                      ? 'border-cyan-400/60 bg-cyan-400/[0.065] shadow-[0_0_28px_rgba(34,211,238,0.12)]'
                      : 'border-white/10 hover:border-white/20 hover:bg-white/[0.035]'
                  }`}
                >
                  <span className={`absolute inset-y-0 left-0 w-0.5 transition-colors ${isActive ? 'bg-cyan-400 shadow-[0_0_12px_#22d3ee]' : 'bg-transparent'}`} />
                  <div className="flex items-start gap-4">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-transform group-hover:scale-105 ${isActive ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-300' : 'border-white/10 bg-white/[0.035] text-slate-400'}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center justify-between gap-2">
                        <span className={`text-sm font-semibold tracking-wide sm:text-base ${isActive ? 'text-white' : 'text-slate-300'}`}>{tab.title}</span>
                        {isActive && <span className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-cyan-300">Active</span>}
                      </span>
                      <span className="mt-2 block text-xs leading-relaxed text-slate-400 sm:text-sm">{tab.desc}</span>
                    </span>
                  </div>
                  <span className="mt-5 block h-1 overflow-hidden rounded-full bg-white/[0.07]" aria-hidden="true">
                    <span
                      className={`block h-full rounded-full ${isActive ? 'bg-gradient-to-r from-cyan-400 to-emerald-400' : 'w-0 bg-transparent'}`}
                      style={isActive ? { width: `${progress}%` } : undefined}
                    />
                  </span>
                </button>
              );
            })}
            <p className="pl-1 text-[10px] uppercase tracking-wider text-slate-500">
              {isHovered ? 'Auto-cycle paused' : 'Auto-cycling every 6 seconds · Hover to pause'}
            </p>
          </div>

          <div id="how-it-works-preview" className="glass-card relative overflow-hidden rounded-3xl p-4 shadow-[0_25px_70px_-30px_rgba(34,211,238,0.28)] sm:p-5">
            <div className="mb-4 flex items-center gap-3 px-1">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border"
                style={{ borderColor: `${activeFeature.accent}55`, backgroundColor: `${activeFeature.accent}12`, color: activeFeature.accent }}
              >
                <Info className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-white sm:text-sm">{activeFeature.title}</p>
                <p className="mt-0.5 text-[10px] uppercase tracking-wider text-slate-500">Live structural comparison</p>
              </div>
            </div>

            <div
              ref={sliderRef}
              className={`relative h-[430px] touch-none select-none overflow-hidden rounded-2xl border bg-[#080e1b] ${isDragging ? 'cursor-grabbing border-cyan-400/50' : 'cursor-col-resize border-white/10'}`}
              onMouseDown={(event) => {
                if (Date.now() - lastTouchAtRef.current < 800) return;
                if (event.button !== 0) return;
                event.preventDefault();
                startDragging(event.clientX);
              }}
              onTouchStart={(event) => {
                lastTouchAtRef.current = Date.now();
                const touch = event.touches[0];
                if (touch) startDragging(touch.clientX);
              }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_45%,rgba(34,211,238,0.09),transparent_55%)]">
                <div className="absolute inset-10 opacity-75 sm:inset-12">
                  <HelixGeometry accent={activeFeature.accent} />
                </div>
                <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-slate-950/65 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-300 backdrop-blur-md">
                  Raw Geometry
                </span>
                <span className="absolute bottom-4 left-4 font-mono text-[9px] uppercase tracking-wider text-slate-600">Wireframe / space-filling model</span>
              </div>

              <div
                className="absolute inset-0 bg-[#091221]"
                style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_45%,rgba(16,185,129,0.12),transparent_58%)]" />
                <div className="absolute inset-10 sm:inset-12">
                  <HelixGeometry accent={activeFeature.accent} annotated />
                </div>
                <span className="absolute right-4 top-4 rounded-full border border-emerald-400/25 bg-slate-950/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-300 backdrop-blur-md">
                  Annotated Pathways
                </span>

                {ANNOTATIONS.map((annotation) => {
                  const isOpen = activeHotspot === annotation.id;
                  return (
                    <button
                      key={annotation.id}
                      type="button"
                      aria-expanded={isOpen}
                      aria-label={`${annotation.label}: ${annotation.description}`}
                      onMouseDown={(event) => event.stopPropagation()}
                      onTouchStart={(event) => event.stopPropagation()}
                      onClick={() => setActiveHotspot(isOpen ? null : annotation.id)}
                      className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg border px-2 py-1.5 text-[9px] font-medium shadow-lg backdrop-blur-md transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 sm:text-[10px] ${annotation.color} ${isOpen ? 'z-40 ring-1 ring-white/30' : ''}`}
                      style={{ left: `${annotation.x}%`, top: `${annotation.y}%` }}
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                        {annotation.label}
                      </span>
                      {isOpen && (
                        <span className="absolute bottom-[calc(100%+0.65rem)] left-1/2 block w-48 -translate-x-1/2 whitespace-normal rounded-xl border border-white/15 bg-slate-950/95 p-3 text-left text-[10px] font-normal leading-relaxed text-slate-300 shadow-2xl">
                          <span className="mb-1 block font-semibold text-white">{annotation.label}</span>
                          {annotation.description}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pointer-events-none absolute inset-y-0 z-30 w-px bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.75)]" style={{ left: `${sliderPos}%` }}>
                <div
                  role="slider"
                  tabIndex={0}
                  aria-label="Compare raw geometry with annotated pathways"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(sliderPos)}
                  aria-valuetext={`${Math.round(sliderPos)} percent raw geometry visible`}
                  onKeyDown={handleSliderKeyDown}
                  className="pointer-events-auto absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white/20 bg-gradient-to-br from-cyan-400 to-emerald-400 text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.4)] outline-none transition-transform focus:ring-2 focus:ring-cyan-200"
                >
                  <Sliders className="h-4 w-4 rotate-90" />
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 px-1 font-mono text-[10px] text-slate-500">
              <span>0%</span>
              <span className="text-cyan-300">DIVIDER {Math.round(sliderPos)}%</span>
              <span>100%</span>
            </div>
            <p className="mt-2 text-center text-[10px] text-slate-500">Drag the divider to compare · Click a hotspot to inspect</p>
          </div>
        </div>
      </div>
    </section>
  );
}
