import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2505-thread-vs-prosess",
  slug: "dte2505-thread-vs-prosess",
  title: "Thread vs prosess — minne-modell",
  group: "eksamen",
  order: 37,
  status: "ready",
  shortDescription:
    "O'Gorman kap. 2.3 + 2.6. Animert minne-layout for fork() vs pthread_create(), COW-markører, side-ved-side søylediagram for 4 prosesser vs 4 tråder, race-condition-demo med mutex, og drag-til-kategori for ps -eLf.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dte2505-thread-vs-prosess/ThreadVsProsessPage").then((m) => ({ default: m.ThreadVsProsessPage }))),
};
