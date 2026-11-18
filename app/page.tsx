
"use client";

import { useRef, useState } from "react";

import DrawingCanvas from "../components/DrawingCursor/Drawing";
import DrawingToolbar from "../components/DrawingCursor/DrawingToolBar";
import CustomCursor from "../components/DrawingCursor/CustomCursor";
import SphereBackground from "../components/DrawingCursor/SphereBackground";

import { useDrawingCanvas } from "../types/hooks/useDrawing";

export default function DrawingCursor() {
  // Referências
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Estados
  const [drawingMode, setDrawingMode] = useState(false);
  const [color, setColor] = useState("#ffffff");
  const [brushSize, setBrushSize] = useState(4);

  // Hook responsável pela lógica do desenho
  const { clearDrawing } = useDrawingCanvas({
    canvasRef,
    cursorRef,
    toolbarRef,
    drawingMode,
    color,
    brushSize,
  });

  // Ativar desenho
  const startDrawing = () => {
    setDrawingMode(true);
  };

  // Desativar desenho
  const stopDrawing = () => {
    setDrawingMode(false);
  };

  return (
    <>
      {/* Fundo 3D */}
      <SphereBackground />

      {/* Área de desenho */}
      <DrawingCanvas canvasRef={canvasRef} />

      {/* Cursor personalizado */}
      <CustomCursor
        cursorRef={cursorRef}
        brushSize={brushSize}
        color={color}
        drawingMode={drawingMode}
      />

      {/* Controles */}
      <div ref={toolbarRef}>
        <DrawingToolbar
          color={color}
          brushSize={brushSize}
          drawingMode={drawingMode}
          onColorChange={setColor}
          onBrushSizeChange={setBrushSize}
          onStartDrawing={startDrawing}
          onStopDrawing={stopDrawing}
          onClearDrawing={clearDrawing}
        />
      </div>
    </>
  );
}
