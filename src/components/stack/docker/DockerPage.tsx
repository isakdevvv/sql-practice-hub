import { Link } from "@tanstack/react-router";
import { Lightbulb, AlertTriangle } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Container vs VM — hva er forskjellen", anchor: "container-vm" },
  { title: "Image vs container — mal vs forekomst", anchor: "image-container" },
  { title: "Dockerfile — syntaks og direktiver", anchor: "dockerfile" },
  { title: "Layers og cache — hvorfor rekkefølge betyr alt", anchor: "layers" },
  { title: "Multi-stage builds — små images", anchor: "multistage" },
  { title: "docker compose — flere containere", anchor: "compose" },
  { title: "Networks og volumes", anchor: "network-volume" },
  { title: "Registries og best practice", anchor: "registry" },
];

export function DockerPage() {
  return (
    <StackPageShell title="Docker — containers, images, compose" group="stack">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DevOps · Phase 11.5
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Docker — containers, Dockerfile, compose, networks
          </h1>
          <p className="mt-3 text-muted-foreground">
            Docker pakker appen din + dependencies + kjøretid som ett image.
            Samme image kjører identisk overalt. Her er Dockerfile-syntaksen,
            hvorfor layer-rekkefølge betyr alt for byggetiden, og compose for
            flere samvirkende containere.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Drill:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgavene</Link>{" "}
              under «Docker» — Dockerfile-direktiver, layer-cache-quiz, multi-stage, networks, volumes.
            </div>
          </div>
        </div>

        <CourseOutline courseId="docker" steps={STEPS} />

        <section id="container-vm" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Container vs VM — hva er forskjellen</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En VM virtualiserer hardware: hver VM har sin egen kjerne, sitt
            eget OS. En container deler kjernen med verten og isolerer bare
            prosesser med Linux-features (namespaces, cgroups, chroot).
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`VM:                                  Container:
  +--------------------+               +--------------------+
  |  app + libs        |               |  app + libs        |
  |  guest OS (kjerne) |               |  (deler vert-kjerne)|
  |  hypervisor        |               |  container-runtime  |
  +--------------------+               +--------------------+
  |  vert OS (kjerne)  |               |  vert OS (kjerne)  |
  +--------------------+               +--------------------+

  - Tung (GB), treg start (min)        - Lett (MB), rask start (ms)
  - Sterkere isolasjon                 - Svakere isolasjon (deler kjerne)
  - Ulik kjerne mulig                  - Må matche vert-kjernens ABI`}</pre>
          </div>
          <p className="text-xs text-muted-foreground">
            <strong>Når VM, når container:</strong> trenger du å kjøre Windows
            på Linux-vert? VM. Trenger du å pakke en webapp så den er rask å
            starte og lett å skalere? Container.
          </p>
        </section>

        <section id="image-container" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Image vs container — mal vs forekomst</h2>
          <p className="text-sm text-muted-foreground mb-4">
            <strong>Image</strong> er en read-only mal (lagde lag, metadata).
            En <strong>container</strong> er en kjørende eller stoppet forekomst
            av et image, med et tynt read-write-lag på toppen.
          </p>

          <div className="overflow-x-auto rounded-lg border border-border mb-4">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Konsept</th>
                  <th className="text-left font-semibold px-4 py-2">OO-analogi</th>
                  <th className="text-left font-semibold px-4 py-2">CLI</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">image</td><td className="px-4 py-3 text-muted-foreground">Klasse</td><td className="px-4 py-3 font-mono text-xs">docker images, docker build</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">container</td><td className="px-4 py-3 text-muted-foreground">Instans</td><td className="px-4 py-3 font-mono text-xs">docker ps, docker run</td></tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Vanlige kommandoer
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Images
docker images                       # liste lokale images
docker pull nginx:1.27              # last ned fra registry
docker build -t myapp:1.0 .         # bygg fra Dockerfile i .
docker rmi myapp:1.0                # slett image

# Containers
docker run nginx                    # start container i forgrunn
docker run -d --name web nginx      # detach, gi navn
docker run -p 8080:80 nginx         # bind host:container-port
docker run -e DB_URL=postgres://... # env-vars
docker run -it ubuntu bash          # interactive + TTY

docker ps                           # kjørende containere
docker ps -a                        # alle, inkl. stoppede
docker logs web                     # se stdout/stderr
docker exec -it web sh              # shell inn i kjørende container
docker stop web && docker rm web    # rydd opp`}</pre>
          </div>
        </section>

        <section id="dockerfile" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Dockerfile — syntaks og direktiver</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En Dockerfile er en oppskrift. Hver instruksjon lager et nytt
            lag i imaget. Standard navn: <code>Dockerfile</code>.
          </p>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Minimal Python-app
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# syntax=docker/dockerfile:1
FROM python:3.12-slim              # base-image

WORKDIR /app                       # cd /app (lages om ikke finnes)

# Dependencies FØRST — for cache-treff (se neste seksjon)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Kode
COPY ./src ./src

# Ikke kjør som root
RUN useradd --uid 1000 app && chown -R app /app
USER app

ENV PORT=8000                      # default env
EXPOSE 8000                        # dokumentasjon (ikke binding)

CMD ["python", "-m", "src.main"]   # default kommando`}</pre>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border mb-4">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Direktiv</th>
                  <th className="text-left font-semibold px-4 py-2">Gjør</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">FROM</td><td className="px-4 py-3 text-muted-foreground">Base-image å bygge på. Første direktiv.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">WORKDIR</td><td className="px-4 py-3 text-muted-foreground">Setter cwd for alle påfølgende kommandoer.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">COPY</td><td className="px-4 py-3 text-muted-foreground">Kopierer fra build-context inn i imaget.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">RUN</td><td className="px-4 py-3 text-muted-foreground">Kjør kommando under build (skaper et nytt lag).</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">CMD</td><td className="px-4 py-3 text-muted-foreground">Default-kommando når container starter. Kan overskrives på <code>docker run</code>.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">ENTRYPOINT</td><td className="px-4 py-3 text-muted-foreground">Selve eksekverbaren — argumenter fra CMD/CLI legges til.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">EXPOSE</td><td className="px-4 py-3 text-muted-foreground">Dokumenterer hvilken port appen lytter på. Binder ikke.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">ENV</td><td className="px-4 py-3 text-muted-foreground">Sett env-variabel som <em>finnes ved kjøring</em>.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">ARG</td><td className="px-4 py-3 text-muted-foreground">Build-time variabel. Finnes IKKE i kjørende container (med mindre du `ENV X=$X`).</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">USER</td><td className="px-4 py-3 text-muted-foreground">Bytt til ikke-root-bruker for påfølgende kommandoer + run.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">VOLUME</td><td className="px-4 py-3 text-muted-foreground">Marker en sti som volum-mount-punkt (anonymt volum).</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">HEALTHCHECK</td><td className="px-4 py-3 text-muted-foreground">Kommando Docker kjører periodisk for å sjekke at appen er sunn.</td></tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              CMD vs ENTRYPOINT
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Bare CMD:
CMD ["python", "app.py"]
# docker run myapp                          → python app.py
# docker run myapp bash                     → bash  (overskrev CMD)

# ENTRYPOINT + CMD:
ENTRYPOINT ["python"]
CMD ["app.py"]
# docker run myapp                          → python app.py
# docker run myapp script.py                → python script.py  (CMD overskrev)

# Bare ENTRYPOINT (lås kommandoen):
ENTRYPOINT ["python", "app.py"]
# docker run myapp                          → python app.py
# docker run myapp bash                     → python app.py bash  (bash blir argument)`}</pre>
          </div>
        </section>

        <section id="layers" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Layers og cache — hvorfor rekkefølge betyr alt</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Hver Dockerfile-instruksjon lager et lag. Docker cacher hvert lag.
            Når en instruksjon endrer seg, må <em>den og alle påfølgende</em>{" "}
            kjøres på nytt. Derfor: legg det som endrer seg sjelden, tidlig.
          </p>

          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            <div className="rounded-xl border border-warning/40 bg-warning/5 p-5">
              <div className="text-xs uppercase tracking-wider text-warning font-semibold mb-2">
                Dårlig — invalidiserer cache
              </div>
              <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`FROM python:3.12-slim
WORKDIR /app
COPY . .                          # endrer seg ofte
RUN pip install -r requirements.txt
# → pip install kjører på nytt
#   hver gang noen kode-fil endres`}</pre>
            </div>
            <div className="rounded-xl border border-success/40 bg-success/5 p-5">
              <div className="text-xs uppercase tracking-wider text-success font-semibold mb-2">
                Bra — utnytter cache
              </div>
              <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .           # endrer seg sjelden
