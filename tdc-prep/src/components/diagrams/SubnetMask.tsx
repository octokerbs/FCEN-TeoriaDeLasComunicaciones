export default function SubnetMask({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 820 400"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Máscara de subred CIDR y operación AND"
    >
      <style>{`
        .h { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 700; fill: #f5f5f5; letter-spacing: -0.012em; }
        .lbl { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; fill: #f5f5f5; font-weight: 500; }
        .small { font-family: 'JetBrains Mono', monospace; font-size: 10.5px; fill: #8a8a8a; }
        .bin { font-family: 'JetBrains Mono', monospace; font-size: 14px; }
        .dec { font-family: 'JetBrains Mono', monospace; font-size: 16px; font-weight: 600; }
        .ttl { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; fill: #8a8a8a; letter-spacing: 0.06em; text-transform: uppercase; }
        .v-net { fill: #a5c8f4; font-weight: 700; }
        .v-host { fill: #f4a5a5; font-weight: 700; }
        .v-mask { fill: #a5e6b1; font-weight: 700; }
        .v-res { fill: #f5f5f5; font-weight: 700; }
        .punct { fill: #8a8a8a; }
        .divider { stroke: #3a3a3a; stroke-width: 1; }
      `}</style>

      <text x={410} y={28} textAnchor="middle" className="h">
        Máscara de subred /26 · ejemplo 192.168.1.45
      </text>

      {/* Row 1: IP */}
      <text x={40} y={80} className="ttl">IP del host</text>
      <text x={40} y={110} className="dec">
        <tspan className="v-net">192</tspan>
        <tspan className="punct">.</tspan>
        <tspan className="v-net">168</tspan>
        <tspan className="punct">.</tspan>
        <tspan className="v-net">1</tspan>
        <tspan className="punct">.</tspan>
        <tspan className="v-net">45</tspan>
      </text>
      <text x={40} y={138} className="bin">
        <tspan className="v-net">11000000</tspan>
        <tspan className="punct"> · </tspan>
        <tspan className="v-net">10101000</tspan>
        <tspan className="punct"> · </tspan>
        <tspan className="v-net">00000001</tspan>
        <tspan className="punct"> · </tspan>
        <tspan className="v-net">00</tspan>
        <tspan className="v-host">101101</tspan>
      </text>

      {/* Row 2: Mask */}
      <text x={40} y={180} className="ttl">Máscara /26</text>
      <text x={40} y={210} className="dec">
        <tspan className="v-mask">255</tspan>
        <tspan className="punct">.</tspan>
        <tspan className="v-mask">255</tspan>
        <tspan className="punct">.</tspan>
        <tspan className="v-mask">255</tspan>
        <tspan className="punct">.</tspan>
        <tspan className="v-mask">192</tspan>
      </text>
      <text x={40} y={238} className="bin">
        <tspan className="v-mask">11111111</tspan>
        <tspan className="punct"> · </tspan>
        <tspan className="v-mask">11111111</tspan>
        <tspan className="punct"> · </tspan>
        <tspan className="v-mask">11111111</tspan>
        <tspan className="punct"> · </tspan>
        <tspan className="v-mask">11</tspan>
        <tspan className="v-host">000000</tspan>
      </text>

      {/* AND operator */}
      <line x1={20} y1={260} x2={800} y2={260} className="divider" />
      <text x={40} y={282} className="ttl">AND bit a bit  →  red destino</text>

      {/* Row 3: Result */}
      <text x={40} y={314} className="dec">
        <tspan className="v-res">192</tspan>
        <tspan className="punct">.</tspan>
        <tspan className="v-res">168</tspan>
        <tspan className="punct">.</tspan>
        <tspan className="v-res">1</tspan>
        <tspan className="punct">.</tspan>
        <tspan className="v-res">0</tspan>
        <tspan className="punct"> / 26</tspan>
      </text>
      <text x={40} y={342} className="bin">
        <tspan className="v-res">11000000</tspan>
        <tspan className="punct"> · </tspan>
        <tspan className="v-res">10101000</tspan>
        <tspan className="punct"> · </tspan>
        <tspan className="v-res">00000001</tspan>
        <tspan className="punct"> · </tspan>
        <tspan className="v-res">00</tspan>
        <tspan className="v-host">000000</tspan>
      </text>

      {/* Legend */}
      <g transform="translate(40, 372)">
        <rect x={0} y={0} width={10} height={10} fill="#a5c8f4" rx={2} />
        <text className="small" x={16} y={9}>26 bits de red</text>

        <rect x={140} y={0} width={10} height={10} fill="#f4a5a5" rx={2} />
        <text className="small" x={156} y={9}>6 bits de host → 62 IPs útiles</text>

        <rect x={360} y={0} width={10} height={10} fill="#a5e6b1" rx={2} />
        <text className="small" x={376} y={9}>máscara · 1 = red, 0 = host</text>
      </g>
    </svg>
  );
}
