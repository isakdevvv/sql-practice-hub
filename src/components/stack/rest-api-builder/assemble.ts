import type { BuilderState, ResourceSpec, AuthMode, Pagination, CorsMode, OpenApiMode, ValidationMode } from "./types";
import { RESOURCES, FRAMEWORKS } from "./options";

/** Resolverer ressurssett til faktiske ResourceSpec-objekter, i RESOURCES-rekkefølge. */
export function pickResources(selected: Set<string>): ResourceSpec[] {
  return RESOURCES.filter((r) => selected.has(r.singular));
}

/** Auto-justering: noen valg er framework-spesifikke. Tvinger gyldig kombo. */
export function normalize(state: BuilderState): BuilderState {
  const fw = FRAMEWORKS.find((f) => f.id === state.framework)!;
  const out: BuilderState = {
    ...state,
    validation: state.validation,
    resources: new Set(state.resources),
    middleware: { ...state.middleware },
  };

  // Hvis valgt validering ikke matcher framework, bytt til framework-default.
  const validMap: Record<string, ValidationMode> = {
    "flask-restful": "marshmallow",
    "fastapi": "pydantic",
    "express": "joi",
    "drf": "drf-serializer",
  };
  out.validation = validMap[fw.id] ?? state.validation;

  // OpenAPI auto er bare gratis for FastAPI/DRF; for Flask/Express → manuell hvis auto valgt.
  if (out.openapi === "auto" && (fw.id === "flask-restful" || fw.id === "express")) {
    out.openapi = "manual";
  }
  return out;
}

export function assemble(state: BuilderState): string {
  const s = normalize(state);
  const resources = pickResources(s.resources);
  switch (s.framework) {
    case "fastapi":
      return assembleFastAPI(s, resources);
    case "flask-restful":
      return assembleFlaskRestful(s, resources);
    case "express":
      return assembleExpress(s, resources);
    case "drf":
      return assembleDRF(s, resources);
  }
}

// ---------------------------------------------------------------------------
// Felles hjelpere
// ---------------------------------------------------------------------------

function pyType(kind: string): string {
  switch (kind) {
    case "id":
      return "int";
    case "number":
      return "float";
    case "date":
      return "str";
    case "foreignKey":
      return "int";
    default:
      return "str";
  }
}

function jsExampleValue(kind: string, i: number): string {
  switch (kind) {
    case "id":
      return String(i);
    case "number":
      return (99 + i * 10).toFixed(2);
    case "date":
      return `"2026-05-${String(i).padStart(2, "0")}"`;
    case "foreignKey":
      return String(i);
    default:
      return `"verdi-${i}"`;
  }
}

// =========================================================================
// FASTAPI
// =========================================================================

function assembleFastAPI(s: BuilderState, resources: ResourceSpec[]): string {
  const out: string[] = [];
  out.push(
    "# =====================================================================",
    "# FastAPI REST-API — generert av REST API Builder",
    "# =====================================================================",
    "",
    "from fastapi import FastAPI, HTTPException, Depends, Header, Query, Request",
    "from fastapi.middleware.cors import CORSMiddleware",
    "from pydantic import BaseModel, EmailStr",
    "from typing import Optional, List",
    "import os, time, uuid, base64",
  );
  if (s.auth === "jwt") {
    out.push("import hmac, hashlib, json");
  }
  out.push("", `app = FastAPI(title="Generert API", version="1.0.0"${s.openapi === "none" ? ", docs_url=None, redoc_url=None" : ""})`);
  out.push("");

  // CORS
  if (s.cors === "open") {
    out.push(
      `app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])`,
    );
  } else {
    out.push(
      `ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000").split(",")`,
      `app.add_middleware(CORSMiddleware, allow_origins=ALLOWED_ORIGINS, allow_methods=["*"], allow_headers=["*"])`,
    );
  }
  out.push("");

  // Middleware
  if (s.middleware.requestId || s.middleware.accessLog) {
    out.push("@app.middleware(\"http\")");
    out.push("async def request_middleware(request: Request, call_next):");
    if (s.middleware.requestId) {
      out.push('    rid = request.headers.get("X-Request-ID") or str(uuid.uuid4())');
    }
    out.push("    start = time.time()");
    out.push("    response = await call_next(request)");
    out.push("    dur_ms = (time.time() - start) * 1000");
    if (s.middleware.requestId) out.push('    response.headers["X-Request-ID"] = rid');
    if (s.middleware.accessLog)
      out.push('    print(f"{request.method} {request.url.path} -> {response.status_code} ({dur_ms:.1f}ms)")');
    out.push("    return response", "");
  }

  // Auth
  out.push(...fastapiAuth(s.auth));

  // Pydantic-modeller
  for (const r of resources) {
    out.push(`class ${r.singular}In(BaseModel):`);
    const inFields = r.fields.filter((f) => f.kind !== "id");
    if (inFields.length === 0) {
      out.push("    pass");
    } else {
      for (const f of inFields) {
        const t = f.kind === "email" ? "EmailStr" : pyType(f.kind);
        out.push(`    ${f.name}: ${t}`);
      }
    }
    out.push("");
    out.push(`class ${r.singular}(${r.singular}In):`);
    out.push("    id: int");
    out.push("");
  }

  // In-memory DB
  out.push("# In-memory \"database\" — bytt til SQLAlchemy/MongoDB i prod.");
  for (const r of resources) {
    out.push(`${r.plural}_db: dict[int, ${r.singular}] = {}`);
    out.push(`${r.plural}_seq = 0`);
  }
  out.push("");

  // CRUD-routes
  for (const r of resources) out.push(...fastapiResource(r, s));

  // Error handler
  if (s.middleware.jsonErrors) {
    out.push(
      "from fastapi.responses import JSONResponse",
      "from fastapi.exceptions import RequestValidationError",
      "",
      "@app.exception_handler(RequestValidationError)",
      "async def validation_handler(_req, exc):",
      "    return JSONResponse(status_code=422, content={\"feil\": \"valideringsfeil\", \"detaljer\": exc.errors()})",
      "",
    );
  }

  // OpenAPI note
  out.push(...openapiNote(s.openapi, "fastapi"));

  // curl-eksempler
  out.push("", ...curlExamples(s, resources, "http://localhost:8000"));
  return out.join("\n");
}

