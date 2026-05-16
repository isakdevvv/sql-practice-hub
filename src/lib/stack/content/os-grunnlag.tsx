import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-os-grunnlag",
  slug: "os-grunnlag",
  title: "OS-grunnlag — kernel, prosesser, scheduling, syscalls",
  group: "eksamen",
  order: 32,
  status: "ready",
  shortDescription:
    "Hva et operativsystem faktisk gjør: kernel vs userspace, prosess-livssyklus, scheduling, filsystem, syscalls.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/os-grunnlag/OsGrunnlagPage").then((m) => ({ default: m.OsGrunnlagPage }))),
};
