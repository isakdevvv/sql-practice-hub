import { ShellScriptingPage } from "@/components/stack/shell-scripting/ShellScriptingPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-shell-scripting",
  slug: "shell-scripting",
  title: "Shell scripting — automatiser drift",
  group: "eksamen",
  order: 34,
  status: "ready",
  shortDescription:
    "Bash-skript: variabler, if/while/for, pipe/redirect, exit-koder, og vanlige drift-skript med cron.",
  prerequisites: [],
  Component: ShellScriptingPage,
};
