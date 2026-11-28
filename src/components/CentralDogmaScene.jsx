import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  AMINO_ACID_COLORS,
  CENTRAL_DOGMA_PART_TO_TOPIC,
  DEMONSTRATION_CODONS,
  DEMONSTRATION_SEQUENCE,
  RNA_BASE_COLORS,
} from '../data/centralDogmaTopics.js';

const TAU = Math.PI * 2;
const CODON_STEP = 1.2;
const FIRST_CODON_X = -4.8;
const MRNA_Y = -2.85;
const GENE_Y = 3.15;
const TRANSCRIPTION_START_X = -4.55;
const TRANSCRIPTION_END_X = 4.45;
const MAX_AMINO_ACIDS = 8;
const NO_RAYCAST = () => null;
const UP = new THREE.Vector3(0, 1, 0);
const PART_TO_TOPIC = CENTRAL_DOGMA_PART_TO_TOPIC;

const PHASE_DURATIONS = Object.freeze({
  INITIATION: 1.15,
  APPROACH_A: 0.85,
  CODON_BIND: 0.5,
  PEPTIDE_TRANSFER: 0.9,
  TRANSLOCATE_TO_P: 0.65,
  TRANSLOCATE_TO_E: 0.5,
  EXIT_AND_RECYCLE: 0.45,
  POLYPEPTIDE_RELEASE: 1.0,
  RIBOSOME_RECYCLE: 1.8,
});

const PHASE_LABELS = Object.freeze({
  INITIATION: 'Initiator Met-tRNA in P site',
  APPROACH_A: 'A-site approach',
  CODON_BIND: 'Codon–anticodon binding',
  PEPTIDE_TRANSFER: 'Peptide transfer',
  TRANSLOCATE_TO_P: 'Translocation · A → P',
  TRANSLOCATE_TO_E: 'Translocation · P → E',
  EXIT_AND_RECYCLE: 'E-site exit and tRNA recycling',
  POLYPEPTIDE_RELEASE: 'Peptidyl-tRNA hydrolysis',
  RIBOSOME_RECYCLE: 'Polypeptide released · ribosome recycling',
});

const COMPLEMENT = Object.freeze({ A: 'U', U: 'A', G: 'C', C: 'G' });
const DNA_COMPLEMENT = Object.freeze({ A: 'T', T: 'A', G: 'C', C: 'G' });
const CODING_DNA = DEMONSTRATION_SEQUENCE.replaceAll('U', 'T');
const DNA_BASE_COLORS = Object.freeze({ ...RNA_BASE_COLORS, T: '#fbbf24' });

function codonX(index) {
  return FIRST_CODON_X + index * CODON_STEP;
}

function smooth(value) {
  return value * value * (3 - 2 * value);
}

function createTranslationState() {
  return {
    phase: 'INITIATION',
    phaseTime: 0,
    codonIndex: 0,
    pCodonIndex: 0,
    chainLength: 1,
    released: false,
    eventVersion: 0,
    time: 0,
  };
}

function resetTranslation(simulation) {
  Object.assign(simulation, createTranslationState());
  simulation.eventVersion += 1;
}

function completeTranslationPhase(simulation) {
  const current = DEMONSTRATION_CODONS[simulation.codonIndex];
  switch (simulation.phase) {
    case 'INITIATION':
      simulation.codonIndex = 1;
      simulation.phase = 'APPROACH_A';
      break;
    case 'APPROACH_A':
      simulation.phase = 'CODON_BIND';
      break;
    case 'CODON_BIND':
      simulation.phase = current.stop ? 'POLYPEPTIDE_RELEASE' : 'PEPTIDE_TRANSFER';
      break;
    case 'PEPTIDE_TRANSFER':
      simulation.chainLength = Math.min(MAX_AMINO_ACIDS, simulation.chainLength + 1);
      simulation.phase = 'TRANSLOCATE_TO_P';
      break;
    case 'TRANSLOCATE_TO_P':
      simulation.pCodonIndex = simulation.codonIndex;
      simulation.phase = 'TRANSLOCATE_TO_E';
      break;
    case 'TRANSLOCATE_TO_E':
      simulation.phase = 'EXIT_AND_RECYCLE';
      break;
    case 'EXIT_AND_RECYCLE':
      simulation.codonIndex += 1;
      simulation.phase = 'APPROACH_A';
      break;
    case 'POLYPEPTIDE_RELEASE':
      simulation.released = true;
      simulation.phase = 'RIBOSOME_RECYCLE';
      break;
    case 'RIBOSOME_RECYCLE':
      resetTranslation(simulation);
      return;
    default:
      resetTranslation(simulation);
      return;
  }
  simulation.eventVersion += 1;
}

function advanceTranslation(simulation, scaledDelta) {
  simulation.phaseTime += scaledDelta;
  let transitions = 0;
  while (
    simulation.phaseTime >= PHASE_DURATIONS[simulation.phase] &&
    transitions < 20
  ) {
    simulation.phaseTime -= PHASE_DURATIONS[simulation.phase];
    completeTranslationPhase(simulation);
    transitions += 1;
  }
}

function phaseProgress(simulation) {
  return THREE.MathUtils.clamp(
    simulation.phaseTime / PHASE_DURATIONS[simulation.phase], 0, 1
  );
}

function ribosomeX(simulation) {
  const from = codonX(simulation.pCodonIndex);
  if (simulation.phase === 'TRANSLOCATE_TO_P') {
    return THREE.MathUtils.lerp(from, codonX(simulation.codonIndex), smooth(phaseProgress(simulation)));
  }
  return from;
}

function polymeraseX(simulation) {
  const progress = (simulation.time * 0.075) % 1;
  return THREE.MathUtils.lerp(TRANSCRIPTION_START_X, TRANSCRIPTION_END_X, progress);
}

function readTelemetry(simulation) {
  const item = DEMONSTRATION_CODONS[simulation.codonIndex];
  return {
    codon: item.codon,
    aminoAcid: item.aminoAcid,
    start: Boolean(item.start),
    stop: Boolean(item.stop),
    chainLength: simulation.chainLength,
    phase: PHASE_LABELS[simulation.phase],
    released: simulation.released,
    transcriptLength: Math.max(1, Math.floor(((simulation.time * 0.075) % 1) * 36)),
  };
}

