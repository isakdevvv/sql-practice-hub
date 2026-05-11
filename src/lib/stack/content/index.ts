import { content as bytesEncoding } from "./bytes-encoding";
import { content as tcpSockets } from "./tcp-sockets";
import { content as huskelapp } from "./huskelapp";
import { content as erMapping } from "./er-mapping";
import { content as normalisering } from "./normalisering";
import { content as htmlJinja } from "./html-jinja";
import { content as sikkerhet } from "./sikkerhet";
import { content as flaskLivssyklus } from "./flask-livssyklus";
import { content as pythonDrill } from "./python-drill";
import { content as httpAnatomi } from "./http-anatomi";
import { content as trinn1 } from "./trinn-1-transistor";
import { content as trinn2 } from "./trinn-2-nand-porter";
import { content as trinn3 } from "./trinn-3-adders";
import { content as trinn4 } from "./trinn-4-cpu";
import { content as trinn5 } from "./trinn-5-assembly";
import { content as trinn6 } from "./trinn-6-c-minne";
import { content as trinn7 } from "./trinn-7-bytes-dyp";
import { content as trinn8 } from "./trinn-8-python-er-c";
import { content as trinn9 } from "./trinn-9-syscalls-dyp";
import { content as trinn10 } from "./trinn-10-flask-dyp";
import type { TrinnContent } from "../types";

export const TRINN: TrinnContent[] = [
  bytesEncoding, tcpSockets, huskelapp, erMapping, normalisering, htmlJinja, sikkerhet,
  flaskLivssyklus, pythonDrill, httpAnatomi,
  trinn1, trinn2, trinn3, trinn4, trinn5, trinn6, trinn7, trinn8, trinn9, trinn10,
];

// Bare ferdige trinn er offentlig synlige — stubs (`status: "stub"`)
// skal ikke vises noen steder, og direkte URL-tilgang skal 404e.
export function getTrinnBySlug(slug: string): TrinnContent | undefined {
  const t = TRINN.find((tr) => tr.slug === slug);
  return t && t.status === "ready" ? t : undefined;
}

export function getTrinnByGroup(group: "eksamen" | "stack"): TrinnContent[] {
  return TRINN.filter((t) => t.group === group && t.status === "ready").sort(
    (a, b) => a.order - b.order,
  );
}
