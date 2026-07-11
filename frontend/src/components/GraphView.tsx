import { useEffect, useRef, useState, useCallback } from "react";
import * as go from "../../wailsjs/go/main/App";
import { useAppStore } from "@/store/useAppStore";
import { initCodeMirror } from "@/components/CodeMirrorEditor";
import { clearAutosaveStatus } from "@/hooks/useAutosave";
import { loadFileTree } from "@/components/Sidebar";
import { showModal } from "@/components/ui/Modal";

interface SimNode {
  id: string;
  name: string;
  path: string;
  linkCount: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface SimEdge {
  source: number;
  target: number;
}

const CELL = 120;
const REPULSION = 4000;
const ATTRACTION = 0.003;
const DAMPING = 0.82;
const GRAVITY = 0.008;
const MAX_VEL = 5;
const LABEL_THRESHOLD = 300;
const CANVAS_THRESHOLD = 800;

function buildGrid(nodes: SimNode[]): Map<string, SimNode[]> {
  const grid = new Map<string, SimNode[]>();
  for (const n of nodes) {
    const cx = Math.floor(n.x / CELL);
    const cy = Math.floor(n.y / CELL);
    const key = `${cx},${cy}`;
    const cell = grid.get(key) || [];
    cell.push(n);
    grid.set(key, cell);
  }
  return grid;
}

function getNearby(grid: Map<string, SimNode[]>, node: SimNode): SimNode[] {
  const cx = Math.floor(node.x / CELL);
  const cy = Math.floor(node.y / CELL);
  const nearby: SimNode[] = [];
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const cell = grid.get(`${cx + dx},${cy + dy}`);
      if (cell) nearby.push(...cell);
    }
  }
  return nearby;
}

function tick(nodes: SimNode[], edges: SimEdge[]) {
  const grid = buildGrid(nodes);
  for (const n of nodes) {
    const nearby = getNearby(grid, n);
    for (const o of nearby) {
      if (n === o) continue;
      const dx = n.x - o.x;
      const dy = n.y - o.y;
      const d = Math.max(1, Math.sqrt(dx * dx + dy * dy));
      const f = REPULSION / (d * d);
      n.vx += (dx / d) * f;
      n.vy += (dy / d) * f;
    }
    n.vx -= n.x * GRAVITY;
    n.vy -= n.y * GRAVITY;
  }
  for (const e of edges) {
    const s = nodes[e.source];
    const t = nodes[e.target];
    const dx = t.x - s.x;
    const dy = t.y - s.y;
    const d = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    const f = d * ATTRACTION;
    s.vx += (dx / d) * f * 0.5;
    s.vy += (dy / d) * f * 0.5;
    t.vx -= (dx / d) * f * 0.5;
    t.vy -= (dy / d) * f * 0.5;
  }
  for (const n of nodes) {
    n.vx = Math.max(-MAX_VEL, Math.min(MAX_VEL, n.vx * DAMPING));
    n.vy = Math.max(-MAX_VEL, Math.min(MAX_VEL, n.vy * DAMPING));
    n.x += n.vx;
    n.y += n.vy;
  }
}

const NODE_R = 22;

