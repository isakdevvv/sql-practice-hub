import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { PythonNotebook } from "@/components/python/PythonNotebook";

export const Route = createFileRoute("/python-notebook")({
  head: () => ({
    meta: [
      { title: "Python-notebook — kjør Python i nettleseren" },
      {
        name: "description",
        content:
          "Jupyter-aktig notebook med celler som deler variabler. Kjører i nettleseren via Pyodide — ingen Python-installasjon nødvendig.",
      },
    ],
  }),
  component: PythonNotebookPage,
});

function PythonNotebookPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <PythonNotebook />
    </div>
  );
}
