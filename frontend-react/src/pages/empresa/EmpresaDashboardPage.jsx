import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDashboardEmpresa } from '../../hooks/useDashboardEmpresa';

/* ── URL base del servidor (sin /api) ───────────────────────────────────── */
const BACKEND_URL =
  (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api').replace(/\/api$/, '');

/* ── Constantes ─────────────────────────────────────────────────────────── */

const STATUS_CONFIG = {
  nuevo:      { label: 'Nueva',        bg: 'bg-blue-50',   text: 'text-blue-700',  dot: 'bg-blue-400'   },
  en_proceso: { label: 'En proceso',   bg: 'bg-amber-50',  text: 'text-amber-700', dot: 'bg-amber-400'  },
  rechazado:  { label: 'Rechazada',    bg: 'bg-red-50',    text: 'text-red-600',   dot: 'bg-red-400'    },
  contratado: { label: 'Contratado',   bg: 'bg-green-50',  text: 'text-green-700', dot: 'bg-green-400'  },
};

const VACANTE_STATUS = {
  activa:    { label: 'Activa',    chip: 'bg-green-100 text-green-700'  },
  pausada:   { label: 'Pausada',   chip: 'bg-amber-100 text-amber-700'  },
  cerrada:   { label: 'Cerrada',   chip: 'bg-gray-100 text-gray-500'    },
  rechazada: { label: 'Rechazada', chip: 'bg-red-100 text-red-600'      },
};

/* ── Componente principal ───────────────────────────────────────────────── */

export default function EmpresaDashboardPage() {
  const { user }                            = useAuth();
  const { dashboard, loading, error,
          fetchDashboard }                  = useDashboardEmpresa();

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  if (loading && !dashboard) return <SkeletonDashboard />;

  const metricas            = dashboard?.metricas            ?? {};
  const vacantesMasAplicadas = dashboard?.vacantesMasAplicadas ?? [];
  const aplicacionesRecientes = dashboard?.aplicacionesRecientes ?? [];
  const porStatus            = metricas.aplicacionesPorStatus ?? {};

  const nombreEmpresa = user?.nombre ?? 'tu empresa';

  return (
    <div className="space-y-8">

      {/* Bienvenida */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Bienvenido, <span className="text-[#1A56DB]">{nombreEmpresa}</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Aquí tienes un resumen de la actividad de tus vacantes.
          </p>
        </div>
        <Link
          to="/empresa/crear-vacante"
          className="inline-flex items-center gap-2 bg-[#1A56DB] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-sm shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nueva vacante
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-xl">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          No se pudieron cargar todas las métricas. Algunos datos pueden estar incompletos.
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total vacantes"
          value={metricas.totalVacantes ?? '—'}
          icon={<IcoVacante />}
          color="blue"
        />
        <KpiCard
          label="Vacantes activas"
          value={metricas.vacantesActivas ?? '—'}
          icon={<IcoActiva />}
          color="green"
        />
        <KpiCard
          label="Total aplicaciones"
          value={metricas.totalAplicaciones ?? '—'}
          icon={<IcoAplicacion />}
          color="purple"
        />
        <KpiCard
          label="Nuevas por revisar"
          value={porStatus.nuevo ?? '—'}
          icon={<IcoNueva />}
          color="amber"
        />
      </div>

      {/* Embudo de aplicaciones */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-5">Estado de aplicaciones</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <div key={key} className={`${cfg.bg} rounded-xl px-4 py-4`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                <span className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</span>
              </div>
              <p className={`text-2xl font-bold ${cfg.text}`}>{porStatus[key] ?? 0}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Vacantes con más aplicaciones */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-slate-900">Top vacantes</h3>
            <Link to="/empresa/dashboard" className="text-xs text-[#1A56DB] hover:underline">
              Ver todas
            </Link>
          </div>

          {vacantesMasAplicadas.length === 0 ? (
            <EmptyState
              mensaje="Todavía no tienes vacantes publicadas"
              cta={{ to: '/empresa/crear-vacante', label: 'Publicar primera vacante' }}
            />
          ) : (
            <div className="space-y-3">
              {vacantesMasAplicadas.map((v) => {
                const cfg = VACANTE_STATUS[v.status] ?? VACANTE_STATUS.pausada;
                return (
                  <div key={v.id} className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{v.titulo}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {v._count?.applications ?? 0} aplicacion{(v._count?.applications ?? 0) !== 1 ? 'es' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.chip}`}>
                        {cfg.label}
                      </span>
                      <Link
                        to={`/empresa/vacantes/${v.id}/aplicaciones`}
                        className="text-xs text-[#1A56DB] hover:underline"
                      >
                        Ver
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Aplicaciones recientes */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-slate-900">Aplicaciones recientes</h3>
          </div>

          {aplicacionesRecientes.length === 0 ? (
            <EmptyState mensaje="Aún no has recibido aplicaciones" />
          ) : (
            <div className="space-y-3">
              {aplicacionesRecientes.map((app) => {
                const cfg      = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.nuevo;
                const nombre   = app.user?.nombre   ?? '';
                const apellido = app.user?.apellidos ?? '';
                const nombreCompleto = [nombre, apellido].filter(Boolean).join(' ') || app.user?.email || '—';
                const rawFecha = app.createdAt ?? app.created_at;
                return (
                  <div key={app.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <Avatar
                      nombre={nombre}
                      apellidos={apellido}
                      avatarRuta={app.user?.avatarUrl ?? app.user?.avatar_url ?? null}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{nombreCompleto}</p>
                      <p className="text-xs text-slate-400 truncate">{app.vacancy?.titulo ?? '—'}</p>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                        {cfg.label}
                      </span>
                      {rawFecha && (
                        <span className="text-[11px] text-slate-400">{formatRelativo(rawFecha)}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Sub-componentes ─────────────────────────────────────────────────────── */

function KpiCard({ label, value, icon, color }) {
  const colors = {
    blue:   { bg: 'bg-blue-50',   icon: 'text-[#1A56DB]', val: 'text-slate-900' },
    green:  { bg: 'bg-green-50',  icon: 'text-[#10B981]', val: 'text-slate-900' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', val: 'text-slate-900' },
    amber:  { bg: 'bg-amber-50',  icon: 'text-amber-600', val: 'text-slate-900' },
  };
  const c = colors[color] ?? colors.blue;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center mb-3 ${c.icon}`}>
        {icon}
      </div>
      <p className={`text-2xl font-bold ${c.val}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}

function Avatar({ nombre, apellidos, avatarRuta }) {
  const ini1 = nombre?.trim()?.charAt(0)?.toUpperCase()   ?? '';
  const ini2 = apellidos?.trim()?.charAt(0)?.toUpperCase() ?? '';
  const iniciales = (ini1 + ini2) || '?';

  let avatarSrc = null;
  if (avatarRuta) {
    avatarSrc = avatarRuta.startsWith('http')
      ? avatarRuta
      : `${BACKEND_URL}${avatarRuta}`;
  }

  return (
    <div className="w-10 h-10 flex-shrink-0 rounded-full overflow-hidden flex items-center justify-center bg-[#1A56DB] text-white font-bold text-sm">
      {avatarSrc ? (
        <img
          src={avatarSrc}
          alt={iniciales}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      <span
        style={{ display: avatarSrc ? 'none' : 'flex' }}
        className="w-full h-full items-center justify-center"
      >
        {iniciales}
      </span>
    </div>
  );
}

function EmptyState({ mensaje, cta }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      </div>
      <p className="text-sm text-slate-600 font-medium">{mensaje}</p>
      {cta && (
        <Link to={cta.to} className="mt-3 text-xs text-[#1A56DB] font-semibold hover:underline">
          {cta.label}
        </Link>
      )}
    </div>
  );
}

function SkeletonDashboard() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-7 w-56 bg-gray-200 rounded-lg" />
          <div className="h-4 w-40 bg-gray-100 rounded" />
        </div>
        <div className="h-10 w-36 bg-gray-200 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
            <div className="w-10 h-10 bg-gray-100 rounded-xl" />
            <div className="h-7 w-16 bg-gray-200 rounded" />
            <div className="h-3 w-24 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl p-6 h-36" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 h-64" />
        <div className="bg-white border border-gray-200 rounded-2xl p-6 h-64" />
      </div>
    </div>
  );
}

/* ── Íconos inline ─────────────────────────────────────────────────────── */
function IcoVacante() {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.073a2.25 2.25 0 01-2.25 2.25h-12a2.25 2.25 0 01-2.25-2.25V6a2.25 2.25 0 012.25-2.25h4.5M18.75 3v6m3-3h-6" /></svg>;
}
function IcoActiva() {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
function IcoAplicacion() {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>;
}
function IcoNueva() {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>;
}

/* ── Helper ─────────────────────────────────────────────────────────────── */
function formatRelativo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 86400000);
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  if (diff < 7)  return `Hace ${diff} días`;
  return new Intl.DateTimeFormat('es-SV', { day: 'numeric', month: 'short' }).format(new Date(iso));
}