const PROCESSING_CURVE = new THREE.CatmullRomCurve3([
  new THREE.Vector3(3.0, 2.15, 0.1),
  new THREE.Vector3(4.7, 1.8, 0.2),
  new THREE.Vector3(5.2, 0.75, 0.1),
  new THREE.Vector3(4.65, -0.25, 0),
]);
const TRANSFER_CURVE = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-0.6, 0.05, 0.72),
  new THREE.Vector3(0, 0.52, 0.9),
  new THREE.Vector3(0.6, 0.05, 0.72),
]);
const EXIT_CURVE = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0.22, 0),
  new THREE.Vector3(0.08, 0.75, 0.08),
  new THREE.Vector3(0.35, 1.38, 0.15),
]);

function useSceneGeometries() {
  const geometries = useMemo(() => {
    const ribosomeProfile = [
      new THREE.Vector2(0.2, -0.75), new THREE.Vector2(0.75, -0.58),
      new THREE.Vector2(1, -0.12), new THREE.Vector2(0.92, 0.38),
      new THREE.Vector2(0.55, 0.72), new THREE.Vector2(0.12, 0.8),
    ];
    return {
      sphere: new THREE.SphereGeometry(1, 16, 12),
      particle: new THREE.SphereGeometry(1, 8, 6),
      cylinder: new THREE.CylinderGeometry(1, 1, 1, 10, 1),
      capsule: new THREE.CapsuleGeometry(0.5, 1, 4, 10),
      box: new THREE.BoxGeometry(1, 1, 1),
      ring: new THREE.TorusGeometry(1, 0.025, 6, 48),
      cone: new THREE.ConeGeometry(1, 1, 12),
      lobe: new THREE.LatheGeometry(ribosomeProfile, 28, Math.PI * 0.12, Math.PI * 1.58),
      processingPath: new THREE.TubeGeometry(PROCESSING_CURVE, 48, 0.012, 5, false),
      transferArc: new THREE.TubeGeometry(TRANSFER_CURVE, 28, 0.018, 5, false),
      exitTunnel: new THREE.TubeGeometry(EXIT_CURVE, 28, 0.12, 10, false),
    };
  }, []);
  useEffect(() => () => {
    Object.values(geometries).forEach((geometry) => geometry.dispose());
  }, [geometries]);
  return geometries;
}

function useDynamicInstances(ref, radius = 18) {
  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return undefined;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.boundingSphere = new THREE.Sphere(new THREE.Vector3(), radius);
    return () => mesh.dispose();
  }, [radius, ref]);
}

const InspectionContext = React.createContext(null);

function usePart(partKey) {
  const context = useContext(InspectionContext);
  const topicId = PART_TO_TOPIC[partKey];
  const active = context.activeTopicId === topicId;
  const selected = context.selectedPartId === partKey;
  const hovered = context.hoveredPart === partKey;
  const handlers = useMemo(() => ({
    onClick: (event) => {
      event.stopPropagation();
      context.onSelectPart?.(topicId, null);
    },
    onPointerOver: (event) => {
      event.stopPropagation();
      context.setHoveredPart(partKey);
    },
    onPointerOut: (event) => {
      event.stopPropagation();
      context.setHoveredPart((current) => current === partKey ? null : current);
    },
  }), [context, partKey, topicId]);
  return { partKey, topicId, active, selected, hovered, handlers };
}

function usePartMaterials(part, color, accentColor, options = {}) {
  const { bodyOpacity = 1, roughness = 0.28 } = options;
  const materials = useMemo(() => ({
    body: new THREE.MeshStandardMaterial({
      color, emissive: color, emissiveIntensity: 0.4, roughness, metalness: 0.28,
      transparent: bodyOpacity < 1, opacity: bodyOpacity, depthWrite: bodyOpacity >= 1,
      side: THREE.DoubleSide,
    }),
    core: new THREE.MeshStandardMaterial({
      color: '#091522', emissive: color, emissiveIntensity: 0.32,
      roughness: 0.38, metalness: 0.42, side: THREE.DoubleSide,
    }),
    accent: new THREE.MeshStandardMaterial({
      color: accentColor, emissive: accentColor, emissiveIntensity: 0.9,
      roughness: 0.2, metalness: 0.2,
    }),
    halo: new THREE.MeshBasicMaterial({
      color: accentColor, transparent: true, opacity: 0.48,
      depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
    }),
    instances: new THREE.MeshStandardMaterial({
      color: '#ffffff', emissive: '#164e63', emissiveIntensity: 0.35,
      roughness: 0.3, metalness: 0.15,
    }),
  }), [accentColor, bodyOpacity, color, roughness]);
  useEffect(() => {
    const emphasis = part.selected ? 1 : part.hovered ? 0.82 : part.active ? 0.5 : 0;
    materials.body.emissiveIntensity = 0.4 + emphasis;
    materials.core.emissiveIntensity = 0.32 + emphasis * 0.8;
    materials.accent.emissiveIntensity = 0.9 + emphasis * 1.2;
    materials.instances.emissiveIntensity = 0.35 + emphasis * 0.65;
    materials.halo.opacity = 0.3 + emphasis * 0.5;
  }, [materials, part.active, part.hovered, part.selected]);
  useEffect(() => () => {
    Object.values(materials).forEach((material) => material.dispose());
  }, [materials]);
  return materials;
}

function setInstance(dummy, mesh, index, position, scale, rotation = null) {
  dummy.position.copy(position);
  dummy.scale.set(scale[0], scale[1], scale[2]);
  dummy.rotation.set(rotation?.[0] ?? 0, rotation?.[1] ?? 0, rotation?.[2] ?? 0);
  dummy.updateMatrix();
  mesh.setMatrixAt(index, dummy.matrix);
}

function setBetween(dummy, mesh, index, start, end, radius, direction) {
  direction.subVectors(end, start);
  const length = direction.length();
  dummy.position.copy(start).add(end).multiplyScalar(0.5);
  dummy.scale.set(radius, length, radius);
  dummy.quaternion.setFromUnitVectors(UP, direction.normalize());
  dummy.updateMatrix();
  mesh.setMatrixAt(index, dummy.matrix);
}

function SelectionHalo({ geometries, material, radius = 0.9, position, visible, scale = null }) {
  if (!visible) return null;
  return (
    <mesh geometry={geometries.ring} material={material} position={position}
      scale={scale ?? [radius, radius, radius]} raycast={NO_RAYCAST} renderOrder={20} />
  );
}

