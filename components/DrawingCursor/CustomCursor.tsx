
import type { RefObject } from "react";

interface CustomCursorProps {
  cursorRef: RefObject<HTMLDivElement | null>;
  brushSize: number;
  color: string;
  drawingMode: boolean;
}

export default function CustomCursor({
  cursorRef,
  brushSize,
  color,
  drawingMode,
}: CustomCursorProps) {
  return (
    <div
      ref={cursorRef}
      data-testid="drawing-cursor"
      className="
        pointer-events-none
        fixed
        z-20
        rounded-full
        border-2
      "
      style={{
        width: `${brushSize + 8}px`,
        height: `${brushSize + 8}px`,
        backgroundColor: drawingMode
          ? color
          : "transparent",
        borderColor: "white",
      }}
    />
  );
}
