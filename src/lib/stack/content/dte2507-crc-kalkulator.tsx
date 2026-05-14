import { CrcKalkulatorPage } from "@/components/stack/dte2507-crc-kalkulator/CrcKalkulatorPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2507-crc-kalkulator",
  slug: "dte2507-crc-kalkulator",
  title: "CRC modulo-2-divisjon",
  group: "eksamen",
  order: 60,
  status: "ready",
  shortDescription:
    "Interaktiv CRC-kalkulator (Kurose 6.2.3). Velg D og G, se XOR-divisjonen trinn for trinn, og verifiser at mottakerens rest er null. Bokens eksempel D=101110, G=1001 er forhåndsutfylt.",
  prerequisites: [],
  Component: CrcKalkulatorPage,
};
