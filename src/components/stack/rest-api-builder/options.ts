import type { Framework, AuthMode, Pagination, CorsMode, OpenApiMode, ValidationMode, ResourceSpec } from "./types";

export interface FrameworkOption {
  id: Framework;
  label: string;
  description: string;
  language: "python" | "javascript";
  ext: string;
  /** Hvilken default-validering passer dette framework-et. */
  defaultValidation: ValidationMode;
}

export const FRAMEWORKS: readonly FrameworkOption[] = [
  {
    id: "flask-restful",
    label: "Flask + Flask-RESTful",
    description: "Python — Resource-klasser, dispatch på HTTP-verb.",
    language: "python",
    ext: "py",
    defaultValidation: "marshmallow",
  },
  {
    id: "fastapi",
    label: "FastAPI",
    description: "Python — async, Pydantic-modeller, auto Swagger på /docs.",
    language: "python",
    ext: "py",
    defaultValidation: "pydantic",
  },
  {
    id: "express",
    label: "Express.js (Node)",
    description: "JavaScript — minimalistisk router, middleware-kjede.",
    language: "javascript",
    ext: "js",
    defaultValidation: "joi",
  },
  {
    id: "drf",
    label: "Django REST Framework",
    description: "Python — ViewSets + Routers + Serializers + auto Browsable API.",
    language: "python",
    ext: "py",
    defaultValidation: "drf-serializer",
  },
];

/**
 * Tre standardressurser med litt forskjellige felt-typer slik at brukeren
 * ser hvordan id/string/number/date/foreignKey ender opp i koden.
 */
export const RESOURCES: readonly ResourceSpec[] = [
  {
    singular: "User",
    plural: "users",
    label: "Bruker",
    fields: [
      { name: "id", kind: "id", label: "ID" },
      { name: "navn", kind: "string", label: "Navn" },
      { name: "epost", kind: "email", label: "E-post" },
    ],
  },
  {
    singular: "Product",
    plural: "products",
    label: "Produkt",
    fields: [
      { name: "id", kind: "id", label: "ID" },
      { name: "navn", kind: "string", label: "Navn" },
      { name: "pris", kind: "number", label: "Pris (NOK)" },
    ],
  },
  {
    singular: "Order",
    plural: "orders",
    label: "Ordre",
    fields: [
      { name: "id", kind: "id", label: "ID" },
      { name: "user_id", kind: "foreignKey", label: "Bruker", ref: "User" },
      { name: "product_id", kind: "foreignKey", label: "Produkt", ref: "Product" },
      { name: "dato", kind: "date", label: "Bestillingsdato" },
    ],
  },
];

export interface AuthOption {
  id: AuthMode;
  label: string;
  description: string;
}

export const AUTH_MODES: readonly AuthOption[] = [
  { id: "none", label: "Ingen", description: "Helt åpent. Greit for prototyping." },
  { id: "bearer", label: "Bearer-token (statisk)", description: "Sjekker Authorization: Bearer <token> mot en hardkodet verdi." },
  { id: "jwt", label: "JWT (sign / verify)", description: "Signerer JWT med HS256 og verifiserer per request." },
  { id: "basic", label: "Basic Auth", description: "Authorization: Basic base64(user:pass)." },
];

export interface ValidationOption {
  id: ValidationMode;
  label: string;
  description: string;
  /** Hvilke framework som typisk bruker dette biblioteket. */
  framework: Framework;
}

export const VALIDATIONS: readonly ValidationOption[] = [
  { id: "pydantic", label: "Pydantic", description: "FastAPI bruker dette ut av boksen.", framework: "fastapi" },
  { id: "marshmallow", label: "marshmallow", description: "Standard Flask-validering.", framework: "flask-restful" },
  { id: "joi", label: "Joi", description: "Schema-validering for Node/Express.", framework: "express" },
  { id: "drf-serializer", label: "DRF Serializers", description: "Innebygd i Django REST Framework.", framework: "drf" },
];

export interface PaginationOption {
  id: Pagination;
  label: string;
  description: string;
}

export const PAGINATIONS: readonly PaginationOption[] = [
  { id: "none", label: "Ingen", description: "Returnerer alt i én respons." },
  { id: "page-size", label: "?page=&size=", description: "Klassisk offset-paginering." },
  { id: "cursor", label: "Cursor-basert", description: "?cursor=<id> — egnet for store sett." },
  { id: "total-count", label: "X-Total-Count-header", description: "Returner all data + header med totalt antall." },
];

export interface CorsOption {
  id: CorsMode;
  label: string;
  description: string;
}

export const CORS_OPTIONS: readonly CorsOption[] = [
  { id: "open", label: "Åpen (allow *)", description: "Access-Control-Allow-Origin: *. Fint i utvikling." },
  { id: "restricted", label: "Whitelist fra .env", description: "Bare ALLOWED_ORIGINS får svar." },
];

export interface OpenApiOption {
  id: OpenApiMode;
  label: string;
  description: string;
}

export const OPENAPI_MODES: readonly OpenApiOption[] = [
  { id: "auto", label: "Auto-generert", description: "FastAPI/DRF gir dette gratis på /docs." },
  { id: "manual", label: "Manuell (flasgger / swagger-jsdoc)", description: "Docstring-basert OpenAPI." },
  { id: "none", label: "Ingen", description: "Hopp over API-doc." },
];