function fastapiAuth(mode: AuthMode): string[] {
  if (mode === "none")
    return ["def krev_auth():  # noop", "    return None", ""];
  if (mode === "bearer") {
    return [
      'API_TOKEN = os.environ.get("API_TOKEN", "demo-token-bytt-meg")',
      "",
      "def krev_auth(authorization: Optional[str] = Header(None)):",
      "    if not authorization or not authorization.startswith(\"Bearer \"):",
      "        raise HTTPException(status_code=401, detail=\"mangler Bearer-token\")",
      "    if authorization[7:] != API_TOKEN:",
      "        raise HTTPException(status_code=403, detail=\"ugyldig token\")",
      "    return authorization[7:]",
      "",
    ];
  }
  if (mode === "basic") {
    return [
      'BASIC_USERS = {"ola": "hunter2", "kari": "passord"}',
      "",
      "def krev_auth(authorization: Optional[str] = Header(None)):",
      "    if not authorization or not authorization.startswith(\"Basic \"):",
      "        raise HTTPException(status_code=401, detail=\"mangler Basic-auth\")",
      "    raw = base64.b64decode(authorization[6:]).decode()",
      "    user, _, pw = raw.partition(\":\")",
      "    if BASIC_USERS.get(user) != pw:",
      "        raise HTTPException(status_code=403, detail=\"ugyldig brukernavn/passord\")",
      "    return user",
      "",
    ];
  }
  // JWT
  return [
    'JWT_SECRET = os.environ.get("JWT_SECRET", "bytt-meg")',
    "",
    "def _b64u(data: bytes) -> str:",
    "    return base64.urlsafe_b64encode(data).rstrip(b\"=\").decode()",
    "",
    "def sign_jwt(payload: dict) -> str:",
    "    header = _b64u(json.dumps({\"alg\": \"HS256\", \"typ\": \"JWT\"}).encode())",
    "    body = _b64u(json.dumps(payload).encode())",
    "    sig = hmac.new(JWT_SECRET.encode(), f\"{header}.{body}\".encode(), hashlib.sha256).digest()",
    "    return f\"{header}.{body}.{_b64u(sig)}\"",
    "",
    "def krev_auth(authorization: Optional[str] = Header(None)):",
    "    if not authorization or not authorization.startswith(\"Bearer \"):",
    "        raise HTTPException(status_code=401, detail=\"mangler JWT\")",
    "    token = authorization[7:]",
    "    try:",
    "        h, b, sig = token.split(\".\")",
    "        expected = _b64u(hmac.new(JWT_SECRET.encode(), f\"{h}.{b}\".encode(), hashlib.sha256).digest())",
    "        if not hmac.compare_digest(sig, expected):",
    "            raise ValueError()",
    "        return json.loads(base64.urlsafe_b64decode(b + \"==\"))",
    "    except Exception:",
    "        raise HTTPException(status_code=403, detail=\"ugyldig JWT\")",
    "",
  ];
}

