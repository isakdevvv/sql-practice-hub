import type { ApiPreset } from "./types";

const json = (obj: unknown) => JSON.stringify(obj, null, 2);

export const PRESETS: ApiPreset[] = [
  {
    id: "list",
    label: "GET — alle produkter",
    description: "Enkel GET-spørring uten autentisering. Returnerer JSON-array.",
    request: {
      method: "GET",
      path: "/api/produkter",
      headers: [{ key: "Accept", value: "application/json", enabled: true }],
      body: "",
      bodyJson: false,
    },
  },
  {
    id: "list-filter",
    label: "GET — produkter (med query-param)",
    description: "Bruk ?kategori=Elektronikk for å filtrere på server.",
    request: {
      method: "GET",
      path: "/api/produkter?kategori=Elektronikk",
      headers: [{ key: "Accept", value: "application/json", enabled: true }],
      body: "",
      bodyJson: false,
    },
  },
  {
    id: "single",
    label: "GET — ett produkt (id i sti)",
    description: "Path-parameter — gir 404 hvis id ikke finnes.",
    request: {
      method: "GET",
      path: "/api/produkter/2",
      headers: [{ key: "Accept", value: "application/json", enabled: true }],
      body: "",
      bodyJson: false,
    },
  },
  {
    id: "post-no-auth",
    label: "POST — uten token (forventer 401)",
    description: "Vis hva som skjer når Authorization-headeren mangler.",
    request: {
      method: "POST",
      path: "/api/produkter",
      headers: [{ key: "Content-Type", value: "application/json", enabled: true }],
      body: json({
        id: 99,
        navn: "Test",
        kategori: "Klaer",
        pris: 199,
        lager: 10,
      }),
      bodyJson: true,
    },
  },
  {
    id: "post-with-auth",
    label: "POST — med Bearer-token (lager nytt produkt)",
    description: "Riktig Authorization gir 201 Created.",
    request: {
      method: "POST",
      path: "/api/produkter",
      headers: [
        { key: "Content-Type", value: "application/json", enabled: true },
        { key: "Authorization", value: "Bearer demo-token-abc123", enabled: true },
      ],
      body: json({
        id: 99,
        navn: "Vinterjakke",
        kategori: "Klaer",
        pris: 1299,
        lager: 8,
      }),
      bodyJson: true,
    },
  },
  {
    id: "put",
    label: "PUT — erstatt produkt",
    description: "Idempotent oppdatering — kjør så ofte du vil, samme resultat.",
    request: {
      method: "PUT",
      path: "/api/produkter/3",
      headers: [
        { key: "Content-Type", value: "application/json", enabled: true },
        { key: "Authorization", value: "Bearer demo-token-abc123", enabled: true },
      ],
      body: json({ navn: "Sko (justert)", kategori: "Klaer", pris: 899, lager: 25 }),
      bodyJson: true,
    },
  },
  {
    id: "delete",
    label: "DELETE — slett produkt",
    description: "204 No Content ved suksess, 404 hvis det ikke finnes.",
    request: {
      method: "DELETE",
      path: "/api/produkter/4",
      headers: [
        { key: "Authorization", value: "Bearer demo-token-abc123", enabled: true },
      ],
      body: "",
      bodyJson: false,
    },
  },
  {
    id: "login",
    label: "POST /api/login — sett session-cookie",
    description: "Logger inn og setter en cookie. Etterpå virker /api/min-side.",
    request: {
      method: "POST",
      path: "/api/login",
      headers: [{ key: "Content-Type", value: "application/json", enabled: true }],
      body: json({ brukernavn: "ola", passord: "hemmelig" }),
      bodyJson: true,
    },
  },
  {
    id: "min-side",
    label: "GET /api/min-side — krever cookie",
    description: "401 hvis du ikke har logget inn først (POST /api/login).",
    request: {
      method: "GET",
      path: "/api/min-side",
      headers: [{ key: "Accept", value: "application/json", enabled: true }],
      body: "",
      bodyJson: false,
    },
  },
  {
    id: "echo",
    label: "GET /api/echo — speiler request",
    description:
      "Sender du noe på dette endepunktet, får du tilbake metode, sti, query, headere og body — godt for å eksperimentere.",
    request: {
      method: "GET",
      path: "/api/echo?navn=Ola&rolle=admin",
      headers: [
        { key: "Accept", value: "application/json", enabled: true },
        { key: "X-Min-Egen-Header", value: "test", enabled: true },
      ],
      body: "",
      bodyJson: false,
    },
  },
];

export const EMPTY_REQUEST = {
  method: "GET" as const,
  path: "/api/produkter",
  headers: [{ key: "Accept", value: "application/json", enabled: true }],
  body: "",
  bodyJson: false,
};
