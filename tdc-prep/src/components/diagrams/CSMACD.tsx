export default function CSMACD({ className }: { className?: string }) {
  const W = 820;
  const H = 380;
  const leftX = 100;
  const rightX = W - 100;
  const startY = 80;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="CSMA/CD: sensado, colisión, jam, backoff"
    >
      <style>{`
        .h { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 700; fill: #f5f5f5; letter-spacing: -0.012em; }
        .head { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 700; fill: #f5f5f5; }
        .lbl { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; fill: #f5f5f5; font-weight: 500; }
        .small { font-family: 'JetBrains Mono', monospace; font-size: 10.5px; fill: #bdbdbd; }
        .ttl { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; fill: #8a8a8a; letter-spacing: 0.06em; text-transform: uppercase; }
        .timeline { stroke: #3a3a3a; stroke-width: 1; }
        .tx-a { stroke: #a5c8f4; stroke-width: 2; fill: none; }
        .tx-b { stroke: #a5e6b1; stroke-width: 2; fill: none; }
        .collision { stroke: #f4a5a5; stroke-width: 2.4; fill: none; }
        .jam { stroke: #f4a5a5; stroke-width: 1.6; fill: none; stroke-dasharray: 3 2; }
        .frame { fill: rgba(165, 200, 244, 0.16); stroke: #a5c8f4; }
        .frame-b { fill: rgba(165, 230, 177, 0.16); stroke: #a5e6b1; }
        .frame-x { fill: rgba(244, 165, 165, 0.18); stroke: #f4a5a5; }
      `}</style>

      <text x={W / 2} y={28} textAnchor="middle" className="h">
        CSMA/CD · sensa, colisión y backoff exponencial
      </text>

      {/* Actors */}
      <text x={leftX - 20} y={startY + 8} textAnchor="end" className="head" fill="#a5c8f4">A</text>
      <text x={rightX + 20} y={startY + 8} textAnchor="start" className="head" fill="#a5e6b1">B</text>

      {/* Timelines */}
      <line x1={leftX} y1={startY} x2={leftX} y2={H - 60} className="timeline" />
      <line x1={rightX} y1={startY} x2={rightX} y2={H - 60} className="timeline" />

      {/* === A starts transmitting === */}
      <text x={20} y={startY + 22} className="ttl">1. A sensa libre → tx</text>
      <rect x={leftX - 30} y={startY + 30} width={60} height={18} className="frame" rx={2} />
      <text x={leftX} y={startY + 43} textAnchor="middle" className="small" fill="#a5c8f4">frame A</text>

      {/* A's signal propagating right */}
      <line x1={leftX + 30} y1={startY + 39} x2={(leftX + rightX) / 2} y2={startY + 105} className="tx-a" />

      {/* === B also senses (sees free) and transmits === */}
      <text x={20} y={startY + 92} className="ttl">2. B sensa libre (no llegó la señal) → tx</text>
      <rect x={rightX - 30} y={startY + 100} width={60} height={18} className="frame-b" rx={2} />
      <text x={rightX} y={startY + 113} textAnchor="middle" className="small" fill="#a5e6b1">frame B</text>
      <line x1={rightX - 30} y1={startY + 109} x2={(leftX + rightX) / 2 - 10} y2={startY + 145} className="tx-b" />

      {/* === Collision in the middle === */}
      <text x={20} y={startY + 150} className="ttl">3. Colisión</text>
      <rect x={(leftX + rightX) / 2 - 35} y={startY + 145} width={70} height={22} className="frame-x" rx={2} />
      <text x={(leftX + rightX) / 2} y={startY + 160} textAnchor="middle" className="small" fill="#f4a5a5">⚡ collision</text>

      {/* === Detection: jam sequences propagate back === */}
      <text x={20} y={startY + 195} className="ttl">4. Detección · ambos envían JAM</text>
      <line x1={(leftX + rightX) / 2 - 25} y1={startY + 175} x2={leftX} y2={startY + 215} className="jam" />
      <line x1={(leftX + rightX) / 2 + 25} y1={startY + 175} x2={rightX} y2={startY + 215} className="jam" />
      <text x={leftX + 50} y={startY + 215} className="small" fill="#f4a5a5">jam</text>
      <text x={rightX - 50} y={startY + 215} textAnchor="end" className="small" fill="#f4a5a5">jam</text>

      {/* === Backoff === */}
      <text x={20} y={startY + 240} className="ttl">5. Backoff aleatorio</text>
      <g transform={`translate(60, ${startY + 252})`}>
        <text className="small" x={0} y={10}>
          <tspan fill="#bdbdbd">k = </tspan>
          <tspan fill="#f4a5a5" fontWeight="700">intento de retransmisión</tspan>
        </text>
        <text x={0} y={30} className="lbl">
          <tspan fill="#bdbdbd">elegir slot uniforme en </tspan>
          <tspan fill="#a5c8f4" fontWeight="700">[0, 2</tspan>
          <tspan fill="#a5c8f4" fontWeight="700" dy="-4" fontSize="11">k</tspan>
          <tspan fill="#a5c8f4" fontWeight="700" dy="4"> − 1]</tspan>
        </text>
        <text x={0} y={50} className="small">
          <tspan fill="#bdbdbd">esperar slot · 1 slot = 2 · t</tspan>
          <tspan dy="3" fontSize="9">prop</tspan>
          <tspan dy="-3"> = 51.2 µs en Ethernet 10 Mbps</tspan>
        </text>
      </g>

      {/* Legend */}
      <g transform={`translate(${W / 2 - 280}, ${H - 22})`}>
        <rect x={0} y={0} width={10} height={10} fill="#a5c8f4" rx={2} />
        <text className="small" x={16} y={9}>señal de A</text>
        <rect x={120} y={0} width={10} height={10} fill="#a5e6b1" rx={2} />
        <text className="small" x={136} y={9}>señal de B</text>
        <rect x={240} y={0} width={10} height={10} fill="#f4a5a5" rx={2} />
        <text className="small" x={256} y={9}>colisión / jam / backoff</text>
      </g>
    </svg>
  );
}
