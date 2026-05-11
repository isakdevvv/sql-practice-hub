import { LinuxBrukPage } from "@/components/stack/linux-bruk/LinuxBrukPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-linux-bruk",
  slug: "linux-bruk",
  title: "Linux-bruk — shell, filer, rettigheter, prosesser",
  group: "eksamen",
  order: 33,
  status: "ready",
  shortDescription:
    "Bash-grunnlag, chmod/chown, ps/top/kill, apt og dnf, og vanlige drift-kommandoer.",
  prerequisites: [],
  Component: LinuxBrukPage,
};
