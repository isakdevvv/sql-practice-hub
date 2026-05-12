import { RwxKalkulatorPage } from "@/components/stack/dte2505-rwx-kalkulator/RwxKalkulatorPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2505-rwx-kalkulator",
  slug: "dte2505-rwx-kalkulator",
  title: "rwx-kalkulator — chmod fra bunnen",
  group: "eksamen",
  order: 35,
  status: "ready",
  shortDescription:
    "Klikk 9 bits, se oktal + ls-streng live. Reverser oktal til rettigheter. Symbolsk chmod, umask, setuid/setgid/sticky.",
  prerequisites: [],
  Component: RwxKalkulatorPage,
};
