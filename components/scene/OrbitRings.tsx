"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type OrbitSpec = {
  radius: number;
  tilt: [number, number, number];
  color: string;
  speed: number; // radians per second
  phase: number;
  size: number;
  ticks: number; // 0 = plain ring
  precess: number; // slow spin of the orbital plane
};

const ORBITS: OrbitSpec[] = [
  { radius: 2.1, tilt: [0.28, 0, 0.38], color: "#6fe3ff", speed: 0.55, phase: 0.6, size: 0.07, ticks: 0, precess: 0.06 },
  { radius: 3.0, tilt: [-0.55, 0.4, -0.22], color: "#b69cff", speed: 0.36, phase: 2.8, size: 0.09, ticks: 120, precess: -0.04 },
  { radius: 4.0, tilt: [0.14, 0, -0.08], color: "#ffb36b", speed: 0.24, phase: 4.6, size: 0.11, ticks: 0, precess: 0.025 },
];

const RING_WIDTH = 0.22;
const easeOutCubic = (x: number) => 1 - Math.pow(1 - THREE.MathUtils.clamp(x, 0, 1), 3);

const ringVertex = /* glsl */ `
  varying vec2 vPos;
  void main() {
    vPos = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ringFragment = /* glsl */ `
  #define TAU 6.28318530718
  uniform vec3 uColor;
  uniform float uInner;
  uniform float uOuter;
  uniform float uAngle;
  uniform float uTicks;
  uniform float uIntro;
  varying vec2 vPos;

  float aaBand(float x, float c, float w, float aa) {
    return 1.0 - smoothstep(w - aa, w + aa, abs(x - c));
  }

  float aaTicks(float x, float w) {
    float aa = fwidth(x);
    float cell = fract(x);
    float d = min(cell, 1.0 - cell);
    return (1.0 - smoothstep(w - aa, w + aa, d)) * (1.0 - smoothstep(0.2, 0.45, aa));
  }

  void main() {
    float r = length(vPos);
    float t = (r - uInner) / (uOuter - uInner);
    float tAA = fwidth(t) * 0.75;
    float a = atan(vPos.y, vPos.x);

    // Crisp orbit line (never thinner than ~1px) plus a soft halo around it
    float line = aaBand(t, 0.5, max(0.05, tAA * 1.2), tAA);
    float halo = exp(-pow((t - 0.5) * 5.0, 2.0)) * 0.12;

    // Optional engraved ticks on the outer half
    float ticks = 0.0;
    if (uTicks > 0.0) {
      float an = (a + 3.14159265) / TAU;
      float inBand = smoothstep(0.62 - tAA, 0.62 + tAA, t) * (1.0 - smoothstep(0.85 - tAA, 0.85 + tAA, t));
      ticks = aaTicks(an * uTicks, 0.06) * inBand;
    }

    // Comet glow: brightest right behind the planet, fading along the orbit
    float d = mod(uAngle - a, TAU);
    float arc = exp(-d * 1.4) * smoothstep(0.0, 0.03, d);

    // Reveal the ring by sweeping it in from the planet's position during the intro
    float sweep = uIntro * (TAU + 0.4);
    float reveal = 1.0 - smoothstep(sweep - 0.4, sweep, d);

    float glow = line * (0.32 + arc * 2.6) + halo * (0.5 + arc * 2.0) + ticks * (0.22 + arc * 0.8);
    vec3 col = uColor * glow + vec3(1.0) * line * arc * 0.7;
    gl_FragColor = vec4(col * reveal, clamp(glow, 0.0, 1.0) * reveal);
  }
`;

const glowFragment = /* glsl */ `
  uniform vec3 uColor;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float g = pow(max(1.0 - d, 0.0), 3.0);
    gl_FragColor = vec4(uColor * g, g);
  }
`;

const glowVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/** One orbit: a glowing ring with a planet riding it, its trail drawn by the ring shader itself. */
function Orbit({ spec, index }: { spec: OrbitSpec; index: number }) {
  const plane = useRef<THREE.Group>(null);
  const planet = useRef<THREE.Group>(null);
  const glow = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(spec.color) },
      uInner: { value: spec.radius - RING_WIDTH / 2 },
      uOuter: { value: spec.radius + RING_WIDTH / 2 },
      uAngle: { value: spec.phase },
      uTicks: { value: spec.ticks },
      uIntro: { value: 0 },
    }),
    [spec],
  );
  const glowUniforms = useMemo(() => ({ uColor: { value: new THREE.Color(spec.color) } }), [spec.color]);

  useFrame(({ clock, camera }, delta) => {
    const t = clock.getElapsedTime();
    const intro = easeOutCubic((t - 0.4 - index * 0.35) / 2.4);
    const angle = t * spec.speed + spec.phase;

    if (mat.current) {
      mat.current.uniforms.uAngle.value = angle;
      mat.current.uniforms.uIntro.value = intro;
    }
    if (plane.current) plane.current.rotation.z += delta * spec.precess;
    if (planet.current) {
      planet.current.position.set(Math.cos(angle) * spec.radius, Math.sin(angle) * spec.radius, 0);
      planet.current.scale.setScalar(intro);
    }
    // Keep the planet's glow facing the camera. Use the orbital plane's rotation (the planet
    // group itself starts at scale 0, which would make its world rotation NaN).
    if (glow.current && plane.current) {
      plane.current.getWorldQuaternion(glow.current.quaternion).invert().multiply(camera.quaternion);
    }
  });

  return (
    <group rotation={spec.tilt}>
      {/* Rotate the XY-plane ring into the horizontal plane; precession spins it in-plane */}
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <group ref={plane}>
          <mesh>
            <ringGeometry args={[spec.radius - RING_WIDTH / 2, spec.radius + RING_WIDTH / 2, 256, 1]} />
            <shaderMaterial
              ref={mat}
              uniforms={uniforms}
              vertexShader={ringVertex}
              fragmentShader={ringFragment}
              transparent
              depthWrite={false}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </mesh>
          <group ref={planet}>
            <mesh>
              <sphereGeometry args={[spec.size, 32, 32]} />
              <meshBasicMaterial color={new THREE.Color(spec.color).lerp(new THREE.Color("#ffffff"), 0.55)} toneMapped={false} />
            </mesh>
            <mesh ref={glow}>
              <planeGeometry args={[spec.size * 14, spec.size * 14]} />
              <shaderMaterial
                uniforms={glowUniforms}
                vertexShader={glowVertex}
                fragmentShader={glowFragment}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                toneMapped={false}
              />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

export default function OrbitRings() {
  return (
    <group>
      {ORBITS.map((spec, i) => (
        <Orbit key={i} spec={spec} index={i} />
      ))}
    </group>
  );
}
