/**
 * Datamodell for REST API Builder. Brukeren velger framework, ressurser,
 * auth-modus, paginering, validering, CORS, middleware og OpenAPI-stil.
 * `assemble()` setter alt sammen til én ferdig kjørbar API-fil.
 *
 * Forskjell fra Flask App Builder: ingen Jinja-templates, kun JSON-endpoints
 * og tilhørende infrastrukturkode (auth, validering, paginering, CORS, doc).
 */

export type Framework = "flask-restful" | "fastapi" | "express" | "drf";

export type AuthMode = "none" | "bearer" | "jwt" | "basic";

export type Pagination = "none" | "page-size" | "cursor" | "total-count";

export type CorsMode = "open" | "restricted";

export type OpenApiMode = "auto" | "manual" | "none";

export type ValidationMode = "pydantic" | "marshmallow" | "joi" | "drf-serializer";

export type FieldKind = "id" | "string" | "email" | "number" | "date" | "foreignKey";

export interface ResourceField {
  /** Felt-id (brukes som JSON-key og kolonnenavn). */
  name: string;
  /** Type-kategori — assemble velger riktig syntaks per framework. */
  kind: FieldKind;
  /** Norsk label til hjelpetekst og kommentarer. */
  label: string;
  /** Når kind === "foreignKey": navnet på ressursen den peker til. */
  ref?: string;
}

export interface ResourceSpec {
  /** Maskinnavn entall (brukt i kode: User, Product, Order). */
  singular: string;
  /** URL-segment flertall (/users, /products, /orders). */
  plural: string;
  /** Norsk visningsnavn. */
  label: string;
  /** Felt på ressursen. */
  fields: ResourceField[];
}

/** Alle innstillinger brukeren har klikket inn. */
export interface BuilderState {
  framework: Framework;
  resources: Set<string>;
  auth: AuthMode;
  validation: ValidationMode;
  pagination: Pagination;
  cors: CorsMode;
  middleware: {
    requestId: boolean;
    accessLog: boolean;
    jsonErrors: boolean;
  };
  openapi: OpenApiMode;
}

export type CategoryId =
  | "framework"
  | "resources"
  | "auth"
  | "validation"
  | "pagination"
  | "cors"
  | "middleware"
  | "openapi";

export interface Category {
  id: CategoryId;
  label: string;
  description: string;
}

export const CATEGORIES: readonly Category[] = [
  { id: "framework", label: "Framework", description: "Velg ett — bestemmer syntaks og økosystem." },
  { id: "resources", label: "Ressurser", description: "Hver ressurs får CRUD-endpoints (GET/POST/PUT/DELETE)." },
  { id: "auth", label: "Auth-modus", description: "Hvordan beskytte endepunktene." },
  { id: "validation", label: "Validering", description: "Skjema for innkommende JSON-body." },
  { id: "pagination", label: "Paginering", description: "Hvordan listing-endepunkter deler opp resultater." },
  { id: "cors", label: "CORS", description: "Hvilke origins får snakke med API-et." },
  { id: "middleware", label: "Middleware", description: "Request-id, access-log, JSON-feilhåndtering." },
  { id: "openapi", label: "OpenAPI / Swagger", description: "Auto-generert eller manuell API-doc." },
];
