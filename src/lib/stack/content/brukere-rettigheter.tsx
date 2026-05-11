import { BrukereRettigheterPage } from "@/components/stack/brukere-rettigheter/BrukereRettigheterPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-brukere-rettigheter",
  slug: "brukere-rettigheter",
  title: "Brukere og rettigheter — /etc/passwd, sudo, ACL, MAC",
  group: "eksamen",
  order: 35,
  status: "ready",
  shortDescription:
    "Flerbrukersystem i praksis: useradd, sudo vs su, /etc/passwd-felter, ACL, SELinux/AppArmor.",
  prerequisites: [],
  Component: BrukereRettigheterPage,
};
