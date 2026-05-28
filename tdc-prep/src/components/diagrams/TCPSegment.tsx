export default function TCPSegment({ className }: { className?: string }) {
  const W = 840;
  const H = 360;
  const startX = 60;
  const startY = 70;
  const totalBits = 32;
  const bitW = (W - 2 * startX) / totalBits;
  const rowH = 38;

  type Cell = { name: string; bits: number; group: "ports" | "seq" | "ctrl" | "win" | "check" | "opt" };
  const rows: Cell[][] = [
    [
      { name: "Source Port", bits: 16, group: "ports" },
      { name: "Destination Port", bits: 16, group: "ports" },
    ],
    [{ name: "Sequence Number", bits: 32, group: "seq" }],
    [{ name: "Acknowledgement Number", bits: 32, group: "seq" }],
    [
      { name: "HdrLen", bits: 4, group: "ctrl" },
      { name: "Rsv", bits: 6, group: "ctrl" },
      { name: "URG·ACK·PSH·RST·SYN·FIN", bits: 6, group: "ctrl" },
      { name: "Window Size", bits: 16, group: "win" },
    ],
    [
      { name: "Checksum", bits: 16, group: "check" },
      { name: "Urgent Pointer", bits: 16, group: "check" },
    ],
    [{ name: "Options (MSS, WS, SACK, Timestamps)", bits: 32, group: "opt" }],
  ];

  const colorByGroup: Record<Cell["group"], string> = {
    ports: "#a5c8f4",
    seq: "#a5e6b1",
    ctrl: "#f4a5a5",
    win: "#a5c8f4",
    check: "#bdbdbd",
    opt: "#bdbdbd",
  };
  const fillByGroup: Record<Cell["group"], string> = {
    ports: "rgba(165, 200, 244, 0.10)",
    seq: "rgba(165, 230, 177, 0.10)",
    ctrl: "rgba(244, 165, 165, 0.10)",
    win: "rgba(165, 200, 244, 0.06)",
    check: "rgba(189, 189, 189, 0.05)",
    opt: "rgba(189, 189, 189, 0.04)",
  };

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Header TCP"
    >
      <style>{`
        .h { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 700; fill: #f5f5f5; letter-spacing: -0.012em; }
        .bit-num { font-family: 'JetBrains Mono', monospace; font-size: 9px; fill: #8a8a8a; }
        .field { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; fill: #f5f5f5; font-weight: 500; }
        .small { font-family: 'JetBrains Mono', monospace; font-size: 10px; fill: #8a8a8a; }
        .cell { stroke: #3a3a3a; stroke-width: 1; }
      `}</style>

      <text x={W / 2} y={26} textAnchor="middle" className="h">
        Segmento TCP · 20 bytes mínimos
      </text>

      {/* Bit ruler */}
      {Array.from({ length: 9 }, (_, i) => {
        const b = i * 4;
        return (
          <text key={b} x={startX + b * bitW} y={startY - 8} textAnchor="middle" className="bit-num">{b}</text>
        );
      })}

      {rows.map((row, ri) => {
        let xCursor = startX;
        return (
          <g key={ri}>
            {row.map((cell, ci) => {
              const w = cell.bits * bitW;
              const x = xCursor;
              xCursor += w;
              return (
                <g key={ci}>
                  <rect
                    x={x}
                    y={startY + ri * rowH}
                    width={w}
                    height={rowH}
                    className="cell"
                    fill={fillByGroup[cell.group]}
                    stroke={colorByGroup[cell.group]}
                  />
                  <text
                    x={x + w / 2}
                    y={startY + ri * rowH + rowH / 2 + 4}
                    textAnchor="middle"
                    className="field"
                    fontSize={cell.bits < 8 ? 9 : 11}
                  >
                    {cell.name}
                  </text>
                  <text
                    x={x + w / 2}
                    y={startY + ri * rowH + rowH - 4}
                    textAnchor="middle"
                    className="small"
                  >
                    {cell.bits}b
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}

      {/* Legend */}
      <g transform={`translate(${W / 2 - 260}, ${H - 22})`}>
        <rect x={0} y={0} width={10} height={10} fill="#a5c8f4" rx={2} />
        <text className="small" x={16} y={9}>puertos · demux</text>
        <rect x={150} y={0} width={10} height={10} fill="#a5e6b1" rx={2} />
        <text className="small" x={166} y={9}>secuencia · ordenamiento + ACK</text>
        <rect x={390} y={0} width={10} height={10} fill="#f4a5a5" rx={2} />
        <text className="small" x={406} y={9}>flags · SYN, ACK, FIN, RST...</text>
      </g>
    </svg>
  );
}
