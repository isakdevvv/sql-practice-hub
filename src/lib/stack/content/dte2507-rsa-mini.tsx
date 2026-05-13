import { RsaMiniPage } from "@/components/stack/dte2507-rsa-mini/RsaMiniPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2507-rsa-mini",
  slug: "dte2507-rsa-mini",
  title: "RSA — bygg en mini-versjon",
  group: "eksamen",
  order: 43,
  status: "ready",
  shortDescription:
    "Klikk gjennom p, q, n, φ, e, d. Krypter «HI» tegn for tegn med små primtall. Signering vs kryptering, hybrid krypto.",
  prerequisites: [],
  Component: RsaMiniPage,
};