function fastapiResource(r: ResourceSpec, s: BuilderState): string[] {
  const out: string[] = [];
  const dep = "Depends(krev_auth)";
  // LIST
  const listParams: string[] = [`_auth = ${dep}`];
  if (s.pagination === "page-size") {
    listParams.unshift("page: int = Query(1, ge=1)", "size: int = Query(20, ge=1, le=100)");
  } else if (s.pagination === "cursor") {
    listParams.unshift("cursor: Optional[int] = None", "limit: int = Query(20, ge=1, le=100)");
  }
  out.push(`@app.get("/${r.plural}")`);
  out.push(`def list_${r.plural}(${listParams.join(", ")}):`);
  out.push(`    items = list(${r.plural}_db.values())`);
  if (s.pagination === "page-size") {
    out.push("    start = (page - 1) * size");
    out.push("    return {\"page\": page, \"size\": size, \"total\": len(items), \"items\": items[start:start+size]}");
  } else if (s.pagination === "cursor") {
    out.push("    if cursor is not None:");
    out.push("        items = [i for i in items if i.id > cursor]");
    out.push("    page = items[:limit]");
    out.push("    next_cursor = page[-1].id if len(page) == limit else None");
    out.push("    return {\"items\": page, \"next_cursor\": next_cursor}");
  } else if (s.pagination === "total-count") {
    out.push("    from fastapi.responses import JSONResponse");
    out.push("    return JSONResponse(content=[i.model_dump() for i in items], headers={\"X-Total-Count\": str(len(items))})");
  } else {
    out.push("    return items");
  }
  out.push("");

  // GET
  out.push(`@app.get("/${r.plural}/{item_id}")`);
  out.push(`def get_${r.singular.toLowerCase()}(item_id: int, _auth = ${dep}):`);
  out.push(`    item = ${r.plural}_db.get(item_id)`);
  out.push("    if item is None:");
  out.push(`        raise HTTPException(status_code=404, detail=\"${r.label} ikke funnet\")`);
  out.push("    return item", "");

  // POST
  out.push(`@app.post("/${r.plural}", status_code=201)`);
  out.push(`def create_${r.singular.toLowerCase()}(payload: ${r.singular}In, _auth = ${dep}):`);
  out.push(`    global ${r.plural}_seq`);
  out.push(`    ${r.plural}_seq += 1`);
  out.push(`    item = ${r.singular}(id=${r.plural}_seq, **payload.model_dump())`);
  out.push(`    ${r.plural}_db[item.id] = item`);
  out.push("    return item", "");

  // PUT
  out.push(`@app.put("/${r.plural}/{item_id}")`);
  out.push(`def update_${r.singular.toLowerCase()}(item_id: int, payload: ${r.singular}In, _auth = ${dep}):`);
  out.push(`    if item_id not in ${r.plural}_db:`);
  out.push(`        raise HTTPException(status_code=404, detail=\"${r.label} ikke funnet\")`);
  out.push(`    updated = ${r.singular}(id=item_id, **payload.model_dump())`);
  out.push(`    ${r.plural}_db[item_id] = updated`);
  out.push("    return updated", "");

  // DELETE
  out.push(`@app.delete("/${r.plural}/{item_id}", status_code=204)`);
  out.push(`def delete_${r.singular.toLowerCase()}(item_id: int, _auth = ${dep}):`);
  out.push(`    if item_id not in ${r.plural}_db:`);
  out.push(`        raise HTTPException(status_code=404, detail=\"${r.label} ikke funnet\")`);
  out.push(`    del ${r.plural}_db[item_id]`);
  out.push("    return", "");
  return out;
}

// =========================================================================
// FLASK + FLASK-RESTFUL
// =========================================================================

function assembleFlaskRestful(s: BuilderState, resources: ResourceSpec[]): string {
  const out: string[] = [];
  out.push(
    "# =====================================================================",
    "# Flask + Flask-RESTful — generert av REST API Builder",
    "# =====================================================================",
    "",
    "from flask import Flask, request, jsonify, g, abort",
    "from flask_restful import Api, Resource",
    "from flask_cors import CORS",
    "from marshmallow import Schema, fields, ValidationError",
    "from functools import wraps",
    "import os, time, uuid, base64",
  );
  if (s.auth === "jwt") out.push("import hmac, hashlib, json");
  if (s.openapi === "manual") out.push("from flasgger import Swagger");
  out.push("");
  out.push("app = Flask(__name__)");
  out.push("api = Api(app)");
  if (s.openapi === "manual") out.push('swagger = Swagger(app, template={"info": {"title": "Generert API", "version": "1.0"}})');
  out.push("");

  // CORS
  if (s.cors === "open") {
    out.push('CORS(app, resources={r"/*": {"origins": "*"}})');
  } else {
    out.push('ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000").split(",")');
    out.push('CORS(app, resources={r"/*": {"origins": ALLOWED_ORIGINS}})');
  }
  out.push("");

  // Middleware
  if (s.middleware.requestId || s.middleware.accessLog) {
    out.push("@app.before_request");
    out.push("def _before():");
    out.push("    g._start = time.time()");
    if (s.middleware.requestId) out.push('    g.request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))');
    out.push("");
    out.push("@app.after_request");
    out.push("def _after(response):");
    if (s.middleware.requestId) out.push('    response.headers["X-Request-ID"] = getattr(g, "request_id", "")');
    if (s.middleware.accessLog)
      out.push('    print(f"{request.method} {request.path} -> {response.status_code} ({(time.time()-g._start)*1000:.1f}ms)")');
    out.push("    return response", "");
  }

  // JSON error handler
  if (s.middleware.jsonErrors) {
    out.push("@app.errorhandler(404)");
    out.push("def _404(_e):");
    out.push('    return jsonify({"feil": "ikke funnet"}), 404');
    out.push("");
    out.push("@app.errorhandler(ValidationError)");
    out.push("def _vex(e):");
    out.push('    return jsonify({"feil": "valideringsfeil", "detaljer": e.messages}), 422');
    out.push("");
  }

  // Auth
  out.push(...flaskAuth(s.auth));

  // Marshmallow schemas
  for (const r of resources) {
    out.push(`class ${r.singular}Schema(Schema):`);
    out.push("    id = fields.Int(dump_only=True)");
    for (const f of r.fields) {
      if (f.kind === "id") continue;
      const t = marshmallowField(f.kind);
      out.push(`    ${f.name} = ${t}`);
    }
    out.push("");
  }

  // In-memory DB
  for (const r of resources) {
    out.push(`${r.plural}_db = {}`);
    out.push(`${r.plural}_seq = 0`);
  }
  out.push("");

  // Resources
  for (const r of resources) out.push(...flaskRestfulResource(r, s));

  // Routes registration
  out.push("# === Registrer endepunkter ===");
  for (const r of resources) {
    out.push(`api.add_resource(${r.singular}List, "/${r.plural}")`);
    out.push(`api.add_resource(${r.singular}Item, "/${r.plural}/<int:item_id>")`);
  }
  out.push("");

  out.push(...openapiNote(s.openapi, "flask-restful"));

  out.push("", 'if __name__ == "__main__":');
  out.push("    app.run(host=\"0.0.0.0\", port=5000, debug=True)");

  out.push("", ...curlExamples(s, resources, "http://localhost:5000"));
  return out.join("\n");
}

