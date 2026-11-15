
export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  points: Point[];
  color: string;
  width: number;
}

export interface DrawingSettings {
  color: string;
  brushSize: number;
  drawingMode: boolean;
}
