import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2602-svm",
  slug: "dte2602-svm",
  title: "DTE-2602 — SVM (overflate-intro)",
  group: "eksamen",
  order: 13,
  status: "ready",
  shortDescription:
    "Maximum margin, støttevektorer og kernel-trick (lineær vs RBF). Dragbare punkter i 2D viser hvordan grensa kun avhenger av nærmeste punkter. Drill kontrasterer SVM mot logistisk regresjon.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dte2602-svm/Dte2602SvmPage").then((m) => ({ default: m.Dte2602SvmPage }))),
};