function marshmallowField(kind: string): string {
  switch (kind) {
    case "number":
      return "fields.Float(required=True)";
    case "date":
      return "fields.Date(required=True)";
    case "email":
      return "fields.Email(required=True)";
    case "foreignKey":
      return "fields.Int(required=True)";
    default:
      return "fields.Str(required=True)";
  }
}

function flaskAuth(mode: AuthMode): string[] {
  if (mode === "none") {
    return [
      "def krev_auth(fn):",
      "    @wraps(fn)",
      "    def w(*a, **kw):",
      "        return fn(*a, **kw)",
      "    return w",
      "",
    ];
  }
  if (mode === "bearer") {
    return [
      'API_TOKEN = os.environ.get("API_TOKEN", "demo-token-bytt-meg")',
      "",
      "def krev_auth(fn):",
      "    @wraps(fn)",
      "    def w(*a, **kw):",
      '        auth = request.headers.get("Authorization", "")',
      '        if not auth.startswith("Bearer "):',
      '            return jsonify({"feil": "mangler Bearer-token"}), 401',
      "        if auth[7:] != API_TOKEN:",
      '            return jsonify({"feil": "ugyldig token"}), 403',
      "        return fn(*a, **kw)",
      "    return w",
      "",
    ];
  }
  if (mode === "basic") {
    return [
      'BASIC_USERS = {"ola": "hunter2", "kari": "passord"}',
      "",
      "def krev_auth(fn):",
      "    @wraps(fn)",
      "    def w(*a, **kw):",
      '        auth = request.headers.get("Authorization", "")',
      '        if not auth.startswith("Basic "):',
      '            return jsonify({"feil": "mangler Basic-auth"}), 401',
      "        raw = base64.b64decode(auth[6:]).decode()",
      '        user, _, pw = raw.partition(":")',
      "        if BASIC_USERS.get(user) != pw:",
      '            return jsonify({"feil": "ugyldig"}), 403',
      "        return fn(*a, **kw)",
      "    return w",
      "",
    ];
  }
  return [
    'JWT_SECRET = os.environ.get("JWT_SECRET", "bytt-meg")',
    "",
    "def _b64u(data):",
    '    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()',
    "",
    "def sign_jwt(payload):",
    '    header = _b64u(json.dumps({"alg": "HS256", "typ": "JWT"}).encode())',
    "    body = _b64u(json.dumps(payload).encode())",
    '    sig = hmac.new(JWT_SECRET.encode(), f"{header}.{body}".encode(), hashlib.sha256).digest()',
    '    return f"{header}.{body}.{_b64u(sig)}"',
    "",
    "def krev_auth(fn):",
    "    @wraps(fn)",
    "    def w(*a, **kw):",
    '        auth = request.headers.get("Authorization", "")',
    '        if not auth.startswith("Bearer "):',
    '            return jsonify({"feil": "mangler JWT"}), 401',
    "        token = auth[7:]",
    "        try:",
    '            h, b, sig = token.split(".")',
    '            expected = _b64u(hmac.new(JWT_SECRET.encode(), f"{h}.{b}".encode(), hashlib.sha256).digest())',
    "            if not hmac.compare_digest(sig, expected):",
    "                raise ValueError()",
    "        except Exception:",
    '            return jsonify({"feil": "ugyldig JWT"}), 403',
    "        return fn(*a, **kw)",
    "    return w",
    "",
  ];
}

