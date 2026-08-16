'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [devLoading, setDevLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/magic-link/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message || 'Error al solicitar el enlace de acceso.');
      }

      setSent(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  const handleDevLogin = async () => {
    setErrorMsg(null);
    setDevLoading(true);

    try {
      const res = await fetch('/api/auth/dev-login', {
        method: 'POST',
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message || 'Error en el acceso de desarrollo.');
      }

      router.push('/admin');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al iniciar sesión.');
    } finally {
      setDevLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-margin-mobile md:p-margin-desktop py-12">
      <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg shadow-sm flex flex-col gap-stack-lg relative overflow-hidden">
        {/* Subtle Institutional Brand Element */}
        <div className="absolute top-0 left-0 w-full h-2 bg-secondary"></div>

        <header className="flex flex-col items-center text-center gap-base">
          <span className="material-symbols-outlined text-secondary text-5xl mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>
            admin_panel_settings
          </span>
          <h1 className="font-headline-lg text-2xl font-bold text-on-surface">
            Acceso Administrativo
          </h1>
          <p className="font-body-md text-xs text-on-surface-variant">
            Portal seguro para moderadores y coordinadores de ActuemosYa<span className="inline-flex font-semibold"><span className="text-[#D97706]">Col</span><span className="text-secondary">omb</span><span className="text-primary">ia</span></span>.
          </p>
        </header>

        <section className="flex flex-col gap-stack-md">
          {errorMsg ? (
            <div className="bg-error-container text-on-error-container p-3 rounded-lg text-xs flex items-center gap-2 animate-in fade-in">
              <span className="material-symbols-outlined text-sm shrink-0">error</span>
              <span>{errorMsg}</span>
            </div>
          ) : null}

          <div className="bg-surface-container-low border border-secondary-fixed rounded-lg p-3 flex items-start gap-2 text-xs">
            <span className="material-symbols-outlined text-secondary text-base mt-0.5 shrink-0">
              info
            </span>
            <div>
              <h2 className="font-label-md font-bold text-on-surface">Autenticación Passwordless</h2>
              <p className="text-on-surface-variant mt-0.5">
                Ingresa tu correo institucional o registrado. Enviaremos un Magic Link válido por 15 minutos. Tu sesión se mantendrá activa por 30 días.
              </p>
            </div>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="font-label-md text-xs font-bold text-on-surface block mb-1" htmlFor="admin-email">
                  Correo Electrónico Autorizado
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">
                    mail
                  </span>
                  <input
                    id="admin-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-surface border border-outline-variant rounded py-2.5 pl-9 pr-4 text-sm focus:border-secondary outline-none"
                    placeholder="supervisor@actuemosya.org"
                    required
                    type="email"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-secondary text-on-secondary font-label-md text-xs font-bold uppercase tracking-wider py-3 rounded hover:bg-secondary-container transition-colors flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <span>{loading ? 'Enviando Enlace...' : 'Enviar Enlace Mágico'}</span>
                <span className="material-symbols-outlined text-base">send</span>
              </button>

              {/* Botón de Acceso Rápido de Desarrollo (Local / Dev) */}
              <button
                type="button"
                onClick={handleDevLogin}
                disabled={devLoading}
                className="w-full bg-surface-container border border-outline text-on-surface font-label-md text-xs font-bold py-2 rounded hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1.5"
                title="Solo disponible en entorno de desarrollo"
              >
                <span className="material-symbols-outlined text-amber-500 text-sm">bolt</span>
                <span>{devLoading ? 'Ingresando...' : '⚡ Acceso Rápido de Desarrollo'}</span>
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center text-center gap-2 py-4 animate-in fade-in">
              <span className="material-symbols-outlined text-green-700 text-5xl mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
              <h3 className="font-headline-md text-lg font-bold text-on-surface">Enlace Enviado</h3>
              <p className="font-body-md text-xs text-on-surface-variant">
                Hemos enviado un Magic Link a <strong>{email}</strong>. El enlace expirará en 15 minutos.
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="text-secondary font-label-sm text-xs hover:underline mt-2"
              >
                ¿No recibiste el correo o deseas usar otra cuenta? Intentar de nuevo
              </button>
            </div>
          )}

          {/* Enlace de postulación para nuevos supervisores */}
          <div className="bg-surface-container-lowest border border-dashed border-outline-variant rounded-lg p-3 text-center">
            <p className="text-xs text-on-surface-variant mb-1.5">
              ¿Deseas colaborar como supervisor o representas a una ONG?
            </p>
            <Link
              href="/admin/registro"
              className="text-secondary font-label-md text-xs font-bold hover:underline inline-flex items-center gap-1"
            >
              <span>Postúlate como Moderador aquí</span>
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </Link>
          </div>
        </section>

        <footer className="border-t border-outline-variant pt-3 flex flex-col items-center gap-1 text-xs">
          <Link href="/" className="text-tertiary hover:underline flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">arrow_back</span>
            Volver al sitio público
          </Link>
        </footer>
      </div>
    </div>
  );
}
