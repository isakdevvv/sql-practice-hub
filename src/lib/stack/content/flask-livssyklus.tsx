import { Placeholder } from "@/components/stack/Placeholder";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-flask-livssyklus",
  slug: "flask-livssyklus",
  title: "Flask request-livssyklus",
  group: "eksamen",
  order: 5,
  status: "stub",
  shortDescription: "Fra HTTP-bytes til request.form til DB-spørring og tilbake.",
  prerequisites: [],
  Component: () => <Placeholder title="Flask request-livssyklus" group="eksamen" />,
};
