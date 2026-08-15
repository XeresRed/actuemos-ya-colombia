'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSent(true);
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
            Portal seguro para moderadores y coordinadores de ActuemosYaColombia.
          </p>
        </header>

        <section className="flex flex-col gap-stack-md">
          <div className="bg-surface-container-low border border-secondary-fixed rounded-lg p-3 flex items-start gap-2 text-xs">
            <span className="material-symbols-outlined text-secondary text-base mt-0.5 shrink-0">
              info
            </span>
            <div>
              <h2 className="font-label-md font-bold text-on-surface">Autenticación Passwordless</h2>
              <p className="text-on-surface-variant mt-0.5">
                Ingresa tu correo institucional o registrado. Enviaremos un Magic Link válido por 15 minutos. Sin contraseñas guardadas para máxima seguridad.
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
                className="w-full bg-secondary text-on-secondary font-label-md text-xs font-bold uppercase tracking-wider py-3 rounded hover:bg-secondary-container transition-colors flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Enviar Enlace Mágico</span>
                <span className="material-symbols-outlined text-base">send</span>
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
              <Link
                href="/admin"
                className="mt-2 bg-primary text-on-primary font-label-md text-xs font-bold px-4 py-2 rounded hover:bg-primary-container"
              >
                Simular Acceso al Panel de Control →
              </Link>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="text-secondary font-label-sm text-xs hover:underline mt-2"
              >
                ¿No recibiste el correo? Intentar de nuevo
              </button>
            </div>
          )}
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
