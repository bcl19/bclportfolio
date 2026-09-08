"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";

interface SphereProps {
  color: string;
}

function Sphere({ color }: SphereProps) {
  const sphereRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const sphere = sphereRef.current;

    if (!sphere) return;

    const { x, y } = state.pointer;

    // Rotação horizontal
    const targetRotationY = x * 0.6;

    // Rotação vertical
    const targetRotationX = -y * 0.6;

    // Suavização
    sphere.rotation.y +=
      (targetRotationY - sphere.rotation.y) * 0.05;

    sphere.rotation.x +=
      (targetRotationX - sphere.rotation.x) * 0.05;
  });

  return (
    <mesh ref={sphereRef}>
      <sphereGeometry args={[1.5, 18, 32]} />

      <meshStandardMaterial
        color={color}
        roughness={0.25}
        metalness={0.4}
      />
    </mesh>
  );
}

export default function InteractiveSphere() {
  const [color, setColor] = useState("#3399ff");

  return (
    <div className="fixed inset-0">
      {/* Input de cor */}
      <div className="fixed top-5 left-5 z-50">
        <label
          htmlFor="sphere-color"
          className="flex items-center gap-3 rounded-lg bg-black/50 p-3 backdrop-blur-md"
        >
          <span className="text-white">
            Cor da bola
          </span>

          <input
            id="sphere-color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-10 w-10 cursor-pointer rounded"
          />
        </label>
      </div>

      <Canvas
        camera={{
          position: [0, 0, 5],
          fov: 50,
        }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
        }}
      >
        {/* Luz ambiente */}
        <ambientLight intensity={0.5} />

        {/* Luz principal */}
        <directionalLight
          position={[5, 5, 5]}
          intensity={2}
        />

        {/* Luz secundária */}
        <pointLight
          position={[-5, -5, -5]}
          intensity={1}
        />

        <Sphere color={color} />
      </Canvas>
    </div>
  );
}