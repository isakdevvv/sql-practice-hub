import { useMemo, useState, useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type NodeMouseHandler,
  MarkerType,
  type NodeProps,
  Handle,
  Position,
} from "@xyflow/react";
import { Cloud, Shield, Server, Monitor, Database, Globe } from "lucide-react";

type DeviceKind = "cloud" | "fw" | "switch" | "client" | "server" | "db";

type NodeInfo = {
  id: string;
  label: string;
  kind: DeviceKind;
  vlan?: number;
  detail: string;
  config: string;
};

const NODES: NodeInfo[] = [
  {
    id: "inet",
    label: "Internett",
    kind: "cloud",
    detail: "Eksternt nett — alt utenfor brannmuren. Anta hostile.",
    config: `# Ingen tillit. Standard policy: DENY på inn-trafikk.`,
  },
  {
    id: "fw",
    label: "Brannmur",
    kind: "fw",
    detail:
      "Perimeter-FW (pfSense/FortiGate). Tre interface: WAN, DMZ, LAN. Stateful — husker tilkoblinger.",
    config: `iptables -P INPUT DROP
iptables -P FORWARD DROP

# Tillat etablerte
iptables -A FORWARD -m conntrack \\
  --ctstate ESTABLISHED,RELATED -j ACCEPT

# WAN → DMZ: bare HTTPS til web
iptables -A FORWARD -i wan -o dmz \\
  -p tcp --dport 443 -j ACCEPT

# DMZ → LAN: bare DB
iptables -A FORWARD -i dmz -o lan \\
  -p tcp --dport 3306 -j ACCEPT`,
  },
  {
    id: "web",
    label: "Web-server (DMZ)",
    kind: "server",
    vlan: 30,
    detail:
      "Eksponert i DMZ — nås fra internett på port 443. Får ikke nå LAN direkte (bare DB på 3306).",
    config: `# nginx
server {
  listen 443 ssl;
  server_name eksempel.no;
  ssl_certificate /etc/letsencrypt/...;
  location / { proxy_pass http://app:8000; }
}

# host-FW (defense in depth)
ufw allow 443/tcp
ufw allow from 10.0.10.0/24 to any port 22`,
  },
  {
    id: "switch",
    label: "Core switch",
    kind: "switch",
    detail:
      "L2/L3-switch med VLAN-segmentering. Bruker 802.1Q-tagging på trunk-portene.",
    config: `# Cisco IOS
vlan 10
 name kontor
vlan 20
 name gjest
vlan 99
 name mgmt

interface FastEthernet0/1
 switchport mode access
 switchport access vlan 10

interface GigabitEthernet0/24
 switchport mode trunk
 switchport trunk allowed vlan 10,20,99`,
  },
  {
    id: "db",
    label: "Database (LAN)",
    kind: "db",
    vlan: 40,
    detail:
      "Intern DB. Nås BARE av web-serveren på 3306. ALDRI direkte fra internett.",
    config: `# MySQL bind kun til intern IP
bind-address = 10.0.40.20

# Bruker for web-app
CREATE USER 'webapp'@'10.0.30.%'
  IDENTIFIED BY '...';
GRANT SELECT, INSERT, UPDATE
  ON shop.* TO 'webapp'@'10.0.30.%';`,
  },
  {
    id: "pc1",
    label: "Klient 1",
    kind: "client",
    vlan: 10,
    detail: "Kontor-PC. Access-port i VLAN 10. Får DHCP fra ruteren.",
    config: `# dhcp-lease
ip: 10.0.10.42/24
gw: 10.0.10.1
dns: 10.0.10.1`,
  },
  {
    id: "pc2",
    label: "Klient 2",
    kind: "client",
    vlan: 10,
    detail: "Kontor-PC. Samme VLAN som pc1 → kan kommunisere direkte via switch.",
    config: `ip: 10.0.10.43/24
gw: 10.0.10.1`,
  },
  {
    id: "guest",
    label: "Gjest-WiFi",
    kind: "client",
    vlan: 20,
    detail:
      "Gjeste-VLAN — isolert fra kontor og servere. Får bare gå ut mot internett.",
    config: `# Brannmur-regel
iptables -A FORWARD -i vlan20 -o vlan10 -j DROP
iptables -A FORWARD -i vlan20 -o vlan40 -j DROP
iptables -A FORWARD -i vlan20 -o wan -j ACCEPT`,
  },
];

const EDGES_DATA: { from: string; to: string; label?: string }[] = [
  { from: "inet", to: "fw", label: "WAN" },
  { from: "fw", to: "web", label: "DMZ" },
  { from: "fw", to: "switch", label: "LAN-trunk" },
  { from: "web", to: "db", label: "MySQL :3306" },
  { from: "switch", to: "pc1", label: "VLAN 10" },
  { from: "switch", to: "pc2", label: "VLAN 10" },
  { from: "switch", to: "guest", label: "VLAN 20" },
  { from: "switch", to: "db", label: "VLAN 40" },
];

