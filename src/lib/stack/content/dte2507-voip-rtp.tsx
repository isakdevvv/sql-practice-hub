import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-dte2507-voip-rtp",
  slug: "dte2507-voip-rtp",
  title: "VoIP & RTP — jitter og MOS",
  group: "stack",
  order: 856,
  status: "ready",
  shortDescription: "Kurose kap. 9. Pakke-trace med justerbar delay/jitter/loss/playout-buffer; estimert MOS-score basert på E-modellen.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dte2507-voip-rtp/Dte2507VoipRtpPage").then((m) => ({ default: m.Dte2507VoipRtpPage }))),
};