function flaskRestfulResource(r: ResourceSpec, s: BuilderState): string[] {
  const out: string[] = [];
  const cls = r.singular;
  const schema = `${cls}Schema`;
  out.push(`class ${cls}List(Resource):`);
  out.push("    method_decorators = [krev_auth]");
  out.push("");
  out.push("    def get(self):");
  out.push(`        items = list(${r.plural}_db.values())`);
  if (s.pagination === "page-size") {
    out.push('        page = int(request.args.get("page", 1))');
    out.push('        size = int(request.args.get("size", 20))');
    out.push("        start = (page - 1) * size");
    out.push(`        return {"page": page, "size": size, "total": len(items), "items": ${schema}(many=True).dump(items[start:start+size])}`);
  } else if (s.pagination === "cursor") {
    out.push('        cursor = request.args.get("cursor")');
    out.push('        limit = int(request.args.get("limit", 20))');
    out.push("        if cursor:");
    out.push("            items = [i for i in items if i['id'] > int(cursor)]");
    out.push("        page = items[:limit]");
    out.push("        next_cursor = page[-1]['id'] if len(page) == limit else None");
    out.push(`        return {"items": ${schema}(many=True).dump(page), "next_cursor": next_cursor}`);
  } else if (s.pagination === "total-count") {
    out.push(`        body = ${schema}(many=True).dump(items)`);
    out.push('        return body, 200, {"X-Total-Count": str(len(items))}');
  } else {
    out.push(`        return ${schema}(many=True).dump(items)`);
  }
  out.push("");
  out.push("    def post(self):");
  out.push(`        data = ${schema}().load(request.get_json() or {})`);
  out.push(`        global ${r.plural}_seq`);
  out.push(`        ${r.plural}_seq += 1`);
  out.push(`        data["id"] = ${r.plural}_seq`);
  out.push(`        ${r.plural}_db[data["id"]] = data`);
  out.push(`        return ${schema}().dump(data), 201`);
  out.push("");

  out.push(`class ${cls}Item(Resource):`);
  out.push("    method_decorators = [krev_auth]");
  out.push("");
  out.push("    def get(self, item_id):");
  out.push(`        item = ${r.plural}_db.get(item_id)`);
  out.push("        if item is None:");
  out.push(`            abort(404, "${r.label} ikke funnet")`);
  out.push(`        return ${schema}().dump(item)`);
  out.push("");
  out.push("    def put(self, item_id):");
  out.push(`        if item_id not in ${r.plural}_db:`);
  out.push(`            abort(404, "${r.label} ikke funnet")`);
  out.push(`        data = ${schema}().load(request.get_json() or {})`);
  out.push('        data["id"] = item_id');
  out.push(`        ${r.plural}_db[item_id] = data`);
  out.push(`        return ${schema}().dump(data)`);
  out.push("");
  out.push("    def delete(self, item_id):");
  out.push(`        ${r.plural}_db.pop(item_id, None)`);
  out.push('        return "", 204');
  out.push("");
  return out;
}

// =========================================================================
// EXPRESS
// =========================================================================

function assembleExpress(s: BuilderState, resources: ResourceSpec[]): string {
  const out: string[] = [];
  out.push(
    "// =====================================================================",
    "// Express.js REST-API — generert av REST API Builder",
    "// =====================================================================",
    "",
    "const express = require(\"express\");",
    "const cors = require(\"cors\");",
    "const Joi = require(\"joi\");",
    "const crypto = require(\"crypto\");",
  );
  if (s.openapi === "manual") {
    out.push("const swaggerUi = require(\"swagger-ui-express\");");
    out.push("const swaggerJsdoc = require(\"swagger-jsdoc\");");
  }
  out.push("");
  out.push("const app = express();");
  out.push("app.use(express.json());");
  out.push("");

  // CORS
  if (s.cors === "open") {
    out.push('app.use(cors({ origin: "*" }));');
  } else {
    out.push('const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "http://localhost:3000").split(",");');
    out.push('app.use(cors({ origin: (o, cb) => cb(null, !o || ALLOWED_ORIGINS.includes(o)) }));');
  }
  out.push("");

  // Middleware
  if (s.middleware.requestId || s.middleware.accessLog) {
    out.push("app.use((req, res, next) => {");
    if (s.middleware.requestId) {
      out.push('  req.id = req.headers["x-request-id"] || crypto.randomUUID();');
      out.push('  res.setHeader("X-Request-ID", req.id);');
    }
    out.push("  const start = Date.now();");
    out.push('  res.on("finish", () => {');
    if (s.middleware.accessLog) out.push("    console.log(`${req.method} ${req.path} -> ${res.statusCode} (${Date.now()-start}ms)`);");
    out.push("  });");
    out.push("  next();");
    out.push("});");
    out.push("");
  }

  // Auth middleware
  out.push(...expressAuth(s.auth));

  // Joi schemas
  for (const r of resources) {
    out.push(`const ${r.singular}Schema = Joi.object({`);
    const inFields = r.fields.filter((f) => f.kind !== "id");
    for (const f of inFields) out.push(`  ${f.name}: ${joiField(f.kind)},`);
    out.push("});");
    out.push("");
  }

  // In-memory DB
  for (const r of resources) {
    out.push(`const ${r.plural}_db = new Map();`);
    out.push(`let ${r.plural}_seq = 0;`);
  }
  out.push("");

  // CRUD
  for (const r of resources) out.push(...expressResource(r, s));

  // JSON error handler
  if (s.middleware.jsonErrors) {
    out.push("app.use((req, res) => res.status(404).json({ feil: \"ikke funnet\" }));");
    out.push("app.use((err, req, res, _next) => {");
    out.push("  console.error(err);");
    out.push("  res.status(500).json({ feil: err.message || \"intern feil\" });");
    out.push("});");
    out.push("");
  }

  // OpenAPI manual
  if (s.openapi === "manual") {
    out.push("const specs = swaggerJsdoc({");
    out.push('  definition: { openapi: "3.0.0", info: { title: "Generert API", version: "1.0.0" } },');
    out.push("  apis: [__filename],");
    out.push("});");
    out.push('app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));');
    out.push("");
  }

  out.push("const PORT = process.env.PORT || 3000;");
  out.push("app.listen(PORT, () => console.log(`API kjører på http://localhost:${PORT}`));");
  out.push("");
  out.push(...curlExamples(s, resources, "http://localhost:3000").map((l) => l.startsWith("#") ? "//" + l.slice(1) : l));
  return out.join("\n");
}

