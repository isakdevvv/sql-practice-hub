/**
 * Forenklede FSM-diagrammer for rdt-protokollene.
 * Tegnes som SVG. Sender-side til venstre, mottaker-side til høyre.
 */
type State = { id: string; label: string; x: number; y: number };
type Edge = {
  from: string;
  to: string;
  trigger: string;
  action: string;
  curve?: number;
};

function FsmDiagram({
  title,
  width = 520,
  height = 220,
  states,
  edges,
}: {
  title: string;
  width?: number;
  height?: number;
  states: State[];
  edges: Edge[];
}) {
  const r = 38;
  return (
    <figure className="my-3">
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
              id={`arr-${title.replace(/\s/g, "")}`}
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
          {edges.map((e, i) => {
            const a = states.find((s) => s.id === e.from)!;
            const b = states.find((s) => s.id === e.to)!;
            const isSelf = e.from === e.to;
            const curve = e.curve ?? 0;
            let d: string;
            let labelX: number;
            let labelY: number;
            if (isSelf) {
              const cx = a.x;
              const cy = a.y - r - 28;
              d = `M ${a.x - 16} ${a.y - r + 4} Q ${cx - 36} ${cy} ${cx} ${cy} Q ${cx + 36} ${cy} ${a.x + 16} ${a.y - r + 4}`;
              labelX = cx;
              labelY = cy - 6;
            } else {
              const dx = b.x - a.x;
              const dy = b.y - a.y;
              const len = Math.sqrt(dx * dx + dy * dy);
              const ux = dx / len;
              const uy = dy / len;
              const sx = a.x + ux * r;
              const sy = a.y + uy * r;
              const ex = b.x - ux * r;
              const ey = b.y - uy * r;
              const mx = (sx + ex) / 2 - uy * curve;
              const my = (sy + ey) / 2 + ux * curve;
              d = `M ${sx} ${sy} Q ${mx} ${my} ${ex} ${ey}`;
              labelX = mx;
              labelY = my - 4;
            }
            return (
              <g key={i} className="text-muted-foreground">
                <path
                  d={d}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd={`url(#arr-${title.replace(/\s/g, "")})`}
                />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  className="fill-foreground"
                  fontSize="9"
                  fontFamily="ui-monospace, monospace"
                >
                  <tspan x={labelX} dy="0">
                    {e.trigger}
                  </tspan>
                  <tspan x={labelX} dy="10" className="fill-brand">
                    {e.action}
                  </tspan>
                </text>
              </g>
            );
          })}
          {states.map((s) => (
            <g key={s.id}>
              <circle
                cx={s.x}
                cy={s.y}
                r={r}
                className="fill-brand/10 stroke-brand"
                strokeWidth="1.5"
              />
              <text
                x={s.x}
                y={s.y + 3}
                textAnchor="middle"
                className="fill-foreground"
                fontSize="10"
                fontWeight="600"
              >
                {s.label.split("\n").map((line, i) => (
                  <tspan key={i} x={s.x} dy={i === 0 ? 0 : 11}>
                    {line}
                  </tspan>
                ))}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </figure>
  );
}

export function FsmRdt10() {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <FsmDiagram
        title="rdt1.0 sender"
        states={[{ id: "wait", label: "Vent på\ncall fra over", x: 110, y: 110 }]}
        edges={[
          {
            from: "wait",
            to: "wait",
            trigger: "rdt_send(data)",
            action: "make_pkt; udt_send",
          },
        ]}
      />
      <FsmDiagram
        title="rdt1.0 mottaker"
        states={[{ id: "wait", label: "Vent på\ncall fra under", x: 110, y: 110 }]}
        edges={[
          {
            from: "wait",
            to: "wait",
            trigger: "rdt_rcv(pkt)",
            action: "extract; deliver_data",
          },
        ]}
      />
    </div>
  );
}

export function FsmRdt20() {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <FsmDiagram
        title="rdt2.0 sender"
        width={540}
        states={[
          { id: "wait_call", label: "Vent\nrdt_send", x: 120, y: 110 },
          { id: "wait_ack", label: "Vent\nACK/NAK", x: 400, y: 110 },
        ]}
        edges={[
          {
            from: "wait_call",
            to: "wait_ack",
            trigger: "rdt_send(data)",
            action: "make_pkt(checksum); udt_send",
          },
          {
            from: "wait_ack",
            to: "wait_call",
            trigger: "rcv(ACK)",
            action: "Λ (gjør ingenting)",
            curve: 28,
          },
          {
            from: "wait_ack",
            to: "wait_ack",
            trigger: "rcv(NAK)",
            action: "udt_send(sndpkt) — retransmit",
          },
        ]}
      />
      <FsmDiagram
        title="rdt2.0 mottaker"
        states={[{ id: "wait", label: "Vent på\npkt fra under", x: 130, y: 110 }]}
        edges={[
          {
            from: "wait",
            to: "wait",
            trigger: "rdt_rcv & corrupt",
            action: "udt_send(NAK)",
            curve: -40,
          },
          {
            from: "wait",
            to: "wait",
            trigger: "rdt_rcv & notcorrupt",
            action: "deliver; udt_send(ACK)",
          },
        ]}
      />
    </div>
  );
}

export function FsmRdt21Sender() {
  return (
    <FsmDiagram
      title="rdt2.1 sender — fire tilstander (seq# 0/1)"
      width={620}
      height={290}
      states={[
        { id: "wait0", label: "Vent\ncall 0", x: 100, y: 80 },
        { id: "ack0", label: "Vent\nACK 0", x: 520, y: 80 },
        { id: "ack1", label: "Vent\nACK 1", x: 100, y: 220 },
        { id: "wait1", label: "Vent\ncall 1", x: 520, y: 220 },
      ]}
      edges={[
        {
          from: "wait0",
          to: "ack0",
          trigger: "rdt_send",
          action: "pkt(seq=0); send",
        },
        {
          from: "ack0",
          to: "wait1",
          trigger: "rcv(ACK,ok)",
          action: "Λ",
        },
        {
          from: "wait1",
          to: "ack1",
          trigger: "rdt_send",
          action: "pkt(seq=1); send",
        },
        {
          from: "ack1",
          to: "wait0",
          trigger: "rcv(ACK,ok)",
          action: "Λ",
        },
        {
          from: "ack0",
          to: "ack0",
          trigger: "rcv(NAK) ∨ corrupt-ACK",
          action: "resend",
          curve: 30,
        },
        {
          from: "ack1",
          to: "ack1",
          trigger: "rcv(NAK) ∨ corrupt-ACK",
          action: "resend",
          curve: 30,
        },
      ]}
    />
  );
}

export function FsmRdt30Sender() {
  return (
    <FsmDiagram
      title="rdt3.0 sender — som rdt2.2, men med TIMER"
      width={640}
      height={260}
      states={[
        { id: "wait0", label: "Vent\ncall 0", x: 100, y: 80 },
        { id: "ack0", label: "Vent\nACK 0", x: 540, y: 80 },
        { id: "ack1", label: "Vent\nACK 1", x: 100, y: 200 },
        { id: "wait1", label: "Vent\ncall 1", x: 540, y: 200 },
      ]}
      edges={[
        {
          from: "wait0",
          to: "ack0",
          trigger: "rdt_send",
          action: "send pkt(0); start_timer",
        },
        {
          from: "ack0",
          to: "wait1",
          trigger: "rcv(ACK,seq=0)",
          action: "stop_timer",
        },
        {
          from: "ack0",
          to: "ack0",
          trigger: "TIMEOUT",
          action: "resend; restart_timer",
          curve: 35,
        },
        {
          from: "wait1",
          to: "ack1",
          trigger: "rdt_send",
          action: "send pkt(1); start_timer",
        },
        {
          from: "ack1",
          to: "wait0",
          trigger: "rcv(ACK,seq=1)",
          action: "stop_timer",
        },
        {
          from: "ack1",
          to: "ack1",
          trigger: "TIMEOUT",
          action: "resend; restart_timer",
          curve: 35,
        },
      ]}
    />
  );
}
