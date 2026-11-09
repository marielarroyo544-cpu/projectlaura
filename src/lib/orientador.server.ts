import { convertToModelMessages, NoObjectGeneratedError, Output, streamText, type UIMessage } from "ai";
import { z } from "zod";

import { CONFIRMED_FACTS } from "./asesorias-info";
import {
  createGatewayProvider,
  friendlyGatewayError,
  ORIENTADOR_MODEL,
  RESPONSES_OPTIONS,
} from "./ai/gateway.server";
import { withLovableAiGatewayRunIdHeader } from "./ai/run-id.ts";
import type { ResumenConsulta } from "./resumen";

const MAX_MESSAGES = 40;
const MAX_TEXT = 2000;

const FACTS = CONFIRMED_FACTS.map((f) => `- ${f}`).join("\n");

const ORIENTADOR_INSTRUCTIONS = `Eres el orientador de la página de Laura, asesorías universitarias. Atiendes a visitantes que tienen dudas sobre las asesorías.

INFORMACIÓN CONFIRMADA (lo único que sabes del servicio):
${FACTS}

REGLAS:
- Usa SOLO la información confirmada. Nunca inventes precios, horarios, plataformas, duración, plazos, garantías, experiencia del asesor ni temas específicos.
- Si te preguntan algo que no está confirmado, dilo con claridad ("eso no lo tengo confirmado") y sugiere preguntarlo por WhatsApp; ofrece anotarlo en el resumen de la consulta.
- No hagas el trabajo académico (no redactes, corrijas ni expliques contenido del artículo). Para eso es la asesoría.
- Ayuda al visitante a describir su necesidad: puedes preguntarle, una cosa a la vez, sobre qué trata su artículo, en qué etapa va y si tiene fecha de entrega.
- Cuando ya se entienda su necesidad, recuérdale que puede presionar "Preparar resumen" y enviarlo por WhatsApp.
- Responde en español, cálido y breve (2 a 4 oraciones). Sin listas largas.`;

const SUMMARY_INSTRUCTIONS = `Resume una consulta entre un visitante y el orientador de las asesorías de Laura.
Usa SOLO lo que dijo el visitante y lo que respondió el orientador; no agregues nada.
- tema: máximo 8 palabras.
- necesidad: 1 o 2 oraciones en primera persona, como si las escribiera el visitante.
- puntos: hasta 4 datos concretos que dio el visitante (vacío si no hay).
- pendientes: hasta 4 preguntas del visitante que el orientador no pudo responder y debe responder Laura, en primera persona (vacío si no hay).
Escribe en español.`;

const uiMessagesSchema = z
  .array(
    z
      .object({
        id: z.string().max(200),
        role: z.enum(["user", "assistant"]),
        parts: z.array(z.record(z.unknown())).max(50),
      })
      .passthrough(),
  )
  .min(1)
  .max(MAX_MESSAGES);

export async function handleOrientadorChat(request: Request): Promise<Response> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return Response.json({ error: "El orientador no está configurado." }, { status: 500 });

  let messages: UIMessage[];
  try {
    const body = (await request.json()) as { messages?: unknown };
    const parsed = uiMessagesSchema.parse(body.messages);
    messages = parsed as unknown as UIMessage[];
    for (const m of messages) {
      for (const p of m.parts) {
        if (p.type === "text" && p.text.length > MAX_TEXT) throw new Error("Mensaje demasiado largo");
      }
    }
  } catch {
    return Response.json({ error: "Consulta no válida." }, { status: 400 });
  }

  const { provider, runIdFetch } = createGatewayProvider(request, apiKey);
  const result = streamText({
    model: provider.responses(ORIENTADOR_MODEL),
    instructions: ORIENTADOR_INSTRUCTIONS,
    messages: await convertToModelMessages(messages),
    abortSignal: request.signal,
    providerOptions: RESPONSES_OPTIONS,
  });

  return withLovableAiGatewayRunIdHeader(
    result.toUIMessageStreamResponse({
      originalMessages: messages,
      sendReasoning: false,
      onError: friendlyGatewayError,
    }),
    runIdFetch,
  );
}

const summarySchema = z.object({
  tema: z.string(),
  necesidad: z.string(),
  puntos: z.array(z.string()),
  pendientes: z.array(z.string()),
});

export type TranscriptLine = { role: "user" | "assistant"; text: string };

export async function summarizeConsulta(
  request: Request,
  transcript: TranscriptLine[],
): Promise<{ ok: true; resumen: ResumenConsulta } | { ok: false; error: string }> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return { ok: false, error: "El orientador no está configurado." };

  const conversation = transcript
    .map((l) => `${l.role === "user" ? "Visitante" : "Orientador"}: ${l.text}`)
    .join("\n\n");

  const { provider } = createGatewayProvider(request, apiKey);
  try {
    const result = streamText({
      model: provider.responses(ORIENTADOR_MODEL),
      instructions: SUMMARY_INSTRUCTIONS,
      messages: [{ role: "user", content: conversation }],
      output: Output.object({ schema: summarySchema }),
      abortSignal: request.signal,
      providerOptions: RESPONSES_OPTIONS,
    });
    const out = await result.output;
    return {
      ok: true,
      resumen: {
        tema: out.tema.trim(),
        necesidad: out.necesidad.trim(),
        puntos: out.puntos.map((p) => p.trim()).filter(Boolean).slice(0, 4),
        pendientes: out.pendientes.map((p) => p.trim()).filter(Boolean).slice(0, 4),
      },
    };
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      console.error("Resumen sin formato válido:", error.text);
      return { ok: false, error: "No pude preparar el resumen. Intenta de nuevo." };
    }
    return { ok: false, error: friendlyGatewayError(error) };
  }
}