function SceneLabel({ text, position, partKey = null, scale = 1, accent = null }) {
  const context = useContext(InspectionContext);
  if (!context.showLabels) return null;
  const className = 'rounded-full bg-[#04070f]/95 border border-white/25 text-white font-bold whitespace-nowrap px-2 py-1 text-[10px] leading-none shadow-[0_2px_12px_rgba(0,0,0,0.85)]';
  const content = (
    <span className="inline-flex items-center gap-1.5">
      {accent && <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />}
      {text}
    </span>
  );
  return (
    <Html center position={position} distanceFactor={10 * scale} zIndexRange={[6, 0]}>
      {partKey ? (
        <button type="button" aria-label={`Inspect ${text}`}
          className={`${className} cursor-pointer hover:border-white/50`}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            context.onSelectPart?.(PART_TO_TOPIC[partKey], null);
          }}
          onPointerEnter={() => context.setHoveredPart(partKey)}
          onPointerLeave={() => context.setHoveredPart((current) => current === partKey ? null : current)}>
          {content}
        </button>
      ) : (
        <span className={`${className} pointer-events-none select-none`}>{content}</span>
      )}
    </Html>
  );
}

function writeDnaPoint(target, x, index, strand, polymerasePosition) {
  const distance = Math.abs(x - polymerasePosition);
  const open = 1 - THREE.MathUtils.smoothstep(distance, 0.62, 1.35);
  const direction = strand === 'coding' ? 1 : -1;
  const y = THREE.MathUtils.lerp(direction * 0.18, direction * 0.62, open);
  const z = Math.sin(index * 0.68 + (strand === 'coding' ? 0 : Math.PI)) * 0.25 * (1 - open);
  target.set(x, GENE_Y + y, z);
  return open;
}

const GENE_BASE_COUNT = 40;
const GENE_START_X = -5.6;
const GENE_SPACING = 11.2 / (GENE_BASE_COUNT - 1);

function TranscriptionBubble({ simulationRef, geometries }) {
  const part = usePart('central-dogma-flow');
  const materials = usePartMaterials(part, '#a78bfa', '#22d3ee');
  const codingRef = useRef();
  const templateRef = useRef();
  const linksRef = useRef();
  const rungsRef = useRef();
  const scratch = useMemo(() => ({
    dummy: new THREE.Object3D(), direction: new THREE.Vector3(),
    coding: Array.from({ length: GENE_BASE_COUNT }, () => new THREE.Vector3()),
    template: Array.from({ length: GENE_BASE_COUNT }, () => new THREE.Vector3()),
  }), []);
  useDynamicInstances(codingRef);
  useDynamicInstances(templateRef);
  useDynamicInstances(linksRef);
  useDynamicInstances(rungsRef);
  useEffect(() => {
    if (!codingRef.current || !templateRef.current) return;
    for (let index = 0; index < GENE_BASE_COUNT; index += 1) {
      const base = CODING_DNA[index % CODING_DNA.length];
      codingRef.current.setColorAt(index, new THREE.Color(DNA_BASE_COLORS[base]));
      templateRef.current.setColorAt(index, new THREE.Color(DNA_BASE_COLORS[DNA_COMPLEMENT[base]]));
    }
    codingRef.current.instanceColor.needsUpdate = true;
    templateRef.current.instanceColor.needsUpdate = true;
  }, []);
  useFrame(() => {
    if (!codingRef.current || !templateRef.current || !linksRef.current || !rungsRef.current) return;
    const { dummy, direction, coding, template } = scratch;
    const polX = polymeraseX(simulationRef.current);
    for (let index = 0; index < GENE_BASE_COUNT; index += 1) {
      const x = GENE_START_X + index * GENE_SPACING;
      writeDnaPoint(coding[index], x, index, 'coding', polX);
      const open = writeDnaPoint(template[index], x, index, 'template', polX);
      setInstance(dummy, codingRef.current, index, coding[index], [0.105, 0.105, 0.105]);
      setInstance(dummy, templateRef.current, index, template[index], [0.105, 0.105, 0.105]);
      if (open < 0.94) {
        setBetween(dummy, rungsRef.current, index, coding[index], template[index], 0.018 * (1 - open), direction);
      } else {
        setInstance(dummy, rungsRef.current, index, coding[index], [0, 0, 0]);
      }
      if (index > 0) {
        setBetween(dummy, linksRef.current, index - 1, coding[index - 1], coding[index], 0.025, direction);
        setBetween(dummy, linksRef.current, GENE_BASE_COUNT - 1 + index - 1,
          template[index - 1], template[index], 0.025, direction);
      }
    }
    [codingRef, templateRef, linksRef, rungsRef].forEach((ref) => {
      ref.current.instanceMatrix.needsUpdate = true;
    });
  });
  return (
    <group {...part.handlers}>
      <instancedMesh ref={codingRef} args={[null, null, GENE_BASE_COUNT]}
        geometry={geometries.particle} material={materials.instances} frustumCulled={false} />
      <instancedMesh ref={templateRef} args={[null, null, GENE_BASE_COUNT]}
        geometry={geometries.particle} material={materials.instances} frustumCulled={false} />
      <instancedMesh ref={linksRef} args={[null, null, (GENE_BASE_COUNT - 1) * 2]}
        geometry={geometries.cylinder} material={materials.body} frustumCulled={false} />
      <instancedMesh ref={rungsRef} args={[null, null, GENE_BASE_COUNT]}
        geometry={geometries.cylinder} material={materials.accent} frustumCulled={false} />
      <SceneLabel text="DNA · CODING 5′→3′" position={[-4.3, 4.12, 0]} partKey="central-dogma-flow" accent="#a78bfa" />
      <SceneLabel text="TEMPLATE 3′→5′" position={[-4.3, 2.15, 0]} partKey="rna-polymerase" accent="#22d3ee" />
    </group>
  );
}

