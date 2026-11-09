import { describe, expect, it } from "vitest";

import { buildResumenWhatsAppLink } from "./resumen";

describe("Resumen de la consulta por WhatsApp", () => {
  const resumen = {
    tema: "Artículo sobre biología marina",
    necesidad: "Necesito ayuda para estructurar mi artículo.",
    puntos: ["Es para una revista universitaria"],
    pendientes: ["¿Cuánto cuesta la asesoría?"],
  };

  it("se envía al WhatsApp del negocio (+52 656 359 0235)", () => {
    const url = new URL(buildResumenWhatsAppLink(resumen));
    expect(url.pathname).toBe("/526563590235");
  });

  it("incluye el tema y las dudas pendientes del visitante", () => {
    const text = new URL(buildResumenWhatsAppLink(resumen)).searchParams.get("text") ?? "";
    expect(text).toContain("Artículo sobre biología marina");
    expect(text).toContain("¿Cuánto cuesta la asesoría?");
  });
});
