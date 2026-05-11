import { OsGrunnlagPage } from "@/components/stack/os-grunnlag/OsGrunnlagPage";
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
  Component: OsGrunnlagPage,
};
