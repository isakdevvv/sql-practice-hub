import { Dte2505Hub } from "@/components/stack/dte-2505/Dte2505Hub";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte-2505",
  slug: "dte-2505",
  title: "DTE-2505 Operativsystemer — hub",
  group: "eksamen",
  order: 31,
  status: "ready",
  shortDescription:
    "Fem mini-kurs som dekker DTE-2505-pensum: OS-grunnlag, Linux-bruk, shell scripting, brukere og rettigheter, virtualisering.",
  prerequisites: [],
  Component: Dte2505Hub,
};
