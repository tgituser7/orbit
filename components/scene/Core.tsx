"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { noiseGLSL } from "./noise";

/** The living star at the center: boiling plasma surface, corona shell and a soft halo. */
export default function Core() {
  const surface = useRef<THREE.ShaderMaterial>(null);
  const corona = useRef<THREE.ShaderMaterial>(null);
  const halo = useRef<THREE.Mesh>(null);

  const surfaceUniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  const coronaUniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame(({ clock, camera }) => {
    const t = clock.getElapsedTime();
    if (surface.current) surface.current.uniforms.uTime.value = t;
    if (corona.current) corona.current.uniforms.uTime.value = t;
    if (halo.current) {
      halo.current.quaternion.copy(camera.quaternion);
      const pulse = 1 + Math.sin(t * 1.3) * 0.03;
      halo.current.scale.setScalar(pulse);
    }
  });

  return (
    <group>
      {/* Plasma surface */}
      <mesh>
        <sphereGeometry args={[0.85, 64, 64]} />
        <shaderMaterial
          ref={surface}
          uniforms={surfaceUniforms}
          toneMapped={false}
          vertexShader={/* glsl */ `
            varying vec3 vNormal;
            varying vec3 vPos;
            varying vec3 vView;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              vPos = position;
              vec4 mv = modelViewMatrix * vec4(position, 1.0);
              vView = normalize(-mv.xyz);
              gl_Position = projectionMatrix * mv;
            }
          `}
          fragmentShader={/* glsl */ `
            uniform float uTime;
            varying vec3 vNormal;
            varying vec3 vPos;
            varying vec3 vView;
            ${noiseGLSL}
            void main() {
              vec3 p = vPos * 2.2;
              float n1 = fbm(p + vec3(0.0, uTime * 0.12, uTime * 0.05));
              float n2 = fbm(p * 2.5 - vec3(uTime * 0.2, 0.0, 0.0) + n1);
              float heat = clamp(0.55 + n1 * 0.6 + n2 * 0.35, 0.0, 1.0);

              vec3 deep  = vec3(0.95, 0.25, 0.05);
              vec3 mid   = vec3(1.0, 0.62, 0.18);
              vec3 hot   = vec3(1.0, 0.95, 0.78);
              vec3 col = mix(deep, mid, smoothstep(0.15, 0.6, heat));
              col = mix(col, hot, smoothstep(0.6, 0.95, heat));

              float fres = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.5);
              col += vec3(1.0, 0.75, 0.4) * fres * 1.6;
              gl_FragColor = vec4(col * 1.6, 1.0);
            }
          `}
        />
      </mesh>

      {/* Corona shell (backface fresnel glow with flickering flares) */}
      <mesh scale={1.35}>
        <sphereGeometry args={[0.85, 64, 64]} />
        <shaderMaterial
          ref={corona}
          uniforms={coronaUniforms}
          transparent
          depthWrite={false}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          vertexShader={/* glsl */ `
            varying vec3 vNormal;
            varying vec3 vView;
            varying vec3 vPos;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              vPos = position;
              vec4 mv = modelViewMatrix * vec4(position, 1.0);
              vView = normalize(-mv.xyz);
              gl_Position = projectionMatrix * mv;
            }
          `}
          fragmentShader={/* glsl */ `
            uniform float uTime;
            varying vec3 vNormal;
            varying vec3 vView;
            varying vec3 vPos;
            ${noiseGLSL}
            void main() {
              float rim = pow(max(dot(-vNormal, vView), 0.0), 3.0);
              float flare = 0.7 + 0.5 * snoise(vPos * 3.0 + uTime * 0.4);
              vec3 col = vec3(1.0, 0.55, 0.2) * rim * flare;
              gl_FragColor = vec4(col * 1.4, rim);
            }
          `}
        />
      </mesh>

      {/* Billboard halo */}
      <mesh ref={halo}>
        <planeGeometry args={[5.5, 5.5]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          vertexShader={/* glsl */ `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={/* glsl */ `
            varying vec2 vUv;
            void main() {
              float d = length(vUv - 0.5) * 2.0;
              float g = pow(max(1.0 - d, 0.0), 3.5);
              gl_FragColor = vec4(vec3(1.0, 0.5, 0.18) * g * 0.9, g);
            }
          `}
        />
      </mesh>

    </group>
  );
}
