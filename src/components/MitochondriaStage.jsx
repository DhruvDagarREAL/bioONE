import React, { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sparkles, Float } from '@react-three/drei';
import { RotateCcw, Move3d, MousePointerClick, Zap, Activity } from 'lucide-react';
import MitochondriaScene from './MitochondriaScene.jsx';

const CAMERA_PRESETS = {
  overview: { position: [0, 0, 12], target: [0, 0, 0] },
  'etc-complexes': { position: [4, 1, 8], target: [0, 0.5, 0] },
  'atp-synthase': { position: [0, -2, 6], target: [0, -1.5, 0] },
};

export default function MitochondriaStage({
  activeTopicId,
  selectedPart,
  isSpinning,
  metabolicRate,
  showElectrons,
  showProtons,
  showATP,
  cameraPreset,
  onSelectPart,
  onResetSelection,
  onCameraPresetChange,
}) {
  const controlsRef = useRef();

  useEffect(() => {
    const controls = controlsRef.current;
    const preset = CAMERA_PRESETS[cameraPreset] || CAMERA_PRESETS.overview;
    if (!controls) return;

    controls.object.position.set(...preset.position);
    controls.target.set(...preset.target);
    controls.update();
  }, [cameraPreset]);

  const handleResetView = () => {
    controlsRef.current?.reset();
    onCameraPresetChange('overview');
    onResetSelection();
  };

  return (
    <div className="stage-glow relative h-full w-full flex-1 overflow-hidden bg-[#060913]">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="absolute top-1/4 left-1/2 h-[200px] w-[400px] -translate-x-1/2 rounded-full bg-amber-400/10 blur-[80px]" />
        <div className="absolute bottom-1/4 left-1/2 h-[200px] w-[400px] -translate-x-1/2 rounded-full bg-emerald-400/10 blur-[80px]" />
        <div className="h-[460px] w-[460px] rounded-full bg-amber-500/5 blur-[110px]" />
      </div>

      <button
        type="button"
        onClick={handleResetView}
        className="pointer-events-auto absolute top-4 right-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-900/65 px-3.5 py-1.5 text-xs font-medium text-slate-200 backdrop-blur-md transition hover:border-amber-400/40 hover:bg-amber-500/15"
      >
        <RotateCcw className="h-3.5 w-3.5 text-amber-300" />
        Reset View
      </button>

      <div className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1.5 text-xs font-mono text-amber-300">
        <Activity className="h-3 w-3" />
        {metabolicRate === 0 ? 'Paused' : `${metabolicRate.toFixed(1)}× Rate`}
      </div>

      <div className="glass-card absolute top-16 left-4 z-10 rounded-xl p-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Camera Presets
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          {Object.keys(CAMERA_PRESETS).map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onCameraPresetChange(preset)}
              className={`rounded px-2 py-1.5 text-[10px] font-medium transition ${
                cameraPreset === preset
                  ? 'border border-amber-400/30 bg-amber-500/20 text-amber-300'
                  : 'bg-white/[0.04] text-slate-400 hover:text-slate-200'
              }`}
            >
              {preset === 'overview' ? 'Overview' : preset === 'etc-complexes' ? 'ETC' : 'ATPase'}
            </button>
          ))}
        </div>
      </div>

      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 10], fov: 42 }}
        onPointerMissed={onResetSelection}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[8, 10, 6]} intensity={1.2} color="#fff8e7" />
        <pointLight position={[-6, 5, 4]} intensity={2.0} color="#22d3ee" distance={20} />
        <pointLight position={[6, -5, -3]} intensity={1.8} color="#34d399" distance={20} />
        <pointLight position={[0, 0, 5]} intensity={1.0} color="#fbbf24" distance={15} />

        <Sparkles
          count={60}
          scale={[10, 12, 10]}
          size={1.5}
          speed={0.25}
          opacity={0.4}
          color="#fbbf24"
        />
        <Sparkles
          count={40}
          scale={[10, 12, 10]}
          size={1.2}
          speed={0.3}
          opacity={0.35}
          color="#34d399"
        />

        <Float speed={0.8} rotationIntensity={0.04} floatIntensity={0.15}>
          <MitochondriaScene
            activeTopicId={activeTopicId}
            selectedPartId={selectedPart?.id ?? null}
            isSpinning={isSpinning}
            metabolicRate={metabolicRate}
            showElectrons={showElectrons}
            showProtons={showProtons}
            showATP={showATP}
            onSelectPart={onSelectPart}
          />
        </Float>

        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableDamping
          dampingFactor={0.07}
          minDistance={4}
          maxDistance={18}
          minPolarAngle={Math.PI * 0.15}
          maxPolarAngle={Math.PI * 0.85}
        />
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 bottom-5 z-10 flex justify-center px-4">
        <div className="inline-flex flex-wrap items-center justify-center gap-4 rounded-full border border-white/10 bg-slate-950/65 px-4 py-2 text-[11px] text-slate-300 backdrop-blur-xl">
          <span className="inline-flex items-center gap-1.5">
            <Move3d className="h-3.5 w-3.5 text-amber-400" />
            Drag to orbit · Scroll to zoom
          </span>
          <span className="hidden h-3 w-px bg-white/15 sm:inline-block" />
          <span className="inline-flex items-center gap-1.5">
            <MousePointerClick className="h-3.5 w-3.5 text-emerald-400" />
            Click complexes, carriers, or ATP synthase to inspect
          </span>
          <span className="hidden h-3 w-px bg-white/15 sm:inline-block" />
          <span className="inline-flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-cyan-400" />
            HUD: Rate / Particles / Presets
          </span>
        </div>
      </div>
    </div>
  );
}
