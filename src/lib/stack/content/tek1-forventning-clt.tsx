import { Tek1ForventningCltPage } from "@/components/stack/tek1-forventning-clt/Tek1ForventningCltPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-tek1-forventning-clt",
  slug: "tek1-forventning-clt",
  title: "TEK-1501 Modul 3c — Forventning, varians og CLT",
  group: "eksamen",
  order: 7,
  status: "ready",
  shortDescription:
    "E[X], Var[X], kovarians og det sentrale grenseteoremet — med animasjon som viser hvordan utvalgsgjennomsnitt konvergerer mot normalfordelingen.",
  prerequisites: [],
  Component: Tek1ForventningCltPage,
};
