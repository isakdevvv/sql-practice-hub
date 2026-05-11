import { MvcMonsterPage } from "@/components/stack/mvc-monster/MvcMonsterPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-mvc-monster",
  slug: "mvc-monster",
  title: "MVC-mønsteret — Model · View · Controller",
  group: "eksamen",
  order: 11,
  status: "ready",
  shortDescription:
    "Slik er en Flask-app delt opp: data (Model), HTML (View), og routing (Controller). Anti-pattern, godt mønster, og Blueprints.",
  prerequisites: [],
  Component: MvcMonsterPage,
};
