"use client";

import { useEffect, useRef } from "react";
import type { Scene } from "@/lib/scene";

const INK = "#18181b";
const GRID = "#e7e7ea";

export default function CartesianCanvas({ scene }: { scene: Scene }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef(scene);
  sceneRef.current = scene;

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    let cssW = 320;

    const draw = () => {
      const sc = sceneRef.current;
      const r = sc.range;
      const spanX = r.maxX - r.minX;
      const spanY = r.maxY - r.minY;
      const scale = cssW / Math.max(spanX, spanY);
      const ox = -r.minX * scale;
      const oy = r.maxY * scale;
      const toX = (x: number) => ox + x * scale;
      const toY = (y: number) => oy - y * scale;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssW);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, cssW, cssW);

      // grid
      ctx.strokeStyle = GRID;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = Math.ceil(r.minX); x <= Math.floor(r.maxX); x++) {
        ctx.moveTo(toX(x), 0);
        ctx.lineTo(toX(x), cssW);
      }
      for (let y = Math.ceil(r.minY); y <= Math.floor(r.maxY); y++) {
        ctx.moveTo(0, toY(y));
        ctx.lineTo(cssW, toY(y));
      }
      ctx.stroke();

      // sumbu + panah
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(0, oy);
      ctx.lineTo(cssW, oy);
      ctx.moveTo(ox, 0);
      ctx.lineTo(ox, cssW);
      ctx.stroke();
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.moveTo(cssW - 1, oy);
      ctx.lineTo(cssW - 9, oy - 4);
      ctx.lineTo(cssW - 9, oy + 4);
      ctx.moveTo(ox, 1);
      ctx.lineTo(ox - 4, 9);
      ctx.lineTo(ox + 4, 9);
      ctx.fill();

      // label angka & nama sumbu
      const every = Math.max(spanX, spanY) > 10 ? 2 : 1;
      const nearBottom = oy > cssW - 16;
      const nearLeft = ox < 16;
      const halo = (t: string, px: number, py: number) => {
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(255,255,255,0.92)";
        ctx.strokeText(t, px, py);
        ctx.fillText(t, px, py);
      };
      ctx.font = '600 10.5px "IBM Plex Mono", ui-monospace, monospace';
      ctx.fillStyle = "#52525b";
      ctx.textAlign = "center";
      for (let x = Math.ceil(r.minX); x <= Math.floor(r.maxX); x++) {
        if (x === 0 || x % every !== 0 || x === Math.floor(r.maxX)) continue;
        ctx.textBaseline = nearBottom ? "bottom" : "top";
        halo(String(x).replace("-", "−"), Math.max(10, Math.min(cssW - 10, toX(x))), nearBottom ? oy - 5 : oy + 5);
      }
      ctx.textBaseline = "middle";
      for (let y = Math.ceil(r.minY); y <= Math.floor(r.maxY); y++) {
        if (y === 0 || y % every !== 0 || y === Math.floor(r.maxY)) continue;
        ctx.textAlign = nearLeft ? "left" : "right";
        halo(String(y).replace("-", "−"), nearLeft ? ox + 6 : ox - 6, Math.max(9, Math.min(cssW - 9, toY(y))));
      }
      ctx.textAlign = nearLeft ? "left" : "right";
      ctx.textBaseline = nearBottom ? "bottom" : "top";
      halo("O", nearLeft ? ox + 6 : ox - 6, nearBottom ? oy - 5 : oy + 5);
      ctx.font = 'italic 800 13px "Space Grotesk", ui-sans-serif, sans-serif';
      ctx.fillStyle = INK;
      ctx.textAlign = "right";
      ctx.textBaseline = nearBottom ? "bottom" : "top";
      halo("x", cssW - 9, nearBottom ? oy - 5 : oy + 6);
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      halo("y", Math.min(ox + 8, cssW - 16), 7);

      // garis
      for (const ln of sc.lines) {
        const pad = 4;
        let p1: { x: number; y: number } | null = null;
        let p2: { x: number; y: number } | null = null;
        if (Math.abs(ln.b) > 1e-9) {
          p1 = { x: r.minX - pad, y: (ln.c - ln.a * (r.minX - pad)) / ln.b };
          p2 = { x: r.maxX + pad, y: (ln.c - ln.a * (r.maxX + pad)) / ln.b };
        } else if (Math.abs(ln.a) > 1e-9) {
          p1 = { x: ln.c / ln.a, y: r.minY - pad };
          p2 = { x: ln.c / ln.a, y: r.maxY + pad };
        }
        if (!p1 || !p2) continue;
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, cssW, cssW);
        ctx.clip();
        ctx.beginPath();
        ctx.moveTo(toX(p1.x), toY(p1.y));
        ctx.lineTo(toX(p2.x), toY(p2.y));
        ctx.strokeStyle = INK;
        ctx.lineWidth = 2.6;
        ctx.stroke();
        ctx.restore();
      }

      // garis bantu
      ctx.strokeStyle = "rgba(24,24,27,0.5)";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      for (const g of sc.guides) {
        ctx.moveTo(toX(g.x1), toY(g.y1));
        ctx.lineTo(toX(g.x2), toY(g.y2));
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // titik
      for (const p of sc.points) {
        const px = toX(p.x);
        const py = toY(p.y);
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fillStyle = INK;
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();
        if (p.label) {
          ctx.font = '700 11.5px "IBM Plex Mono", ui-monospace, monospace';
          const w = ctx.measureText(p.label).width;
          const lx = Math.max(2, Math.min(px + 10, cssW - w - 14));
          const ly = Math.max(2, Math.min(py - 26, cssW - 22));
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = INK;
          ctx.lineWidth = 1.4;
          const rr = 4;
          ctx.beginPath();
          ctx.moveTo(lx - 4 + rr, ly - 3);
          ctx.arcTo(lx + w + 4, ly - 3, lx + w + 4, ly + 14, rr);
          ctx.arcTo(lx + w + 4, ly + 14, lx - 4, ly + 14, rr);
          ctx.arcTo(lx - 4, ly + 14, lx - 4, ly - 3, rr);
          ctx.arcTo(lx - 4, ly - 3, lx + w + 4, ly - 3, rr);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = INK;
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          ctx.fillText(p.label, lx, ly + 6);
        }
      }
    };

    const resize = () => {
      cssW = wrap.clientWidth;
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssW * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssW}px`;
      draw();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [scene]);

  return (
    <div ref={wrapRef} className="w-full select-none">
      <canvas
        ref={canvasRef}
        className="block w-full rounded-2xl border border-zinc-900/90 bg-white"
      />
    </div>
  );
}