function joiField(kind: string): string {
  switch (kind) {
    case "number":
      return "Joi.number().required()";
    case "email":
      return "Joi.string().email().required()";
    case "date":
      return "Joi.date().iso().required()";
    case "foreignKey":
      return "Joi.number().integer().required()";
    default:
      return "Joi.string().required()";
  }
}

function expressAuth(mode: AuthMode): string[] {
  if (mode === "none") return ["const krevAuth = (req, res, next) => next();", ""];
  if (mode === "bearer") {
    return [
      'const API_TOKEN = process.env.API_TOKEN || "demo-token-bytt-meg";',
      "function krevAuth(req, res, next) {",
      '  const h = req.headers.authorization || "";',
      '  if (!h.startsWith("Bearer ")) return res.status(401).json({ feil: "mangler Bearer-token" });',
      '  if (h.slice(7) !== API_TOKEN) return res.status(403).json({ feil: "ugyldig token" });',
      "  next();",
      "}",
      "",
    ];
  }
  if (mode === "basic") {
    return [
      'const BASIC_USERS = { ola: "hunter2", kari: "passord" };',
      "function krevAuth(req, res, next) {",
      '  const h = req.headers.authorization || "";',
      '  if (!h.startsWith("Basic ")) return res.status(401).json({ feil: "mangler Basic-auth" });',
      '  const [user, pw] = Buffer.from(h.slice(6), "base64").toString().split(":");',
      '  if (BASIC_USERS[user] !== pw) return res.status(403).json({ feil: "ugyldig" });',
      "  next();",
      "}",
      "",
    ];
  }
  return [
    'const JWT_SECRET = process.env.JWT_SECRET || "bytt-meg";',
    "function b64u(buf) { return buf.toString(\"base64\").replace(/=+$/,\"\").replace(/\\+/g,\"-\").replace(/\\//g,\"_\"); }",
    "function signJwt(payload) {",
    '  const h = b64u(Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })));',
    "  const b = b64u(Buffer.from(JSON.stringify(payload)));",
    '  const sig = b64u(crypto.createHmac("sha256", JWT_SECRET).update(`${h}.${b}`).digest());',
    "  return `${h}.${b}.${sig}`;",
    "}",
    "function krevAuth(req, res, next) {",
    '  const h = req.headers.authorization || "";',
    '  if (!h.startsWith("Bearer ")) return res.status(401).json({ feil: "mangler JWT" });',
    '  const [hd, bd, sig] = h.slice(7).split(".");',
    '  const exp = b64u(crypto.createHmac("sha256", JWT_SECRET).update(`${hd}.${bd}`).digest());',
    '  if (sig !== exp) return res.status(403).json({ feil: "ugyldig JWT" });',
    "  next();",
    "}",
    "",
  ];
}

function expressResource(r: ResourceSpec, s: BuilderState): string[] {
  const out: string[] = [];
  // LIST
  out.push(`app.get("/${r.plural}", krevAuth, (req, res) => {`);
  out.push(`  let items = Array.from(${r.plural}_db.values());`);
  if (s.pagination === "page-size") {
    out.push("  const page = parseInt(req.query.page) || 1;");
    out.push("  const size = parseInt(req.query.size) || 20;");
    out.push("  const start = (page - 1) * size;");
    out.push("  res.json({ page, size, total: items.length, items: items.slice(start, start + size) });");
  } else if (s.pagination === "cursor") {
    out.push("  const cursor = req.query.cursor ? parseInt(req.query.cursor) : null;");
    out.push("  const limit = parseInt(req.query.limit) || 20;");
    out.push("  if (cursor !== null) items = items.filter(i => i.id > cursor);");
    out.push("  const page = items.slice(0, limit);");
    out.push("  res.json({ items: page, next_cursor: page.length === limit ? page[page.length-1].id : null });");
  } else if (s.pagination === "total-count") {
    out.push('  res.setHeader("X-Total-Count", items.length);');
    out.push("  res.json(items);");
  } else {
    out.push("  res.json(items);");
  }
  out.push("});");
  out.push("");
  // GET
  out.push(`app.get("/${r.plural}/:id", krevAuth, (req, res) => {`);
  out.push(`  const item = ${r.plural}_db.get(parseInt(req.params.id));`);
  out.push(`  if (!item) return res.status(404).json({ feil: "${r.label} ikke funnet" });`);
  out.push("  res.json(item);");
  out.push("});");
  out.push("");
  // POST
  out.push(`app.post("/${r.plural}", krevAuth, (req, res) => {`);
  out.push(`  const { error, value } = ${r.singular}Schema.validate(req.body);`);
  out.push("  if (error) return res.status(422).json({ feil: \"valideringsfeil\", detaljer: error.details });");
  out.push(`  const item = { id: ++${r.plural}_seq, ...value };`);
  out.push(`  ${r.plural}_db.set(item.id, item);`);
  out.push("  res.status(201).json(item);");
  out.push("});");
  out.push("");
  // PUT
  out.push(`app.put("/${r.plural}/:id", krevAuth, (req, res) => {`);
  out.push("  const id = parseInt(req.params.id);");
  out.push(`  if (!${r.plural}_db.has(id)) return res.status(404).json({ feil: "${r.label} ikke funnet" });`);
  out.push(`  const { error, value } = ${r.singular}Schema.validate(req.body);`);
  out.push("  if (error) return res.status(422).json({ feil: \"valideringsfeil\", detaljer: error.details });");
  out.push("  const item = { id, ...value };");
  out.push(`  ${r.plural}_db.set(id, item);`);
  out.push("  res.json(item);");
  out.push("});");
  out.push("");
  // DELETE
  out.push(`app.delete("/${r.plural}/:id", krevAuth, (req, res) => {`);
  out.push(`  ${r.plural}_db.delete(parseInt(req.params.id));`);
  out.push("  res.status(204).end();");
  out.push("});");
  out.push("");
  return out;
}

