import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDashboardCandidato } from '../../hooks/useDashboardCandidato';

/* ── URL base del servidor (sin /api) ───────────────────────────────────── */
const BACKEND_URL =
  (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api').replace(/\/api$/, '');

/* ── Constantes ─────────────────────────────────────────────────────────── */

const STATUS_CONFIG = {
  nuevo: {
    label:  'Enviada',
    chip:   'bg-blue-100 text-blue-700',
    dot:    'bg-blue-400',
    kpiColor: 'blue',
  },
  en_proceso: {
    label:  'En proceso',
    chip:   'bg-amber-100 text-amber-700',
    dot:    'bg-amber-400',
    kpiColor: 'amber',
  },
  rechazado: {
    label:  'No seleccionado',
    chip:   'bg-red-100 text-red-600',
    dot:    'bg-red-400',
    kpiColor: 'red',
  },
  contratado: {
    label:  '¡Contratado!',
    chip:   'bg-green-100 text-green-700',
    dot:    'bg-green-400',
    kpiColor: 'green',
  },
};

/* ── Componente principal ───────────────────────────────────────────────── */

export default function DashboardCandidatoPage() {
  const { user }                            = useAuth();
  const { dashboard, loading, error,
          fetchDashboard }                  = useDashboardCandidato();

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  if (loading && !dashboard) return <SkeletonDashboard />;

  const perfil               = dashboard?.perfil               ?? {};
  const metricas             = dashboard?.metricas             ?? {};
  const postulacionesRecientes = dashboard?.postulacionesRecientes ?? [];
  const porStatus            = metricas.postulacionesPorStatus  ?? {};

  const nombre = perfil.nombre
    ? `${perfil.nombre} ${perfil.apellidos ?? ''}`.trim()
    : user?.nombre ?? 'Candidato';

  const tieneCv = !!(perfil.cvUrl ?? perfil.cv_url);

  return (
    <div className="space-y-8">

      {/* Bienvenida + estado de perfil */}
      <div className="flex flex-col sm:flex-row gap-5">

        {/* Saludo */}
        <div className="flex-1 bg-gradient-to-br from-[#1A56DB] to-[#1048c8] rounded-2xl p-6 text-white">
          <div className="flex items-center gap-4 mb-3">
            <Avatar
              nombre={perfil.nombre ?? user?.nombre ?? ''}
              apellidos={perfil.apellidos ?? user?.apellidos ?? ''}
              avatarRuta={perfil.avatarUrl ?? perfil.avatar_url ?? null}
            />
            <div>
              <p className="text-xs font-medium text-blue-200">Bienvenido de nuevo</p>
              <h2 className="text-lg font-bold leading-tight">{nombre}</h2>
            </div>
          </div>
          <p className="text-sm text-blue-100 leading-relaxed">
            Tienes{' '}
            <span className="font-bold text-white">{metricas.totalPostulaciones ?? 0}</span>{' '}
            postulacion{(metricas.totalPostulaciones ?? 0) !== 1 ? 'es' : ''} activa{(metricas.totalPostulaciones ?? 0) !== 1 ? 's' : ''}.
          </p>
          <Link
            to="/busqueda"
            className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            Explorar empleos
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        {/* Checklist de perfil */}
        <div className="sm:w-64 bg-white border border-gray-200 rounded-2xl p-5">
          <p className="text-sm font-semibold text-slate-800 mb-4">Completa tu perfil</p>
          <div className="space-y-3">
            <CheckItem done={!!(perfil.nombre)} label="Datos personales" />
            <CheckItem done={!!(perfil.avatarUrl ?? perfil.avatar_url)} label="Foto de perfil" link="/candidato/perfil" />
            <CheckItem done={tieneCv} label="CV subido" link="/candidato/perfil" />
          </div>
          {!tieneCv && (
            <Link
              to="/candidato/perfil"
              className="mt-4 flex items-center justify-center gap-1.5 w-full text-xs font-semibold text-[#1A56DB] border border-[#1A56DB]/30 bg-blue-50 hover:bg-blue-100 py-2 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Subir CV ahora
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-xl">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          No se pudieron cargar todas las métricas.
        </div>
      )}

      {/* Resumen por estado */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <StatusCard key={key} cfg={cfg} count={porStatus[key] ?? 0} />
        ))}
      </div>

      {/* Postulaciones recientes */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-slate-900">Postulaciones recientes</h3>
          <Link to="/candidato/dashboard" className="text-xs text-[#1A56DB] hover:underline">
            Ver todas
          </Link>
        </div>

        {postulacionesRecientes.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-1">
            {postulacionesRecientes.map((app) => (
              <PostulacionRow key={app.id} app={app} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Sub-componentes ─────────────────────────────────────────────────────── */

function StatusCard({ cfg, count }) {
  const colorMap = {
    blue:  { bg: 'bg-blue-50',  val: 'text-[#1A56DB]' },
    amber: { bg: 'bg-amber-50', val: 'text-amber-600'  },
    red:   { bg: 'bg-red-50',   val: 'text-red-600'    },
    green: { bg: 'bg-green-50', val: 'text-[#10B981]'  },
  };
  const c = colorMap[cfg.kpiColor] ?? colorMap.blue;
  return (
    <div className={`${c.bg} rounded-2xl px-4 py-4`}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
        <span className="text-xs font-medium text-slate-600">{cfg.label}</span>
      </div>
      <p className={`text-3xl font-bold ${c.val}`}>{count}</p>
    </div>
  );
}

function PostulacionRow({ app }) {
  const vacante  = app.vacancy ?? {};
  const empresa  = vacante.company?.nombre ?? '—';
  const rawLogo  = vacante.company?.logoUrl ?? vacante.company?.logo_url ?? null;
  const logoSrc  = rawLogo
    ? (rawLogo.startsWith('http') ? rawLogo : `${BACKEND_URL}${rawLogo}`)
    : null;
  const cfg      = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.nuevo;
  const rawFecha = app.createdAt ?? app.created_at;

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      {/* Logo empresa */}
      {logoSrc ? (
        <img
          src={logoSrc}
          alt={empresa}
          className="w-9 h-9 rounded-lg object-contain border border-gray-100 bg-white shrink-0"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      {(!logoSrc) ? (
        <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#1A56DB] font-bold text-sm flex items-center justify-center shrink-0">
          {empresa.charAt(0).toUpperCase()}
        </div>
      ) : (
        <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#1A56DB] font-bold text-sm items-center justify-center shrink-0 hidden">
          {empresa.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">{vacante.titulo ?? '—'}</p>
        <p className="text-xs text-slate-400 truncate">
          {empresa}
          {vacante.ubicacion ? ` · ${vacante.ubicacion}` : ''}
        </p>
      </div>

      <div className="shrink-0 flex flex-col items-end gap-1">
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${cfg.chip}`}>
          {cfg.label}
        </span>
        {rawFecha && (
          <span className="text-[11px] text-slate-400">{formatRelativo(rawFecha)}</span>
        )}
      </div>

      {vacante.id && (
        <Link to={`/vacante/${vacante.id}`} className="shrink-0 text-slate-300 hover:text-[#1A56DB] transition-colors ml-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </Link>
      )}
    </div>
  );
}

function CheckItem({ done, label, link }) {
  const content = (
    <div className="flex items-center gap-2.5">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-[#10B981]' : 'border-2 border-gray-200'}`}>
        {done && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className={`text-xs ${done ? 'text-slate-500 line-through' : 'text-slate-700 font-medium'}`}>
        {label}
      </span>
      {!done && link && (
        <span className="ml-auto text-[11px] text-[#1A56DB] font-semibold">Añadir →</span>
      )}
    </div>
  );

  if (!done && link) {
    return <Link to={link} className="block hover:bg-gray-50 rounded-lg -mx-1 px-1 py-0.5 transition-colors">{content}</Link>;
  }
  return content;
}

function Avatar({ nombre, apellidos, avatarRuta }) {
  // Construir las 2 iniciales: primera del nombre + primera del apellido
  const ini1 = nombre?.trim()?.charAt(0)?.toUpperCase()   ?? '';
  const ini2 = apellidos?.trim()?.charAt(0)?.toUpperCase() ?? '';
  const iniciales = (ini1 + ini2) || '?';

  // Construir URL absoluta — la BD almacena rutas como /uploads/avatars/archivo.ext
  let avatarSrc = null;
  if (avatarRuta) {
    avatarSrc = avatarRuta.startsWith('http')
      ? avatarRuta
      : `${BACKEND_URL}${avatarRuta}`;
  }

  return (
    <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center bg-blue-700 border-2 border-white/30 flex-shrink-0">
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
        className="w-full h-full items-center justify-center text-white font-bold text-lg leading-none"
      >
        {iniciales}
      </span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
        <svg className="w-6 h-6 text-[#1A56DB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      </div>
      <p className="text-sm font-medium text-slate-700">Aún no te has postulado a ninguna oferta</p>
      <p className="text-xs text-slate-400 mt-1 mb-4">Explora el tablero y envía tu primera candidatura</p>
      <Link
        to="/busqueda"
        className="bg-[#1A56DB] text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-blue-700 transition-colors"
      >
        Buscar empleos
      </Link>
    </div>
  );
}

function SkeletonDashboard() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex gap-5">
        <div className="flex-1 bg-gray-200 rounded-2xl h-40" />
        <div className="w-64 bg-gray-100 rounded-2xl h-40" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-2xl h-24" />
        ))}
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl p-6 h-64" />
    </div>
  );
}

/* ── Helper ─────────────────────────────────────────────────────────────── */
function formatRelativo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 86400000);
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  if (diff < 7)  return `Hace ${diff} días`;
  return new Intl.DateTimeFormat('es-SV', { day: 'numeric', month: 'short' }).format(new Date(iso));
}
