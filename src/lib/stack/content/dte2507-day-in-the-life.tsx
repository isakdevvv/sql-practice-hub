import { DayInTheLifePage } from "@/components/stack/dte2507-day-in-the-life/DayInTheLifePage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2507-day-in-the-life",
  slug: "dte2507-day-in-the-life",
  title: "A Day in the Life of a Web Page Request",
  group: "eksamen",
  order: 70,
  status: "ready",
  shortDescription:
    "Bokens crescendo. 24-stegs interaktiv gjennomgang fra at Bob plugger laptopen i nettet til google.com vises — DHCP → ARP → DNS → ruting → TCP → HTTP. Integrerer hele Kurose-Ross.",
  prerequisites: [],
  Component: DayInTheLifePage,
};
