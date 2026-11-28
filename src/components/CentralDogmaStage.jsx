import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sparkles } from '@react-three/drei';
import { RotateCcw, Move3d, MousePointerClick } from 'lucide-react';
import CentralDogmaScene from './CentralDogmaScene.jsx';

export default function CentralDogmaStage({
  activeTopicId,
  selectedPart,
  isSpinning,
  onSelectPart,
  onResetSelection,
}) {
  const controlsRef = useRef();

  const handleResetView = () => {
    controlsRef.current?.reset();
    onResetSelection();
  };

  return (
    <div className="stage-glow relative h-full w-full flex-1 overflow-hidden bg-[#060913]">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="absolute top-1/4 h-[360px] w-[360px] rounded-full bg-violet-500/10 blur-[110px]" />
        <div className="absolute bottom-1/4 h-[360px] w-[360px] rounded-full bg-cyan-500/10 blur-[110px]" />
      </div>

      <button
        type="button"
        onClick={handleResetView}
        className="pointer-events-auto absolute right-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-900/65 px-3.5 py-1.5 text-xs font-medium text-slate-200 backdrop-blur-md transition hover:border-violet-400/40 hover:bg-violet-500/15"
      >
        <RotateCcw className="h-3.5 w-3.5 text-violet-300" />
        Reset View
      </button>

      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0.4, 17], fov: 42 }}
        onPointerMissed={onResetSelection}
      >
        <ambientLight intensity={0.45} />
        <directionalLight position={[6, 8, 8]} intensity={1.25} color="#ede9fe" />
        <pointLight position={[-6, 5, 5]} intensity={1.8} color="#a78bfa" distance={22} />
        <pointLight position={[6, -4, 4]} intensity={1.6} color="#22d3ee" distance={22} />
        <pointLight position={[0, -3, 5]} intensity={0.8} color="#fbbf24" distance={16} />

        <Sparkles
          count={55}
          scale={[14, 10, 8]}
          size={1.4}
          speed={0.2}
          opacity={0.3}
          color="#c4b5fd"
        />

        <CentralDogmaScene
          activeTopicId={activeTopicId}
          selectedPartId={selectedPart?.id ?? null}
          isSpinning={isSpinning}
          onSelectPart={onSelectPart}
        />

        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableDamping
          dampingFactor={0.07}
          minDistance={9}
          maxDistance={28}
          minPolarAngle={Math.PI * 0.2}
          maxPolarAngle={Math.PI * 0.8}
        />
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 bottom-5 z-10 flex justify-center px-4">
        <div className="inline-flex flex-wrap items-center justify-center gap-4 rounded-full border border-white/15 bg-[#04070f]/90 px-4 py-2 text-[11px] text-slate-100 backdrop-blur-xl">
          <span className="inline-flex items-center gap-1.5">
            <Move3d className="h-3.5 w-3.5 text-violet-400" />
            Drag to orbit · Scroll to zoom
          </span>
          <span className="hidden h-3 w-px bg-white/15 sm:inline-block" />
          <span className="inline-flex items-center gap-1.5">
            <MousePointerClick className="h-3.5 w-3.5 text-cyan-400" />
            Click molecules or labels to inspect
          </span>
        </div>
      </div>
    </div>
  );
}
