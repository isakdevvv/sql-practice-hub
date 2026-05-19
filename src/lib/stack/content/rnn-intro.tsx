import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-rnn-intro",
  slug: "rnn-intro",
  title: "RNN-intro — hidden state over tid",
  group: "stack",
  order: 835,
  status: "ready",
  shortDescription: "Goodfellow kap. 10 + Nielsen kap. 6. Liten RNN hvor du ser hver hidden-state-celle oppdateres når sekvensen kjøres bokstav for bokstav.",
  prerequisites: [],
  Component: lazy(() =>
    import("@/components/stack/rnn-intro/RnnIntroPage").then((m) => ({ default: m.RnnIntroPage })),
  ),
};