function RnaPolymerase({ simulationRef, geometries }) {
  const part = usePart('rna-polymerase');
  const materials = usePartMaterials(part, '#a78bfa', '#22d3ee', { bodyOpacity: 0.86 });
  const groupRef = useRef();
  const activeSiteRef = useRef();
  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.position.x = polymeraseX(simulationRef.current);
    const pulse = 1 + Math.sin(simulationRef.current.time * 4) * 0.1;
    activeSiteRef.current?.scale.setScalar(pulse);
  });
  return (
    <group {...part.handlers}>
      <mesh geometry={geometries.box} material={materials.core}
        position={[TRANSCRIPTION_START_X - 0.65, GENE_Y, 0]} scale={[0.48, 0.72, 0.16]} />
      <mesh geometry={geometries.ring} material={materials.accent}
        position={[TRANSCRIPTION_START_X - 0.65, GENE_Y, 0.18]} scale={[0.34, 0.34, 0.34]} />
      <SceneLabel text="PROMOTER" position={[TRANSCRIPTION_START_X - 0.65, 4.12, 0]}
        partKey="rna-polymerase" accent="#a78bfa" />
      <group ref={groupRef} position={[TRANSCRIPTION_START_X, GENE_Y, 0]}>
        <mesh geometry={geometries.sphere} material={materials.body}
          position={[-0.28, 0.1, 0]} scale={[0.62, 0.72, 0.5]} />
        <mesh geometry={geometries.sphere} material={materials.body}
          position={[0.35, 0.16, 0.02]} scale={[0.55, 0.6, 0.46]} />
        <mesh geometry={geometries.capsule} material={materials.core}
          position={[0.02, -0.48, 0.05]} rotation={[0, 0, Math.PI / 2]} scale={[0.38, 0.55, 0.36]} />
        <mesh ref={activeSiteRef} geometry={geometries.sphere} material={materials.accent}
          position={[0.1, -0.25, 0.5]} scale={[0.15, 0.15, 0.15]} />
        <SelectionHalo geometries={geometries} material={materials.halo} radius={1.05}
          position={[0, 0, 0.65]} visible={part.selected || part.hovered || part.active} />
        <SceneLabel text="RNA POLYMERASE II" position={[0, 1.02, 0]}
          partKey="rna-polymerase" accent="#22d3ee" />
      </group>
    </group>
  );
}

const NASCENT_BASE_COUNT = 36;

function NascentTranscript({ simulationRef, geometries }) {
  const part = usePart('nascent-mrna');
  const materials = usePartMaterials(part, '#22d3ee', '#34d399');
  const basesRef = useRef();
  const linksRef = useRef();
  const hybridRef = useRef();
  const scratch = useMemo(() => ({
    dummy: new THREE.Object3D(), direction: new THREE.Vector3(), template: new THREE.Vector3(),
    positions: Array.from({ length: NASCENT_BASE_COUNT }, () => new THREE.Vector3()),
  }), []);
  useDynamicInstances(basesRef);
  useDynamicInstances(linksRef);
  useDynamicInstances(hybridRef);
  useEffect(() => {
    if (!basesRef.current) return;
    for (let index = 0; index < NASCENT_BASE_COUNT; index += 1) {
      const base = DEMONSTRATION_SEQUENCE[index % DEMONSTRATION_SEQUENCE.length];
      basesRef.current.setColorAt(index, new THREE.Color(RNA_BASE_COLORS[base]));
    }
    basesRef.current.instanceColor.needsUpdate = true;
  }, []);
  useFrame(() => {
    if (!basesRef.current || !linksRef.current || !hybridRef.current) return;
    const { dummy, direction, template, positions } = scratch;
    const polX = polymeraseX(simulationRef.current);
    let visibleCount = 0;
    for (let index = 0; index < NASCENT_BASE_COUNT; index += 1) {
      const x = THREE.MathUtils.lerp(TRANSCRIPTION_START_X, TRANSCRIPTION_END_X,
        index / (NASCENT_BASE_COUNT - 1));
      const visible = x <= polX + 0.001;
      const age = Math.max(0, polX - x);
      positions[index].set(x, GENE_Y - 0.58 - Math.min(1.05, age * 0.13), 0.5 + Math.sin(index * 0.5) * 0.06);
      setInstance(dummy, basesRef.current, index, positions[index], visible ? [0.09, 0.09, 0.09] : [0, 0, 0]);
      if (visible) visibleCount += 1;
      if (index > 0 && visible && positions[index - 1].x <= polX) {
        setBetween(dummy, linksRef.current, index - 1, positions[index - 1], positions[index], 0.018, direction);
      } else if (index > 0) {
        setInstance(dummy, linksRef.current, index - 1, positions[index], [0, 0, 0]);
      }
    }
    for (let slot = 0; slot < 8; slot += 1) {
      const rnaIndex = visibleCount - 1 - slot;
      if (rnaIndex >= 0 && polX - positions[rnaIndex].x < 1.65) {
        writeDnaPoint(template, positions[rnaIndex].x, rnaIndex, 'template', polX);
        setBetween(dummy, hybridRef.current, slot, template, positions[rnaIndex], 0.018, direction);
      } else {
        setInstance(dummy, hybridRef.current, slot, positions[0], [0, 0, 0]);
      }
    }
    [basesRef, linksRef, hybridRef].forEach((ref) => { ref.current.instanceMatrix.needsUpdate = true; });
  });
  return (
    <group {...part.handlers}>
      <instancedMesh ref={basesRef} args={[null, null, NASCENT_BASE_COUNT]}
        geometry={geometries.particle} material={materials.instances} frustumCulled={false} />
      <instancedMesh ref={linksRef} args={[null, null, NASCENT_BASE_COUNT - 1]}
        geometry={geometries.cylinder} material={materials.body} frustumCulled={false} />
      <instancedMesh ref={hybridRef} args={[null, null, 8]}
        geometry={geometries.cylinder} material={materials.accent} frustumCulled={false} />
      <SceneLabel text="NASCENT RNA · 5′→3′" position={[1.9, 1.35, 0.3]}
        partKey="nascent-mrna" accent="#22d3ee" />
    </group>
  );
}

const PROCESSING_BEADS = 20;

