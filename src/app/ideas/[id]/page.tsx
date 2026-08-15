'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface IdeaDetailPageProps {
  params: {
    id: string;
  };
}

export default function IdeaDetailPage({ params }: IdeaDetailPageProps) {
  const [commentText, setCommentText] = useState('');
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: 'Red de Purificación de Agua Comunitaria — ActuemosYaColombia',
        text: 'Apoya esta iniciativa comunitaria ante la emergencia en el Valle y Nariño.',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex-1 w-full px-margin-mobile md:px-margin-desktop py-stack-md lg:py-stack-lg max-w-4xl mx-auto pb-16">
      {/* Navigation Breadcrumb */}
      <div className="mb-stack-md">
        <Link
          href="/ideas"
          className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md mb-2"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Volver al Banco de Ideas
        </Link>
      </div>

      {/* Redirection Banner (Conditional demonstration) */}
      <div className="bg-surface-container-high border-l-4 border-primary p-4 rounded-r mb-stack-lg flex items-start gap-4 shadow-sm">
        <span className="material-symbols-outlined text-primary mt-0.5 shrink-0">info</span>
        <div>
          <h3 className="font-label-md text-label-md text-on-background font-bold mb-1">Iniciativa en Coordinación Activa</h3>
          <p className="font-body-md text-sm text-on-surface-variant mb-2">
            Esta propuesta cuenta con respaldo de brigadas de la Defensa Civil y la Cruz Roja para articulación en terreno.
          </p>
          <a
            href="https://cruzrojacolombiana.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-label-md text-sm hover:underline inline-flex items-center gap-1 font-bold"
          >
            Ver canal oficial de articulación <span className="material-symbols-outlined text-sm">open_in_new</span>
          </a>
        </div>
      </div>

      {/* Status Pipeline Visualizer */}
      <div className="mb-stack-lg bg-surface border border-outline-variant rounded-lg p-6 shadow-sm">
        <h4 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-6 font-bold">
          Pipeline de Vida de la Propuesta
        </h4>

        <div className="relative flex items-center justify-between w-full">
          {/* Progress bar background line */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-1.5 bg-surface-variant -z-10 rounded"></div>
          {/* Active progress fill line */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 h-1.5 bg-secondary-container w-[66%] -z-10 rounded"></div>

          {/* Step 1: Idea */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-secondary text-on-secondary flex items-center justify-center border-2 border-surface shadow-sm">
              <span className="material-symbols-outlined text-sm">check</span>
            </div>
            <span className="font-label-sm text-xs font-semibold text-on-background">Idea</span>
          </div>

          {/* Step 2: Promovida */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-secondary text-on-secondary flex items-center justify-center border-2 border-surface shadow-sm">
              <span className="material-symbols-outlined text-sm">check</span>
            </div>
            <span className="font-label-sm text-xs font-semibold text-on-background">Promovida</span>
          </div>

          {/* Step 3: En Acción */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-surface-container-high border-2 border-primary text-primary flex items-center justify-center shadow-md animate-pulse">
              <span className="material-symbols-outlined text-sm">pending_actions</span>
            </div>
            <span className="font-label-sm text-xs text-primary font-bold">En Acción</span>
          </div>

          {/* Step 4: Cerrada */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center border-2 border-surface">
              <span className="material-symbols-outlined text-sm">flag</span>
            </div>
            <span className="font-label-sm text-xs text-on-surface-variant">Cerrada</span>
          </div>
        </div>
      </div>

      {/* Main Proposal Article */}
      <article className="bg-surface border border-outline-variant border-t-4 border-t-primary rounded-lg shadow-sm p-6 md:p-8 mb-stack-lg">
        <header className="mb-6 border-b border-outline-variant pb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
            <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background">
              Red de Purificación de Agua Comunitaria en Zonas Aisladas
            </h1>

            {/* Share action button */}
            <button
              onClick={handleShare}
              className="px-4 py-2 rounded-full bg-surface-container-low hover:bg-surface-variant flex items-center gap-2 text-on-surface-variant transition-colors border border-outline-variant shrink-0 active:scale-95 text-xs font-bold"
              title="Compartir enlace"
            >
              <span className="material-symbols-outlined text-base">share</span>
              {copied ? '¡Copiado!' : 'Compartir'}
            </button>
          </div>

          <div className="flex flex-wrap gap-4 text-on-surface-variant font-label-md text-xs sm:text-sm">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-base">location_on</span>
              Valle del Cauca y Nariño
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-base">category</span>
              Salud y Agua Potable
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-base">verified_user</span>
              Autor: contacto@aguavida.org (Verificado OTP)
            </div>
          </div>
        </header>

        {/* Content Markdown Body */}
        <div className="prose max-w-none text-on-background space-y-4 font-body-md text-base leading-relaxed">
          <p>
            Instalación de filtros potabilizadores solares de rápida acción en comunidades rurales y albergues temporales que perdieron el acceso al acueducto tras el sismo.
          </p>
          <h3 className="font-headline-md text-lg font-bold text-on-surface mt-6 mb-2">
            Objetivos Principales
          </h3>
          <ul className="list-disc pl-6 space-y-2 text-on-surface-variant">
            <li>Proveer hasta 5,000 litros diarios de agua apta para consumo humano.</li>
            <li>Capacitar a 15 líderes locales en la operación y mantenimiento de membranas.</li>
            <li>Coordinar la cadena de suministro con brigadas de socorro y defensa civil.</li>
          </ul>

          <div className="bg-surface-container-low p-4 rounded border border-outline-variant mt-6">
            <h4 className="font-label-md font-bold text-on-surface mb-1">Recursos Necesarios</h4>
            <p className="text-sm text-on-surface-variant">
              10 filtros de membrana portátil, 4 bombas manuales, 2 técnicos instaladores con transporte 4x4.
            </p>
          </div>
        </div>
      </article>

      {/* Discussion & Debate Section */}
      <section className="bg-surface border border-outline-variant rounded-lg p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6 border-b border-outline-variant pb-4">
          <span className="material-symbols-outlined text-primary">forum</span>
          <h2 className="font-headline-md text-xl font-bold text-on-surface">
            Espacio de Debate y Coordinación
          </h2>
          <span className="bg-surface-variant text-on-surface-variant font-label-sm text-xs px-2 py-0.5 rounded-full ml-auto">
            2 comentarios
          </span>
        </div>

        {/* Comment Form */}
        <form onSubmit={(e) => e.preventDefault()} className="mb-8 bg-surface-container-lowest p-4 rounded border border-outline-variant">
          <label htmlFor="comment-input" className="font-label-sm text-sm font-bold text-on-surface block mb-2">
            Sumar al debate o aportar recursos
          </label>
          <textarea
            id="comment-input"
            rows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Aporta información verificada, capacidades técnicas o preguntas..."
            className="w-full border border-outline-variant rounded p-3 text-sm focus:border-secondary outline-none bg-surface"
          ></textarea>
          <div className="flex justify-between items-center mt-3">
            <span className="text-xs text-on-surface-variant">Protegido con validación anti-spam</span>
            <button
              type="submit"
              className="bg-secondary text-on-secondary font-label-md text-xs font-bold uppercase px-4 py-2 rounded hover:bg-secondary-container transition-colors active:scale-95"
            >
              Publicar Comentario
            </button>
          </div>
        </form>

        {/* Comment Tree */}
        <div className="space-y-4">
          {/* Parent Comment */}
          <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="font-label-md font-bold text-xs text-on-surface">laboratorio@univalle.edu.co</span>
                <span className="bg-secondary-container text-on-secondary-container text-[10px] font-bold px-1.5 py-0.2 rounded">
                  Verificado
                </span>
              </div>
              <span className="text-xs text-on-surface-variant">Hace 2 horas</span>
            </div>
            <p className="font-body-md text-sm text-on-surface">
              Contamos con 10 filtros de membrana donados por la Universidad del Valle listos para despacho. ¿Cómo coordinamos el transporte seguro?
            </p>

            {/* Nested Reply */}
            <div className="mt-3 ml-4 pl-4 border-l-2 border-outline-variant bg-surface p-3 rounded">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-label-md font-bold text-xs text-primary">operaciones@defensacivil.gov.co</span>
                  <span className="bg-primary-fixed text-on-primary-fixed text-[10px] font-bold px-1.5 py-0.2 rounded">
                    Socorrista
                  </span>
                </div>
                <span className="text-xs text-on-surface-variant">Hace 1 hora</span>
              </div>
              <p className="font-body-md text-sm text-on-surface-variant">
                Excelente iniciativa. Desde la Defensa Civil podemos incluirlos en el convoy que sale mañana a las 06:00 AM desde Cali.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
