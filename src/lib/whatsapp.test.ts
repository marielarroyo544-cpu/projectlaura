import { describe, expect, it } from "vitest";

import { buildWhatsAppLink } from "./whatsapp";

describe("WhatsApp contact link", () => {
  it("opens a chat with the business number 656 359 0235 (México, +52)", () => {
    const url = new URL(buildWhatsAppLink());
    expect(url.origin).toBe("https://wa.me");
    expect(url.pathname).toBe("/526563590235");
  });

  it("pre-fills the visitor's message", () => {
    const url = new URL(buildWhatsAppLink("Quiero ayuda con cálculo"));
    expect(url.searchParams.get("text")).toBe("Quiero ayuda con cálculo");
  });
});
