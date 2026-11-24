import React, { useRef, useEffect, useState } from 'react';
import {
  Dna,
  FlaskConical,
  Zap,
  Layers,
  Compass,
  ArrowRight,
  MousePointerClick,
  Clock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

const STAGE_CARDS = [
  {
    id: 'b-dna',
    title: 'B-DNA Double Helix',
    category: 'Genomic Architecture',
    accent: '#22D3EE',
    icon: Dna,
    description:
      'Inspect the right-handed double helix, antiparallel sugar-phosphate backbones, A–T and G–C base pairs, and hydrogen bond bridges.',
    tags: ['Sugar-Phosphate', 'Base Pairing', 'Major Groove'],
    status: 'active',
    cta: 'Launch 3D',
  },
  {
    id: 'protein-synthesis',
    title: 'DNA to Protein Synthesis',
    category: 'Central Dogma',
    accent: '#a78bfa',
    icon: FlaskConical,
    description:
      'Follow mRNA transcription from DNA templates and watch ribosomal translation assemble polypeptide chains amino acid by amino acid.',
    tags: ['Transcription', 'Ribosome', 'tRNA & Codons'],
    status: 'coming-soon',
    cta: 'Preview',
  },
  {
    id: 'mitochondria-atp',
    title: 'Mitochondria & ATP Engine',
    category: 'Cellular Bioenergetics',
    accent: '#fbbf24',
    icon: Zap,
    description:
      'Journey across the cristae inner membrane to visualize the electron transport chain and rotary ATP synthase powering cellular life.',
    tags: ['ATP Synthase', 'Proton Gradient', 'Cristae'],
    status: 'active',
    cta: 'Launch 3D Stage →',
  },
  {
    id: 'cell-membrane',
    title: 'Cell Membrane Transport',
    category: 'Membrane Dynamics',
    accent: '#34d399',
    icon: Layers,
    description:
      'Explore the fluid phospholipid bilayer, selective ion channels, and active Na⁺/K⁺ ATPase pumps regulating cellular homeostasis.',
    tags: ['Phospholipid Bilayer', 'Ion Channels', 'Active Pumps'],
    status: 'coming-soon',
    cta: 'Preview',
  },
  {
    id: 'crispr-cas9',
    title: 'CRISPR-Cas9 Gene Editing',
    category: 'Genome Engineering',
    accent: '#f472b6',
    icon: Compass,
    description:
      'Examine how programmable guide RNA directs the Cas9 endonuclease to recognize PAM sequences and perform targeted DNA cleavage.',
    tags: ['Guide RNA', 'Cas9 Complex', 'PAM Recognition'],
    status: 'coming-soon',
    cta: 'Preview',
  },
];

export default function StageGridSection({ onLaunchDna, onLaunchMitochondria }) {
  const [visibleCards, setVisibleCards] = useState({});
  const [previewStage, setPreviewStage] = useState(null);
  const sectionRef = useRef(null);
  const backButtonRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.dataset.id;
            setVisibleCards((prev) => ({ ...prev, [id]: true }));
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    const cards = sectionRef.current?.querySelectorAll('[data-id]');
    cards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!previewStage) return undefined;

    const previouslyFocusedElement = document.activeElement;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setPreviewStage(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    backButtonRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocusedElement?.isConnected) {
        previouslyFocusedElement.focus();
      }
    };
  }, [previewStage]);

  return (
    <section
      id="stages"
      ref={sectionRef}
      className="relative scroll-mt-24 py-16 sm:py-20"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-fuchsia-500/5 blur-[150px]" />
        <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 h-[400px] w-[400px] rounded-full bg-indigo-500/5 blur-[120px]" />
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-40 bg-dot-matrix-overlay" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10 lg:px-12">
        <div className="mb-12 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/25 bg-fuchsia-500/10 px-3.5 py-1 text-xs font-medium text-fuchsia-300 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            Select a Molecular Stage
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Explore the <span className="bg-gradient-to-r from-fuchsia-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">Molecular Universe</span>
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-base leading-relaxed text-slate-300">
            Interactive 3D visualization modules covering genomic architecture, cellular processes, and genome engineering.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {STAGE_CARDS.map((card, index) => {
            const Icon = card.icon;
            const isVisible = visibleCards[card.id];
            const delay = (index * 100) + 200;
            const isComingSoon = card.status === 'coming-soon';
            
            return (
              <article
                key={card.id}
                data-id={card.id}
                className="group relative glass-card rounded-2xl p-5 sm:p-6 transition-all duration-500 hover:scale-[1.03] animate-fade-in-up overflow-hidden"
                style={{
                  animationDelay: `${delay}ms`,
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at center, ${card.accent}20 0%, transparent 70%)` }} />

                <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl" style={{ background: `linear-gradient(90deg, ${card.accent}, transparent)` }} />

                <div className="relative flex items-start justify-between">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 transition-all duration-300 group-hover:scale-110" style={{
                    borderColor: `${card.accent}66`,
                    backgroundColor: `${card.accent}15`,
                    color: card.accent,
                  }}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                    {card.category}
                  </span>
                </div>

                <div className="relative mt-5">
                  <h3 className="text-lg font-semibold tracking-tight text-white">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">
                    {card.description}
                  </p>
                </div>

                <div className="relative mt-4 flex flex-wrap gap-1">
                  {card.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border px-2 py-0.5 text-[9px] font-medium transition-all duration-200 group-hover:scale-105"
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

                <div className="relative mt-4 flex items-center justify-between">
                  {isComingSoon ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium text-slate-400">
                      <Clock className="h-3 w-3" />
                      Coming Soon
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium"
                      style={{
                        borderColor: `${card.accent}40`,
                        backgroundColor: `${card.accent}10`,
                        color: card.accent,
                      }}
                    >
                      <Sparkles className="h-3 w-3" />
                      Active
                    </span>
                  )}
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-medium text-white transition-all duration-300 hover:border-cyan-400/50 hover:bg-cyan-500/10 hover:text-cyan-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                    onClick={() => {
                      if (isComingSoon) {
                        setPreviewStage(card);
                      } else if (card.id === 'b-dna') {
                        onLaunchDna(card.id);
                      } else if (card.id === 'mitochondria-atp') {
                        onLaunchMitochondria(card.id);
                      }
                    }}
                    aria-haspopup={isComingSoon ? 'dialog' : undefined}
                  >
                    {card.cta}
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>

                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-0 rounded-full opacity-0 transition-all duration-500 group-hover:w-1/3 group-hover:opacity-100" style={{ background: card.accent }} />
              </article>
            );
          })}
        </div>
      </div>
      {previewStage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#060913]/80 p-4 backdrop-blur-md sm:p-6"
          onClick={() => setPreviewStage(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="development-modal-title"
            aria-describedby="development-modal-status"
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0B1120]/90 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.65),0_0_40px_rgba(34,211,238,0.12)] backdrop-blur-2xl sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-cyan-400/15 blur-[70px]" aria-hidden="true" />

            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.18)]">
                <Clock className="h-6 w-6" />
              </div>

              <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
                {previewStage.category}
              </p>
              <h2 id="development-modal-title" className="mt-2 text-2xl font-bold tracking-tight text-white">
                {previewStage.title}
              </h2>

              <div className="mt-4 flex flex-wrap gap-2" aria-label="Module tags">
                {previewStage.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] font-medium text-slate-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div
                id="development-modal-status"
                role="status"
                className="mt-6 flex items-center gap-3 rounded-2xl border border-cyan-400/20 bg-cyan-500/[0.07] px-4 py-3.5"
              >
                <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-50" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400" />
                </span>
                <p className="text-sm font-medium text-slate-100">
                  Still in Development <span className="text-cyan-300">— Please Wait</span>
                </p>
              </div>

              <button
                ref={backButtonRef}
                type="button"
                onClick={() => setPreviewStage(null)}
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-200 transition-all hover:border-cyan-300/60 hover:bg-cyan-500/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                ← Back to Stages
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}