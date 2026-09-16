// Scene grafik sederhana — dipakai hanya untuk memvisualkan titik potong
// dua garis pada pembahasan Level 10 (Metode Gabungan).

import type { Pt } from "./math";

export type Range = { minX: number; maxX: number; minY: number; maxY: number };
export type SceneLine = { a: number; b: number; c: number; tag?: string };
export type ScenePoint = { x: number; y: number; label?: string };

export type Scene = {
  range: Range;
  lines: SceneLine[];
  points: ScenePoint[];
  guides: { x1: number; y1: number; x2: number; y2: number }[];
};

export function buildGraphScene(
  l1: { a: number; b: number; c: number },
  l2: { a: number; b: number; c: number },
  p: Pt
): Scene {
  const span = Math.max(8, p.x + 2, p.y + 2);
  const max = Math.min(Math.ceil(span), 14);
  return {
    range: { minX: -1, maxX: max, minY: -1, maxY: max },
    lines: [
      { ...l1, tag: "①" },
      { ...l2, tag: "②" },
    ],
    points: [{ x: p.x, y: p.y, label: `(${p.x}, ${p.y})` }],
    guides: [
      { x1: p.x, y1: 0, x2: p.x, y2: p.y },
      { x1: 0, y1: p.y, x2: p.x, y2: p.y },
    ],
  };
}
