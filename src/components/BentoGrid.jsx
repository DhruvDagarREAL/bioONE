import React, { useState, useRef, useEffect } from 'react';
import { Cpu, Atom, Layers, Sparkles, Zap, Eye } from 'lucide-react';

const BENTO_CARDS = [
  {
    id: 'webgl-engine',
    title: 'Zero-Install WebGL Engine',
    description: 'High-performance molecular rendering in any modern browser via React Three Fiber and raw Canvas 2D physics. No plugins, no installs, instant load.',
    icon: Cpu,
    accent: '#22D3EE',
    tags: ['R3F', 'Canvas 2D', '60 FPS'],
    highlight: 'Runs everywhere',
  },
  {
    id: 'structural-accuracy',
    title: 'Sub-Nanometer Structural Accuracy',
    description: 'PDB-level fidelity for base pairs, sugar-phosphate backbones, and hydrogen bond geometries. 0.34 nm helical rise per base pair.',
    icon: Atom,
    accent: '#10B981',
    tags: ['PDB Fidelity', '0.34 nm', 'Atomic Resolution'],
    highlight: 'Lab-grade precision',
  },
  {
    id: 'cross-section',
    title: 'Interactive Cross-Section Inspection',
    description: 'Multi-layer clipping planes reveal internal chemical bonds, major/minor grooves, and base stacking. Real-time slice & annotate.',
    icon: Layers,
    accent: '#F59E0B',
    tags: ['Clipping Planes', 'Groove Analysis', 'Bond Inspection'],
    highlight: 'Slice & explore',
  },
];

export default function BentoGrid() {
  const [mousePos, setMousePos] = useState({ x: '50%', y: '50%' });
  const gridRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!gridRef.current) return;
      const rect = gridRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePos({ x: `${x}%`, y: `${y}%` });
    };

    const handleMouseLeave = () => {
      setMousePos({ x: '50%', y: '50%' });
    };

    const el = gridRef.current;
    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <section
      ref={gridRef}
      id="capabilities"
      className="relative py-12 sm:py-16"
      style={{ '--mouse-x': mousePos.x, '--mouse-y': mousePos.y }}
      onMouseMove={(e) => {
        if (!gridRef.current) return;
        const rect = gridRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        gridRef.current.style.setProperty('--mouse-x', `${x}%`);
        gridRef.current.style.setProperty('--mouse-y', `${y}%`);
      }}
      onMouseLeave={() => {
        if (gridRef.current) {
          gridRef.current.style.setProperty('--mouse-x', '50%');
          gridRef.current.style.setProperty('--mouse-y', '50%');
        }
      }}
    >
      {/* Ambient background glow for this section */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-cyan-400/5 blur-[120px]" />
      </div>

      {/* Dot-matrix texture overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-50 bg-dot-matrix-overlay" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10 lg:px-12">
        {/* Section Header */}
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3.5 py-1 text-xs font-medium text-cyan-300 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            Core Capabilities
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Built for <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-400 bg-clip-text text-transparent">Spatial Biology</span>
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-base leading-relaxed text-slate-300">
            Three foundational pillars powering the bioONE molecular atlas experience.
          </p>
        </div>

        {/* Bento Grid - 3 Card Horizontal Strip */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {BENTO_CARDS.map((card, index) => {
            const Icon = card.icon;
            const delay = index * 120;
            return (
              <article
                key={card.id}
                className="relative group glass-card glow-border rounded-3xl p-6 sm:p-8 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_30px_60px_-20px_rgba(34,211,238,0.15)] animate-fade-in-up"
                style={{ animationDelay: `${delay}ms` }}
              >
                {/* Top accent bar */}
                <div className="absolute inset-x-0 top-0 h-1 rounded-t-3xl" style={{ background: `linear-gradient(90deg, ${card.accent}, transparent)` }} />

                {/* Icon & Highlight Badge */}
                <div className="flex items-start justify-between gap-4">
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ring-1 transition-all duration-300 group-hover:scale-110"
                    style={{
                      borderColor: `${card.accent}66`,
                      backgroundColor: `${card.accent}15`,
                      color: card.accent,
                    }}
                  >
                    <Icon className="h-8 w-8" />
                  </div>
                  <span className="self-start inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    <Zap className="h-3 w-3" style={{ color: card.accent }} />
                    {card.highlight}
                  </span>
                </div>

                {/* Content */}
                <div className="mt-6">
                  <h3 className="text-xl font-semibold tracking-tight text-white">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">
                    {card.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="mt-6 flex flex-wrap gap-1.5">
                  {card.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border px-2.5 py-0.5 text-[10px] font-medium transition-all duration-200 group-hover:scale-105"
                      style={{
                        borderColor: `${card.accent}40`,
                        backgroundColor: `${card.accent}10`,
                        color: card.accent,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Bottom accent indicator */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-1/4 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: card.accent }} />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}