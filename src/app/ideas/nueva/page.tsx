'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function PublicarNuevaIdeaPage() {
  const [authorship, setAuthorship] = useState<'verified' | 'anonymous'>('verified');
  const [otpSent, setOtpSent] = useState(false);

  return (
    <div className="flex-1 w-full px-margin-mobile md:px-margin-desktop py-stack-md lg:py-stack-lg max-w-3xl mx-auto pb-16">
      {/* Context & Header */}
      <div className="mb-stack-lg">
        <Link
          href="/ideas"
          className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md mb-stack-sm"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Volver a Ideas
        </Link>
        <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background mt-2">
          Publicar Nueva Idea
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2">
          Propón soluciones viables y accionables para las necesidades inmediatas de tu comunidad tras la crisis.
        </p>
      </div>

      {/* Anti-Duplication Alert */}
      <div className="bg-surface-container-high border-l-4 border-tertiary-fixed-dim rounded-r-lg p-4 mb-stack-md flex gap-4 shadow-sm" role="alert">
        <span className="material-symbols-outlined text-tertiary font-bold mt-0.5 shrink-0">info</span>
        <div>
          <h3 className="font-label-md text-label-md font-bold text-on-surface mb-1">Antes de publicar...</h3>
          <p className="font-body-md text-sm text-on-surface-variant">
            Revisa si ya existe una propuesta similar o una iniciativa activa. Las iniciativas articuladas evitan la fragmentación y tienen mayor respaldo.
          </p>
          <Link href="/iniciativas" className="mt-2 text-secondary font-label-sm text-label-sm hover:underline font-bold inline-flex items-center gap-1">
            Ver iniciativas activas <span className="material-symbols-outlined text-sm">open_in_new</span>
          </Link>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={(e) => e.preventDefault()} className="space-y-stack-md bg-surface-container-lowest border border-outline-variant p-6 md:p-8 rounded-xl shadow-sm">
        {/* 1. Authorship Selection */}
        <fieldset className="border-b border-outline-variant pb-stack-md">
          <legend className="font-headline-md text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">person</span>
            Identidad del Autor
          </legend>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Option A: Verified */}
            <label
              onClick={() => setAuthorship('verified')}
              className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm transition-colors ${
                authorship === 'verified'
                  ? 'border-primary ring-2 ring-primary bg-surface-container-low'
                  : 'border-outline-variant bg-surface hover:bg-surface-container-low'
              }`}
            >
              <div className="flex flex-1 flex-col">
                <span className="font-label-md font-bold text-on-surface">Autor Verificado</span>
                <span className="mt-1 font-body-md text-xs text-on-surface-variant">
                  Validación instantánea por OTP de 6 dígitos
                </span>
                <span className="mt-2 text-xs text-secondary-fixed-variant bg-secondary-container/30 inline-block px-2 py-0.5 rounded w-fit font-medium">
                  Pasa a [Idea] de inmediato
                </span>
              </div>
              {authorship === 'verified' && (
                <span className="material-symbols-outlined text-primary self-center">check_circle</span>
              )}
            </label>

            {/* Option B: Anonymous */}
            <label
              onClick={() => setAuthorship('anonymous')}
              className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm transition-colors ${
                authorship === 'anonymous'
                  ? 'border-primary ring-2 ring-primary bg-surface-container-low'
                  : 'border-outline-variant bg-surface hover:bg-surface-container-low'
              }`}
            >
              <div className="flex flex-1 flex-col">
                <span className="font-label-md font-bold text-on-surface">Publicación Anónima</span>
                <span className="mt-1 font-body-md text-xs text-on-surface-variant">
                  Protegido por Captcha anti-bot
                </span>
                <span className="mt-2 text-xs text-tertiary-fixed-variant bg-tertiary-fixed/30 inline-block px-2 py-0.5 rounded w-fit font-medium">
                  Requiere moderador previo
                </span>
              </div>
              {authorship === 'anonymous' && (
                <span className="material-symbols-outlined text-primary self-center">check_circle</span>
              )}
            </label>
          </div>

          {/* Email / OTP Fields when verified */}
          {authorship === 'verified' && (
            <div className="mt-4 bg-surface-bright p-4 rounded-lg border border-outline-variant">
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1" htmlFor="email-input">
                Correo Electrónico <span className="text-error">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  id="email-input"
                  className="flex-1 rounded border border-outline-variant bg-surface text-on-surface px-4 py-2.5 font-body-md text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                  placeholder="tu.correo@ejemplo.com"
                  type="email"
                />
                <button
                  type="button"
                  onClick={() => setOtpSent(true)}
                  className="bg-secondary text-on-secondary font-label-md text-label-md px-4 py-2 rounded hover:bg-secondary-container transition-colors whitespace-nowrap active:scale-95"
                >
                  {otpSent ? 'Reenviar OTP' : 'Enviar Código'}
                </button>
              </div>

              {otpSent && (
                <div className="mt-3">
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1" htmlFor="otp-input">
                    Código de Verificación (6 dígitos)
                  </label>
                  <input
                    id="otp-input"
                    className="w-48 rounded border border-outline-variant bg-surface text-on-surface px-4 py-2 font-mono text-center tracking-widest text-lg focus:border-secondary outline-none"
                    placeholder="123456"
                    maxLength={6}
                    type="text"
                  />
                  <p className="text-xs text-on-surface-variant mt-1">Revisa tu bandeja de entrada o spam.</p>
                </div>
              )}
            </div>
          )}
        </fieldset>

        {/* 2. Idea Content */}
        <section className="space-y-4 border-b border-outline-variant pb-stack-md">
          <h2 className="font-headline-md text-xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">edit_note</span>
            Detalles de la Propuesta
          </h2>

          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1" htmlFor="idea-title">
              Título Claro de la Idea <span className="text-error">*</span>
            </label>
            <input
              id="idea-title"
              className="w-full rounded border border-outline-variant bg-surface px-4 py-2.5 font-body-md text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
              placeholder="Ej: Red de Purificación de Agua Comunitaria en Zonas Aisladas"
              type="text"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1" htmlFor="idea-category">
                Categoría Principal <span className="text-error">*</span>
              </label>
              <select
                id="idea-category"
                className="w-full rounded border border-outline-variant bg-surface px-3 py-2.5 font-body-md text-body-md focus:border-secondary outline-none"
                defaultValue=""
              >
                <option value="" disabled>Selecciona una categoría...</option>
                <option value="Salud y Agua">Salud y Agua Potable</option>
                <option value="Salud Mental">Salud Mental y Psicosocial</option>
                <option value="Albergue">Albergue y Vivienda</option>
                <option value="Logística">Logística y Rescate</option>
                <option value="Víveres">Víveres y Alimentación</option>
              </select>
            </div>

            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1" htmlFor="idea-scope">
                Alcance Geográfico <span className="text-error">*</span>
              </label>
              <select
                id="idea-scope"
                className="w-full rounded border border-outline-variant bg-surface px-3 py-2.5 font-body-md text-body-md focus:border-secondary outline-none"
                defaultValue="general"
              >
                <option value="general">Nacional / General</option>
                <option value="region">Regional / Departamental</option>
                <option value="ciudad">Ciudad / Municipio Específico</option>
                <option value="grupo_especifico">Población / Grupo Vulnerable</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1" htmlFor="idea-description">
              Descripción Detallada (Soporta Markdown) <span className="text-error">*</span>
            </label>
            <textarea
              id="idea-description"
              rows={6}
              className="w-full rounded border border-outline-variant bg-surface p-4 font-mono text-sm focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
              placeholder="Describe el problema, la solución propuesta, los recursos requeridos y los pasos de ejecución..."
            ></textarea>
            <p className="text-xs text-on-surface-variant mt-1">
              Puedes usar formato Markdown: **negrita**, *cursiva*, listas (#, -, 1.) y enlaces.
            </p>
          </div>
        </section>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
          <Link
            href="/ideas"
            className="px-6 py-3 border border-outline text-on-surface font-label-md font-bold rounded hover:bg-surface-variant text-center transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="px-8 py-3 bg-primary text-on-primary font-label-md font-bold uppercase rounded hover:bg-primary-container shadow-sm transition-all active:scale-95 text-center"
          >
            Enviar Propuesta
          </button>
        </div>
      </form>
    </div>
  );
}
