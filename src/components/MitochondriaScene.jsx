import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  MITOCHONDRIA_SEQUENCE,
  MITOCHONDRIA_TOPICS,
} from '../data/mitochondriaTopics.js';

const TAU = Math.PI * 2;
const ATP_STEP = TAU / 3;
const ROTOR_REVOLUTIONS_PER_SECOND = 0.42;
const NO_RAYCAST = () => null;

const PART_TO_TOPIC = Object.freeze(
  Object.fromEntries(MITOCHONDRIA_TOPICS.map((topic) => [topic.partKey, topic.id]))
);
const POSITIONS = Object.freeze(
  Object.fromEntries(MITOCHONDRIA_SEQUENCE.map((item) => [item.id, item.position]))
);

const CI_HELICES = [
  [-0.42, -0.42], [-0.14, -0.48], [0.16, -0.44], [0.42, -0.3],
  [-0.4, 0.02], [-0.1, -0.02], [0.2, 0.04], [0.4, 0.22],
];
const CIII_HELICES = [
  [-0.18, -0.25], [0.12, -0.24], [-0.2, 0.08], [0.12, 0.1], [0, 0.34],
];
const CIV_HELICES = Array.from({ length: 10 }, (_, index) => {
  const angle = (index / 10) * TAU;
  return [Math.cos(angle) * 0.42, Math.sin(angle) * 0.4];
});

const ELECTRON_CURVE = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-5.55, -1.65, -1.35),
  new THREE.Vector3(-4.65, -0.9, -1.05),
  new THREE.Vector3(-4.35, -0.15, -0.05),
  new THREE.Vector3(-2.25, 0.28, 0.02),
  new THREE.Vector3(0.48, -0.05, 0.02),
  new THREE.Vector3(0.95, 0.5, 0.7),
  new THREE.Vector3(2.5, 0.42, 0.72),
  new THREE.Vector3(2.85, -0.05, 0.02),
  new THREE.Vector3(3.35, -0.8, -0.85),
]);

function membraneHeight(x, y) {
  return Math.sin(x * 0.92) * 0.24 + Math.cos(y * 1.45 + x * 0.32) * 0.065;
}

function createMembraneGeometry(leafletOffset) {
  const geometry = new THREE.PlaneGeometry(12.8, 6.2, 64, 28);
  const positions = geometry.attributes.position;
  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const y = positions.getY(index);
    positions.setZ(index, membraneHeight(x, y) + leafletOffset);
  }
  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

function seededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function useSceneGeometries() {
  const geometries = useMemo(() => {
    const lobeProfile = [
      new THREE.Vector2(0, -0.65), new THREE.Vector2(0.27, -0.56),
      new THREE.Vector2(0.42, -0.15), new THREE.Vector2(0.38, 0.3),
      new THREE.Vector2(0.2, 0.59), new THREE.Vector2(0, 0.67),
    ];
    const gammaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0.28), new THREE.Vector3(0.04, 0, -0.25),
      new THREE.Vector3(-0.13, 0.06, -0.82), new THREE.Vector3(0.15, -0.04, -1.42),
    ]);
    return {
      sphere: new THREE.SphereGeometry(1, 16, 12),
      particle: new THREE.SphereGeometry(1, 7, 5),
      cylinder: new THREE.CylinderGeometry(1, 1, 1, 12, 1),
      capsule: new THREE.CapsuleGeometry(0.5, 1, 4, 10),
      box: new THREE.BoxGeometry(1, 1, 1),
      ring: new THREE.TorusGeometry(1, 0.018, 6, 64),
      lobe: new THREE.LatheGeometry(lobeProfile, 18),
      gamma: new THREE.TubeGeometry(gammaCurve, 32, 0.085, 8, false),
      aChannel: new THREE.CylinderGeometry(0.66, 0.66, 0.46, 24, 1, true, 0, Math.PI * 1.18),
      upperMembrane: createMembraneGeometry(0.09),
      lowerMembrane: createMembraneGeometry(-0.09),
      electronPath: new THREE.TubeGeometry(ELECTRON_CURVE, 150, 0.012, 5, false),
    };
  }, []);

  useEffect(() => () => {
    Object.values(geometries).forEach((geometry) => geometry.dispose());
  }, [geometries]);
  return geometries;
}

function useDynamicInstances(ref) {
  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return undefined;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    // Moving instances must not retain the bounding sphere of their first frame.
    mesh.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 9);
    return () => mesh.dispose();
  }, [ref]);
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
    onPointerOut: () => {
      context.setHoveredPart((current) => (current === partKey ? null : current));
    },
  }), [context, partKey, topicId]);
  return { partKey, topicId, active, selected, hovered, handlers };
}

