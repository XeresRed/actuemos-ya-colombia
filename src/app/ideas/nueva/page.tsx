'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TurnstileModal } from '../../../components/ui/TurnstileModal';

export default function PublicarNuevaIdeaPage() {
  const router = useRouter();
  const [authorship, setAuthorship] = useState<'anonymous' | 'verified'>('anonymous');
  const [email, setEmail] = useState('');
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState('');
  const [alcanceTipo, setAlcanceTipo] = useState('general');
  const [alcanceDetalle, setAlcanceDetalle] = useState('');
  const [iniciativaExistenteUrl, setIniciativaExistenteUrl] = useState('');
  const [requiereVoluntarios, setRequiereVoluntarios] = useState(false);
  const [cantidadVoluntarios, setCantidadVoluntarios] = useState<number | ''>('');
  const [perfilVoluntarios, setPerfilVoluntarios] = useState('');
  const [descripcionMarkdown, setDescripcionMarkdown] = useState('');
  const [showCaptchaModal, setShowCaptchaModal] = useState(false);

  // Estados de proceso
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ ideaId: string; requiresOtp: boolean } | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!titulo.trim() || !categoria || !descripcionMarkdown.trim()) {
      setErrorMsg('Por favor completa los campos obligatorios antes de continuar.');
      return;
    }

    if (authorship === 'verified' && (!email || !email.includes('@'))) {
      setErrorMsg('Por favor ingresa un correo electrónico válido para verificar tu propuesta.');
      return;
    }

    setShowCaptchaModal(true);
  };

  const handleVerifiedSubmit = async (token: string) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo,
          descripcionMarkdown,
          categoria,
          alcanceTipo,
          alcanceDetalle: alcanceDetalle || null,
          iniciativaExistenteUrl: iniciativaExistenteUrl || null,
          requiereVoluntarios,
          cantidadVoluntarios: requiereVoluntarios && cantidadVoluntarios ? Number(cantidadVoluntarios) : null,
          perfilVoluntarios: requiereVoluntarios && perfilVoluntarios ? perfilVoluntarios : null,
          esAnonimo: authorship === 'anonymous',
          emailCreador: authorship === 'verified' ? email : null,
          captchaToken: token,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message || 'Error al publicar la propuesta.');
      }

      setSuccessData({
        ideaId: json.data.idea.id,
        requiresOtp: json.data.requiresOtp,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al procesar la propuesta.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!successData?.ideaId || !otpCode) return;

    setErrorMsg(null);
    setVerifyingOtp(true);

    try {
      const res = await fetch(`/api/ideas/${successData.ideaId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otpCode,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message || 'Código OTP no válido.');
      }

      router.push(`/ideas/${successData.ideaId}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al validar OTP.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="flex-1 w-full px-margin-mobile md:px-margin-desktop py-stack-md lg:py-stack-lg max-w-3xl mx-auto pb-16">
      {/* Context & Header */}
      <div className="mb-stack-lg">
        <Link
          href="/ideas"
          className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md mb-stack-sm"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Volver al Banco de Ideas
        </Link>
        <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background mt-2">
          Publicar Nueva Idea o Propuesta
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2">
          Propón soluciones viables, accionables y neutrales para las necesidades inmediatas de tu comunidad ante la emergencia.
        </p>
      </div>

      {/* Anti-Duplication Alert */}
      <div className="bg-surface-container-high border-l-4 border-secondary rounded-r-xl p-4 mb-stack-md flex gap-3.5 shadow-sm" role="alert">
        <span className="material-symbols-outlined text-secondary text-2xl shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
          diversity_3
        </span>
        <div className="text-xs leading-relaxed">
          <h3 className="font-label-md text-sm font-bold text-on-surface mb-0.5">Evitemos duplicar esfuerzos</h3>
          <p className="text-on-surface-variant">
            Si conoces una ONG, campaña o colectivo que ya esté ejecutando una solución similar, puedes indicarlo en el campo opcional de <strong>Iniciativa Relacionada</strong> para articular recursos.
          </p>
          <Link href="/iniciativas" className="mt-1.5 text-secondary font-label-sm text-xs hover:underline font-bold inline-flex items-center gap-1">
            <span>Explorar iniciativas activas</span>
            <span className="material-symbols-outlined text-xs">open_in_new</span>
          </Link>
        </div>
      </div>

      {/* Form or Success/OTP Flow */}
      {successData ? (
        <div className="bg-surface-container-lowest border border-outline-variant p-8 rounded-xl shadow-sm text-center animate-in fade-in">
          {successData.requiresOtp ? (
            <div className="max-w-md mx-auto flex flex-col items-center gap-4">
              <span className="material-symbols-outlined text-secondary text-5xl">mark_email_read</span>
              <h2 className="font-headline-md text-xl font-bold text-on-surface">Valida tu Correo Electrónico</h2>
              <p className="font-body-md text-xs text-on-surface-variant">
                Hemos enviado un código OTP de 6 dígitos a <strong>{email}</strong>. Ingrésalo a continuación para publicar tu propuesta de inmediato.
              </p>

              {errorMsg ? (
                <div className="w-full bg-error-container text-on-error-container p-2.5 rounded text-xs">
                  {errorMsg}
                </div>
              ) : null}

              <form onSubmit={handleVerifyOtp} className="w-full flex flex-col gap-3">
                <input
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  required
                  className="w-full text-center text-2xl font-mono tracking-widest py-3 border border-outline rounded-lg focus:border-secondary outline-none"
                />
                <button
                  type="submit"
                  disabled={verifyingOtp}
                  className="w-full bg-secondary text-on-secondary font-label-md text-xs font-bold uppercase py-3.5 rounded-lg hover:bg-secondary-container transition-colors disabled:opacity-50 active:scale-95"
                >
                  {verifyingOtp ? 'Verificando...' : 'Confirmar y Publicar Idea'}
                </button>
              </form>
            </div>
          ) : (
            <div className="max-w-md mx-auto flex flex-col items-center gap-4">
              <span className="material-symbols-outlined text-green-700 text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
              <h2 className="font-headline-md text-xl font-bold text-on-surface">¡Propuesta Recibida!</h2>
              <p className="font-body-md text-sm text-on-surface-variant max-w-sm">
                Tu idea ha sido registrada en estado <strong>Borrador</strong>. Nuestro equipo de moderadores la revisará brevemente para aprobarla y publicarla en el muro.
              </p>
              <Link
                href="/ideas"
                className="mt-2 bg-primary text-on-primary font-label-md text-xs font-bold uppercase px-6 py-3 rounded-lg hover:bg-primary-container transition-colors"
              >
                Volver al Muro de Ideas →
              </Link>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-stack-md bg-surface-container-lowest border border-outline-variant p-6 md:p-8 rounded-xl shadow-sm">
          {errorMsg ? (
            <div className="bg-error-container text-on-error-container p-3 rounded-lg text-xs flex items-center gap-2 animate-in fade-in">
              <span className="material-symbols-outlined text-sm shrink-0">error</span>
              <span>{errorMsg}</span>
            </div>
          ) : null}

          {/* 1. Authorship Selection */}
          <fieldset className="border-b border-outline-variant pb-stack-md">
            <legend className="font-headline-md text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">person</span>
              Modo de Publicación
            </legend>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option A: Anonymous (Recommended / Zero Email) */}
              <label
                onClick={() => setAuthorship('anonymous')}
                className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm transition-colors ${
                  authorship === 'anonymous'
                    ? 'border-primary ring-2 ring-primary bg-surface-container-low'
                    : 'border-outline-variant bg-surface hover:bg-surface-container-low'
                }`}
              >
                <div className="flex flex-1 flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-label-md font-bold text-on-surface text-sm">Envío Rápido Anónimo</span>
                    <span className="bg-green-100 text-green-800 text-[10px] font-bold px-1.5 py-0.2 rounded">Recomendado</span>
                  </div>
                  <span className="mt-1 font-body-md text-xs text-on-surface-variant">
                    Protegido por Captcha anti-bot de humano. Revisado de inmediato por supervisores.
                  </span>
                  <span className="mt-2 text-xs text-tertiary-fixed-variant bg-tertiary-fixed/30 inline-block px-2 py-0.5 rounded w-fit font-medium">
                    0 correos consumidos
                  </span>
                </div>
                {authorship === 'anonymous' ? (
                  <span className="material-symbols-outlined text-primary self-center">check_circle</span>
                ) : null}
              </label>

              {/* Option B: Verified */}
              <label
                onClick={() => setAuthorship('verified')}
                className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm transition-colors ${
                  authorship === 'verified'
                    ? 'border-primary ring-2 ring-primary bg-surface-container-low'
                    : 'border-outline-variant bg-surface hover:bg-surface-container-low'
                }`}
              >
                <div className="flex flex-1 flex-col">
                  <span className="font-label-md font-bold text-on-surface text-sm">Con Correo Electrónico</span>
                  <span className="mt-1 font-body-md text-xs text-on-surface-variant">
                    Requiere validación mediante código OTP de 6 dígitos.
                  </span>
                  <span className="mt-2 text-xs text-secondary-fixed-variant bg-secondary-container/30 inline-block px-2 py-0.5 rounded w-fit font-medium">
                    Publicación instantánea tras OTP
                  </span>
                </div>
                {authorship === 'verified' ? (
                  <span className="material-symbols-outlined text-primary self-center">check_circle</span>
                ) : null}
              </label>
            </div>

            {/* Email Field when verified */}
            {authorship === 'verified' ? (
              <div className="mt-4 bg-surface-bright p-4 rounded-lg border border-outline-variant animate-in fade-in">
                <label className="block font-label-sm text-xs font-bold text-on-surface mb-1" htmlFor="email-input">
                  Correo Electrónico para recibir el código de verificación OTP <span className="text-error">*</span>
                </label>
                <input
                  id="email-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded border border-outline-variant bg-surface text-on-surface px-4 py-2.5 font-body-md text-sm focus:border-secondary outline-none"
                  placeholder="cam960210@gmail.com"
                  type="email"
                  required
                />
              </div>
            ) : null}
          </fieldset>

          {/* 2. Idea Content */}
          <section className="space-y-4 border-b border-outline-variant pb-stack-md">
            <h2 className="font-headline-md text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">edit_note</span>
              Detalles de la Propuesta
            </h2>

            <div>
              <label className="block font-label-sm text-xs font-bold text-on-surface mb-1" htmlFor="idea-title">
                Título Claro de la Idea <span className="text-error">*</span>
              </label>
              <input
                id="idea-title"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full rounded border border-outline-variant bg-surface px-4 py-2.5 font-body-md text-sm focus:border-secondary outline-none"
                placeholder="Ej: Red de Purificación de Agua Comunitaria en Zonas Aisladas"
                type="text"
                required
                minLength={5}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-label-sm text-xs font-bold text-on-surface mb-1" htmlFor="idea-category">
                  Categoría Principal <span className="text-error">*</span>
                </label>
                <select
                  id="idea-category"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full rounded border border-outline-variant bg-surface px-3 py-2.5 font-body-md text-sm focus:border-secondary outline-none"
                  required
                >
                  <option value="" disabled>Selecciona una categoría...</option>
                  <option value="Salud y Agua">Salud y Agua Potable</option>
                  <option value="Salud Mental">Salud Mental y Psicosocial</option>
                  <option value="Albergue">Albergue y Vivienda</option>
                  <option value="Logística">Logística y Rescate</option>
                  <option value="Víveres">Víveres y Alimentación</option>
                  <option value="Tecnología">Tecnología y Telecomunicaciones</option>
                  <option value="Educación">Educación y Niñez</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>

              <div>
                <label className="block font-label-sm text-xs font-bold text-on-surface mb-1" htmlFor="idea-scope">
                  Alcance Geográfico <span className="text-error">*</span>
                </label>
                <select
                  id="idea-scope"
                  value={alcanceTipo}
                  onChange={(e) => setAlcanceTipo(e.target.value)}
                  className="w-full rounded border border-outline-variant bg-surface px-3 py-2.5 font-body-md text-sm focus:border-secondary outline-none"
                >
                  <option value="general">Nacional / General</option>
                  <option value="region">Regional / Departamental</option>
                  <option value="ciudad">Ciudad / Municipio Específico</option>
                  <option value="grupo_especifico">Población / Grupo Vulnerable</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-label-sm text-xs font-bold text-on-surface mb-1" htmlFor="idea-detalle-alcance">
                Ubicación Específica o Población (Opcional)
              </label>
              <input
                id="idea-detalle-alcance"
                value={alcanceDetalle}
                onChange={(e) => setAlcanceDetalle(e.target.value)}
                className="w-full rounded border border-outline-variant bg-surface px-4 py-2.5 font-body-md text-sm focus:border-secondary outline-none"
                placeholder="Ej. Albergues de Popayán / Vereda El Tambo / Niños y Adultos Mayores"
                type="text"
              />
            </div>

            {/* Campo REQ-02: Iniciativa u Organización Existente Relacionada */}
            <div>
              <label className="block font-label-sm text-xs font-bold text-on-surface mb-1" htmlFor="idea-iniciativa-relacionada">
                Organización, Iniciativa o Enlace Existente Relacionado (Opcional)
              </label>
              <input
                id="idea-iniciativa-relacionada"
                value={iniciativaExistenteUrl}
                onChange={(e) => setIniciativaExistenteUrl(e.target.value)}
                className="w-full rounded border border-outline-variant bg-surface px-4 py-2.5 font-body-md text-sm focus:border-secondary outline-none"
                placeholder="Ej. https://cruzroja.org.co o Fundación Banco de Alimentos / Junta Comunal"
                type="text"
              />
              <p className="text-[11px] text-on-surface-variant mt-1">
                Si ya existe una organización o campaña trabajando en esto, agrégala para facilitar la coordinación y evitar duplicar esfuerzos.
              </p>
            </div>

            {/* Solicitud de Voluntarios / Brigadistas */}
            <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="requiere-voluntarios-checkbox"
                  checked={requiereVoluntarios}
                  onChange={(e) => setRequiereVoluntarios(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-outline text-secondary focus:ring-secondary cursor-pointer"
                />
                <label htmlFor="requiere-voluntarios-checkbox" className="cursor-pointer">
                  <span className="font-label-md font-bold text-on-surface text-sm flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-secondary text-lg">handshake</span>
                    ¿Esta propuesta u operación requiere brigadistas o voluntarios en terreno?
                  </span>
                  <p className="font-body-md text-xs text-on-surface-variant mt-0.5">
                    Activa esta opción si necesitas convocar apoyo ciudadano, brigadistas o perfiles técnicos específicos para ejecutar la solución.
                  </p>
                </label>
              </div>

              {requiereVoluntarios && (
                <div className="pt-3 border-t border-outline-variant/60 grid grid-cols-1 sm:grid-cols-12 gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="sm:col-span-4">
                    <label className="block font-label-sm text-xs font-bold text-on-surface mb-1" htmlFor="cantidad-voluntarios-input">
                      Cantidad estimada <span className="text-error">*</span>
                    </label>
                    <input
                      id="cantidad-voluntarios-input"
                      type="number"
                      min={1}
                      max={1000}
                      value={cantidadVoluntarios}
                      onChange={(e) => setCantidadVoluntarios(e.target.value ? Math.max(1, parseInt(e.target.value, 10)) : '')}
                      className="w-full rounded border border-outline-variant bg-surface px-3 py-2 text-sm focus:border-secondary outline-none"
                      placeholder="Ej. 5"
                      required={requiereVoluntarios}
                    />
                  </div>

                  <div className="sm:col-span-8">
                    <label className="block font-label-sm text-xs font-bold text-on-surface mb-1" htmlFor="perfil-voluntarios-input">
                      Perfil o rol requerido (Opcional)
                    </label>
                    <input
                      id="perfil-voluntarios-input"
                      type="text"
                      maxLength={200}
                      value={perfilVoluntarios}
                      onChange={(e) => setPerfilVoluntarios(e.target.value)}
                      className="w-full rounded border border-outline-variant bg-surface px-3 py-2 text-sm focus:border-secondary outline-none"
                      placeholder="Ej. Médicos de urgencia, rescatistas, operarios de drones, logística"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block font-label-sm text-xs font-bold text-on-surface mb-1" htmlFor="idea-description">
                Descripción Detallada (Soporta Markdown) <span className="text-error">*</span>
              </label>
              <textarea
                id="idea-description"
                rows={6}
                value={descripcionMarkdown}
                onChange={(e) => setDescripcionMarkdown(e.target.value)}
                className="w-full rounded border border-outline-variant bg-surface p-4 font-mono text-sm focus:border-secondary outline-none"
                placeholder="Describe el problema, la solución propuesta, los recursos requeridos y los pasos de ejecución..."
                required
                minLength={15}
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
              className="px-6 py-3 border border-outline text-on-surface font-label-md font-bold rounded-lg hover:bg-surface-variant text-center transition-colors text-xs"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-primary text-on-primary font-label-md font-bold uppercase rounded-lg hover:bg-primary-container shadow-sm transition-all active:scale-95 text-center text-xs disabled:opacity-50"
            >
              {loading ? 'Enviando Propuesta...' : 'Enviar Propuesta'}
            </button>
          </div>

          {/* Just-in-Time Security Verification Modal */}
          <TurnstileModal
            isOpen={showCaptchaModal}
            onClose={() => setShowCaptchaModal(false)}
            onVerified={handleVerifiedSubmit}
            action="proponer_idea"
            title="Verificación de Propuesta"
            description="Verificamos tu solicitud para proteger el muro de iniciativas cívicas contra spam y envíos automatizados."
          />
        </form>
      )}
    </div>
  );
}
