'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Idea, IdeaEstado } from '../../../core/domain/idea';
import type { ComentarioConRespuestas } from '../../../core/domain/comentario';
import { TurnstileWidget } from '../../../components/ui/TurnstileWidget';

interface IdeaDetailPageProps {
  params: {
    id: string;
  };
}

export default function IdeaDetailPage({ params }: IdeaDetailPageProps) {
  const [idea, setIdea] = useState<Idea | null>(null);
  const [comentarios, setComentarios] = useState<ComentarioConRespuestas[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Formulario de comentario
  const [commentText, setCommentText] = useState('');
  const [autorEmail, setAutorEmail] = useState('');
  const [isAnonimo, setIsAnonimo] = useState(true);
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string>('dev-token');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadIdeaAndComments() {
      try {
        const res = await fetch(`/api/ideas/${params.id}`);
        const json = await res.json();

        if (!res.ok || !json.ok) {
          throw new Error(json.error?.message || 'No fue posible cargar la propuesta.');
        }

        setIdea(json.data.idea);
        setComentarios(json.data.comentarios || []);
      } catch (err: any) {
        setErrorMsg(err.message || 'Error al cargar los datos.');
      } finally {
        setLoading(false);
      }
    }

    loadIdeaAndComments();
  }, [params.id]);

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share && idea) {
      navigator.share({
        title: `${idea.titulo} — ActuemosYaColombia`,
        text: `Apoya esta iniciativa comunitaria ante la emergencia: ${idea.titulo}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);

    try {
      const res = await fetch(`/api/ideas/${params.id}/comentarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaId: params.id,
          comentarioPadreId: replyToId || null,
          contenidoMarkdown: commentText,
          esAnonimo: isAnonimo,
          autorEmail: !isAnonimo && autorEmail ? autorEmail : null,
          captchaToken,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message || 'Error al publicar comentario.');
      }

      // Recargar comentarios
      const refreshRes = await fetch(`/api/ideas/${params.id}`);
      const refreshJson = await refreshRes.json();
      if (refreshJson.ok) {
        setComentarios(refreshJson.data.comentarios || []);
      }

      setCommentText('');
      setReplyToId(null);
    } catch (err: any) {
      alert(err.message || 'Error al enviar comentario.');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-16">
        <div className="flex flex-col items-center gap-2">
          <span className="material-symbols-outlined text-4xl animate-spin text-secondary">refresh</span>
          <p className="text-sm text-on-surface-variant font-medium">Cargando propuesta comunitaria...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !idea) {
    return (
      <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-16 text-center">
        <span className="material-symbols-outlined text-5xl text-error mb-2">error</span>
        <h2 className="text-xl font-bold text-on-surface mb-1">Propuesta no disponible</h2>
        <p className="text-xs text-on-surface-variant mb-6">{errorMsg || 'La propuesta no existe o se encuentra en revisión.'}</p>
        <Link
          href="/ideas"
          className="bg-secondary text-on-secondary font-label-md text-xs font-bold uppercase px-6 py-2.5 rounded-lg hover:bg-secondary-container"
        >
          Volver al Banco de Ideas
        </Link>
      </div>
    );
  }

  const getStepActiveIndex = (estado: IdeaEstado) => {
    switch (estado) {
      case 'borrador': return 0;
      case 'idea': return 1;
      case 'promovida': return 2;
      case 'en_accion': return 3;
      case 'cerrada':
      case 'redirigida': return 4;
      default: return 1;
    }
  };

  const currentStep = getStepActiveIndex(idea.estado);

  return (
    <div className="flex-1 w-full px-margin-mobile md:px-margin-desktop py-stack-md lg:py-stack-lg max-w-4xl mx-auto pb-16">
      {/* Navigation Breadcrumb */}
      <div className="mb-stack-md">
        <Link
          href="/ideas"
          className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label-md text-xs mb-2"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Volver al Banco de Ideas
        </Link>
      </div>

      {/* Redirection / Linked Initiative Banner */}
      {idea.iniciativaExistenteUrl ? (
        <div className="bg-surface-container-high border-l-4 border-secondary p-4 rounded-r-xl mb-stack-lg flex items-start gap-3.5 shadow-sm">
          <span className="material-symbols-outlined text-secondary mt-0.5 shrink-0 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            link
          </span>
          <div className="text-xs">
            <h3 className="font-label-md font-bold text-on-background mb-0.5">Iniciativa u Organización Existente Vinculada</h3>
            <p className="text-on-surface-variant mb-2">
              Esta propuesta cuenta con una iniciativa u organización previa trabajando en terreno para no duplicar esfuerzos.
            </p>
            <a
              href={idea.iniciativaExistenteUrl.startsWith('http') ? idea.iniciativaExistenteUrl : `https://${idea.iniciativaExistenteUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary font-label-md hover:underline inline-flex items-center gap-1 font-bold"
            >
              <span>Ver Initiative / Canal Oficial ({idea.iniciativaExistenteUrl})</span>
              <span className="material-symbols-outlined text-xs">open_in_new</span>
            </a>
          </div>
        </div>
      ) : null}

      {/* Status Pipeline Visualizer */}
      <div className="mb-stack-lg bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
        <h4 className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider mb-6 font-bold flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm">timeline</span>
          <span>Pipeline de Maduración de la Propuesta</span>
        </h4>

        <div className="relative flex items-center justify-between w-full">
          {/* Progress bar background */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-1.5 bg-surface-variant -z-10 rounded"></div>
          {/* Active progress fill */}
          <div
            className="absolute top-1/2 -translate-y-1/2 left-0 h-1.5 bg-secondary -z-10 rounded transition-all"
            style={{ width: `${Math.min(100, Math.max(0, (currentStep / 3) * 100))}%` }}
          ></div>

          {/* Steps */}
          {[
            { label: 'Idea', icon: 'lightbulb', index: 1 },
            { label: 'Promovida', icon: 'star', index: 2 },
            { label: 'En Acción', icon: 'local_fire_department', index: 3 },
            { label: idea.estado === 'redirigida' ? 'Redirigida' : 'Completada', icon: 'flag', index: 4 },
          ].map((step) => {
            const isCompleted = currentStep >= step.index;
            const isCurrent = currentStep === step.index;

            return (
              <div key={step.label} className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center border-2 shadow-sm transition-all ${
                    isCurrent
                      ? 'bg-primary text-on-primary border-primary ring-4 ring-primary/20 animate-pulse'
                      : isCompleted
                      ? 'bg-secondary text-on-secondary border-secondary'
                      : 'bg-surface-variant text-on-surface-variant border-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{step.icon}</span>
                </div>
                <span className={`font-label-sm text-[11px] ${isCurrent ? 'font-bold text-primary' : 'text-on-surface-variant'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Proposal Article */}
      <article className="bg-surface-container-lowest border border-outline-variant border-t-4 border-t-secondary rounded-xl shadow-sm p-6 md:p-8 mb-stack-lg">
        <header className="mb-6 border-b border-outline-variant pb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
            <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background">
              {idea.titulo}
            </h1>

            {/* Share button */}
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Conoce y apoya esta propuesta en ActuemosYaColombia: "${idea.titulo}" ` + (typeof window !== 'undefined' ? window.location.href : ''))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-green-700 text-white hover:bg-green-800 transition-colors flex items-center justify-center shadow-sm"
                title="Compartir por WhatsApp"
              >
                <span className="material-symbols-outlined text-sm">chat</span>
              </a>

              <button
                type="button"
                onClick={handleShare}
                className="px-4 py-2 rounded-full bg-surface-container-low hover:bg-surface-variant flex items-center gap-1.5 text-on-surface-variant transition-colors border border-outline-variant active:scale-95 text-xs font-bold"
                title="Compartir o copiar enlace"
              >
                <span className="material-symbols-outlined text-sm">share</span>
                <span>{copied ? '¡Copiado!' : 'Compartir'}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-on-surface-variant font-label-md text-xs">
            <div className="flex items-center gap-1 bg-surface-variant px-2.5 py-1 rounded">
              <span className="material-symbols-outlined text-xs">category</span>
              <span>{idea.categoria}</span>
            </div>
            <div className="flex items-center gap-1 bg-surface-variant px-2.5 py-1 rounded">
              <span className="material-symbols-outlined text-xs">location_on</span>
              <span>Alcance: {idea.alcanceTipo} {idea.alcanceDetalle ? `(${idea.alcanceDetalle})` : ''}</span>
            </div>
            <div className="flex items-center gap-1 bg-surface-variant px-2.5 py-1 rounded">
              <span className="material-symbols-outlined text-xs">verified_user</span>
              <span>Autor: {idea.esAnonimo ? 'Ciudadano Anónimo' : `${idea.emailCreador} (Verificado)`}</span>
            </div>
          </div>
        </header>

        {/* Markdown Content Body */}
        <div className="prose max-w-none text-on-surface text-sm leading-relaxed whitespace-pre-wrap font-body-md">
          {idea.descripcionMarkdown}
        </div>
      </article>

      {/* Discussion & Debate Section */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6 border-b border-outline-variant pb-4">
          <span className="material-symbols-outlined text-primary text-2xl">forum</span>
          <h2 className="font-headline-md text-lg font-bold text-on-surface">
            Espacio de Debate y Aportes Ciudadanos
          </h2>
          <span className="bg-surface-variant text-on-surface-variant font-label-sm text-xs px-2.5 py-0.5 rounded-full ml-auto font-bold">
            {comentarios.length} intervenciones
          </span>
        </div>

        {/* Comment Form */}
        <form onSubmit={handlePostComment} className="mb-8 bg-surface-container-low p-4 rounded-xl border border-outline-variant space-y-3">
          {replyToId ? (
            <div className="flex items-center justify-between bg-secondary-fixed/30 p-2 rounded text-xs">
              <span className="text-secondary font-bold">Respondiendo a un comentario...</span>
              <button
                type="button"
                onClick={() => setReplyToId(null)}
                className="text-xs text-on-surface-variant hover:text-error"
              >
                Cancelar respuesta
              </button>
            </div>
          ) : null}

          <label htmlFor="comment-input" className="font-label-sm text-xs font-bold text-on-surface block">
            Aportar recursos, validar o sumar al debate
          </label>
          <textarea
            id="comment-input"
            rows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Escribe tu aporte, dudas técnicas o capacidades logísticas disponibles..."
            className="w-full border border-outline-variant rounded-lg p-3 text-xs focus:border-secondary outline-none bg-surface"
            required
            minLength={3}
          ></textarea>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonimo}
                  onChange={(e) => setIsAnonimo(e.target.checked)}
                  className="rounded border-outline"
                />
                <span>Comentar de forma anónima</span>
              </label>

              {!isAnonimo ? (
                <input
                  type="email"
                  value={autorEmail}
                  onChange={(e) => setAutorEmail(e.target.value)}
                />
              ) : null}
            </div>

            {/* Cloudflare Turnstile Verification */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <TurnstileWidget onSuccess={(token) => setCaptchaToken(token)} className="my-0" />
              <button
                type="submit"
                disabled={submittingComment}
                className="bg-secondary text-on-secondary font-label-md text-xs font-bold uppercase px-5 py-2.5 rounded-lg hover:bg-secondary-container transition-colors active:scale-95 disabled:opacity-50 shrink-0 ml-auto"
              >
                {submittingComment ? 'Publicando...' : 'Publicar Comentario'}
              </button>
            </div>
          </div>
        </form>

        {/* Comment Tree */}
        {comentarios.length === 0 ? (
          <p className="text-xs text-on-surface-variant py-4 text-center">
            Aún no hay comentarios en esta propuesta. Sé el primero en iniciar el debate solidario.
          </p>
        ) : (
          <div className="space-y-4">
            {comentarios.map((com) => (
              <div key={com.id} className="bg-surface-container-low p-4 rounded-xl border border-outline-variant text-xs">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-label-md font-bold text-on-surface">
                      {com.esAnonimo ? 'Ciudadano Anónimo' : com.autorEmail}
                    </span>
                    {com.verificado ? (
                      <span className="bg-green-100 text-green-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                        Verificado
                      </span>
                    ) : null}
                  </div>
                  <span className="text-[11px] text-on-surface-variant">{new Date(com.creadoEn).toLocaleDateString()}</span>
                </div>

                <p className="text-on-surface leading-relaxed mb-2 whitespace-pre-wrap">
                  {com.contenidoMarkdown}
                </p>

                <button
                  type="button"
                  onClick={() => setReplyToId(com.id)}
                  className="text-secondary font-label-md font-bold text-[11px] hover:underline inline-flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">reply</span>
                  <span>Responder</span>
                </button>

                {/* Nested Replies */}
                {com.respuestas && com.respuestas.length > 0 ? (
                  <div className="mt-3 ml-4 pl-3 border-l-2 border-secondary/40 space-y-2.5">
                    {com.respuestas.map((reply) => (
                      <div key={reply.id} className="bg-surface p-3 rounded-lg border border-outline-variant">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-label-md font-bold text-primary text-[11px]">
                            {reply.esAnonimo ? 'Respuesta Anónima' : reply.autorEmail}
                          </span>
                          <span className="text-[10px] text-on-surface-variant">{new Date(reply.creadoEn).toLocaleDateString()}</span>
                        </div>
                        <p className="text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                          {reply.contenidoMarkdown}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
