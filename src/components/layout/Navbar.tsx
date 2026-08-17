'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { LanguageSelector } from './LanguageSelector';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, language, setLanguage } = useTranslation();

  const navItems = [
    { label: t.nav.hub, href: '/' },
    { label: t.nav.ideas, href: '/ideas' },
    { label: t.nav.iniciativas, href: '/iniciativas' },
    { label: t.nav.busqueda, href: '/busqueda' },
    { label: t.nav.voluntarios, href: '/voluntarios' },
    { label: t.nav.recursos, href: '/recursos' },
    { label: t.nav.acerca, href: '/sobre-nosotros' },
  ];

  // Desduplicación contextual del FAB: se oculta en el Hub '/', Banco de Ideas '/ideas', formulario '/ideas/nueva' y '/admin'
  const isHiddenOnRoute =
    pathname === '/' ||
    pathname === '/ideas' ||
    pathname === '/ideas/nueva' ||
    pathname.startsWith('/admin');
  const shouldShowFab = !isHiddenOnRoute;

  return (
    <>
      <header className="sticky top-0 z-40 bg-surface dark:bg-surface-dim border-b border-outline-variant py-2.5 md:py-base w-full shadow-sm">
        <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop flex justify-between items-center">
          {/* Brand Logo */}
          <div className="flex items-center gap-stack-md shrink-0">
            <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group">
              <span className="material-symbols-outlined text-primary text-xl sm:text-2xl group-hover:scale-110 transition-transform">
                emergency
              </span>
              <h1 className="font-headline-md text-sm sm:text-headline-md font-bold text-primary tracking-tight flex items-center">
                ActuemosYa<span className="inline-flex"><span className="text-[#D97706]">Col</span><span className="text-secondary">omb</span><span className="text-primary">ia</span></span>
              </h1>
            </Link>

            {/* Desktop Navigation - Clean single line */}
            <nav className="hidden lg:flex gap-1 xl:gap-2 items-center ml-4" aria-label="Navegación principal">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`font-body-md text-xs xl:text-sm transition-colors px-2.5 py-1.5 rounded active:scale-95 duration-200 ${
                      isActive
                        ? 'text-primary font-bold bg-primary/10 border-b-2 border-primary'
                        : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Actions & Language Popover (Desktop) & Mobile Toggle */}
          <div className="flex items-center gap-2 md:gap-stack-md shrink-0">
            {/* Selector solo visible en desktop */}
            <LanguageSelector className="hidden lg:inline-block" />

            <Link
              href="/ideas/nueva"
              className="hidden sm:inline-flex bg-primary text-on-primary font-label-md text-xs md:text-label-md font-bold uppercase px-3.5 md:px-4 py-2 rounded hover:bg-primary-container transition-colors shadow-sm active:scale-95"
            >
              {t.nav.proponerIdea}
            </Link>

            {/* Mobile menu hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded text-on-surface-variant hover:bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label={mobileMenuOpen ? t.nav.cerrarMenu : t.nav.menu}
              aria-expanded={mobileMenuOpen}
            >
              <span className="material-symbols-outlined">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-surface-container-low border-b border-outline-variant px-margin-mobile py-4 animate-in fade-in slide-in-from-top-2">
            <nav className="flex flex-col gap-1.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2.5 rounded-xl font-body-md text-body-md transition-colors flex items-center justify-between ${
                      isActive
                        ? 'bg-primary text-white font-bold'
                        : 'text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && <span className="material-symbols-outlined text-sm">check</span>}
                  </Link>
                );
              })}

              <Link
                href="/ideas/nueva"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 text-center bg-primary text-on-primary font-label-md text-sm font-bold uppercase py-2.5 rounded-xl hover:bg-primary-container transition-colors shadow-sm"
              >
                {t.nav.proponerIdea}
              </Link>

              {/* Selector de idioma integrado en móvil */}
              <div className="pt-3 mt-2 border-t border-outline-variant flex items-center justify-between px-1">
                <span className="font-label-sm text-xs font-bold text-on-surface-variant flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-primary">language</span>
                  <span>{t.common.idioma || 'Idioma'}</span>
                </span>
                <div className="flex items-center gap-1 bg-surface border border-outline-variant p-1 rounded-xl shadow-xs">
                  <button
                    type="button"
                    onClick={() => setLanguage('es')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      language === 'es'
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    <span>🇨🇴</span>
                    <span>Español</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      language === 'en'
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    <span>🇺🇸</span>
                    <span>English</span>
                  </button>
                </div>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Mobile Floating Action Button (FAB) con desduplicación inteligente */}
      {shouldShowFab && (
        <Link
          href="/ideas/nueva"
          className="md:hidden fixed bottom-6 right-6 z-40 bg-primary text-on-primary font-label-md text-xs font-bold uppercase px-4 py-3 rounded-full shadow-xl hover:bg-primary-container transition-all active:scale-95 flex items-center gap-2 border border-primary/20"
          aria-label={t.nav.proponerIdea}
        >
          <span className="material-symbols-outlined text-base font-bold">add</span>
          <span>{t.nav.proponerIdea}</span>
        </Link>
      )}
    </>
  );
}
