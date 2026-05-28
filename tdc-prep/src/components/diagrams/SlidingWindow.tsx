export default function SlidingWindow({ className }: { className?: string }) {
  const W = 820;
  const H = 360;
  const cellW = 38;
  const cellH = 36;
  const cells = 16;
  const startX = (W - cellW * cells) / 2;
  const baseY = 130;
  // segment classification
  // 0..3 ACKed, 4..7 in-flight, 8..11 ready to send, 12.. not yet allowed
  const ackedEnd = 4;
  const sentEnd = 8;
  const writableEnd = 12;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="TCP Sliding Window"
    >
      <style>{`
        .h { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 700; fill: #f5f5f5; letter-spacing: -0.012em; }
        .lbl { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; fill: #f5f5f5; font-weight: 500; }
        .small { font-family: 'JetBrains Mono', monospace; font-size: 10px; fill: #8a8a8a; }
        .ptr { font-family: 'JetBrains Mono', monospace; font-size: 10.5px; }
        .cell { stroke: #3a3a3a; stroke-width: 1; }
        .cell-acked { fill: rgba(165, 230, 177, 0.18); }
        .cell-inflight { fill: rgba(165, 200, 244, 0.22); }
        .cell-ready { fill: rgba(244, 165, 165, 0.18); }
        .cell-future { fill: #2a2a2a; }
        .cell-num { font-family: 'JetBrains Mono', monospace; font-size: 11px; fill: #f5f5f5; }
        .arrow { stroke: #bdbdbd; stroke-width: 1; fill: none; }
        .window-bracket { stroke: #f5f5f5; stroke-width: 1.4; fill: none; }
      `}</style>

      <defs>
        <marker id="sw-ar" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 z" fill="#bdbdbd" />
        </marker>
      </defs>

      <text x={W / 2} y={28} textAnchor="middle" className="h">Ventana deslizante TCP · vista del emisor</text>

      {/* Window bracket */}
      <path
        d={`M ${startX + ackedEnd * cellW} ${baseY - 18}
            L ${startX + ackedEnd * cellW} ${baseY - 28}
            L ${startX + writableEnd * cellW} ${baseY - 28}
            L ${startX + writableEnd * cellW} ${baseY - 18}`}
        className="window-bracket"
      />
      <text
        x={startX + (ackedEnd + writableEnd) / 2 * cellW}
        y={baseY - 36}
        textAnchor="middle"
        className="lbl"
      >
        ventana (SWS)
      </text>

      {/* Cells */}
      {Array.from({ length: cells }, (_, i) => {
        let cls = "cell-future";
        if (i < ackedEnd) cls = "cell-acked";
        else if (i < sentEnd) cls = "cell-inflight";
        else if (i < writableEnd) cls = "cell-ready";
        return (
          <g key={i}>
            <rect
              x={startX + i * cellW}
              y={baseY}
              width={cellW}
              height={cellH}
              className={`cell ${cls}`}
            />
            <text
              x={startX + i * cellW + cellW / 2}
              y={baseY + cellH / 2 + 4}
              textAnchor="middle"
              className="cell-num"
            >
              {i + 1}
            </text>
          </g>
        );
      })}

      {/* Pointers below */}
      <g>
        {/* LastByteAcked */}
        <line
          x1={startX + ackedEnd * cellW}
          y1={baseY + cellH}
          x2={startX + ackedEnd * cellW}
          y2={baseY + cellH + 22}
          className="arrow"
          markerEnd="url(#sw-ar)"
        />
        <text
          x={startX + ackedEnd * cellW}
          y={baseY + cellH + 38}
          textAnchor="middle"
          className="ptr"
          fill="#a5e6b1"
        >
          LastByteAcked
        </text>

        {/* LastByteSent */}
        <line
          x1={startX + sentEnd * cellW}
          y1={baseY + cellH}
          x2={startX + sentEnd * cellW}
          y2={baseY + cellH + 50}
          className="arrow"
          markerEnd="url(#sw-ar)"
        />
        <text
          x={startX + sentEnd * cellW}
          y={baseY + cellH + 66}
          textAnchor="middle"
          className="ptr"
          fill="#a5c8f4"
        >
          LastByteSent
        </text>

        {/* LastByteWritten */}
        <line
          x1={startX + writableEnd * cellW}
          y1={baseY + cellH}
          x2={startX + writableEnd * cellW}
          y2={baseY + cellH + 22}
          className="arrow"
          markerEnd="url(#sw-ar)"
        />
        <text
          x={startX + writableEnd * cellW}
          y={baseY + cellH + 38}
          textAnchor="middle"
          className="ptr"
          fill="#f4a5a5"
        >
          LastByteWritten
        </text>
      </g>

      {/* State labels above */}
      <text x={startX + (ackedEnd / 2) * cellW} y={baseY - 6} textAnchor="middle" className="small" fill="#a5e6b1">
        ACK recibidos
      </text>
      <text x={startX + ((ackedEnd + sentEnd) / 2) * cellW} y={baseY - 6} textAnchor="middle" className="small" fill="#a5c8f4">
        en vuelo
      </text>
      <text x={startX + ((sentEnd + writableEnd) / 2) * cellW} y={baseY - 6} textAnchor="middle" className="small" fill="#f4a5a5">
        listos
      </text>
      <text x={startX + ((writableEnd + cells) / 2) * cellW} y={baseY - 6} textAnchor="middle" className="small">
        bloqueados
      </text>

      {/* Legend */}
      <g transform={`translate(${W / 2 - 240}, ${H - 30})`}>
        <rect x={0} y={0} width={12} height={12} className="cell cell-acked" />
        <text className="small" x={18} y={10}>confirmados</text>
        <rect x={110} y={0} width={12} height={12} className="cell cell-inflight" />
        <text className="small" x={128} y={10}>en vuelo · sin ACK</text>
        <rect x={290} y={0} width={12} height={12} className="cell cell-ready" />
        <text className="small" x={308} y={10}>listos para enviar</text>
        <rect x={460} y={0} width={12} height={12} className="cell cell-future" />
        <text className="small" x={478} y={10}>bloqueados</text>
      </g>
    </svg>
  );
}
