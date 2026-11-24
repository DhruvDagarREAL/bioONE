import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, MousePointer2, Rotate3D, Zap } from 'lucide-react';
import TelemetryBadges from './TelemetryBadges.jsx';

const PAIR_COUNT = 36;
const PRESETS = [
  { id: 'relaxed', label: 'Relaxed B-DNA', pitch: 34, twist: 36 },
  { id: 'unwind', label: 'Unwind Strand', pitch: 40, twist: 18 },
  { id: 'pulse', label: 'Pulse Energy', pitch: 34, twist: 36, pulse: true },
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export default function HeroPlayground({ onLaunchDna }) {
  const canvasRef = useRef(null);
  const canvasFrameRef = useRef(null);
  const controlsRef = useRef({ pitchTarget: 34, twistTarget: 36, pulseStartedAt: null });
  const [activePreset, setActivePreset] = useState('relaxed');
  const [telemetry, setTelemetry] = useState({ pitch: 34, twist: 36, isDragging: false });

  const applyPreset = (preset) => {
    controlsRef.current.pitchTarget = preset.pitch;
    controlsRef.current.twistTarget = preset.twist;
    if (preset.pulse) controlsRef.current.pulseStartedAt = performance.now();
    setActivePreset(preset.id);
  };

  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const frame = canvasFrameRef.current;
    if (!canvas || !frame) return undefined;

    const context = canvas.getContext('2d');
    if (!context) return undefined;

    let width = 1;
    let height = 1;
    let pixelRatio = 1;
    let animationFrameId = 0;
    let previousFrameAt = performance.now();
    let lastTelemetryAt = 0;
    let rotationX = -0.12;
    let rotationY = 0;
    let vx = 0;
    let vy = 0;
    let pitch = 34;
    let twist = 36;
    let stretchMomentum = 0;
    let twistMomentum = 0;
    let targetX = 0;
    let targetY = 0;
    let dampX = 0;
    let dampY = 0;
    let dragging = false;
    let activePointerId = null;
    let lastPointerX = 0;
    let lastPointerY = 0;
    const cursor = { x: 0, y: 0, active: false, attract: false };
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const nodeStates = Array.from({ length: PAIR_COUNT * 2 }, () => ({
      offsetX: 0,
      offsetY: 0,
      velocityX: 0,
      velocityY: 0,
    }));

    const setDragTelemetry = (value) => {
      setTelemetry((current) => ({ ...current, isDragging: value }));
    };

    const resize = () => {
      const bounds = frame.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const updateCursor = (event) => {
      const bounds = canvas.getBoundingClientRect();
      cursor.x = event.clientX - bounds.left;
      cursor.y = event.clientY - bounds.top;
      cursor.active = true;
      cursor.attract = event.shiftKey;
      targetX = clamp((cursor.x / Math.max(bounds.width, 1) - 0.5) * 2, -1, 1);
      targetY = clamp((cursor.y / Math.max(bounds.height, 1) - 0.5) * 2, -1, 1);
    };

    const handlePointerDown = (event) => {
      if (activePointerId !== null) return;
      event.preventDefault();
      updateCursor(event);
      activePointerId = event.pointerId;
      dragging = true;
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      vx = 0;
      vy = 0;
      setActivePreset('custom');
      setDragTelemetry(true);
      canvas.setPointerCapture?.(event.pointerId);
    };

    const handlePointerMove = (event) => {
      if (activePointerId !== null && event.pointerId !== activePointerId) return;
      updateCursor(event);
      if (!dragging) return;

      event.preventDefault();
      const deltaX = event.clientX - lastPointerX;
      const deltaY = event.clientY - lastPointerY;
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;

      rotationY += deltaX * 0.008;
      rotationX = clamp(rotationX + deltaY * 0.005, -1.15, 1.15);
      vx = deltaX * 0.008;
      vy = deltaY * 0.005;
      stretchMomentum = deltaY * 0.018;
      twistMomentum = -deltaX * 0.008;
      controlsRef.current.pitchTarget = clamp(controlsRef.current.pitchTarget + deltaY * 0.035, 24, 48);
      controlsRef.current.twistTarget = clamp(controlsRef.current.twistTarget - deltaX * 0.04, 18, 58);
    };

    const handlePointerUp = (event) => {
      if (activePointerId === null || event.pointerId !== activePointerId) return;
      if (canvas.hasPointerCapture?.(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      activePointerId = null;
      dragging = false;
      cursor.active = false;
      targetX = 0;
      targetY = 0;
      setDragTelemetry(false);
    };

    const handlePointerLeave = () => {
      if (dragging) return;
      cursor.active = false;
      targetX = 0;
      targetY = 0;
    };

    const projectNode = (pairIndex, strand) => {
      const radius = Math.min(width * 0.19, height * 0.19, 102);
      const rise = Math.min(10.5, height / 48) * (pitch / 34);
      const angle = pairIndex * (twist * Math.PI / 180) + rotationY + (strand === 1 ? Math.PI : 0);
      const x = Math.cos(angle) * radius;
      const y = (pairIndex - (PAIR_COUNT - 1) / 2) * rise;
      const z = Math.sin(angle) * radius;
      const tiltX = rotationX + dampY * 0.16;
      const tiltZ = dampX * 0.08;
      const cosX = Math.cos(tiltX);
      const sinX = Math.sin(tiltX);
      const cosZ = Math.cos(tiltZ);
      const sinZ = Math.sin(tiltZ);
      const rotatedY = y * cosX - z * sinX;
      const rotatedZ = y * sinX + z * cosX;
      const rotatedX = x * cosZ - rotatedY * sinZ;
      const finalY = x * sinZ + rotatedY * cosZ;
      const perspective = 520;
      const scale = perspective / (perspective + rotatedZ);

      return {
        x: width * 0.54 + rotatedX * scale,
        y: height * 0.51 + finalY * scale,
        z: rotatedZ,
        scale,
        pairIndex,
        strand,
        energy: 0,
      };
    };

    const applyCursorPhysics = (point) => {
      const state = nodeStates[point.pairIndex * 2 + point.strand];
      if (cursor.active) {
        const deltaX = point.x - cursor.x;
        const deltaY = point.y - cursor.y;
        const distance = Math.hypot(deltaX, deltaY);
        if (distance > 0 && distance < 120) {
          const force = (1 - distance / 120) * 1.65;
          const direction = cursor.attract ? -1 : 1;
          state.velocityX += (deltaX / distance) * force * direction;
          state.velocityY += (deltaY / distance) * force * direction;
        }
      }

      state.velocityX += -state.offsetX * 0.05;
      state.velocityY += -state.offsetY * 0.05;
      state.velocityX *= 0.84;
      state.velocityY *= 0.84;
      state.offsetX = clamp(state.offsetX + state.velocityX, -48, 48);
      state.offsetY = clamp(state.offsetY + state.velocityY, -48, 48);
      point.x += state.offsetX;
      point.y += state.offsetY;
      return point;
    };

    const drawBackground = () => {
      const glow = context.createRadialGradient(
        width * 0.54, height * 0.48, 0,
        width * 0.54, height * 0.48, Math.max(width, height) * 0.58
      );
      glow.addColorStop(0, 'rgba(34, 211, 238, 0.075)');
      glow.addColorStop(0.45, 'rgba(99, 102, 241, 0.035)');
      glow.addColorStop(1, 'rgba(6, 9, 19, 0)');
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);

      context.save();
      context.strokeStyle = 'rgba(148, 163, 184, 0.045)';
      context.lineWidth = 1;
      for (let x = 0; x <= width; x += 40) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, height);
        context.stroke();
      }
      for (let y = 0; y <= height; y += 40) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.stroke();
      }
      context.restore();
    };

    const drawBridge = (pair) => {
      const depthOpacity = clamp(0.3 + (pair.a.scale + pair.b.scale) * 0.2, 0.25, 0.75);
      context.save();
      context.globalAlpha = depthOpacity;
      context.strokeStyle = pair.energy > 0.1 ? '#67e8f9' : '#94a3b8';
      context.lineWidth = 1 + pair.energy * 1.5;
      context.setLineDash([3, 5]);
      context.beginPath();
      context.moveTo(pair.a.x, pair.a.y);
      context.lineTo(pair.b.x, pair.b.y);
      context.stroke();
      context.setLineDash([]);

      const bridgeCount = pair.pairIndex % 3 === 0 ? 3 : 2;
      context.fillStyle = pair.pairIndex % 2 === 0 ? '#fbbf24' : '#a5f3fc';
      for (let bridge = 1; bridge <= bridgeCount; bridge += 1) {
        const ratio = bridge / (bridgeCount + 1);
        const x = pair.a.x + (pair.b.x - pair.a.x) * ratio;
        const y = pair.a.y + (pair.b.y - pair.a.y) * ratio;
        context.beginPath();
        context.arc(x, y, 1.15 + pair.energy, 0, Math.PI * 2);
        context.fill();
      }
      context.restore();
    };

    const drawBackbone = (points, strand) => {
      context.save();
      context.strokeStyle = strand === 0 ? 'rgba(34, 211, 238, 0.48)' : 'rgba(16, 185, 129, 0.46)';
      context.lineWidth = 1.6;
      context.shadowColor = strand === 0 ? '#22d3ee' : '#10b981';
      context.shadowBlur = 5;
      context.beginPath();
      points.forEach((point, index) => {
        if (index === 0) context.moveTo(point.x, point.y);
        else context.lineTo(point.x, point.y);
      });
      context.stroke();
      context.restore();
    };

    const drawNode = (point) => {
      const rgb = point.strand === 0 ? '34, 211, 238' : '16, 185, 129';
      const radius = (2.8 + point.scale * 2.2) * (1 + point.energy * 0.42);
      context.save();
      context.globalAlpha = clamp(0.58 + point.scale * 0.32, 0.55, 1);
      context.shadowColor = `rgba(${rgb}, ${0.7 + point.energy * 0.3})`;
      context.shadowBlur = 10 + point.energy * 20;
      context.fillStyle = `rgba(${rgb}, 0.9)`;
      context.beginPath();
      context.arc(point.x, point.y, radius, 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0;
      context.fillStyle = 'rgba(255, 255, 255, 0.72)';
      context.beginPath();
      context.arc(point.x - radius * 0.27, point.y - radius * 0.3, Math.max(0.8, radius * 0.25), 0, Math.PI * 2);
      context.fill();
      context.restore();
    };

    const animate = (now) => {
      const frameDelta = Math.min(2, Math.max(0.25, (now - previousFrameAt) / 16.667));
      previousFrameAt = now;
      dampX += (targetX - dampX) * 0.08;
      dampY += (targetY - dampY) * 0.08;

      if (!dragging) {
        rotationY += ((reduceMotion ? 0 : 0.0028) + vx) * frameDelta;
        rotationX = clamp(rotationX + vy * frameDelta, -1.15, 1.15);
        vx *= Math.pow(0.93, frameDelta);
        vy *= Math.pow(0.93, frameDelta);
      }

      const controls = controlsRef.current;
      pitch = clamp(pitch + (controls.pitchTarget - pitch) * 0.08 + stretchMomentum, 22, 50);
      twist = clamp(twist + (controls.twistTarget - twist) * 0.08 + twistMomentum, 16, 60);
      stretchMomentum *= Math.pow(0.82, frameDelta);
      twistMomentum *= Math.pow(0.82, frameDelta);

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);
      drawBackground();

      const pulseElapsed = controls.pulseStartedAt === null ? Infinity : now - controls.pulseStartedAt;
      const pulsePosition = pulseElapsed < 2400 ? (pulseElapsed / 2400) * (PAIR_COUNT + 12) - 6 : -100;
      const pairs = [];

      for (let pairIndex = 0; pairIndex < PAIR_COUNT; pairIndex += 1) {
        const energy = Math.max(0, 1 - Math.abs(pairIndex - pulsePosition) / 4);
        const a = applyCursorPhysics(projectNode(pairIndex, 0));
        const b = applyCursorPhysics(projectNode(pairIndex, 1));
        a.energy = energy;
        b.energy = energy;
        pairs.push({ a, b, energy });
      }

      pairs.forEach(drawBridge);
      drawBackbone(pairs.map((pair) => pair.a), 0);
      drawBackbone(pairs.map((pair) => pair.b), 1);
      pairs
        .flatMap((pair) => [pair.a, pair.b])
        .sort((nodeA, nodeB) => nodeB.z - nodeA.z)
        .forEach(drawNode);

      if (now - lastTelemetryAt > 80) {
        lastTelemetryAt = now;
        setTelemetry({ pitch, twist, isDragging: dragging });
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove, { passive: false });
    canvas.addEventListener('pointerleave', handlePointerLeave);
    canvas.addEventListener('lostpointercapture', handlePointerUp);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
      canvas.removeEventListener('lostpointercapture', handlePointerUp);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      if (activePointerId !== null && canvas.hasPointerCapture?.(activePointerId)) {
        canvas.releasePointerCapture(activePointerId);
      }
      cursor.active = false;
    };
  }, []);

  return (
    <section aria-labelledby="hero-title" className="relative py-14 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-400/5 blur-[120px]" />
      <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.08)] backdrop-blur-md sm:text-xs">
            <span aria-hidden="true" className="animate-pulse">⚡</span>
            <span>INTERACTIVE WEBGL MOLECULAR ATLAS v1.0</span>
          </div>

          <h1 id="hero-title" className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl xl:text-6xl">
            <span className="bg-gradient-to-r from-cyan-300 via-cyan-400 to-emerald-300 bg-clip-text text-transparent">bioONE</span>
            <span className="bg-gradient-to-r from-slate-100 via-cyan-100 to-indigo-300 bg-clip-text text-transparent"> — Real-Time Spatial Biology</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Explore nanoscale biological machinery in real-time 3D. Orbit molecular architectures, inspect chemical bonds, and build spatial intuition at sub-nanometer resolution.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => onLaunchDna()}
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.28)] transition duration-300 hover:bg-cyan-300 hover:shadow-[0_0_40px_rgba(34,211,238,0.42)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Launch B-DNA 3D Stage
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              type="button"
              onClick={scrollToHowItWorks}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-5 py-3 text-sm font-medium text-slate-200 backdrop-blur-xl transition duration-300 hover:border-cyan-400/35 hover:bg-cyan-400/[0.07] hover:text-cyan-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              Explore How It Works <span aria-hidden="true">↓</span>
            </button>
          </div>

          <dl className="mt-9 grid max-w-xl grid-cols-3 divide-x divide-white/10 border-y border-white/10 py-4">
            {[
              ['0.34nm', 'Resolution'],
              ['60 FPS', 'Canvas Physics'],
              ['Zero', 'Installs'],
            ].map(([value, label], index) => (
              <div key={label} className={`${index === 0 ? 'pr-3' : 'px-3 sm:px-5'} flex flex-col`}>
                <dt className="order-2 mt-1 text-[9px] uppercase tracking-wider text-slate-500 sm:text-[10px]">{label}</dt>
                <dd className="order-1 whitespace-nowrap font-mono text-xs font-semibold text-slate-200 sm:text-sm">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative min-w-0">
          <div className="glass-card relative overflow-hidden rounded-3xl shadow-[0_0_50px_rgba(34,211,238,0.15)]">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-slate-950/40 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                <Rotate3D className="h-4 w-4 text-cyan-400" />
                Live B-DNA Projection
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-emerald-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                36 Base Pairs
              </span>
            </div>

            <div ref={canvasFrameRef} className="relative h-[430px] overflow-hidden bg-slate-950/55 sm:h-[500px] xl:h-[540px]">
              <canvas
                ref={canvasRef}
                className="block h-full w-full cursor-grab touch-none select-none active:cursor-grabbing"
                aria-label="Interactive three-dimensional B-DNA double helix. Drag to rotate and stretch, move the cursor to repel nodes, or hold Shift to attract them."
              />
              <TelemetryBadges pitch={telemetry.pitch} twist={telemetry.twist} isDragging={telemetry.isDragging} />
              <div className="pointer-events-none absolute right-4 top-4 z-10 hidden rounded-lg border border-white/10 bg-slate-950/60 px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-wider text-slate-500 backdrop-blur-md sm:block">
                Canvas 2D / 3D Matrix
              </div>
              <div className="pointer-events-none absolute inset-x-3 bottom-3 z-10 flex justify-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/65 px-3 py-1.5 text-[9px] font-medium tracking-wide text-slate-400 backdrop-blur-md sm:text-[10px]">
                  <MousePointer2 className="h-3 w-3 text-cyan-400" />
                  Drag to rotate · Move to repel · Shift to attract
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 border-t border-white/10 bg-slate-950/45 px-3 py-3.5 sm:px-4">
              {PRESETS.map((preset) => {
                const isActive = activePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => applyPreset(preset)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 sm:text-xs ${
                      isActive
                        ? 'border-cyan-400/50 bg-cyan-400/15 text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.15)]'
                        : 'border-white/10 bg-white/[0.035] text-slate-400 hover:border-cyan-400/30 hover:text-cyan-200'
                    }`}
                  >
                    {preset.pulse ? <Zap className="h-3 w-3" /> : <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-cyan-300' : 'bg-slate-600'}`} />}
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="pointer-events-none absolute -inset-5 -z-10 rounded-[2rem] bg-gradient-to-br from-cyan-400/10 via-transparent to-emerald-400/5 blur-2xl" />
        </div>
      </div>
    </section>
  );
}
