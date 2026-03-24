// Jigsaw puzzle utilities

export type EdgeType = 1 | -1 | 0; // 1 = tab out, -1 = blank in, 0 = flat border

export interface PieceEdges {
  top: EdgeType;
  right: EdgeType;
  bottom: EdgeType;
  left: EdgeType;
}

export interface PuzzlePiece {
  id: number;
  col: number;
  row: number;
  edges: PieceEdges;
  // Current position (screen coords, center of piece)
  x: number;
  y: number;
  placed: boolean;
}

/** Generate edge layout for an NxN grid. Adjacent pieces have opposite tabs. */
export function generatePieces(cols: number, rows: number): PuzzlePiece[] {
  // hEdges[row][col] = edge type between row and row+1 at col
  const hEdges: EdgeType[][] = Array.from({ length: rows - 1 }, () =>
    Array.from({ length: cols }, () => (Math.random() > 0.5 ? 1 : -1) as EdgeType)
  );
  // vEdges[row][col] = edge type between col and col+1 at row
  const vEdges: EdgeType[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols - 1 }, () => (Math.random() > 0.5 ? 1 : -1) as EdgeType)
  );

  const pieces: PuzzlePiece[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      pieces.push({
        id: row * cols + col,
        col,
        row,
        edges: {
          top: row === 0 ? 0 : hEdges[row - 1][col],
          bottom: row === rows - 1 ? 0 : ((-hEdges[row][col]) as EdgeType),
          left: col === 0 ? 0 : vEdges[row][col - 1],
          right: col === cols - 1 ? 0 : ((-vEdges[row][col]) as EdgeType),
        },
        x: 0,
        y: 0,
        placed: false,
      });
    }
  }
  return pieces;
}

/** Draw a jigsaw edge from (x1,y1) to (x2,y2) with given tab type */
export function drawJigsawEdge(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  tab: EdgeType
) {
  if (tab === 0) {
    ctx.lineTo(x2, y2);
    return;
  }

  const dx = x2 - x1;
  const dy = y2 - y1;
  // Perpendicular direction, scaled by tab
  const px = (-dy * tab) * 0.28;
  const py = (dx * tab) * 0.28;

  const m1x = x1 + dx * 0.35;
  const m1y = y1 + dy * 0.35;
  const m2x = x1 + dx * 0.65;
  const m2y = y1 + dy * 0.65;

  // Approach tab
  ctx.bezierCurveTo(
    x1 + dx * 0.2, y1 + dy * 0.2,
    m1x + px * 0.3, m1y + py * 0.3,
    m1x + px, m1y + py
  );
  // Tab arc top — symmetric control points
  ctx.bezierCurveTo(
    m1x + px + dx * 0.1, m1y + py + dy * 0.1,
    m2x + px - dx * 0.1, m2y + py - dy * 0.1,
    m2x + px, m2y + py
  );
  // Leave tab
  ctx.bezierCurveTo(
    m2x + px * 0.3, m2y + py * 0.3,
    x2 - dx * 0.2, y2 - dy * 0.2,
    x2, y2
  );
}

/**
 * Build a clip path for one piece on a canvas.
 * pieceW/H = cell size, tab = extra space around piece for tabs.
 * Canvas origin = top-left of piece cell (NOT including tab padding).
 */
export function buildPiecePath(
  ctx: CanvasRenderingContext2D,
  edges: PieceEdges,
  pw: number,
  ph: number,
  pad: number
) {
  const x = pad;
  const y = pad;
  ctx.beginPath();
  ctx.moveTo(x, y);
  // Top edge (left→right)
  drawJigsawEdge(ctx, x, y, x + pw, y, edges.top);
  // Right edge (top→bottom)
  drawJigsawEdge(ctx, x + pw, y, x + pw, y + ph, edges.right);
  // Bottom edge (right→left)
  drawJigsawEdge(ctx, x + pw, y + ph, x, y + ph, edges.bottom);
  // Left edge (bottom→top)
  drawJigsawEdge(ctx, x, y + ph, x, y, edges.left);
  ctx.closePath();
}

