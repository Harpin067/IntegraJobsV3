import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useEmpresaAplicaciones } from '../../hooks/useEmpresaAplicaciones';

/* ── URL base del servidor (sin /api) ───────────────────────────────────── */
const BACKEND_URL =
  (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api').replace(/\/api$/, '');

/* ── Helpers de URL ─────────────────────────────────────────────────────── */

// Recibe la ruta almacenada en BD ( /uploads/avatars/archivo.jpg )
// y devuelve la URL absoluta pública.
function buildAvatarUrl(ruta) {
  if (!ruta) return null;
  if (ruta.startsWith('http')) return ruta;
  return `${BACKEND_URL}${ruta}`;
}

// Extrae solo el nombre de archivo de una ruta como /uploads/cvs/archivo.pdf
function extractFilename(ruta) {
  if (!ruta) return null;
  return ruta.split('/').pop();
}

/* ── Descarga autenticada — abre el PDF en nueva pestaña ───────────────── */
async function abrirCv(ruta) {
  const filename = extractFilename(ruta);
  if (!filename) throw new Error('Nombre de archivo inválido');

  const token = localStorage.getItem('token');
  const url   = `${BACKEND_URL}/uploads/cvs/${filename}`;

  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Error ${res.status} al obtener el CV`);
  }

  const blob    = await res.blob();
  const blobUrl = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
  window.open(blobUrl, '_blank', 'noopener,noreferrer');

  // Liberar la referencia después de dar tiempo al navegador para abrir la pestaña
  setTimeout(() => URL.revokeObjectURL(blobUrl), 10_000);
}

/* ── Constantes de estado ───────────────────────────────────────────────── */

const ESTADOS = [
  { value: 'nuevo',      label: 'Nueva postulación' },
  { value: 'en_proceso', label: 'En proceso'         },
  { value: 'rechazado',  label: 'Rechazado'          },
  { value: 'contratado', label: 'Contratado'         },
];

const STATUS_CFG = {
  nuevo:      { label: 'Nueva',      chip: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-400',  bar: 'bg-blue-400'  },
  en_proceso: { label: 'En proceso', chip: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400', bar: 'bg-amber-400' },
  rechazado:  { label: 'Rechazado',  chip: 'bg-red-100 text-red-600',     dot: 'bg-red-400',   bar: 'bg-red-400'   },
  contratado: { label: 'Contratado', chip: 'bg-green-100 text-green-700', dot: 'bg-green-400', bar: 'bg-green-400' },
};

/* ══════════════════════════════════════════════════════════════════════════
   Componente principal
══════════════════════════════════════════════════════════════════════════ */

export default function AplicacionesVacantePage() {
  const { vacancyId } = useParams();
  const {
    aplicaciones, vacante, loading, error,
    fetchAplicaciones, actualizarEstado,
  } = useEmpresaAplicaciones();

  useEffect(() => { fetchAplicaciones(vacancyId); }, [vacancyId, fetchAplicaciones]);

  const titulo = vacante?.titulo ?? 'Candidatos postulados';

  return (
    <div className="space-y-6">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          to="/empresa/dashboard"
          className="inline-flex items-center gap-1.5 text-slate-400 hover:text-[#1A56DB] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Mis vacantes
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-600 font-medium truncate max-w-xs">{titulo}</span>
      </div>

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{titulo}</h2>
          <p className="text-sm text-slate-500 mt-1">
            {loading
              ? 'Cargando candidatos…'
              : `${aplicaciones.length} candidato${aplicaciones.length !== 1 ? 's' : ''} postulado${aplicaciones.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {!loading && aplicaciones.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(STATUS_CFG).map(([key, cfg]) => {
              const count = aplicaciones.filter((a) => a.status === key).length;
              if (!count) return null;
              return (
                <span
                  key={key}
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.chip}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  {count} {cfg.label}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Error global */}
      {error && (
        <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          <IcoAlert />
          {error}
        </div>
      )}

      {/* Contenido */}
      {loading && aplicaciones.length === 0 ? (
        <SkeletonLista />
      ) : aplicaciones.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="space-y-4">
          {aplicaciones.map((app) => (
            <AplicacionCard
              key={app.id}
              app={app}
              onCambiarEstado={(estado) => actualizarEstado(app.id, estado)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Tarjeta de cada postulante
══════════════════════════════════════════════════════════════════════════ */

function AplicacionCard({ app, onCambiarEstado }) {
  const [abriendo, setAbriendo] = useState(false);
  const [cvError,  setCvError]  = useState(null);

  const user     = app.user ?? {};
  const nombre   = [user.nombre, user.apellidos].filter(Boolean).join(' ') || user.email || '—';
  const inicial  = nombre.charAt(0).toUpperCase();

  // Avatar: la BD almacena la ruta completa /uploads/avatars/archivo.ext
  const avatarSrc = buildAvatarUrl(user.avatarUrl ?? user.avatar_url ?? null);

  // cvSnapshot puede ser el literal 'sin-cv' cuando el candidato aún no tenía CV al
  // momento de postularse. En ese caso caemos al cvUrl actual del perfil.
  const rawSnapshot = app.cvSnapshot ?? app.cv_snapshot ?? null;
  const cvRuta = (rawSnapshot && rawSnapshot !== 'sin-cv')
    ? rawSnapshot
    : (user.cvUrl ?? user.cv_url ?? null);
  const tieneCv = !!cvRuta && cvRuta !== 'sin-cv';

  const rawFecha = app.createdAt ?? app.created_at;
  const fecha    = rawFecha
    ? new Intl.DateTimeFormat('es-SV', { day: 'numeric', month: 'short', year: 'numeric' })
        .format(new Date(rawFecha))
    : null;

  const cfg = STATUS_CFG[app.status] ?? STATUS_CFG.nuevo;

  async function handleVerCV() {
    if (!tieneCv || abriendo) return;
    setAbriendo(true);
    setCvError(null);
    try {
      await abrirCv(cvRuta);
    } catch (err) {
      setCvError(err.message ?? 'No se pudo abrir el CV');
    } finally {
      setAbriendo(false);
    }
  }

  return (
    <li className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

      {/* Banda de color según estado */}
      <div className={`h-[3px] w-full ${cfg.bar}`} />

      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">

          {/* ── Avatar ── */}
          <div className="shrink-0">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={nombre}
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
                onError={(e) => {
                  // Si la imagen falla, mostrar el fallback de iniciales
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              style={{ display: avatarSrc ? 'none' : 'flex' }}
              className="w-10 h-10 rounded-full bg-[#1A56DB]/10 text-[#1A56DB] font-bold text-sm items-center justify-center"
            >
              {inicial}
            </div>
          </div>

          {/* ── Datos del candidato ── */}
          <div className="flex-1 min-w-0">

            {/* Nombre + chip de estado */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className="font-semibold text-slate-900">{nombre}</h3>
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full ${cfg.chip}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </span>
            </div>

            {/* Datos de contacto */}
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
              {user.email && (
                <div className="flex items-center gap-2 min-w-0">
                  <IcoEmail />
                  <a
                    href={`mailto:${user.email}`}
                    className="text-[#1A56DB] hover:underline truncate"
                  >
                    {user.email}
                  </a>
                </div>
              )}
              {user.telefono && (
                <div className="flex items-center gap-2">
                  <IcoPhone />
                  <a href={`tel:${user.telefono}`} className="text-slate-700 hover:underline">
                    {user.telefono}
                  </a>
                </div>
              )}
              {fecha && (
                <div className="flex items-center gap-2">
                  <IcoClock />
                  <span className="text-slate-500">Postulado el {fecha}</span>
                </div>
              )}
            </dl>

            {/* Mensaje del candidato */}
            {app.mensaje && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide mb-1">
                  Mensaje
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">{app.mensaje}</p>
              </div>
            )}
          </div>

          {/* ── Panel de acciones ── */}
          <div className="flex flex-row sm:flex-col items-start gap-3 sm:gap-2 sm:min-w-[168px] shrink-0">

            {/* Botón CV */}
            <div className="w-full space-y-1">
              <button
                type="button"
                onClick={handleVerCV}
                disabled={!tieneCv || abriendo}
                className={[
                  'w-full inline-flex items-center justify-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl border transition-colors',
                  tieneCv
                    ? 'text-[#1A56DB] border-[#1A56DB] bg-white hover:bg-blue-50 disabled:opacity-60'
                    : 'text-slate-400 border-gray-200 bg-gray-50 cursor-not-allowed',
                ].join(' ')}
              >
                {abriendo ? (
                  <Spinner className="w-3.5 h-3.5" />
                ) : (
                  <IcoPdf tieneCv={tieneCv} />
                )}
                {abriendo ? 'Abriendo CV…' : tieneCv ? 'Ver CV' : 'Sin CV'}
              </button>

              {cvError && (
                <p className="text-[11px] text-red-500 text-center leading-tight">{cvError}</p>
              )}
            </div>

            {/* Selector de estado */}
            <div className="w-full">
              <label
                htmlFor={`estado-${app.id}`}
                className="block text-[11px] text-slate-400 font-medium mb-1"
              >
                Estado
              </label>
              <select
                id={`estado-${app.id}`}
                value={app.status}
                onChange={(e) => onCambiarEstado(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1A56DB] focus:border-transparent transition"
              >
                {ESTADOS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

        </div>
      </div>
    </li>
  );
}

/* ── Empty state / Skeleton ─────────────────────────────────────────────── */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      </div>
      <p className="font-semibold text-slate-700">Aún no hay postulaciones</p>
      <p className="text-sm text-slate-400 mt-1">
        Cuando los candidatos apliquen a esta vacante aparecerán aquí.
      </p>
    </div>
  );
}

function SkeletonLista() {
  return (
    <ul className="space-y-4 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <li key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="h-[3px] bg-gray-200" />
          <div className="p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
            <div className="flex-1 space-y-2.5">
              <div className="h-4 w-40 bg-gray-200 rounded" />
              <div className="h-3 w-56 bg-gray-100 rounded" />
              <div className="h-3 w-32 bg-gray-100 rounded" />
            </div>
            <div className="sm:w-44 space-y-2">
              <div className="h-8 bg-gray-100 rounded-xl" />
              <div className="h-8 bg-gray-100 rounded-xl" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ── Íconos inline ──────────────────────────────────────────────────────── */

function Spinner({ className = '' }) {
  return (
    <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

function IcoPdf({ tieneCv = true }) {
  return (
    <svg
      className={`w-3.5 h-3.5 shrink-0 ${tieneCv ? '' : 'opacity-40'}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function IcoEmail() {
  return (
    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

function IcoPhone() {
  return (
    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.338c0-1.162.943-2.088 2.105-2.088.76 0 1.43.425 1.76 1.067l1.345 2.69a2.11 2.11 0 01-.478 2.548l-.796.663a12.027 12.027 0 005.547 5.547l.663-.796a2.11 2.11 0 012.548-.478l2.69 1.345c.641.321 1.067.999 1.067 1.76 0 1.162-.926 2.105-2.088 2.105C8.552 21.75 2.25 15.448 2.25 6.338z" />
    </svg>
  );
}

function IcoClock() {
  return (
    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IcoAlert() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  );
}
