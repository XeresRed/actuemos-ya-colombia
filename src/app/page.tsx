import React from 'react';
import Link from 'next/link';

export default function EmergencyHubPage() {
  return (
    <div className="flex-grow flex flex-col items-center w-full px-margin-mobile md:px-margin-desktop py-stack-md gap-stack-lg max-w-7xl mx-auto">
      {/* Search Header for Mobile / Quick Search */}
      <div className="w-full">
        <div className="relative w-full max-w-2xl mx-auto">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
            search
          </span>
          <input
            className="w-full pl-12 pr-4 py-3 border border-outline-variant rounded bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary text-body-md font-body-md outline-none shadow-sm"
            placeholder="Buscar ideas comunitarias, personas, mascotas o iniciativas..."
            type="text"
          />
        </div>
      </div>

      {/* High Priority Direct Access Grid */}
      <section className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter" aria-label="Accesos directos de emergencia">
        <Link
          href="/ideas/nueva"
          className="bg-primary text-on-primary p-stack-md rounded-lg flex flex-col items-center justify-center gap-stack-sm hover:bg-primary-container transition-all shadow-sm hover:shadow-md h-32 md:h-40 group active:scale-95"
        >
          <span className="material-symbols-outlined text-4xl group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>
            add_circle
          </span>
          <span className="font-label-md text-label-md font-bold uppercase text-center tracking-wide">
            Proponer Idea
          </span>
        </Link>

        <Link
          href="/busqueda"
          className="bg-surface border-2 border-secondary text-secondary p-stack-md rounded-lg flex flex-col items-center justify-center gap-stack-sm hover:bg-secondary-container hover:text-on-secondary-container transition-all shadow-sm hover:shadow-md h-32 md:h-40 group active:scale-95"
        >
          <span className="material-symbols-outlined text-4xl group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>
            person_search
          </span>
          <span className="font-label-md text-label-md font-bold uppercase text-center tracking-wide">
            Buscar Personas/Mascotas
          </span>
        </Link>

        <Link
          href="/iniciativas"
          className="bg-tertiary-fixed text-on-tertiary-fixed p-stack-md rounded-lg flex flex-col items-center justify-center gap-stack-sm hover:bg-tertiary-fixed-dim transition-all shadow-sm hover:shadow-md h-32 md:h-40 group active:scale-95"
        >
          <span className="material-symbols-outlined text-4xl group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>
            trending_up
          </span>
          <span className="font-label-md text-label-md font-bold uppercase text-center tracking-wide">
            Iniciativas en Marcha
          </span>
        </Link>

        <Link
          href="/voluntarios"
          className="bg-surface border border-outline text-on-surface p-stack-md rounded-lg flex flex-col items-center justify-center gap-stack-sm hover:bg-surface-variant transition-all shadow-sm hover:shadow-md h-32 md:h-40 group active:scale-95"
        >
          <span className="material-symbols-outlined text-4xl group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>
            handshake
          </span>
          <span className="font-label-md text-label-md font-bold uppercase text-center tracking-wide">
            Ofrecer Habilidad
          </span>
        </Link>
      </section>

      {/* Official Colombian Relief & Victim Registries */}
      <section className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-stack-md" aria-label="Canales oficiales y registro de víctimas">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 pb-2 border-b border-outline-variant">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              verified_user
            </span>
            <div>
              <h2 className="font-headline-md text-base sm:text-lg font-bold text-on-surface">
                Canales Oficiales y Registro de Víctimas / Damnificados
              </h2>
              <p className="font-body-md text-xs text-on-surface-variant">
                Portales oficiales del Estado Colombiano y organismos de socorro nacional
              </p>
            </div>
          </div>
          <span className="font-label-sm text-[11px] bg-secondary-fixed text-on-secondary-fixed font-bold px-2 py-0.5 rounded uppercase">
            Fuentes Oficiales
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* UNGRD RUND */}
          <a
            href="http://portal.gestiondelriesgo.gov.co/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-surface hover:bg-surface-container p-3 rounded border border-outline-variant flex flex-col justify-between gap-2 transition-colors group"
          >
            <div>
              <div className="flex items-center justify-between text-primary font-bold text-xs">
                <span>UNGRD — RUND</span>
                <span className="material-symbols-outlined text-xs group-hover:translate-x-0.5 transition-transform">open_in_new</span>
              </div>
              <p className="font-label-md text-sm font-bold text-on-surface mt-1">
                Sala de Crisis y Damnificados
              </p>
              <p className="font-body-md text-xs text-on-surface-variant mt-0.5">
                Censo oficial y registro único nacional de damnificados.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-secondary">gestiondelriesgo.gov.co →</span>
          </a>

          {/* Cruz Roja Colombiana */}
          <a
            href="https://cruzrojacolombiana.org"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-surface hover:bg-surface-container p-3 rounded border border-outline-variant flex flex-col justify-between gap-2 transition-colors group"
          >
            <div>
              <div className="flex items-center justify-between text-primary font-bold text-xs">
                <span>Cruz Roja (Línea 132)</span>
                <span className="material-symbols-outlined text-xs group-hover:translate-x-0.5 transition-transform">open_in_new</span>
              </div>
              <p className="font-label-md text-sm font-bold text-on-surface mt-1">
                Búsqueda Familiar (RCF)
              </p>
              <p className="font-body-md text-xs text-on-surface-variant mt-0.5">
                Restablecimiento de contacto y atención médica de urgencia.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-secondary">cruzrojacolombiana.org →</span>
          </a>

          {/* Unidad para las Víctimas (RUV) */}
          <a
            href="https://www.unidadvictimas.gov.co/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-surface hover:bg-surface-container p-3 rounded border border-outline-variant flex flex-col justify-between gap-2 transition-colors group"
          >
            <div>
              <div className="flex items-center justify-between text-primary font-bold text-xs">
                <span>Unidad para las Víctimas</span>
                <span className="material-symbols-outlined text-xs group-hover:translate-x-0.5 transition-transform">open_in_new</span>
              </div>
              <p className="font-label-md text-sm font-bold text-on-surface mt-1">
                Plataforma RUV
              </p>
              <p className="font-body-md text-xs text-on-surface-variant mt-0.5">
                Registro Único de Víctimas y orientación humanitaria.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-secondary">unidadvictimas.gov.co →</span>
          </a>

          {/* Defensa Civil Colombiana */}
          <a
            href="https://www.defensacivil.gov.co/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-surface hover:bg-surface-container p-3 rounded border border-outline-variant flex flex-col justify-between gap-2 transition-colors group"
          >
            <div>
              <div className="flex items-center justify-between text-primary font-bold text-xs">
                <span>Defensa Civil (Línea 144)</span>
                <span className="material-symbols-outlined text-xs group-hover:translate-x-0.5 transition-transform">open_in_new</span>
              </div>
              <p className="font-label-md text-sm font-bold text-on-surface mt-1">
                Operaciones de Rescate
              </p>
              <p className="font-body-md text-xs text-on-surface-variant mt-0.5">
                Búsqueda, rescate en colapso y albergues provisionales.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-secondary">defensacivil.gov.co →</span>
          </a>
        </div>
      </section>

      {/* Featured Feed & Quick Búsqueda */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Featured Ideas Column */}
        <section className="lg:col-span-8 flex flex-col gap-stack-md">
          <div className="flex justify-between items-center border-b border-outline-variant pb-2">
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background">
              Ideas Destacadas
            </h2>
            <Link href="/ideas" className="text-secondary font-label-md text-label-md font-bold hover:underline flex items-center gap-1">
              Ver todas <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {/* Idea Card 1 (En Acción) */}
            <article className="bg-surface border-t-4 border-primary border-x border-b border-outline-variant rounded shadow-sm hover:shadow-md transition-shadow p-stack-md flex flex-col gap-stack-sm">
              <div className="flex justify-between items-start">
                <span className="bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold px-2 py-0.5 rounded">
                  En Acción
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Hace 2 horas</span>
              </div>
              <h3 className="font-headline-md text-lg font-bold text-on-surface hover:text-primary transition-colors">
                <Link href="/ideas/idea-1">
                  Red de Purificación de Agua Comunitaria en Zonas Aisladas
                </Link>
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2">
                Instalación de filtros potabilizadores solares de rápida acción en comunidades rurales sin acceso al acueducto tras el sismo.
              </p>
              <div className="flex items-center gap-2 mt-auto pt-stack-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-outline text-sm">location_on</span>
                <span className="font-label-md text-xs">Valle del Cauca y Nariño</span>
              </div>
            </article>

            {/* Idea Card 2 (Promovida) */}
            <article className="bg-surface border-t-4 border-tertiary-fixed-dim border-x border-b border-outline-variant rounded shadow-sm hover:shadow-md transition-shadow p-stack-md flex flex-col gap-stack-sm">
              <div className="flex justify-between items-start">
                <span className="bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold px-2 py-0.5 rounded">
                  Promovida
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Hace 5 horas</span>
              </div>
              <h3 className="font-headline-md text-lg font-bold text-on-surface hover:text-primary transition-colors">
                <Link href="/ideas/idea-2">
                  Brigada Móvil de Apoyo Psicológico Infantil Post-Trauma
                </Link>
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2">
                Equipo interdisciplinario de psicólogos y terapeutas para atender niños y familias en albergues temporales.
              </p>
              <div className="mt-2">
                <div className="flex justify-between font-label-sm text-label-sm mb-1 text-on-surface-variant">
                  <span>Voluntarios Confirmados</span>
                  <span className="font-bold">15 / 20</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-auto pt-stack-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-outline text-sm">location_on</span>
                <span className="font-label-md text-xs">Pasto, Nariño</span>
              </div>
            </article>
          </div>
        </section>

        {/* Urgent Search Sidebar */}
        <aside className="lg:col-span-4 flex flex-col gap-stack-md">
          <div className="border-b border-outline-variant pb-2 flex justify-between items-center">
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background">
              Búsqueda Urgente
            </h2>
            <span className="bg-error text-on-error font-label-sm text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
              En Vivo
            </span>
          </div>

          <div className="flex flex-col gap-stack-sm">
            {/* Report Card 1 */}
            <div className="bg-surface border border-outline-variant rounded p-base flex gap-stack-sm items-center hover:bg-surface-container-low transition-colors shadow-sm">
              <div className="w-14 h-14 bg-surface-container-high rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-outline">person</span>
              </div>
              <div className="flex flex-col">
                <h4 className="font-label-md text-label-md font-bold text-on-surface">
                  Carlos Andrés Mendoza (34)
                </h4>
                <span className="font-label-sm text-label-sm text-error font-bold">
                  Persona Desaparecida
                </span>
                <span className="font-label-sm text-xs text-on-surface-variant line-clamp-1">
                  Popayán, Cauca — Visto en Parque Caldas
                </span>
              </div>
            </div>

            {/* Report Card 2 */}
            <div className="bg-surface border border-outline-variant rounded p-base flex gap-stack-sm items-center hover:bg-surface-container-low transition-colors shadow-sm">
              <div className="w-14 h-14 bg-surface-container-high rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-outline">pets</span>
              </div>
              <div className="flex flex-col">
                <h4 className="font-label-md text-label-md font-bold text-on-surface">
                  Mascota: Rocky (Labrador mestizo)
                </h4>
                <span className="font-label-sm text-label-sm text-error font-bold">
                  Animal Extraviado
                </span>
                <span className="font-label-sm text-xs text-on-surface-variant line-clamp-1">
                  Popayán — Collar rojo sin placa
                </span>
              </div>
            </div>

            <Link
              href="/busqueda"
              className="w-full text-center py-2.5 mt-2 bg-surface-container text-secondary font-label-md text-label-md font-bold rounded hover:bg-surface-container-high transition-colors"
            >
              Ver todos los reportes de búsqueda →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
