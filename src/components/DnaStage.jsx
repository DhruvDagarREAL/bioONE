import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sparkles, Float } from '@react-three/drei';
import { RotateCcw, Move3d, MousePointerClick } from 'lucide-react';
import DnaHelix from './DnaHelix.jsx';

export default function DnaStage({
  activeTopicId,
  selectedRung,
  isSpinning,
  onSelectPart,
  onResetSelection,
}) {
  const controlsRef = useRef();

  const handleResetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
    onResetSelection();
  };

  return (
    <div className="stage-glow relative h-full w-full flex-1 overflow-hidden bg-[#060913]">
      {/* Subtle radial glow halo behind the helix */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[460px] w-[460px] rounded-full bg-cyan-500/10 blur-[110px]" />
        <div className="absolute h-[320px] w-[320px] rounded-full bg-indigo-500/15 blur-[95px]" />
      </div>

      {/* Reset Camera */}
      <button
        type="button"
        onClick={handleResetView}
        className="pointer-events-auto absolute top-4 right-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-900/65 px-3.5 py-1.5 text-xs font-medium text-slate-200 backdrop-blur-md transition hover:border-cyan-400/40 hover:bg-cyan-500/15"
      >
        <RotateCcw className="h-3.5 w-3.5 text-cyan-300" />
        Reset Camera
      </button>

      {/* 3D Canvas */}
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0.4, 9.8], fov: 42 }}
        onPointerMissed={() => onResetSelection()}
      >
        <ambientLight intensity={0.45} />
        <directionalLight position={[6, 8, 6]} intensity={1.35} color="#e0f2fe" />
        <pointLight position={[-5, 4, 4]} intensity={2.1} color="#22d3ee" distance={18} />
        <pointLight position={[5, -4, -3]} intensity={1.8} color="#818cf8" distance={18} />
        <pointLight position={[0, 0, 4]} intensity={0.9} color="#f472b6" distance={12} />

        <Sparkles
          count={75}
          scale={[11, 12, 11]}
          size={1.9}
          speed={0.3}
          opacity={0.45}
          color="#67e8f9"
        />

        <Float speed={1.15} rotationIntensity={0.08} floatIntensity={0.28}>
          <DnaHelix
            activeTopicId={activeTopicId}
            selectedRungId={selectedRung?.id ?? null}
            isSpinning={isSpinning}
            onSelectPart={onSelectPart}
          />
        </Float>

        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableDamping
          dampingFactor={0.07}
          minDistance={5.2}
          maxDistance={15}
          minPolarAngle={Math.PI * 0.18}
          maxPolarAngle={Math.PI * 0.82}
        />
      </Canvas>

      {/* Bottom Interactive Hint Pill */}
      <div className="pointer-events-none absolute inset-x-0 bottom-5 z-10 flex justify-center px-4">
        <div className="inline-flex flex-wrap items-center justify-center gap-4 rounded-full border border-white/10 bg-slate-950/65 px-4 py-2 text-[11px] text-slate-300 backdrop-blur-xl">
          <span className="inline-flex items-center gap-1.5">
            <Move3d className="h-3.5 w-3.5 text-cyan-400" />
            Drag to orbit · Scroll to zoom
          </span>
          <span className="hidden h-3 w-px bg-white/15 sm:inline-block" />
          <span className="inline-flex items-center gap-1.5">
            <MousePointerClick className="h-3.5 w-3.5 text-fuchsia-400" />
            Click strands, rungs, or H-bonds to inspect
          </span>
        </div>
      </div>
    </div>
  );
}
