export default function TCPHandshake({ className }: { className?: string }) {
  const W = 760;
  const H = 540;
  const leftX = 140;
  const rightX = W - 140;
  const topY = 80;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="TCP 3-way handshake y 4-way close"
    >
      <style>{`
        .h { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 700; fill: #f5f5f5; letter-spacing: -0.012em; }
        .head { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 600; fill: #f5f5f5; }
        .lbl { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; fill: #f5f5f5; }
        .sub { font-family: 'JetBrains Mono', monospace; font-size: 10.5px; fill: #bdbdbd; }
        .ttl { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; fill: #8a8a8a; letter-spacing: 0.06em; text-transform: uppercase; }
        .seq { font-family: 'JetBrains Mono', monospace; font-size: 11px; fill: #f4a5a5; font-weight: 600; }
        .ack { font-family: 'JetBrains Mono', monospace; font-size: 11px; fill: #a5e6b1; font-weight: 600; }
        .flag-syn { fill: #a5c8f4; font-weight: 700; }
        .flag-ack { fill: #a5e6b1; font-weight: 700; }
        .flag-fin { fill: #f4a5a5; font-weight: 700; }
        .timeline { stroke: #3a3a3a; stroke-width: 1; }
        .msg { stroke: #a5c8f4; stroke-width: 1.4; fill: none; }
        .msg-close { stroke: #f4a5a5; stroke-width: 1.4; fill: none; }
        .state { font-family: 'JetBrains Mono', monospace; font-size: 10px; fill: #8a8a8a; }
      `}</style>

      <defs>
        <marker id="tcp-ar-b" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L7,4 L0,8 z" fill="#a5c8f4" />
        </marker>
        <marker id="tcp-ar-r" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L7,4 L0,8 z" fill="#f4a5a5" />
        </marker>
      </defs>

      <text x={W / 2} y="30" textAnchor="middle" className="h">TCP · establecimiento y cierre</text>

      {/* Actors */}
      <text x={leftX} y={topY - 10} textAnchor="middle" className="head">Cliente</text>
      <text x={rightX} y={topY - 10} textAnchor="middle" className="head">Servidor</text>

      {/* Timelines */}
      <line x1={leftX} y1={topY} x2={leftX} y2={H - 30} className="timeline" />
      <line x1={rightX} y1={topY} x2={rightX} y2={H - 30} className="timeline" />

      {/* === 3-way handshake === */}
      <text x={20} y={topY + 10} className="ttl">3-way · setup</text>

      <line x1={leftX + 6} y1={topY + 30} x2={rightX - 6} y2={topY + 70} className="msg" markerEnd="url(#tcp-ar-b)" />
      <text x={(leftX + rightX) / 2} y={topY + 42} textAnchor="middle" className="lbl">
        <tspan className="flag-syn">SYN</tspan>
      </text>
      <text x={(leftX + rightX) / 2} y={topY + 56} textAnchor="middle" className="sub">
        <tspan className="seq">seq = x</tspan>
      </text>
      <text x={leftX - 8} y={topY + 90} textAnchor="end" className="state">SYN_SENT</text>

      <line x1={rightX - 6} y1={topY + 110} x2={leftX + 6} y2={topY + 150} className="msg" markerEnd="url(#tcp-ar-b)" />
      <text x={(leftX + rightX) / 2} y={topY + 122} textAnchor="middle" className="lbl">
        <tspan className="flag-syn">SYN</tspan>
        <tspan> + </tspan>
        <tspan className="flag-ack">ACK</tspan>
      </text>
      <text x={(leftX + rightX) / 2} y={topY + 136} textAnchor="middle" className="sub">
        <tspan className="seq">seq = y</tspan>
        <tspan>, </tspan>
        <tspan className="ack">ack = x+1</tspan>
      </text>
      <text x={rightX + 8} y={topY + 170} textAnchor="start" className="state">SYN_RCVD</text>

      <line x1={leftX + 6} y1={topY + 190} x2={rightX - 6} y2={topY + 230} className="msg" markerEnd="url(#tcp-ar-b)" />
      <text x={(leftX + rightX) / 2} y={topY + 202} textAnchor="middle" className="lbl">
        <tspan className="flag-ack">ACK</tspan>
      </text>
      <text x={(leftX + rightX) / 2} y={topY + 216} textAnchor="middle" className="sub">
        <tspan className="ack">ack = y+1</tspan>
      </text>
      <text x={leftX - 8} y={topY + 250} textAnchor="end" className="state">ESTABLISHED</text>
      <text x={rightX + 8} y={topY + 250} textAnchor="start" className="state">ESTABLISHED</text>

      <line x1={50} y1={topY + 275} x2={W - 50} y2={topY + 275} stroke="#3a3a3a" strokeDasharray="3 4" />

      {/* === 4-way close === */}
      <text x={20} y={topY + 295} className="ttl">4-way · close</text>

      <line x1={leftX + 6} y1={topY + 310} x2={rightX - 6} y2={topY + 345} className="msg-close" markerEnd="url(#tcp-ar-r)" />
      <text x={(leftX + rightX) / 2} y={topY + 322} textAnchor="middle" className="lbl">
        <tspan className="flag-fin">FIN</tspan>
      </text>
      <text x={leftX - 8} y={topY + 365} textAnchor="end" className="state">FIN_WAIT_1</text>

      <line x1={rightX - 6} y1={topY + 360} x2={leftX + 6} y2={topY + 385} className="msg-close" markerEnd="url(#tcp-ar-r)" />
      <text x={(leftX + rightX) / 2} y={topY + 372} textAnchor="middle" className="lbl">
        <tspan className="flag-ack">ACK</tspan>
      </text>
      <text x={leftX - 8} y={topY + 405} textAnchor="end" className="state">FIN_WAIT_2</text>
      <text x={rightX + 8} y={topY + 405} textAnchor="start" className="state">CLOSE_WAIT</text>

      <line x1={rightX - 6} y1={topY + 410} x2={leftX + 6} y2={topY + 435} className="msg-close" markerEnd="url(#tcp-ar-r)" />
      <text x={(leftX + rightX) / 2} y={topY + 422} textAnchor="middle" className="lbl">
        <tspan className="flag-fin">FIN</tspan>
      </text>
      <text x={rightX + 8} y={topY + 445} textAnchor="start" className="state">LAST_ACK</text>

      <line x1={leftX + 6} y1={topY + 440} x2={rightX - 6} y2={topY + 460} className="msg-close" markerEnd="url(#tcp-ar-r)" />
      <text x={(leftX + rightX) / 2} y={topY + 452} textAnchor="middle" className="lbl">
        <tspan className="flag-ack">ACK</tspan>
      </text>
      <text x={leftX - 8} y={topY + 470} textAnchor="end" className="state">TIME_WAIT (2·MSL)</text>

      <g transform={`translate(60, ${H - 14})`}>
        <text className="sub" x={0} y={4}>
          <tspan className="flag-syn">SYN</tspan>
          <tspan fill="#bdbdbd">  sync  ·  </tspan>
          <tspan className="flag-ack">ACK</tspan>
          <tspan fill="#bdbdbd">  confirma  ·  </tspan>
          <tspan className="flag-fin">FIN</tspan>
          <tspan fill="#bdbdbd">  cierra  ·  </tspan>
          <tspan className="seq">seq</tspan>
          <tspan fill="#bdbdbd"> = nº inicial  ·  </tspan>
          <tspan className="ack">ack</tspan>
          <tspan fill="#bdbdbd"> = próximo byte</tspan>
        </text>
      </g>
    </svg>
  );
}