function ProcessingTranscript({ simulationRef, geometries }) {
  const part = usePart('mrna-strand');
  const materials = usePartMaterials(part, '#34d399', '#a78bfa');
  const beadsRef = useRef();
  const capRef = useRef();
  const tailRef = useRef();
  const scratch = useMemo(() => ({
    dummy: new THREE.Object3D(), point: new THREE.Vector3(),
  }), []);
  useDynamicInstances(beadsRef);
  useEffect(() => {
    if (!beadsRef.current) return;
    for (let index = 0; index < PROCESSING_BEADS; index += 1) {
      const isIntron = index % 6 >= 4;
      const isTail = index >= 15;
      beadsRef.current.setColorAt(index, new THREE.Color(
        isTail ? '#22d3ee' : isIntron ? '#a78bfa' : '#34d399'
      ));
    }
    beadsRef.current.instanceColor.needsUpdate = true;
  }, []);
  useFrame(() => {
    if (!beadsRef.current) return;
    const { dummy, point } = scratch;
    const progress = (simulationRef.current.time * 0.1) % 1;
    for (let index = 0; index < PROCESSING_BEADS; index += 1) {
      const t = progress - index * 0.025;
      const visible = t >= 0 && t <= 1;
      PROCESSING_CURVE.getPoint(THREE.MathUtils.clamp(t, 0, 1), point);
      setInstance(dummy, beadsRef.current, index, point, visible ? [0.09, 0.09, 0.09] : [0, 0, 0]);
    }
    PROCESSING_CURVE.getPoint(progress, point);
    capRef.current?.position.copy(point);
    const tailT = progress - (PROCESSING_BEADS - 5) * 0.025;
    PROCESSING_CURVE.getPoint(THREE.MathUtils.clamp(tailT, 0, 1), point);
    tailRef.current?.position.copy(point);
    if (tailRef.current) tailRef.current.visible = tailT >= 0 && tailT <= 1;
    beadsRef.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <group {...part.handlers}>
      <mesh geometry={geometries.processingPath} material={materials.halo} raycast={NO_RAYCAST} />
      <instancedMesh ref={beadsRef} args={[null, null, PROCESSING_BEADS]}
        geometry={geometries.particle} material={materials.instances} frustumCulled={false} />
      <mesh ref={capRef} geometry={geometries.sphere} material={materials.accent} scale={[0.16, 0.16, 0.16]} />
      <mesh ref={tailRef} geometry={geometries.capsule} material={materials.body}
        rotation={[0, 0, Math.PI / 2]} scale={[0.1, 0.24, 0.1]} />
      <SceneLabel text="5′ CAP" position={[3.45, 2.6, 0]} partKey="mrna-strand" accent="#34d399" />
      <SceneLabel text="EXON / INTRON PROCESSING" position={[5.1, 1.8, 0]} partKey="mrna-strand" accent="#a78bfa" />
      <SceneLabel text="poly(A) TAIL" position={[5.15, 0.3, 0]} partKey="mrna-strand" accent="#22d3ee" />
    </group>
  );
}

function FlowArrow({ geometries, material, y }) {
  return (
    <group position={[-6.35, y, -0.4]} rotation={[0, 0, Math.PI]}>
      <mesh geometry={geometries.cylinder} material={material} position={[0, -0.18, 0]} scale={[0.035, 0.72, 0.035]} />
      <mesh geometry={geometries.cone} material={material} position={[0, 0.34, 0]} scale={[0.16, 0.32, 0.16]} />
    </group>
  );
}

function CentralDogmaFlow({ geometries }) {
  const part = usePart('central-dogma-flow');
  const materials = usePartMaterials(part, '#a78bfa', '#22d3ee');
  return (
    <group {...part.handlers}>
      <mesh geometry={geometries.ring} material={materials.halo} position={[0, 3.05, -1.1]}
        scale={[6.05, 2.05, 1]} raycast={NO_RAYCAST} />
      <FlowArrow geometries={geometries} material={materials.accent} y={1.35} />
      <FlowArrow geometries={geometries} material={materials.body} y={-1.35} />
      <SceneLabel text="NUCLEUS" position={[-4.75, 5.0, 0]} accent="#a78bfa" />
      <SceneLabel text="CYTOPLASM" position={[-4.75, -0.35, 0]} accent="#22d3ee" />
      <SceneLabel text="DNA" position={[-6.35, 4.0, 0]} partKey="central-dogma-flow" accent="#a78bfa" />
      <SceneLabel text="TRANSCRIPTION" position={[-6.35, 2.35, 0]} partKey="central-dogma-flow" accent="#22d3ee" />
      <SceneLabel text="RNA" position={[-6.35, 0.35, 0]} partKey="central-dogma-flow" accent="#34d399" />
      <SceneLabel text="TRANSLATION" position={[-6.35, -0.35, 0]} partKey="central-dogma-flow" accent="#a78bfa" />
      <SceneLabel text="PROTEIN" position={[-6.35, -3.95, 0]} partKey="polypeptide-chain" accent="#fbbf24" />
    </group>
  );
}

const MRNA_TAIL_COUNT = 8;
const MRNA_BASE_COUNT = DEMONSTRATION_SEQUENCE.length + MRNA_TAIL_COUNT;

function MatureMessengerRna({ simulationRef, geometries }) {
  const part = usePart('mrna-strand');
  const materials = usePartMaterials(part, '#34d399', '#22d3ee');
  const basesRef = useRef();
  const linksRef = useRef();
  const currentCodonRef = useRef();
  const positions = useMemo(() => {
    const points = [];
    DEMONSTRATION_CODONS.forEach((item, codonIndex) => {
      item.codon.split('').forEach((base, baseIndex) => {
        points.push({ base, point: new THREE.Vector3(codonX(codonIndex) + (baseIndex - 1) * 0.3, MRNA_Y, 0) });
      });
    });
    for (let index = 0; index < MRNA_TAIL_COUNT; index += 1) {
      points.push({ base: 'A', point: new THREE.Vector3(codonX(8) + 0.85 + index * 0.23, MRNA_Y, 0) });
    }
    return points;
  }, []);
  const scratch = useMemo(() => ({ dummy: new THREE.Object3D(), direction: new THREE.Vector3() }), []);
  useDynamicInstances(basesRef);
  useDynamicInstances(linksRef);
  useEffect(() => {
    if (!basesRef.current || !linksRef.current) return;
    const { dummy, direction } = scratch;
    positions.forEach(({ base, point }, index) => {
      setInstance(dummy, basesRef.current, index, point, [0.09, 0.09, 0.09]);
      basesRef.current.setColorAt(index, new THREE.Color(RNA_BASE_COLORS[base]));
      if (index > 0) {
        setBetween(dummy, linksRef.current, index - 1, positions[index - 1].point, point, 0.018, direction);
      }
    });
    basesRef.current.instanceMatrix.needsUpdate = true;
    basesRef.current.instanceColor.needsUpdate = true;
    linksRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, scratch]);
  useFrame(() => {
    if (currentCodonRef.current) {
      currentCodonRef.current.position.x = codonX(simulationRef.current.codonIndex);
    }
  });
  return (
    <group {...part.handlers}>
      <instancedMesh ref={basesRef} args={[null, null, MRNA_BASE_COUNT]}
        geometry={geometries.particle} material={materials.instances} frustumCulled={false} />
      <instancedMesh ref={linksRef} args={[null, null, MRNA_BASE_COUNT - 1]}
        geometry={geometries.cylinder} material={materials.body} frustumCulled={false} />
      <mesh geometry={geometries.sphere} material={materials.accent}
        position={[FIRST_CODON_X - 0.68, MRNA_Y, 0]} scale={[0.16, 0.16, 0.16]} />
      <mesh ref={currentCodonRef} geometry={geometries.ring} material={materials.halo}
        position={[FIRST_CODON_X, MRNA_Y, 0.08]} scale={[0.5, 0.28, 0.5]} raycast={NO_RAYCAST} />
      <SceneLabel text="5′ CAP" position={[FIRST_CODON_X - 0.75, MRNA_Y + 0.42, 0]} partKey="mrna-strand" accent="#34d399" />
      <SceneLabel text="poly(A)" position={[codonX(8) + 1.55, MRNA_Y - 0.42, 0]} partKey="mrna-strand" accent="#22d3ee" />
      {DEMONSTRATION_CODONS.map((item, index) => (
        <SceneLabel key={item.codon} text={`${item.codon} · ${item.aminoAcid}`}
          position={[codonX(index), MRNA_Y - 0.43, 0]} partKey="mrna-strand" scale={0.85}
          accent={item.stop ? '#f472b6' : item.start ? '#34d399' : '#22d3ee'} />
      ))}
    </group>
  );
}

const RIBOSOME_Y = -1.82;

function RibosomeComplex({ simulationRef, geometries }) {
  const part = usePart('ribosome');
  const materials = usePartMaterials(part, '#a78bfa', '#22d3ee', { bodyOpacity: 0.4 });
  const groupRef = useRef();
  const pocketMaterials = useMemo(() => ['#22d3ee', '#fbbf24', '#a78bfa'].map((color) =>
    new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.9, roughness: 0.24 })
  ), []);
  useEffect(() => () => pocketMaterials.forEach((material) => material.dispose()), [pocketMaterials]);
  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.position.x = ribosomeX(simulationRef.current);
    const recycling = simulationRef.current.phase === 'RIBOSOME_RECYCLE';
    const progress = recycling ? phaseProgress(simulationRef.current) : 0;
    const scale = 1 - Math.sin(progress * Math.PI) * 0.12;
    groupRef.current.scale.setScalar(scale);
  });
  return (
    <group ref={groupRef} position={[FIRST_CODON_X, RIBOSOME_Y, 0]} {...part.handlers}>
      <mesh geometry={geometries.lobe} material={materials.body}
        position={[0, 0.57, 0]} scale={[1.5, 1.0, 1.05]} />
      <mesh geometry={geometries.lobe} material={materials.core}
        position={[0, -0.72, -0.02]} rotation={[Math.PI, 0, 0]} scale={[1.65, 0.55, 0.95]} />
      <mesh geometry={geometries.sphere} material={materials.body}
        position={[-1.05, 0.32, -0.1]} scale={[0.48, 0.6, 0.58]} />
      <mesh geometry={geometries.sphere} material={materials.body}
        position={[1.02, 0.25, -0.12]} scale={[0.45, 0.55, 0.54]} />
      <mesh geometry={geometries.exitTunnel} material={materials.accent}
        position={[0, 0.15, 0]} raycast={NO_RAYCAST} />
      {[-CODON_STEP, 0, CODON_STEP].map((x, index) => (
        <group key={x} position={[x, -0.55, 0.65]}>
          <mesh geometry={geometries.ring} material={pocketMaterials[index]} scale={[0.32, 0.24, 0.32]} />
          <mesh geometry={geometries.sphere} material={pocketMaterials[index]} scale={[0.07, 0.07, 0.07]} />
        </group>
      ))}
      <SceneLabel text="E · EXIT" position={[-CODON_STEP, 0.25, 1]} partKey="trna" accent="#22d3ee" />
      <SceneLabel text="P · PEPTIDYL" position={[0, 0.25, 1]} partKey="trna" accent="#fbbf24" />
      <SceneLabel text="A · AMINOACYL" position={[CODON_STEP, 0.25, 1]} partKey="trna" accent="#a78bfa" />
      <SceneLabel text="60S · LARGE SUBUNIT · CUTAWAY" position={[0, 1.65, 0]} partKey="ribosome" accent="#a78bfa" />
      <SceneLabel text="40S · SMALL SUBUNIT" position={[2.25, -0.8, 0]} partKey="ribosome" accent="#22d3ee" />
      <SelectionHalo geometries={geometries} material={materials.halo}
        position={[0, 0.15, 1.15]} scale={[1.85, 1.3, 1]} visible={part.selected || part.hovered || part.active} />
    </group>
  );
}

