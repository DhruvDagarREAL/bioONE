import React from 'react';
import { Dna, Zap, Atom } from 'lucide-react';

export function TelemetryBadges({ pitch = 34.0, twist = 36.0, isDragging = false }) {
  const pulseClass = isDragging
    ? 'animate-pulse text-amber-300 border-amber-400/50 bg-amber-500/15'
    : 'text-slate-400 border-white/10 bg-slate-900/60';

  return (
    <div className="absolute top-4 left-4 z-20 flex flex-col gap-2.5 pointer-events-none select-none">
      {/* HELIX PITCH badge */}
      <div className="glass-card flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-200 backdrop-blur-md shadow-lg border border-white/10 bg-slate-900/70">
        <Dna className="h-4 w-4 text-cyan-400 shrink-0" />
        <span className="whitespace-nowrap font-mono tracking-tight">
          HELIX PITCH: <span className="font-semibold text-cyan-300">{(pitch || 34.0).toFixed(1)} Å</span>
        </span>
      </div>

      {/* TWIST ANGLE badge */}
      <div className="glass-card flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-200 backdrop-blur-md shadow-lg border border-white/10 bg-slate-900/70">
        <Zap className="h-4 w-4 text-emerald-400 shrink-0" />
        <span className="whitespace-nowrap font-mono tracking-tight">
          TWIST ANGLE: <span className="font-semibold text-emerald-300">{(twist || 36.0).toFixed(1)}°</span>
        </span>
      </div>

      {/* INTERACTIVE DRAG indicator badge */}
      <div className={`glass-card flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-semibold tracking-wider uppercase backdrop-blur-md shadow-lg border transition-all duration-300 ${pulseClass}`}>
        <Atom className="h-3.5 w-3.5 text-amber-400 shrink-0" />
        <span className="whitespace-nowrap">
          INTERACTIVE DRAG: <span className={isDragging ? 'text-amber-300' : 'text-slate-400'}>{isDragging ? 'ACTIVE' : 'PASSIVE'}</span>
        </span>
      </div>
    </div>
  );
}

export default TelemetryBadges;