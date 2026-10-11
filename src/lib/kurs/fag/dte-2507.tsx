// DTE-2507 Datakommunikasjon og sikkerhet — skjerm-basert fag.
//
// Emnene bygges om til stegvise kort ett om gangen. Emne-slugene her er de
// samme som id-ene i `src/lib/nav/emner.ts`, så Lær-siden bytter et emne fra
// lange sider til kort i det øyeblikket emnet registreres her. Emner som ikke
// står her ennå vises fortsatt som de lange sidene.
//
//   1  Introduksjon        byggeklosser, svitsjing, forsinkelse, flaskehals, lag
//   2  Applikasjonslaget   sokler, HTTP, mellomlager, DNS, e-post, video, sokkelprogrammering
//   3  Transportlaget      multipleksing, UDP, pålitelig overføring, TCP, metningskontroll
//   4  Nettverkslaget      videresending, ruteren, IPv4, DHCP/NAT, IPv6, ruting, BGP
//
// Rekkefølgen er en avhengighetsrekkefølge: ingen term brukes før den er innført.

import type { Fag } from "../types";
import { emneIntroduksjon } from "./dte-2507/emne-01-introduksjon";
import { emneApplikasjonslaget } from "./dte-2507/emne-02-applikasjonslaget";
import { emneTransportlaget } from "./dte-2507/emne-03-transportlaget";
import { emneNettverkslaget } from "./dte-2507/emne-04-nettverkslaget";

export const dte2507: Fag = {
  slug: "dte-2507",
  kode: "DTE-2507",
  navn: "Datakommunikasjon og sikkerhet",
  emner: [emneIntroduksjon, emneApplikasjonslaget, emneTransportlaget, emneNettverkslaget],
};
