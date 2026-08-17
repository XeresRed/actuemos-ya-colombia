'use client';

import React, { useEffect } from 'react';
import type { Iniciativa } from '@/core/domain/iniciativa';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface IniciativaDetailModalProps {
  iniciativa: Iniciativa | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Renderizador seguro de Markdown liviano para descripciones de iniciativas
 */
function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null;

  const lines = content.split('\n');

  return (
    <div className="space-y-2.5 text-xs sm:text-sm text-on-surface leading-relaxed font-body-md">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1.5" />;

        // Encabezados H3 / H4
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={idx} className="font-headline-md font-bold text-sm text-secondary pt-1">
              {trimmed.substring(4)}
            </h4>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={idx} className="font-headline-md font-bold text-base text-primary pt-1.5 border-b border-outline-variant/60 pb-0.5">
              {trimmed.substring(3)}
            </h3>
          );
        }

        // Listas con viñetas
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-primary font-bold text-base leading-none select-none">•</span>
              <span>{renderInlineMarkdown(trimmed.substring(2))}</span>
            </div>
          );
        }

        // Citas / Bloques destacados
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote key={idx} className="border-l-4 border-secondary/40 pl-3 py-1 bg-surface-container-low rounded-r text-on-surface-variant italic my-1">
              {renderInlineMarkdown(trimmed.substring(2))}
            </blockquote>
          );
        }

        return <p key={idx}>{renderInlineMarkdown(trimmed)}</p>;
      })}
    </div>
  );
}

function renderInlineMarkdown(text: string): React.ReactNode {
  // Parser simple para **negrita**, *cursiva* y [enlaces](url)
  const parts: React.ReactNode[] = [];
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(formatBoldItalic(text.substring(lastIndex, match.index)));
    }
    const [, label, url] = match;
    parts.push(
      <a
        key={match.index}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary font-semibold underline hover:text-primary-container transition-colors inline-flex items-center gap-0.5"
      >
        <span>{label}</span>
        <span className="material-symbols-outlined text-[10px]">open_in_new</span>
      </a>
    );
    lastIndex = linkRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(formatBoldItalic(text.substring(lastIndex)));
  }

  return <>{parts}</>;
}

function formatBoldItalic(text: string): React.ReactNode {
  // Procesa **bold**
  const boldParts = text.split(/(\*\*[^*]+\*\*)/g);
  return boldParts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-on-surface">{part.slice(2, -2)}</strong>;
    }
    // Procesa *italic*
    const italicParts = part.split(/(\*[^*]+\*)/g);
    return italicParts.map((subPart, j) => {
      if (subPart.startsWith('*') && subPart.endsWith('*')) {
        return <em key={j} className="italic text-on-surface-variant">{subPart.slice(1, -1)}</em>;
      }
      return subPart;
    });
  });
}

export function IniciativaDetailModal({
  iniciativa,
  isOpen,
  onClose,
}: IniciativaDetailModalProps) {
  const { t } = useTranslation();

  // Escape key handler
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !iniciativa) return null;

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${iniciativa.nombre} — ActuemosYaColombia`,
          text: iniciativa.descripcion.slice(0, 140),
          url: window.location.href,
        });
      } catch {
        // Ignorar cancelación
      }
    }
  };

  const getCategoryBadge = (categoria: string) => {
    switch (categoria.toLowerCase()) {
      case 'organismo_oficial':
        return <span className="bg-red-100 text-red-800 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded">Oficial</span>;
      case 'ong':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded">ONG</span>;
      case 'colectivo':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded">Colectivo</span>;
      case 'campaña':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded">Campaña</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded">{categoria}</span>;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-iniciativa-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Card */}
      <div
        className="relative z-10 w-full max-w-2xl bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 sm:p-6 md:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-start justify-between gap-3 border-b border-outline-variant pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              {getCategoryBadge(iniciativa.categoria)}
              <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-0.5 rounded text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-ping"></span>
                {t.iniciativas.activaEnCampo}
              </span>
            </div>
            <h2 id="modal-iniciativa-title" className="font-headline-md text-lg sm:text-xl font-bold text-on-surface">
              {iniciativa.nombre}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
            aria-label={t.actions.cerrar}
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Metadatos y Ubicación Física */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/60 text-xs">
          <div className="flex items-center gap-2 text-on-surface">
            <span className="material-symbols-outlined text-secondary text-base shrink-0">location_on</span>
            <span className="truncate">
              <strong>{t.iniciativas.cobertura}</strong> {iniciativa.coberturaGeografica || t.common.nacional}
            </span>
          </div>

          {iniciativa.contacto && (
            <div className="flex items-center gap-2 text-on-surface">
              <span className="material-symbols-outlined text-secondary text-base shrink-0">call</span>
              <span className="truncate">
                <strong>{t.iniciativas.contacto}</strong> {iniciativa.contacto}
              </span>
            </div>
          )}

          {iniciativa.direccion && (
            <div className="flex items-center gap-2 text-on-surface sm:col-span-2 bg-white/80 p-2 rounded-lg border border-outline-variant/40">
              <span className="material-symbols-outlined text-primary text-base shrink-0">pin_drop</span>
              <span>
                <strong>{t.iniciativas.modalPuntoEncuentro}:</strong> {iniciativa.direccion}
              </span>
            </div>
          )}

          {iniciativa.fechaEvento && (
            <div className="flex items-center gap-2 text-on-surface sm:col-span-2 bg-amber-50 p-2 rounded-lg border border-amber-200/60 text-amber-950">
              <span className="material-symbols-outlined text-amber-700 text-base shrink-0">event</span>
              <span>
                <strong>{t.iniciativas.modalFechaHora}:</strong> {iniciativa.fechaEvento}
              </span>
            </div>
          )}
        </div>

        {/* Descripción con Formato Markdown */}
        <div className="space-y-2">
          <h3 className="font-label-md text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            {t.iniciativas.modalDescripcion}
          </h3>
          <div className="bg-surface p-4 rounded-xl border border-outline-variant">
            <MarkdownRenderer content={iniciativa.descripcion} />
          </div>
        </div>

        {/* Footer con Acciones */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-outline-variant">
          <span className="text-[11px] text-on-surface-variant font-medium">
            {t.common.verificadaPorAYC}
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="px-3.5 py-2 bg-surface-container text-on-surface font-label-md text-xs font-bold rounded-lg hover:bg-surface-container-high transition-colors flex items-center gap-1.5 border border-outline-variant"
            >
              <span className="material-symbols-outlined text-sm">share</span>
              <span>{t.actions.compartir}</span>
            </button>

            <a
              href={iniciativa.urlOficial.startsWith('http') ? iniciativa.urlOficial : `https://${iniciativa.urlOficial}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-primary text-on-primary font-label-md text-xs font-bold uppercase rounded-lg hover:bg-primary-container transition-colors inline-flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <span>{t.iniciativas.modalCanalOficial}</span>
              <span className="material-symbols-outlined text-xs">open_in_new</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IniciativaDetailModal;
