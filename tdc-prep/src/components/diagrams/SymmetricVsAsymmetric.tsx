export default function SymmetricVsAsymmetric({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 880 480"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Criptografía simétrica vs asimétrica"
    >
      <style>{`
        .h { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 700; fill: #f5f5f5; letter-spacing: -0.012em; }
        .sect { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; fill: #8a8a8a; letter-spacing: 0.06em; text-transform: uppercase; }
        .who { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 700; fill: #f5f5f5; }
        .lbl { font-family: 'JetBrains Mono', monospace; font-size: 11px; fill: #f5f5f5; }
        .small { font-family: 'JetBrains Mono', monospace; font-size: 10px; fill: #8a8a8a; }
        .box { fill: #2a2a2a; stroke: #3a3a3a; stroke-width: 1; }
        .net-bound { stroke: #f4a5a5; stroke-width: 1; stroke-dasharray: 4 3; fill: rgba(244, 165, 165, 0.04); }
        .arrow { stroke: #bdbdbd; stroke-width: 1.4; fill: none; }
        .v-sym { fill: #f4a5a5; font-weight: 700; }
        .v-pub { fill: #a5c8f4; font-weight: 700; }
        .v-priv { fill: #a5e6b1; font-weight: 700; }
        .v-msg { fill: #f5f5f5; font-weight: 700; }
      `}</style>

      <defs>
        <marker id="sv-ar" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L7,4 L0,8 z" fill="#bdbdbd" />
        </marker>
      </defs>

      <text x={440} y={26} textAnchor="middle" className="h">Simétrica vs asimétrica · misma vs distinta clave</text>

      {/* === Symmetric === */}
      <text x={30} y={62} className="sect">Simétrica · una clave compartida</text>

      <g transform="translate(30, 76)">
        {/* Alice */}
        <rect x={0} y={0} width={170} height={130} className="box" rx={3} />
        <text x={85} y={22} textAnchor="middle" className="who">Alice</text>
        <text x={20} y={50} className="lbl">m</text>
        <text x={20} y={74} className="lbl">
          <tspan fill="#bdbdbd">cifra con </tspan>
          <tspan className="v-sym">K</tspan>
        </text>
        <text x={20} y={96} className="lbl">
          <tspan fill="#bdbdbd">c = E(</tspan>
          <tspan className="v-sym">K</tspan>
          <tspan fill="#bdbdbd">, m)</tspan>
        </text>

        {/* Cloud */}
        <ellipse cx={365} cy={65} rx={120} ry={50} className="net-bound" />
        <text x={365} y={50} textAnchor="middle" className="small">red insegura</text>
        <text x={365} y={75} textAnchor="middle" className="lbl">c</text>

        <line x1={170} y1={65} x2={245} y2={65} className="arrow" markerEnd="url(#sv-ar)" />
        <line x1={485} y1={65} x2={560} y2={65} className="arrow" markerEnd="url(#sv-ar)" />

        {/* Bob */}
        <rect x={560} y={0} width={170} height={130} className="box" rx={3} />
        <text x={645} y={22} textAnchor="middle" className="who">Bob</text>
        <text x={580} y={50} className="lbl">c</text>
        <text x={580} y={74} className="lbl">
          <tspan fill="#bdbdbd">descifra con </tspan>
          <tspan className="v-sym">K</tspan>
        </text>
        <text x={580} y={96} className="lbl">
          <tspan fill="#bdbdbd">m = D(</tspan>
          <tspan className="v-sym">K</tspan>
          <tspan fill="#bdbdbd">, c)</tspan>
        </text>
      </g>

      {/* Key sharing problem note */}
      <text x={30} y={232} className="small" fill="#bdbdbd">
        problema: ambos necesitan compartir <tspan className="v-sym">K</tspan> de antemano por un canal seguro.
      </text>

      {/* === Asymmetric === */}
      <text x={30} y={278} className="sect">Asimétrica · clave pública + privada</text>

      <g transform="translate(30, 292)">
        {/* Alice */}
        <rect x={0} y={0} width={170} height={130} className="box" rx={3} />
        <text x={85} y={22} textAnchor="middle" className="who">Alice</text>
        <text x={20} y={50} className="lbl">m</text>
        <text x={20} y={74} className="lbl">
          <tspan fill="#bdbdbd">cifra con </tspan>
          <tspan className="v-pub">K⁺</tspan>
          <tspan fill="#bdbdbd"> de Bob</tspan>
        </text>
        <text x={20} y={96} className="lbl">
          <tspan fill="#bdbdbd">c = </tspan>
          <tspan className="v-msg">m</tspan>
          <tspan className="v-pub" dy="-5" fontSize="10">e</tspan>
          <tspan dy="5" fill="#bdbdbd"> mod </tspan>
          <tspan className="v-pub">n</tspan>
        </text>

        {/* Cloud */}
        <ellipse cx={365} cy={65} rx={120} ry={50} className="net-bound" />
        <text x={365} y={50} textAnchor="middle" className="small">red insegura</text>
        <text x={365} y={75} textAnchor="middle" className="lbl">c</text>

        <line x1={170} y1={65} x2={245} y2={65} className="arrow" markerEnd="url(#sv-ar)" />
        <line x1={485} y1={65} x2={560} y2={65} className="arrow" markerEnd="url(#sv-ar)" />

        {/* Bob */}
        <rect x={560} y={0} width={170} height={130} className="box" rx={3} />
        <text x={645} y={22} textAnchor="middle" className="who">Bob</text>
        <text x={580} y={50} className="lbl">c</text>
        <text x={580} y={74} className="lbl">
          <tspan fill="#bdbdbd">descifra con su </tspan>
          <tspan className="v-priv">K⁻</tspan>
        </text>
        <text x={580} y={96} className="lbl">
          <tspan fill="#bdbdbd">m = </tspan>
          <tspan className="v-msg">c</tspan>
          <tspan className="v-priv" dy="-5" fontSize="10">d</tspan>
          <tspan dy="5" fill="#bdbdbd"> mod </tspan>
          <tspan className="v-pub">n</tspan>
        </text>
      </g>

      {/* Bottom legend */}
      <g transform="translate(30, 448)">
        <rect x={0} y={0} width={10} height={10} fill="#f4a5a5" rx={2} />
        <text className="small" x={16} y={9}>clave simétrica · compartida</text>
        <rect x={210} y={0} width={10} height={10} fill="#a5c8f4" rx={2} />
        <text className="small" x={226} y={9}>clave pública · disponible para todos</text>
        <rect x={490} y={0} width={10} height={10} fill="#a5e6b1" rx={2} />
        <text className="small" x={506} y={9}>clave privada · solo el dueño</text>
      </g>
    </svg>
  );
}
