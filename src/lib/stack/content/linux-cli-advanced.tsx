import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-linux-cli-advanced",
  slug: "linux-cli-advanced",
  title: "Linux-CLI advanced — sed, awk, jq, debugging",
  group: "stack",
  order: 117,
  status: "ready",
  shortDescription:
    "sed, awk, find, xargs, jq, grep -E/-P, strace, lsof, ss, systemctl, journalctl og bash-skript-mønstre.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/linux-cli-advanced/LinuxCliAdvancedPage").then((m) => ({ default: m.LinuxCliAdvancedPage }))),
};
