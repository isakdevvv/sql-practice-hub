import { BrukerhandteringPage } from "@/components/stack/brukerhandtering/BrukerhandteringPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-brukerhandtering",
  slug: "brukerhandtering",
  title: "Brukerhåndtering — register, login, session, logout",
  group: "eksamen",
  order: 12,
  status: "ready",
  shortDescription:
    "Modul 4 fra A til Å: hash passord, verifiser ved login, signert session-cookie, @login_required, og logout. Med Flask-Login og uten.",
  prerequisites: [],
  Component: BrukerhandteringPage,
};