// ── Shared helpers ────────────────────────────────────────
function drawStars(ctx: CanvasRenderingContext2D, w: number, h: number, count: number, yLimit = 0.85) {
  for (let i = 0; i < count; i++) {
    const sx = Math.random() * w;
    const sy = Math.random() * h * yLimit;
    const r = 1 + Math.random() * 2.5;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${0.5 + Math.random() * 0.5})`;
    ctx.fill();
  }
}

function drawAurora(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const colors = [
    "rgba(0,255,150,0.08)",
    "rgba(80,200,255,0.06)",
    "rgba(150,100,255,0.07)",
    "rgba(0,220,180,0.06)",
  ];
  for (let i = 0; i < colors.length; i++) {
    const y = h * (0.08 + i * 0.1);
    ctx.fillStyle = colors[i];
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= w; x += w * 0.05) {
      const wave = Math.sin(x / w * Math.PI * 3 + i * 1.5) * h * 0.08;
      ctx.lineTo(x, y + wave);
    }
    ctx.lineTo(w, y + h * 0.15);
    ctx.lineTo(0, y + h * 0.15);
    ctx.closePath();
    ctx.fill();
  }
}

function drawMoon(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
  glow.addColorStop(0, "rgba(220,230,255,0.25)");
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, r * 3, 0, Math.PI * 2);
  ctx.fill();
  const fill = ctx.createRadialGradient(x - r * 0.2, y - r * 0.2, 0, x, y, r);
  fill.addColorStop(0, "#f0f4ff");
  fill.addColorStop(0.7, "#c8d4f0");
  fill.addColorStop(1, "#9ab0d8");
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawSun(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
  glow.addColorStop(0, "rgba(255,200,50,0.4)");
  glow.addColorStop(0.5, "rgba(255,150,50,0.15)");
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, r * 4, 0, Math.PI * 2);
  ctx.fill();
  const fill = ctx.createRadialGradient(x, y, 0, x, y, r);
  fill.addColorStop(0, "#fff8e0");
  fill.addColorStop(0.6, "#ffd060");
  fill.addColorStop(1, "#ff9020");
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.beginPath();
  ctx.arc(x, y, s * 0.5, 0, Math.PI * 2);
  ctx.arc(x + s * 0.4, y - s * 0.2, s * 0.4, 0, Math.PI * 2);
  ctx.arc(x + s * 0.8, y, s * 0.45, 0, Math.PI * 2);
  ctx.arc(x + s * 0.35, y + s * 0.15, s * 0.35, 0, Math.PI * 2);
  ctx.fill();
}

// ── Image 1: Cat on rooftop under moon ────────────────────
function drawCatRooftop(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Night sky — deep blue/purple instead of near-black
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#0a1030");
  sky.addColorStop(0.4, "#152050");
  sky.addColorStop(0.7, "#1a2860");
  sky.addColorStop(1, "#1e3070");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  drawAurora(ctx, w, h);
  drawStars(ctx, w, h, 200);
  drawMoon(ctx, w * 0.78, h * 0.15, Math.min(w, h) * 0.1);

  // City silhouette — buildings
  ctx.fillStyle = "#0a0e1e";
  const buildings = [
    { x: 0, bw: w * 0.12, bh: h * 0.35 },
    { x: w * 0.1, bw: w * 0.08, bh: h * 0.5 },
    { x: w * 0.17, bw: w * 0.1, bh: h * 0.4 },
    { x: w * 0.28, bw: w * 0.07, bh: h * 0.55 },
    { x: w * 0.55, bw: w * 0.09, bh: h * 0.45 },
    { x: w * 0.65, bw: w * 0.12, bh: h * 0.38 },
    { x: w * 0.78, bw: w * 0.08, bh: h * 0.52 },
    { x: w * 0.88, bw: w * 0.14, bh: h * 0.42 },
  ];
  for (const b of buildings) {
    ctx.fillRect(b.x, h - b.bh, b.bw, b.bh);
    // Windows
    ctx.fillStyle = "rgba(255,220,100,0.6)";
    const winW = b.bw * 0.15;
    const winH = b.bw * 0.12;
    for (let wy = h - b.bh + b.bw * 0.2; wy < h - b.bw * 0.2; wy += b.bw * 0.25) {
      for (let wx = b.x + b.bw * 0.15; wx < b.x + b.bw - winW; wx += b.bw * 0.3) {
        if (Math.random() > 0.35) ctx.fillRect(wx, wy, winW, winH);
      }
    }
    ctx.fillStyle = "#0a0e1e";
  }

  // Main rooftop
  ctx.fillStyle = "#1a1a2e";
  ctx.beginPath();
  ctx.moveTo(w * 0.3, h * 0.55);
  ctx.lineTo(w * 0.5, h * 0.42);
  ctx.lineTo(w * 0.7, h * 0.55);
  ctx.lineTo(w * 0.7, h);
  ctx.lineTo(w * 0.3, h);
  ctx.closePath();
  ctx.fill();
  // Roof edge
  ctx.strokeStyle = "#2a2a4e";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.28, h * 0.56);
  ctx.lineTo(w * 0.5, h * 0.41);
  ctx.lineTo(w * 0.72, h * 0.56);
  ctx.stroke();

  // Cat silhouette sitting on roof peak
  const cx = w * 0.48;
  const cy = h * 0.42;
  const cs = Math.min(w, h) * 0.12;

  ctx.fillStyle = "#0f0f1f";
  // Body
  ctx.beginPath();
  ctx.ellipse(cx, cy, cs * 0.35, cs * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Head
  ctx.beginPath();
  ctx.arc(cx, cy - cs * 0.55, cs * 0.25, 0, Math.PI * 2);
  ctx.fill();
  // Ears
  ctx.beginPath();
  ctx.moveTo(cx - cs * 0.18, cy - cs * 0.7);
  ctx.lineTo(cx - cs * 0.28, cy - cs * 0.95);
  ctx.lineTo(cx - cs * 0.05, cy - cs * 0.75);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + cs * 0.18, cy - cs * 0.7);
  ctx.lineTo(cx + cs * 0.28, cy - cs * 0.95);
  ctx.lineTo(cx + cs * 0.05, cy - cs * 0.75);
  ctx.fill();
  // Tail
  ctx.strokeStyle = "#0f0f1f";
  ctx.lineWidth = cs * 0.08;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx + cs * 0.3, cy + cs * 0.2);
  ctx.bezierCurveTo(cx + cs * 0.6, cy, cx + cs * 0.7, cy - cs * 0.4, cx + cs * 0.55, cy - cs * 0.5);
  ctx.stroke();
  // Eyes
  ctx.fillStyle = "#66ff88";
  ctx.beginPath();
  ctx.ellipse(cx - cs * 0.1, cy - cs * 0.55, cs * 0.04, cs * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + cs * 0.1, cy - cs * 0.55, cs * 0.04, cs * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
}

// ── Image 2: Mountain lake landscape ──────────────────────
function drawMountainLake(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Sky
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.5);
  sky.addColorStop(0, "#1a3a5c");
  sky.addColorStop(0.4, "#3a7abf");
  sky.addColorStop(1, "#7ac4e8");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  drawCloud(ctx, w * 0.15, h * 0.1, w * 0.08);
  drawCloud(ctx, w * 0.6, h * 0.08, w * 0.06);
  drawCloud(ctx, w * 0.85, h * 0.14, w * 0.07);

  // Distant mountain
  ctx.fillStyle = "#5a7a9a";
  ctx.beginPath();
  ctx.moveTo(0, h * 0.45);
  ctx.lineTo(w * 0.15, h * 0.2);
  ctx.lineTo(w * 0.3, h * 0.35);
  ctx.lineTo(w * 0.45, h * 0.12);
  ctx.lineTo(w * 0.6, h * 0.3);
  ctx.lineTo(w * 0.75, h * 0.18);
  ctx.lineTo(w * 0.9, h * 0.32);
  ctx.lineTo(w, h * 0.25);
  ctx.lineTo(w, h * 0.45);
  ctx.closePath();
  ctx.fill();

  // Snow caps
  ctx.fillStyle = "#e8f0ff";
  ctx.beginPath();
  ctx.moveTo(w * 0.45, h * 0.12);
  ctx.lineTo(w * 0.4, h * 0.2);
  ctx.lineTo(w * 0.42, h * 0.18);
  ctx.lineTo(w * 0.48, h * 0.2);
  ctx.lineTo(w * 0.5, h * 0.18);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(w * 0.75, h * 0.18);
  ctx.lineTo(w * 0.71, h * 0.25);
  ctx.lineTo(w * 0.74, h * 0.23);
  ctx.lineTo(w * 0.79, h * 0.25);
  ctx.closePath();
  ctx.fill();

  // Near mountain
  ctx.fillStyle = "#3a5a3a";
  ctx.beginPath();
  ctx.moveTo(0, h * 0.5);
  ctx.lineTo(w * 0.1, h * 0.35);
  ctx.lineTo(w * 0.25, h * 0.5);
  ctx.lineTo(w, h * 0.5);
  ctx.lineTo(w, h * 0.5);
  ctx.closePath();
  ctx.fill();

  // Lake
  const lake = ctx.createLinearGradient(0, h * 0.5, 0, h * 0.75);
  lake.addColorStop(0, "#4a8ab8");
  lake.addColorStop(0.5, "#3a7aaa");
  lake.addColorStop(1, "#2a5a7a");
  ctx.fillStyle = lake;
  ctx.fillRect(0, h * 0.5, w, h * 0.25);

  // Reflection shimmer
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 20; i++) {
    const rx = Math.random() * w;
    const ry = h * 0.52 + Math.random() * h * 0.2;
    const rw = 5 + Math.random() * 20;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx + rw, ry);
    ctx.stroke();
  }

  // Grass shore
  const shore = ctx.createLinearGradient(0, h * 0.72, 0, h);
  shore.addColorStop(0, "#2a5a2a");
  shore.addColorStop(0.5, "#1a4a1a");
  shore.addColorStop(1, "#0f350f");
  ctx.fillStyle = shore;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.75);
  ctx.bezierCurveTo(w * 0.2, h * 0.72, w * 0.4, h * 0.76, w * 0.6, h * 0.73);
  ctx.bezierCurveTo(w * 0.8, h * 0.7, w * 0.9, h * 0.74, w, h * 0.72);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // Pine trees
  const drawPine = (tx: number, ty: number, th: number) => {
    ctx.fillStyle = "#0d2e0d";
    // Trunk
    ctx.fillRect(tx - th * 0.04, ty, th * 0.08, th * 0.3);
    // Layers
    for (let i = 0; i < 3; i++) {
      const ly = ty - th * 0.2 * i;
      const lw = th * (0.3 - i * 0.06);
      ctx.fillStyle = `rgb(${15 + i * 10}, ${50 + i * 15}, ${15 + i * 10})`;
      ctx.beginPath();
      ctx.moveTo(tx, ly - th * 0.35);
      ctx.lineTo(tx - lw, ly);
      ctx.lineTo(tx + lw, ly);
      ctx.closePath();
      ctx.fill();
    }
  };
  drawPine(w * 0.05, h * 0.74, h * 0.22);
  drawPine(w * 0.12, h * 0.72, h * 0.26);
  drawPine(w * 0.18, h * 0.73, h * 0.2);
  drawPine(w * 0.82, h * 0.71, h * 0.24);
  drawPine(w * 0.9, h * 0.73, h * 0.2);
  drawPine(w * 0.95, h * 0.72, h * 0.18);
}

// ── Image 3: Ocean sunset with whale ──────────────────────
function drawOceanWhale(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Sunset sky
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.55);
  sky.addColorStop(0, "#1a0533");
  sky.addColorStop(0.3, "#6a1b5a");
  sky.addColorStop(0.6, "#e85050");
  sky.addColorStop(0.85, "#ff9040");
  sky.addColorStop(1, "#ffcc60");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  drawSun(ctx, w * 0.5, h * 0.38, Math.min(w, h) * 0.1);

  // Ocean
  const ocean = ctx.createLinearGradient(0, h * 0.5, 0, h);
  ocean.addColorStop(0, "#1a3a6a");
  ocean.addColorStop(0.3, "#0f2a5a");
  ocean.addColorStop(1, "#08183a");
  ctx.fillStyle = ocean;
  ctx.fillRect(0, h * 0.5, w, h * 0.5);

  // Sun reflection on water
  const ref = ctx.createLinearGradient(w * 0.35, h * 0.5, w * 0.65, h);
  ref.addColorStop(0, "rgba(255,180,60,0.3)");
  ref.addColorStop(0.5, "rgba(255,120,40,0.15)");
  ref.addColorStop(1, "transparent");
  ctx.fillStyle = ref;
  ctx.fillRect(w * 0.35, h * 0.5, w * 0.3, h * 0.5);

  // Waves
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 1.5;
  for (let wy = h * 0.52; wy < h; wy += h * 0.04) {
    ctx.beginPath();
    ctx.moveTo(0, wy);
    for (let wx = 0; wx < w; wx += w * 0.05) {
      ctx.quadraticCurveTo(wx + w * 0.025, wy + (Math.random() - 0.5) * 4, wx + w * 0.05, wy);
    }
    ctx.stroke();
  }

  // Whale body
  const whX = w * 0.55;
  const whY = h * 0.52;
  const whS = Math.min(w, h) * 0.18;

  ctx.fillStyle = "#1a2a4a";
  ctx.beginPath();
  ctx.ellipse(whX, whY + whS * 0.15, whS * 0.7, whS * 0.35, -0.1, 0, Math.PI);
  ctx.fill();

  // Whale belly (lighter)
  ctx.fillStyle = "#3a5a7a";
  ctx.beginPath();
  ctx.ellipse(whX, whY + whS * 0.2, whS * 0.55, whS * 0.2, -0.1, 0, Math.PI);
  ctx.fill();

  // Whale head
  ctx.fillStyle = "#1a2a4a";
  ctx.beginPath();
  ctx.ellipse(whX - whS * 0.45, whY + whS * 0.05, whS * 0.35, whS * 0.3, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Whale eye
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(whX - whS * 0.55, whY + whS * 0.0, whS * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0a0a2a";
  ctx.beginPath();
  ctx.arc(whX - whS * 0.55, whY + whS * 0.0, whS * 0.02, 0, Math.PI * 2);
  ctx.fill();

  // Whale tail
  ctx.fillStyle = "#1a2a4a";
  ctx.beginPath();
  ctx.moveTo(whX + whS * 0.6, whY + whS * 0.1);
  ctx.bezierCurveTo(whX + whS * 0.8, whY - whS * 0.1, whX + whS * 1.0, whY - whS * 0.4, whX + whS * 1.1, whY - whS * 0.5);
  ctx.bezierCurveTo(whX + whS * 0.95, whY - whS * 0.25, whX + whS * 0.85, whY - whS * 0.15, whX + whS * 0.7, whY + whS * 0.05);
  ctx.bezierCurveTo(whX + whS * 0.85, whY - whS * 0.15, whX + whS * 0.95, whY - whS * 0.1, whX + whS * 1.1, whY - whS * 0.15);
  ctx.bezierCurveTo(whX + whS * 1.0, whY + whS * 0.05, whX + whS * 0.85, whY + whS * 0.15, whX + whS * 0.6, whY + whS * 0.15);
  ctx.closePath();
  ctx.fill();

  // Water splash near whale
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  for (let i = 0; i < 6; i++) {
    const sx = whX - whS * 0.7 + Math.random() * whS * 1.4;
    const sy = whY + whS * 0.1 + Math.random() * whS * 0.15;
    ctx.beginPath();
    ctx.arc(sx, sy, 1 + Math.random() * 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Birds in sky
  ctx.strokeStyle = "#2a1a3a";
  ctx.lineWidth = 1.5;
  const drawBird = (bx: number, by: number, bs: number) => {
    ctx.beginPath();
    ctx.moveTo(bx - bs, by + bs * 0.3);
    ctx.quadraticCurveTo(bx - bs * 0.3, by - bs * 0.3, bx, by);
    ctx.quadraticCurveTo(bx + bs * 0.3, by - bs * 0.3, bx + bs, by + bs * 0.3);
    ctx.stroke();
  };
  drawBird(w * 0.2, h * 0.15, w * 0.025);
  drawBird(w * 0.25, h * 0.12, w * 0.02);
  drawBird(w * 0.3, h * 0.18, w * 0.015);
  drawBird(w * 0.7, h * 0.2, w * 0.02);
  drawBird(w * 0.75, h * 0.16, w * 0.018);
}

// ── Image 4: Sunflower field with butterfly ───────────────
function drawSunflowerField(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Blue sky
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.5);
  sky.addColorStop(0, "#1a5acc");
  sky.addColorStop(1, "#6ab8e8");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  drawCloud(ctx, w * 0.1, h * 0.12, w * 0.07);
  drawCloud(ctx, w * 0.55, h * 0.08, w * 0.09);
  drawCloud(ctx, w * 0.8, h * 0.15, w * 0.06);

  // Green field
  const field = ctx.createLinearGradient(0, h * 0.45, 0, h);
  field.addColorStop(0, "#4a9a30");
  field.addColorStop(0.4, "#3a8a20");
  field.addColorStop(1, "#2a6a15");
  ctx.fillStyle = field;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.5);
  ctx.bezierCurveTo(w * 0.3, h * 0.45, w * 0.7, h * 0.48, w, h * 0.46);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // Sunflowers
  const drawSunflower = (fx: number, fy: number, fs: number) => {
    // Stem
    ctx.strokeStyle = "#2a6a15";
    ctx.lineWidth = fs * 0.08;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.bezierCurveTo(fx - fs * 0.1, fy + fs * 0.5, fx + fs * 0.05, fy + fs, fx, fy + fs * 1.5);
    ctx.stroke();
    // Leaf
    ctx.fillStyle = "#3a8a20";
    ctx.beginPath();
    ctx.moveTo(fx - fs * 0.05, fy + fs * 0.7);
    ctx.bezierCurveTo(fx - fs * 0.4, fy + fs * 0.5, fx - fs * 0.5, fy + fs * 0.7, fx - fs * 0.15, fy + fs * 0.8);
    ctx.closePath();
    ctx.fill();
    // Petals
    const petals = 12;
    for (let i = 0; i < petals; i++) {
      const angle = (i / petals) * Math.PI * 2;
      const px = fx + Math.cos(angle) * fs * 0.35;
      const py = fy + Math.sin(angle) * fs * 0.35;
      ctx.fillStyle = i % 2 === 0 ? "#ffcc00" : "#ffaa00";
      ctx.beginPath();
      ctx.ellipse(px, py, fs * 0.18, fs * 0.08, angle, 0, Math.PI * 2);
      ctx.fill();
    }
    // Center
    ctx.fillStyle = "#5a3a10";
    ctx.beginPath();
    ctx.arc(fx, fy, fs * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#4a2a08";
    ctx.beginPath();
    ctx.arc(fx, fy, fs * 0.12, 0, Math.PI * 2);
    ctx.fill();
    // Seeds dots
    ctx.fillStyle = "#6a4a18";
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const r = fs * 0.06;
      ctx.beginPath();
      ctx.arc(fx + Math.cos(a) * r, fy + Math.sin(a) * r, fs * 0.015, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  drawSunflower(w * 0.15, h * 0.32, h * 0.2);
  drawSunflower(w * 0.35, h * 0.25, h * 0.25);
  drawSunflower(w * 0.5, h * 0.3, h * 0.22);
  drawSunflower(w * 0.7, h * 0.28, h * 0.23);
  drawSunflower(w * 0.88, h * 0.35, h * 0.18);
  // Background smaller flowers
  drawSunflower(w * 0.25, h * 0.42, h * 0.1);
  drawSunflower(w * 0.6, h * 0.44, h * 0.09);
  drawSunflower(w * 0.8, h * 0.46, h * 0.08);

  // Butterfly
  const bx = w * 0.42;
  const by = h * 0.18;
  const bs = Math.min(w, h) * 0.05;
  ctx.fillStyle = "#ff6090";
  ctx.beginPath();
  ctx.ellipse(bx - bs * 0.6, by - bs * 0.3, bs * 0.5, bs * 0.7, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ff80a0";
  ctx.beginPath();
  ctx.ellipse(bx + bs * 0.6, by - bs * 0.3, bs * 0.5, bs * 0.7, 0.3, 0, Math.PI * 2);
  ctx.fill();
  // Lower wings
  ctx.fillStyle = "#ff4080";
  ctx.beginPath();
  ctx.ellipse(bx - bs * 0.4, by + bs * 0.3, bs * 0.35, bs * 0.45, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(bx + bs * 0.4, by + bs * 0.3, bs * 0.35, bs * 0.45, 0.2, 0, Math.PI * 2);
  ctx.fill();
  // Body
  ctx.fillStyle = "#2a1a10";
  ctx.beginPath();
  ctx.ellipse(bx, by, bs * 0.08, bs * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Antennae
  ctx.strokeStyle = "#2a1a10";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(bx, by - bs * 0.4);
  ctx.quadraticCurveTo(bx - bs * 0.3, by - bs * 0.8, bx - bs * 0.4, by - bs * 0.9);
  ctx.moveTo(bx, by - bs * 0.4);
  ctx.quadraticCurveTo(bx + bs * 0.3, by - bs * 0.8, bx + bs * 0.4, by - bs * 0.9);
  ctx.stroke();
}

// ── Image 5: Cozy house at night ──────────────────────────
function drawCozyHouse(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Night sky — deep blue/purple with visible color
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.6);
  sky.addColorStop(0, "#0e1040");
  sky.addColorStop(0.4, "#1a2060");
  sky.addColorStop(1, "#2a3070");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  drawAurora(ctx, w, h);
  drawStars(ctx, w, h, 160, 0.5);
  drawMoon(ctx, w * 0.82, h * 0.12, Math.min(w, h) * 0.07);

  // Snowy ground
  const ground = ctx.createLinearGradient(0, h * 0.6, 0, h);
  ground.addColorStop(0, "#c8d8f0");
  ground.addColorStop(0.5, "#a8c0e0");
  ground.addColorStop(1, "#88a0c8");
  ctx.fillStyle = ground;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.65);
  ctx.bezierCurveTo(w * 0.2, h * 0.6, w * 0.5, h * 0.63, w * 0.7, h * 0.58);
  ctx.bezierCurveTo(w * 0.85, h * 0.62, w * 0.95, h * 0.6, w, h * 0.62);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // House body
  const hx = w * 0.3;
  const hy = h * 0.35;
  const hw = w * 0.4;
  const hh = h * 0.32;

  ctx.fillStyle = "#5a3a2a";
  ctx.fillRect(hx, hy, hw, hh);

  // Roof
  ctx.fillStyle = "#8a2a2a";
  ctx.beginPath();
  ctx.moveTo(hx - hw * 0.1, hy);
  ctx.lineTo(hx + hw * 0.5, hy - hh * 0.5);
  ctx.lineTo(hx + hw * 1.1, hy);
  ctx.closePath();
  ctx.fill();
  // Snow on roof
  ctx.fillStyle = "#e0e8ff";
  ctx.beginPath();
  ctx.moveTo(hx - hw * 0.08, hy + 2);
  ctx.lineTo(hx + hw * 0.5, hy - hh * 0.48);
  ctx.lineTo(hx + hw * 1.08, hy + 2);
  ctx.bezierCurveTo(hx + hw * 0.9, hy - hh * 0.05, hx + hw * 0.6, hy - hh * 0.35, hx + hw * 0.5, hy - hh * 0.4);
  ctx.bezierCurveTo(hx + hw * 0.4, hy - hh * 0.35, hx + hw * 0.1, hy - hh * 0.05, hx - hw * 0.08, hy + 2);
  ctx.closePath();
  ctx.fill();

  // Chimney
  ctx.fillStyle = "#6a3a2a";
  ctx.fillRect(hx + hw * 0.7, hy - hh * 0.35, hw * 0.12, hh * 0.35);
  // Smoke
  ctx.fillStyle = "rgba(200,210,230,0.3)";
  ctx.beginPath();
  ctx.arc(hx + hw * 0.76, hy - hh * 0.4, w * 0.015, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(200,210,230,0.2)";
  ctx.beginPath();
  ctx.arc(hx + hw * 0.8, hy - hh * 0.5, w * 0.02, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(hx + hw * 0.78, hy - hh * 0.62, w * 0.025, 0, Math.PI * 2);
  ctx.fill();

  // Door
  ctx.fillStyle = "#3a2218";
  const dw = hw * 0.18;
  const dh = hh * 0.5;
  ctx.fillRect(hx + hw * 0.41, hy + hh - dh, dw, dh);
  // Doorknob
  ctx.fillStyle = "#d4a040";
  ctx.beginPath();
  ctx.arc(hx + hw * 0.41 + dw * 0.8, hy + hh - dh * 0.45, dw * 0.06, 0, Math.PI * 2);
  ctx.fill();

  // Windows with warm glow
  const drawWindow = (wx: number, wy: number, ww: number, wh: number) => {
    // Window glow
    const glow = ctx.createRadialGradient(wx + ww / 2, wy + wh / 2, 0, wx + ww / 2, wy + wh / 2, ww * 1.5);
    glow.addColorStop(0, "rgba(255,200,80,0.3)");
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.fillRect(wx - ww, wy - wh, ww * 3, wh * 3);
    // Pane
    ctx.fillStyle = "#ffdd80";
    ctx.fillRect(wx, wy, ww, wh);
    // Frame
    ctx.strokeStyle = "#4a2a18";
    ctx.lineWidth = 2;
    ctx.strokeRect(wx, wy, ww, wh);
    // Cross
    ctx.beginPath();
    ctx.moveTo(wx + ww / 2, wy);
    ctx.lineTo(wx + ww / 2, wy + wh);
    ctx.moveTo(wx, wy + wh / 2);
    ctx.lineTo(wx + ww, wy + wh / 2);
    ctx.stroke();
  };
  drawWindow(hx + hw * 0.1, hy + hh * 0.15, hw * 0.2, hh * 0.25);
  drawWindow(hx + hw * 0.65, hy + hh * 0.15, hw * 0.2, hh * 0.25);

  // Snow-covered trees
  const drawSnowTree = (tx: number, ty: number, th: number) => {
    ctx.fillStyle = "#3a2a1a";
    ctx.fillRect(tx - th * 0.04, ty, th * 0.08, th * 0.25);
    for (let i = 0; i < 3; i++) {
      const ly = ty - th * 0.2 * i;
      const lw = th * (0.25 - i * 0.05);
      ctx.fillStyle = "#1a4a1a";
      ctx.beginPath();
      ctx.moveTo(tx, ly - th * 0.3);
      ctx.lineTo(tx - lw, ly);
      ctx.lineTo(tx + lw, ly);
      ctx.closePath();
      ctx.fill();
      // Snow on branches
      ctx.fillStyle = "#d8e8ff";
      ctx.beginPath();
      ctx.moveTo(tx, ly - th * 0.3);
      ctx.lineTo(tx - lw * 0.5, ly - th * 0.1);
      ctx.lineTo(tx + lw * 0.5, ly - th * 0.1);
      ctx.closePath();
      ctx.fill();
    }
  };
  drawSnowTree(w * 0.08, h * 0.5, h * 0.25);
  drawSnowTree(w * 0.16, h * 0.52, h * 0.2);
  drawSnowTree(w * 0.82, h * 0.48, h * 0.28);
  drawSnowTree(w * 0.92, h * 0.52, h * 0.22);

  // Snowflakes
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  for (let i = 0; i < 40; i++) {
    const sx = Math.random() * w;
    const sy = Math.random() * h * 0.7;
    ctx.beginPath();
    ctx.arc(sx, sy, 1 + Math.random() * 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── Image selector ────────────────────────────────────────
const IMAGE_DRAWERS = [
  drawCatRooftop,
  drawMountainLake,
  drawOceanWhale,
  drawSunflowerField,
  drawCozyHouse,
];

/** Draw a random concrete puzzle image on a canvas */
export function drawPuzzleImage(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  const idx = Math.floor(Math.random() * IMAGE_DRAWERS.length);
  IMAGE_DRAWERS[idx](ctx, canvas.width, canvas.height);
}
