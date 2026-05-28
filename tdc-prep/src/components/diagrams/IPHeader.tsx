export default function IPHeader({ className }: { className?: string }) {
  const W = 840;
  const H = 380;
  const startX = 60;
  const startY = 70;
  const totalBits = 32;
  const bitW = (W - 2 * startX) / totalBits;
  const rowH = 38;

  // Rows: [name, bitsWidth, group]
  type Cell = { name: string; bits: number; group: "ctrl" | "id" | "addr" | "options" };
  const rows: Cell[][] = [
    [
      { name: "Version", bits: 4, group: "ctrl" },
      { name: "IHL", bits: 4, group: "ctrl" },
      { name: "ToS / DSCP", bits: 8, group: "ctrl" },
      { name: "Total Length", bits: 16, group: "ctrl" },
    ],
    [
      { name: "Identification", bits: 16, group: "id" },
      { name: "Flags", bits: 3, group: "id" },
      { name: "Fragment Offset", bits: 13, group: "id" },
    ],
    [
      { name: "TTL", bits: 8, group: "ctrl" },
      { name: "Protocol", bits: 8, group: "ctrl" },
      { name: "Header Checksum", bits: 16, group: "ctrl" },
    ],
    [{ name: "Source IP Address", bits: 32, group: "addr" }],
    [{ name: "Destination IP Address", bits: 32, group: "addr" }],
    [{ name: "Options (variable, opcional)", bits: 32, group: "options" }],
  ];

  const colorByGroup: Record<Cell["group"], string> = {
    ctrl: "#a5c8f4",
    id: "#f4a5a5",
    addr: "#a5e6b1",
    options: "#bdbdbd",
  };
  const fillByGroup: Record<Cell["group"], string> = {
    ctrl: "rgba(165, 200, 244, 0.10)",
    id: "rgba(244, 165, 165, 0.10)",
    addr: "rgba(165, 230, 177, 0.10)",
    options: "rgba(189, 189, 189, 0.06)",
  };

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Header IPv4"
    >
      <style>{`
        .h { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 700; fill: #f5f5f5; letter-spacing: -0.012em; }
        .bit-num { font-family: 'JetBrains Mono', monospace; font-size: 9px; fill: #8a8a8a; }
        .field { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; fill: #f5f5f5; font-weight: 500; }
        .small { font-family: 'JetBrains Mono', monospace; font-size: 10px; fill: #8a8a8a; }
        .cell { stroke: #3a3a3a; stroke-width: 1; }
      `}</style>

      <text x={W / 2} y={26} textAnchor="middle" className="h">
        Header IPv4 · 20 bytes mínimos (5 filas × 32 bits)
      </text>

      {/* Bit ruler */}
      {Array.from({ length: 9 }, (_, i) => {
        const b = i * 4;
        return (
          <text
            key={b}
            x={startX + b * bitW}
            y={startY - 8}
            textAnchor="middle"
            className="bit-num"
          >
            {b}
          </text>
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
      <g transform={`translate(${W / 2 - 260}, ${H - 26})`}>
        <rect x={0} y={0} width={10} height={10} fill="#a5c8f4" rx={2} />
        <text className="small" x={16} y={9}>control · versión, TTL, protocolo</text>
        <rect x={200} y={0} width={10} height={10} fill="#f4a5a5" rx={2} />
        <text className="small" x={216} y={9}>fragmentación · ID, flags, offset</text>
        <rect x={400} y={0} width={10} height={10} fill="#a5e6b1" rx={2} />
        <text className="small" x={416} y={9}>direcciones · src, dst</text>
      </g>
    </svg>
  );
}
