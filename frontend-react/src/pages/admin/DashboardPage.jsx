import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDashboardAdmin } from '../../hooks/useDashboardAdmin';

/* ── Constantes ─────────────────────────────────────────────────────────── */

const VACANTE_STATUS_COLORS = {
  activa:    { bg: 'bg-green-500',  label: 'Activas'    },
  pausada:   { bg: 'bg-amber-400',  label: 'Pausadas'   },
  cerrada:   { bg: 'bg-gray-400',   label: 'Cerradas'   },
  rechazada: { bg: 'bg-red-400',    label: 'Rechazadas' },
};

const ROLE_COLORS = {
  CANDIDATO:  { bg: 'bg-[#1A56DB]', label: 'Candidatos' },
  EMPRESA:    { bg: 'bg-[#10B981]', label: 'Empresas'   },
  SUPERADMIN: { bg: 'bg-purple-500', label: 'Admins'    },
};

const ACCESOS_RAPIDOS = [
  { to: '/admin/empresas', label: 'Verificar empresas',   desc: 'Aprobar empresas pendientes',   color: 'blue'   },
  { to: '/admin/vacantes', label: 'Moderar vacantes',     desc: 'Revisar vacantes por aprobar',  color: 'amber'  },
  { to: '/admin/usuarios', label: 'Gestionar usuarios',   desc: 'Ver y gestionar cuentas',       color: 'purple' },
];

/* ── Componente principal ───────────────────────────────────────────────── */

