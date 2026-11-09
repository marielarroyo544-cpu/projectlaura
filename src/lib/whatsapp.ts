// Business WhatsApp contact. Mexican numbers use country code 52 + 10 digits.
export const WHATSAPP_COUNTRY_CODE = "52";
export const WHATSAPP_LOCAL_NUMBER = "6563590235";

export const DEFAULT_WHATSAPP_MESSAGE =
  "¡Hola! Vi tu página y me interesa una asesoría universitaria.";

export function buildWhatsAppLink(message: string = DEFAULT_WHATSAPP_MESSAGE): string {
  const digits = `${WHATSAPP_COUNTRY_CODE}${WHATSAPP_LOCAL_NUMBER}`.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
