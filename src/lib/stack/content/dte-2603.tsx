import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte-2603",
  slug: "dte-2603",
  title: "DTE-2603 Programmering for mobil — hub",
  group: "eksamen",
  order: 54,
  status: "ready",
  shortDescription:
    "Seks mini-kurs som dekker DTE-2603-pensum: Kotlin, Android-livssyklus, MVVM, korutiner, Room/RecyclerView og Retrofit.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dte-2603/Dte2603Hub").then((m) => ({ default: m.Dte2603Hub }))),
};
