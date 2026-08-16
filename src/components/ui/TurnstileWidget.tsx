'use client';

import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string;
          action?: string;
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
  action?: string;
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
}

const CANONICAL_SITE_KEY = '0x4AAAAAAERMwI1eCPwFzmgW';

export const TurnstileWidget = React.memo(function TurnstileWidget({
  onSuccess,
  onError,
  onExpire,
  action,
  theme = 'light',
  className = '',
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || CANONICAL_SITE_KEY;
  const [isClient, setIsClient] = useState(false);

  // Almacenar referencias mutables para evitar re-montaje cuando cambian las props de función
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
    onExpireRef.current = onExpire;
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Si explícitamente se configuró una llave de bypass o test en desarrollo
    if (siteKey.includes('tu_site_key') || siteKey.includes('test_')) {
      onSuccessRef.current?.('dev-token');
      return;
    }

    let isMounted = true;

    function initWidget() {
      if (!containerRef.current || !window.turnstile || widgetIdRef.current || !siteKey) return;

      try {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          action: action || undefined,
          callback: (token: string) => {
            if (isMounted) onSuccessRef.current?.(token);
          },
          'error-callback': (err) => {
            if (isMounted && onErrorRef.current) onErrorRef.current(err);
          },
          'expired-callback': () => {
            if (isMounted && onExpireRef.current) onExpireRef.current();
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
      // Cargar script canónico de Cloudflare Turnstile
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
            // Limpieza segura
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
          // Limpieza segura
        }
      }
    };
  }, [isClient, siteKey, action, theme]);

  if (!isClient) {
    return null;
  }

  // En entorno local/dev sin keys reales de Cloudflare
  if (siteKey.includes('tu_site_key') || siteKey.includes('test_')) {
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
});
