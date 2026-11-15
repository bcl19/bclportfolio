
import type { RefObject } from "react";

interface DrawingCanvasProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
}

export default function DrawingCanvas({
  canvasRef,
}: DrawingCanvasProps) {
  return (
    <canvas
      ref={canvasRef}
      className="
        pointer-events-none
        fixed
        inset-0
        z-10
      "
    />
  );
}
