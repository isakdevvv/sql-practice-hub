import type { DockerOption } from "./types";

/**
 * Alle options brukeren kan krysse av i Dockerfile Builder.
 * Hver option leverer fragmenter som assemble.ts setter sammen i
 * Dockerfile-rekkefølge: FROM → ENV → WORKDIR → system → deps →
 * app-copy → EXPOSE → USER → HEALTHCHECK → VOLUME → CMD.
 */
export const OPTIONS: readonly DockerOption[] = [
  // ============ BASE-IMAGE (radio) ====================================
  {
    id: "base-python-slim",
    category: "base",
    label: "python:3.12-slim",
    description: "Debian-basert Python — bredeste pakkestøtte, ~120 MB.",
    defaultOn: true,
    contributes: {
      from: "FROM python:3.12-slim",
      env: [
        "ENV PYTHONDONTWRITEBYTECODE=1 \\",
        "    PYTHONUNBUFFERED=1 \\",
        "    PIP_NO_CACHE_DIR=1",
      ],
    },
  },
  {
    id: "base-python-alpine",
    category: "base",
    label: "python:3.12-alpine",
    description: "Musl-basert Python — minst (~50 MB), men noen wheels mangler.",
    contributes: {
      from: "FROM python:3.12-alpine",
      env: [
        "ENV PYTHONDONTWRITEBYTECODE=1 \\",
        "    PYTHONUNBUFFERED=1 \\",
        "    PIP_NO_CACHE_DIR=1",
      ],
    },
  },
  {
    id: "base-node-alpine",
    category: "base",
    label: "node:20-alpine",
    description: "Node.js 20 LTS på Alpine — typisk valg for Express/Next/Vite.",
    contributes: {
      from: "FROM node:20-alpine",
      env: ["ENV NODE_ENV=production"],
    },
  },
  {
    id: "base-ubuntu",
    category: "base",
    label: "ubuntu:22.04",
    description: "Generelt Linux-image. Du må selv installere språk-runtime.",
    contributes: {
      from: "FROM ubuntu:22.04",
      env: ["ENV DEBIAN_FRONTEND=noninteractive"],
    },
  },
  {
    id: "base-debian",
    category: "base",
    label: "debian:12-slim",
    description: "Slank Debian uten Python — bra som base for egne stack.",
    contributes: {
      from: "FROM debian:12-slim",
      env: ["ENV DEBIAN_FRONTEND=noninteractive"],
    },
  },
  {
    id: "base-golang",
    category: "base",
    label: "golang:1.22-alpine",
    description: "Go-toolchain — typisk brukt som builder-stage i multi-stage.",
    contributes: {
      from: "FROM golang:1.22-alpine",
    },
  },

  // ============ WORKDIR + bruker + dockerignore ========================
  {
    id: "workdir-app",
    category: "workdir",
    label: "WORKDIR /app",
    description: "Alle påfølgende kommandoer kjører fra /app.",
    defaultOn: true,
    contributes: {
      workdir: "WORKDIR /app",
    },
  },
  {
    id: "user-non-root",
    category: "workdir",
    label: "Ikke-root bruker (appuser)",
    description: "adduser appuser + USER appuser før CMD — beste sikkerhetspraksis.",
    defaultOn: true,
    contributes: {
      systemRun: [
        "# Opprett en ikke-root bruker for å begrense container-skader",
        "RUN useradd --create-home --shell /bin/bash --uid 1000 appuser \\",
        " || adduser -D -u 1000 appuser",
      ],
      user: "USER appuser",
    },
  },
  {
    id: "dockerignore",
    category: "workdir",
    label: ".dockerignore med fornuftige defaults",
    description: "Hindrer at .git, node_modules, __pycache__ blir kopiert inn.",
    defaultOn: true,
    contributes: {
      dockerignore: [
        ".git",
        ".gitignore",
        ".dockerignore",
        "Dockerfile",
        "docker-compose.yml",
        "README.md",
        ".env",
        ".env.*",
        "*.log",
        // Python
        "__pycache__/",
        "*.pyc",
        "*.pyo",
        ".pytest_cache/",
        ".mypy_cache/",
        ".venv/",
        "venv/",
        // Node
        "node_modules/",
        "npm-debug.log*",
        "yarn-debug.log*",
        "dist/",
        "build/",
        // Editor
        ".vscode/",
        ".idea/",
        "*.swp",
      ],
    },
  },

  // ============ DEPENDENCIES ==========================================
  {
    id: "deps-python-requirements",
    category: "deps",
    label: "requirements.txt (pip install)",
    description: "Kopier requirements.txt først og installer — utnytter Docker-cache.",
    contributes: {
      depsCopy: ["COPY requirements.txt ."],
      depsInstall: ["RUN pip install --no-cache-dir -r requirements.txt"],
    },
  },
  {
    id: "deps-node-package",
    category: "deps",
    label: "package.json + npm ci",
    description: "Kopier package*.json og kjør npm ci — låser versjoner og er raskt.",
    contributes: {
      depsCopy: ["COPY package*.json ./"],
      depsInstall: ["RUN npm ci --omit=dev"],
    },
  },
  {
    id: "deps-go-mod",
    category: "deps",
    label: "go.mod + go mod download",
    description: "Kopier go.mod/go.sum først så Docker cacher module-nedlasting.",
    contributes: {
      depsCopy: ["COPY go.mod go.sum ./"],
      depsInstall: ["RUN go mod download"],
    },
  },
  {
    id: "deps-apt",
    category: "deps",
    label: "apt-get install (curl, ca-certificates, build-essential)",
    description: "Vanlige system-pakker. Rens cache i samme RUN-lag.",
    contributes: {
      systemRun: [
        "RUN apt-get update \\",
        " && apt-get install -y --no-install-recommends \\",
        "        curl \\",
        "        ca-certificates \\",
        "        build-essential \\",
        " && rm -rf /var/lib/apt/lists/*",
      ],
    },
  },
  {
    id: "deps-apk",
    category: "deps",
    label: "apk add (Alpine — curl, ca-certificates)",
    description: "Alpine-equivalent for system-pakker.",
    contributes: {
      systemRun: [
        "RUN apk add --no-cache curl ca-certificates",
      ],
    },
  },

  // ============ APP-KOPI / BYGG =======================================
  {
    id: "copy-simple",
    category: "copy",
    label: "Enkel COPY . .",
    description: "Kopier hele kontekst-mappa inn i WORKDIR. Krever .dockerignore.",
    defaultOn: true,
    contributes: {
      appCopy: ["COPY . ."],
    },
  },
  {
    id: "copy-multistage",
    category: "copy",
    label: "Multi-stage build (builder → runtime)",
    description: "Bygg i et separat stage, kopier kun artefakter til runtime — minste image.",
    conflicts: ["copy-simple"],
    contributes: {
      // Vi setter pre-FROM stages og COPY --from=builder; den ekte FROM kommer fra base-image.
      preFrom: [
        "# --- Builder stage: kompiler/bygg appen ---",
        "FROM python:3.12-slim AS builder",
        "WORKDIR /build",
        "COPY . .",
        "RUN pip install --no-cache-dir --prefix=/install -r requirements.txt",
        "",
        "# --- Runtime stage: bare det vi trenger for å kjøre ---",
      ],
      appCopy: [
        "COPY --from=builder /install /usr/local",
        "COPY --from=builder /build /app",
      ],
    },
  },

  // ============ RUNTIME (radio) =======================================
  {
    id: "run-gunicorn",
    category: "runtime",
    label: "gunicorn (Flask/Django, port 8000)",
    description: "Produksjons-WSGI-server for Flask/Django: 4 workers på 0.0.0.0:8000.",
    defaultOn: true,
    contributes: {
      expose: 8000,
      cmd: ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "app:app"],
    },
  },
  {
    id: "run-uvicorn",
    category: "runtime",
    label: "uvicorn (FastAPI, port 8000)",
    description: "ASGI-server for FastAPI/Starlette: uvicorn main:app på 0.0.0.0:8000.",
    contributes: {
      expose: 8000,
      cmd: ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"],
    },
  },
  {
    id: "run-npm-start",
    category: "runtime",
    label: "npm start (Node, port 3000)",
    description: "Standard Node-oppstart via npm start. Antar package.json scripts.start.",
    contributes: {
      expose: 3000,
      cmd: ["npm", "start"],
    },
  },
  {
    id: "run-python-app",
    category: "runtime",
    label: "python app.py (rå, dev-server)",
    description: "Kjør app.py direkte — fin for dev/test, ikke produksjon.",
    contributes: {
      expose: 5000,
      cmd: ["python", "app.py"],
    },
  },
  {
    id: "run-go-binary",
    category: "runtime",
    label: "./app (Go-binær, port 8080)",
    description: "Kjør den kompilerte Go-binæren. Forutsetter multi-stage build.",
    contributes: {
      expose: 8080,
      cmd: ["./app"],
    },
  },

  // ============ HEALTHCHECK ===========================================
  {
    id: "health-curl",
    category: "health",
    label: "HEALTHCHECK med curl mot /health",
    description: "Container blir markert unhealthy hvis /health ikke svarer 200 på 3 forsøk.",
    contributes: {
      healthcheck:
        "HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \\\n  CMD curl -fsS http://localhost:8000/health || exit 1",
    },
  },

  // ============ VOLUME ================================================
  {
    id: "volume-data",
    category: "volume",
    label: "VOLUME /data (persistens)",
    description: "Markerer /data som volum — overlever container-restart.",
    contributes: {
      volume: 'VOLUME ["/data"]',
    },
  },

  // ============ DOCKER-COMPOSE ========================================
  {
    id: "compose-app",
    category: "compose",
    label: "Generer docker-compose.yml (kun app)",
    description: "App-service med build-context, port-mapping og env_file.",
    contributes: {
      composeServices: {
        app: [
          "  app:",
          "    build: .",
          "    container_name: app",
          "    ports:",
          '      - "8000:8000"',
          "    env_file:",
          "      - .env",
          "    restart: unless-stopped",
          "    networks:",
          "      - appnet",
        ].join("\n"),
      },
      composeNetworks: ["appnet"],
    },
  },
  {
    id: "compose-postgres",
    category: "compose",
    label: "+ Postgres-service (port 5432)",
    description: "Legger til en postgres:16-alpine database med named volume.",
    requires: ["compose-app"],
    conflicts: ["compose-mysql"],
    contributes: {
      composeServices: {
        db: [
          "  db:",
          "    image: postgres:16-alpine",
          "    container_name: db",
          "    environment:",
          "      POSTGRES_USER: app",
          "      POSTGRES_PASSWORD: app",
          "      POSTGRES_DB: app",
          "    volumes:",
          "      - dbdata:/var/lib/postgresql/data",
          "    ports:",
          '      - "5432:5432"',
          "    networks:",
          "      - appnet",
          "    healthcheck:",
          '      test: ["CMD-SHELL", "pg_isready -U app"]',
          "      interval: 10s",
          "      timeout: 5s",
          "      retries: 5",
        ].join("\n"),
      },
      composeVolumes: ["dbdata"],
    },
  },
  {
    id: "compose-mysql",
    category: "compose",
    label: "+ MySQL-service (port 3306)",
    description: "Legger til mysql:8 med named volume og root-passord fra env.",
    requires: ["compose-app"],
    conflicts: ["compose-postgres"],
    contributes: {
      composeServices: {
        db: [
          "  db:",
          "    image: mysql:8",
          "    container_name: db",
          "    environment:",
          "      MYSQL_ROOT_PASSWORD: root",
          "      MYSQL_DATABASE: app",
          "    volumes:",
          "      - dbdata:/var/lib/mysql",
          "    ports:",
          '      - "3306:3306"',
          "    networks:",
          "      - appnet",
        ].join("\n"),
      },
      composeVolumes: ["dbdata"],
    },
  },
  {
    id: "compose-sqlite-vol",
    category: "compose",
    label: "+ SQLite-volume (bind ./data → /data)",
    description: "Ingen db-service — bare et bind-mount så SQLite-filen overlever.",
    requires: ["compose-app"],
    contributes: {
      composeServices: {
        // utvider app-service-blokken via en egen merge i assemble (vi
        // legger den bare som en kommentar her — assemble plukker den opp).
        "_app_volumes": [
          "    # SQLite-fil persisteres til ./data på host",
          "    volumes:",
          "      - ./data:/data",
        ].join("\n"),
      },
    },
  },
];