function usePartMaterials(part, color, accentColor, options = {}) {
  const { bodyOpacity = 1, roughness = 0.28 } = options;
  const materials = useMemo(() => {
    const body = new THREE.MeshStandardMaterial({
      color, emissive: color, emissiveIntensity: 0.42, roughness, metalness: 0.3,
      transparent: bodyOpacity < 1, opacity: bodyOpacity, depthWrite: bodyOpacity >= 1,
    });
    const core = new THREE.MeshStandardMaterial({
      color: '#0b1624', emissive: color, emissiveIntensity: 0.3,
      roughness: 0.38, metalness: 0.5,
    });
    const accent = new THREE.MeshStandardMaterial({
      color: accentColor, emissive: accentColor, emissiveIntensity: 0.9,
      roughness: 0.2, metalness: 0.25,
    });
    const halo = new THREE.MeshBasicMaterial({
      color: accentColor, transparent: true, opacity: 0.5,
      depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
    });
    return { body, core, accent, halo };
  }, [accentColor, bodyOpacity, color, roughness]);

  useEffect(() => {
    const emphasis = part.selected ? 1 : part.hovered ? 0.82 : part.active ? 0.55 : 0;
    materials.body.emissiveIntensity = 0.42 + emphasis * 1.15;
    materials.core.emissiveIntensity = 0.3 + emphasis * 0.85;
    materials.accent.emissiveIntensity = 0.9 + emphasis * 1.4;
    materials.halo.opacity = 0.32 + emphasis * 0.5;
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

function SelectionHalo({ geometries, material, radius = 0.9, position, visible, scale = null }) {
  if (!visible) return null;
  return (
    <mesh geometry={geometries.ring} material={material} position={position}
      scale={scale ?? [radius, radius, radius]} raycast={NO_RAYCAST} renderOrder={20} />
  );
}

function SceneLabel({ text, color = '#a5f3fc', position, scale = 1, opacity = 0.9 }) {
  const { texture, material } = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, 512, 128);
    context.font = '600 40px Arial, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.shadowColor = color;
    context.shadowBlur = 14;
    context.fillStyle = color;
    context.fillText(text, 256, 64, 480);
    const labelTexture = new THREE.CanvasTexture(canvas);
    labelTexture.colorSpace = THREE.SRGBColorSpace;
    labelTexture.minFilter = THREE.LinearFilter;
    labelTexture.generateMipmaps = false;
    const labelMaterial = new THREE.SpriteMaterial({
      map: labelTexture, transparent: true, opacity,
      depthWrite: false, depthTest: false,
    });
    return { texture: labelTexture, material: labelMaterial };
  }, [color, opacity, text]);

  useEffect(() => () => {
    material.dispose();
    texture.dispose();
  }, [material, texture]);
  return <sprite material={material} position={position} scale={[2.25 * scale, 0.56 * scale, 1]} raycast={NO_RAYCAST} />;
}

