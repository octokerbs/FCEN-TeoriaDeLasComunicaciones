export default function RSAFlow({ className }: { className?: string }) {
  const W = 840;
  const H = 460;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Algoritmo RSA: generación de claves, cifrado y descifrado"
    >
      <style>{`
        .h { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 700; fill: #f5f5f5; letter-spacing: -0.012em; }
        .sect { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; fill: #8a8a8a; letter-spacing: 0.06em; text-transform: uppercase; }
        .lbl { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; fill: #f5f5f5; font-weight: 500; }
        .small { font-family: 'JetBrains Mono', monospace; font-size: 10.5px; fill: #8a8a8a; }
        .box { fill: #2a2a2a; stroke: #3a3a3a; stroke-width: 1; }
        .pub-box { fill: rgba(165, 200, 244, 0.06); stroke: #a5c8f4; stroke-width: 1; }
        .priv-box { fill: rgba(165, 230, 177, 0.06); stroke: #a5e6b1; stroke-width: 1; }
        .m { font-family: 'JetBrains Mono', monospace; font-size: 13px; fill: #f5f5f5; }
        .v-pub { fill: #a5c8f4; font-weight: 700; }
        .v-priv { fill: #a5e6b1; font-weight: 700; }
        .v-msg { fill: #f4a5a5; font-weight: 700; }
        .op { fill: #bdbdbd; }
        .arrow { stroke: #bdbdbd; stroke-width: 1.4; fill: none; }
      `}</style>

      <defs>
        <marker id="rsa-ar" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L7,4 L0,8 z" fill="#bdbdbd" />
        </marker>
      </defs>

      <text x={W / 2} y={26} textAnchor="middle" className="h">RSA · generación, cifrado y descifrado</text>

      {/* === Key generation === */}
      <text x={30} y={64} className="sect">1 · Generación de claves</text>

      <text x={30} y={90} className="m">
        <tspan className="op">elegí dos primos grandes </tspan>
        <tspan className="v-priv">p</tspan>
        <tspan className="op">, </tspan>
        <tspan className="v-priv">q</tspan>
      </text>
      <text x={30} y={113} className="m">
        <tspan className="v-pub">n</tspan>
        <tspan className="op"> = </tspan>
        <tspan className="v-priv">p</tspan>
        <tspan className="op"> · </tspan>
        <tspan className="v-priv">q</tspan>
        <tspan className="op">    </tspan>
        <tspan fill="#8a8a8a" fontSize="10.5">módulo (público)</tspan>
      </text>
      <text x={30} y={136} className="m">
        <tspan className="op">φ(</tspan>
        <tspan className="v-pub">n</tspan>
        <tspan className="op">) = (</tspan>
        <tspan className="v-priv">p</tspan>
        <tspan className="op"> − 1)(</tspan>
        <tspan className="v-priv">q</tspan>
        <tspan className="op"> − 1)</tspan>
      </text>
      <text x={30} y={159} className="m">
        <tspan className="op">elegí </tspan>
        <tspan className="v-pub">e</tspan>
        <tspan className="op"> tal que gcd(</tspan>
        <tspan className="v-pub">e</tspan>
        <tspan className="op">, φ(</tspan>
        <tspan className="v-pub">n</tspan>
        <tspan className="op">)) = 1</tspan>
      </text>
      <text x={30} y={182} className="m">
        <tspan className="v-priv">d</tspan>
        <tspan className="op"> = </tspan>
        <tspan className="v-pub">e</tspan>
        <tspan className="op">⁻¹ mod φ(</tspan>
        <tspan className="v-pub">n</tspan>
        <tspan className="op">)</tspan>
      </text>

      {/* Keys boxes */}
      <g transform="translate(440, 70)">
        <rect x={0} y={0} width={170} height={56} className="pub-box" rx={3} />
        <text x={85} y={20} textAnchor="middle" className="lbl">
          <tspan>clave </tspan>
          <tspan className="v-pub">pública</tspan>
        </text>
        <text x={85} y={42} textAnchor="middle" className="m">
          K⁺ = (<tspan className="v-pub">n</tspan>, <tspan className="v-pub">e</tspan>)
        </text>

        <rect x={190} y={0} width={170} height={56} className="priv-box" rx={3} />
        <text x={275} y={20} textAnchor="middle" className="lbl">
          <tspan>clave </tspan>
          <tspan className="v-priv">privada</tspan>
        </text>
        <text x={275} y={42} textAnchor="middle" className="m">
          K⁻ = (<tspan className="v-pub">n</tspan>, <tspan className="v-priv">d</tspan>)
        </text>
      </g>

      {/* === Encryption / Decryption === */}
      <text x={30} y={240} className="sect">2 · Cifrar y descifrar</text>

      {/* Alice */}
      <g transform="translate(40, 270)">
        <rect x={0} y={0} width={230} height={130} className="box" rx={3} />
        <text x={115} y={22} textAnchor="middle" className="lbl">Alice</text>

        <text x={20} y={52} className="m">
          <tspan className="op">mensaje  </tspan>
          <tspan className="v-msg">m</tspan>
        </text>
        <text x={20} y={82} className="m">
          <tspan className="op">cifra con </tspan>
          <tspan className="v-pub">K⁺</tspan>
          <tspan className="op"> de Bob:</tspan>
        </text>
        <text x={20} y={106} className="m">
          <tspan className="v-msg">c</tspan>
          <tspan className="op"> = </tspan>
          <tspan className="v-msg">m</tspan>
          <tspan className="v-pub" dy="-6" fontSize="11">e</tspan>
          <tspan dy="6" className="op"> mod </tspan>
          <tspan className="v-pub">n</tspan>
        </text>
      </g>

      {/* Arrow with c */}
      <g transform="translate(280, 335)">
        <line x1={0} y1={0} x2={250} y2={0} className="arrow" markerEnd="url(#rsa-ar)" />
        <text x={125} y={-10} textAnchor="middle" className="small">
          red insegura
        </text>
        <text x={125} y={18} textAnchor="middle" className="m">
          <tspan className="v-msg">c</tspan>
        </text>
      </g>

      {/* Bob */}
      <g transform="translate(560, 270)">
        <rect x={0} y={0} width={230} height={130} className="box" rx={3} />
        <text x={115} y={22} textAnchor="middle" className="lbl">Bob</text>

        <text x={20} y={52} className="m">
          <tspan className="op">recibe </tspan>
          <tspan className="v-msg">c</tspan>
        </text>
        <text x={20} y={82} className="m">
          <tspan className="op">descifra con </tspan>
          <tspan className="v-priv">K⁻</tspan>
          <tspan className="op"> propia:</tspan>
        </text>
        <text x={20} y={106} className="m">
          <tspan className="v-msg">m</tspan>
          <tspan className="op"> = </tspan>
          <tspan className="v-msg">c</tspan>
          <tspan className="v-priv" dy="-6" fontSize="11">d</tspan>
          <tspan dy="6" className="op"> mod </tspan>
          <tspan className="v-pub">n</tspan>
        </text>
      </g>

      {/* Legend */}
      <g transform={`translate(${W / 2 - 230}, ${H - 22})`}>
        <rect x={0} y={0} width={10} height={10} fill="#a5c8f4" rx={2} />
        <text className="small" x={16} y={10}>público · pueden verlo todos</text>
        <rect x={210} y={0} width={10} height={10} fill="#a5e6b1" rx={2} />
        <text className="small" x={226} y={10}>privado · solo el dueño</text>
        <rect x={400} y={0} width={10} height={10} fill="#f4a5a5" rx={2} />
        <text className="small" x={416} y={10}>mensaje / ciphertext</text>
      </g>
    </svg>
  );
}
