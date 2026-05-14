import { FlaskAppBuilderPage } from "@/components/stack/flask-app-builder/FlaskAppBuilderPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-flask-app-builder",
  slug: "flask-app-builder",
  title: "Flask App Builder",
  group: "stack",
  order: 80,
  status: "ready",
  shortDescription:
    "Kryss av byggesteiner (sider, skjemaer, auth, DB, Bootstrap-UI, JSON-API) og få en komplett Flask + Jinja + Bootstrap-app generert live. 27+ alternativer, klikk Kjør for å teste i Pyodide.",
  prerequisites: [],
  Component: FlaskAppBuilderPage,
};
