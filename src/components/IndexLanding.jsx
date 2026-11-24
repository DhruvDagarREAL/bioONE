import React from 'react';
import { Atom, Dna } from 'lucide-react';
import HeroPlayground from './HeroPlayground.jsx';
import HowItWorksSection from './HowItWorksSection.jsx';
import BentoGrid from './BentoGrid.jsx';
import StageGridSection from './StageGridSection.jsx';

export default function IndexLanding({ onLaunchDna }) {
  return (
    <div className="custom-scrollbar relative h-screen w-screen overflow-y-auto bg-[#060913] text-slate-100">
      {/* Fixed ambient spotlights and 40px micro-grid */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="ambient-spotlight absolute inset-0" />
        <div className="absolute -top-40 left-1/4 h-[520px] w-[520px] rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="absolute -right-24 top-1/3 h-[460px] w-[460px] rounded-full bg-indigo-500/10 blur-[130px]" />
        <div className="absolute -bottom-32 left-1/3 h-[420px] w-[420px] rounded-full bg-fuchsia-500/10 blur-[130px]" />
        <div className="bg-dot-matrix absolute inset-0 opacity-70" />
      </div>

      <div className="relative z-10 flex min-h-full flex-col">
        <div className="mx-auto w-full max-w-7xl px-6 pt-8 sm:px-10 lg:px-12">
          {/* Top Navbar */}
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/25 via-indigo-500/20 to-fuchsia-500/20 shadow-[0_0_24px_rgba(34,211,238,0.25)] ring-1 ring-cyan-400/40">
                <Dna className="h-6 w-6 text-cyan-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold tracking-tight text-white">
                    bio<span className="text-cyan-400">ONE</span>
                  </span>
                  <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-cyan-300">
                    Atlas v1.0
                  </span>
                </div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  3D Molecular Atlas
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/60 px-3.5 py-1.5 text-xs text-slate-300 backdrop-blur-md">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                <span>1 Interactive Stage Live</span>
              </div>
              <div className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-slate-900/60 px-3.5 py-1.5 text-xs text-slate-400 backdrop-blur-md sm:inline-flex">
                <Atom className="h-3.5 w-3.5 text-indigo-400" />
                <span>4 Upcoming Modules</span>
              </div>
            </div>
          </header>
        </div>

        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-12">
            <HeroPlayground onLaunchDna={onLaunchDna} />
          </div>
          <HowItWorksSection />
          <BentoGrid />
          <StageGridSection onLaunchDna={onLaunchDna} />
        </main>

        <div className="mx-auto w-full max-w-7xl px-6 pb-8 sm:px-10 lg:px-12">
          {/* Footer */}
          <footer className="border-t border-white/10 py-6 text-center text-[11px] text-slate-500">
            bioONE · 3D Molecular Atlas — built with React, Three.js &amp; React Three Fiber
          </footer>
        </div>
      </div>
    </div>
  );
}
