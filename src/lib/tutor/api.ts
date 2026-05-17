// Tutor API wrapper. Calls Claude directly from the browser if a key is
// configured, otherwise returns a deterministic placeholder so the chat UI
// still works for screenshots/onboarding.
//
// Single-user platform: the Anthropic key lives in .env.local exposed as
// VITE_ANTHROPIC_API_KEY. This is fine here because the deployed build runs
// only locally for one user — DO NOT deploy this file as-is to a multi-user
// host, the key would be readable in the bundle.

import type { TutorContext } from "./context";

export interface TutorMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface SendOpts {
  messages: TutorMessage[];
  context: TutorContext;
  /** Override the default model. Defaults to TUTOR_MODEL. */
  model?: string;
  /** AbortSignal so the UI can cancel long requests. */
  signal?: AbortSignal;
}

export interface TutorResponse {
  content: string;
  /** Lagre om tutoren foreslo en konkret oppgave-id eller stack-side. */
  suggestedActions?: { kind: "open-exercise" | "open-stack-side" | "open-skill"; id: string }[];
}

export const TUTOR_MODEL = "claude-sonnet-4-5";
const MAX_TOKENS = 2000;
const TEMPERATURE = 0.7;

const SYSTEM_PROMPT_TEMPLATE = `Du er en pedagogisk AI-tutor på en lærings-platform for DTE-bachelor (datateknikk) ved UiT.

Du har full kontekst på brukerens læring (se TutorContext under). Bruk den til å:
- Tilpasse vanskelighetsgrad basert på rating
- Anbefale neste-steg fra weakSpots
- Referere til konkret innhold på platformen
- IKKE bare gi svar — bruk Sokratisk metode for konsepter brukeren bør oppdage selv

Norsk språk. Vær konsis. Tilbake-pek til konkrete oppgaver eller stack-sider når relevant (bruk format [link:/python#py-flask-hello] som kan bli klikkbar).

USER CONTEXT:
{context-json}`;

function buildSystemPrompt(context: TutorContext): string {
  return SYSTEM_PROMPT_TEMPLATE.replace("{context-json}", JSON.stringify(context, null, 2));
}

/** Parse [link:/foo#bar] markers out of an assistant reply into structured
 *  actions. We keep the markers in the text — the UI renders them as buttons. */
function extractSuggestedActions(content: string): TutorResponse["suggestedActions"] {
  const actions: NonNullable<TutorResponse["suggestedActions"]> = [];
  const re = /\[link:(\/[^\]\s]+)\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const href = m[1];
    let kind: "open-exercise" | "open-stack-side" | "open-skill";
    if (href.startsWith("/stack")) kind = "open-stack-side";
    else if (href.startsWith("/skill") || href.includes("#skill-")) kind = "open-skill";
    else kind = "open-exercise";
    actions.push({ kind, id: href });
  }
  return actions.length > 0 ? actions : undefined;
}

function getApiKey(): string | undefined {
  // Vite exposes VITE_-prefixed env vars on import.meta.env.
  // typeof check keeps this safe in SSR/test environments.
  if (typeof import.meta === "undefined") return undefined;
  const env = (import.meta as unknown as { env?: Record<string, string> }).env;
  return env?.VITE_ANTHROPIC_API_KEY;
}

export async function sendToTutor(opts: SendOpts): Promise<TutorResponse> {
  const key = getApiKey();
  if (!key) {
    return {
      content:
        "AI-tutor er konfigurert men trenger API-nøkkel. Se README for hvordan du legger VITE_ANTHROPIC_API_KEY i .env.local.",
    };
  }

  // Strip any system messages from the message list — Anthropic's API takes
  // system as a top-level field, not inside messages[].
  const userTurns = opts.messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  const body = {
    model: opts.model ?? TUTOR_MODEL,
    max_tokens: MAX_TOKENS,
    temperature: TEMPERATURE,
    system: buildSystemPrompt(opts.context),
    messages: userTurns,
  };

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      // Required when calling the API directly from a browser.
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify(body),
    signal: opts.signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Tutor API ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    content?: { type: string; text?: string }[];
  };
  const text =
    data.content
      ?.filter((b) => b.type === "text")
      .map((b) => b.text ?? "")
      .join("\n")
      .trim() ?? "";

  return {
    content: text || "(Tomt svar fra tutor.)",
    suggestedActions: extractSuggestedActions(text),
  };
}
