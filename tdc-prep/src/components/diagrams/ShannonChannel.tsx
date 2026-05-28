export default function ShannonChannel({ className }: { className?: string }) {
  const W = 820;
  const H = 380;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Modelo de Shannon de un sistema de comunicación con fórmula de capacidad"
    >
      <style>{`
        .h { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 700; fill: #f5f5f5; letter-spacing: -0.012em; }
        .lbl { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; fill: #f5f5f5; font-weight: 500; }
        .sub { font-family: 'JetBrains Mono', monospace; font-size: 10.5px; fill: #8a8a8a; }
        .box { fill: #2a2a2a; stroke: #3a3a3a; stroke-width: 1; }
        .noise-box { fill: rgba(244, 165, 165, 0.06); stroke: #f4a5a5; stroke-width: 1; stroke-dasharray: 4 3; }
        .arrow { stroke: #bdbdbd; stroke-width: 1.4; fill: none; }
        .formula { font-family: 'JetBrains Mono', monospace; font-size: 22px; fill: #f5f5f5; font-weight: 500; }
        .formula-c { fill: #a5e6b1; font-weight: 700; }
        .formula-b { fill: #a5c8f4; font-weight: 700; }
        .formula-snr-s { fill: #a5c8f4; font-weight: 700; }
        .formula-snr-n { fill: #f4a5a5; font-weight: 700; }
        .formula-op { fill: #bdbdbd; }
        .legend { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11.5px; fill: #bdbdbd; }
      `}</style>

      <defs>
        <marker id="sh-ar" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L7,4 L0,8 z" fill="#bdbdbd" />
        </marker>
      </defs>

      <text x={W / 2} y="30" textAnchor="middle" className="h">Modelo de Shannon de un sistema de comunicación</text>

      {/* Chain: Fuente → Tx → [Canal+ruido] → Rx → Destino */}
      <g transform="translate(40, 60)">
        {/* Fuente */}
        <rect x={0} y={20} width={110} height={48} className="box" rx={3} />
        <text x={55} y={42} textAnchor="middle" className="lbl">Fuente</text>
        <text x={55} y={58} textAnchor="middle" className="sub">mensaje m</text>

        <line x1={110} y1={44} x2={150} y2={44} className="arrow" markerEnd="url(#sh-ar)" />

        {/* Transmisor */}
        <rect x={150} y={20} width={110} height={48} className="box" rx={3} />
        <text x={205} y={42} textAnchor="middle" className="lbl">Transmisor</text>
        <text x={205} y={58} textAnchor="middle" className="sub">codifica</text>

        <line x1={260} y1={44} x2={310} y2={44} className="arrow" markerEnd="url(#sh-ar)" />

        {/* Canal con ruido */}
        <rect x={310} y={0} width={120} height={88} className="noise-box" rx={3} />
        <text x={370} y={20} textAnchor="middle" className="sub" fill="#f4a5a5">ruido N</text>
        <rect x={326} y={32} width={88} height={36} className="box" rx={3} stroke="#f4a5a5" strokeWidth={1.2} />
        <text x={370} y={56} textAnchor="middle" className="lbl">Canal</text>

        <line x1={430} y1={44} x2={480} y2={44} className="arrow" markerEnd="url(#sh-ar)" />

        {/* Receptor */}
        <rect x={480} y={20} width={110} height={48} className="box" rx={3} />
        <text x={535} y={42} textAnchor="middle" className="lbl">Receptor</text>
        <text x={535} y={58} textAnchor="middle" className="sub">decodifica</text>

        <line x1={590} y1={44} x2={630} y2={44} className="arrow" markerEnd="url(#sh-ar)" />

        {/* Destino */}
        <rect x={630} y={20} width={110} height={48} className="box" rx={3} />
        <text x={685} y={42} textAnchor="middle" className="lbl">Destino</text>
        <text x={685} y={58} textAnchor="middle" className="sub">mensaje m'</text>
      </g>

      {/* === Formula box === */}
      <g transform="translate(0, 200)">
        <text x={W / 2} y={0} textAnchor="middle" className="sub">
          Capacidad máxima del canal con ruido (bits / segundo)
        </text>

        {/* C = B · log₂(1 + S/N) */}
        <text x={W / 2} y={50} textAnchor="middle" className="formula">
          <tspan className="formula-c">C</tspan>
          <tspan className="formula-op">  =  </tspan>
          <tspan className="formula-b">B</tspan>
          <tspan className="formula-op">  · log</tspan>
          <tspan dy="4" fontSize="14">2</tspan>
          <tspan dy="-4" className="formula-op"> (1 + </tspan>
          <tspan className="formula-snr-s">S</tspan>
          <tspan className="formula-op"> / </tspan>
          <tspan className="formula-snr-n">N</tspan>
          <tspan className="formula-op">)</tspan>
        </text>

        {/* Legend with colored swatches */}
        <g transform={`translate(${W / 2 - 280}, 95)`}>
          {/* C */}
          <rect x={0} y={0} width={10} height={10} fill="#a5e6b1" rx={2} />
          <text x={18} y={9} className="legend">
            <tspan fill="#a5e6b1" fontWeight="700">C</tspan>
            <tspan>  capacidad — bits/s</tspan>
          </text>

          {/* B */}
          <rect x={170} y={0} width={10} height={10} fill="#a5c8f4" rx={2} />
          <text x={188} y={9} className="legend">
            <tspan fill="#a5c8f4" fontWeight="700">B</tspan>
            <tspan>  ancho de banda — Hz</tspan>
          </text>

          {/* S */}
          <rect x={370} y={0} width={10} height={10} fill="#a5c8f4" rx={2} />
          <text x={388} y={9} className="legend">
            <tspan fill="#a5c8f4" fontWeight="700">S</tspan>
            <tspan>  potencia de señal</tspan>
          </text>

          {/* N */}
          <rect x={530} y={0} width={10} height={10} fill="#f4a5a5" rx={2} />
          <text x={548} y={9} className="legend">
            <tspan fill="#f4a5a5" fontWeight="700">N</tspan>
            <tspan>  potencia del ruido</tspan>
          </text>
        </g>

        <text x={W / 2} y={140} textAnchor="middle" className="sub">
          el cociente S/N (SNR) suele expresarse en dB: SNR
          <tspan dy="3" fontSize="9">dB</tspan>
          <tspan dy="-3"> = 10 · log</tspan>
          <tspan dy="3" fontSize="9">10</tspan>
          <tspan dy="-3">(S/N)</tspan>
        </text>
      </g>
    </svg>
  );
}
