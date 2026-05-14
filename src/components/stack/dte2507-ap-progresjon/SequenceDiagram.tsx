/**
 * Lett sekvensdiagram: tre lifelines (Alice, Trudy, Bob) i SVG.
 * Hvis "trudy" er undefined, vises bare Alice ↔ Bob.
 */
type Msg = {
  from: "alice" | "trudy" | "bob";
  to: "alice" | "trudy" | "bob";
  label: string;
  note?: string;
  /** "attack" markerer trudy-meldinger i rødt */
  attack?: boolean;
};

type Props = {
  title: string;
  withTrudy?: boolean;
  messages: Msg[];
  conclusion?: string;
};

export function SequenceDiagram({
  title,
  withTrudy = false,
  messages,
  conclusion,
}: Props) {
  const lanes = withTrudy
    ? ([
        { id: "alice", label: "Alice", x: 90 },
        { id: "trudy", label: "Trudy", x: 320 },
        { id: "bob", label: "Bob", x: 550 },
      ] as const)
    : ([
        { id: "alice", label: "Alice", x: 110 },
        { id: "bob", label: "Bob", x: 510 },
      ] as const);

  const topY = 40;
  const stepGap = 56;
  const height = topY + messages.length * stepGap + 40;
  const width = withTrudy ? 640 : 620;

  return (
    <figure className="my-4">
      <figcaption className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
        {title}
      </figcaption>
      <div className="rounded-lg border border-border bg-card p-3 overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
          style={{ maxWidth: width }}
        >
          <defs>
            <marker
              id="seqarr"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
            </marker>
          </defs>

          {lanes.map((lane) => (
            <g key={lane.id} className="text-muted-foreground">
              <rect
                x={lane.x - 36}
                y={8}
                width={72}
                height={24}
                rx={4}
                className="fill-brand/10 stroke-brand"
                strokeWidth="1"
              />
              <text
                x={lane.x}
                y={24}
                textAnchor="middle"
                className="fill-foreground"
                fontSize="11"
                fontWeight="600"
              >
                {lane.label}
              </text>
              <line
                x1={lane.x}
                y1={32}
                x2={lane.x}
                y2={height - 10}
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            </g>
          ))}

          {messages.map((m, i) => {
            const from = lanes.find((l) => l.id === m.from);
            const to = lanes.find((l) => l.id === m.to);
            if (!from || !to) return null;
            const y = topY + i * stepGap + 16;
            const direction = from.x < to.x ? 1 : -1;
            const startX = from.x + direction * 8;
            const endX = to.x - direction * 8;
            const mid = (from.x + to.x) / 2;
            const color = m.attack ? "text-rose-600 dark:text-rose-400" : "text-foreground";
            return (
              <g key={i} className={color}>
                <line
                  x1={startX}
                  y1={y}
                  x2={endX}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="1.4"
                  markerEnd="url(#seqarr)"
                />
                <text
                  x={mid}
                  y={y - 6}
                  textAnchor="middle"
                  fontSize="10"
                  fontFamily="ui-monospace, monospace"
                  className="fill-current"
                >
                  {m.label}
                </text>
                {m.note && (
                  <text
                    x={mid}
                    y={y + 14}
                    textAnchor="middle"
                    fontSize="9"
                    fontStyle="italic"
                    className="fill-muted-foreground"
                  >
                    {m.note}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      {conclusion && (
        <p className="text-xs text-muted-foreground mt-2 italic leading-relaxed">
          {conclusion}
        </p>
      )}
    </figure>
  );
}
