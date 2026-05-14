import { AlohaKasinoPage } from "@/components/stack/dte2507-aloha-kasino/AlohaKasinoPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2507-aloha-kasino",
  slug: "dte2507-aloha-kasino",
  title: "ALOHA-kasinoet",
  group: "eksamen",
  order: 61,
  status: "ready",
  shortDescription:
    "Slotted ALOHA-simulator (Kurose 6.3.2). Slidere for N og p, slot-by-slot S/E/C-visualisering, og effektivitetskurven Np(1−p)^(N−1) som topper seg ved 1/e ≈ 0.37.",
  prerequisites: [],
  Component: AlohaKasinoPage,
};
