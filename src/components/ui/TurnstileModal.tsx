'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { TurnstileWidget } from './TurnstileWidget';

export interface TurnstileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (token: string) => Promise<void> | void;
  action: string;
  title?: string;
  description?: string;
  theme?: 'light' | 'dark' | 'auto';
}

export const TurnstileModal = React.memo(function TurnstileModal({
  isOpen,
  onClose,
  onVerified,
  action,
  title = 'Verificación de Seguridad',
  description = 'Protegemos la plataforma cívica contra envíos automatizados y spam.',
  theme = 'light',
}: TurnstileModalProps) {
  const [status, setStatus] = useState<'verifying' | 'submitting' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const isExecutingRef = useRef(false);

  // Reset al abrir el modal
  useEffect(() => {
    if (isOpen) {
      setStatus('verifying');
      setErrorMessage(null);
      isExecutingRef.current = false;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, retryKey]);

  // Manejador de tecla Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen && status !== 'submitting') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, status]);

  const handleTurnstileSuccess = useCallback(
    async (token: string) => {
      if (isExecutingRef.current) return;
      isExecutingRef.current = true;
      setStatus('submitting');
      setErrorMessage(null);

      try {
        await onVerified(token);
        setStatus('success');
        setTimeout(() => {
          onClose();
        }, 400);
      } catch (err: any) {
        console.error('Error al procesar formulario verificado:', err);
        setStatus('error');
        setErrorMessage(err?.message || 'Ocurrió un error al enviar la información. Intente nuevamente.');
        isExecutingRef.current = false;
      }
    },
    [onVerified, onClose]
  );

  const handleTurnstileError = useCallback((err?: string) => {
    console.warn('Turnstile reportó error:', err);
    setStatus('error');
    setErrorMessage('No se pudo completar la verificación anti-bot. Por favor reintente.');
    isExecutingRef.current = false;
  }, []);

  const handleRetry = () => {
    setStatus('verifying');
    setErrorMessage(null);
    isExecutingRef.current = false;
    setRetryKey((prev) => prev + 1);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="turnstile-modal-title"
    >
      {/* Backdrop click dismiss (solo si no está enviando) */}
      <div
        className="absolute inset-0"
        onClick={() => {
          if (status !== 'submitting') onClose();
        }}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        className="relative z-10 w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-secondary-container/50 text-secondary rounded-xl shrink-0">
            <span className="material-symbols-outlined text-2xl">verified_user</span>
          </div>
          <div className="flex-1">
            <h3 id="turnstile-modal-title" className="font-headline-md text-base font-bold text-on-surface">
              {title}
            </h3>
            <p className="font-body-md text-xs text-on-surface-variant mt-0.5 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Dynamic Verification Content */}
        <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/60 flex flex-col items-center justify-center min-h-[120px] text-center">
          {status === 'verifying' && (
            <div className="w-full flex flex-col items-center justify-center space-y-2">
              <TurnstileWidget
                key={retryKey}
                action={action}
                theme={theme}
                onSuccess={handleTurnstileSuccess}
                onError={handleTurnstileError}
              />
              <p className="text-[11px] text-on-surface-variant flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span>Verificando autenticidad humana bajo demanda...</span>
              </p>
            </div>
          )}

          {status === 'submitting' && (
            <div className="flex flex-col items-center justify-center space-y-2 py-2">
              <span className="material-symbols-outlined text-3xl animate-spin text-secondary">
                progress_activity
              </span>
              <p className="text-xs font-bold text-on-surface">
                Verificación completada. Enviando información...
              </p>
              <p className="text-[11px] text-on-surface-variant">
                Por favor no cierres esta ventana.
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center justify-center space-y-1.5 py-2 text-green-700 animate-in zoom-in-90 duration-150">
              <span className="material-symbols-outlined text-4xl text-green-600">check_circle</span>
              <p className="text-xs font-bold">¡Verificación y envío exitosos!</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center justify-center space-y-2 text-error py-1">
              <span className="material-symbols-outlined text-3xl">error</span>
              <p className="text-xs font-bold">{errorMessage || 'Error en la verificación'}</p>
              <button
                type="button"
                onClick={handleRetry}
                className="mt-1 px-4 py-1.5 bg-secondary text-on-secondary text-xs font-bold rounded-lg hover:bg-secondary-container transition-colors inline-flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                <span>Reintentar</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer / Cancel Button */}
        <div className="flex items-center justify-end gap-2 pt-1 border-t border-outline-variant/60">
          <button
            type="button"
            disabled={status === 'submitting'}
            onClick={onClose}
            className="px-4 py-2 bg-surface border border-outline text-on-surface text-xs font-semibold rounded-lg hover:bg-surface-variant transition-colors disabled:opacity-40"
          >
            Cancelar y Volver al Formulario
          </button>
        </div>
      </div>
    </div>
  );
});
