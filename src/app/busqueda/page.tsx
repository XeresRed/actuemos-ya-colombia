'use client';

import React from 'react';
import Link from 'next/link';

export default function BusquedaHumanitariaPage() {
  return (
    <div className="flex-grow w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-stack-md lg:py-stack-lg flex flex-col gap-stack-lg">
      {/* Header & Anti-Duplication Philosophy */}
      <header className="border-b border-outline-variant pb-6">
        <div className="flex items-center gap-2 text-secondary font-label-md text-xs font-bold uppercase tracking-wider mb-2">
          <span className="material-symbols-outlined text-base">hub</span>
          <span>Centro de Articulación y Búsqueda Inmediata</span>
        </div>
        <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-on-surface">
          Búsqueda Humanitaria, Personas y Mascotas
        </h1>
        <p className="font-body-md text-sm md:text-base text-on-surface-variant mt-2 max-w-3xl leading-relaxed">
          En momentos de crisis, la dispersión de información cuesta vidas. En <strong>ActuemosYa<span className="inline-flex font-semibold"><span className="text-[#D97706]">Col</span><span className="text-secondary">omb</span><span className="text-primary">ia</span></span></strong> aplicamos el principio de <em>no reinventar la rueda</em>: canalizamos la ayuda y enlazamos directamente con las plataformas especializadas y organismos oficiales más activos del país.
        </p>
      </header>

      {/* Main Dual Cards: ColombiaTeBusca & MiGenteVe */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-stack-lg">
        {/* Card 1: Búsqueda de Personas Desaparecidas */}
        <article className="bg-surface-container-lowest border-2 border-primary/30 rounded-2xl p-6 md:p-8 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-primary transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-0 pointer-events-none"></div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md text-xs font-bold">
                <span className="material-symbols-outlined text-sm">person_search</span>
                Personas Desaparecidas
              </span>
              <span className="text-[11px] text-on-surface-variant font-semibold">Red Cívica Nacional</span>
            </div>

            <h2 className="font-headline-md text-xl md:text-2xl font-bold text-on-surface mb-3">
              ColombiaTeBusca — Registro de Personas
            </h2>

            <p className="font-body-md text-xs md:text-sm text-on-surface-variant mb-6 leading-relaxed">
              Plataforma digital especializada y ampliamente adoptada en Colombia para el registro, consulta y difusión inmediata de reportes de personas no localizadas tras emergencias y desastres.
            </p>

            <ul className="space-y-2.5 text-xs text-on-surface mb-8 border-y border-outline-variant/60 py-4">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span>
                <span>Registro fotográfico con edad, estatura y vestimenta</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span>
                <span>Filtros geo-referenciados por departamento y municipio</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span>
                <span>Validación comunitaria y actualización en tiempo real</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a
              href="https://colombiatebusca.com/?tab=persons"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 px-5 bg-primary text-on-primary font-label-md text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-sm text-center active:scale-95"
            >
              <span>Ir a ColombiaTeBusca (Personas)</span>
              <span className="material-symbols-outlined text-sm">open_in_new</span>
            </a>
            <a
              href="https://cruzrojacolombiana.org/rcf"
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-4 bg-surface border border-outline text-on-surface font-label-md text-xs font-bold rounded-lg hover:bg-surface-variant transition-colors flex items-center justify-center gap-1.5 text-center"
              title="Restablecimiento del Contacto entre Familiares — Cruz Roja"
            >
              <span className="material-symbols-outlined text-sm text-secondary">health_and_safety</span>
              <span>Cruz Roja RCF</span>
            </a>
          </div>
        </article>

        {/* Card 2: Búsqueda de Mascotas y Servicios Veterinarios */}
        <article className="bg-surface-container-lowest border-2 border-secondary/30 rounded-2xl p-6 md:p-8 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-secondary transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-bl-full -z-0 pointer-events-none"></div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 bg-secondary/10 text-secondary px-3 py-1 rounded-full font-label-md text-xs font-bold">
                <span className="material-symbols-outlined text-sm">pets</span>
                Mascotas & Bienestar Animal
              </span>
              <span className="text-[11px] text-on-surface-variant font-semibold">Refugios & Veterinaria</span>
            </div>

            <h2 className="font-headline-md text-xl md:text-2xl font-bold text-on-surface mb-3">
              MiGenteVe Colombia — Mascotas y Refugios
            </h2>

            <p className="font-body-md text-xs md:text-sm text-on-surface-variant mb-6 leading-relaxed">
              Red especializada en el reencuentro de animales de compañía extraviados, mapeo de albergues y refugios temporales, y articulación con servicios médicos veterinarios de emergencia.
            </p>

            <ul className="space-y-2.5 text-xs text-on-surface mb-8 border-y border-outline-variant/60 py-4">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
                <span>Reporte de animales perdidos y encontrados con foto y señas</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
                <span>Directorio de albergues de paso y refugios transitorios</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
                <span>Canales de urgencias y brigadas de atención veterinaria</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a
              href="https://colombia.migenteve.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-5 bg-secondary text-on-secondary font-label-md text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-secondary-container transition-all flex items-center justify-center gap-2 shadow-sm text-center active:scale-95"
            >
              <span>Ir a MiGenteVe (Mascotas & Veterinaria)</span>
              <span className="material-symbols-outlined text-sm">open_in_new</span>
            </a>
          </div>
        </article>
      </div>

      {/* Protocol Guide: First 24-48 Hours */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 border-b border-outline-variant pb-4">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-700">
            <span className="material-symbols-outlined text-2xl">quick_reference_all</span>
          </div>
          <div>
            <h3 className="font-headline-md text-lg font-bold text-on-surface">
              Protocolo de Acción Inmediata (Primeras 24 - 48 Horas)
            </h3>
            <p className="text-xs text-on-surface-variant">
              Guía cívica recomendada por organismos de socorro para actuar con rapidez y seguridad.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="bg-surface p-4 rounded-xl border border-outline-variant/70 flex flex-col gap-2">
            <div className="flex items-center gap-2 font-bold text-sm text-on-surface">
              <span className="w-6 h-6 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-xs">1</span>
              <span>Reúne Datos Clave</span>
            </div>
            <p className="text-on-surface-variant leading-relaxed">
              Consigue la fotografía más reciente posible, detalle exacto de la ropa/calzado al momento del sismo o evento, señas particulares (cicatrices, tatuajes) y la última coordenada o punto de referencia.
            </p>
          </div>

          <div className="bg-surface p-4 rounded-xl border border-outline-variant/70 flex flex-col gap-2">
            <div className="flex items-center gap-2 font-bold text-sm text-on-surface">
              <span className="w-6 h-6 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-xs">2</span>
              <span>Reporta en Canales Oficiales</span>
            </div>
            <p className="text-on-surface-variant leading-relaxed">
              Registra el caso en <strong>ColombiaTeBusca</strong> (personas) o <strong>MiGenteVe</strong> (mascotas). Comunícate de inmediato con la <strong>Cruz Roja (Línea 132)</strong> para activar el protocolo RCF formal.
            </p>
          </div>

          <div className="bg-surface p-4 rounded-xl border border-outline-variant/70 flex flex-col gap-2">
            <div className="flex items-center gap-2 font-bold text-sm text-error">
              <span className="material-symbols-outlined text-sm">security</span>
              <span>Prevención de Estafas</span>
            </div>
            <p className="text-on-surface-variant leading-relaxed">
              <strong>Nunca transfieras dinero:</strong> Los organismos de socorro oficiales jamás cobran por labores de rescate ni por devolver a una mascota. Desconfía de llamadas anónimas que exijan consignaciones urgentes.
            </p>
          </div>
        </div>
      </section>

      {/* Emergency Hotlines Direct Dial */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 shadow-sm">
        <h3 className="font-headline-md text-base font-bold text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">call</span>
          <span>Líneas Telefónicas Directas de Búsqueda y Emergencia</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <a
            href="tel:123"
            className="p-3.5 bg-surface border border-outline-variant rounded-xl hover:border-primary hover:bg-surface-container-low transition-all flex flex-col items-center text-center gap-1 group"
          >
            <span className="material-symbols-outlined text-primary text-2xl group-hover:scale-110 transition-transform">local_police</span>
            <strong className="text-sm font-bold text-on-surface">123</strong>
            <span className="text-[11px] text-on-surface-variant">Emergencias Nacional</span>
          </a>

          <a
            href="tel:132"
            className="p-3.5 bg-surface border border-outline-variant rounded-xl hover:border-secondary hover:bg-surface-container-low transition-all flex flex-col items-center text-center gap-1 group"
          >
            <span className="material-symbols-outlined text-secondary text-2xl group-hover:scale-110 transition-transform">medical_services</span>
            <strong className="text-sm font-bold text-on-surface">132</strong>
            <span className="text-[11px] text-on-surface-variant">Cruz Roja (RCF & Socorro)</span>
          </a>

          <a
            href="tel:144"
            className="p-3.5 bg-surface border border-outline-variant rounded-xl hover:border-amber-600 hover:bg-surface-container-low transition-all flex flex-col items-center text-center gap-1 group"
          >
            <span className="material-symbols-outlined text-amber-600 text-2xl group-hover:scale-110 transition-transform">shield</span>
            <strong className="text-sm font-bold text-on-surface">144</strong>
            <span className="text-[11px] text-on-surface-variant">Defensa Civil Colombiana</span>
          </a>

          <a
            href="tel:+576014069977"
            className="p-3.5 bg-surface border border-outline-variant rounded-xl hover:border-outline hover:bg-surface-container-low transition-all flex flex-col items-center text-center gap-1 group"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-2xl group-hover:scale-110 transition-transform">fingerprint</span>
            <strong className="text-xs font-bold text-on-surface">(601) 406 9977</strong>
            <span className="text-[11px] text-on-surface-variant">Medicina Legal (Identificación)</span>
          </a>
        </div>
      </section>
    </div>
  );
}
