'use client';

import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          'error-callback'?: (err?: string) => void;
          'expired-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
          size?: 'normal' | 'compact' | 'flexible';
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

export interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onError?: (error?: string) => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
}

export function TurnstileWidget({
  onSuccess,
  onError,
  onExpire,
  theme = 'light',
  className = '',
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Si no hay llave de Turnstile configurada (ej. desarrollo local), emitimos un token de bypass
    if (!siteKey || siteKey.includes('tu_site_key') || siteKey.includes('test_')) {
      onSuccess('dev-token');
      return;
    }

    let isMounted = true;

    function initWidget() {
      if (!containerRef.current || !window.turnstile || widgetIdRef.current || !siteKey) return;

      try {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => {
            if (isMounted) onSuccess(token);
          },
          'error-callback': (err) => {
            if (isMounted && onError) onError(err);
          },
          'expired-callback': () => {
            if (isMounted && onExpire) onExpire();
          },
          theme,
        });
      } catch (err) {
        console.warn('⚠️ Error al renderizar Cloudflare Turnstile:', err);
      }
    }

    // Si el script ya existe y turnstile está listo
    if (window.turnstile) {
      initWidget();
    } else {
      // Cargar script de Cloudflare Turnstile de forma asíncrona
      const scriptId = 'cf-turnstile-script';
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;

      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      const checkInterval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(checkInterval);
          initWidget();
        }
      }, 100);

      return () => {
        clearInterval(checkInterval);
        isMounted = false;
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
            widgetIdRef.current = null;
          } catch {
            // Ignorar errores de limpieza
          }
        }
      };
    }

    return () => {
      isMounted = false;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        } catch {
          // Ignorar errores de limpieza
        }
      }
    };
  }, [isClient, siteKey, onSuccess, onError, onExpire, theme]);

  if (!isClient) {
    return null;
  }

  // En entorno local/dev sin keys reales de Cloudflare
  if (!siteKey || siteKey.includes('tu_site_key') || siteKey.includes('test_')) {
    return (
      <div className={`flex items-center gap-2 p-2.5 bg-surface-container-low border border-outline-variant/60 rounded-lg text-xs text-on-surface-variant ${className}`}>
        <span className="material-symbols-outlined text-green-600 text-sm">verified_user</span>
        <span>
          <strong className="font-semibold text-on-surface">Protección Anti-Bot:</strong> Verificación cívica activa (Bypass local)
        </span>
      </div>
    );
  }

  return (
    <div className={`my-2 flex justify-start ${className}`}>
      <div ref={containerRef} className="min-h-[65px]" />
    </div>
  );
}
