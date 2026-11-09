import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

const transcriptSchema = z.object({
  transcript: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        text: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(40),
});

export const resumirConsulta = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => transcriptSchema.parse(input))
  .handler(async ({ data }) => {
    const { summarizeConsulta } = await import("./orientador.server");
    return summarizeConsulta(getRequest(), data.transcript);
  });
