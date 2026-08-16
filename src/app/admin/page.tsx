'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Voluntariado } from '../../core/domain/voluntariado';
import type { AlertaSistema, NivelAlerta } from '../../core/domain/alerta';
import type { Iniciativa } from '../../core/domain/iniciativa';

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
  const [activeTab, setActiveTab] = useState<'borradores' | 'voluntarios' | 'iniciativas' | 'alertas' | 'usuarios'>('borradores');

  // Estados de datos
  const [borradores, setBorradores] = useState<IdeaBorrador[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [voluntariosPendientes, setVoluntariosPendientes] = useState<Voluntariado[]>([]);
  const [iniciativas, setIniciativas] = useState<Iniciativa[]>([]);
  const [alertas, setAlertas] = useState<AlertaSistema[]>([]);

  // Estados de formularios
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Formulario nueva alerta (Admin)
  const [alertNivel, setAlertNivel] = useState<NivelAlerta>('critica');
  const [alertMensaje, setAlertMensaje] = useState('');
  const [alertUrl, setAlertUrl] = useState('');
  const [alertTexto, setAlertTexto] = useState('');

  // Formulario nueva iniciativa (Admin & Supervisor)
  const [iniNombre, setIniNombre] = useState('');
  const [iniCategoria, setIniCategoria] = useState('ong');
  const [iniDescripcion, setIniDescripcion] = useState('');
  const [iniUrl, setIniUrl] = useState('');
  const [iniContacto, setIniContacto] = useState('');
  const [iniCobertura, setIniCobertura] = useState('');

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

        // 1. Cargar borradores de ideas
        const ideasRes = await fetch('/api/ideas?estado=borrador');
        const ideasJson = await ideasRes.json();
        if (ideasJson.ok && ideasJson.data.ideas) {
          setBorradores(ideasJson.data.ideas);
        }

        // 2. Cargar voluntariados pendientes
        const volRes = await fetch('/api/voluntarios?estado=pendiente');
        const volJson = await volRes.json();
        if (volJson.ok && volJson.data.voluntariados) {
          setVoluntariosPendientes(volJson.data.voluntariados);
        }

        // 3. Cargar iniciativas activas
        const iniRes = await fetch('/api/iniciativas');
        const iniJson = await iniRes.json();
        if (iniJson.ok && iniJson.data.iniciativas) {
          setIniciativas(iniJson.data.iniciativas);
        }

        // 4. Si es admin, cargar alertas completas y usuarios
        if (sessionJson.data.user.rol === 'admin') {
          const alertRes = await fetch('/api/alertas?all=true');
          const alertJson = await alertRes.json();
          if (alertJson.ok && alertJson.data.alertas) {
            setAlertas(alertJson.data.alertas);
          }

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

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/session', { method: 'DELETE' });
      router.push('/admin/login');
    } catch {
      router.push('/admin/login');
    }
  };

  // Acciones de Ideas
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
        showToast('Propuesta aprobada y publicada en el muro comunitario.');
      }
    } catch {
      alert('Error al aprobar propuesta.');
    } finally {
      setActionLoading(null);
    }
  };

  // Acciones de Voluntariado
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
        showToast('Registro de voluntariado/talento técnico aprobado y publicado.');
      }
    } catch {
      alert('Error al aprobar voluntariado.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteVoluntariado = async (id: string) => {
    if (!confirm('¿Estás seguro de descartar este registro de voluntariado?')) return;

    setActionLoading(`vol-${id}`);
    try {
      const res = await fetch(`/api/voluntarios/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.ok) {
        setVoluntariosPendientes(prev => prev.filter(v => v.id !== id));
        showToast('Registro descartado correctamente.');
      }
    } catch {
      alert('Error al eliminar registro.');
    } finally {
      setActionLoading(null);
    }
  };

  // Acciones de Alertas (Admin Only)
  const handleCreateAlerta = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('create-alerta');
    try {
      const res = await fetch('/api/alertas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nivel: alertNivel,
          mensaje: alertMensaje,
          enlaceAccionUrl: alertUrl || null,
          enlaceAccionTexto: alertTexto || null,
          activa: true,
        }),
      });
      const json = await res.json();
      if (json.ok && json.data) {
        setAlertas(prev => [json.data, ...prev]);
        setAlertMensaje('');
        setAlertUrl('');
        setAlertTexto('');
        showToast('¡Alerta de crisis emitida y publicada en el carrusel superior!');
      } else {
        alert(json.error?.message || 'Error al emitir alerta');
      }
    } catch {
      alert('Error de conexión al emitir alerta.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleAlertaStatus = async (id: string, currentStatus: boolean) => {
    setActionLoading(`alerta-toggle-${id}`);
    try {
      const res = await fetch(`/api/alertas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activa: !currentStatus }),
      });
      const json = await res.json();
      if (json.ok) {
        setAlertas(prev => prev.map(a => a.id === id ? { ...a, activa: !currentStatus } : a));
        showToast(`Estado de la alerta actualizado a: ${!currentStatus ? 'Activa' : 'Pausada'}`);
      }
    } catch {
      alert('Error al actualizar alerta.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAlerta = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar permanentemente esta alerta?')) return;
    setActionLoading(`alerta-del-${id}`);
    try {
      const res = await fetch(`/api/alertas/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.ok) {
        setAlertas(prev => prev.filter(a => a.id !== id));
        showToast('Alerta eliminada del sistema.');
      }
    } catch {
      alert('Error al eliminar alerta.');
    } finally {
      setActionLoading(null);
    }
  };

  // Acciones de Iniciativas Activas
  const handleCreateIniciativa = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('create-iniciativa');
    try {
      const res = await fetch('/api/iniciativas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: iniNombre,
          categoria: iniCategoria,
          descripcion: iniDescripcion,
          urlOficial: iniUrl,
          contacto: iniContacto || null,
          coberturaGeografica: iniCobertura || null,
        }),
      });
      const json = await res.json();
      if (json.ok && json.data) {
        setIniciativas(prev => [json.data, ...prev]);
        setIniNombre('');
        setIniDescripcion('');
        setIniUrl('');
        setIniContacto('');
        setIniCobertura('');
        showToast('¡Iniciativa registrada y publicada en el directorio!');
      } else {
        alert(json.error?.message || 'Error al registrar iniciativa.');
      }
    } catch {
      alert('Error al registrar iniciativa.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteIniciativa = async (id: string) => {
    if (!confirm('¿Estás seguro de retirar esta iniciativa del directorio?')) return;
    setActionLoading(`ini-del-${id}`);
    try {
      const res = await fetch(`/api/iniciativas/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.ok) {
        setIniciativas(prev => prev.filter(i => i.id !== id));
        showToast('Iniciativa retirada del directorio.');
      }
    } catch {
      alert('Error al eliminar iniciativa.');
    } finally {
      setActionLoading(null);
    }
  };

  // Acciones de Supervisores (Admin Only)
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
        showToast('¡Supervisor aprobado! Se ha enviado su enlace de bienvenida.');
      }
    } catch {
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
        showToast(`Estado de cuenta actualizado a: ${!currentStatus ? 'Activo' : 'Inactivo'}`);
      }
    } catch {
      alert('Error al actualizar estado.');
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
  const activeAlertsCount = alertas.filter(a => a.activa).length;

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

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm border-t-4 border-t-amber-600">
          <div className="flex justify-between items-start mb-2">
            <span className="font-label-md text-xs text-on-surface-variant">Alertas Activas</span>
            <span className="material-symbols-outlined text-amber-800 bg-amber-100 p-1 rounded-full text-xs">warning</span>
          </div>
          <div className="font-headline-lg text-3xl font-bold text-on-surface">{currentUser?.rol === 'admin' ? activeAlertsCount : '-'}</div>
          <div className="font-label-sm text-xs text-amber-700 mt-1">En el carrusel global</div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm border-t-4 border-t-outline">
          <div className="flex justify-between items-start mb-2">
            <span className="font-label-md text-xs text-on-surface-variant">Iniciativas Activas</span>
            <span className="material-symbols-outlined text-outline p-1 rounded-full text-xs">corporate_fare</span>
          </div>
          <div className="font-headline-lg text-3xl font-bold text-on-surface">{iniciativas.length}</div>
          <div className="font-label-sm text-xs text-on-surface-variant mt-1">En directorio público</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-outline-variant mb-6 overflow-x-auto gap-2">
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
          <span>Borradores ({borradores.length})</span>
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
          <span>Talento ({voluntariosPendientes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('iniciativas')}
          className={`px-4 py-2.5 font-label-md text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'iniciativas'
              ? 'border-secondary text-secondary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-sm">corporate_fare</span>
          <span>Iniciativas ({iniciativas.length})</span>
        </button>

        {currentUser?.rol === 'admin' ? (
          <>
            <button
              type="button"
              onClick={() => setActiveTab('alertas')}
              className={`px-4 py-2.5 font-label-md text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'alertas'
                  ? 'border-amber-600 text-amber-700'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-sm">warning</span>
              <span>Alertas de Crisis ({activeAlertsCount} activas)</span>
            </button>

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
              <span>Supervisores ({pendingSupervisors.length})</span>
            </button>
          </>
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
              <p className="font-body-md text-sm font-semibold">No hay voluntariados pendientes de revisión.</p>
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
                          {isOffer ? 'Oferta' : 'Solicitud'}
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
                        <span>Aprobar y Publicar</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ) : null}

      {/* Tab 3: Iniciativas Activas (Admin & Supervisor) */}
      {activeTab === 'iniciativas' ? (
        <div className="space-y-6">
          {/* Formulario de registro */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
            <h2 className="font-headline-md text-base font-bold text-on-surface mb-4 flex items-center gap-2 border-b border-outline-variant pb-3">
              <span className="material-symbols-outlined text-secondary">add_business</span>
              <span>Registrar Nueva Iniciativa u Organismo Activo</span>
            </h2>

            <form onSubmit={handleCreateIniciativa} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-on-surface mb-1">Nombre de la Iniciativa / Organización *</label>
                  <input
                    value={iniNombre}
                    onChange={(e) => setIniNombre(e.target.value)}
                    required
                    placeholder="Ej. Cruz Roja Colombiana - Seccional Cauca"
                    className="w-full bg-surface border border-outline-variant rounded p-2 text-xs outline-none focus:border-secondary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-on-surface mb-1">Categoría *</label>
                  <select
                    value={iniCategoria}
                    onChange={(e) => setIniCategoria(e.target.value)}
                    className="w-full bg-surface border border-outline-variant rounded p-2 text-xs outline-none focus:border-secondary"
                  >
                    <option value="organismo_oficial">Organismo Oficial del Estado</option>
                    <option value="ong">ONG / Fundación Humanitaria</option>
                    <option value="colectivo">Colectivo Ciudadano / Brigada</option>
                    <option value="campaña">Campaña de Donación / Acopio</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">Descripción de Operación y Recursos *</label>
                <textarea
                  value={iniDescripcion}
                  onChange={(e) => setIniDescripcion(e.target.value)}
                  rows={3}
                  required
                  placeholder="Describe las labores de socorro, centros de acopio o capacidades logísticas..."
                  className="w-full bg-surface border border-outline-variant rounded p-2 text-xs outline-none focus:border-secondary"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-on-surface mb-1">URL Oficial / Canal de Articulación *</label>
                  <input
                    value={iniUrl}
                    onChange={(e) => setIniUrl(e.target.value)}
                    required
                    placeholder="https://cruzrojacolombiana.org"
                    className="w-full bg-surface border border-outline-variant rounded p-2 text-xs outline-none focus:border-secondary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-on-surface mb-1">Teléfono o Correo de Contacto</label>
                  <input
                    value={iniContacto}
                    onChange={(e) => setIniContacto(e.target.value)}
                    placeholder="+57 601 4376300 / socorro@cruzroja.org"
                    className="w-full bg-surface border border-outline-variant rounded p-2 text-xs outline-none focus:border-secondary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-on-surface mb-1">Cobertura Geográfica</label>
                  <input
                    value={iniCobertura}
                    onChange={(e) => setIniCobertura(e.target.value)}
                    placeholder="Nacional / Popayán y Nariño"
                    className="w-full bg-surface border border-outline-variant rounded p-2 text-xs outline-none focus:border-secondary"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={actionLoading === 'create-iniciativa'}
                  className="px-6 py-2.5 bg-primary text-on-primary font-bold uppercase rounded-lg hover:bg-primary-container shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  <span>{actionLoading === 'create-iniciativa' ? 'Guardando...' : 'Publicar Iniciativa'}</span>
                </button>
              </div>
            </form>
          </section>

          {/* Listado de iniciativas */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
            <h3 className="font-headline-md text-base font-bold text-on-surface mb-4 border-b border-outline-variant pb-3 flex items-center justify-between">
              <span>Iniciativas en el Directorio ({iniciativas.length})</span>
              <Link href="/iniciativas" className="text-secondary text-xs hover:underline flex items-center gap-1">
                <span>Ver Directorio Público</span>
                <span className="material-symbols-outlined text-xs">open_in_new</span>
              </Link>
            </h3>

            <div className="space-y-3">
              {iniciativas.map((item) => (
                <div
                  key={item.id}
                  className="bg-surface border border-outline-variant rounded-lg p-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-surface-variant font-bold text-[10px] uppercase px-1.5 py-0.2 rounded">
                        {item.categoria}
                      </span>
                      <strong className="text-sm text-on-surface">{item.nombre}</strong>
                    </div>
                    <p className="text-on-surface-variant line-clamp-1">{item.descripcion}</p>
                    <p className="text-[11px] text-secondary font-mono mt-0.5">{item.urlOficial} {item.contacto ? `• ${item.contacto}` : ''}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={actionLoading === `ini-del-${item.id}`}
                      onClick={() => handleDeleteIniciativa(item.id)}
                      className="px-3 py-1 border border-outline text-error font-label-sm rounded hover:bg-error-container transition-colors disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {/* Tab 4: Alertas de Crisis (Admin Only) */}
      {activeTab === 'alertas' && currentUser?.rol === 'admin' ? (
        <div className="space-y-6">
          {/* Formulario de emisión de alerta */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
            <h2 className="font-headline-md text-base font-bold text-on-surface mb-4 flex items-center gap-2 border-b border-outline-variant pb-3">
              <span className="material-symbols-outlined text-amber-600">emergency_share</span>
              <span>Emitir Alerta de Crisis en el Carrusel Global</span>
            </h2>

            <form onSubmit={handleCreateAlerta} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-on-surface mb-1">Nivel de Severidad *</label>
                  <select
                    value={alertNivel}
                    onChange={(e) => setAlertNivel(e.target.value as NivelAlerta)}
                    className="w-full bg-surface border border-outline-variant rounded p-2 text-xs outline-none focus:border-secondary font-bold"
                  >
                    <option value="critica">🔴 Alerta Crítica (Fondo Rojo)</option>
                    <option value="alerta_naranja">🟠 Alerta Naranja (Fondo Ámbar)</option>
                    <option value="informativa">🔵 Comunicado Informativo (Fondo Azul)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-on-surface mb-1">Mensaje de la Alerta * (Mínimo 10 caracteres)</label>
                  <input
                    value={alertMensaje}
                    onChange={(e) => setAlertMensaje(e.target.value)}
                    required
                    minLength={10}
                    placeholder="Ej. SISMO 6.8: Evacuación prioritaria en laderas del Cauca. Siga canales de socorro."
                    className="w-full bg-surface border border-outline-variant rounded p-2 text-xs outline-none focus:border-secondary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-on-surface mb-1">Enlace de Acción Opcional (URL)</label>
                  <input
                    value={alertUrl}
                    onChange={(e) => setAlertUrl(e.target.value)}
                    placeholder="https://portal.gestiondelriesgo.gov.co/boletin-1"
                    className="w-full bg-surface border border-outline-variant rounded p-2 text-xs outline-none focus:border-secondary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-on-surface mb-1">Texto del Botón de Acción</label>
                  <input
                    value={alertTexto}
                    onChange={(e) => setAlertTexto(e.target.value)}
                    placeholder="Ej. Ver Directrices UNGRD"
                    className="w-full bg-surface border border-outline-variant rounded p-2 text-xs outline-none focus:border-secondary"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={actionLoading === 'create-alerta'}
                  className="px-6 py-2.5 bg-amber-600 text-white font-bold uppercase rounded-lg hover:bg-amber-700 shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">broadcast_on_home</span>
                  <span>{actionLoading === 'create-alerta' ? 'Emitiendo...' : 'Publicar Alerta'}</span>
                </button>
              </div>
            </form>
          </section>

          {/* Listado de Alertas */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
            <h3 className="font-headline-md text-base font-bold text-on-surface mb-4 border-b border-outline-variant pb-3 flex items-center justify-between">
              <span>Historial y Control de Alertas ({alertas.length})</span>
              <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-[11px]">
                {activeAlertsCount} activas en el carrusel
              </span>
            </h3>

            {alertas.length === 0 ? (
              <p className="text-xs text-on-surface-variant py-4 text-center">No hay alertas registradas en el sistema.</p>
            ) : (
              <div className="space-y-3">
                {alertas.map((item) => (
                  <div
                    key={item.id}
                    className="bg-surface border border-outline-variant rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-bold text-[10px] uppercase px-2 py-0.5 rounded ${
                          item.nivel === 'critica'
                            ? 'bg-red-100 text-red-900'
                            : item.nivel === 'alerta_naranja'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-blue-100 text-blue-900'
                        }`}>
                          {item.nivel}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.activa ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {item.activa ? '● Activa en Carrusel' : '○ Pausada'}
                        </span>
                        <span className="text-[11px] text-on-surface-variant">Por: {item.actualizadoPor}</span>
                      </div>
                      <p className="font-bold text-sm text-on-surface mt-1">{item.mensaje}</p>
                      {item.enlaceAccionUrl ? (
                        <p className="text-secondary text-[11px] mt-0.5">Enlace: {item.enlaceAccionUrl} ({item.enlaceAccionTexto})</p>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        disabled={actionLoading === `alerta-toggle-${item.id}`}
                        onClick={() => handleToggleAlertaStatus(item.id, item.activa)}
                        className={`px-3 py-1.5 font-bold rounded transition-colors text-xs ${
                          item.activa
                            ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {item.activa ? 'Pausar' : 'Activar'}
                      </button>
                      <button
                        type="button"
                        disabled={actionLoading === `alerta-del-${item.id}`}
                        onClick={() => handleDeleteAlerta(item.id)}
                        className="px-3 py-1.5 border border-outline text-error font-bold rounded hover:bg-error-container transition-colors text-xs"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}

      {/* Tab 5: Gestión de Supervisores (Admin Only) */}
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
                        <span>Aprobar y Enviar Enlace</span>
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
              <span>Equipo de Moderadores Activos ({usuarios.filter(u => u.activo).length})</span>
            </h2>

            <div className="space-y-3">
              {usuarios.filter(u => u.activo).map((user) => (
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
