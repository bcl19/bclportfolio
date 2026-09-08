
"use client";

import { useEffect, useRef, useState } from "react";
import InteractiveSphere from "@/app/pages/animations/BallHome";

type Point = {
  x: number;
  y: number;
};

type Stroke = {
  points: Point[];
  color: string;
  width: number;
};

export default function DrawingCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  const [drawingMode, setDrawingMode] = useState(false);
  const [color, setColor] = useState("#ffffff");
  const [brushSize, setBrushSize] = useState(4);

  /*
   * Refs são usadas dentro dos event listeners
   * para evitar problemas de estado desatualizado.
   */
  const drawingModeRef = useRef(false);
  const colorRef = useRef("#ffffff");
  const brushSizeRef = useRef(4);
  const isMouseDownRef = useRef(false);

  const strokesRef = useRef<Stroke[]>([]);
  const currentStrokeRef = useRef<Stroke | null>(null);
  const lastPosition = useRef<Point>({
    x: 0,
    y: 0,
  });
  useEffect(() => {
    drawingModeRef.current = drawingMode;
  }, [drawingMode]);

  useEffect(() => {
    colorRef.current = color;
  }, [color]);

  useEffect(() => {
    brushSizeRef.current = brushSize;
  }, [brushSize]);
  const redrawCanvas = () => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (const stroke of strokesRef.current) {
      if (stroke.points.length < 2) continue;

      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;

      ctx.beginPath();

      ctx.moveTo(
        stroke.points[0].x,
        stroke.points[0].y
      );

      for (let i = 1; i < stroke.points.length; i++) {
        const point = stroke.points[i];

        ctx.lineTo(point.x, point.y);
      }

      ctx.stroke();
    }
  };

  /*
   * Inicialização do canvas e listeners do mouse.
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    const cursor = cursorRef.current;

    if (!canvas || !cursor) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    /*
     * Configura o canvas.
     */
    const resizeCanvas = () => {
      const previousWidth = canvas.width;
      const previousHeight = canvas.height;

      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;

      /*
       * Primeira inicialização.
       */
      if (
        previousWidth === 0 ||
        previousHeight === 0
      ) {
        canvas.width = newWidth;
        canvas.height = newHeight;

        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        return;
      }
      const scaleX = newWidth / previousWidth;
      const scaleY = newHeight / previousHeight;
      for (const stroke of strokesRef.current) {
        for (const point of stroke.points) {
          point.x *= scaleX;
          point.y *= scaleY;
        }
      }
      canvas.width = newWidth;
      canvas.height = newHeight;

      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      /*
       * Reconstrói o desenho.
       */
      redrawCanvas();
    };

    /*
     * Mouse move.
     */
    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;

      /*
       * Atualiza o cursor personalizado.
       */
      cursor.style.transform = `
        translate(${clientX}px, ${clientY}px)
        translate(-50%, -50%)
      `;

      /*
       * Se não estiver desenhando,
       * não fazemos nada além de mover o cursor.
       */
      if (
        !drawingModeRef.current ||
        !isMouseDownRef.current
      ) {
        return;
      }

      const currentStroke =
        currentStrokeRef.current;

      if (!currentStroke) return;

      /*
       * Adiciona o novo ponto ao traço atual.
       */
      const newPoint = {
        x: clientX,
        y: clientY,
      };

      currentStroke.points.push(newPoint);

      /*
       * Desenha somente o novo segmento.
       */
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

      /*
       * Atualiza a última posição.
       */
      lastPosition.current = {
        x: clientX,
        y: clientY,
      };
    };

    /*
     * Mouse down.
     */
    const handleMouseDown = (event: MouseEvent) => {
      /*
       * Só desenha se o modo desenho estiver ativo.
       */
      if (!drawingModeRef.current) return;

      /*
       * Somente botão esquerdo.
       */
      if (event.button !== 0) return;

      isMouseDownRef.current = true;

      const startPoint = {
        x: event.clientX,
        y: event.clientY,
      };

      /*
       * Cria um novo traço.
       */
      const newStroke: Stroke = {
        points: [startPoint],
        color: colorRef.current,
        width: brushSizeRef.current,
      };

      /*
       * Guarda o traço.
       */
      strokesRef.current.push(newStroke);

      currentStrokeRef.current = newStroke;

      /*
       * Guarda a posição inicial.
       */
      lastPosition.current = startPoint;

      /*
       * Desenha um pequeno ponto caso o usuário
       * apenas clique sem arrastar.
       */
      ctx.fillStyle = colorRef.current;

      ctx.beginPath();

      ctx.arc(
        event.clientX,
        event.clientY,
        brushSizeRef.current / 2,
        0,
        Math.PI * 2
      );

      ctx.fill();
    };

    /*
     * Mouse up.
     */
    const handleMouseUp = () => {
      isMouseDownRef.current = false;
      currentStrokeRef.current = null;
    };

    /*
     * Caso o mouse saia da janela.
     */
    const handleMouseLeave = () => {
      isMouseDownRef.current = false;
      currentStrokeRef.current = null;
    };

    resizeCanvas();

    window.addEventListener(
      "mousemove",
      handleMouseMove
    );

    window.addEventListener(
      "mousedown",
      handleMouseDown
    );

    window.addEventListener(
      "mouseup",
      handleMouseUp
    );

    window.addEventListener(
      "resize",
      resizeCanvas
    );

    window.addEventListener(
      "mouseleave",
      handleMouseLeave
    );

    /*
     * Cleanup.
     */
    return () => {
      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      window.removeEventListener(
        "mousedown",
        handleMouseDown
      );

      window.removeEventListener(
        "mouseup",
        handleMouseUp
      );

      window.removeEventListener(
        "resize",
        resizeCanvas
      );

      window.removeEventListener(
        "mouseleave",
        handleMouseLeave
      );
    };
  }, []);

  /*
   * Limpa todo o desenho.
   */
  const clearDrawing = () => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    /*
     * Remove os traços armazenados.
     */
    strokesRef.current = [];

    currentStrokeRef.current = null;
  };

  /*
   * Ativa o modo desenho.
   */
  const startDrawing = () => {
    drawingModeRef.current = true;
    setDrawingMode(true);
  };

  /*
   * Desativa o modo desenho.
   */
  const stopDrawing = () => {
    drawingModeRef.current = false;
    isMouseDownRef.current = false;
    currentStrokeRef.current = null;

    setDrawingMode(false);
  };

  return (
    <>
      {/* =========================================
          ESFERA 3D
      ========================================= */}

      <div className="fixed inset-0 z-[1]">
        <InteractiveSphere />
      </div>

      {/* =========================================
          CANVAS
      ========================================= */}

      <canvas
        ref={canvasRef}
        className="
          pointer-events-none
          fixed
          inset-0
          z-[9998]
        "
      />

      {/* =========================================
          CURSOR PERSONALIZADO
      ========================================= */}

      <div
        ref={cursorRef}
        className="
          pointer-events-none
          fixed
          z-[9999]
          rounded-full
          border-2
          transition-[width,height,background-color,border-color]
          duration-100
        "
        style={{
          width: `${brushSize + 8}px`,
          height: `${brushSize + 8}px`,
          backgroundColor: drawingMode
            ? color
            : "transparent",
          borderColor: color,
        }}
      />

      {/* =========================================
          PAINEL
      ========================================= */}

      <div
        className="
          fixed
          bottom-5
          left-5
          z-[10000]
          flex
          items-center
          gap-2
          rounded-xl
          bg-black/70
          p-3
          backdrop-blur-md
        "
      >
        {/* Desenhar */}

        <button
          onClick={startDrawing}
          className="
            rounded
            bg-white
            px-4
            py-2
            text-black
            transition
            hover:bg-gray-200
          "
        >
          ✏️ Desenhar
        </button>

        {/* Parar */}

        <button
          onClick={stopDrawing}
          className="
            rounded
            bg-gray-300
            px-4
            py-2
            text-black
            transition
            hover:bg-gray-400
          "
        >
          Parar
        </button>

        {/* Cor */}

        <input
          type="color"
          value={color}
          onChange={(event) =>
            setColor(event.target.value)
          }
          className="
            h-10
            w-10
            cursor-pointer
            rounded
            border-0
            bg-transparent
          "
        />

        {/* Tamanho do pincel */}

        <input
          type="range"
          min="1"
          max="30"
          value={brushSize}
          onChange={(event) =>
            setBrushSize(
              Number(event.target.value)
            )
          }
          className="w-24"
        />

        {/* Limpar */}

        <button
          onClick={clearDrawing}
          className="
            rounded
            bg-red-500
            px-4
            py-2
            text-white
            transition
            hover:bg-red-600
          "
        >
          Limpar
        </button>
      </div>
    </>
  );
}

