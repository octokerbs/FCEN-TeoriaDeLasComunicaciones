export default function AccessPointWifi({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 840 500"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Estación oculta y estación expuesta en Wi-Fi"
    >
      <style>{`
        .h { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 700; fill: #f5f5f5; letter-spacing: -0.012em; }
        .sect { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; fill: #8a8a8a; letter-spacing: 0.06em; text-transform: uppercase; }
        .node { font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 700; fill: #f5f5f5; }
        .lbl { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11.5px; fill: #f5f5f5; }
        .small { font-family: 'JetBrains Mono', monospace; font-size: 10px; fill: #8a8a8a; }
        .range-blue { fill: none; stroke: #a5c8f4; stroke-width: 1; stroke-dasharray: 4 3; opacity: 0.8; }
        .range-red { fill: none; stroke: #f4a5a5; stroke-width: 1; stroke-dasharray: 4 3; opacity: 0.8; }
        .range-green { fill: none; stroke: #a5e6b1; stroke-width: 1; stroke-dasharray: 4 3; opacity: 0.8; }
        .node-box { fill: #2a2a2a; stroke: #3a3a3a; stroke-width: 1; }
        .tx-blue { stroke: #a5c8f4; stroke-width: 2; fill: none; }
        .tx-red { stroke: #f4a5a5; stroke-width: 2; fill: none; }
        .tx-green { stroke: #a5e6b1; stroke-width: 2; fill: none; }
        .tx-blocked { stroke: #f4a5a5; stroke-width: 1.6; stroke-dasharray: 3 3; fill: none; }
      `}</style>

      <defs>
        <marker id="wifi-ar-b" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 z" fill="#a5c8f4" />
        </marker>
        <marker id="wifi-ar-r" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 z" fill="#f4a5a5" />
        </marker>
        <marker id="wifi-ar-g" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 z" fill="#a5e6b1" />
        </marker>
      </defs>

      {/* ===== Hidden station ===== */}
      <text x={30} y={28} className="sect">Estación oculta · A y C no se ven, ambos transmiten a B</text>

      <g transform="translate(0, 40)">
        <circle cx={200} cy={140} r={130} className="range-blue" />
        <circle cx={500} cy={140} r={130} className="range-red" />

        {/* A */}
        <rect x={180} y={125} width={40} height={30} className="node-box" />
        <text x={200} y={145} textAnchor="middle" className="node" fill="#a5c8f4">A</text>
        <text x={200} y={170} textAnchor="middle" className="small">alcance de A</text>

        {/* B */}
        <rect x={330} y={125} width={40} height={30} className="node-box" />
        <text x={350} y={145} textAnchor="middle" className="node">B</text>

        {/* C */}
        <rect x={480} y={125} width={40} height={30} className="node-box" />
        <text x={500} y={145} textAnchor="middle" className="node" fill="#f4a5a5">C</text>
        <text x={500} y={170} textAnchor="middle" className="small">alcance de C</text>

        {/* TX arrows toward B */}
        <line x1={220} y1={140} x2={330} y2={140} className="tx-blue" markerEnd="url(#wifi-ar-b)" />
        <line x1={480} y1={140} x2={370} y2={140} className="tx-red" markerEnd="url(#wifi-ar-r)" />

        <text x={275} y={120} textAnchor="middle" className="lbl" fill="#a5c8f4">A → B</text>
        <text x={425} y={120} textAnchor="middle" className="lbl" fill="#f4a5a5">C → B</text>
        <text x={350} y={195} textAnchor="middle" className="lbl" fill="#f4a5a5">⚡ colisión en B</text>

        <text x={30} y={235} className="lbl">
          <tspan fill="#bdbdbd">A no escucha a C (fuera de alcance). C sensa libre y transmite. </tspan>
        </text>
        <text x={30} y={255} className="lbl" fill="#a5e6b1">
          solución → RTS/CTS · B responde CTS y silencia a C aunque no haya escuchado a A.
        </text>
      </g>

      {/* divider */}
      <line x1={20} y1={300} x2={820} y2={300} stroke="#3a3a3a" />

      {/* ===== Exposed station ===== */}
      <text x={30} y={324} className="sect">Estación expuesta · C se inhibe pero no haría daño</text>

      <g transform="translate(0, 336)">
        <circle cx={280} cy={80} r={100} className="range-blue" />
        <circle cx={440} cy={80} r={100} className="range-green" />

        <rect x={120} y={65} width={40} height={30} className="node-box" />
        <text x={140} y={85} textAnchor="middle" className="node">A</text>

        <rect x={260} y={65} width={40} height={30} className="node-box" />
        <text x={280} y={85} textAnchor="middle" className="node" fill="#a5c8f4">B</text>

        <rect x={420} y={65} width={40} height={30} className="node-box" />
        <text x={440} y={85} textAnchor="middle" className="node" fill="#a5e6b1">C</text>

        <rect x={580} y={65} width={40} height={30} className="node-box" />
        <text x={600} y={85} textAnchor="middle" className="node">D</text>

        {/* B → A */}
        <line x1={260} y1={80} x2={160} y2={80} className="tx-blue" markerEnd="url(#wifi-ar-b)" />
        <text x={210} y={60} textAnchor="middle" className="lbl" fill="#a5c8f4">B → A · legítima</text>

        {/* C → D blocked */}
        <line x1={460} y1={80} x2={580} y2={80} className="tx-blocked" markerEnd="url(#wifi-ar-r)" />
        <text x={520} y={60} textAnchor="middle" className="lbl" fill="#f4a5a5">C → D · bloqueada en vano</text>

        <text x={30} y={158} className="lbl" fill="#bdbdbd">
          C escucha a B y se inhibe, pero su tx a D NO interferiría con A.
        </text>
      </g>
    </svg>
  );
}
