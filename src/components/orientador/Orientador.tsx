import { useChat } from "@ai-sdk/react";
import { useServerFn } from "@tanstack/react-start";
import { DefaultChatTransport, type UIMessage } from "ai";
import { ClipboardList, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import lion from "@/assets/leon-asesorias.jpg.asset.json";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { resumirConsulta } from "@/lib/orientador.functions";
import { buildResumenWhatsAppLink, type ResumenConsulta } from "@/lib/resumen";

const STORAGE_KEY = "orientador-consulta-v1";

type Stored = {
  messages: UIMessage[];
  resumen: { data: ResumenConsulta; basedOn: number } | null;
};

const SUGERENCIAS = [
  "¿Qué tipo de asesoría ofrecen?",
  "¿Las asesorías son en línea?",
  "¿Cuánto cuesta una asesoría?",
];

function textOf(m: UIMessage): string {
  return m.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("")
    .trim();
}

function readableError(err: Error | undefined): string | null {
  if (!err) return null;
  const msg = err.message || "";
  try {
    const parsed = JSON.parse(msg) as { error?: string };
    if (parsed.error) return parsed.error;
  } catch {
    /* not JSON */
  }
  return msg || "No pude responder en este momento. Intenta de nuevo.";
}

function LionAvatar({ size = "h-9 w-9" }: { size?: string }) {
  return (
    <div className={`${size} shrink-0 overflow-hidden rounded-full border border-primary/40`}>
      <img src={lion.url} alt="" aria-hidden="true" className="h-full w-full scale-[2.4] object-cover object-[72%_42%]" />
    </div>
  );
}

export function Orientador() {
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/orientador" }), []);
  const { messages, sendMessage, status, stop, setMessages, error, clearError } = useChat({ transport });
  const [resumen, setResumen] = useState<Stored["resumen"]>(null);
  const [resumenError, setResumenError] = useState<string | null>(null);
  const [resumiendo, setResumiendo] = useState(false);
  const loadedRef = useRef(false);
  const formWrapRef = useRef<HTMLDivElement>(null);
  const resumirFn = useServerFn(resumirConsulta);

  const busy = status === "submitted" || status === "streaming";

  // Restore the single saved consultation from this browser.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Stored;
        if (Array.isArray(saved.messages)) setMessages(saved.messages);
        if (saved.resumen) setResumen(saved.resumen);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    loadedRef.current = true;
  }, [setMessages]);

  // Persist after each completed turn.
  useEffect(() => {
    if (!loadedRef.current || busy) return;
    const data: Stored = { messages, resumen };
    if (messages.length === 0 && !resumen) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [messages, resumen, busy]);

  const focusInput = useCallback(() => {
    formWrapRef.current?.querySelector("textarea")?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (status === "ready" && messages.length > 0) focusInput();
  }, [status, messages.length, focusInput]);

  const send = (text: string) => {
    const clean = text.trim();
    if (!clean || busy) return;
    clearError();
    void sendMessage({ text: clean });
    focusInput();
  };

  const handleSubmit = (msg: PromptInputMessage) => send(msg.text);

  const transcript = messages
    .map((m) => ({ role: m.role, text: textOf(m) }))
    .filter((l): l is { role: "user" | "assistant"; text: string } =>
      (l.role === "user" || l.role === "assistant") && l.text.length > 0,
    );
  const canSummarize =
    !busy && !resumiendo && transcript.some((l) => l.role === "user") && transcript.some((l) => l.role === "assistant");
  const outdated = resumen !== null && messages.length > resumen.basedOn;

  const prepararResumen = async () => {
    if (!canSummarize) return;
    setResumiendo(true);
    setResumenError(null);
    try {
      const res = await resumirFn({ data: { transcript: transcript.slice(-40) } });
      if (res.ok) setResumen({ data: res.resumen, basedOn: messages.length });
      else setResumenError(res.error);
    } catch {
      setResumenError("No pude preparar el resumen. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setResumiendo(false);
    }
  };

  const nuevaConsulta = () => {
    stop();
    setMessages([]);
    setResumen(null);
    setResumenError(null);
    clearError();
    window.localStorage.removeItem(STORAGE_KEY);
  };

  const lastIsUser = messages.at(-1)?.role === "user";
  const errorText = readableError(error);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      {/* Chat */}
      <div className="flex h-[560px] flex-col overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <LionAvatar />
            <div>
              <p className="font-display text-lg leading-tight font-semibold">Orientador</p>
              <p className="text-xs text-muted-foreground">Responde solo con información confirmada</p>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={nuevaConsulta}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Nueva consulta
            </button>
          )}
        </div>

        <Conversation className="flex-1">
          <ConversationContent className="gap-6 px-5 py-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <LionAvatar size="h-16 w-16" />
                <div className="space-y-1">
                  <p className="font-display text-xl font-semibold">¿En qué te puedo orientar?</p>
                  <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                    Pregunta sobre las asesorías para tus artículos científicos. Al final te preparo un resumen
                    para enviarlo por WhatsApp.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <Message from={m.role} key={m.id}>
                  <MessageContent className="group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground">
                    {m.parts.map((p, i) =>
                      p.type === "text" ? (
                        m.role === "assistant" ? (
                          <MessageResponse key={i}>{p.text}</MessageResponse>
                        ) : (
                          <p key={i} className="whitespace-pre-wrap">
                            {p.text}
                          </p>
                        )
                      ) : null,
                    )}
                  </MessageContent>
                </Message>
              ))
            )}
            {status === "submitted" && lastIsUser && (
              <Message from="assistant">
                <MessageContent>
                  <Shimmer>Pensando…</Shimmer>
                </MessageContent>
              </Message>
            )}
            {errorText && !busy && (
              <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">
                {errorText}
              </p>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div ref={formWrapRef} className="space-y-3 border-t border-border p-4">
          {messages.length === 0 && (
            <Suggestions>
              {SUGERENCIAS.map((s) => (
                <Suggestion key={s} suggestion={s} onClick={send} />
              ))}
            </Suggestions>
          )}
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputTextarea placeholder="Escribe tu duda…" maxLength={2000} />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit status={status} onStop={stop} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>

      {/* Resumen */}
      <aside className="flex flex-col rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">Resumen de tu consulta</h3>
        </div>

        {resumen ? (
          <div className="mt-5 flex flex-1 flex-col">
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="eyebrow">Tema</dt>
                <dd className="mt-1 text-base">{resumen.data.tema}</dd>
              </div>
              <div>
                <dt className="eyebrow">Lo que necesitas</dt>
                <dd className="mt-1 text-muted-foreground">{resumen.data.necesidad}</dd>
              </div>
              {resumen.data.puntos.length > 0 && (
                <div>
                  <dt className="eyebrow">Lo que platicamos</dt>
                  <dd>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
                      {resumen.data.puntos.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
              {resumen.data.pendientes.length > 0 && (
                <div>
                  <dt className="eyebrow">Dudas para Laura</dt>
                  <dd>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
                      {resumen.data.pendientes.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
            </dl>

            <div className="mt-auto space-y-3 pt-6">
              {outdated && (
                <button
                  type="button"
                  onClick={prepararResumen}
                  disabled={!canSummarize}
                  className="btn-ghost-line w-full text-sm disabled:opacity-50"
                >
                  {resumiendo ? "Actualizando…" : "Incluir tus últimos mensajes"}
                </button>
              )}
              <a
                href={buildResumenWhatsAppLink(resumen.data)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp w-full"
              >
                <WhatsAppIcon /> Enviar por WhatsApp
              </a>
            </div>
          </div>
        ) : (
          <div className="mt-5 flex flex-1 flex-col">
            <p className="text-sm text-muted-foreground">
              Cuando termines de platicar con el orientador, prepara aquí un resumen de tu consulta y envíalo por
              WhatsApp con un solo toque.
            </p>
            <div className="mt-auto pt-6">
              {resumiendo ? (
                <div className="rounded-full border border-border px-4 py-3 text-center text-sm">
                  <Shimmer>Preparando resumen…</Shimmer>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={prepararResumen}
                  disabled={!canSummarize}
                  className="btn-ghost-line w-full disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Preparar resumen
                </button>
              )}
            </div>
          </div>
        )}
        {resumenError && (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {resumenError}
          </p>
        )}
      </aside>
    </div>
  );
}
