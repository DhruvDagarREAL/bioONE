import React from 'react';
import { Atom, Dna } from 'lucide-react';
import HeroPlayground from './HeroPlayground.jsx';
import HowItWorksSection from './HowItWorksSection.jsx';
import BentoGrid from './BentoGrid.jsx';
import StageGridSection from './StageGridSection.jsx';

export default function IndexLanding({ onLaunchDna, onLaunchMitochondria, onLaunchCentralDogma }) {
  return (
    <div className="custom-scrollbar relative h-screen w-screen overflow-y-auto scroll-smooth bg-[#060913] text-slate-100">
      {/* Fixed ambient spotlights and 40px micro-grid */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="ambient-spotlight absolute inset-0" />
        <div className="absolute -top-40 left-1/4 h-[520px] w-[520px] rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="absolute -right-24 top-1/3 h-[460px] w-[460px] rounded-full bg-indigo-500/10 blur-[130px]" />
        <div className="absolute -bottom-32 left-1/3 h-[420px] w-[420px] rounded-full bg-fuchsia-500/10 blur-[130px]" />
        <div className="bg-dot-matrix absolute inset-0 opacity-70" />
      </div>

      <div className="relative z-10 flex min-h-full flex-col">
        {/* Sticky Top Navbar */}
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#060913]/80 backdrop-blur-xl">
          <div className="relative mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-4 px-6 sm:px-10 lg:px-12">
            <a href="#playground" className="flex shrink-0 items-center gap-3" aria-label="bioONE home">
              <img src="/favicon.svg" alt="bioONE" className="h-5 w-5 me-2" />
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">
                  bio<span className="text-cyan-400">ONE</span>
                </span>
                <span className="hidden rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-cyan-300 sm:inline-flex lg:hidden xl:inline-flex">
                  Atlas v1.0
                </span>
              </div>
            </a>

            <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex" aria-label="Landing page sections">
              <a className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-cyan-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" href="#playground">
                Playground
              </a>
              <a className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-cyan-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" href="#how-it-works">
                How It Works
              </a>
              <a className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-cyan-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" href="#stages">
                Stages
              </a>
            </nav>

            <button
              type="button"
              onClick={onLaunchDna}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-cyan-400/40 bg-[#0B1120]/90 px-4 py-2.5 text-xs font-semibold text-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.2)] transition-all duration-300 hover:border-cyan-300/70 hover:bg-cyan-500/15 hover:text-white hover:shadow-[0_0_32px_rgba(34,211,238,0.4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 sm:px-5 sm:text-sm"
            >
              <Atom className="hidden h-4 w-4 sm:block" />
              <span>Launch B-DNA</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </header>

        <main className="flex-1">
          <div id="playground" className="mx-auto max-w-7xl scroll-mt-24 px-6 pt-8 sm:px-10 lg:px-12">
            <HeroPlayground onLaunchDna={onLaunchDna} />
          </div>
          <div id="how-it-works" className="scroll-mt-24">
            <HowItWorksSection />
          </div>
          <BentoGrid />
          <StageGridSection
            onLaunchDna={onLaunchDna}
            onLaunchMitochondria={onLaunchMitochondria}
            onLaunchCentralDogma={onLaunchCentralDogma}
          />
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
