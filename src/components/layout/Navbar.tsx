'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Hub', href: '/' },
    { label: 'Ideas', href: '/ideas' },
    { label: 'Iniciativas', href: '/iniciativas' },
    { label: 'Búsqueda', href: '/busqueda' },
    { label: 'Voluntarios', href: '/voluntarios' },
    { label: 'Recursos', href: '/recursos' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-surface dark:bg-surface-dim border-b border-outline-variant py-base w-full shadow-sm">
      <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop flex justify-between items-center">
        {/* Brand Logo */}
        <div className="flex items-center gap-stack-md">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="material-symbols-outlined text-primary text-2xl group-hover:scale-110 transition-transform">
              emergency
            </span>
            <h1 className="font-headline-md text-headline-md font-bold text-primary tracking-tight flex items-center">
              ActuemosYa<span className="inline-flex"><span className="text-[#D97706]">Col</span><span className="text-secondary">omb</span><span className="text-primary">ia</span></span>
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-gutter items-center ml-4" aria-label="Navegación principal">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`font-body-md text-body-md transition-colors px-base py-1 rounded active:scale-95 duration-200 ${
                    isActive
                      ? 'text-primary font-bold border-b-2 border-primary'
                      : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Action button & Mobile Toggle */}
        <div className="flex items-center gap-stack-sm md:gap-stack-md">
          <Link
            href="/ideas/nueva"
            className="bg-primary text-on-primary font-label-md text-label-md font-bold uppercase px-4 py-2 rounded hover:bg-primary-container transition-colors shadow-sm active:scale-95"
          >
            Proponer Idea
          </Link>

          {/* Mobile menu hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded text-on-surface-variant hover:bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Abrir menú de navegación"
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
        <div className="md:hidden bg-surface-container-low border-b border-outline-variant px-margin-mobile py-4 animate-in fade-in slide-in-from-top-2">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2.5 rounded font-body-md text-body-md transition-colors ${
                    isActive
                      ? 'bg-primary-fixed text-on-primary-fixed font-bold'
                      : 'text-on-surface hover:bg-surface-container'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
