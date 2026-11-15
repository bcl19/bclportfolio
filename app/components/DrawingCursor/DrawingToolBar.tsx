
interface DrawingToolbarProps {
  color: string;
  brushSize: number;
  drawingMode: boolean;

  onColorChange: (color: string) => void;
  onBrushSizeChange: (size: number) => void;

  onStartDrawing: () => void;
  onStopDrawing: () => void;
  onClearDrawing: () => void;
}

export default function DrawingToolbar({
  color,
  brushSize,
  drawingMode,
  onColorChange,
  onBrushSizeChange,
  onStartDrawing,
  onStopDrawing,
  onClearDrawing,
}: DrawingToolbarProps) {
  return (
    <div
      className="
        fixed
        bottom-6
        left-1/2
        z-30
        flex
        -translate-x-1/2
        items-center
        gap-3
        rounded-xl
        border
        border-white/10
        bg-black/70
        p-3
        backdrop-blur-lg
      "
    >
      <button
        onClick={onStartDrawing}
        disabled={drawingMode}
        className="rounded bg-white px-4 py-2 text-black disabled:opacity-50"
      >
        ✏️ Desenhar
      </button>

      <button
        onClick={onStopDrawing}
        disabled={!drawingMode}
        className="rounded bg-gray-300 px-4 py-2 text-black disabled:opacity-50"
      >
        Parar
      </button>

      <input
        type="color"
        value={color}
        onChange={(event) =>
          onColorChange(event.target.value)
        }
        className="h-10 w-10 cursor-pointer"
      />

      <input
        type="range"
        min="1"
        max="30"
        value={brushSize}
        onChange={(event) =>
          onBrushSizeChange(Number(event.target.value))
        }
        className="w-24"
      />

      <button
        onClick={onClearDrawing}
        className="rounded bg-red-500 px-4 py-2 text-white"
      >
        Limpar
      </button>
    </div>
  );
}