function PeptidylTransferaseCenter({ simulationRef, geometries }) {
  const part = usePart('peptidyl-center');
  const materials = usePartMaterials(part, '#fbbf24', '#f472b6');
  const groupRef = useRef();
  const beadRef = useRef();
  const centerRef = useRef();
  const point = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    const simulation = simulationRef.current;
    if (groupRef.current) groupRef.current.position.x = ribosomeX(simulation);
    const transferring = simulation.phase === 'PEPTIDE_TRANSFER';
    if (beadRef.current) {
      beadRef.current.visible = transferring;
      if (transferring) TRANSFER_CURVE.getPoint(smooth(phaseProgress(simulation)), point);
      if (transferring) beadRef.current.position.copy(point);
    }
    centerRef.current?.scale.setScalar(1 + Math.sin(simulation.time * 5) * 0.1);
  });
  return (
    <group ref={groupRef} position={[FIRST_CODON_X, RIBOSOME_Y, 0]} {...part.handlers}>
      <mesh geometry={geometries.transferArc} material={materials.halo} raycast={NO_RAYCAST} />
      <mesh ref={centerRef} geometry={geometries.sphere} material={materials.accent}
        position={[0, 0.1, 0.72]} scale={[0.2, 0.2, 0.2]} />
      <mesh ref={beadRef} geometry={geometries.sphere} material={materials.body}
        scale={[0.12, 0.12, 0.12]} />
      <SceneLabel text="PEPTIDYL-TRANSFERASE CENTER" position={[0, 1.05, 0.8]} partKey="peptidyl-center" accent="#fbbf24" />
      <SelectionHalo geometries={geometries} material={materials.halo} radius={0.52}
        position={[0, 0.12, 0.8]} visible={part.selected || part.hovered || part.active} />
    </group>
  );
}

function assignTrnaSlot(slots, slotIndex, codonIndex, site, xOffset = 0, yOffset = 0, aminoScale = 0) {
  const slot = slots[slotIndex];
  slot.codonIndex = codonIndex;
  slot.site = site;
  slot.x = codonX(codonIndex) + xOffset;
  slot.yOffset = yOffset;
  slot.aminoScale = aminoScale;
}