export default function AdminDashboardPage() {
  const { stats, loading, error, fetchStats } = useDashboardAdmin();

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (loading && !stats) return <SkeletonDashboard />;

  const vacAntes    = stats?.vacantesPorEstado ?? [];
  const usuarios    = stats?.usuariosPorRol    ?? [];
  const totalVac    = vacAntes.reduce((s, r) => s + (r.total ?? 0), 0);
  const totalUsers  = usuarios.reduce((s, r) => s + (r.total ?? 0), 0);

  return (
    <div className="space-y-8">

      {/* Encabezado */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Panel de Control</h2>
        <p className="text-sm text-slate-500 mt-1">
          Visión global de IntegraJobs en tiempo real.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-xl">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          Algunas métricas no están disponibles. Verifica la conexión con el backend.
        </div>
      )}

      {/* KPIs globales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Usuarios totales"
          value={stats?.totalUsuarios ?? totalUsers ?? '—'}
          icon={<IcoUsuarios />}
          color="blue"
          trend={null}
        />
        <KpiCard
          label="Empresas registradas"
          value={stats?.totalEmpresas ?? '—'}
          icon={<IcoEmpresas />}
          color="green"
        />
        <KpiCard
          label="Vacantes publicadas"
          value={stats?.totalVacantes ?? totalVac ?? '—'}
          icon={<IcoVacantes />}
          color="purple"
        />
        <KpiCard
          label="Postulaciones"
          value={stats?.totalSolicitudes ?? '—'}
          icon={<IcoPostulaciones />}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Vacantes por estado — barra horizontal */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-5">Vacantes por estado</h3>

          {vacAntes.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Sin datos disponibles</p>
          ) : (
            <div className="space-y-4">
              {/* Barra compuesta */}
              <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
                {vacAntes.map((row) => {
                  const pct  = totalVac ? Math.round((row.total / totalVac) * 100) : 0;
                  const cfg  = VACANTE_STATUS_COLORS[row.status] ?? { bg: 'bg-gray-300' };
                  return pct > 0 ? (
                    <div key={row.status} className={`${cfg.bg} transition-all`} style={{ width: `${pct}%` }} title={`${row.status}: ${row.total}`} />
                  ) : null;
                })}
              </div>

              {/* Leyenda */}
              <div className="grid grid-cols-2 gap-2">
                {vacAntes.map((row) => {
                  const cfg  = VACANTE_STATUS_COLORS[row.status] ?? { bg: 'bg-gray-400', label: row.status };
                  const pct  = totalVac ? Math.round((row.total / totalVac) * 100) : 0;
                  return (
                    <div key={row.status} className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.bg}`} />
                      <span className="text-xs text-slate-600 flex-1 truncate">{cfg.label}</span>
                      <span className="text-xs font-semibold text-slate-800">{row.total}</span>
                      <span className="text-xs text-slate-400">({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Usuarios por rol */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-5">Usuarios por rol</h3>

          {usuarios.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Sin datos disponibles</p>
          ) : (
            <div className="space-y-3">
              {usuarios.map((row) => {
                const cfg  = ROLE_COLORS[row.role] ?? { bg: 'bg-gray-400', label: row.role };
                const pct  = totalUsers ? Math.round((row.total / totalUsers) * 100) : 0;
                return (
                  <div key={row.role} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${cfg.bg}`} />
                        <span className="text-xs font-medium text-slate-700">{cfg.label}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-800">{row.total}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${cfg.bg}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Accesos rápidos de moderación */}
      <div>
        <h3 className="text-base font-semibold text-slate-900 mb-4">Acciones de moderación</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {ACCESOS_RAPIDOS.map((item) => (
            <AccesoRapido key={item.to} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Sub-componentes ─────────────────────────────────────────────────────── */

function KpiCard({ label, value, icon, color }) {
  const colors = {
    blue:   { bg: 'bg-blue-50',   icon: 'text-[#1A56DB]' },
    green:  { bg: 'bg-green-50',  icon: 'text-[#10B981]' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600' },
    amber:  { bg: 'bg-amber-50',  icon: 'text-amber-600'  },
  };
  const c = colors[color] ?? colors.blue;
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center mb-3 ${c.icon}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}

function AccesoRapido({ item }) {
  const colors = {
    blue:   { bg: 'bg-blue-50',   border: 'hover:border-[#1A56DB]', icon: 'text-[#1A56DB]',  btn: 'text-[#1A56DB]'  },
    amber:  { bg: 'bg-amber-50',  border: 'hover:border-amber-400',  icon: 'text-amber-600',  btn: 'text-amber-600'  },
    purple: { bg: 'bg-purple-50', border: 'hover:border-purple-400', icon: 'text-purple-600', btn: 'text-purple-600' },
  };
  const c = colors[item.color] ?? colors.blue;

  return (
    <Link
      to={item.to}
      className={`group flex items-center gap-4 bg-white border-2 border-gray-200 ${c.border} rounded-2xl px-5 py-4 transition-all duration-150 hover:shadow-md`}
    >
      <div className={`w-10 h-10 ${c.bg} ${c.icon} rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110`}>
        <IcoModeración />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800">{item.label}</p>
        <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
      </div>
      <svg className={`w-4 h-4 ${c.btn} shrink-0 transition-transform group-hover:translate-x-0.5`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </Link>
  );
}

function SkeletonDashboard() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-48 bg-gray-200 rounded-lg" />
        <div className="h-4 w-64 bg-gray-100 rounded" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
            <div className="w-10 h-10 bg-gray-100 rounded-xl" />
            <div className="h-7 w-14 bg-gray-200 rounded" />
            <div className="h-3 w-28 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 h-52" />
        <div className="bg-white border border-gray-200 rounded-2xl p-6 h-52" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 h-20" />
        ))}
      </div>
    </div>
  );
}

/* ── Íconos inline ─────────────────────────────────────────────────────── */
function IcoUsuarios() {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>;
}
function IcoEmpresas() {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>;
}
function IcoVacantes() {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.073a2.25 2.25 0 01-2.25 2.25h-12a2.25 2.25 0 01-2.25-2.25V6a2.25 2.25 0 012.25-2.25h4.5M18.75 3v6m3-3h-6" /></svg>;
}
function IcoPostulaciones() {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>;
}
function IcoModeración() {
  return <svg className="w-4.5 h-4.5 w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>;
}
