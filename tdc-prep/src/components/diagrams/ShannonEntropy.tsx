export default function ShannonEntropy({ className }: { className?: string }) {
  const W = 760;
  const H = 460;
  const padL = 80;
  const padR = 60;
  const padT = 90;
  const padB = 70;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  // H(p) = -p log2 p - (1-p) log2 (1-p), with H(0)=H(1)=0.
  const N = 200;
  const points: [number, number][] = [];
  for (let i = 0; i <= N; i++) {
    const p = i / N;
    let h: number;
    if (p === 0 || p === 1) h = 0;
    else h = -(p * Math.log2(p) + (1 - p) * Math.log2(1 - p));
    points.push([p, h]);
  }
  const xOf = (p: number) => padL + p * innerW;
  const yOf = (h: number) => padT + (1 - h) * innerH;
  const pathD = points.map(([p, h], i) => `${i === 0 ? "M" : "L"} ${xOf(p)} ${yOf(h)}`).join(" ");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Función de entropía binaria H(p)"
    >
      <style>{`
        .h { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 700; fill: #f5f5f5; letter-spacing: -0.012em; }
        .axis { stroke: #3a3a3a; stroke-width: 1; }
        .grid { stroke: #2a2a2a; stroke-width: 1; stroke-dasharray: 2 4; }
        .lbl { font-family: 'JetBrains Mono', monospace; font-size: 11px; fill: #bdbdbd; }
        .small { font-family: 'JetBrains Mono', monospace; font-size: 10px; fill: #8a8a8a; }
        .curve { stroke: #a5c8f4; stroke-width: 2.2; fill: none; }
        .area { fill: #a5c8f4; opacity: 0.08; }
        .peak { stroke: #f4a5a5; stroke-width: 1; stroke-dasharray: 3 4; fill: none; }
        .marker { fill: #f4a5a5; }
        .formula { font-family: 'JetBrains Mono', monospace; font-size: 17px; fill: #f5f5f5; }
        .v-h { fill: #a5e6b1; font-weight: 700; }
        .v-p { fill: #a5c8f4; font-weight: 700; }
        .op { fill: #bdbdbd; }
      `}</style>

      <text x={W / 2} y="26" textAnchor="middle" className="h">
        Entropía de una fuente binaria
      </text>

      {/* Formula at top */}
      <text x={W / 2} y={60} textAnchor="middle" className="formula">
        <tspan className="v-h">H</tspan>
        <tspan className="op">(</tspan>
        <tspan className="v-p">p</tspan>
        <tspan className="op">) = − </tspan>
        <tspan className="v-p">p</tspan>
        <tspan className="op"> log</tspan>
        <tspan dy="4" fontSize="11">2</tspan>
        <tspan dy="-4" className="v-p"> p</tspan>
        <tspan className="op"> − (1 − </tspan>
        <tspan className="v-p">p</tspan>
        <tspan className="op">) log</tspan>
        <tspan dy="4" fontSize="11">2</tspan>
        <tspan dy="-4" className="op">(1 − </tspan>
        <tspan className="v-p">p</tspan>
        <tspan className="op">)</tspan>
      </text>

      {/* Grid */}
      {[0.25, 0.5, 0.75, 1].map((v) => (
        <g key={`gy${v}`}>
          <line x1={padL} y1={yOf(v)} x2={padL + innerW} y2={yOf(v)} className="grid" />
          <text x={padL - 10} y={yOf(v) + 4} textAnchor="end" className="small">{v.toFixed(2)}</text>
        </g>
      ))}
      {[0, 0.25, 0.5, 0.75, 1].map((p) => (
        <g key={`gx${p}`}>
          <line x1={xOf(p)} y1={padT} x2={xOf(p)} y2={padT + innerH} className="grid" />
          <text x={xOf(p)} y={padT + innerH + 18} textAnchor="middle" className="small">{p.toFixed(2)}</text>
        </g>
      ))}

      {/* Axis */}
      <line x1={padL} y1={padT + innerH} x2={padL + innerW} y2={padT + innerH} className="axis" />
      <line x1={padL} y1={padT} x2={padL} y2={padT + innerH} className="axis" />

      {/* Axis labels with color */}
      <text x={padL + innerW / 2} y={padT + innerH + 40} textAnchor="middle" className="lbl">
        <tspan fill="#a5c8f4" fontWeight="700">p</tspan>
        <tspan fill="#bdbdbd"> · probabilidad de un símbolo</tspan>
      </text>
      <text x={20} y={padT + innerH / 2} className="lbl" transform={`rotate(-90 20 ${padT + innerH / 2})`} textAnchor="middle">
        <tspan fill="#a5e6b1" fontWeight="700">H(p)</tspan>
        <tspan fill="#bdbdbd"> · bits / símbolo</tspan>
      </text>

      {/* Area under curve */}
      <path d={`${pathD} L ${xOf(1)} ${yOf(0)} L ${xOf(0)} ${yOf(0)} Z`} className="area" />
      {/* Curve */}
      <path d={pathD} className="curve" />

      {/* Peak markers at (0.5, 1) */}
      <line x1={xOf(0.5)} y1={padT + innerH} x2={xOf(0.5)} y2={yOf(1)} className="peak" />
      <line x1={padL} y1={yOf(1)} x2={xOf(0.5)} y2={yOf(1)} className="peak" />
      <circle cx={xOf(0.5)} cy={yOf(1)} r={4} className="marker" />

      <text x={xOf(0.5) + 12} y={yOf(1) + 4} className="lbl">
        <tspan fill="#f4a5a5" fontWeight="700">máximo</tspan>
        <tspan fill="#bdbdbd"> · p = 0.5, H = 1 bit</tspan>
      </text>

      <text x={xOf(0) + 6} y={yOf(0) - 8} className="small">H(0) = 0</text>
      <text x={xOf(1) - 6} y={yOf(0) - 8} textAnchor="end" className="small">H(1) = 0</text>
    </svg>
  );
}
