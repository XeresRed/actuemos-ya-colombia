'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TurnstileWidget } from '../../../components/ui/TurnstileWidget';

export default function SupervisorRegisterPage() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [organizacion, setOrganizacion] = useState('');
  const [motivacion, setMotivacion] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string>('dev-token');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register-supervisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          email,
          organizacion: organizacion || null,
          motivacion,
          captchaToken,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message || 'Error al enviar la postulación.');
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-margin-mobile md:p-margin-desktop py-12">
      <div className="w-full max-w-lg bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg shadow-sm flex flex-col gap-stack-lg relative overflow-hidden">
        {/* Institutional brand top accent */}
        <div className="absolute top-0 left-0 w-full h-2 bg-secondary"></div>

        <header className="flex flex-col items-center text-center gap-base">
          <span className="material-symbols-outlined text-secondary text-5xl mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>
            shield_person
          </span>
          <h1 className="font-headline-lg text-2xl font-bold text-on-surface">
            Postulación de Moderadores
          </h1>
          <p className="font-body-md text-xs text-on-surface-variant max-w-sm">
            Únete al equipo voluntario de supervisores de ActuemosYa<span className="inline-flex font-semibold"><span className="text-[#D97706]">Col</span><span className="text-secondary">omb</span><span className="text-primary">ia</span></span> para verificar reportes y moderar propuestas de emergencia.
          </p>
        </header>

        {submitted ? (
          <div className="flex flex-col items-center text-center gap-stack-md py-6 animate-in fade-in">
            <span className="material-symbols-outlined text-green-700 text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              verified
            </span>
            <h2 className="font-headline-md text-xl font-bold text-on-surface">
              ¡Postulación Recibida!
            </h2>
            <p className="font-body-md text-sm text-on-surface-variant max-w-md">
              Hemos registrado tus datos correctamente. El Administrador General revisará tu perfil y recibirás un correo con tu <strong>Magic Link de Bienvenida</strong> una vez sea aprobada tu cuenta.
            </p>
            <div className="mt-4 flex flex-col gap-2 w-full max-w-xs">
              <Link
                href="/admin/login"
                className="w-full bg-secondary text-on-secondary font-label-md text-xs font-bold uppercase py-3 rounded text-center hover:bg-secondary-container transition-colors"
              >
                Volver a Iniciar Sesión
              </Link>
              <Link
                href="/"
                className="w-full text-on-surface-variant font-label-sm text-xs py-2 text-center hover:underline"
              >
                Ir a la Página Principal
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
            {errorMsg ? (
              <div className="bg-error-container text-on-error-container p-3 rounded-lg text-xs flex items-center gap-2 animate-in fade-in">
                <span className="material-symbols-outlined text-sm shrink-0">error</span>
                <span>{errorMsg}</span>
              </div>
            ) : null}

            <div>
              <label className="font-label-md text-xs font-bold text-on-surface block mb-1" htmlFor="supervisor-nombre">
                Nombre Completo *
              </label>
              <input
                id="supervisor-nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded py-2 px-3 text-sm focus:border-secondary outline-none"
                placeholder="Dra. María Ospina / Ing. Juan Pérez"
                required
                type="text"
                minLength={3}
              />
            </div>

            <div>
              <label className="font-label-md text-xs font-bold text-on-surface block mb-1" htmlFor="supervisor-email">
                Correo Electrónico Institucional o Personal *
              </label>
              <input
                id="supervisor-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded py-2 px-3 text-sm focus:border-secondary outline-none"
                placeholder="maria.ospina@cruzroja.org.co"
                required
                type="email"
              />
            </div>

            <div>
              <label className="font-label-md text-xs font-bold text-on-surface block mb-1" htmlFor="supervisor-organizacion">
                Organización, Colectivo o Especialidad (Opcional)
              </label>
              <input
                id="supervisor-organizacion"
                value={organizacion}
                onChange={(e) => setOrganizacion(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded py-2 px-3 text-sm focus:border-secondary outline-none"
                placeholder="Cruz Roja / Defensa Civil / Colegio Médico / Psicólogo de Urgencias"
                type="text"
              />
            </div>

            <div>
              <label className="font-label-md text-xs font-bold text-on-surface block mb-1" htmlFor="supervisor-motivacion">
                Experiencia o Justificación de Soporte *
              </label>
              <textarea
                id="supervisor-motivacion"
                value={motivacion}
                onChange={(e) => setMotivacion(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded py-2 px-3 text-sm focus:border-secondary outline-none min-h-[90px]"
                placeholder="Describe brevemente cómo puedes apoyar en la validación de reportes de emergencia y coordinación comunitaria..."
                required
                minLength={10}
              />
            </div>

            {/* Cloudflare Turnstile Anti-bot Protection */}
            <TurnstileWidget onSuccess={(token) => setCaptchaToken(token)} />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-secondary text-on-secondary font-label-md text-xs font-bold uppercase tracking-wider py-3 rounded hover:bg-secondary-container transition-colors flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <span>{loading ? 'Enviando Postulación...' : 'Enviar Postulación como Moderador'}</span>
              <span className="material-symbols-outlined text-base">how_to_reg</span>
            </button>

            <footer className="border-t border-outline-variant pt-3 flex items-center justify-between text-xs">
              <Link href="/admin/login" className="text-secondary hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">arrow_back</span>
                ¿Ya tienes cuenta? Ingresar
              </Link>
              <Link href="/" className="text-on-surface-variant hover:underline">
                Sitio público
              </Link>
            </footer>
          </form>
        )}
      </div>
    </div>
  );
}
