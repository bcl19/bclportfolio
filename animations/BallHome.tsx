
"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

interface SphereProps {
  color: string;
}

const Sphere = ({ color = "#3399ff" }: SphereProps) => {
  const sphereRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const sphere = sphereRef.current;

    if (!sphere) return;

    const { x, y } = state.pointer;

    const elapsedTime = state.clock.elapsedTime;

    // Rotação baseada no mouse
    const targetRotationY = x * 0.6;
    const targetRotationX = -y * 0.6;

    // Suavização independente do FPS
    const smoothness = 5;
    const lerpFactor = 1 - Math.exp(-smoothness * delta);

    sphere.rotation.y +=
      (targetRotationY - sphere.rotation.y) * lerpFactor;

    sphere.rotation.x +=
      (targetRotationX - sphere.rotation.x) * lerpFactor;

    // Rotação automática
    sphere.rotation.y += delta * 0.25;

    // Flutuação
    sphere.position.y =
      Math.sin(elapsedTime * 1.2) * 0.15;

    // Pulsação
    const scale =
      1 + Math.sin(elapsedTime * 2) * 0.025;

    sphere.scale.setScalar(scale);
  });

  return (
    <mesh ref={sphereRef}>
      <sphereGeometry args={[1.5, 64, 64]} />

      <meshStandardMaterial
        color={color}
        roughness={0.25}
        metalness={0.4}
      />
    </mesh>
  );
};

export default Sphere;
