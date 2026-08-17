'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/lib/i18n/LanguageContext';

export function LanguageSelector({ className = '' }: { className?: string }) {
  const { language, setLanguage, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera del popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Cerrar con tecla Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectLanguage = (lang: 'es' | 'en') => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Botón de Ícono Discreto */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg border border-outline-variant bg-surface text-on-surface hover:bg-surface-container transition-all flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={t.common.seleccionarIdioma}
        title={t.common.seleccionarIdioma}
      >
        <span className="material-symbols-outlined text-lg text-primary">
          language
        </span>
        <span className="text-xs font-bold uppercase text-on-surface">
          {language}
        </span>
        <span className="material-symbols-outlined text-xs text-on-surface-variant transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>
          expand_more
        </span>
      </button>

      {/* Popover Flotante */}
      {isOpen && (
        <div
          className="absolute right-0 mt-1.5 w-56 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-150"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="px-3 py-1.5 border-b border-outline-variant/60 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
            {t.common.seleccionarIdioma}
          </div>

          <button
            type="button"
            onClick={() => selectLanguage('es')}
            className={`w-full px-3 py-2 text-xs flex items-center justify-between transition-colors ${
              language === 'es'
                ? 'bg-primary/10 text-primary font-bold'
                : 'text-on-surface hover:bg-surface-container'
            }`}
            role="menuitem"
          >
            <span className="flex items-center gap-2">
              <span className="text-base select-none">🇨🇴</span>
              <span>Español (Colombia)</span>
            </span>
            {language === 'es' && (
              <span className="material-symbols-outlined text-sm text-primary font-bold">
                check
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => selectLanguage('en')}
            className={`w-full px-3 py-2 text-xs flex items-center justify-between transition-colors ${
              language === 'en'
                ? 'bg-primary/10 text-primary font-bold'
                : 'text-on-surface hover:bg-surface-container'
            }`}
            role="menuitem"
          >
            <span className="flex items-center gap-2">
              <span className="text-base select-none">🇺🇸</span>
              <span>English (United States)</span>
            </span>
            {language === 'en' && (
              <span className="material-symbols-outlined text-sm text-primary font-bold">
                check
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default LanguageSelector;