function writeTrnaSlots(simulation, slots) {
  const phase = simulation.phase;
  const progress = phaseProgress(simulation);
  let count = 0;
  if (phase === 'INITIATION') {
    assignTrnaSlot(slots, count++, 0, 'P');
    return count;
  }
  if (phase === 'RIBOSOME_RECYCLE') {
    assignTrnaSlot(slots, count++, 7, 'P', -progress * 1.8, -progress * 0.7);
    if (progress < 0.7) assignTrnaSlot(slots, count++, 6, 'E', -progress * 2.2, -progress * 0.8);
    return count;
  }
  assignTrnaSlot(slots, count++, simulation.pCodonIndex, 'P');
  if (simulation.pCodonIndex > 0) {
    let exit = 0;
    if (phase === 'TRANSLOCATE_TO_E') exit = progress * 0.55;
    if (phase === 'EXIT_AND_RECYCLE') exit = 0.55 + progress * 0.45;
    assignTrnaSlot(slots, count++, simulation.pCodonIndex - 1, 'E', -exit * 1.5, -exit * 0.8);
  }
  const current = DEMONSTRATION_CODONS[simulation.codonIndex];
  const aSitePhases = ['APPROACH_A', 'CODON_BIND', 'PEPTIDE_TRANSFER', 'TRANSLOCATE_TO_P'];
  if (!current.stop && aSitePhases.includes(phase)) {
    const approach = phase === 'APPROACH_A' ? 1 - smooth(progress) : 0;
    const aminoScale = phase === 'PEPTIDE_TRANSFER' ? 1 - smooth(progress) :
      ['APPROACH_A', 'CODON_BIND'].includes(phase) ? 1 : 0;
    assignTrnaSlot(slots, count++, simulation.codonIndex, 'A', approach * 2.2, approach * 1.2, aminoScale);
  }
  return count;
}

function TrnaShuttle({ simulationRef, geometries }) {
  const part = usePart('trna');
  const materials = usePartMaterials(part, '#22d3ee', '#34d399', { bodyOpacity: 0.9 });
  const stemsRef = useRef();
  const loopsRef = useRef();
  const aminoRef = useRef();
  const anticodonRef = useRef();
  const haloRef = useRef();
  const startRef = useRef();
  const labelRef = useRef();
  const scratch = useMemo(() => ({
    dummy: new THREE.Object3D(), direction: new THREE.Vector3(), color: new THREE.Color(),
    start: new THREE.Vector3(), end: new THREE.Vector3(), position: new THREE.Vector3(),
    slots: Array.from({ length: 3 }, () => ({ codonIndex: 0, site: 'P', x: 0, yOffset: 0, aminoScale: 0 })),
  }), []);
  useDynamicInstances(stemsRef);
  useDynamicInstances(loopsRef);
  useDynamicInstances(aminoRef);
  useDynamicInstances(anticodonRef);
  useFrame(() => {
    if (!stemsRef.current || !loopsRef.current || !aminoRef.current || !anticodonRef.current) return;
    const simulation = simulationRef.current;
    const { dummy, direction, color, start, end, position, slots } = scratch;
    const count = writeTrnaSlots(simulation, slots);
    for (let slotIndex = 0; slotIndex < 3; slotIndex += 1) {
      const slot = slots[slotIndex];
      const visible = slotIndex < count;
      const x = visible ? slot.x : 0;
      const y = visible ? slot.yOffset : 0;
      const scale = visible ? 1 : 0;
      start.set(x, -2.35 + y, 0.75);
      end.set(x, -1.22 + y, 0.75);
      if (visible) setBetween(dummy, stemsRef.current, slotIndex * 2, start, end, 0.055, direction);
      else setInstance(dummy, stemsRef.current, slotIndex * 2, start, [0, 0, 0]);
      start.set(x, -1.78 + y, 0.75);
      end.set(x + 0.58, -1.78 + y, 0.75);
      if (visible) setBetween(dummy, stemsRef.current, slotIndex * 2 + 1, start, end, 0.05, direction);
      else setInstance(dummy, stemsRef.current, slotIndex * 2 + 1, start, [0, 0, 0]);
      position.set(x + 0.58, -1.47 + y, 0.75);
      setInstance(dummy, loopsRef.current, slotIndex, position, [0.25 * scale, 0.32 * scale, 0.25 * scale]);
      position.set(x, -1.06 + y, 0.75);
      const aminoScale = visible ? slot.aminoScale * 0.15 : 0;
      setInstance(dummy, aminoRef.current, slotIndex, position, [aminoScale, aminoScale, aminoScale]);
      if (visible) {
        const item = DEMONSTRATION_CODONS[slot.codonIndex];
        aminoRef.current.setColorAt(slotIndex, color.set(AMINO_ACID_COLORS[item.property]));
      }
      for (let baseIndex = 0; baseIndex < 3; baseIndex += 1) {
        const instanceIndex = slotIndex * 3 + baseIndex;
        position.set(x + (baseIndex - 1) * 0.21, -2.61 + y, 0.75);
        setInstance(dummy, anticodonRef.current, instanceIndex, position,
          visible ? [0.065, 0.065, 0.065] : [0, 0, 0]);
        if (visible) {
          const base = DEMONSTRATION_CODONS[slot.codonIndex].codon[baseIndex];
          anticodonRef.current.setColorAt(instanceIndex, color.set(RNA_BASE_COLORS[COMPLEMENT[base]]));
        }
      }
    }
    [stemsRef, loopsRef, aminoRef, anticodonRef].forEach((ref) => {
      ref.current.instanceMatrix.needsUpdate = true;
    });
    aminoRef.current.instanceColor.needsUpdate = true;
    anticodonRef.current.instanceColor.needsUpdate = true;
    const focus = slots.find((slot, index) => index < count && slot.site === 'A') ?? slots[0];
    if (haloRef.current) haloRef.current.position.set(focus.x, -1.7 + focus.yOffset, 0.82);
    if (labelRef.current) labelRef.current.position.set(focus.x, -0.72 + focus.yOffset, 0.8);
    if (startRef.current) startRef.current.visible = simulation.phase === 'INITIATION';
  });
  return (
    <group {...part.handlers}>
      <instancedMesh ref={stemsRef} args={[null, null, 6]} geometry={geometries.cylinder} material={materials.body} frustumCulled={false} />
      <instancedMesh ref={loopsRef} args={[null, null, 3]} geometry={geometries.ring} material={materials.accent} frustumCulled={false} />
      <instancedMesh ref={aminoRef} args={[null, null, 3]} geometry={geometries.sphere} material={materials.instances} frustumCulled={false} />
      <instancedMesh ref={anticodonRef} args={[null, null, 9]} geometry={geometries.particle} material={materials.instances} frustumCulled={false} />
      <mesh ref={startRef} geometry={geometries.ring} material={materials.accent}
        position={[FIRST_CODON_X, -1.72, 0.82]} scale={[0.48, 0.85, 0.48]} />
      <group ref={haloRef}>
        <SelectionHalo geometries={geometries} material={materials.halo} radius={0.62}
          position={[0, 0, 0]} visible={part.selected || part.hovered || part.active} />
      </group>
      <group ref={labelRef}>
        <SceneLabel text="tRNA · CCA ACCEPTOR + ANTICODON" position={[0, 0, 0]} partKey="trna" accent="#34d399" />
      </group>
      <SceneLabel text="ANTICODON 3′→5′" position={[FIRST_CODON_X - 1.8, MRNA_Y + 0.28, 0.7]} partKey="trna" accent="#22d3ee" />
    </group>
  );
}

