// Inline SVG illustration library — themable via Tailwind text-* classes
// because every component uses stroke="currentColor". Import individually
// (`import { DatabaseCylinder } from "@/components/illustrations"`).
export type { IllustrationProps } from "./types";

// Database / SQL
export { DatabaseCylinder } from "./DatabaseCylinder";
export { BTreeIcon } from "./BTreeIcon";
export { TableGrid } from "./TableGrid";
export { Indexes } from "./Indexes";

// Networking
export { RouterIcon } from "./RouterIcon";
export { SwitchIcon } from "./SwitchIcon";
export { Packet } from "./Packet";
export { Cloud } from "./Cloud";
export { HostIcon } from "./HostIcon";

// OS / hardware
export { CpuChip } from "./CpuChip";
export { RamStick } from "./RamStick";
export { Disk } from "./Disk";
export { Process } from "./Process";
export { Stack } from "./Stack";

// Algorithms / data
export { TreeNode } from "./TreeNode";
export { GraphNode } from "./GraphNode";
export { BarChart } from "./BarChart";
export { Heap } from "./Heap";

// ML / math
export { Neuron } from "./Neuron";
export { LossCurve } from "./LossCurve";
export { ScatterPlot } from "./ScatterPlot";

// Crypto / security
export { Lock } from "./Lock";
export { Key } from "./Key";
export { Shield } from "./Shield";
