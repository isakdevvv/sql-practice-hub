import { SubqueriesPage } from "@/components/stack/subqueries/SubqueriesPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-subqueries",
  slug: "subqueries",
  title: "Underspørringer — nybegynner til ekspert",
  group: "eksamen",
  order: 8,
  status: "ready",
  shortDescription:
    "Subqueries i WHERE/SELECT/FROM/HAVING, EXISTS, korrelert, CTE, og topp-N-per-gruppe — åtte progressive nivåer.",
  prerequisites: [],
  Component: SubqueriesPage,
};
