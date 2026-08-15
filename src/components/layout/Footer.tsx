import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-surface-container-high border-t border-outline-variant py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary text-xl">
                emergency
              </span>
              <h3 className="font-headline-md text-headline-md font-bold text-primary">
                ActuemosYa<span className="text-secondary">Colombia</span>
              </h3>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
              Plataforma tecnológica comunitaria y neutral de respuesta rápida ante emergencias y desastres naturales en Colombia.
            </p>
          </div>

          <div>
            <h4 className="font-label-md text-label-md font-bold text-on-surface mb-3 uppercase tracking-wider">
              Navegación
            </h4>
            <ul className="space-y-2 font-body-md text-sm text-on-surface-variant">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">Hub de Emergencia</Link>
              </li>
              <li>
                <Link href="/ideas" className="hover:text-primary transition-colors">Banco de Ideas</Link>
              </li>
              <li>
                <Link href="/iniciativas" className="hover:text-primary transition-colors">Iniciativas Activas</Link>
              </li>
              <li>
                <Link href="/busqueda" className="hover:text-primary transition-colors">Búsqueda Humanitaria</Link>
              </li>
              <li>
                <Link href="/voluntarios" className="hover:text-primary transition-colors">Voluntariado Técnico</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-label-md text-label-md font-bold text-on-surface mb-3 uppercase tracking-wider">
              Seguridad & Enlaces
            </h4>
            <ul className="space-y-2 font-body-md text-sm text-on-surface-variant">
              <li>
                <Link href="/admin/login" className="hover:text-primary transition-colors">Acceso Moderadores</Link>
              </li>
              <li>
                <a href="https://cruzrojacolombiana.org" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1">
                  Cruz Roja Colombiana <span className="material-symbols-outlined text-xs">open_in_new</span>
                </a>
              </li>
              <li>
                <a href="http://portal.gestiondelriesgo.gov.co/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1">
                  UNGRD <span className="material-symbols-outlined text-xs">open_in_new</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-outline-variant/60 flex flex-col sm:flex-row justify-between items-center text-xs text-on-surface-variant gap-4">
          <p>© {new Date().getFullYear()} ActuemosYaColombia. Plataforma de código abierto bajo licencia MIT.</p>
          <p className="flex items-center gap-1 text-tertiary font-medium">
            <span className="material-symbols-outlined text-sm">bolt</span>
            Optimizado para bajo consumo de datos y alta resiliencia
          </p>
        </div>
      </div>
    </footer>
  );
}
