import { createFileRoute } from "@tanstack/react-router";
import { FileText, GraduationCap, Laptop, MessageCircle } from "lucide-react";

import lion from "@/assets/leon-asesorias.jpg.asset.json";
import { Orientador } from "@/components/orientador/Orientador";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Laura · Asesorías para artículos científicos en línea" },
      {
        name: "description",
        content:
          "Asesorías universitarias en línea para tus artículos científicos. Resuelve tus dudas con el orientador y escríbeme por WhatsApp.",
      },
      { property: "og:title", content: "Laura · Asesorías para artículos científicos en línea" },
      {
        property: "og:description",
        content: "Asesorías en línea para artículos científicos. Contáctame por WhatsApp.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const servicio = [
  {
    icon: FileText,
    title: "Artículos científicos",
    text: "Asesoría universitaria enfocada en tus artículos científicos.",
  },
  { icon: Laptop, title: "En línea", text: "Todas las asesorías son en línea, desde donde estés." },
  {
    icon: MessageCircle,
    title: "Trato directo por WhatsApp",
    text: "Agenda y resuelve tus dudas escribiéndome directamente.",
  },
];

const steps = [
  { n: "01", title: "Platica con el orientador", text: "Cuéntale sobre tu artículo y resuelve tus primeras dudas." },
  { n: "02", title: "Envía tu resumen", text: "Manda por WhatsApp el resumen de tu consulta con un toque." },
  { n: "03", title: "Agendamos tu asesoría", text: "Te respondo por WhatsApp y acordamos tu sesión en línea." },
];

function Index() {
  const waLink = buildWhatsAppLink();

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <a href="#inicio" className="flex items-center gap-2 font-display text-lg font-semibold">
            <GraduationCap className="h-6 w-6 text-primary" />
            Laura
            <span className="hidden font-sans text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase sm:inline">
              Asesorías universitarias
            </span>
          </a>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#servicio" className="transition-colors hover:text-primary">Servicio</a>
            <a href="#orientador" className="transition-colors hover:text-primary">Orientador</a>
            <a href="#contacto" className="transition-colors hover:text-primary">Contacto</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section id="inicio" className="relative flex min-h-[100svh] items-center">
        <img
          src={lion.url}
          alt="León con una cicatriz en el ojo mirando de frente"
          className="absolute inset-y-0 right-0 h-full w-full object-cover object-[50%_35%] md:w-[65%]"
        />
        <div className="absolute inset-0 bg-hero-fade max-md:bg-background/70" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-fade-up" />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-28 pb-20">
          <div className="max-w-xl animate-rise">
            <p className="eyebrow">Laura · Asesorías universitarias en línea</p>
            <h1 className="mt-5 text-5xl leading-[1.02] font-extrabold md:text-7xl">
              Cada artículo difícil
              <span className="block italic font-normal text-amber-gradient">te hace más fuerte.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">
              Asesorías en línea para tus artículos científicos. Resuelve tus dudas con el orientador y escríbeme
              por WhatsApp.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
                <WhatsAppIcon />
                Escríbeme por WhatsApp
              </a>
              <a href="#orientador" className="btn-ghost-line">Hablar con el orientador</a>
            </div>
          </div>
        </div>
      </section>

      {/* Servicio */}
      <section id="servicio" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="max-w-2xl">
          <div className="scar-line" />
          <p className="eyebrow mt-6">Servicio</p>
          <h2 className="mt-4 text-4xl font-semibold md:text-5xl">Te acompaño con tu artículo científico.</h2>
        </div>
        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
          {servicio.map(({ icon: Icon, title, text }) => (
            <div key={title} className="group bg-card p-8 transition-colors hover:bg-secondary">
              <Icon className="h-7 w-7 text-primary transition-transform group-hover:-translate-y-1" />
              <h3 className="mt-6 text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Orientador */}
      <section id="orientador" className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <p className="eyebrow">Orientador</p>
          <h2 className="mt-4 max-w-2xl text-4xl font-semibold md:text-5xl">Resuelve tus dudas antes de escribirme.</h2>
          <p className="mt-4 max-w-xl text-muted-foreground">
            El orientador responde solo con información confirmada de las asesorías. Lo que no sepa, lo anota en tu
            resumen para que yo te lo responda.
          </p>
          <div className="mt-12">
            <Orientador />
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <p className="eyebrow">Cómo funciona</p>
        <h2 className="mt-4 max-w-2xl text-4xl font-semibold md:text-5xl">Tres pasos para retomar el control.</h2>
        <ol className="mt-16 grid gap-12 md:grid-cols-3">
          {steps.map((s) => (
            <li key={s.n}>
              <span className="font-display text-6xl font-extrabold text-primary/30">{s.n}</span>
              <h3 className="mt-4 text-2xl font-semibold">{s.title}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA final */}
      <section id="contacto" className="px-6 pb-24 md:pb-32">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-border bg-card px-8 py-20 text-center md:px-16">
          <img
            src={lion.url}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover object-[50%_40%] opacity-20"
          />
          <div className="relative">
            <MessageCircle className="mx-auto h-10 w-10 text-primary" />
            <h2 className="mx-auto mt-6 max-w-2xl text-4xl font-semibold md:text-5xl">
              ¿Listo para avanzar con tu artículo?
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-lg text-muted-foreground">
              Soy Laura. Mándame un mensaje y cuéntame en qué te puedo ayudar; te respondo por WhatsApp.
            </p>
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-whatsapp mt-10">
              <WhatsAppIcon />
              Contactar por WhatsApp
            </a>
            <p className="mt-4 text-sm text-muted-foreground">656 359 0235</p>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground md:flex-row">
          <span className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary" /> Laura · Asesorías universitarias
          </span>
          <span>© {new Date().getFullYear()} · Todos los derechos reservados</span>
        </div>
      </footer>

      {/* Botón flotante de WhatsApp */}
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        className="fixed right-5 bottom-5 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-lg animate-pulse-ring transition-transform hover:scale-110"
      >
        <WhatsAppIcon className="h-8 w-8" />
      </a>
    </div>
  );
}
