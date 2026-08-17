'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/LanguageContext';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-surface-container-high border-t border-outline-variant py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary text-xl">
                emergency
              </span>
              <h3 className="font-headline-md text-headline-md font-bold text-primary flex items-center">
                ActuemosYa<span className="inline-flex"><span className="text-[#D97706]">Col</span><span className="text-secondary">omb</span><span className="text-primary">ia</span></span>
              </h3>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
              {t.footer.descripcion}
            </p>
            <p className="font-body-md text-xs text-on-surface-variant/80 mt-2">
              {t.footer.iniciativaCivica}
            </p>
          </div>

          <div>
            <h4 className="font-label-md text-label-md font-bold text-on-surface mb-3 uppercase tracking-wider">
              {t.nav.menu}
            </h4>
            <ul className="space-y-2 font-body-md text-sm text-on-surface-variant">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">{t.nav.hub}</Link>
              </li>
              <li>
                <Link href="/ideas" className="hover:text-primary transition-colors">{t.nav.ideas}</Link>
              </li>
              <li>
                <Link href="/iniciativas" className="hover:text-primary transition-colors">{t.nav.iniciativas}</Link>
              </li>
              <li>
                <Link href="/busqueda" className="hover:text-primary transition-colors">{t.nav.busqueda}</Link>
              </li>
              <li>
                <Link href="/voluntarios" className="hover:text-primary transition-colors">{t.nav.voluntarios}</Link>
              </li>
              <li>
                <Link href="/recursos" className="hover:text-primary transition-colors font-medium">{t.nav.recursos}</Link>
              </li>
              <li>
                <Link href="/sobre-nosotros" className="hover:text-primary transition-colors font-semibold text-secondary">{t.nav.acerca}</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-label-md text-label-md font-bold text-on-surface mb-3 uppercase tracking-wider">
              {t.common.oficial}
            </h4>
            <ul className="space-y-2 font-body-md text-sm text-on-surface-variant">
              <li>
                <a href="http://portal.gestiondelriesgo.gov.co/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1">
                  UNGRD (Sala de Crisis) <span className="material-symbols-outlined text-xs">open_in_new</span>
                </a>
              </li>
              <li>
                <a href="https://cruzrojacolombiana.org" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1">
                  Cruz Roja Colombiana (RCF) <span className="material-symbols-outlined text-xs">open_in_new</span>
                </a>
              </li>
              <li>
                <a href="https://www.unidadvictimas.gov.co/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1">
                  Unidad para las Víctimas (RUV) <span className="material-symbols-outlined text-xs">open_in_new</span>
                </a>
              </li>
              <li>
                <a href="https://www.defensacivil.gov.co/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1">
                  Defensa Civil Colombiana <span className="material-symbols-outlined text-xs">open_in_new</span>
                </a>
              </li>
              <li>
                <Link href="/admin/registro" className="hover:text-primary transition-colors inline-block pt-1 text-xs opacity-75">
                  Postularse como Moderador
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-primary transition-colors inline-block text-xs opacity-75">
                  {t.nav.admin}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-outline-variant/60 flex flex-col sm:flex-row justify-between items-center text-xs text-on-surface-variant gap-4">
          <p>© {new Date().getFullYear()} {t.footer.derechosReservados}</p>
          <p className="flex items-center gap-1 text-tertiary font-medium">
            <span className="material-symbols-outlined text-sm">bolt</span>
            Optimizado para bajo consumo de datos y alta resiliencia
          </p>
        </div>
      </div>
    </footer>
  );
}
