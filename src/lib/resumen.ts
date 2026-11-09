import { buildWhatsAppLink } from "./whatsapp";

export type ResumenConsulta = {
  tema: string;
  necesidad: string;
  puntos: string[];
  pendientes: string[];
};

export function buildResumenMensaje(resumen: ResumenConsulta): string {
  const lines = [
    "¡Hola, Laura! Usé el orientador de tu página. Este es el resumen de mi consulta:",
    "",
    `*Tema:* ${resumen.tema}`,
    `*Lo que necesito:* ${resumen.necesidad}`,
  ];
  if (resumen.puntos.length > 0) {
    lines.push("", "*Lo que platicamos:*", ...resumen.puntos.map((p) => `• ${p}`));
  }
  if (resumen.pendientes.length > 0) {
    lines.push("", "*Dudas para ti:*", ...resumen.pendientes.map((p) => `• ${p}`));
  }
  return lines.join("\n");
}

export function buildResumenWhatsAppLink(resumen: ResumenConsulta): string {
  return buildWhatsAppLink(buildResumenMensaje(resumen));
}
