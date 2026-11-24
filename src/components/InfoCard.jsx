import React from 'react';
import { ChevronLeft, ChevronRight, Lightbulb, MousePointerClick } from 'lucide-react';

export default function InfoCard({
  topic,
  topicIndex,
  totalTopics,
  onPrev,
  onNext,
  selectedRung,
}) {
  if (!topic) return null;

  return (
    <section
      aria-label="Selected topic details"
      className="pointer-events-auto relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/15 bg-slate-900/55 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.85)] backdrop-blur-2xl"
    >
      {/* Top accent glow bar */}
      <div
        className="h-1 w-full shrink-0"
        style={{
          background: `linear-gradient(90deg, ${topic.accent}, rgba(99,102,241,0.7), transparent)`,
        }}
      />

      <div className="custom-scrollbar flex-1 overflow-y-auto p-5">
        {/* Category & Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
            {topic.category}
          </span>
          <span
            className="rounded-full border px-2.5 py-0.5 text-[11px] font-semibold"
            style={{
              borderColor: `${topic.accent}55`,
              backgroundColor: `${topic.accent}1a`,
              color: topic.accent,
            }}
          >
            {topic.badge}
          </span>
        </div>

        {/* Title & Summary */}
        <h2 className="mt-2.5 text-xl font-semibold tracking-tight text-white">
          {topic.title}
        </h2>
        <p className="mt-2.5 text-sm leading-relaxed text-slate-200">
          {topic.summary}
        </p>
        <p className="mt-2.5 text-xs leading-relaxed text-slate-400">
          {topic.details}
        </p>

        {/* Active Clicked Rung Pill */}
        {selectedRung && (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-cyan-400/25 bg-cyan-400/10 px-3.5 py-2.5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
                Selected Base Pair #{selectedRung.id + 1}
              </p>
              <p className="text-sm font-semibold text-white">
                {selectedRung.left === 'A'
                  ? 'Adenine'
                  : selectedRung.left === 'T'
                    ? 'Thymine'
                    : selectedRung.left === 'G'
                      ? 'Guanine'
                      : 'Cytosine'}{' '}
                ↔{' '}
                {selectedRung.right === 'A'
                  ? 'Adenine'
                  : selectedRung.right === 'T'
                    ? 'Thymine'
                    : selectedRung.right === 'G'
                      ? 'Guanine'
                      : 'Cytosine'}
              </p>
            </div>
            <span className="rounded-lg bg-slate-950/70 px-2.5 py-1 font-mono text-xs text-cyan-300 ring-1 ring-white/10">
              {selectedRung.bonds} H-bonds
            </span>
          </div>
        )}

        {/* Key Metrics Grid */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {topic.metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-xl border border-white/10 bg-white/[0.04] p-3"
            >
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                {metric.label}
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-100">
                {metric.value}
              </p>
            </div>
          ))}
        </div>

        {/* Fun Fact Box */}
        <div className="mt-4 rounded-xl border border-indigo-400/20 bg-indigo-500/10 p-3.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-indigo-300">
            <Lightbulb className="h-3.5 w-3.5" />
            Molecular Insight
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-200">
            {topic.funFact}
          </p>
        </div>

        {/* Interactive Tip */}
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-white/5 bg-black/25 px-3 py-2.5 text-[11px] text-slate-400">
          <MousePointerClick className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400" />
          <span>{topic.clickHint}</span>
        </div>
      </div>

      {/* Prev / Next Navigation */}
      <div className="flex items-center justify-between border-t border-white/10 bg-slate-950/40 px-4 py-3">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-white/25 hover:bg-white/[0.08]"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Prev
        </button>

        <span className="font-mono text-[11px] text-slate-400">
          {topicIndex + 1} / {totalTopics}
        </span>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/30 bg-cyan-500/15 px-3 py-1.5 text-xs font-medium text-cyan-200 transition hover:bg-cyan-500/25"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </section>
  );
}
