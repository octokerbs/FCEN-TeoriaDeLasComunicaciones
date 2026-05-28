export default function OSIModel({ className }: { className?: string }) {
  const layers = [
    { n: 7, name: "Aplicación", pdu: "Datos", ex: "HTTP · DNS · SMTP" },
    { n: 6, name: "Presentación", pdu: "Datos", ex: "TLS · JPEG" },
    { n: 5, name: "Sesión", pdu: "Datos", ex: "RPC · SMB" },
    { n: 4, name: "Transporte", pdu: "Segmento", ex: "TCP · UDP" },
    { n: 3, name: "Red", pdu: "Paquete", ex: "IP · ICMP" },
    { n: 2, name: "Enlace", pdu: "Frame", ex: "Ethernet · Wi-Fi" },
    { n: 1, name: "Físico", pdu: "Bit", ex: "Cable · fibra · radio" },
  ];
  const W = 900;
  const H = 480;
  const startY = 70;
  const rowH = 48;
  const boxW = 220;
  const colLeft = 70;
  const colRight = W - colLeft - boxW;
  const midX = (colLeft + boxW + colRight) / 2;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Modelo OSI con sus 7 capas"
    >
      <style>{`
        .h1 { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 15px; font-weight: 700; fill: #f5f5f5; letter-spacing: -0.012em; }
        .host { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 700; fill: #f5f5f5; letter-spacing: -0.012em; }
        .lbl { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; fill: #f5f5f5; font-weight: 500; }
        .sub { font-family: 'JetBrains Mono', monospace; font-size: 10px; fill: #8a8a8a; }
        .pdu { font-family: 'JetBrains Mono', monospace; font-size: 10px; fill: #a5c8f4; letter-spacing: 0.03em; }
        .num { font-family: 'JetBrains Mono', monospace; font-size: 13px; fill: #f4a5a5; font-weight: 600; }
        .box { fill: #2a2a2a; stroke: #3a3a3a; stroke-width: 1; }
        .peer { stroke: #a5c8f4; stroke-width: 1.3; stroke-dasharray: 4 3; fill: none; opacity: 0.85; }
        .vline { stroke: #a5e6b1; stroke-width: 1.3; fill: none; opacity: 0.7; }
      `}</style>

      <defs>
        <marker id="osi-ar" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L7,4 L0,8 z" fill="#a5e6b1" />
        </marker>
      </defs>

      {/* Title */}
      <text x={W / 2} y="32" textAnchor="middle" className="h1">
        Modelo OSI · siete capas
      </text>

      {/* Host labels */}
      <text x={colLeft + boxW / 2} y={startY - 18} textAnchor="middle" className="host">Host A</text>
      <text x={colRight + boxW / 2} y={startY - 18} textAnchor="middle" className="host">Host B</text>

      {/* Layer rows */}
      {layers.map((l, i) => {
        const y = startY + i * rowH;
        const h = rowH - 8;
        const cy = y + h / 2;
        return (
          <g key={l.n}>
            {/* Left box */}
            <rect x={colLeft} y={y} width={boxW} height={h} className="box" rx={4} />
            <text x={colLeft + 16} y={y + 19} className="num">{l.n}</text>
            <text x={colLeft + 40} y={y + 19} className="lbl">{l.name}</text>
            <text x={colLeft + 40} y={y + 33} className="sub">{l.ex}</text>

            {/* Right box */}
            <rect x={colRight} y={y} width={boxW} height={h} className="box" rx={4} />
            <text x={colRight + 16} y={y + 19} className="num">{l.n}</text>
            <text x={colRight + 40} y={y + 19} className="lbl">{l.name}</text>
            <text x={colRight + 40} y={y + 33} className="sub">{l.ex}</text>

            {/* Peer (dashed blue) */}
            <line x1={colLeft + boxW + 6} y1={cy} x2={colRight - 6} y2={cy} className="peer" />

            {/* PDU label above peer line */}
            <text x={midX} y={cy - 5} textAnchor="middle" className="pdu">{l.pdu.toUpperCase()}</text>
          </g>
        );
      })}

      {/* Vertical green layer-to-layer arrows inside each host */}
      {[colLeft + boxW - 16, colRight + 16].map((x, i) => (
        <line
          key={i}
          x1={x}
          y1={startY + 14}
          x2={x}
          y2={startY + layers.length * rowH - 18}
          className="vline"
          markerEnd="url(#osi-ar)"
          markerStart="url(#osi-ar)"
        />
      ))}

      {/* Legend */}
      <g transform={`translate(${W / 2 - 200}, ${H - 28})`}>
        <line x1={0} y1={6} x2={28} y2={6} className="peer" />
        <text className="sub" x={34} y={10}>peer-layer · lógico</text>

        <line x1={160} y1={6} x2={188} y2={6} className="vline" />
        <text className="sub" x={194} y={10}>layer-to-layer · físico</text>

        <rect x={330} y={1} width={10} height={10} fill="#f4a5a5" rx={2} />
        <text className="sub" x={346} y={10}>n° capa</text>
      </g>
    </svg>
  );
}
