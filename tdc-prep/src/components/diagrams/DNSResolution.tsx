export default function DNSResolution({ className }: { className?: string }) {
  const W = 880;
  const H = 460;

  // 6 boxes positions
  const cli = { x: 60, y: 200, w: 130, h: 56, name: "Cliente" };
  const local = { x: 240, y: 200, w: 150, h: 56, name: "Local NS" };
  const root = { x: 470, y: 70, w: 130, h: 50, name: "Root NS\n." };
  const tld = { x: 470, y: 170, w: 130, h: 50, name: ".edu NS" };
  const auth1 = { x: 470, y: 270, w: 150, h: 50, name: "princeton.edu NS" };
  const auth2 = { x: 470, y: 370, w: 170, h: 50, name: "cs.princeton.edu NS" };

  const boxes = [cli, local, root, tld, auth1, auth2];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Resolución DNS recursiva e iterativa"
    >
      <style>{`
        .h { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 700; fill: #f5f5f5; letter-spacing: -0.012em; }
        .lbl { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; fill: #f5f5f5; font-weight: 500; }
        .small { font-family: 'JetBrains Mono', monospace; font-size: 10px; fill: #8a8a8a; }
        .box { fill: #2a2a2a; stroke: #3a3a3a; stroke-width: 1; }
        .recursive { stroke: #f4a5a5; stroke-width: 1.5; fill: none; }
        .iterative { stroke: #a5c8f4; stroke-width: 1.3; fill: none; }
        .iter-resp { stroke: #a5e6b1; stroke-width: 1.3; fill: none; }
        .num { font-family: 'JetBrains Mono', monospace; font-size: 11px; fill: #f5f5f5; font-weight: 600; }
        .num-bg { fill: #1e1e1e; stroke: #3a3a3a; stroke-width: 1; }
      `}</style>

      <defs>
        <marker id="dns-ar-r" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 z" fill="#f4a5a5" />
        </marker>
        <marker id="dns-ar-b" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 z" fill="#a5c8f4" />
        </marker>
        <marker id="dns-ar-g" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 z" fill="#a5e6b1" />
        </marker>
      </defs>

      <text x={W / 2} y={26} textAnchor="middle" className="h">
        Resolución DNS · cliente pide cs.princeton.edu
      </text>

      {/* Boxes */}
      {boxes.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h} className="box" rx={3} />
          {b.name.split("\n").map((line, j) => (
            <text
              key={j}
              x={b.x + b.w / 2}
              y={b.y + b.h / 2 + 4 + (j - 0.4) * 13}
              textAnchor="middle"
              className="lbl"
            >
              {line}
            </text>
          ))}
        </g>
      ))}

      {/* Arrows: 1 recursive cli->local */}
      <line
        x1={cli.x + cli.w}
        y1={cli.y + 24}
        x2={local.x}
        y2={local.y + 24}
        className="recursive"
        markerEnd="url(#dns-ar-r)"
      />
      <NumBadge n={1} cx={(cli.x + cli.w + local.x) / 2} cy={cli.y + 24} />

      {/* 10 recursive local->cli (return) */}
      <line
        x1={local.x}
        y1={local.y + 40}
        x2={cli.x + cli.w}
        y2={cli.y + 40}
        className="recursive"
        markerEnd="url(#dns-ar-r)"
      />
      <NumBadge n={10} cx={(cli.x + cli.w + local.x) / 2} cy={cli.y + 40} />

      {/* 2,3 iterative local <-> root */}
      <Curve from={local} to={root} className="iterative" markerEnd="url(#dns-ar-b)" offsetY={-6} />
      <NumBadge n={2} cx={420} cy={130} />
      <Curve from={root} to={local} className="iter-resp" markerEnd="url(#dns-ar-g)" offsetY={6} />
      <NumBadge n={3} cx={440} cy={148} />

      {/* 4,5 local <-> tld */}
      <Curve from={local} to={tld} className="iterative" markerEnd="url(#dns-ar-b)" offsetY={-6} />
      <NumBadge n={4} cx={420} cy={205} />
      <Curve from={tld} to={local} className="iter-resp" markerEnd="url(#dns-ar-g)" offsetY={6} />
      <NumBadge n={5} cx={440} cy={222} />

      {/* 6,7 local <-> auth1 */}
      <Curve from={local} to={auth1} className="iterative" markerEnd="url(#dns-ar-b)" offsetY={-6} />
      <NumBadge n={6} cx={420} cy={280} />
      <Curve from={auth1} to={local} className="iter-resp" markerEnd="url(#dns-ar-g)" offsetY={6} />
      <NumBadge n={7} cx={440} cy={298} />

      {/* 8,9 local <-> auth2 */}
      <Curve from={local} to={auth2} className="iterative" markerEnd="url(#dns-ar-b)" offsetY={-6} />
      <NumBadge n={8} cx={420} cy={358} />
      <Curve from={auth2} to={local} className="iter-resp" markerEnd="url(#dns-ar-g)" offsetY={6} />
      <NumBadge n={9} cx={440} cy={376} />

      {/* Legend */}
      <g transform={`translate(${W / 2 - 240}, ${H - 22})`}>
        <line x1={0} y1={6} x2={26} y2={6} className="recursive" />
        <text className="small" x={32} y={10}>1, 10 · recursiva</text>
        <line x1={155} y1={6} x2={181} y2={6} className="iterative" />
        <text className="small" x={187} y={10}>2, 4, 6, 8 · iterativa (consulta)</text>
        <line x1={420} y1={6} x2={446} y2={6} className="iter-resp" />
        <text className="small" x={452} y={10}>3, 5, 7, 9 · iterativa (respuesta)</text>
      </g>
    </svg>
  );
}

function NumBadge({ n, cx, cy }: { n: number; cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={10} className="num-bg" />
      <text x={cx} y={cy + 4} textAnchor="middle" className="num">{n}</text>
    </g>
  );
}

type Box = { x: number; y: number; w: number; h: number };

function Curve({
  from,
  to,
  className,
  markerEnd,
  offsetY = 0,
}: {
  from: Box;
  to: Box;
  className: string;
  markerEnd: string;
  offsetY?: number;
}) {
  const x1 = from.x + from.w;
  const y1 = from.y + from.h / 2 + offsetY;
  const x2 = to.x;
  const y2 = to.y + to.h / 2 + offsetY;
  return <path d={`M ${x1} ${y1} L ${x2} ${y2}`} className={className} markerEnd={markerEnd} />;
}
