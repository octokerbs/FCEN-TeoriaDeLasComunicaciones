export default function TCPStateMachine({ className }: { className?: string }) {
  const W = 860;
  const H = 540;

  const states = [
    { id: "CLOSED", x: 430, y: 60, kind: "neutral" },
    { id: "LISTEN", x: 280, y: 140, kind: "server" },
    { id: "SYN_SENT", x: 580, y: 140, kind: "client" },
    { id: "SYN_RCVD", x: 280, y: 240, kind: "server" },
    { id: "ESTABLISHED", x: 430, y: 290, kind: "both" },
    { id: "FIN_WAIT_1", x: 200, y: 380, kind: "client" },
    { id: "FIN_WAIT_2", x: 200, y: 460, kind: "client" },
    { id: "CLOSING", x: 350, y: 420, kind: "client" },
    { id: "TIME_WAIT", x: 350, y: 490, kind: "client" },
    { id: "CLOSE_WAIT", x: 580, y: 380, kind: "server" },
    { id: "LAST_ACK", x: 660, y: 460, kind: "server" },
  ] as const;

  const transitions: { from: string; to: string; label: string }[] = [
    { from: "CLOSED", to: "LISTEN", label: "LISTEN" },
    { from: "CLOSED", to: "SYN_SENT", label: "CONNECT / SYN" },
    { from: "LISTEN", to: "SYN_RCVD", label: "SYN / SYN+ACK" },
    { from: "SYN_SENT", to: "ESTABLISHED", label: "SYN+ACK / ACK" },
    { from: "SYN_RCVD", to: "ESTABLISHED", label: "ACK" },
    { from: "ESTABLISHED", to: "FIN_WAIT_1", label: "CLOSE / FIN" },
    { from: "ESTABLISHED", to: "CLOSE_WAIT", label: "FIN / ACK" },
    { from: "FIN_WAIT_1", to: "FIN_WAIT_2", label: "ACK" },
    { from: "FIN_WAIT_1", to: "CLOSING", label: "FIN / ACK" },
    { from: "FIN_WAIT_2", to: "TIME_WAIT", label: "FIN / ACK" },
    { from: "CLOSING", to: "TIME_WAIT", label: "ACK" },
    { from: "CLOSE_WAIT", to: "LAST_ACK", label: "CLOSE / FIN" },
    { from: "LAST_ACK", to: "CLOSED", label: "ACK" },
    { from: "TIME_WAIT", to: "CLOSED", label: "2·MSL" },
  ];

  const kindFill: Record<string, string> = {
    neutral: "#2a2a2a",
    server: "rgba(165, 230, 177, 0.10)",
    client: "rgba(165, 200, 244, 0.10)",
    both: "rgba(244, 165, 165, 0.10)",
  };
  const kindStroke: Record<string, string> = {
    neutral: "#3a3a3a",
    server: "#a5e6b1",
    client: "#a5c8f4",
    both: "#f4a5a5",
  };

  const lookup = Object.fromEntries(states.map((s) => [s.id, s]));

  const boxW = 130;
  const boxH = 32;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Máquina de estados TCP"
    >
      <style>{`
        .h { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 700; fill: #f5f5f5; letter-spacing: -0.012em; }
        .state { font-family: 'JetBrains Mono', monospace; font-size: 11.5px; fill: #f5f5f5; font-weight: 600; }
        .ev { font-family: 'JetBrains Mono', monospace; font-size: 9.5px; fill: #bdbdbd; }
        .small { font-family: 'JetBrains Mono', monospace; font-size: 10px; fill: #8a8a8a; }
        .arrow { stroke: #bdbdbd; stroke-width: 1; fill: none; opacity: 0.7; }
      `}</style>

      <defs>
        <marker id="ts-ar" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 z" fill="#bdbdbd" />
        </marker>
      </defs>

      <text x={W / 2} y={26} textAnchor="middle" className="h">
        Máquina de estados TCP
      </text>

      {/* Edges */}
      {transitions.map((t, i) => {
        const a = lookup[t.from];
        const b = lookup[t.to];
        if (!a || !b) return null;
        const ax = a.x + boxW / 2;
        const ay = a.y + boxH / 2;
        const bx = b.x + boxW / 2;
        const by = b.y + boxH / 2;

        // simple offset
        const dx = bx - ax;
        const dy = by - ay;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const ux = dx / dist;
        const uy = dy / dist;
        const startBoxRadius = 65;
        const endBoxRadius = 70;
        const sx = ax + ux * startBoxRadius * 0.6;
        const sy = ay + uy * (boxH / 2);
        const ex = bx - ux * endBoxRadius * 0.6;
        const ey = by - uy * (boxH / 2);

        return (
          <g key={i}>
            <line x1={sx} y1={sy} x2={ex} y2={ey} className="arrow" markerEnd="url(#ts-ar)" />
            <text
              x={(sx + ex) / 2}
              y={(sy + ey) / 2 - 5}
              textAnchor="middle"
              className="ev"
            >
              {t.label}
            </text>
          </g>
        );
      })}

      {/* States */}
      {states.map((s) => (
        <g key={s.id}>
          <rect
            x={s.x}
            y={s.y}
            width={boxW}
            height={boxH}
            rx={3}
            fill={kindFill[s.kind]}
            stroke={kindStroke[s.kind]}
            strokeWidth={1.4}
          />
          <text x={s.x + boxW / 2} y={s.y + boxH / 2 + 4} textAnchor="middle" className="state">
            {s.id}
          </text>
        </g>
      ))}

      {/* Legend */}
      <g transform={`translate(${W / 2 - 220}, ${H - 22})`}>
        <rect x={0} y={0} width={10} height={10} fill="rgba(165, 200, 244, 0.4)" stroke="#a5c8f4" rx={2} />
        <text className="small" x={16} y={9}>estados de cliente</text>
        <rect x={170} y={0} width={10} height={10} fill="rgba(165, 230, 177, 0.4)" stroke="#a5e6b1" rx={2} />
        <text className="small" x={186} y={9}>estados de servidor</text>
        <rect x={340} y={0} width={10} height={10} fill="rgba(244, 165, 165, 0.4)" stroke="#f4a5a5" rx={2} />
        <text className="small" x={356} y={9}>establecido</text>
      </g>
    </svg>
  );
}
