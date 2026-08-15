'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [triageItems, setTriageItems] = useState([
    {
      id: 'idea-5',
      title: 'Refugios Temporales Modulares de Ensamblaje Rápido',
      author: 'Anónimo (Pendiente de revisión)',
      category: 'Albergue y Vivienda',
      scope: 'Cauca',
      date: 'Hace 45 min',
      description: 'Estructuras de madera inmunizada armables en 3 horas para familias damnificadas.',
    },
    {
      id: 'idea-6',
      title: 'Donación de Medicamentos Pediátricos en Puesto de Socorro',
      author: 'Anónimo (Pendiente de revisión)',
      category: 'Salud',
      scope: 'Pasto',
      date: 'Hace 1 hora',
      description: 'Lote de antibióticos y analgésicos pediátricos disponibles para entrega inmediata.',
    },
  ]);

  const handleApprove = (id: string) => {
    setTriageItems(triageItems.filter((item) => item.id !== id));
    alert(`Idea ${id} aprobada y promovida a estado pública [idea].`);
  };

  const handleReject = (id: string) => {
    setTriageItems(triageItems.filter((item) => item.id !== id));
    alert(`Idea ${id} rechazada o marcada como spam.`);
  };

  return (
    <div className="flex-grow w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-stack-md">
      {/* Admin Context Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-stack-lg border-b border-outline-variant pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold">
            <span className="material-symbols-outlined">shield_person</span>
          </div>
          <div>
            <h1 className="font-headline-lg text-2xl font-bold text-on-surface">
              Panel de Control y Supervisión
            </h1>
            <p className="font-body-md text-xs text-on-surface-variant">
              Sesión activa: <span className="font-semibold text-secondary">supervisor@actuemosya.org</span> (Rol: Supervisor / Admin)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/login"
            className="px-3 py-1.5 rounded border border-outline text-xs text-on-surface-variant hover:bg-surface-variant transition-colors"
          >
            Cerrar Sesión
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter mb-stack-lg">
        {/* Metric 1 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm border-t-4 border-t-primary">
          <div className="flex justify-between items-start mb-2">
            <span className="font-label-md text-xs text-on-surface-variant">Borradores en Triage</span>
            <span className="material-symbols-outlined text-primary bg-primary-fixed p-1 rounded-full text-xs">inbox</span>
          </div>
          <div className="font-headline-lg text-3xl font-bold text-on-surface">{triageItems.length}</div>
          <div className="font-label-sm text-xs text-error mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">priority_high</span> Requieren moderación
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm border-t-4 border-t-secondary">
          <div className="flex justify-between items-start mb-2">
            <span className="font-label-md text-xs text-on-surface-variant">Ideas Activas</span>
            <span className="material-symbols-outlined text-secondary bg-secondary-fixed p-1 rounded-full text-xs">lightbulb</span>
          </div>
          <div className="font-headline-lg text-3xl font-bold text-on-surface">148</div>
          <div className="font-label-sm text-xs text-secondary mt-1">En discusión comunitaria</div>
        </div>

        {/* Metric 3 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm border-t-4 border-t-tertiary">
          <div className="flex justify-between items-start mb-2">
            <span className="font-label-md text-xs text-on-surface-variant">En Acción (Crítico)</span>
            <span className="material-symbols-outlined text-error bg-error-container p-1 rounded-full text-xs">emergency</span>
          </div>
          <div className="font-headline-lg text-3xl font-bold text-error">5</div>
          <div className="font-label-sm text-xs text-on-surface-variant mt-1">Coordinadas con ONGs</div>
        </div>

        {/* Metric 4 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm border-t-4 border-t-outline">
          <div className="flex justify-between items-start mb-2">
            <span className="font-label-md text-xs text-on-surface-variant">Búsquedas Activas</span>
            <span className="material-symbols-outlined text-tertiary bg-tertiary-fixed p-1 rounded-full text-xs">person_search</span>
          </div>
          <div className="font-headline-lg text-3xl font-bold text-on-surface">24</div>
          <div className="font-label-sm text-xs text-on-surface-variant mt-1">Personas y Mascotas</div>
        </div>
      </div>

      {/* Triage Queue Table / Cards */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6 border-b border-outline-variant pb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">inbox</span>
            <h2 className="font-headline-md text-lg font-bold text-on-surface">
              Bandeja de Triage y Moderación de Borradores Anónimos
            </h2>
          </div>
          <span className="bg-primary text-on-primary text-xs font-bold px-2.5 py-0.5 rounded-full">
            {triageItems.length} pendientes
          </span>
        </div>

        {triageItems.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl text-green-600 mb-2">check_circle</span>
            <p className="font-body-md text-sm font-semibold">Bandeja al día. No hay propuestas pendientes de triage.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {triageItems.map((item) => (
              <div
                key={item.id}
                className="bg-surface border border-outline-variant rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-surface-container-low transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-surface-variant text-on-surface-variant font-label-sm text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      {item.category}
                    </span>
                    <span className="text-xs text-on-surface-variant">Alcance: {item.scope}</span>
                    <span className="text-xs text-on-surface-variant">• {item.date}</span>
                  </div>
                  <h3 className="font-headline-md text-base font-bold text-on-surface mb-1">
                    {item.title}
                  </h3>
                  <p className="font-body-md text-xs text-on-surface-variant">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleReject(item.id)}
                    className="px-3 py-1.5 border border-outline text-error font-label-md text-xs font-bold rounded hover:bg-error-container transition-colors"
                  >
                    Rechazar / Spam
                  </button>
                  <button
                    onClick={() => handleApprove(item.id)}
                    className="px-4 py-1.5 bg-secondary text-on-secondary font-label-md text-xs font-bold uppercase rounded hover:bg-secondary-container transition-colors shadow-sm"
                  >
                    Aprobar [Idea]
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