export default function GraphView() {
  const [graphData, setGraphData] = useState<{
    nodes: { id: string; name: string; path: string; linkCount: number }[];
    edges: { source: string; target: string }[];
  } | null>(null);

  const simNodes = useRef<SimNode[]>([]);
  const simEdges = useRef<SimEdge[]>([]);
  const viewRef = useRef({ x: 0, y: 0, w: 800, h: 600 });
  const panning = useRef(false);
  const panStart = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  const animRef = useRef(0);
  const tickCount = useRef(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isCanvas = useRef(false);

  const theme = useAppStore((s) => s.theme);
  const graphVersion = useAppStore((s) => s.graphVersion);

  useEffect(() => {
    go.GetGraphData().then((data) => {
      setGraphData(data);
      if (data.nodes.length === 0) return;

      isCanvas.current = data.nodes.length > CANVAS_THRESHOLD;

      const nodes: SimNode[] = data.nodes.map((n) => ({
        id: n.id,
        name: n.name,
        path: n.path,
        linkCount: n.linkCount,
        x: (Math.random() - 0.5) * 200,
        y: (Math.random() - 0.5) * 200,
        vx: 0,
        vy: 0,
      }));

      const nodeIndex = new Map<string, number>();
      nodes.forEach((n, i) => nodeIndex.set(n.id, i));

      const edges: SimEdge[] = [];
      for (const e of data.edges) {
        const si = nodeIndex.get(e.source);
        const ti = nodeIndex.get(e.target);
        if (si !== undefined && ti !== undefined && si !== ti) {
          edges.push({ source: si, target: ti });
        }
      }

      simNodes.current = nodes;
      simEdges.current = edges;

      let cx = 0, cy = 0;
      for (const n of nodes) { cx += n.x; cy += n.y; }
      cx /= nodes.length;
      cy /= nodes.length;
      for (const n of nodes) { n.x -= cx; n.y -= cy; }

      tickCount.current = 0;
      cancelAnimationFrame(animRef.current);
      runSim();
    });
  }, [graphVersion]);

  const runSim = useCallback(() => {
    tick(simNodes.current, simEdges.current);
    tickCount.current++;

    if (tickCount.current < 350) {
      animRef.current = requestAnimationFrame(runSim);
    } else {
      renderFrame();
    }
    renderFrame();
  }, []);

  const renderFrame = useCallback(() => {
    const v = viewRef.current;
    if (isCanvas.current) {
      const cnv = canvasRef.current;
      if (!cnv) return;
      const dpr = window.devicePixelRatio || 1;
      cnv.width = cnv.clientWidth * dpr;
      cnv.height = cnv.clientHeight * dpr;
      const ctx = cnv.getContext("2d")!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cnv.width, cnv.height);
      const sx = cnv.clientWidth / v.w;
      const sy = cnv.clientHeight / v.h;
      ctx.save();
      ctx.translate(-v.x * sx + cnv.clientWidth / 2, -v.y * sy + cnv.clientHeight / 2);
      ctx.scale(sx, sy);
      ctx.strokeStyle = theme === "dark" ? "#555" : "#ccc";
      ctx.lineWidth = 1;
      for (const e of simEdges.current) {
        const s = simNodes.current[e.source];
        const t = simNodes.current[e.target];
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.stroke();
      }
      const ink = theme === "dark" ? "#e8dcc8" : "#1a1a1a";
      const chrome = theme === "dark" ? "#1a1a1a" : "#f0e8d8";
      const accent = "#0055ff";
      const border = theme === "dark" ? "#000" : "#1a1a1a";
      for (const n of simNodes.current) {
        const r = NODE_R;
        ctx.fillStyle = n.linkCount > 0 ? accent : chrome;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = border;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = ink;
        ctx.font = `10px "Bricolage Grotesque", sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const display = n.name.length > 14 ? n.name.slice(0, 13) + "…" : n.name;
        ctx.fillText(display, n.x, n.y);
      }
      ctx.restore();
    }
  }, [theme]);

  const openNode = useCallback(async (path: string) => {
    const store = useAppStore.getState();
    try {
      const content = await go.ReadFile(path);
      const name = path.split("/").pop() || "";
      store.setCurrentFile(path, name);
      store.setShowGraph(false);
      clearAutosaveStatus();
      store.setSaveStatus("saved");
      store.setEditorLocked(false);
      store.setPreviewVisible(false);
      await loadFileTree();
      setTimeout(() => initCodeMirror(content), 50);
    } catch (err) {
      console.error("Error opening node:", err);
    }
  }, []);

  const startPan = useCallback((e: React.MouseEvent) => {
    panning.current = true;
    panStart.current = { x: e.clientX, y: e.clientY, vx: viewRef.current.x, vy: viewRef.current.y };
  }, []);

  const doPan = useCallback((e: React.MouseEvent) => {
    if (!panning.current) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    const scaleX = viewRef.current.w / (svgRef.current?.clientWidth || 800);
    const scaleY = viewRef.current.h / (svgRef.current?.clientHeight || 600);
    viewRef.current.x = panStart.current.vx - dx * scaleX;
    viewRef.current.y = panStart.current.vy - dy * scaleY;
    setGraphData((prev) => ({ ...prev! }));
  }, []);

  const endPan = useCallback(() => {
    panning.current = false;
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.15 : 0.87;
    viewRef.current.w *= factor;
    viewRef.current.h *= factor;
    viewRef.current.w = Math.max(100, Math.min(20000, viewRef.current.w));
    viewRef.current.h = Math.max(75, Math.min(15000, viewRef.current.h));
    setGraphData((prev) => ({ ...prev! }));
  }, []);

  if (!graphData) {
    return <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: "var(--color-bg)" }}>
      <p style={{ color: "var(--color-ink-muted)" }}>Carregando grafo...</p>
    </div>;
  }

  if (graphData.nodes.length === 0) {
    return <div className="flex-1 flex flex-col items-center justify-center gap-4" style={{ backgroundColor: "var(--color-bg)" }}>
      <p className="text-lg font-bold" style={{ color: "var(--color-ink-muted)" }}>
        Crie sua primeira nota para come&ccedil;ar
      </p>
      <button
        className="btn-press px-6 py-3 text-sm font-bold text-white"
        style={{ backgroundColor: "var(--color-accent)", border: "var(--border-width) solid var(--color-border)", boxShadow: "var(--shadow)" }}
        onClick={() => {
          const store = useAppStore.getState();
          store.setShowGraph(false);
          const parentPath = store.config?.documents || "";
          showModal("Nova Nota", "nome-da-nota.md", async (name: string) => {
            await go.CreateFile(name, parentPath);
            await loadFileTree();
          });
        }}
      >
        Criar primeira nota
      </button>
    </div>;
  }

  const v = viewRef.current;
  const showLabels = simNodes.current.length <= LABEL_THRESHOLD;

  if (isCanvas.current) {
    return <canvas ref={canvasRef} className="flex-1 w-full h-full" style={{ backgroundColor: "var(--color-bg)", cursor: panning.current ? "grabbing" : "grab" }} onWheel={handleWheel} onMouseDown={startPan} onMouseMove={doPan} onMouseUp={endPan} onMouseLeave={endPan} />;
  }

  const ink = theme === "dark" ? "#e8dcc8" : "#1a1a1a";
  const accent = "#0055ff";
  const border = theme === "dark" ? "#000" : "#1a1a1a";
  const chrome = theme === "dark" ? "#1a1a1a" : "#f0e8d8";

  return (
    <svg
      ref={svgRef}
      viewBox={`${v.x - v.w / 2} ${v.y - v.h / 2} ${v.w} ${v.h}`}
      className="flex-1 w-full h-full"
      style={{ backgroundColor: "var(--color-bg)", cursor: panning.current ? "grabbing" : "grab" }}
      onWheel={handleWheel}
      onMouseDown={startPan}
      onMouseMove={doPan}
      onMouseUp={endPan}
      onMouseLeave={endPan}
    >
      {simEdges.current.map((e, i) => {
        const s = simNodes.current[e.source];
        const t = simNodes.current[e.target];
        return <line key={i} x1={s.x} y1={s.y} x2={t.x} y2={t.y} stroke={theme === "dark" ? "#555" : "#ccc"} strokeWidth={1.5} />;
      })}
      {simNodes.current.map((n) => (
        <g key={n.id} onClick={() => openNode(n.path)} style={{ cursor: "pointer" }}>
          <circle
            cx={n.x}
            cy={n.y}
            r={NODE_R}
            fill={n.linkCount > 0 ? accent : chrome}
            stroke={border}
            strokeWidth={3}
          />
          {showLabels && (
            <text
              x={n.x}
              y={n.y + 1}
              textAnchor="middle"
              dominantBaseline="central"
              fill={n.linkCount > 0 ? "#ffffff" : ink}
              fontFamily="Bricolage Grotesque, sans-serif"
              fontWeight={700}
              fontSize={12}
            >
              {n.name.length > 18 ? n.name.slice(0, 17) + "…" : n.name}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