RUN pip install -r requirements.txt
COPY . .                          # endrer seg ofte
# → pip install gjenbrukes til
#   requirements.txt endres`}</pre>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Slå flere RUN i én for å redusere lag
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Hvert RUN = ett lag. Kombiner relaterte steg + rydd opp i samme RUN.
RUN apt-get update \\
 && apt-get install -y --no-install-recommends curl ca-certificates \\
 && rm -rf /var/lib/apt/lists/*
# Hvis du rydder i et SENERE RUN, er filene fortsatt i det forrige laget.`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Sjekk cache-bruk:</strong> <code>docker build --progress=plain .</code>{" "}
            viser «CACHED» foran lag som ble gjenbrukt.
          </p>
        </section>

        <section id="multistage" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Multi-stage builds — små images</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Du trenger kompilatorer og dev-libs for å bygge, men ikke for å
            kjøre. Multi-stage bygger i én stage, kopierer artefakter til en
            slank runtime-stage. Resultat: image fra 900 MB til 120 MB.
          </p>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Go-eksempel
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Stage 1: build
FROM golang:1.22 AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /out/server ./cmd/server

# Stage 2: runtime (distroless — ingen shell, minimalt angrep-flate)
FROM gcr.io/distroless/static:nonroot
COPY --from=build /out/server /server
USER nonroot:nonroot
EXPOSE 8080
ENTRYPOINT ["/server"]`}</pre>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Node — bare ts/dist + node_modules som prod-deps
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`FROM node:22 AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:22 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-slim AS runtime
WORKDIR /app
COPY --from=deps  /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
USER node
CMD ["node", "dist/main.js"]`}</pre>
          </div>
        </section>

        <section id="compose" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. docker compose — flere containere</h2>
          <p className="text-sm text-muted-foreground mb-4">
            <code>docker compose</code> orkestrerer flere containere som hører
            sammen — web, db, cache — via én YAML-fil. Perfekt for lokal dev.
          </p>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              compose.yaml
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`services:
  web:
    build: .                       # bygg fra Dockerfile i .
    ports:
      - "8000:8000"                # host:container
    environment:
      DATABASE_URL: postgres://app:s3cret@db:5432/app
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./src:/app/src             # bind-mount for live reload

  db:
    image: postgres:16
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: s3cret
      POSTGRES_DB: app
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app"]
      interval: 5s
      retries: 5

volumes:
  pgdata:                          # navngitt volum — overlever rebuild`}</pre>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`docker compose up               # start alt
docker compose up -d            # i bakgrunn
docker compose up --build       # bygg på nytt før start
docker compose logs -f web      # følg logs for én service
docker compose exec web bash    # shell inn i web-container
docker compose down             # stopp + slett containere
docker compose down -v          # ... og navngitte volumer (KAST DATA)`}</pre>
          </div>
        </section>

        <section id="network-volume" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Networks og volumes</h2>

          <h3 className="text-lg font-semibold mb-2">Networks</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Containere snakker sammen over Docker-nettverk. Hver container
            får et navn som DNS-løses innenfor samme nettverk — så{" "}
            <code>web</code> kan koble til <code>db:5432</code> uten å vite
            IP-en.
          </p>

          <div className="overflow-x-auto rounded-lg border border-border mb-4">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-28">Driver</th>
                  <th className="text-left font-semibold px-4 py-2">Bruk</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">bridge</td><td className="px-4 py-3 text-muted-foreground">Default. Eget subnet, NAT-et til verten. Vanligvis det du vil ha.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">host</td><td className="px-4 py-3 text-muted-foreground">Ingen nettverks-isolasjon — container deler vertens nettverk-stack. Rask, men ingen port-mapping.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">none</td><td className="px-4 py-3 text-muted-foreground">Container har ingen nettverkstilkobling.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">overlay</td><td className="px-4 py-3 text-muted-foreground">For Swarm — containere på flere verter snakker sammen.</td></tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-semibold mb-2">Volumes vs bind-mounts</h3>
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Volume (navngitt)
              </div>
              <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`docker volume create pgdata
docker run -v pgdata:/var/lib/postgresql/data postgres`}</pre>
              <p className="mt-2 text-xs text-muted-foreground">
                Docker administrerer lagring. Best for persistent data (DB,
                uploads). Portabelt på tvers av vert-OS.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Bind-mount
              </div>
              <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`docker run -v $(pwd)/src:/app/src myapp`}</pre>
              <p className="mt-2 text-xs text-muted-foreground">
                Mapper en sti på verten direkte inn i containeren. Best for
                live-reload i dev. Skjør i prod (sti finnes kanskje ikke).
              </p>
            </div>
          </div>
        </section>

        <section id="registry" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Registries og best practice</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En <strong>registry</strong> er en server som hoster images. Docker
            Hub er default; selskaper bruker ofte GHCR, ECR, GCR, eller en
            privat registry.
          </p>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Tag og push til Docker Hub:
docker login
docker tag myapp:1.0 isakdev/myapp:1.0
docker push isakdev/myapp:1.0

# Tag og push til GHCR:
docker tag myapp:1.0 ghcr.io/isakdev/myapp:1.0
docker push ghcr.io/isakdev/myapp:1.0

# Pull et image:
docker pull ghcr.io/isakdev/myapp:1.0`}</pre>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              .dockerignore — hold konteksten liten
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Filer Docker IKKE skal sende til daemon ved build:
node_modules
.git
.env
*.log
__pycache__
dist
.venv
# Mindre build-kontekst → raskere builds + mindre risiko for å lekke
# .env eller hemmeligheter inn i imaget ved en COPY . . .`}</pre>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border mb-4">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-44">Best practice</th>
                  <th className="text-left font-semibold px-4 py-2">Hvorfor</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 text-muted-foreground">Pin base-image til en tag (eks. <code>python:3.12-slim</code>) — ikke <code>:latest</code></td><td className="px-4 py-3 text-muted-foreground">Reproduserbart. <code>:latest</code> kan endre seg under deg.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 text-muted-foreground">Kjør som ikke-root (<code>USER app</code>)</td><td className="px-4 py-3 text-muted-foreground">Hvis appen kompromitteres, har angriperen ikke root i containeren.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 text-muted-foreground">Bruk multi-stage</td><td className="px-4 py-3 text-muted-foreground">Mindre image, mindre angreps­flate, raskere pull.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 text-muted-foreground">Skann med <code>docker scout cves</code> eller Trivy</td><td className="px-4 py-3 text-muted-foreground">Finn kjente sårbarheter før de havner i prod.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 text-muted-foreground">Aldri kopier <code>.env</code> inn i image — bruk runtime env eller secrets</td><td className="px-4 py-3 text-muted-foreground">Images er ofte delt; hemmeligheter i lag er for evig.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 text-muted-foreground">En prosess per container</td><td className="px-4 py-3 text-muted-foreground">Skalering, observability og signal-håndtering forutsetter det.</td></tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-lg border border-warning/40 bg-warning/5 p-4 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Sårbarheter:</span>{" "}
              <code>docker scout cves myimage:1.0</code> lister kjente CVE-er
              i alle lag. En typisk fix er å bumpe base-image (<code>python:3.12-slim</code>{" "}
              → ny patch-versjon).
            </div>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "linux-cli-advanced" }} className="text-brand hover:underline">
                Linux-CLI advanced
              </Link>
              {" "}— sed, awk, jq, prosess-debugging i container.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "api-deploy" }} className="text-brand hover:underline">
                Deploy — CI/CD og observability
              </Link>
              {" "}— fra docker push til kjørende i prod.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
