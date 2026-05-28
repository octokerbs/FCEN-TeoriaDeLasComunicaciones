export default function DigitalSignature({ className }: { className?: string }) {
  const W = 880;
  const H = 460;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Firma digital con función de hash"
    >
      <style>{`
        .h { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 700; fill: #f5f5f5; letter-spacing: -0.012em; }
        .sect { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; fill: #8a8a8a; letter-spacing: 0.06em; text-transform: uppercase; }
        .lbl { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; fill: #f5f5f5; font-weight: 500; }
        .small { font-family: 'JetBrains Mono', monospace; font-size: 10px; fill: #8a8a8a; }
        .box { fill: #2a2a2a; stroke: #3a3a3a; stroke-width: 1; }
        .check-box { fill: rgba(165, 230, 177, 0.08); stroke: #a5e6b1; stroke-width: 1.4; stroke-dasharray: 4 3; }
        .m { font-family: 'JetBrains Mono', monospace; font-size: 13px; fill: #f5f5f5; }
        .v-msg { fill: #f4a5a5; font-weight: 700; }
        .v-hash { fill: #a5c8f4; font-weight: 700; }
        .v-sig { fill: #a5e6b1; font-weight: 700; }
        .v-pub { fill: #a5c8f4; font-weight: 700; }
        .v-priv { fill: #a5e6b1; font-weight: 700; }
        .op { fill: #bdbdbd; }
        .arrow { stroke: #bdbdbd; stroke-width: 1.4; fill: none; }
      `}</style>

      <defs>
        <marker id="ds-ar" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L7,4 L0,8 z" fill="#bdbdbd" />
        </marker>
        <marker id="ds-ar-g" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L7,4 L0,8 z" fill="#a5e6b1" />
        </marker>
      </defs>

      <text x={W / 2} y={26} textAnchor="middle" className="h">Firma digital con hash · integridad + autenticación + no repudio</text>

      {/* === Emisor (Alice) === */}
      <text x={30} y={62} className="sect">1 · Emisor (Alice firma)</text>

      <g transform="translate(30, 80)">
        <rect x={0} y={0} width={400} height={140} className="box" rx={3} />

        {/* msg */}
        <text x={20} y={32} className="m">
          <tspan className="op">mensaje  </tspan>
          <tspan className="v-msg">m</tspan>
        </text>

        {/* hash */}
        <text x={20} y={64} className="m">
          <tspan className="op">aplica hash:  </tspan>
          <tspan className="v-hash">h</tspan>
          <tspan className="op"> = H(</tspan>
          <tspan className="v-msg">m</tspan>
          <tspan className="op">)</tspan>
        </text>
        <text x={20} y={80} className="small">SHA-256 / SHA-3</text>

        {/* sign */}
        <text x={20} y={108} className="m">
          <tspan className="op">cifra el hash con su </tspan>
          <tspan className="v-priv">K⁻</tspan>
          <tspan className="op">:</tspan>
        </text>
        <text x={20} y={130} className="m">
          <tspan className="v-sig">firma</tspan>
          <tspan className="op"> = </tspan>
          <tspan className="v-hash">h</tspan>
          <tspan className="v-priv" dy="-6" fontSize="11">d</tspan>
          <tspan dy="6" className="op"> mod </tspan>
          <tspan className="v-pub">n</tspan>
        </text>
      </g>

      {/* Send arrow with package */}
      <g transform="translate(440, 145)">
        <line x1={0} y1={0} x2={120} y2={0} className="arrow" markerEnd="url(#ds-ar)" />
        <text x={60} y={-12} textAnchor="middle" className="small">envía</text>
        <text x={60} y={20} textAnchor="middle" className="m">
          ⟨ <tspan className="v-msg">m</tspan>, <tspan className="v-sig">firma</tspan> ⟩
        </text>
      </g>

      {/* === Receptor (Bob) === */}
      <text x={580} y={62} className="sect">2 · Receptor (Bob verifica)</text>

      <g transform="translate(580, 80)">
        <rect x={0} y={0} width={270} height={140} className="box" rx={3} />

        <text x={20} y={32} className="m">
          <tspan className="op">recibe </tspan>
          <tspan className="v-msg">m</tspan>
          <tspan className="op">, </tspan>
          <tspan className="v-sig">firma</tspan>
        </text>

        <text x={20} y={62} className="m">
          <tspan className="v-hash">h'</tspan>
          <tspan className="op"> = H(</tspan>
          <tspan className="v-msg">m</tspan>
          <tspan className="op">)</tspan>
        </text>

        <text x={20} y={92} className="m">
          <tspan className="v-hash">h''</tspan>
          <tspan className="op"> = </tspan>
          <tspan className="v-sig">firma</tspan>
          <tspan className="v-pub" dy="-6" fontSize="11">e</tspan>
          <tspan dy="6" className="op"> mod </tspan>
          <tspan className="v-pub">n</tspan>
        </text>
        <text x={20} y={108} className="small">
          (con la <tspan className="v-pub">K⁺</tspan> pública de Alice)
        </text>
      </g>

      {/* Verification */}
      <g transform="translate(220, 270)">
        <rect x={0} y={0} width={440} height={90} className="check-box" rx={4} />
        <text x={220} y={36} textAnchor="middle" className="lbl">verificación</text>
        <text x={220} y={62} textAnchor="middle" className="m">
          <tspan className="op">si  </tspan>
          <tspan className="v-hash">h'</tspan>
          <tspan className="op">  =  </tspan>
          <tspan className="v-hash">h''</tspan>
          <tspan className="op">  →  </tspan>
          <tspan fill="#a5e6b1" fontWeight="700">firma válida</tspan>
        </text>
      </g>

      {/* Properties summary */}
      <g transform={`translate(60, 390)`}>
        <text x={0} y={0} className="sect">Garantías que provee la firma</text>
        <text x={0} y={22} className="lbl">
          <tspan fill="#a5e6b1" fontWeight="700">·</tspan>
          <tspan fill="#bdbdbd">  integridad — un bit alterado en </tspan>
          <tspan className="v-msg">m</tspan>
          <tspan fill="#bdbdbd"> rompe </tspan>
          <tspan className="v-hash">h'</tspan>
        </text>
        <text x={0} y={42} className="lbl">
          <tspan fill="#a5e6b1" fontWeight="700">·</tspan>
          <tspan fill="#bdbdbd">  autenticación — solo el dueño de </tspan>
          <tspan className="v-priv">K⁻</tspan>
          <tspan fill="#bdbdbd"> pudo firmar</tspan>
        </text>
        <text x={0} y={62} className="lbl">
          <tspan fill="#a5e6b1" fontWeight="700">·</tspan>
          <tspan fill="#bdbdbd">  no repudio — Alice no puede negar haberlo firmado</tspan>
        </text>
      </g>
    </svg>
  );
}