const ICONS: Record<DeviceKind, typeof Cloud> = {
  cloud: Cloud,
  fw: Shield,
  switch: Globe,
  client: Monitor,
  server: Server,
  db: Database,
};

const COLORS: Record<DeviceKind, string> = {
  cloud: "text-sky-500",
  fw: "text-amber-500",
  switch: "text-violet-500",
  client: "text-emerald-500",
  server: "text-rose-500",
  db: "text-blue-500",
};

type DeviceNodeData = {
  label: string;
  kind: DeviceKind;
  vlan?: number;
  selected: boolean;
};

function DeviceNode({ data }: NodeProps<Node<DeviceNodeData>>) {
  const Icon = ICONS[data.kind];
  return (
    <div
      className={`rounded-lg border px-3 py-2 shadow-sm transition-colors min-w-[140px] ${
        data.selected
          ? "border-brand bg-brand/10"
          : "border-border bg-card hover:border-brand/40"
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-brand" />
      <Handle type="target" position={Position.Left} className="!bg-brand" />
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${COLORS[data.kind]}`} />
        <div className="text-sm font-semibold text-foreground leading-tight">
          {data.label}
        </div>
      </div>
      {data.vlan !== undefined ? (
        <div className="mt-1 text-[10px] font-mono text-muted-foreground">
          VLAN {data.vlan}
        </div>
      ) : null}
      <Handle type="source" position={Position.Bottom} className="!bg-brand" />
      <Handle type="source" position={Position.Right} className="!bg-brand" />
    </div>
  );
}

const nodeTypes = { device: DeviceNode };

const POSITIONS: Record<string, { x: number; y: number }> = {
  inet: { x: 0, y: 0 },
  fw: { x: 250, y: 0 },
  web: { x: 500, y: -120 },
  switch: { x: 500, y: 120 },
  db: { x: 750, y: 0 },
  pc1: { x: 750, y: 180 },
  pc2: { x: 750, y: 260 },
  guest: { x: 750, y: 340 },
};

export function NetworkTopology() {
  const [selectedId, setSelectedId] = useState<string>("fw");
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const nodes = useMemo<Node<DeviceNodeData>[]>(() => {
    return NODES.map((n) => ({
      id: n.id,
      type: "device",
      position: POSITIONS[n.id] ?? { x: 0, y: 0 },
      data: {
        label: n.label,
        kind: n.kind,
        vlan: n.vlan,
        selected: n.id === selectedId,
      },
    }));
  }, [selectedId]);

  const edges = useMemo<Edge[]>(() => {
    return EDGES_DATA.map((e, i) => ({
      id: `e-${i}`,
      source: e.from,
      target: e.to,
      label: e.label,
      labelStyle: { fontSize: 10, fill: "var(--muted-foreground)" },
      style: { stroke: "var(--color-brand, #f97316)", strokeWidth: 1.5 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: "var(--color-brand, #f97316)",
      },
    }));
  }, []);

  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    setSelectedId(node.id);
  }, []);

  const selected = NODES.find((n) => n.id === selectedId) ?? NODES[1];
  const Icon = ICONS[selected.kind];

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/30 px-4 py-2">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Bedriftsnettverk (interaktiv topologi)
        </div>
        <div className="text-[10px] text-muted-foreground">
          Klikk for konfig-eksempel
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_320px]">
        <div className="h-[460px] bg-background" style={{ touchAction: "none" }}>
          {!mounted ? (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
              Laster topologi …
            </div>
          ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            proOptions={{ hideAttribution: true }}
            nodesDraggable
            zoomOnScroll
            panOnDrag
          >
            <Background gap={20} size={1} />
            <Controls showInteractive={false} />
            <MiniMap
              pannable
              zoomable
              maskColor="rgba(0,0,0,0.1)"
              style={{ background: "var(--color-card)" }}
            />
          </ReactFlow>
          )}
        </div>

        <aside className="border-t md:border-t-0 md:border-l border-border bg-background p-4 text-sm flex flex-col min-h-[200px]">
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${COLORS[selected.kind]}`} />
            <h3 className="text-base font-semibold leading-tight">
              {selected.label}
            </h3>
          </div>
          {selected.vlan !== undefined ? (
            <div className="mt-0.5 text-[11px] font-mono text-muted-foreground">
              VLAN {selected.vlan}
            </div>
          ) : null}
          <p className="mt-2 text-[12px] text-muted-foreground leading-relaxed">
            {selected.detail}
          </p>
          <div className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground">
            Konfig
          </div>
          <pre className="mt-1 flex-1 overflow-auto rounded-md border border-border bg-muted/30 p-2 font-mono text-[10.5px] leading-tight whitespace-pre">
            {selected.config}
          </pre>
        </aside>
      </div>
    </div>
  );
}
