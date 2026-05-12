import { content as bytesEncoding } from "./bytes-encoding";
import { content as tcpSockets } from "./tcp-sockets";
import { content as huskelapp } from "./huskelapp";
import { content as erMapping } from "./er-mapping";
import { content as normalisering } from "./normalisering";
import { content as htmlJinja } from "./html-jinja";
import { content as sikkerhet } from "./sikkerhet";
import { content as subqueries } from "./subqueries";
import { content as nokler } from "./nokler";
import { content as transaksjoner } from "./transaksjoner";
import { content as indekser } from "./indekser";
import { content as queryOptimisering } from "./query-optimisering";
import { content as algoritmer } from "./algoritmer";
import { content as bigO } from "./big-o";
import { content as rekursjon } from "./rekursjon";
import { content as sortering } from "./sortering";
import { content as lenkedeStrukturer } from "./lenkede-strukturer";
import { content as dte2507 } from "./dte-2507";
import { content as osiTcpip } from "./osi-tcpip";
import { content as transportlag } from "./transportlag";
import { content as kryptografi } from "./kryptografi";
import { content as tls } from "./tls";
import { content as nettverkssikkerhet } from "./nettverkssikkerhet";
import { content as dte2602 } from "./dte-2602";
import { content as mlGrunnlag } from "./ml-grunnlag";
import { content as supervisedLearning } from "./supervised-learning";
import { content as unsupervisedLearning } from "./unsupervised-learning";
import { content as nnIntro } from "./nn-intro";
import { content as dte2501 } from "./dte-2501";
import { content as sokAlgoritmer } from "./sok-algoritmer";
import { content as csp } from "./csp";
import { content as logiskResonnering } from "./logisk-resonnering";
import { content as planlegging } from "./planlegging";
import { content as bayes } from "./bayes";
import { content as flaskLivssyklus } from "./flask-livssyklus";
import { content as pythonDrill } from "./python-drill";
import { content as httpAnatomi } from "./http-anatomi";
import { content as dte2505 } from "./dte-2505";
import { content as osGrunnlag } from "./os-grunnlag";
import { content as linuxBruk } from "./linux-bruk";
import { content as shellScripting } from "./shell-scripting";
import { content as brukereRettigheter } from "./brukere-rettigheter";
import { content as virtualisering } from "./virtualisering";
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
import { content as dte2802 } from "./dte-2802";
import { content as csharpGrunnlag } from "./csharp-grunnlag";
import { content as aspnetMvc } from "./aspnet-mvc";
import { content as aspnetWebapi } from "./aspnet-webapi";
import { content as efCore } from "./ef-core";
import { content as blazor } from "./blazor";
import { content as dte2502 } from "./dte-2502";
import { content as backpropDyp } from "./backprop-dyp";
import { content as cnn } from "./cnn";
import { content as regularisering } from "./regularisering";
import { content as optimering } from "./optimering";
import { content as pytorchTf } from "./pytorch-tf";
import { content as dte2604 } from "./dte-2604";
import { content as suMetodikker } from "./su-metodikker";
import { content as brukerhistorier } from "./brukerhistorier";
import { content as uml } from "./uml";
import { content as suProsjektPraksis } from "./su-prosjekt-praksis";
import { content as apiProsjekt } from "./api-prosjekt";
import { content as apiPlanlegging } from "./api-planlegging";
import { content as apiArkitektur } from "./api-arkitektur";
import { content as apiKontrakt } from "./api-kontrakt";
import { content as apiTesting } from "./api-testing";
import { content as apiDeploy } from "./api-deploy";
import { content as dte2603 } from "./dte-2603";
import { content as kotlinGrunnlag } from "./kotlin-grunnlag";
import { content as androidGrunnlag } from "./android-grunnlag";
import { content as mvvmArkitektur } from "./mvvm-arkitektur";
import { content as korutiner } from "./korutiner";
import { content as roomRecycler } from "./room-recycler";
import { content as apiRetrofit } from "./api-retrofit";
import { content as mysqlVsSqlite } from "./mysql-vs-sqlite";
import { content as mvcMonster } from "./mvc-monster";
import { content as mathFoundations } from "./math-foundations";
import { content as diskretMatte } from "./diskret-matte";
import { content as sannsynlighet } from "./sannsynlighet";
import { content as linaerAlgebra } from "./linaer-algebra";
import { content as gitDyp } from "./git-dyp";
import { content as docker } from "./docker";
import { content as linuxCliAdvanced } from "./linux-cli-advanced";
import { content as laereplan } from "./laereplan";
import { content as funksjonellProgrammering } from "./funksjonell-programmering";
import { content as typesystemer } from "./typesystemer";
import { content as javascriptGrunnlag } from "./javascript-grunnlag";
import { content as typescript } from "./typescript";
import { content as reactGrunnlag } from "./react-grunnlag";
import { content as cssModerne } from "./css-moderne";
import { content as traer } from "./traer";
import { content as graferDypere } from "./grafer-dypere";
import { content as hashingDypere } from "./hashing-dypere";
import { content as dynamicProgramming } from "./dynamic-programming";
import { content as brukerhandtering } from "./brukerhandtering";
import { content as dte2509 } from "./dte-2509";
import type { TrinnContent } from "../types";

