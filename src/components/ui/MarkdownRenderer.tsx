import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Componente ligero y seguro para renderizado de Markdown enriquecido (sin dependencias externas).
 * Soporta títulos, negritas, cursivas, listas con viñetas, citas, enlaces seguros y saltos de línea.
 */
export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  if (!content) return null;

  // Función para parsear elementos inline (negritas, cursivas, enlaces, código inline)
  const parseInline = (text: string): React.ReactNode[] => {
    const elements: React.ReactNode[] = [];
    let remaining = text;
    let keyIndex = 0;

    // Expresión regular combinada para:
    // 1. Enlaces: [texto](url)
    // 2. Negrita: **texto**
    // 3. Cursiva: *texto*
    // 4. Código inline: `código`
    const inlineRegex = /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(`([^`]+)`)/;

    while (remaining.length > 0) {
      const match = inlineRegex.exec(remaining);
      if (!match) {
        elements.push(remaining);
        break;
      }

      const matchIndex = match.index;
      if (matchIndex > 0) {
        elements.push(remaining.substring(0, matchIndex));
      }

      const [fullMatch, isLink, linkText, linkUrl, isBold, boldText, isItalic, italicText, isCode, codeText] = match;

      if (isLink) {
        elements.push(
          <a
            key={`link-${keyIndex++}`}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary font-semibold hover:underline inline-flex items-center gap-0.5 hover:text-primary transition-colors"
          >
            <span>{linkText}</span>
            <span className="material-symbols-outlined text-[12px] leading-none inline-block">open_in_new</span>
          </a>
        );
      } else if (isBold) {
        elements.push(
          <strong key={`bold-${keyIndex++}`} className="font-bold text-on-surface">
            {boldText}
          </strong>
        );
      } else if (isItalic) {
        elements.push(
          <em key={`italic-${keyIndex++}`} className="italic">
            {italicText}
          </em>
        );
      } else if (isCode) {
        elements.push(
          <code key={`code-${keyIndex++}`} className="bg-surface-variant text-on-surface-variant font-mono text-[11px] px-1.5 py-0.5 rounded border border-outline-variant">
            {codeText}
          </code>
        );
      }

      remaining = remaining.substring(matchIndex + fullMatch.length);
    }

    return elements;
  };

  // Dividir el contenido en bloques (párrafos, títulos, listas)
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  let currentListItems: React.ReactNode[] = [];
  let isOrderedList = false;

  const flushList = () => {
    if (currentListItems.length > 0) {
      const ListTag = isOrderedList ? 'ol' : 'ul';
      blocks.push(
        <ListTag
          key={`list-${blocks.length}`}
          className={`space-y-1.5 my-2.5 pl-5 ${
            isOrderedList ? 'list-decimal' : 'list-disc marker:text-secondary'
          }`}
        >
          {currentListItems}
        </ListTag>
      );
      currentListItems = [];
    }
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    // Línea vacía
    if (!trimmed) {
      flushList();
      return;
    }

    // Listas no ordenadas (- item o * item)
    const bulletMatch = line.match(/^(\s*)[-*]\s+(.+)$/);
    if (bulletMatch) {
      if (isOrderedList) flushList();
      isOrderedList = false;
      currentListItems.push(
        <li key={`li-${idx}`} className="leading-relaxed">
          {parseInline(bulletMatch[2])}
        </li>
      );
      return;
    }

    // Listas ordenadas (1. item)
    const orderedMatch = line.match(/^(\s*)\d+\.\s+(.+)$/);
    if (orderedMatch) {
      if (!isOrderedList) flushList();
      isOrderedList = true;
      currentListItems.push(
        <li key={`oli-${idx}`} className="leading-relaxed">
          {parseInline(orderedMatch[2])}
        </li>
      );
      return;
    }

    // Si no es lista, cerramos cualquier lista abierta
    flushList();

    // Encabezados
    if (line.startsWith('### ')) {
      blocks.push(
        <h3 key={`h3-${idx}`} className="font-headline-md text-base font-bold text-on-surface mt-4 mb-1.5">
          {parseInline(line.replace(/^###\s+/, ''))}
        </h3>
      );
    } else if (line.startsWith('## ')) {
      blocks.push(
        <h2 key={`h2-${idx}`} className="font-headline-md text-lg font-bold text-on-surface mt-5 mb-2 border-b border-outline-variant pb-1">
          {parseInline(line.replace(/^##\s+/, ''))}
        </h2>
      );
    } else if (line.startsWith('# ')) {
      blocks.push(
        <h1 key={`h1-${idx}`} className="font-headline-lg text-xl font-bold text-on-surface mt-6 mb-3">
          {parseInline(line.replace(/^#\s+/, ''))}
        </h1>
      );
    } else if (line.startsWith('> ')) {
      blocks.push(
        <blockquote
          key={`quote-${idx}`}
          className="border-l-4 border-secondary bg-surface-container-low pl-3.5 py-1.5 my-2.5 italic text-on-surface-variant rounded-r"
        >
          {parseInline(line.replace(/^>\s+/, ''))}
        </blockquote>
      );
    } else {
      // Párrafo estándar
      blocks.push(
        <p key={`p-${idx}`} className="leading-relaxed mb-2.5">
          {parseInline(line)}
        </p>
      );
    }
  });

  flushList();

  return <div className={`text-on-surface text-sm space-y-1 ${className}`}>{blocks}</div>;
}
