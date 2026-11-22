import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SEQUENCE_PAIRS } from '../data/dnaTopics.js';

const BASE_COLORS = {
  A: '#22d3ee',
  T: '#fbbf24',
  G: '#34d399',
  C: '#e879f9',
};

const RADIUS = 1.45;
const STEP_Y = 0.56;
const TWIST_PER_STEP = 0.58;
const STRAND_PHASE_OFFSET = 2.55;

export default function DnaHelix({
  activeTopicId,
  selectedRungId,
  isSpinning,
  onSelectPart,
}) {
  const groupRef = useRef();
  const [hoveredId, setHoveredId] = useState(null);

  const { strandAGeo, strandBGeo, rungs } = useMemo(() => {
    const count = SEQUENCE_PAIRS.length;
    const totalHeight = (count - 1) * STEP_Y;
    const halfH = totalHeight / 2;

    const ptsA = [];
    const ptsB = [];
    const rungData = [];

    for (let i = 0; i < count; i++) {
      const y = i * STEP_Y - halfH;
      const angleA = i * TWIST_PER_STEP;
      const angleB = angleA + STRAND_PHASE_OFFSET;

      const posA = new THREE.Vector3(
        Math.cos(angleA) * RADIUS,
        y,
        Math.sin(angleA) * RADIUS
      );
      const posB = new THREE.Vector3(
        Math.cos(angleB) * RADIUS,
        y,
        Math.sin(angleB) * RADIUS
      );

      ptsA.push(posA);
      ptsB.push(posB);

      const pair = SEQUENCE_PAIRS[i];
      const mid = new THREE.Vector3().addVectors(posA, posB).multiplyScalar(0.5);
      const dir = new THREE.Vector3().subVectors(posB, posA);
      const span = dir.length();
      const quat = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        dir.clone().normalize()
      );

      rungData.push({ ...pair, posA, posB, mid, span, quat });
    }

    const curveA = new THREE.CatmullRomCurve3(ptsA);
    const curveB = new THREE.CatmullRomCurve3(ptsB);

    return {
      strandAGeo: new THREE.TubeGeometry(curveA, 140, 0.11, 16, false),
      strandBGeo: new THREE.TubeGeometry(curveB, 140, 0.11, 16, false),
      rungs: rungData,
    };
  }, []);

  useFrame((_, delta) => {
    if (groupRef.current && isSpinning) {
      groupRef.current.rotation.y += delta * 0.38;
    }
  });

  const setCursor = (pointer) => {
    document.body.style.cursor = pointer ? 'pointer' : 'auto';
  };

  const backboneHighlighted =
    activeTopicId === 'backbone' || activeTopicId === 'grooves' || hoveredId === 'backbone';
  const hydrogenHighlighted =
    activeTopicId === 'hydrogen-bonds' || hoveredId === 'hydrogen';

  return (
    <group ref={groupRef} position={[0, 0, 0]} rotation={[0.08, 0, 0.08]}>
      {/* Sugar-Phosphate Backbone Strand A */}
      <mesh
        geometry={strandAGeo}
        onClick={(e) => {
          e.stopPropagation();
          onSelectPart('backbone', null);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHoveredId('backbone');
          setCursor(true);
        }}
        onPointerOut={() => {
          setHoveredId(null);
          setCursor(false);
        }}
      >
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#0ea5e9"
          emissiveIntensity={backboneHighlighted ? 1.55 : 0.72}
          roughness={0.22}
          metalness={0.35}
        />
      </mesh>

      {/* Sugar-Phosphate Backbone Strand B */}
      <mesh
        geometry={strandBGeo}
        onClick={(e) => {
          e.stopPropagation();
          onSelectPart('backbone', null);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHoveredId('backbone');
          setCursor(true);
        }}
        onPointerOut={() => {
          setHoveredId(null);
          setCursor(false);
        }}
      >
        <meshStandardMaterial
          color="#818cf8"
          emissive="#6366f1"
          emissiveIntensity={backboneHighlighted ? 1.55 : 0.72}
          roughness={0.22}
          metalness={0.35}
        />
      </mesh>

      {/* Base Pair Rungs, Phosphate Nodes, & Hydrogen Bond Bridges */}
      {rungs.map((rung) => {
        const isAT = rung.type === 'AT';
        const topicMatch =
          activeTopicId === 'overview' ||
          (isAT && activeTopicId === 'at-pair') ||
          (!isAT && activeTopicId === 'gc-pair');
        const isSelected = selectedRungId === rung.id;
        const isHovered = hoveredId === `rung-${rung.id}`;
        const rungGlow = isSelected ? 1.9 : isHovered ? 1.5 : topicMatch ? 0.95 : 0.3;

        const halfRodLen = rung.span * 0.315;
        const offsetFromMid = rung.span * 0.256;

        return (
          <group key={rung.id}>
            {[rung.posA, rung.posB].map((pos, idx) => (
              <mesh
                key={idx}
                position={pos}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPart('backbone', null);
                }}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  setHoveredId('backbone');
                  setCursor(true);
                }}
                onPointerOut={() => {
                  setHoveredId(null);
                  setCursor(false);
                }}
              >
                <sphereGeometry args={[0.17, 18, 18]} />
                <meshStandardMaterial
                  color={idx === 0 ? '#7dd3fc' : '#a5b4fc'}
                  emissive={idx === 0 ? '#0284c7' : '#4f46e5'}
                  emissiveIntensity={backboneHighlighted ? 1.6 : 0.65}
                  roughness={0.2}
                  metalness={0.4}
                />
              </mesh>
            ))}

            <group position={rung.mid} quaternion={rung.quat}>
              <mesh
                position={[0, -offsetFromMid, 0]}
                scale={isSelected ? [1.18, 1, 1.18] : [1, 1, 1]}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPart(isAT ? 'at-pair' : 'gc-pair', rung);
                }}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  setHoveredId(`rung-${rung.id}`);
                  setCursor(true);
                }}
                onPointerOut={() => {
                  setHoveredId(null);
                  setCursor(false);
                }}
              >
                <capsuleGeometry args={[0.095, halfRodLen, 8, 16]} />
                <meshStandardMaterial
                  color={BASE_COLORS[rung.left]}
                  emissive={BASE_COLORS[rung.left]}
                  emissiveIntensity={rungGlow}
                  roughness={0.25}
                  metalness={0.25}
                />
              </mesh>

              <mesh
                position={[0, offsetFromMid, 0]}
                scale={isSelected ? [1.18, 1, 1.18] : [1, 1, 1]}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPart(isAT ? 'at-pair' : 'gc-pair', rung);
                }}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  setHoveredId(`rung-${rung.id}`);
                  setCursor(true);
                }}
                onPointerOut={() => {
                  setHoveredId(null);
                  setCursor(false);
                }}
              >
                <capsuleGeometry args={[0.095, halfRodLen, 8, 16]} />
                <meshStandardMaterial
                  color={BASE_COLORS[rung.right]}
                  emissive={BASE_COLORS[rung.right]}
                  emissiveIntensity={rungGlow}
                  roughness={0.25}
                  metalness={0.25}
                />
              </mesh>

              <group
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPart('hydrogen-bonds', rung);
                }}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  setHoveredId('hydrogen');
                  setCursor(true);
                }}
                onPointerOut={() => {
                  setHoveredId(null);
                  setCursor(false);
                }}
              >
                {Array.from({ length: rung.bonds }).map((_, bIdx) => {
                  const spread = (bIdx - (rung.bonds - 1) / 2) * 0.11;
                  return (
                    <mesh key={bIdx} position={[spread, 0, 0]}>
                      <capsuleGeometry args={[0.028, 0.24, 6, 10]} />
                      <meshStandardMaterial
                        color="#f9a8d4"
                        emissive="#f472b6"
                        emissiveIntensity={hydrogenHighlighted || isSelected ? 2.2 : 1.05}
                        roughness={0.15}
                      />
                    </mesh>
                  );
                })}
              </group>
            </group>
          </group>
        );
      })}
    </group>
  );
}
