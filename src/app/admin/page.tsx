'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Voluntariado } from '../../core/domain/voluntariado';

interface UsuarioAdmin {
  id: string;
  email: string;
  nombre: string | null;
  rol: 'admin' | 'supervisor';
  activo: boolean;
  creadoEn: string;
}

interface IdeaBorrador {
  id: string;
  titulo: string;
  descripcionMarkdown: string;
  categoria: string;
  alcanceTipo: string;
  alcanceDetalle: string | null;
  estado: string;
  esAnonimo: boolean;
  emailCreador: string | null;
  creadoEn: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UsuarioAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'borradores' | 'voluntarios' | 'usuarios'>('borradores');

  // Estados de datos
  const [borradores, setBorradores] = useState<IdeaBorrador[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [voluntariosPendientes, setVoluntariosPendientes] = useState<Voluntariado[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    async function loadSessionAndData() {
      try {
        const sessionRes = await fetch('/api/auth/session');
        const sessionJson = await sessionRes.json();

        if (!sessionRes.ok || !sessionJson.ok || !sessionJson.data.authenticated) {
          router.push('/admin/login');
          return;
        }

        setCurrentUser(sessionJson.data.user);

        // Cargar borradores de ideas
        const ideasRes = await fetch('/api/ideas?estado=borrador');
        const ideasJson = await ideasRes.json();
        if (ideasJson.ok && ideasJson.data.ideas) {
          setBorradores(ideasJson.data.ideas);
        }

        // Cargar voluntariados pendientes de moderación
        const volRes = await fetch('/api/voluntarios?estado=pendiente');
        const volJson = await volRes.json();
        if (volJson.ok && volJson.data.voluntariados) {
          setVoluntariosPendientes(volJson.data.voluntariados);
        }

        // Si es admin, cargar postulantes y supervisores
        if (sessionJson.data.user.rol === 'admin') {
          const usersRes = await fetch('/api/usuarios');
          const usersJson = await usersRes.json();
          if (usersJson.ok && Array.isArray(usersJson.data)) {
            setUsuarios(usersJson.data);
          }
        }
      } catch (err) {
        console.error('Error al cargar panel de administración:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSessionAndData();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/session', { method: 'DELETE' });
      router.push('/admin/login');
    } catch {
      router.push('/admin/login');
    }
  };

  const handleApproveIdea = async (id: string) => {
    setActionLoading(`idea-${id}`);
    try {
      const res = await fetch(`/api/ideas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'aprobar_borrador' }),
      });
      const json = await res.json();
      if (json.ok) {
        setBorradores(prev => prev.filter(b => b.id !== id));
        setNotification('Propuesta aprobada y publicada en el muro comunitario.');
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (err) {
      alert('Error al aprobar propuesta.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveVoluntariado = async (id: string) => {
    setActionLoading(`vol-${id}`);
    try {
      const res = await fetch(`/api/voluntarios/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'activo' }),
      });
      const json = await res.json();
      if (json.ok) {
        setVoluntariosPendientes(prev => prev.filter(v => v.id !== id));
        setNotification('Registro de voluntariado/talento técnico aprobado y publicado.');
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (err) {
      alert('Error al aprobar voluntariado.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteVoluntariado = async (id: string) => {
    if (!confirm('¿Estás seguro de descartar este registro de voluntariado?')) return;

    setActionLoading(`vol-${id}`);
    try {
      const res = await fetch(`/api/voluntarios/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.ok) {
        setVoluntariosPendientes(prev => prev.filter(v => v.id !== id));
        setNotification('Registro descartado correctamente.');
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (err) {
      alert('Error al eliminar registro.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveSupervisor = async (userId: string) => {
    setActionLoading(`user-${userId}`);
    try {
      const res = await fetch(`/api/usuarios/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: true }),
      });
      const json = await res.json();
      if (json.ok) {
        setUsuarios(prev => prev.map(u => u.id === userId ? { ...u, activo: true } : u));
        setNotification('¡Supervisor aprobado! Se ha enviado su Magic Link de bienvenida por correo.');
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (err) {
      alert('Error al activar supervisor.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleSupervisorStatus = async (userId: string, currentStatus: boolean) => {
    setActionLoading(`user-${userId}`);
    try {
      const res = await fetch(`/api/usuarios/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: !currentStatus }),
      });
      const json = await res.json();
      if (json.ok) {
        setUsuarios(prev => prev.map(u => u.id === userId ? { ...u, activo: !currentStatus } : u));
        setNotification(`Estado de cuenta actualizado a: ${!currentStatus ? 'Activo' : 'Inactivo'}`);
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (err) {
      alert('Error al actualizar estado del usuario.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-4xl animate-spin">refresh</span>
          <p className="font-body-md text-sm text-on-surface-variant">Cargando panel de supervisión...</p>
        </div>
      </div>
    );
  }

  const pendingSupervisors = usuarios.filter(u => !u.activo && u.rol === 'supervisor');
  const activeSupervisors = usuarios.filter(u => u.activo);

  return (
    <div className="flex-grow w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-stack-md">
      {/* Toast Notification */}
      {notification ? (
        <div className="mb-4 bg-green-900 text-green-100 p-3 rounded-lg flex items-center justify-between text-xs animate-in fade-in shadow-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-green-300">check_circle</span>
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-green-300 hover:text-white">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      ) : null}

      {/* Admin Context Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-stack-lg border-b border-outline-variant pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold">
            <span className="material-symbols-outlined">shield_person</span>
          </div>
          <div>
            <h1 className="font-headline-lg text-2xl font-bold text-on-surface">
              Panel de Control y Moderación
            </h1>
            <p className="font-body-md text-xs text-on-surface-variant">
              Sesión activa: <span className="font-semibold text-secondary">{currentUser?.email}</span> (Rol: <strong className="uppercase">{currentUser?.rol}</strong>)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLogout}
            className="px-3 py-1.5 rounded border border-outline text-xs text-on-surface-variant hover:bg-surface-variant transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter mb-stack-lg">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm border-t-4 border-t-primary">
          <div className="flex justify-between items-start mb-2">
            <span className="font-label-md text-xs text-on-surface-variant">Borradores de Ideas</span>
            <span className="material-symbols-outlined text-primary bg-primary-fixed p-1 rounded-full text-xs">inbox</span>
          </div>
          <div className="font-headline-lg text-3xl font-bold text-on-surface">{borradores.length}</div>
          <div className="font-label-sm text-xs text-error mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">priority_high</span> Requieren revisión
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm border-t-4 border-t-secondary">
          <div className="flex justify-between items-start mb-2">
            <span className="font-label-md text-xs text-on-surface-variant">Talento por Validar</span>
            <span className="material-symbols-outlined text-secondary bg-secondary-fixed p-1 rounded-full text-xs">engineering</span>
          </div>
          <div className="font-headline-lg text-3xl font-bold text-on-surface">{voluntariosPendientes.length}</div>
          <div className="font-label-sm text-xs text-secondary mt-1">Ofertas y Solicitudes</div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm border-t-4 border-t-tertiary">
          <div className="flex justify-between items-start mb-2">
            <span className="font-label-md text-xs text-on-surface-variant">Postulantes a Moderador</span>
            <span className="material-symbols-outlined text-green-700 bg-green-100 p-1 rounded-full text-xs">how_to_reg</span>
          </div>
          <div className="font-headline-lg text-3xl font-bold text-on-surface">{pendingSupervisors.length}</div>
          <div className="font-label-sm text-xs text-on-surface-variant mt-1">Por activar por Admin</div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm border-t-4 border-t-outline">
          <div className="flex justify-between items-start mb-2">
            <span className="font-label-md text-xs text-on-surface-variant">Supervisores Activos</span>
            <span className="material-symbols-outlined text-outline p-1 rounded-full text-xs">verified_user</span>
          </div>
          <div className="font-headline-lg text-2xl font-bold text-on-surface">{activeSupervisors.length}</div>
          <div className="font-label-sm text-xs text-on-surface-variant mt-1">En operación</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-outline-variant mb-6 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('borradores')}
          className={`px-4 py-2.5 font-label-md text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'borradores'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-sm">inbox</span>
          <span>Borradores de Ideas ({borradores.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('voluntarios')}
          className={`px-4 py-2.5 font-label-md text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'voluntarios'
              ? 'border-secondary text-secondary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-sm">engineering</span>
          <span>Talento y Voluntariado ({voluntariosPendientes.length} pendientes)</span>
        </button>

        {currentUser?.rol === 'admin' ? (
          <button
            type="button"
            onClick={() => setActiveTab('usuarios')}
            className={`px-4 py-2.5 font-label-md text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'usuarios'
                ? 'border-secondary text-secondary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-sm">groups</span>
            <span>Postulantes a Supervisor ({pendingSupervisors.length})</span>
          </button>
        ) : null}
      </div>

      {/* Tab 1: Borradores de Ideas */}
      {activeTab === 'borradores' ? (
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6 border-b border-outline-variant pb-4">
            <h2 className="font-headline-md text-base font-bold text-on-surface">
              Propuestas Ciudadanas en Revisión
            </h2>
            <span className="bg-primary text-on-primary text-xs font-bold px-2.5 py-0.5 rounded-full">
              {borradores.length} pendientes
            </span>
          </div>

          {borradores.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl text-green-600 mb-2">check_circle</span>
              <p className="font-body-md text-sm font-semibold">No hay borradores pendientes de moderación.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {borradores.map((item) => (
                <div
                  key={item.id}
                  className="bg-surface border border-outline-variant rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-surface-container-low transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-surface-variant text-on-surface-variant font-label-sm text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        {item.categoria}
                      </span>
                      <span className="text-xs text-on-surface-variant">Alcance: {item.alcanceTipo} {item.alcanceDetalle ? `(${item.alcanceDetalle})` : ''}</span>
                      <span className="text-xs text-on-surface-variant">• {item.esAnonimo ? 'Anónimo' : item.emailCreador}</span>
                    </div>
                    <h3 className="font-headline-md text-base font-bold text-on-surface mb-1">
                      {item.titulo}
                    </h3>
                    <p className="font-body-md text-xs text-on-surface-variant line-clamp-2">
                      {item.descripcionMarkdown}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={actionLoading === `idea-${item.id}`}
                      onClick={() => handleApproveIdea(item.id)}
                      className="px-4 py-1.5 bg-secondary text-on-secondary font-label-md text-xs font-bold uppercase rounded hover:bg-secondary-container transition-colors shadow-sm disabled:opacity-50"
                    >
                      {actionLoading === `idea-${item.id}` ? 'Aprobando...' : 'Aprobar [Idea]'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {/* Tab 2: Voluntariado y Talento Técnico Pendiente */}
      {activeTab === 'voluntarios' ? (
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6 border-b border-outline-variant pb-4">
            <h2 className="font-headline-md text-base font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">engineering</span>
              <span>Ofertas y Solicitudes de Talento Pendientes de Validación</span>
            </h2>
            <span className="bg-secondary text-on-secondary text-xs font-bold px-2.5 py-0.5 rounded-full">
              {voluntariosPendientes.length} pendientes
            </span>
          </div>

          {voluntariosPendientes.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl text-green-600 mb-2">check_circle</span>
              <p className="font-body-md text-sm font-semibold">No hay voluntariados ni solicitudes pendientes de revisión.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {voluntariosPendientes.map((vol) => {
                const isOffer = vol.tipo === 'ofrezco_habilidad';
                return (
                  <div
                    key={vol.id}
                    className="bg-surface border border-outline-variant rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-surface-container-low transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`font-label-sm text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          isOffer ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-secondary-fixed text-on-secondary-fixed'
                        }`}>
                          {isOffer ? 'Oferta de Profesional' : 'Solicitud de ONG/Brigada'}
                        </span>
                        <span className="text-xs font-semibold text-on-surface">{vol.areaProfesional}</span>
                        {vol.ubicacion ? (
                          <span className="text-xs text-on-surface-variant">• {vol.ubicacion}</span>
                        ) : null}
                      </div>

                      <h3 className="font-headline-md text-base font-bold text-on-surface mb-1">
                        {vol.tituloNecesidad}
                      </h3>
                      <p className="text-xs text-secondary font-semibold mb-1">
                        Contacto: {vol.nombreContacto} ({vol.emailContacto} {vol.telefonoContacto ? `/ ${vol.telefonoContacto}` : ''})
                      </p>
                      <p className="font-body-md text-xs text-on-surface-variant line-clamp-2">
                        {vol.descripcion}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        disabled={actionLoading === `vol-${vol.id}`}
                        onClick={() => handleDeleteVoluntariado(vol.id)}
                        className="px-3 py-1.5 border border-outline text-error font-label-md text-xs font-bold rounded hover:bg-error-container transition-colors disabled:opacity-50"
                      >
                        Descartar
                      </button>
                      <button
                        type="button"
                        disabled={actionLoading === `vol-${vol.id}`}
                        onClick={() => handleApproveVoluntariado(vol.id)}
                        className="px-4 py-1.5 bg-secondary text-on-secondary font-label-md text-xs font-bold uppercase rounded hover:bg-secondary-container transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-xs">check</span>
                        <span>{actionLoading === `vol-${vol.id}` ? 'Aprobando...' : 'Aprobar y Publicar'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ) : null}

      {/* Tab 3: Gestión de Supervisores (Admin Only) */}
      {activeTab === 'usuarios' && currentUser?.rol === 'admin' ? (
        <div className="space-y-6">
          {/* Postulantes Pendientes */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b border-outline-variant pb-3">
              <h2 className="font-headline-md text-base font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500">pending_actions</span>
                <span>Postulantes Pendientes de Aprobación</span>
              </h2>
              <span className="bg-amber-500 text-slate-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {pendingSupervisors.length} por revisar
              </span>
            </div>

            {pendingSupervisors.length === 0 ? (
              <p className="text-xs text-on-surface-variant py-4 text-center">
                No hay postulaciones pendientes de revisión.
              </p>
            ) : (
              <div className="space-y-3">
                {pendingSupervisors.map((user) => (
                  <div
                    key={user.id}
                    className="bg-surface border border-outline-variant rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
                  >
                    <div>
                      <h4 className="font-label-md text-sm font-bold text-on-surface">
                        {user.nombre || 'Sin nombre'}
                      </h4>
                      <p className="text-xs text-secondary font-semibold">{user.email}</p>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">Postulado el: {new Date(user.creadoEn).toLocaleDateString()}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={actionLoading === `user-${user.id}`}
                        onClick={() => handleApproveSupervisor(user.id)}
                        className="px-4 py-2 bg-green-700 text-white font-label-md text-xs font-bold uppercase rounded hover:bg-green-800 transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-sm">how_to_reg</span>
                        <span>{actionLoading === `user-${user.id}` ? 'Activando...' : 'Aprobar y Enviar Enlace'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Moderadores Activos */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
            <h2 className="font-headline-md text-base font-bold text-on-surface mb-4 border-b border-outline-variant pb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-green-700">verified_user</span>
              <span>Equipo de Moderadores Activos ({activeSupervisors.length})</span>
            </h2>

            <div className="space-y-3">
              {activeSupervisors.map((user) => (
                <div
                  key={user.id}
                  className="bg-surface border border-outline-variant rounded-lg p-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-sm text-on-surface">{user.nombre || 'Usuario'}</strong>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${user.rol === 'admin' ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-secondary-fixed text-on-secondary-fixed'}`}>
                        {user.rol}
                      </span>
                    </div>
                    <span className="text-on-surface-variant">{user.email}</span>
                  </div>

                  {user.id !== currentUser.id ? (
                    <button
                      type="button"
                      disabled={actionLoading === `user-${user.id}`}
                      onClick={() => handleToggleSupervisorStatus(user.id, user.activo)}
                      className="px-3 py-1 border border-outline text-error font-label-sm text-xs rounded hover:bg-error-container transition-colors disabled:opacity-50"
                    >
                      Pausar Acceso
                    </button>
                  ) : (
                    <span className="text-[11px] text-on-surface-variant italic">(Tu usuario actual)</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
