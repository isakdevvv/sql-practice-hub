import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2505-filsystem",
  slug: "dte2505-filsystem",
  title: "Filsystem og inodes",
  group: "eksamen",
  order: 100,
  status: "ready",
  shortDescription:
    "OSTEP kap. 39–42. Inode-strukturen (mode, owner, size, pointer-blokker), direkte/indirekte/dobbel-indirekte pointers, FAT vs ext4, journaling-modes, mount-points og VFS-laget. Inkluder visuell inode-tabell.",
  prerequisites: [],
  Component: lazy(() =>
    import("@/components/stack/dte2505-filsystem/FilsystemPage").then((m) => ({
      default: m.FilsystemPage,
    })),
  ),
};
