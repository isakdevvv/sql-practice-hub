import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-microkernel-arkitektur",
  slug: "microkernel-arkitektur",
  title: "Microkernel vs monolittisk kernel — splittskjerm",
  group: "eksamen",
  order: 50,
  status: "ready",
  shortDescription:
    "Splittskjerm-simulator: samme syscall, to arkitekturer. Tell ring-bytter, dra moduler inn/ut av kernel, krasj driver. O'Gorman kap. 1.7.",
  prerequisites: [{ slug: "os-grunnlag", title: "OS-grunnlag" }],
  Component: lazy(() =>
    import("@/components/stack/microkernel-arkitektur/MicrokernelPage").then((m) => ({
      default: m.MicrokernelPage,
    }))
  ),
};