// =========================================================================
// DJANGO REST FRAMEWORK
// =========================================================================

function assembleDRF(s: BuilderState, resources: ResourceSpec[]): string {
  const out: string[] = [];
  out.push(
    "# =====================================================================",
    "# Django REST Framework — generert av REST API Builder",
    "# Bruk: legg dette i en Django-app (models.py + serializers.py + urls.py)",
    "# =====================================================================",
    "",
    "# === models.py ============================================",
    "from django.db import models",
    "",
  );
  for (const r of resources) {
    out.push(`class ${r.singular}(models.Model):`);
    const nonId = r.fields.filter((f) => f.kind !== "id");
    if (nonId.length === 0) out.push("    pass");
    for (const f of nonId) out.push(`    ${f.name} = ${drfModelField(f)}`);
    out.push("");
  }

  out.push("# === serializers.py =======================================");
  out.push("from rest_framework import serializers");
  out.push("");
  for (const r of resources) {
    out.push(`class ${r.singular}Serializer(serializers.ModelSerializer):`);
    out.push("    class Meta:");
    out.push(`        model = ${r.singular}`);
    out.push('        fields = "__all__"');
    out.push("");
  }

  out.push("# === views.py =============================================");
  out.push("from rest_framework import viewsets, pagination");
  if (s.auth === "bearer" || s.auth === "jwt") {
    out.push("from rest_framework.authentication import TokenAuthentication");
    out.push("from rest_framework.permissions import IsAuthenticated");
  } else if (s.auth === "basic") {
    out.push("from rest_framework.authentication import BasicAuthentication");
    out.push("from rest_framework.permissions import IsAuthenticated");
  }
  out.push("");

  // Pagination class
  if (s.pagination === "page-size") {
    out.push("class StandardPagination(pagination.PageNumberPagination):");
    out.push("    page_size = 20");
    out.push("    page_size_query_param = \"size\"");
    out.push("    max_page_size = 100");
    out.push("");
  } else if (s.pagination === "cursor") {
    out.push("class StandardPagination(pagination.CursorPagination):");
    out.push("    page_size = 20");
    out.push("    ordering = \"id\"");
    out.push("");
  }

  for (const r of resources) {
    out.push(`class ${r.singular}ViewSet(viewsets.ModelViewSet):`);
    out.push(`    queryset = ${r.singular}.objects.all()`);
    out.push(`    serializer_class = ${r.singular}Serializer`);
    if (s.pagination === "page-size" || s.pagination === "cursor") {
      out.push("    pagination_class = StandardPagination");
    }
    if (s.auth === "bearer" || s.auth === "jwt") {
      out.push("    authentication_classes = [TokenAuthentication]");
      out.push("    permission_classes = [IsAuthenticated]");
    } else if (s.auth === "basic") {
      out.push("    authentication_classes = [BasicAuthentication]");
      out.push("    permission_classes = [IsAuthenticated]");
    }
    out.push("");
  }

  out.push("# === urls.py ==============================================");
  out.push("from rest_framework.routers import DefaultRouter");
  out.push("");
  out.push("router = DefaultRouter()");
  for (const r of resources) out.push(`router.register(r"${r.plural}", ${r.singular}ViewSet)`);
  out.push("");
  out.push("urlpatterns = router.urls  # legg til i prosjektets urls.py");
  out.push("");

  // settings.py snippet for CORS
  out.push("# === settings.py-snippet ==================================");
  out.push("# pip install django-cors-headers");
  out.push("INSTALLED_APPS = [");
  out.push('    "rest_framework", "corsheaders", "this_app",  # ++ Django-standard apps');
  out.push("]");
  out.push("MIDDLEWARE = [");
  out.push('    "corsheaders.middleware.CorsMiddleware",  # MÅ ligge høyt');
  if (s.middleware.requestId) out.push('    "log_request_id.middleware.RequestIDMiddleware",  # pip install django-log-request-id');
  out.push("    # ... resten av Django-standardene");
  out.push("]");
  if (s.cors === "open") {
    out.push("CORS_ALLOW_ALL_ORIGINS = True");
  } else {
    out.push('import os; CORS_ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000").split(",")');
  }
  out.push("");

  out.push(...openapiNote(s.openapi, "drf"));

  out.push("", ...curlExamples(s, resources, "http://localhost:8000"));
  return out.join("\n");
}

