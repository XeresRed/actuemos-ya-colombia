export const SanitizeService = {
  /**
   * Sanitiza contenido Markdown / HTML eliminando etiquetas y atributos maliciosos.
   * Mitiga ataques de Cross-Site Scripting (XSS).
   */
  sanitizeMarkdown(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    let sanitized = input;

    // 1. Eliminar bloques de script y style completos
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

    // 2. Eliminar etiquetas prohibidas peligrosas
    const dangerousTags = [
      'script', 'style', 'iframe', 'frame', 'frameset', 'object', 'embed', 
      'applet', 'form', 'input', 'button', 'select', 'textarea', 'meta', 
      'link', 'base', 'svg', 'math', 'body', 'html', 'head'
    ];

    const tagRegex = new RegExp(`<(/?\\s*(?:${dangerousTags.join('|')})\\b[^>]*)>`, 'gi');
    sanitized = sanitized.replace(tagRegex, '');

    // 3. Eliminar eventos inline on* (onclick, onerror, onload, onmouseover, etc.)
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');

    // 4. Eliminar esquemas de URL peligrosos (javascript:, vbscript:, data:text/html)
    sanitized = sanitized.replace(/(href|src)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*'|javascript:[^\s>]+)/gi, '$1="#"');
    sanitized = sanitized.replace(/(href|src)\s*=\s*(?:"data:[^"]*"|'data:[^']*'|data:[^\s>]+)/gi, '$1="#"');
    sanitized = sanitized.replace(/(href|src)\s*=\s*(?:"vbscript:[^"]*"|'vbscript:[^']*'|vbscript:[^\s>]+)/gi, '$1="#"');

    // 5. Sanitizar enlaces Markdown [texto](javascript:...)
    sanitized = sanitized.replace(/\[([^\]]+)\]\((javascript:[^)]+|data:[^)]+|vbscript:[^)]+)\)/gi, '[$1](#)');

    // 6. Asegurar rel="noopener noreferrer nofollow" en todas las etiquetas <a>
    sanitized = sanitized.replace(/<a\b([^>]*)>/gi, (match, attributes) => {
      // Si ya tiene rel, lo reemplazamos; si no, lo agregamos
      let cleaned = attributes.replace(/\s*rel\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
      return `<a ${cleaned.trim()} rel="noopener noreferrer nofollow" target="_blank">`;
    });

    return sanitized.trim();
  },

  /**
   * Sanitiza texto plano eliminando caracteres de control o tags HTML para títulos y nombres.
   */
  sanitizePlainText(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input
      .replace(/<[^>]*>/g, '') // Eliminar cualquier tag HTML
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Eliminar caracteres de control ASCII
      .trim();
  },
};
