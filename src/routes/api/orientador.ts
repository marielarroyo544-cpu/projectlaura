import { createFileRoute } from "@tanstack/react-router";

import { handleOrientadorChat } from "@/lib/orientador.server";

export const Route = createFileRoute("/api/orientador")({
  server: { handlers: { POST: ({ request }) => handleOrientadorChat(request) } },
});
