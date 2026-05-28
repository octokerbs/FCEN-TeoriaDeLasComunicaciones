"use client";

type Point = { day: string; avgScore: number | null; count: number };

export function ProgressSparkline({ data }: { data: Point[] }) {
  const w = 720;
  const h = 160;
  const padX = 20;
  const padY = 24;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;

  const n = Math.max(1, data.length - 1);
  const x = (i: number) => padX + (i / n) * innerW;
  const y = (v: number) => padY + (1 - v) * innerH;

  // Build path only for points that have data
  const segments: string[] = [];
  let prev: { i: number; v: number } | null = null;
  data.forEach((p, i) => {
    if (p.avgScore == null) {
      prev = null;
      return;
    }
    const cur = { i, v: p.avgScore };
    if (prev == null) segments.push(`M ${x(cur.i)} ${y(cur.v)}`);
    else segments.push(`L ${x(cur.i)} ${y(cur.v)}`);
    prev = cur;
  });
  const path = segments.join(" ");

  // baseline grid lines
  const gridY = [0.25, 0.5, 0.75].map((v) => ({ y: y(v), label: `${v * 100}%` }));

  // labels x: first, middle, last (date)
  const labelIdx = [0, Math.floor(data.length / 2), data.length - 1];

  const formatDate = (s: string) => {
    const d = new Date(s);
    return d.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
  };

  const max = Math.max(1, ...data.map((p) => p.count));

  return (
    <svg
      viewBox={`0 0 ${w} ${h + 36}`}
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
    >
      <style>{`
        .grid { stroke: #23252e; stroke-dasharray: 2 4; }
        .grid-lbl { font-family: 'JetBrains Mono', monospace; font-size: 10px; fill: #5b6072; }
        .x-lbl { font-family: 'JetBrains Mono', monospace; font-size: 10px; fill: #9aa0ac; }
        .line { stroke: #48d6e2; stroke-width: 2; fill: none; }
        .point { fill: #48d6e2; }
        .point-empty { fill: #2e3340; }
        .bar { fill: #5aa5ff; opacity: 0.18; }
      `}</style>

      {/* grid */}
      {gridY.map((g, i) => (
        <g key={i}>
          <line x1={padX} y1={g.y} x2={w - padX} y2={g.y} className="grid" />
          <text x={padX - 4} y={g.y + 3} className="grid-lbl" textAnchor="end">
            {g.label}
          </text>
        </g>
      ))}

      {/* bars: activity volume */}
      {data.map((p, i) => {
        if (p.count === 0) return null;
        const barH = (p.count / max) * innerH;
        return (
          <rect
            key={i}
            x={x(i) - 5}
            y={padY + innerH - barH}
            width={10}
            height={barH}
            className="bar"
          />
        );
      })}

      {/* score line */}
      {path && <path d={path} className="line" />}

      {/* points */}
      {data.map((p, i) =>
        p.avgScore != null ? (
          <circle key={i} cx={x(i)} cy={y(p.avgScore)} r={3} className="point" />
        ) : null,
      )}

      {/* x labels */}
      {labelIdx.map((i) =>
        data[i] ? (
          <text key={i} x={x(i)} y={h + 14} className="x-lbl" textAnchor="middle">
            {formatDate(data[i].day)}
          </text>
        ) : null,
      )}

      {/* legend */}
      <g transform={`translate(${padX}, ${h + 24})`}>
        <line x1={0} y1={6} x2={20} y2={6} className="line" />
        <text className="x-lbl" x={26} y={9}>promedio</text>
        <rect x={120} y={0} width={10} height={12} className="bar" />
        <text className="x-lbl" x={136} y={9}>cantidad de respuestas</text>
      </g>
    </svg>
  );
}
