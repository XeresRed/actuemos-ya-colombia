'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AnalyticsDashboardData, AnalyticsTimeframe, LiveTrafficItem } from '@/core/domain/analytics';

interface AnalyticsDashboardProps {
  initialTimeframe?: AnalyticsTimeframe;
}

export function AnalyticsDashboard({ initialTimeframe = '24h' }: AnalyticsDashboardProps) {
  const [timeframe, setTimeframe] = useState<AnalyticsTimeframe>(initialTimeframe);
  const [data, setData] = useState<AnalyticsDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const fetchAnalytics = useCallback(async (tf: AnalyticsTimeframe, isBackground = false) => {
    if (!isBackground) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const res = await fetch(`/api/analytics/stats?timeframe=${tf}`, {
        headers: { 'Accept': 'application/json' },
      });

      if (!res.ok) {
        throw new Error(`Error al consultar métricas (${res.status})`);
      }

      const json = await res.json();
      if (json.ok && json.data) {
        setData(json.data);
      } else {
        throw new Error(json.error?.message || 'Respuesta inválida del servidor');
      }
    } catch (err: any) {
      setError(err.message || 'No fue posible cargar las analíticas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(timeframe);
  }, [timeframe, fetchAnalytics]);

  // Polling en tiempo real cada 10 segundos si autoRefresh está activo
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchAnalytics(timeframe, true);
    }, 10000);
    return () => clearInterval(interval);
  }, [timeframe, autoRefresh, fetchAnalytics]);

  if (loading && !data) {
    return (
      <div className="bg-white rounded-lg border border-outline-variant/50 p-12 text-center shadow-sm">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4" />
        <p className="text-on-surface font-medium">Cargando métricas y telemetría de red...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-white rounded-lg border border-error/30 p-8 text-center shadow-sm">
        <span className="material-symbols-outlined text-error text-4xl mb-2">error</span>
        <h3 className="text-lg font-bold text-error mb-2">Error al cargar analíticas</h3>
        <p className="text-on-surface-variant text-sm mb-4">{error}</p>
        <button
          onClick={() => fetchAnalytics(timeframe)}
          className="px-4 py-2 bg-primary text-white rounded text-sm font-semibold hover:bg-primary-container transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!data) return null;

  const maxVisitsInSeries = Math.max(...data.timeSeries.map((t) => t.visitas), 1);
  const totalNetworkReqs = data.network.totalSolicitudes || 1;
  const successRate = Math.round((data.network.codigosEstado.exitos2xx / totalNetworkReqs) * 1000) / 10;

  return (
    <div className="space-y-6">
      {/* 1. Header & Controls */}
      <div className="bg-white rounded-lg border border-outline-variant/60 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-28px">query_stats</span>
              <h2 className="text-xl font-bold font-heading text-on-surface">
                Analíticas & Telemetría de Red
              </h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary-fixed text-on-secondary-fixed border border-secondary/20">
                100% In-House
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              Monitoreo de tráfico en tiempo real, latencias de red y eventos de impacto sin cookies de terceros ni rastreadores externos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Live Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container border border-outline-variant/40 text-xs font-medium text-on-surface">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-600"></span>
              </span>
              <span>
                <strong className="text-green-700 font-bold">{data.kpis.usuariosActivosAhora}</strong> activos ahora
              </span>
            </div>

            {/* Timeframe selector */}
            <div className="inline-flex rounded-lg border border-outline-variant/60 p-0.5 bg-surface-container-lowest">
              {(
                [
                  { id: '24h', label: '24 Horas' },
                  { id: '7d', label: '7 Días' },
                  { id: '30d', label: '30 Días' },
                  { id: 'all', label: 'Histórico' },
                ] as const
              ).map((tf) => (
                <button
                  key={tf.id}
                  onClick={() => setTimeframe(tf.id)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    timeframe === tf.id
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>

            {/* Refresh button */}
            <button
              onClick={() => fetchAnalytics(timeframe, true)}
              title="Refrescar datos"
              disabled={refreshing}
              className="p-2 rounded-lg border border-outline-variant/60 text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-sm ${refreshing ? 'animate-spin' : ''}`}>
                refresh
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Card 1: Vistas */}
        <div className="bg-white rounded-lg border border-outline-variant/60 p-4 shadow-sm relative overflow-hidden">
          <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
            Vistas de Página
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-on-surface font-heading">
            {data.kpis.totalVistas.toLocaleString()}
          </div>
          <div className="text-11px text-on-surface-variant mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs text-primary">visibility</span>
            <span>Total páginas vistas</span>
          </div>
        </div>

        {/* Card 2: Visitantes Únicos */}
        <div className="bg-white rounded-lg border border-outline-variant/60 p-4 shadow-sm relative overflow-hidden">
          <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
            Visitantes Únicos
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-on-surface font-heading">
            {data.kpis.visitantesUnicos.toLocaleString()}
          </div>
          <div className="text-11px text-on-surface-variant mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs text-secondary">group</span>
            <span>Sesiones anónimas</span>
          </div>
        </div>

        {/* Card 3: Latencia Media */}
        <div className="bg-white rounded-lg border border-outline-variant/60 p-4 shadow-sm relative overflow-hidden">
          <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
            Latencia de Red
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-on-surface font-heading">
            {data.kpis.latenciaPromedioMs}
            <span className="text-base font-normal text-on-surface-variant ml-1">ms</span>
          </div>
          <div className="text-11px text-on-surface-variant mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs text-green-600">bolt</span>
            <span>P95: {data.network.latenciaP95Ms}ms</span>
          </div>
        </div>

        {/* Card 4: Tasa Éxito HTTP */}
        <div className="bg-white rounded-lg border border-outline-variant/60 p-4 shadow-sm relative overflow-hidden">
          <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
            Tasa Éxito HTTP
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-on-surface font-heading">
            {isNaN(successRate) ? 100 : successRate}%
          </div>
          <div className="text-11px text-on-surface-variant mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs text-green-600">check_circle</span>
            <span>{data.network.codigosEstado.exitos2xx} solicitudes 2xx</span>
          </div>
        </div>

        {/* Card 5: Eventos */}
        <div className="bg-white rounded-lg border border-outline-variant/60 p-4 shadow-sm relative overflow-hidden col-span-2 md:col-span-1">
          <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
            Eventos de Acción
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-on-surface font-heading">
            {data.kpis.totalEventos.toLocaleString()}
          </div>
          <div className="text-11px text-on-surface-variant mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs text-tertiary">touch_app</span>
            <span>Interacciones registradas</span>
          </div>
        </div>
      </div>

      {/* 3. Traffic Time Series Visual Chart */}
      <div className="bg-white rounded-lg border border-outline-variant/60 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-on-surface">Evolución de Tráfico y Visitas</h3>
            <p className="text-xs text-on-surface-variant">
              Distribución temporal de tráfico ({timeframe === '24h' ? 'Por hora' : 'Por día'})
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-primary inline-block"></span>
              <span className="text-on-surface font-medium">Vistas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-secondary-container inline-block"></span>
              <span className="text-on-surface font-medium">Únicos</span>
            </div>
          </div>
        </div>

        {data.timeSeries.length === 0 ? (
          <div className="h-44 flex items-center justify-center border border-dashed border-outline-variant/60 rounded-lg text-xs text-on-surface-variant">
            No se registran visitas en este periodo de tiempo aún.
          </div>
        ) : (
          <div className="space-y-2">
            <div className="h-48 flex items-end gap-1.5 pt-4 pb-2 px-1 border-b border-outline-variant/30">
              {data.timeSeries.map((point, index) => {
                const heightPercent = Math.max(Math.round((point.visitas / maxVisitsInSeries) * 100), 4);
                const uniquePercent = Math.max(Math.round((point.visitantesUnicos / maxVisitsInSeries) * 100), 2);
                const isHovered = hoveredBar === index;

                return (
                  <div
                    key={point.label}
                    className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                    onMouseEnter={() => setHoveredBar(index)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {/* Tooltip */}
                    {isHovered && (
                      <div className="absolute -top-16 z-20 bg-on-surface text-surface text-11px rounded px-2.5 py-1.5 shadow-lg whitespace-nowrap pointer-events-none">
                        <div className="font-bold">{point.label}</div>
                        <div>Vistas: {point.visitas} | Únicos: {point.visitantesUnicos}</div>
                      </div>
                    )}

                    <div className="w-full max-w-[28px] flex items-end justify-center gap-0.5 h-full">
                      {/* Bar 1: Vistas */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t transition-all ${
                          isHovered ? 'bg-primary-container' : 'bg-primary'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Labels under chart */}
            <div className="flex justify-between text-[10px] text-on-surface-variant px-1 font-mono">
              <span>{data.timeSeries[0]?.label}</span>
              {data.timeSeries.length > 2 && (
                <span>{data.timeSeries[Math.floor(data.timeSeries.length / 2)]?.label}</span>
              )}
              <span>{data.timeSeries[data.timeSeries.length - 1]?.label}</span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Two Columns Grid: Top Pages & Referrers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages Table */}
        <div className="bg-white rounded-lg border border-outline-variant/60 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-base">link</span>
              Rutas y Páginas Más Visitadas
            </h3>
            <span className="text-xs text-on-surface-variant font-medium">Top {data.topPages.length}</span>
          </div>

          {data.topPages.length === 0 ? (
            <p className="text-xs text-on-surface-variant py-4 text-center">Sin visitas registradas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-outline-variant/40 text-on-surface-variant font-semibold">
                    <th className="pb-2 font-medium">Ruta</th>
                    <th className="pb-2 text-right font-medium">Vistas</th>
                    <th className="pb-2 text-right font-medium">Únicos</th>
                    <th className="pb-2 text-right font-medium">Latencia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {data.topPages.map((page) => (
                    <tr key={page.path} className="hover:bg-surface-container/40 transition-colors">
                      <td className="py-2.5 pr-2 font-mono font-medium text-on-surface truncate max-w-[200px]" title={page.path}>
                        <div className="flex items-center gap-2">
                          <span className="truncate">{page.path}</span>
                        </div>
                        <div className="w-full bg-surface-container h-1 rounded-full mt-1 overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full"
                            style={{ width: `${page.porcentaje}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-2.5 text-right font-bold text-on-surface">
                        {page.visitas}
                        <span className="text-[10px] text-on-surface-variant font-normal block">
                          {page.porcentaje}%
                        </span>
                      </td>
                      <td className="py-2.5 text-right text-on-surface-variant">{page.visitantesUnicos}</td>
                      <td className="py-2.5 text-right text-on-surface-variant font-mono">{page.tiempoPromedioMs}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Referrers */}
        <div className="bg-white rounded-lg border border-outline-variant/60 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-base">traffic</span>
              Fuentes de Tráfico (Referrers)
            </h3>
            <span className="text-xs text-on-surface-variant font-medium">Top {data.topReferrers.length}</span>
          </div>

          {data.topReferrers.length === 0 ? (
            <p className="text-xs text-on-surface-variant py-4 text-center">Sin orígenes registrados.</p>
          ) : (
            <div className="space-y-3 pt-1">
              {data.topReferrers.map((ref) => (
                <div key={ref.origen} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs text-on-surface-variant">
                        {ref.origen.includes('WhatsApp') ? 'chat' : ref.origen.includes('Google') ? 'search' : 'public'}
                      </span>
                      {ref.origen}
                    </span>
                    <span className="font-bold text-on-surface">
                      {ref.visitas} <span className="text-[10px] text-on-surface-variant font-normal">({ref.porcentaje}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-secondary h-full rounded-full transition-all duration-500"
                      style={{ width: `${ref.porcentaje}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. Devices, Browsers & Key Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device & Browser Distribution */}
        <div className="bg-white rounded-lg border border-outline-variant/60 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-on-surface mb-3 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-tertiary text-base">devices</span>
            Dispositivos y Navegadores
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-semibold text-on-surface-variant mb-2">Dispositivos</div>
              <div className="space-y-2">
                {data.devices.dispositivos.map((d) => (
                  <div key={d.tipo} className="flex items-center justify-between text-xs">
                    <span className="capitalize text-on-surface flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs text-on-surface-variant">
                        {d.tipo === 'mobile' ? 'smartphone' : d.tipo === 'tablet' ? 'tablet' : 'computer'}
                      </span>
                      {d.tipo}
                    </span>
                    <span className="font-semibold text-on-surface">{d.porcentaje}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-on-surface-variant mb-2">Navegadores</div>
              <div className="space-y-2">
                {data.devices.navegadores.slice(0, 4).map((n) => (
                  <div key={n.nombre} className="flex items-center justify-between text-xs">
                    <span className="text-on-surface truncate max-w-[120px]" title={n.nombre}>
                      {n.nombre}
                    </span>
                    <span className="font-semibold text-on-surface">{n.porcentaje}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top Events / Conversions */}
        <div className="bg-white rounded-lg border border-outline-variant/60 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-green-700 text-base">ads_click</span>
              Eventos de Conversión e Interacción
            </h3>
            <span className="text-xs text-on-surface-variant font-medium">Top {data.topEvents.length}</span>
          </div>

          {data.topEvents.length === 0 ? (
            <p className="text-xs text-on-surface-variant py-4 text-center">No hay eventos registrados en este periodo.</p>
          ) : (
            <div className="space-y-2.5">
              {data.topEvents.map((evt) => (
                <div key={evt.nombreEvento} className="flex items-center justify-between text-xs p-2 rounded bg-surface-container-low border border-outline-variant/30">
                  <div>
                    <span className="font-bold text-on-surface font-mono">{evt.nombreEvento}</span>
                    <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-surface-container text-on-surface-variant uppercase">
                      {evt.categoria}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-on-surface">{evt.total}</span>
                    <span className="text-[10px] text-on-surface-variant block font-normal">
                      {evt.usuariosUnicos} usuarios
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 6. Live Network Traffic Feed (Stream en Tiempo Real) */}
      <div className="bg-white rounded-lg border border-outline-variant/60 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-base">stream</span>
            <h3 className="text-sm font-bold text-on-surface">
              Monitor de Tráfico de Red en Vivo (Stream de Solicitudes)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-on-surface-variant cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
              />
              <span>Auto-refresh (10s)</span>
            </label>
          </div>
        </div>

        {data.liveFeed.length === 0 ? (
          <p className="text-xs text-on-surface-variant py-6 text-center">Sin solicitudes recientes.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-outline-variant/40 text-on-surface-variant font-semibold">
                  <th className="pb-2 font-medium">Método</th>
                  <th className="pb-2 font-medium">Ruta / Endpoint</th>
                  <th className="pb-2 font-medium text-center">Estado</th>
                  <th className="pb-2 font-medium text-right">Latencia</th>
                  <th className="pb-2 font-medium">Dispositivo</th>
                  <th className="pb-2 font-medium">Referencia</th>
                  <th className="pb-2 font-medium text-right">Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 font-mono text-[11px]">
                {data.liveFeed.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-container/40 transition-colors">
                    <td className="py-2 pr-2">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          item.metodo === 'GET'
                            ? 'bg-blue-100 text-blue-800'
                            : item.metodo === 'POST'
                            ? 'bg-green-100 text-green-800'
                            : item.metodo === 'PATCH'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.metodo}
                      </span>
                    </td>
                    <td className="py-2 pr-2 text-on-surface font-medium truncate max-w-[240px]" title={item.path}>
                      {item.path}
                    </td>
                    <td className="py-2 text-center">
                      <span
                        className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                          item.codigoEstado >= 200 && item.codigoEstado < 300
                            ? 'bg-green-50 text-green-700'
                            : item.codigoEstado >= 400
                            ? 'bg-red-50 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {item.codigoEstado}
                      </span>
                    </td>
                    <td className="py-2 text-right text-on-surface-variant font-mono">
                      {item.tiempoRespuestaMs}ms
                    </td>
                    <td className="py-2 text-on-surface-variant capitalize">
                      {item.tipoDispositivo}
                    </td>
                    <td className="py-2 text-on-surface-variant truncate max-w-[140px]" title={item.origenReferencia || 'Directo'}>
                      {item.origenReferencia || 'Directo'}
                    </td>
                    <td className="py-2 text-right text-on-surface-variant font-sans text-[10px]">
                      {new Date(item.creadoEn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
