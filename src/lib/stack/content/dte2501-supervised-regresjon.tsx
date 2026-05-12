import { RegresjonPage } from "@/components/stack/dte2501-ml/RegresjonPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2501-regresjon",
  slug: "dte2501-supervised-regresjon",
  title: "Regresjon — lineær og polynom",
  group: "eksamen",
  order: 41,
  status: "ready",
  shortDescription:
    "Lineær og polynom-regresjon. MSE/MAE, R²/RMSE, regularisering (Ridge/Lasso), overfitting.",
  prerequisites: [],
  Component: RegresjonPage,
};
