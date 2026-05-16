import { createFileRoute, redirect } from "@tanstack/react-router";

// /exam er slått sammen med /eksamen. Hub-en bor på /eksamen, tidsbasert
// trening bor på /eksamen/trening. Denne ruten redirecter dit slik at
// gamle lenker fortsatt fungerer.
export const Route = createFileRoute("/exam")({
  beforeLoad: () => {
    throw redirect({ to: "/eksamen/trening" });
  },
});
