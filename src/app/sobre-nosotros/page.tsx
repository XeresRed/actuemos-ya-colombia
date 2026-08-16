import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sobre Nosotros — ActuemosYaColombia',
  description: 'Conoce la misión, origen, principios de neutralidad y equipo fundador de ActuemosYaColombia, la plataforma cívica de respuesta rápida ante emergencias.',
};

export default function SobreNosotrosPage() {
  return (
    <div className="flex-grow w-full max-w-5xl mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-stack-xl space-y-4">
        <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary border border-secondary/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
          <span className="material-symbols-outlined text-sm">handshake</span>
          Iniciativa Cívica y Tecnológica Independiente
        </div>

        <h1 className="font-headline-lg text-3xl md:text-5xl font-black text-on-background tracking-tight">
          Tecnología y Solidaridad al Servicio de Colombia
        </h1>

        <p className="font-body-md text-base md:text-lg text-on-surface-variant leading-relaxed">
          ActuemosYa<span className="inline-flex font-bold"><span className="text-[#D97706]">Col</span><span className="text-secondary">omb</span><span className="text-primary">ia</span></span> nació con un propósito claro: transformar la voluntad ciudadana en acción humanitaria coordinada, transparente y sin intermediarios ante situaciones de desastre.
        </p>
      </div>

      {/* Grid: ¿Qué es?, ¿Para qué sirve?, ¿Por qué nació? */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-stack-xl">
        {/* Card 1 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm border-t-4 border-t-primary flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl">help_outline</span>
            </div>
            <h2 className="font-headline-md text-xl font-bold text-on-surface mb-2">
              ¿Qué es el sitio?
            </h2>
            <p className="font-body-md text-xs md:text-sm text-on-surface-variant leading-relaxed">
              Es una plataforma digital comunitaria, abierta y neutral desarrollada para responder de manera ágil e inmediata ante emergencias naturales (terremotos, inundaciones, deslizamientos) en cualquier región de Colombia.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-outline-variant/60 text-xs text-primary font-bold flex items-center gap-1">
            <span>100% Sin Ánimo de Lucro</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm border-t-4 border-t-secondary flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl">hub</span>
            </div>
            <h2 className="font-headline-md text-xl font-bold text-on-surface mb-2">
              ¿Para qué sirve?
            </h2>
            <p className="font-body-md text-xs md:text-sm text-on-surface-variant leading-relaxed">
              Centraliza ideas ciudadanas viables, canaliza talento profesional voluntario (médicos, ingenieros, rescatistas, operarios de drones) hacia ONGs en campo, guía en trámites legales de emergencia y conecta con soluciones ya existentes para <strong>no reinventar la rueda</strong>.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-outline-variant/60 text-xs text-secondary font-bold flex items-center gap-1">
            <span>Anti-Duplicación de Esfuerzos</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm border-t-4 border-t-[#D97706] flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl">electric_bolt</span>
            </div>
            <h2 className="font-headline-md text-xl font-bold text-on-surface mb-2">
              ¿Por qué nació?
            </h2>
            <p className="font-body-md text-xs md:text-sm text-on-surface-variant leading-relaxed">
              En las crisis humanitarias el mayor obstáculo no es la falta de solidaridad, sino la desorganización, el ruido informativo y la duplicidad de iniciativas. Nació para ofrecer un punto de encuentro cívico ordenado, verificado y accesible.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-outline-variant/60 text-xs text-amber-800 font-bold flex items-center gap-1">
            <span>Respuesta Rápida y Verificada</span>
          </div>
        </div>
      </div>

      {/* Principios de Neutralidad y Apolitismo */}
      <div className="bg-surface-container-high border-l-4 border-secondary rounded-r-2xl p-6 md:p-8 mb-stack-xl shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary text-3xl">policy</span>
          <h2 className="font-headline-md text-xl font-bold text-on-surface">
            Declaración de Neutralidad Cívica y Apolitismo
          </h2>
        </div>
        <p className="font-body-md text-xs md:text-sm text-on-surface-variant leading-relaxed">
          ActuemosYaColombia es una iniciativa estrictamente <strong>neutral, independiente y no partidista</strong>. No responde a agendas políticas, electorales, gubernamentales ni comerciales. Toda la información publicada es verificada por supervisores cívicos con el único fin de proteger la vida, coordinar ayuda humanitaria y fortalecer el tejido social.
        </p>
      </div>

      {/* Equipo Fundador */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 mb-stack-xl shadow-sm">
        <div className="border-b border-outline-variant pb-4 mb-6">
          <h2 className="font-headline-md text-2xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">groups</span>
            <span>Equipo Fundador e Impulsores</span>
          </h2>
          <p className="font-body-md text-xs md:text-sm text-on-surface-variant mt-1">
            Profesionales colombianos comprometidos con el uso de la ingeniería, los datos y la comunidad para salvar vidas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fundador 1: Juan Camilo Castaño */}
          <div className="bg-surface border border-outline-variant rounded-xl p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center gap-3.5 mb-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center text-lg border border-primary/20 shrink-0">
                  JC
                </div>
                <div>
                  <h3 className="font-headline-md text-base font-bold text-on-surface">
                    Juan Camilo Castaño Bonilla
                  </h3>
                  <p className="font-label-md text-xs text-primary font-semibold">
                    Desarrollador Senior de Software
                  </p>
                </div>
              </div>
              <p className="font-body-md text-xs text-on-surface-variant leading-relaxed mb-4">
                Arquitectura del sistema, resiliencia tecnológica, desarrollo backend/frontend y optimización para baja conectividad en zonas de desastre.
              </p>
            </div>

            <a
              href="https://www.linkedin.com/in/juan-camilo-castano-bonilla-819223182/?locale=es"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 py-2 px-4 bg-secondary text-on-secondary font-label-md text-xs font-bold rounded-lg hover:bg-secondary-container transition-colors shadow-sm"
            >
              <span>Conectar en LinkedIn</span>
              <span className="material-symbols-outlined text-xs">open_in_new</span>
            </a>
          </div>

          {/* Fundador 2: Juan David Nuñez */}
          <div className="bg-surface border border-outline-variant rounded-xl p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center gap-3.5 mb-3">
                <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary font-black flex items-center justify-center text-lg border border-secondary/20 shrink-0">
                  JN
                </div>
                <div>
                  <h3 className="font-headline-md text-base font-bold text-on-surface">
                    Juan David Nuñez Aljure
                  </h3>
                  <p className="font-label-md text-xs text-secondary font-semibold">
                    Articulación Comunitaria & Data Analyst
                  </p>
                </div>
              </div>
              <p className="font-body-md text-xs text-on-surface-variant leading-relaxed mb-4">
                Análisis de datos en emergencias, mapeo de necesidades en campo, articulación con colectivos cívicos y enlace con iniciativas locales.
              </p>
            </div>

            <a
              href="https://www.linkedin.com/in/juandnunezaljure?utm_source=share_via&utm_content=profile&utm_medium=member_android"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 py-2 px-4 bg-secondary text-on-secondary font-label-md text-xs font-bold rounded-lg hover:bg-secondary-container transition-colors shadow-sm"
            >
              <span>Conectar en LinkedIn</span>
              <span className="material-symbols-outlined text-xs">open_in_new</span>
            </a>
          </div>
        </div>
      </div>

      {/* Código Abierto y Filosofía */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 text-center space-y-4 shadow-sm">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface-container text-on-surface mx-auto">
          <span className="material-symbols-outlined text-2xl">code</span>
        </div>

        <h2 className="font-headline-md text-xl font-bold text-on-surface">
          Código Abierto: Todos Unidos Hacemos Más
        </h2>

        <p className="font-body-md text-xs md:text-sm text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          ActuemosYaColombia es software libre bajo licencia <strong>MIT</strong>. Cualquier colectivo, universidad o entidad puede auditar el código, aportar mejoras o replicar la infraestructura en cualquier rincón del mundo.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href="https://github.com/XeresRed/actuemos-ya-colombia"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-surface-container border border-outline text-on-surface font-label-md text-xs font-bold uppercase rounded-lg hover:bg-surface-container-high transition-colors inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">terminal</span>
            <span>Repositorio en GitHub</span>
          </a>

          <Link
            href="/voluntarios"
            className="px-5 py-2.5 bg-primary text-on-primary font-label-md text-xs font-bold uppercase rounded-lg hover:bg-primary-container transition-colors inline-flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">front_hand</span>
            <span>Unirme como Voluntario</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
