export default function CongestionControl({ className }: { className?: string }) {
  const W = 800;
  const H = 420;
  const padL = 70;
  const padR = 40;
  const padT = 70;
  const padB = 50;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const xMax = 30; // time units (RTTs)
  const yMax = 40; // CWND in MSS

  const xOf = (t: number) => padL + (t / xMax) * innerW;
  const yOf = (c: number) => padT + (1 - c / yMax) * innerH;

  // Reno-like sawtooth curve
  const path: string[] = [];
  let x = 0;
  let cwnd = 1;
  let ssthresh = 16;
  let phase: "ss" | "ca" = "ss";
  path.push(`M ${xOf(x)} ${yOf(cwnd)}`);

  const losses: number[] = []; // time of loss
  const labels: { t: number; cwnd: number; kind: string }[] = [];

  while (x < xMax) {
    if (phase === "ss") {
      // Exponential: cwnd doubles per step
      const newCwnd = cwnd * 2;
      x += 1;
      cwnd = newCwnd;
      path.push(`L ${xOf(x)} ${yOf(cwnd)}`);
      if (cwnd >= ssthresh) {
        labels.push({ t: x, cwnd, kind: "ssthresh" });
        phase = "ca";
      }
    } else {
      // Additive: +1 per step
      x += 1;
      cwnd += 1;
      path.push(`L ${xOf(x)} ${yOf(cwnd)}`);
      // Trigger loss probabilistically at cwnd >= some level
      if (cwnd >= 28 + Math.random() * 5) {
        losses.push(x);
        // Fast Recovery (Reno): cwnd /= 2, stay in CA
        ssthresh = Math.floor(cwnd / 2);
        cwnd = ssthresh;
        path.push(`L ${xOf(x)} ${yOf(cwnd)}`); // vertical drop
        labels.push({ t: x, cwnd, kind: "loss" });
      }
    }
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Control de congestión TCP: CWND vs tiempo"
    >
      <style>{`
        .h { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 700; fill: #f5f5f5; letter-spacing: -0.012em; }
        .axis { stroke: #3a3a3a; stroke-width: 1; }
        .grid { stroke: #2a2a2a; stroke-width: 1; stroke-dasharray: 2 4; }
        .lbl { font-family: 'JetBrains Mono', monospace; font-size: 11px; fill: #bdbdbd; }
        .small { font-family: 'JetBrains Mono', monospace; font-size: 10px; fill: #8a8a8a; }
        .curve { stroke: #a5c8f4; stroke-width: 2.2; fill: none; }
        .ss-area { fill: rgba(165, 200, 244, 0.05); }
        .ssthresh-line { stroke: #f4a5a5; stroke-width: 1; stroke-dasharray: 4 3; fill: none; opacity: 0.8; }
        .loss-marker { fill: #f4a5a5; }
        .phase-lbl { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; fill: #bdbdbd; }
        .v-ss { fill: #a5c8f4; font-weight: 700; }
        .v-ca { fill: #a5e6b1; font-weight: 700; }
        .v-loss { fill: #f4a5a5; font-weight: 700; }
      `}</style>

      <text x={W / 2} y="28" textAnchor="middle" className="h">
        TCP Reno · ventana de congestión vs tiempo
      </text>

      {/* Phase legend */}
      <g transform={`translate(${padL}, 46)`}>
        <text className="phase-lbl" x={0} y={4}>
          <tspan className="v-ss">Slow Start</tspan>
          <tspan fill="#8a8a8a"> exponencial  ·  </tspan>
          <tspan className="v-ca">Congestion Avoidance</tspan>
          <tspan fill="#8a8a8a"> aditivo (AIMD)  ·  </tspan>
          <tspan className="v-loss">3-DupACK</tspan>
          <tspan fill="#8a8a8a"> → cwnd /= 2</tspan>
        </text>
      </g>

      {/* Grid Y */}
      {[10, 20, 30, 40].map((v) => (
        <g key={`gy${v}`}>
          <line x1={padL} y1={yOf(v)} x2={padL + innerW} y2={yOf(v)} className="grid" />
          <text x={padL - 8} y={yOf(v) + 4} textAnchor="end" className="small">{v}</text>
        </g>
      ))}
      {/* Grid X */}
      {[5, 10, 15, 20, 25, 30].map((t) => (
        <g key={`gx${t}`}>
          <line x1={xOf(t)} y1={padT} x2={xOf(t)} y2={padT + innerH} className="grid" />
          <text x={xOf(t)} y={padT + innerH + 18} textAnchor="middle" className="small">{t}</text>
        </g>
      ))}

      {/* Axes */}
      <line x1={padL} y1={padT + innerH} x2={padL + innerW} y2={padT + innerH} className="axis" />
      <line x1={padL} y1={padT} x2={padL} y2={padT + innerH} className="axis" />

      <text x={padL + innerW / 2} y={padT + innerH + 36} textAnchor="middle" className="lbl">
        <tspan fill="#bdbdbd">tiempo · </tspan>
        <tspan fill="#f4a5a5" fontWeight="700">RTT</tspan>
      </text>
      <text x={26} y={padT + innerH / 2} className="lbl" transform={`rotate(-90 26 ${padT + innerH / 2})`} textAnchor="middle">
        <tspan fill="#a5e6b1" fontWeight="700">cwnd</tspan>
        <tspan fill="#bdbdbd"> · MSS</tspan>
      </text>

      {/* Initial ssthresh dashed line */}
      <line x1={padL} y1={yOf(16)} x2={padL + innerW} y2={yOf(16)} className="ssthresh-line" />
      <text x={padL + innerW - 4} y={yOf(16) - 6} textAnchor="end" className="small" fill="#f4a5a5">
        ssthresh inicial
      </text>

      {/* Main curve */}
      <path d={path.join(" ")} className="curve" />

      {/* Loss markers (red dots) */}
      {losses.map((t, i) => (
        <circle key={i} cx={xOf(t)} cy={yOf(30)} r={3.5} className="loss-marker" />
      ))}
    </svg>
  );
}
