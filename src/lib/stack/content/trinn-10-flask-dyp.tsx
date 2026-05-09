import { Placeholder } from "@/components/stack/Placeholder";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-10-flask-dyp",
  slug: "trinn-10-flask-dyp",
  title: "10. Flask under panseret",
  group: "stack",
  order: 10,
  status: "stub",
  shortDescription: "WSGI, app.run() sin socket-loop, hvordan request blir til response.",
  prerequisites: [],
  Component: () => <Placeholder title="10. Flask under panseret" group="stack" />,
};
