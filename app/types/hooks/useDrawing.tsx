
import { useCallback, useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { Point, Stroke } from "../drawing";

interface UseDrawingCanvasProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  cursorRef: RefObject<HTMLDivElement | null>;
  toolbarRef: RefObject<HTMLDivElement | null>;
  drawingMode: boolean;
  color: string;
  brushSize: number;
}

export function useDrawingCanvas({
  canvasRef,
  cursorRef,
  toolbarRef,
  drawingMode,
  color,
  brushSize,
}: UseDrawingCanvasProps) {
  const strokesRef = useRef<Stroke[]>([]);
  const currentStrokeRef = useRef<Stroke | null>(null);
  const isMouseDownRef = useRef(false);

  const lastPosition = useRef<Point>({
    x: 0,
    y: 0,
  });

  // Mantém as configurações mais recentes sem recriar listeners.
  const settingsRef = useRef({
    drawingMode,
    color,
    brushSize,
  });

  useEffect(() => {
    settingsRef.current = {
      drawingMode,
      color,
      brushSize,
    };

    if (!drawingMode) {
      isMouseDownRef.current = false;
      currentStrokeRef.current = null;
    }
  }, [drawingMode, color, brushSize]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (const stroke of strokesRef.current) {
      if (stroke.points.length < 2) continue;

      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;

      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

      for (let i = 1; i < stroke.points.length; i++) {
        const point = stroke.points[i];
        ctx.lineTo(point.x, point.y);
      }

      ctx.stroke();
    }
  }, [canvasRef]);

  const clearDrawing = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    strokesRef.current = [];
    currentStrokeRef.current = null;
    isMouseDownRef.current = false;
  }, [canvasRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const previousWidth = canvas.width;
      const previousHeight = canvas.height;

      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;

      if (previousWidth > 0 && previousHeight > 0) {
        const scaleX = newWidth / previousWidth;
        const scaleY = newHeight / previousHeight;

        for (const stroke of strokesRef.current) {
          for (const point of stroke.points) {
            point.x *= scaleX;
            point.y *= scaleY;
          }
        }
      }

      canvas.width = newWidth;
      canvas.height = newHeight;

      redrawCanvas();
    };

    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;

      if (cursorRef.current) {
        cursorRef.current.style.transform =
          `translate(${clientX}px, ${clientY}px) translate(-50%, -50%)`;
      }

      if (
        !settingsRef.current.drawingMode ||
        !isMouseDownRef.current
      ) {
        return;
      }

      const currentStroke = currentStrokeRef.current;
      if (!currentStroke) return;

      const newPoint: Point = {
        x: clientX,
        y: clientY,
      };

      currentStroke.points.push(newPoint);

      ctx.strokeStyle = currentStroke.color;
      ctx.lineWidth = currentStroke.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.beginPath();
      ctx.moveTo(
        lastPosition.current.x,
        lastPosition.current.y
      );
      ctx.lineTo(clientX, clientY);
      ctx.stroke();

      lastPosition.current = newPoint;
    };

    const handleMouseDown = (event: MouseEvent) => {
      const settings = settingsRef.current;

      if (!settings.drawingMode || event.button !== 0) return;

      if (toolbarRef.current?.contains(event.target as Node)) {
        return;
      }

      isMouseDownRef.current = true;

      const startPoint: Point = {
        x: event.clientX,
        y: event.clientY,
      };

      const newStroke: Stroke = {
        points: [startPoint],
        color: settings.color,
        width: settings.brushSize,
      };

      strokesRef.current.push(newStroke);
      currentStrokeRef.current = newStroke;
      lastPosition.current = startPoint;

      ctx.fillStyle = settings.color;
      ctx.beginPath();
      ctx.arc(
        startPoint.x,
        startPoint.y,
        settings.brushSize / 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    };

    const stopStroke = () => {
      isMouseDownRef.current = false;
      currentStrokeRef.current = null;
    };

    resizeCanvas();

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", stopStroke);
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("blur", stopStroke);

    return () => {
      stopStroke();

      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", stopStroke);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("blur", stopStroke);
    };
  }, [canvasRef, cursorRef, toolbarRef, redrawCanvas]);

  return {
    clearDrawing,
  };
}