function drfModelField(f: { name: string; kind: string; ref?: string }): string {
  switch (f.kind) {
    case "number":
      return "models.FloatField()";
    case "email":
      return "models.EmailField(max_length=254)";
    case "date":
      return "models.DateField()";
    case "foreignKey":
      return `models.ForeignKey("${f.ref}", on_delete=models.CASCADE)`;
    default:
      return "models.CharField(max_length=200)";
  }
}

// =========================================================================
// FELLES: curl-eksempler + openapi-merknader
// =========================================================================

function openapiNote(mode: OpenApiMode, fw: string): string[] {
  if (mode === "none") return [];
  if (mode === "auto" && fw === "fastapi") {
    return ["# OpenAPI auto-generert: http://localhost:8000/docs (Swagger) og /redoc", ""];
  }
  if (mode === "auto" && fw === "drf") {
    return [
      "# Auto-doc: pip install drf-spectacular og legg til i settings.",
      "# REST_FRAMEWORK = {\"DEFAULT_SCHEMA_CLASS\": \"drf_spectacular.openapi.AutoSchema\"}",
      "# Swagger på /api/schema/swagger-ui/",
      "",
    ];
  }
  if (mode === "manual" && fw === "flask-restful") {
    return [
      "# flasgger-doc er konfigurert ovenfor — besøk http://localhost:5000/apidocs/",
      "",
    ];
  }
  return [];
}

function curlExamples(s: BuilderState, resources: ResourceSpec[], base: string): string[] {
  if (resources.length === 0) return ["# Ingen ressurser valgt — kryss av minst én (Bruker/Produkt/Ordre)."];
  const prefix = base.startsWith("http") ? "#" : "#";
  const lines: string[] = [];
  lines.push(prefix + " ====================================================================");
  lines.push(prefix + " curl-test-eksempler");
  lines.push(prefix + " ====================================================================");
  const authHeader = authHeaderFor(s.auth);
  for (const r of resources) {
    const body = exampleBody(r);
    lines.push(prefix);
    lines.push(`${prefix} # LIST /${r.plural}${paginationQuery(s.pagination)}`);
    lines.push(`${prefix} curl${authHeader} "${base}/${r.plural}${paginationQuery(s.pagination)}"`);
    lines.push(prefix);
    lines.push(`${prefix} # CREATE /${r.plural}`);
    lines.push(`${prefix} curl -X POST${authHeader} -H "Content-Type: application/json" \\`);
    lines.push(`${prefix}   -d '${body}' "${base}/${r.plural}"`);
    lines.push(prefix);
    lines.push(`${prefix} # GET /${r.plural}/1`);
    lines.push(`${prefix} curl${authHeader} "${base}/${r.plural}/1"`);
    lines.push(prefix);
    lines.push(`${prefix} # UPDATE /${r.plural}/1`);
    lines.push(`${prefix} curl -X PUT${authHeader} -H "Content-Type: application/json" \\`);
    lines.push(`${prefix}   -d '${body}' "${base}/${r.plural}/1"`);
    lines.push(prefix);
    lines.push(`${prefix} # DELETE /${r.plural}/1`);
    lines.push(`${prefix} curl -X DELETE${authHeader} "${base}/${r.plural}/1"`);
  }
  return lines;
}

function authHeaderFor(auth: AuthMode): string {
  switch (auth) {
    case "bearer":
      return ' -H "Authorization: Bearer demo-token-bytt-meg"';
    case "jwt":
      return ' -H "Authorization: Bearer <SIGN_JWT_HER>"';
    case "basic":
      return " -u ola:hunter2";
    default:
      return "";
  }
}

function paginationQuery(p: Pagination): string {
  switch (p) {
    case "page-size":
      return "?page=1&size=20";
    case "cursor":
      return "?cursor=0&limit=20";
    default:
      return "";
  }
}

function exampleBody(r: ResourceSpec): string {
  const parts: string[] = [];
  let i = 1;
  for (const f of r.fields) {
    if (f.kind === "id") continue;
    if (f.kind === "email") {
      parts.push(`"${f.name}":"bruker@ex.no"`);
    } else if (f.kind === "string") {
      parts.push(`"${f.name}":"verdi-${i}"`);
    } else {
      parts.push(`"${f.name}":${jsExampleValue(f.kind, i)}`);
    }
    i++;
  }
  return `{${parts.join(",")}}`;
}

// Stille unused-warning fra TS for hjelpere som kun brukes i én gren.
export { jsExampleValue as _unused };

/** Ubrukte konstante for å hindre import-warning hvis CorsMode endrer seg. */
export const _CORS_MODES: CorsMode[] = ["open", "restricted"];
