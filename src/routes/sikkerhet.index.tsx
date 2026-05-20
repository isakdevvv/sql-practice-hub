import { createFileRoute } from "@tanstack/react-router";
import { SikkerhetHub } from "@/components/stack/sikkerhet/SikkerhetHub";

export const Route = createFileRoute("/sikkerhet/")({
  head: () => ({
    meta: [
      { title: "Sikkerhet — SEC-spor DTE-2507" },
      {
        name: "description",
        content:
          "Sikkerhetssporet i DTE-2507: 21 biter på fire faser. Krypto-prinsipper, sikker kommunikasjon, trusler, anvendt sikring. Konvergens av OS-sporet og DK-sporet.",
      },
    ],
  }),
  component: SikkerhetHub,
});
