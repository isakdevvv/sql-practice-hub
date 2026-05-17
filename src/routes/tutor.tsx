import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Trash2,
  Send,
  Lightbulb,
  Wrench,
  ListChecks,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { sendToTutor, type TutorMessage } from "@/lib/tutor/api";
import { buildTutorContext, type TutorContext } from "@/lib/tutor/context";

const STORAGE_KEY = "tutor-conversation-v1";

export const Route = createFileRoute("/tutor")({
  head: () => ({
    meta: [
      { title: "AI-tutor — SQL Sandbox" },
      {
        name: "description",
        content:
          "Personalisert AI-tutor som vet hva du har lært. Spør om SQL, Python, DTE-pensum og få neste-steg basert på din progresjon.",
      },
    ],
  }),
  component: TutorPage,
});

interface ChatMessage extends TutorMessage {
  /** Unix-ms — used as React key and ordering. */
  ts: number;
}

interface ShortcutPrompt {
  icon: typeof Lightbulb;
  label: string;
  hint: string;
  build: () => string;
}

const SHORTCUTS: ShortcutPrompt[] = [
  {
    icon: Lightbulb,
    label: "Forklar et konsept",
    hint: "Få en pedagogisk forklaring tilpasset ditt nivå.",
    build: () =>
      "Forklar et konsept jeg har slitt med basert på mine svake punkter. Bruk Sokratisk metode der det gir mening.",
  },
  {
    icon: ListChecks,
    label: "Lag en oppgave",
    hint: "Generer en oppgave som matcher ratingen din.",
    build: () =>
      "Lag en oppgave til meg som passer mitt nivå. Velg tema fra et av mine svake punkter, og still spørsmål før du gir fasit.",
  },
  {
    icon: Wrench,
    label: "Debug min kode",
    hint: "Lim inn kode under og få hjelp.",
    build: () =>
      "Hjelp meg å debugge denne koden:\n\n```\n// lim inn kode her\n```\n\nForklar hva som er galt og hvorfor.",
  },
  {
    icon: MessageCircle,
    label: "Gi tilbakemelding",
    hint: "Få konkret feedback på arbeidet ditt.",
    build: () =>
      "Gi meg tilbakemelding på det jeg har gjort i det siste basert på konteksten din om læringen min.",
  },
];

function loadConversation(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveConversation(msgs: ChatMessage[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
  } catch {
    /* quota — accept lossy */
  }
}

function TutorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState<TutorContext | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Initial load — done in useEffect so SSR renders empty.
  useEffect(() => {
    setMessages(loadConversation());
    setContext(buildTutorContext());
  }, []);

  // Persist on every change.
  useEffect(() => {
    if (messages.length > 0) saveConversation(messages);
  }, [messages]);

  // Auto-scroll to newest message.
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, sending]);

  const send = useCallback(
    async (rawText: string) => {
      const text = rawText.trim();
      if (!text || sending) return;
      setError(null);

      // Rebuild context fresh each turn — progress may have changed in another tab.
      const ctx = buildTutorContext();
      setContext(ctx);

      const userMsg: ChatMessage = { role: "user", content: text, ts: Date.now() };
      const next = [...messages, userMsg];
      setMessages(next);
      setInput("");
      setSending(true);

      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await sendToTutor({
          messages: next.map(({ role, content }) => ({ role, content })),
          context: ctx,
          signal: controller.signal,
        });
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: res.content, ts: Date.now() },
        ]);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setSending(false);
        abortRef.current = null;
      }
    },
    [messages, sending],
  );

  function clearConversation() {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(input);
    }
  }

  const summary = useMemo(() => context?.userSummary ?? "Laster kontekst…", [context]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      <div className="container mx-auto flex-1 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4 px-4 py-4 min-h-0">
        {/* Sidebar — shortcuts + summary */}
        <aside className="space-y-3 lg:sticky lg:top-[72px] lg:h-fit">
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-center gap-2 text-sm font-semibold mb-2">
              <Sparkles className="h-4 w-4 text-brand" />
              Spør om
            </div>
            <ul className="space-y-1.5">
              {SHORTCUTS.map((s) => {
                const Icon = s.icon;
                return (
                  <li key={s.label}>
                    <button
                      type="button"
                      onClick={() => void send(s.build())}
                      disabled={sending}
                      className="w-full text-left rounded-md border border-border bg-background hover:bg-accent disabled:opacity-50 transition-colors px-2.5 py-2 text-xs"
                    >
                      <div className="flex items-center gap-2 font-medium">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        {s.label}
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground leading-snug">
                        {s.hint}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-lg border border-border bg-card p-3 text-xs">
            <div className="font-semibold mb-1.5">Din kontekst</div>
            <p className="text-muted-foreground leading-snug">{summary}</p>
            {context && context.weakSpots.length > 0 && (
              <div className="mt-2">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Svake punkter
                </div>
                <ul className="mt-1 space-y-0.5">
                  {context.weakSpots.slice(0, 3).map((w) => (
                    <li key={w.skillId} className="truncate">
                      {w.navn}{" "}
                      <span className="text-muted-foreground">
                        ({w.rating.toFixed(1)}/5)
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </aside>

        {/* Chat */}
        <section className="flex flex-col rounded-lg border border-border bg-card min-h-0">
          <header className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand" />
              <h1 className="font-semibold text-sm">AI-tutor</h1>
              <span className="text-[10px] text-muted-foreground">
                claude-sonnet-4-5
              </span>
            </div>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={clearConversation}
              disabled={messages.length === 0 && !error}
              className="text-xs"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Tøm samtale
            </Button>
          </header>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-[400px] max-h-[calc(100vh-260px)]"
          >
            {messages.length === 0 && !sending && (
              <div className="text-center text-sm text-muted-foreground py-12">
                Start en samtale. Tutoren kjenner allerede til hva du har lært.
              </div>
            )}
            {messages.map((m) => (
              <MessageBubble key={m.ts} message={m} />
            ))}
            {sending && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Tutor tenker…
              </div>
            )}
            {error && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            )}
          </div>

          <div className="border-t border-border p-3">
            <div className="flex gap-2 items-end">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Spør om SQL, Python, eller hva du sliter med… (Enter sender, Shift+Enter = ny linje)"
                rows={3}
                className="flex-1 min-h-[68px] max-h-48 resize-y rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/60"
              />
              <Button
                type="button"
                onClick={() => void send(input)}
                disabled={sending || !input.trim()}
                className="h-10"
              >
                <Send className="h-4 w-4 mr-1.5" />
                Send
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
          isUser
            ? "bg-brand text-brand-foreground"
            : "bg-muted text-foreground"
        }`}
      >
        <RenderContent content={message.content} />
      </div>
    </div>
  );
}

/** Render the message content, turning [link:/foo] markers into clickable
 *  anchors. The marker text itself is replaced with a styled pill. */
function RenderContent({ content }: { content: string }) {
  const parts: (string | { href: string; label: string })[] = [];
  const re = /\[link:(\/[^\]\s]+)\]/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    if (m.index > last) parts.push(content.slice(last, m.index));
    parts.push({ href: m[1], label: m[1] });
    last = m.index + m[0].length;
  }
  if (last < content.length) parts.push(content.slice(last));

  return (
    <>
      {parts.map((p, i) =>
        typeof p === "string" ? (
          <span key={i}>{p}</span>
        ) : (
          <a
            key={i}
            href={p.href}
            className="inline-flex items-center rounded border border-current/30 bg-current/10 px-1.5 py-0.5 text-[11px] font-mono mx-0.5 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {p.label}
          </a>
        ),
      )}
    </>
  );
}