function CristaeMembrane({ geometries }) {
  const part = usePart('cristae-membrane');
  const headsRef = useRef();
  const timeUniform = useMemo(() => ({ value: 0 }), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const heads = useMemo(() => {
    const points = [];
    for (let xIndex = 0; xIndex < 19; xIndex += 1) {
      for (let yIndex = 0; yIndex < 9; yIndex += 1) {
        const x = -6.05 + xIndex * 0.67;
        const y = -2.75 + yIndex * 0.69;
        const z = membraneHeight(x, y);
        points.push(new THREE.Vector3(x, y, z + 0.13));
        points.push(new THREE.Vector3(x, y, z - 0.13));
      }
    }
    return points;
  }, []);

  const materials = useMemo(() => {
    const makeLeaflet = (color, side, opacity) => {
      const material = new THREE.MeshStandardMaterial({
        color: '#091522', emissive: color, emissiveIntensity: 0.35,
        transparent: true, opacity, side, depthWrite: false,
        roughness: 0.3, metalness: 0.12,
      });
      material.onBeforeCompile = (shader) => {
        shader.uniforms.uMembraneTime = timeUniform;
        shader.vertexShader = `uniform float uMembraneTime;\n${shader.vertexShader}`;
        shader.vertexShader = shader.vertexShader.replace(
          '#include <begin_vertex>',
          `vec3 transformed = vec3(position);
           transformed.z += sin(uMembraneTime * 0.8 + position.y * 2.0 + position.x) * 0.018;`
        );
      };
      material.customProgramCacheKey = () => 'mitochondria-membrane-wave-v1';
      return material;
    };
    return {
      upper: makeLeaflet('#22d3ee', THREE.FrontSide, 0.5),
      lower: makeLeaflet('#a78bfa', THREE.BackSide, 0.46),
      heads: new THREE.MeshStandardMaterial({
        color: '#164e63', emissive: '#22d3ee', emissiveIntensity: 0.5,
        roughness: 0.32, metalness: 0.18,
      }),
    };
  }, [timeUniform]);

  useDynamicInstances(headsRef);
  useEffect(() => {
    const mesh = headsRef.current;
    heads.forEach((position, index) => {
      setInstance(dummy, mesh, index, position, [0.045, 0.045, 0.045]);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [dummy, heads]);
  useEffect(() => {
    const boost = part.selected ? 0.9 : part.hovered ? 0.7 : part.active ? 0.42 : 0;
    materials.upper.emissiveIntensity = 0.35 + boost;
    materials.lower.emissiveIntensity = 0.3 + boost;
    materials.heads.emissiveIntensity = 0.5 + boost;
  }, [materials, part.active, part.hovered, part.selected]);
  useEffect(() => () => {
    Object.values(materials).forEach((material) => material.dispose());
  }, [materials]);
  useFrame(({ clock }) => {
    timeUniform.value = clock.elapsedTime;
  });

  return (
    <group {...part.handlers}>
      <mesh geometry={geometries.upperMembrane} material={materials.upper} renderOrder={-2} />
      <mesh geometry={geometries.lowerMembrane} material={materials.lower} renderOrder={-3} />
      <instancedMesh ref={headsRef} args={[geometries.particle, materials.heads, heads.length]} frustumCulled={false} />
      <SelectionHalo geometries={geometries} material={materials.heads}
        position={[0, 0, -0.25]} scale={[6.35, 3.05, 1]} visible={part.selected} />
      <SceneLabel text="CRISTAE · DOUBLE BILAYER" position={[0, 3.42, 0]} scale={0.8} />
    </group>
  );
}

function ComplexI({ geometries, simulation }) {
  const part = usePart('complex-i');
  const materials = usePartMaterials(part, '#34d399', '#22d3ee');
  const rockingRef = useRef();
  useFrame(() => {
    if (rockingRef.current) rockingRef.current.rotation.x = Math.sin(simulation.time * 1.8) * 0.05;
  });

  return (
    <group position={POSITIONS['complex-i']} scale={part.selected ? 1.06 : 1} {...part.handlers}>
      <group ref={rockingRef}>
        {CI_HELICES.map(([x, y], index) => (
          <mesh key={index} geometry={geometries.cylinder} material={index % 3 === 0 ? materials.body : materials.core}
            position={[x, y, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.105, 0.95, 0.105]} />
        ))}
        <mesh geometry={geometries.capsule} material={materials.body}
          position={[-0.28, -0.62, -0.68]} rotation={[Math.PI / 2, 0, -0.35]} scale={[0.55, 0.9, 0.5]} />
        <mesh geometry={geometries.sphere} material={materials.body}
          position={[-0.62, -0.9, -1.03]} scale={[0.48, 0.38, 0.36]} />
        <mesh geometry={geometries.sphere} material={materials.core}
          position={[0.02, -0.72, -1.05]} scale={[0.4, 0.34, 0.32]} />
        <mesh geometry={geometries.sphere} material={materials.body}
          position={[0.36, -0.32, -0.72]} scale={[0.32, 0.42, 0.3]} />
        {[[-0.72, -0.95, -1.35], [-0.4, -0.78, -1.28], [-0.08, -0.63, -1.18], [0.2, -0.4, -0.94]].map((position, index) => (
          <mesh key={index} geometry={geometries.sphere} material={materials.accent}
            position={position} scale={[0.095, 0.095, 0.095]} />
        ))}
        <mesh geometry={geometries.sphere} material={materials.accent} position={[-0.72, 0.32, 0.36]} scale={[0.16, 0.16, 0.16]} />
      </group>
      <SelectionHalo geometries={geometries} material={materials.halo} radius={1.05}
        position={[0, -0.15, 0.65]} visible={part.selected || part.hovered} />
      <SceneLabel text="I · NADH" color="#6ee7b7" position={[0, 1.02, 0.45]} scale={0.62} />
    </group>
  );
}

function ComplexII({ geometries, simulation }) {
  const part = usePart('complex-ii');
  const materials = usePartMaterials(part, '#a78bfa', '#f472b6');
  const fadRef = useRef();
  useFrame(() => {
    if (fadRef.current) {
      const pulse = 1 + Math.sin(simulation.time * 2.2) * 0.1;
      fadRef.current.scale.setScalar(0.17 * pulse);
    }
  });

  return (
    <group position={POSITIONS['complex-ii']} scale={part.selected ? 1.08 : 1} {...part.handlers}>
      {[[-0.2, 0], [0.2, 0]].map(([x, y], index) => (
        <mesh key={index} geometry={geometries.cylinder} material={materials.core}
          position={[x, y, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.16, 0.78, 0.16]} />
      ))}
      <mesh geometry={geometries.sphere} material={materials.body} position={[0, -0.28, -0.52]} scale={[0.5, 0.42, 0.34]} />
      <mesh geometry={geometries.sphere} material={materials.body} position={[0.05, 0.25, -0.44]} scale={[0.34, 0.3, 0.3]} />
      <mesh ref={fadRef} geometry={geometries.sphere} material={materials.accent} position={[-0.2, -0.28, -0.84]} />
      {[[0.04, -0.12, -0.8], [0.22, 0.04, -0.66], [0.16, 0.26, -0.55]].map((position, index) => (
        <mesh key={index} geometry={geometries.sphere} material={materials.accent} position={position} scale={[0.075, 0.075, 0.075]} />
      ))}
      <SelectionHalo geometries={geometries} material={materials.halo} radius={0.72}
        position={[0, 0, 0.5]} visible={part.selected || part.hovered} />
      <SceneLabel text="II · FAD" color="#c4b5fd" position={[0, 0.92, 0.4]} scale={0.58} />
    </group>
  );
}

function RieskeDomain({ geometries, material, position, phase, simulation }) {
  const ref = useRef();
  useFrame(() => {
    if (ref.current) ref.current.rotation.y = Math.sin(simulation.time * 1.65 + phase) * 0.3;
  });
  return (
    <group ref={ref} position={position}>
      <mesh geometry={geometries.capsule} material={material} rotation={[0.3, 0, 0.25]} scale={[0.22, 0.34, 0.22]} />
      <mesh geometry={geometries.sphere} material={material} position={[0, 0.24, 0.12]} scale={[0.11, 0.11, 0.11]} />
    </group>
  );
}

function ComplexIII({ geometries, simulation }) {
  const part = usePart('complex-iii');
  const materials = usePartMaterials(part, '#f472b6', '#34d399');
  return (
    <group position={POSITIONS['complex-iii']} scale={part.selected ? 1.07 : 1} {...part.handlers}>
      {[-0.32, 0.32].map((monomerX, monomerIndex) => (
        <group key={monomerX} position={[monomerX, 0, 0]}>
          {CIII_HELICES.map(([x, y], index) => (
            <mesh key={index} geometry={geometries.cylinder} material={index % 2 ? materials.core : materials.body}
              position={[x, y, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.1, 0.9, 0.1]} />
          ))}
          <mesh geometry={geometries.sphere} material={materials.body} position={[0, 0.34, 0.45]} scale={[0.3, 0.27, 0.3]} />
          <mesh geometry={geometries.sphere} material={materials.core} position={[0, -0.3, -0.4]} scale={[0.28, 0.25, 0.28]} />
          <mesh geometry={geometries.sphere} material={materials.accent} position={[-0.13, -0.08, 0.34]} scale={[0.085, 0.085, 0.085]} />
          <mesh geometry={geometries.sphere} material={materials.accent} position={[0.15, 0.16, -0.3]} scale={[0.085, 0.085, 0.085]} />
          <mesh geometry={geometries.cylinder} material={materials.accent} position={[0, 0.42, 0.67]}
            rotation={[Math.PI / 2, 0, 0]} scale={[0.12, 0.07, 0.12]} />
          <RieskeDomain geometries={geometries} material={materials.accent}
            position={[monomerIndex ? -0.12 : 0.12, 0.58, 0.32]} phase={monomerIndex * Math.PI} simulation={simulation} />
        </group>
      ))}
      <SelectionHalo geometries={geometries} material={materials.halo} radius={1.05}
        position={[0, 0.05, 0.78]} visible={part.selected || part.hovered} />
      <SceneLabel text="III · Q-CYCLE" color="#f9a8d4" position={[0, 1.22, 0.55]} scale={0.6} />
    </group>
  );
}

function ComplexIV({ geometries, simulation }) {
  const part = usePart('complex-iv');
  const materials = usePartMaterials(part, '#fb923c', '#fbbf24');
  const binuclearRef = useRef();
  const oxygenRef = useRef();
  useFrame(() => {
    const pulse = 1 + Math.max(0, Math.sin(simulation.time * 2.5)) * 0.28;
    if (binuclearRef.current) binuclearRef.current.scale.setScalar(0.15 * pulse);
    if (oxygenRef.current) oxygenRef.current.position.z = -0.82 - ((simulation.time * 0.16) % 0.55);
  });

  return (
    <group position={POSITIONS['complex-iv']} scale={part.selected ? 1.07 : 1} {...part.handlers}>
      {CIV_HELICES.map(([x, y], index) => (
        <mesh key={index} geometry={geometries.cylinder} material={index % 3 ? materials.core : materials.body}
          position={[x, y, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.105, 0.92, 0.105]} />
      ))}
      <mesh geometry={geometries.capsule} material={materials.body} position={[0, 0, -0.22]} scale={[0.65, 0.55, 0.55]} />
      <mesh geometry={geometries.sphere} material={materials.body} position={[-0.25, 0.35, 0.42]} scale={[0.3, 0.26, 0.3]} />
      <mesh geometry={geometries.sphere} material={materials.body} position={[0.25, -0.3, -0.48]} scale={[0.3, 0.28, 0.3]} />
      <mesh geometry={geometries.cylinder} material={materials.accent} position={[-0.25, 0.38, 0.7]}
        rotation={[Math.PI / 2, 0, 0]} scale={[0.14, 0.08, 0.14]} />
      <mesh geometry={geometries.sphere} material={materials.accent} position={[0.24, 0.1, 0.35]} scale={[0.11, 0.11, 0.11]} />
      <mesh geometry={geometries.sphere} material={materials.accent} position={[-0.16, -0.12, -0.4]} scale={[0.12, 0.12, 0.12]} />
      <mesh ref={binuclearRef} geometry={geometries.sphere} material={materials.accent} position={[0.12, -0.18, -0.62]} />
      <group ref={oxygenRef} position={[0.35, -0.55, -0.9]}>
        <mesh geometry={geometries.sphere} material={materials.accent} position={[-0.06, 0, 0]} scale={[0.07, 0.07, 0.07]} />
        <mesh geometry={geometries.sphere} material={materials.accent} position={[0.06, 0, 0]} scale={[0.07, 0.07, 0.07]} />
      </group>
      <SelectionHalo geometries={geometries} material={materials.halo} radius={0.95}
        position={[0, 0, 0.72]} visible={part.selected || part.hovered} />
      <SceneLabel text="IV · O₂ → H₂O" color="#fdba74" position={[0, 1.04, 0.52]} scale={0.58} />
    </group>
  );
}

function MobileCarriers({ geometries, simulation }) {
  const part = usePart('coq-cytc');
  const coqMaterials = usePartMaterials(part, '#fbbf24', '#fde68a');
  const cytMaterials = usePartMaterials(part, '#f472b6', '#22d3ee');
  const coqRef = useRef();
  const cytRef = useRef();
  const hemeRef = useRef();
  const scratch = useMemo(() => ({
    dummy: new THREE.Object3D(), point: new THREE.Vector3(), color: new THREE.Color(),
  }), []);
  const curves = useMemo(() => ({
    fromI: new THREE.CubicBezierCurve3(
      new THREE.Vector3(-4.25, -0.12, 0), new THREE.Vector3(-3.2, 0.42, 0.08),
      new THREE.Vector3(-0.8, -0.35, -0.06), new THREE.Vector3(0.42, -0.06, 0)
    ),
    fromII: new THREE.CubicBezierCurve3(
      new THREE.Vector3(-2.65, -0.85, 0), new THREE.Vector3(-2.0, -0.5, -0.08),
      new THREE.Vector3(-0.5, 0.28, 0.08), new THREE.Vector3(0.42, -0.06, 0)
    ),
    cyt: new THREE.CubicBezierCurve3(
      new THREE.Vector3(0.95, 0.5, 0.72), new THREE.Vector3(1.35, 0.95, 0.95),
      new THREE.Vector3(2.15, 0.02, 0.55), new THREE.Vector3(2.58, 0.38, 0.72)
    ),
  }), []);
  useDynamicInstances(coqRef);
  useDynamicInstances(cytRef);
  useDynamicInstances(hemeRef);

  useFrame(() => {
    const coq = coqRef.current;
    const cyt = cytRef.current;
    const heme = hemeRef.current;
    if (!coq || !cyt || !heme) return;
    for (let index = 0; index < 12; index += 1) {
      const progress = (simulation.time * 0.1 + index / 12) % 1;
      const curve = index % 3 === 0 ? curves.fromII : curves.fromI;
      curve.getPoint(progress, scratch.point);
      const reducedPulse = 1 + Math.max(0, Math.sin(progress * Math.PI)) * 0.32;
      setInstance(scratch.dummy, coq, index, scratch.point,
        [0.105 * reducedPulse, 0.045, 0.105 * reducedPulse], [Math.PI / 2, 0, progress * TAU]);
      scratch.color.set(progress > 0.48 ? '#fde68a' : '#b45309');
      coq.setColorAt(index, scratch.color);
    }
    coq.instanceMatrix.needsUpdate = true;
    if (coq.instanceColor) coq.instanceColor.needsUpdate = true;

    for (let index = 0; index < 9; index += 1) {
      const progress = (simulation.time * 0.14 + index / 9) % 1;
      curves.cyt.getPoint(progress, scratch.point);
      scratch.point.z += Math.sin(progress * TAU + index) * 0.09;
      setInstance(scratch.dummy, cyt, index, scratch.point, [0.13, 0.13, 0.13]);
      scratch.point.z += 0.1;
      setInstance(scratch.dummy, heme, index, scratch.point,
        [0.065, 0.025, 0.065], [Math.PI / 2, 0, progress * TAU]);
    }
    cyt.instanceMatrix.needsUpdate = true;
    heme.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <group {...part.handlers}>
        <instancedMesh ref={coqRef} args={[geometries.cylinder, coqMaterials.body, 12]} frustumCulled={false} />
        <instancedMesh ref={cytRef} args={[geometries.sphere, cytMaterials.body, 9]} frustumCulled={false} />
        <instancedMesh ref={hemeRef} args={[geometries.cylinder, cytMaterials.accent, 9]} frustumCulled={false} />
        <SelectionHalo geometries={geometries} material={coqMaterials.halo} radius={0.62}
          position={POSITIONS['coq-cytc']} visible={part.selected || part.hovered} />
        <SceneLabel text="CoQ · QH₂" color="#fde68a" position={[-1.55, 0.82, 0.2]} scale={0.5} />
        <SceneLabel text="CYTOCHROME c" color="#f9a8d4" position={[1.85, 1.18, 0.8]} scale={0.46} />
      </group>
    </group>
  );
}

function ElectronFlow({ geometries, simulation, visible }) {
  const electronsRef = useRef();
  const scratch = useMemo(() => ({
    dummy: new THREE.Object3D(), point: new THREE.Vector3(), color: new THREE.Color(),
    palette: ['#22d3ee', '#34d399', '#fbbf24', '#f472b6', '#fb923c'].map((color) => new THREE.Color(color)),
  }), []);
  const materials = useMemo(() => ({
    electrons: new THREE.MeshBasicMaterial({
      color: '#ffffff', transparent: true, opacity: 0.95,
      depthWrite: false, blending: THREE.AdditiveBlending,
    }),
    path: new THREE.MeshBasicMaterial({
      color: '#22d3ee', transparent: true, opacity: 0.12,
      depthWrite: false, blending: THREE.AdditiveBlending,
    }),
  }), []);
  useDynamicInstances(electronsRef);
  useEffect(() => () => {
    Object.values(materials).forEach((material) => material.dispose());
  }, [materials]);

  useFrame(() => {
    const electrons = electronsRef.current;
    if (!electrons || !visible) return;
    for (let index = 0; index < 72; index += 1) {
      const progress = (simulation.time * 0.085 + index / 72) % 1;
      ELECTRON_CURVE.getPoint(progress, scratch.point);
      const handoff = Math.pow(1 - Math.abs(Math.sin(progress * Math.PI * 4)), 5);
      const radius = 0.035 + handoff * 0.035;
      setInstance(scratch.dummy, electrons, index, scratch.point, [radius, radius, radius]);
      const colorPosition = progress * 4;
      const colorIndex = Math.min(3, Math.floor(colorPosition));
      scratch.color.copy(scratch.palette[colorIndex]).lerp(
        scratch.palette[colorIndex + 1], colorPosition - colorIndex
      );
      electrons.setColorAt(index, scratch.color);
    }
    electrons.instanceMatrix.needsUpdate = true;
    if (electrons.instanceColor) electrons.instanceColor.needsUpdate = true;
  });

  return (
    <group visible={visible}>
      <mesh geometry={geometries.electronPath} material={materials.path} raycast={NO_RAYCAST} />
      <instancedMesh ref={electronsRef} args={[geometries.particle, materials.electrons, 72]}
        frustumCulled={false} raycast={NO_RAYCAST} />
      <SceneLabel text="NADH · e⁻ INPUT" position={[-5.15, -2.0, -1.1]} scale={0.44} />
      <SceneLabel text="e⁻ → O₂" color="#fdba74" position={[3.45, -1.25, -0.65]} scale={0.42} />
    </group>
  );
}

function ProtonSystem({ geometries, simulation, visible }) {
  const part = usePart('proton-gradient');
  const atpPart = usePart('atp-synthase');
  const materials = usePartMaterials(part, '#22d3ee', '#a5f3fc', { bodyOpacity: 0.82 });
  const pumpRef = useRef();
  const trailRef = useRef();
  const reservoirRef = useRef();
  const returnRef = useRef();
  const scratch = useMemo(() => ({ dummy: new THREE.Object3D(), point: new THREE.Vector3() }), []);
  const data = useMemo(() => {
    const random = seededRandom(441);
    const reservoir = Array.from({ length: 180 }, () => ({
      x: (random() - 0.5) * 11.7, y: (random() - 0.5) * 5.25,
      z: 0.55 + random() * 1.55, phase: random() * TAU, size: 0.022 + random() * 0.026,
    }));
    const sites = [
      { center: POSITIONS['complex-i'], count: 16 },
      { center: POSITIONS['complex-iii'], count: 16 },
      { center: POSITIONS['complex-iv'], count: 10 },
    ];
    const pumping = sites.flatMap((site) => Array.from({ length: site.count }, (_, index) => ({
      center: site.center, phase: index / site.count,
      ox: (random() - 0.5) * 0.36, oy: (random() - 0.5) * 0.4,
    })));
    return { reservoir, pumping };
  }, []);
  useDynamicInstances(pumpRef);
  useDynamicInstances(trailRef);
  useDynamicInstances(reservoirRef);
  useDynamicInstances(returnRef);

  useFrame(() => {
    const pump = pumpRef.current;
    const trail = trailRef.current;
    const reservoir = reservoirRef.current;
    const returnFlow = returnRef.current;
    if (!pump || !trail || !reservoir || !returnFlow || !visible) return;
    const fieldBoost = part.selected || part.hovered || part.active ? 1.25 : 1;
    data.reservoir.forEach((particle, index) => {
      scratch.point.set(
        particle.x + Math.sin(simulation.time * 0.35 + particle.phase) * 0.055,
        particle.y + Math.cos(simulation.time * 0.28 + particle.phase) * 0.05,
        particle.z + Math.sin(simulation.time * 0.42 + particle.phase) * 0.06
      );
      const radius = particle.size * fieldBoost;
      setInstance(scratch.dummy, reservoir, index, scratch.point, [radius, radius, radius]);
    });
    reservoir.instanceMatrix.needsUpdate = true;

    data.pumping.forEach((particle, index) => {
      const progress = (simulation.time * 0.32 + particle.phase) % 1;
      const eased = progress * progress * (3 - 2 * progress);
      scratch.point.set(
        particle.center[0] + particle.ox * (1 - progress * 0.45),
        particle.center[1] + particle.oy * (1 - progress * 0.45),
        -1.15 + eased * 2.65
      );
      const radius = 0.028 + Math.sin(progress * Math.PI) * 0.025;
      setInstance(scratch.dummy, pump, index, scratch.point, [radius, radius, radius]);
      scratch.point.z -= 0.1 + progress * 0.07;
      setInstance(scratch.dummy, trail, index, scratch.point,
        [0.012, 0.12 + progress * 0.09, 0.012], [Math.PI / 2, 0, 0]);
    });
    pump.instanceMatrix.needsUpdate = true;
    trail.instanceMatrix.needsUpdate = true;

    const atpPosition = POSITIONS['atp-synthase'];
    for (let index = 0; index < 28; index += 1) {
      const progress = (simulation.rotorAngle / TAU + index / 28) % 1;
      const angle = progress * TAU * 1.5 + index;
      const radius = 0.04 + (1 - progress) * 0.17;
      scratch.point.set(
        atpPosition[0] + Math.cos(angle) * radius,
        atpPosition[1] + Math.sin(angle) * radius,
        1.55 - progress * 3.05
      );
      setInstance(scratch.dummy, returnFlow, index, scratch.point, [0.038, 0.038, 0.038]);
    }
    returnFlow.instanceMatrix.needsUpdate = true;
  });

  return (
    <group visible={visible}>
      <group {...part.handlers}>
        <instancedMesh ref={reservoirRef} args={[geometries.particle, materials.body, 180]} frustumCulled={false} />
        <instancedMesh ref={pumpRef} args={[geometries.particle, materials.accent, 42]} frustumCulled={false} />
        <instancedMesh ref={trailRef} args={[geometries.cylinder, materials.halo, 42]} frustumCulled={false} />
        <SelectionHalo geometries={geometries} material={materials.halo} radius={2.1}
          position={[0, 0, 1.5]} visible={part.selected || part.hovered} />
        <SceneLabel text="IMS · H⁺ RESERVOIR" position={[-3.9, 2.7, 1.45]} scale={0.5} />
        <SceneLabel text="ΔΨ ≈ 180 mV · ΔpH ≈ 0.5" position={[1.25, 2.72, 1.4]} scale={0.48} />
      </group>
      <group {...atpPart.handlers}>
        <instancedMesh ref={returnRef} args={[geometries.particle, materials.body, 28]} frustumCulled={false} />
      </group>
    </group>
  );
}

function AtpSynthase({ geometries, simulation }) {
  const part = usePart('atp-synthase');
  const materials = usePartMaterials(part, '#34d399', '#22d3ee');
  const rotorRef = useRef();
  const betaStateRef = useRef([-1, -1, -1]);
  const betaMaterials = useMemo(() => Array.from({ length: 3 }, () => new THREE.MeshStandardMaterial({
    color: '#155e75', emissive: '#22d3ee', emissiveIntensity: 0.65,
    roughness: 0.25, metalness: 0.3,
  })), []);
  const betaStyles = useMemo(() => [
    { color: new THREE.Color('#164e63'), emissive: new THREE.Color('#0891b2'), name: 'Open' },
    { color: new THREE.Color('#0e7490'), emissive: new THREE.Color('#22d3ee'), name: 'Loose' },
    { color: new THREE.Color('#34d399'), emissive: new THREE.Color('#6ee7b7'), name: 'Tight' },
  ], []);
  useEffect(() => () => {
    betaMaterials.forEach((material) => material.dispose());
  }, [betaMaterials]);

  useFrame(() => {
    if (rotorRef.current) rotorRef.current.rotation.z = simulation.rotorAngle;
    const boost = part.selected || part.hovered ? 0.8 : part.active ? 0.4 : 0;
    for (let site = 0; site < 3; site += 1) {
      const state = (Math.floor(simulation.rotorAngle / ATP_STEP) + site) % 3;
      if (betaStateRef.current[site] !== state) {
        betaStateRef.current[site] = state;
        betaMaterials[site].color.copy(betaStyles[state].color);
        betaMaterials[site].emissive.copy(betaStyles[state].emissive);
        betaMaterials[site].userData.catalyticState = betaStyles[state].name;
      }
      betaMaterials[site].emissiveIntensity = 0.65 + state * 0.35 + boost;
    }
  });

  return (
    <group position={POSITIONS['atp-synthase']} scale={part.selected ? 1.07 : 1} {...part.handlers}>
      <mesh geometry={geometries.aChannel} material={materials.core} rotation={[Math.PI / 2, 0, 0.4]} />
      <group ref={rotorRef}>
        {Array.from({ length: 10 }, (_, index) => {
          const angle = (index / 10) * TAU;
          return (
            <mesh key={index} geometry={geometries.cylinder} material={materials.body}
              position={[Math.cos(angle) * 0.46, Math.sin(angle) * 0.46, 0]}
              rotation={[Math.PI / 2, 0, angle]} scale={[0.12, 0.5, 0.12]} />
          );
        })}
        <mesh geometry={geometries.gamma} material={materials.accent} />
        <mesh geometry={geometries.sphere} material={materials.accent} position={[0.15, -0.04, -1.42]} scale={[0.14, 0.14, 0.14]} />
      </group>

      {Array.from({ length: 6 }, (_, index) => {
        const angle = (index / 6) * TAU + Math.PI / 6;
        const betaIndex = Math.floor(index / 2);
        const isBeta = index % 2 === 1;
        return (
          <group key={index} position={[Math.cos(angle) * 0.49, Math.sin(angle) * 0.49, -1.12]} rotation={[0, 0, angle]}>
            <mesh geometry={geometries.lobe} material={isBeta ? betaMaterials[betaIndex] : materials.body}
              rotation={[Math.PI / 2, 0, 0]} scale={[0.72, 0.76, 0.72]} />
            {isBeta && <mesh geometry={geometries.sphere} material={materials.accent}
              position={[0, 0, -0.43]} scale={[0.07, 0.07, 0.07]} />}
          </group>
        );
      })}

      {[-0.11, 0.11].map((offset, index) => (
        <mesh key={index} geometry={geometries.cylinder} material={materials.core}
          position={[0.77 + offset, 0, -0.63]} rotation={[Math.PI / 2, 0, 0]} scale={[0.065, 1.35, 0.065]} />
      ))}
      <mesh geometry={geometries.capsule} material={materials.core} position={[0.54, 0, -1.35]} rotation={[0, 0, Math.PI / 2]} scale={[0.25, 0.55, 0.25]} />
      <mesh geometry={geometries.sphere} material={materials.body} position={[0.4, 0, -1.5]} scale={[0.28, 0.36, 0.22]} />
      <SelectionHalo geometries={geometries} material={materials.halo} radius={1.12}
        position={[0, 0, 0.66]} visible={part.selected || part.hovered} />
      <SceneLabel text="V · ATP SYNTHASE" color="#6ee7b7" position={[0, 1.2, 0.4]} scale={0.54} />
      <SceneLabel text="F₀ c-ring" position={[1.02, 0.45, 0]} scale={0.32} />
      <SceneLabel text="F₁ α₃β₃" position={[-0.95, -0.55, -1.1]} scale={0.32} />
    </group>
  );
}

function AtpSynthesisParticles({ geometries, simulation, visible }) {
  const part = usePart('energy-yield');
  const materials = usePartMaterials(part, '#34d399', '#a78bfa', { bodyOpacity: 0.94 });
  const atpRef = useRef();
  const substrateRef = useRef();
  const labelRef = useRef();
  const lastStepRef = useRef(0);
  const writeIndexRef = useRef(0);
  const particles = useMemo(() => Array.from({ length: 36 }, (_, index) => ({
    age: 2, life: 1.5, site: index % 3, drift: Math.sin(index * 12.37) * 0.09,
  })), []);
  const scratch = useMemo(() => ({
    dummy: new THREE.Object3D(), point: new THREE.Vector3(),
    start: new THREE.Vector3(), end: new THREE.Vector3(), color: new THREE.Color(),
    emerald: new THREE.Color('#6ee7b7'), indigo: new THREE.Color('#a78bfa'),
    amber: new THREE.Color('#fbbf24'), violet: new THREE.Color('#818cf8'),
  }), []);
  useDynamicInstances(atpRef);
  useDynamicInstances(substrateRef);

  useFrame((_, delta) => {
    const atp = atpRef.current;
    const substrate = substrateRef.current;
    if (!atp || !substrate) return;
    const currentStep = Math.floor(simulation.rotorAngle / ATP_STEP);
    if (!visible) {
      lastStepRef.current = currentStep;
      return;
    }
    if (currentStep > lastStepRef.current) {
      const firstStep = Math.max(lastStepRef.current + 1, currentStep - 35);
      for (let step = firstStep; step <= currentStep; step += 1) {
        const particle = particles[writeIndexRef.current];
        particle.age = 0;
        particle.site = ((step % 3) + 3) % 3;
        particle.drift = Math.sin(step * 2.17) * 0.09;
        writeIndexRef.current = (writeIndexRef.current + 1) % particles.length;
      }
      lastStepRef.current = currentStep;
    }
    const dt = Math.min(delta, 0.05) * simulation.rate;
    const atpPosition = POSITIONS['atp-synthase'];
    particles.forEach((particle, index) => {
      particle.age += dt;
      if (particle.age < particle.life) {
        const lifeProgress = particle.age / particle.life;
        const angle = Math.PI / 2 + particle.site * TAU / 3;
        scratch.point.set(
          atpPosition[0] + Math.cos(angle) * (0.49 + particle.drift * lifeProgress),
          atpPosition[1] + Math.sin(angle) * 0.49 + particle.age * 0.28,
          -1.55 - particle.age * 0.62
        );
        const radius = 0.08 * Math.min(1, particle.age * 12) * (1 - lifeProgress * 0.72);
        setInstance(scratch.dummy, atp, index, scratch.point, [radius, radius, radius]);
        scratch.color.copy(scratch.emerald).lerp(scratch.indigo, lifeProgress * 0.65);
        atp.setColorAt(index, scratch.color);
      } else {
        setInstance(scratch.dummy, atp, index, scratch.point, [0, 0, 0]);
      }
    });
    atp.instanceMatrix.needsUpdate = true;
    if (atp.instanceColor) atp.instanceColor.needsUpdate = true;

    for (let index = 0; index < 24; index += 1) {
      const progress = (simulation.time * 0.45 + index / 24) % 1;
      const angle = Math.PI / 2 + (index % 3) * TAU / 3;
      scratch.start.set(
        atpPosition[0] + Math.cos(angle) * 1.05,
        atpPosition[1] + Math.sin(angle) * 1.05 - 0.35,
        -2.5
      );
      scratch.end.set(
        atpPosition[0] + Math.cos(angle) * 0.49,
        atpPosition[1] + Math.sin(angle) * 0.49,
        -1.55
      );
      scratch.point.lerpVectors(scratch.start, scratch.end, progress);
      scratch.point.x += Math.sin(progress * TAU + index) * 0.04;
      const radius = 0.045 * (1 - progress * 0.55);
      setInstance(scratch.dummy, substrate, index, scratch.point, [radius, radius, radius]);
      substrate.setColorAt(index, index % 2 ? scratch.amber : scratch.violet);
    }
    substrate.instanceMatrix.needsUpdate = true;
    if (substrate.instanceColor) substrate.instanceColor.needsUpdate = true;
    if (labelRef.current) {
      const pulse = 1 + Math.max(0, Math.sin(simulation.rotorAngle * 3)) * 0.045;
      labelRef.current.scale.setScalar(pulse);
    }
  });

  const atpPosition = POSITIONS['atp-synthase'];
  return (
    <group visible={visible} {...part.handlers}>
      <instancedMesh ref={atpRef} args={[geometries.particle, materials.body, 36]} frustumCulled={false} />
      <instancedMesh ref={substrateRef} args={[geometries.particle, materials.accent, 24]} frustumCulled={false} />
      <SelectionHalo geometries={geometries} material={materials.halo} radius={1.18}
        position={[atpPosition[0], atpPosition[1], -1.55]} visible={part.selected || part.hovered} />
      <group ref={labelRef} position={[atpPosition[0], atpPosition[1] - 1.45, -1.65]}>
        <SceneLabel text="ADP + Pi → ATP · 3 ATP / REV" color="#c4b5fd" position={[0, 0, 0]} scale={0.48} />
      </group>
    </group>
  );
}

export default function MitochondriaScene({
  activeTopicId,
  selectedPartId,
  isSpinning,
  metabolicRate,
  showElectrons,
  showProtons,
  showATP,
  onSelectPart,
}) {
  const rootRef = useRef();
  const geometries = useSceneGeometries();
  const [hoveredPart, setHoveredPart] = useState(null);
  const simulation = useRef({ time: 0, rotorAngle: 0, rate: 1 }).current;
  const inspection = useMemo(() => ({
    activeTopicId, selectedPartId, hoveredPart, setHoveredPart, onSelectPart,
  }), [activeTopicId, hoveredPart, onSelectPart, selectedPartId]);

  useEffect(() => {
    document.body.style.cursor = hoveredPart ? 'pointer' : 'auto';
  }, [hoveredPart]);
  useEffect(() => () => {
    document.body.style.cursor = 'auto';
  }, []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const rate = Number.isFinite(metabolicRate) ? THREE.MathUtils.clamp(metabolicRate, 0, 3) : 1;
    simulation.rate = rate;
    simulation.time += dt * rate;
    simulation.rotorAngle += dt * rate * ROTOR_REVOLUTIONS_PER_SECOND * TAU;
    if (rootRef.current && isSpinning) rootRef.current.rotation.y += dt * 0.075;
  }, -100);

  return (
    <InspectionContext.Provider value={inspection}>
      <group ref={rootRef} name="procedural-mitochondria" rotation={[0.035, -0.08, 0]}>
        <CristaeMembrane geometries={geometries} />
        <ComplexI geometries={geometries} simulation={simulation} />
        <ComplexII geometries={geometries} simulation={simulation} />
        <ComplexIII geometries={geometries} simulation={simulation} />
        <ComplexIV geometries={geometries} simulation={simulation} />
        <MobileCarriers geometries={geometries} simulation={simulation} />
        <ElectronFlow geometries={geometries} simulation={simulation} visible={showElectrons} />
        <ProtonSystem geometries={geometries} simulation={simulation} visible={showProtons} />
        <AtpSynthase geometries={geometries} simulation={simulation} />
        <AtpSynthesisParticles geometries={geometries} simulation={simulation} visible={showATP} />
        <SceneLabel text="MATRIX · ADP + Pi → ATP" color="#6ee7b7" position={[-3.75, -2.72, -1.45]} scale={0.48} />
      </group>
    </InspectionContext.Provider>
  );
}

