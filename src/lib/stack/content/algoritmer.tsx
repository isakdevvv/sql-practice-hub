import { AlgoritmerHub } from "@/components/stack/algoritmer/AlgoritmerHub";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-algoritmer",
  slug: "algoritmer",
  title: "Algoritmer og datastrukturer — hub",
  group: "eksamen",
  order: 10,
  status: "ready",
  shortDescription:
    "Ni mini-kurs som dekker hele DTE-2511-pensum: rekursjon, sortering, lenkede strukturer, trær, hashing og grafer.",
  prerequisites: [],
  Component: AlgoritmerHub,
};
