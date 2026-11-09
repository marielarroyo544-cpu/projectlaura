import { createOpenAI } from "@ai-sdk/openai";

import { createLovableAiGatewayRunIdFetch, getLovableAiGatewayRunId } from "./run-id.ts";

export const GATEWAY_BASE_URL = "https://ai.gateway.lovable.dev/v1";
export const ORIENTADOR_MODEL = "openai/gpt-6-astra";

// Request-scoped provider: never share between requests.
export function createGatewayProvider(request: Request, apiKey: string) {
  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: GATEWAY_BASE_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });
  return { provider, runIdFetch };
}

export const RESPONSES_OPTIONS = {
  openai: {
    forceReasoning: true,
    reasoningEffort: "low",
    reasoningSummary: "auto",
    store: false,
    include: ["reasoning.encrypted_content"],
  },
} as const;

export function gatewayErrorStatus(error: unknown): number | undefined {
  if (error && typeof error === "object" && "statusCode" in error) {
    const code = (error as { statusCode?: unknown }).statusCode;
    if (typeof code === "number") return code;
  }
  return undefined;
}

export function friendlyGatewayError(error: unknown): string {
  const status = gatewayErrorStatus(error);
  if (status === 429) return "El orientador está recibiendo muchas consultas. Intenta de nuevo en un momento.";
  if (status === 402 || status === 403)
    return "El orientador no está disponible por ahora. Escríbenos directamente por WhatsApp.";
  console.error("Orientador gateway error:", error);
  return "No pude responder en este momento. Intenta de nuevo o escríbenos por WhatsApp.";
}