function PolypeptideChain({ simulationRef, geometries }) {
  const part = usePart('polypeptide-chain');
  const materials = usePartMaterials(part, '#fbbf24', '#f472b6');
  const residuesRef = useRef();
  const bondsRef = useRef();
  const labelRef = useRef();
  const haloRef = useRef();
  const scratch = useMemo(() => ({
    dummy: new THREE.Object3D(), direction: new THREE.Vector3(),
    positions: Array.from({ length: MAX_AMINO_ACIDS }, () => new THREE.Vector3()),
  }), []);
  useDynamicInstances(residuesRef);
  useDynamicInstances(bondsRef);
  useEffect(() => {
    if (!residuesRef.current) return;
    for (let index = 0; index < MAX_AMINO_ACIDS; index += 1) {
      residuesRef.current.setColorAt(index,
        new THREE.Color(AMINO_ACID_COLORS[DEMONSTRATION_CODONS[index].property]));
    }
    residuesRef.current.instanceColor.needsUpdate = true;
  }, []);
  useFrame(() => {
    if (!residuesRef.current || !bondsRef.current) return;
    const simulation = simulationRef.current;
    const { dummy, direction, positions } = scratch;
    const length = simulation.chainLength;
    const currentRibosomeX = ribosomeX(simulation);
    const release = simulation.released ? phaseProgress(simulation) : 0;
    const fold = length / MAX_AMINO_ACIDS;
    for (let index = 0; index < MAX_AMINO_ACIDS; index += 1) {
      const distance = length - 1 - index;
      const phase = index * 0.85 + simulation.time * 0.65;
      positions[index].set(
        currentRibosomeX + distance * 0.34 + Math.sin(phase) * 0.13 * fold - release * 0.9,
        -0.4 + distance * 0.23 + Math.cos(phase * 0.8) * 0.1 * fold + release * 0.9,
        0.75 + Math.sin(phase * 0.7) * 0.1
      );
      const visible = index < length;
      const scale = visible ? 0.14 : 0;
      setInstance(dummy, residuesRef.current, index, positions[index], [scale, scale, scale]);
      if (index > 0 && index < length) {
        setBetween(dummy, bondsRef.current, index - 1, positions[index - 1], positions[index], 0.035, direction);
      } else if (index > 0) {
        setInstance(dummy, bondsRef.current, index - 1, positions[index], [0, 0, 0]);
      }
    }
    residuesRef.current.instanceMatrix.needsUpdate = true;
    bondsRef.current.instanceMatrix.needsUpdate = true;
    const labelX = currentRibosomeX + (length - 1) * 0.17 - release * 0.9;
    const labelY = 0.42 + (length - 1) * 0.1 + release * 0.9;
    labelRef.current?.position.set(labelX, labelY, 0.8);
    haloRef.current?.position.set(labelX, labelY - 0.35, 0.8);
  });
  return (
    <group {...part.handlers}>
      <instancedMesh ref={residuesRef} args={[null, null, MAX_AMINO_ACIDS]}
        geometry={geometries.sphere} material={materials.instances} frustumCulled={false} />
      <instancedMesh ref={bondsRef} args={[null, null, MAX_AMINO_ACIDS - 1]}
        geometry={geometries.cylinder} material={materials.accent} frustumCulled={false} />
      <group ref={labelRef}>
        <SceneLabel text="N → C · POLYPEPTIDE" position={[0, 0, 0]} partKey="polypeptide-chain" accent="#fbbf24" />
      </group>
      <group ref={haloRef}>
        <SelectionHalo geometries={geometries} material={materials.halo} radius={0.8}
          position={[0, 0, 0]} scale={[1.25, 0.65, 1]} visible={part.selected || part.hovered || part.active} />
      </group>
    </group>
  );
}

export default function CentralDogmaScene({
  activeTopicId,
  selectedPartId,
  isSpinning,
  onSelectPart,
}) {
  const rootRef = useRef();
  const geometries = useSceneGeometries();
  const simulationRef = useRef(createTranslationState());
  const [hoveredPart, setHoveredPart] = useState(null);
  const inspection = useMemo(() => ({
    activeTopicId,
    selectedPartId,
    hoveredPart,
    setHoveredPart,
    onSelectPart,
    showLabels: true,
  }), [activeTopicId, hoveredPart, onSelectPart, selectedPartId]);

  useEffect(() => {
    document.body.style.cursor = hoveredPart ? 'pointer' : 'auto';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hoveredPart]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const simulation = simulationRef.current;
    simulation.time += dt;
    advanceTranslation(simulation, dt);
    if (rootRef.current && isSpinning) rootRef.current.rotation.y += dt * 0.04;
  }, -100);

  return (
    <InspectionContext.Provider value={inspection}>
      <group ref={rootRef} name="central-dogma" rotation={[0.02, -0.04, 0]}>
        <CentralDogmaFlow geometries={geometries} />
        <TranscriptionBubble simulationRef={simulationRef} geometries={geometries} />
        <RnaPolymerase simulationRef={simulationRef} geometries={geometries} />
        <NascentTranscript simulationRef={simulationRef} geometries={geometries} />
        <ProcessingTranscript simulationRef={simulationRef} geometries={geometries} />
        <MatureMessengerRna simulationRef={simulationRef} geometries={geometries} />
        <RibosomeComplex simulationRef={simulationRef} geometries={geometries} />
        <PeptidylTransferaseCenter simulationRef={simulationRef} geometries={geometries} />
        <TrnaShuttle simulationRef={simulationRef} geometries={geometries} />
        <PolypeptideChain simulationRef={simulationRef} geometries={geometries} />
      </group>
    </InspectionContext.Provider>
  );
}

