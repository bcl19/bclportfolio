
import { Canvas } from "@react-three/fiber";
import Sphere from "@/app/pages/animations/BallHome";

export default function SphereBackground() {
  return (
    <div className="fixed inset-0 z-0">
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
        <ambientLight intensity={0.5} />

        <directionalLight
          position={[5, 5, 5]}
          intensity={2}
        />

        <pointLight
          position={[-5, -5, -5]}
          intensity={1}
        />

        <Sphere color="#3399ff" />
      </Canvas>
    </div>
  );
}
