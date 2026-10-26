"use client";

import { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import Core from "./Core";
import OrbitRings from "./OrbitRings";

const INTRO_SECONDS = 3.2;
const easeOutExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));

/** Drives the intro fly-in, pointer parallax and responsive framing. */
function System() {
  const system = useRef<THREE.Group>(null);
  const { camera, size } = useThree();
  const target = useRef(new THREE.Vector3());

  useFrame(({ clock, pointer }, delta) => {
    const p = easeOutExpo(Math.min(clock.getElapsedTime() / INTRO_SECONDS, 1));

    // Pull the camera back on narrow screens so the whole system fits.
    const aspect = size.width / size.height;
    const dist = aspect < 1 ? 17 : aspect < 1.4 ? 13.5 : 11.5;

    const camZ = THREE.MathUtils.lerp(36, dist, p);
    const camY = THREE.MathUtils.lerp(10, 2.6, p);
    target.current.set(pointer.x * 0.7, camY + pointer.y * 0.5, camZ);
    camera.position.lerp(target.current, 1 - Math.pow(0.001, delta));
    camera.lookAt(0, 0, 0);

    if (system.current) {
      // Wide screens: slide the system right of the headline. Portrait: lift it above the copy.
      const offsetX = aspect > 1.4 ? 2.6 : aspect > 1 ? 1.4 : 0;
      const offsetY = aspect < 1 ? 1.8 : 0;
      system.current.position.x = THREE.MathUtils.damp(system.current.position.x, offsetX, 2, delta);
      system.current.position.y = THREE.MathUtils.damp(system.current.position.y, offsetY, 2, delta);
      system.current.rotation.x = THREE.MathUtils.damp(system.current.rotation.x, 0.3 - pointer.y * 0.16, 3, delta);
      system.current.rotation.z = THREE.MathUtils.damp(system.current.rotation.z, -0.1 + pointer.x * 0.08, 3, delta);
    }
  });

  return (
    <group ref={system}>
      <Core />
      <OrbitRings />
    </group>
  );
}

export default function OrbitScene() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 10, 36], fov: 42, near: 0.1, far: 300 }}
      gl={{ antialias: false, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#03040a"]} />

      <Stars radius={100} depth={50} count={2500} factor={3} saturation={0.3} fade speed={0} />

      <System />

      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={1.1} luminanceThreshold={0.5} luminanceSmoothing={0.25} radius={0.7} />
        <Vignette eskil={false} offset={0.2} darkness={0.8} />
      </EffectComposer>
    </Canvas>
  );
}
