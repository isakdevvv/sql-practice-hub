import { createFileRoute } from "@tanstack/react-router";
import { ForkursHub } from "@/components/stack/forkurs/ForkursHub";

export const Route = createFileRoute("/forkurs/")({
  head: () => ({
    meta: [
      { title: "Forkurs — bro til DTE-2505 og DTE-2507" },
      {
        name: "description",
        content:
          "Forkurs (juni–august) som dekker begge fagene: virtualisering, terminal, Python-oppfriskning, nettverksintuisjon, binær/hex og krypto-overflate.",
      },
    ],
  }),
  component: ForkursHub,
});