export const TRINN: TrinnContent[] = [
  bytesEncoding, tcpSockets, huskelapp, erMapping, normalisering, htmlJinja, sikkerhet,
  subqueries, nokler, mysqlVsSqlite,
  transaksjoner, indekser, queryOptimisering,
  algoritmer, bigO, rekursjon, sortering, lenkedeStrukturer,
  dte2507, osiTcpip, transportlag, kryptografi, tls, nettverkssikkerhet,
  dte2602, mlGrunnlag, supervisedLearning, unsupervisedLearning, nnIntro,
  dte2501, sokAlgoritmer, csp, logiskResonnering, planlegging, bayes,
  flaskLivssyklus, pythonDrill, httpAnatomi,
  dte2505, osGrunnlag, linuxBruk, shellScripting, brukereRettigheter, virtualisering,
  trinn1, trinn2, trinn3, trinn4, trinn5, trinn6, trinn7, trinn8, trinn9, trinn10,
  dte2802, csharpGrunnlag, aspnetMvc, aspnetWebapi, efCore, blazor,
  dte2502, backpropDyp, cnn, regularisering, optimering, pytorchTf,
  dte2604, suMetodikker, brukerhistorier, uml, suProsjektPraksis,
  apiProsjekt, apiPlanlegging, apiArkitektur, apiKontrakt, apiTesting, apiDeploy,
  dte2603, kotlinGrunnlag, androidGrunnlag, mvvmArkitektur, korutiner, roomRecycler, apiRetrofit,
  mvcMonster,
  mathFoundations, diskretMatte, sannsynlighet, linaerAlgebra,
  gitDyp, docker, linuxCliAdvanced,
  laereplan,
  funksjonellProgrammering, typesystemer,
  javascriptGrunnlag, typescript, reactGrunnlag, cssModerne,
  traer, graferDypere, hashingDypere, dynamicProgramming,
  dte2509, brukerhandtering,
];

import { curriculumIndexOf } from "../curriculum";

// Bare ferdige trinn er offentlig synlige — stubs (`status: "stub"`)
// skal ikke vises noen steder, og direkte URL-tilgang skal 404e.
export function getTrinnBySlug(slug: string): TrinnContent | undefined {
  const t = TRINN.find((tr) => tr.slug === slug);
  return t && t.status === "ready" ? t : undefined;
}

export function getTrinnByGroup(group: "eksamen" | "stack"): TrinnContent[] {
  return TRINN.filter((t) => t.group === group && t.status === "ready").sort(
    (a, b) => {
      // Primary: canonical curriculum order (first-principles progression)
      const ai = curriculumIndexOf(a.slug);
      const bi = curriculumIndexOf(b.slug);
      if (ai !== bi) return ai - bi;
      // Fallback: each trinn's manual order field
      return a.order - b.order;
    },
  );
}
