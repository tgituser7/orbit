"use client";

import { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Full-screen background drawn in screen space: procedural stars, a faint nebula and a
 * vignette. It ignores the camera entirely and has no time input, so it is perfectly
 * static — stars are soft discs at least ~2px wide and can never shimmer.
 */
export default function Backdrop() {
  const dpr = useThree((s) => s.viewport.dpr);
  const uniforms = useMemo(() => ({ uDpr: { value: dpr } }), [dpr]);

  return (
    <mesh frustumCulled={false} renderOrder={-1}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
        toneMapped={false}
        vertexShader={/* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position.xy, 0.0, 1.0);
          }
        `}
        fragmentShader={/* glsl */ `
          uniform float uDpr;
          varying vec2 vUv;

          float hash(vec2 p) {
            p = fract(p * vec2(123.34, 456.21));
            p += dot(p, p + 45.32);
            return fract(p.x * p.y);
          }

          // One layer of stars on a pixel grid of the given cell size (CSS pixels).
          float stars(vec2 px, float cell, float density, float seed) {
            vec2 g = px / cell;
            vec2 id = floor(g);
            float h = hash(id + seed);
            if (h > density) return 0.0;
            vec2 pos = vec2(hash(id + seed + 1.7), hash(id + seed + 9.1)) * 0.8 + 0.1;
            float d = length((fract(g) - pos) * cell);
            float radius = mix(0.9, 1.6, hash(id + seed + 4.3));
            float brightness = mix(0.25, 1.0, pow(hash(id + seed + 7.7), 2.0));
            return (1.0 - smoothstep(radius * 0.4, radius, d)) * brightness;
          }

          void main() {
            vec2 px = gl_FragCoord.xy / uDpr;

            vec3 col = vec3(0.012, 0.016, 0.04);

            // Faint nebula glows (static)
            col += vec3(0.16, 0.10, 0.32) * 0.18 * smoothstep(0.75, 0.0, length(vUv - vec2(0.72, 0.6)));
            col += vec3(0.05, 0.18, 0.28) * 0.12 * smoothstep(0.6, 0.0, length(vUv - vec2(0.2, 0.15)));

            float s = stars(px, 46.0, 0.22, 0.0) + stars(px + 17.0, 97.0, 0.35, 31.0) * 1.2;
            col += vec3(0.78, 0.84, 1.0) * s * 0.75;

            // Vignette
            float v = smoothstep(1.15, 0.35, length((vUv - 0.5) * vec2(1.25, 1.0)));
            col *= mix(0.45, 1.0, v);

            gl_FragColor = vec4(col, 1.0);
          }
        `}
      />
    </mesh>
  );
}
