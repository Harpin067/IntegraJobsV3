import { useEffect } from 'react';
import { useAdminVacantes } from '../../hooks/useAdminVacantes';

const MODALIDAD_LABELS = {
  presencial: 'Presencial',
  remoto:     'Remoto',
  hibrido:    'Híbrido',
};

const CONTRATO_LABELS = {
  completo:  'Tiempo completo',
  medio:     'Medio tiempo',
  temporal:  'Temporal',
  freelance: 'Freelance',
};

const EXP_LABELS = {
  junior: 'Junior',
  mid:    'Mid-level',
  senior: 'Senior',
  lead:   'Lead',
};

function formatSalario(min, max) {
  if (!min && !max) return null;
  const fmt = (n) =>
    Number(n).toLocaleString('es-SV', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `Desde ${fmt(min)}`;
  return `Hasta ${fmt(max)}`;
}

export default function VacantesPendientesPage() {
  const {
    vacantesPendientes,
    loading,
    error,
    procesando,
    fetchVacantesPendientes,
    gestionarVacante,
  } = useAdminVacantes();

  useEffect(() => { fetchVacantesPendientes(); }, [fetchVacantesPendientes]);

  return (
    <div className="space-y-6">

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Vacantes Pendientes</h2>
          <p className="text-sm text-slate-500 mt-1">
            {loading
              ? 'Cargando…'
              : vacantesPendientes.length > 0
                ? `${vacantesPendientes.length} vacante${vacantesPendientes.length !== 1 ? 's' : ''} pendiente${vacantesPendientes.length !== 1 ? 's' : ''} de aprobación`
                : 'Ninguna vacante pendiente de aprobación'}
          </p>
        </div>
        <button
          onClick={fetchVacantesPendientes}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-2 text-sm font-medium text-[#1A56DB] bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
        >
          <IcoRefresh spinning={loading} />
          {loading ? 'Actualizando…' : 'Actualizar'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          <IcoAlert />
          {error}
        </div>
      )}

      {/* Contenido */}
      {loading && vacantesPendientes.length === 0 ? (
        <SkeletonLista />
      ) : vacantesPendientes.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="space-y-4">
          {vacantesPendientes.map((vacante) => (
            <VacanteCard
              key={vacante.id}
              vacante={vacante}
              procesando={procesando === vacante.id}
              onAprobar={() => gestionarVacante(vacante.id, true)}
              onRechazar={() => gestionarVacante(vacante.id, false)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── Tarjeta de vacante ──────────────────────────────────────────────────── */

function VacanteCard({ vacante, procesando, onAprobar, onRechazar }) {
  const salario = formatSalario(
    vacante.salarioMin ?? vacante.salario_min,
    vacante.salarioMax ?? vacante.salario_max,
  );

  const fechaRaw  = vacante.createdAt ?? vacante.created_at;
  const fecha     = fechaRaw
    ? new Intl.DateTimeFormat('es-SV', { day: 'numeric', month: 'short', year: 'numeric' })
        .format(new Date(fechaRaw))
    : null;

  const empresa   = vacante.company?.nombre ?? vacante.empresa_nombre ?? '—';
  const modalidad = vacante.tipoTrabajo     ?? vacante.tipo_trabajo;
  const contrato  = vacante.tipoContrato    ?? vacante.tipo_contrato;
  const exp       = vacante.experiencia;

  return (
    <li className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="h-[3px] bg-amber-400" />

      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">

          {/* Info principal */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-semibold text-slate-900 text-base">{vacante.titulo}</h3>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                Pendiente
              </span>
            </div>

            <p className="text-sm text-slate-500 mb-3">{empresa}</p>

            {/* Chips */}
            <div className="flex flex-wrap gap-2 mb-3">
              {vacante.ubicacion && <Chip>{vacante.ubicacion}</Chip>}
              {modalidad && <Chip>{MODALIDAD_LABELS[modalidad] ?? modalidad}</Chip>}
              {contrato  && <Chip>{CONTRATO_LABELS[contrato]   ?? contrato}</Chip>}
              {exp       && <Chip>{EXP_LABELS[exp]             ?? exp}</Chip>}
              {salario   && <Chip blue>{salario}</Chip>}
            </div>

            {/* Descripción recortada */}
            {vacante.descripcion && (
              <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
                {vacante.descripcion}
              </p>
            )}

            {fecha && (
              <p className="text-xs text-slate-400 mt-3">
                <IcoClock className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
                Publicada el {fecha}
              </p>
            )}
          </div>

          {/* Acciones */}
          <div className="flex sm:flex-col gap-2.5 shrink-0 sm:min-w-[136px]">
            <button
              onClick={onAprobar}
              disabled={procesando}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-[#10B981] text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              {procesando ? <Spinner className="w-4 h-4 text-white" /> : <IcoCheck />}
              {procesando ? '…' : 'Aprobar'}
            </button>
            <button
              onClick={onRechazar}
              disabled={procesando}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-red-50 text-red-600 border border-red-200 rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              {procesando ? <Spinner className="w-4 h-4 text-red-500" /> : <IcoX />}
              {procesando ? '…' : 'Rechazar'}
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

/* ── Sub-componentes ─────────────────────────────────────────────────────── */

function Chip({ children, blue = false }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
      blue ? 'bg-blue-50 text-[#1A56DB]' : 'bg-gray-100 text-slate-600'
    }`}>
      {children}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
        <svg className="w-7 h-7 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p className="font-semibold text-slate-700">Todo revisado</p>
      <p className="text-sm text-slate-400 mt-1">No hay vacantes pendientes de aprobación</p>
    </div>
  );
}

function SkeletonLista() {
  return (
    <ul className="space-y-4 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <li key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="h-[3px] bg-gray-200" />
          <div className="p-5 flex gap-5">
            <div className="flex-1 space-y-3">
              <div className="h-4 w-48 bg-gray-200 rounded" />
              <div className="h-3 w-32 bg-gray-100 rounded" />
              <div className="flex gap-2">
                {[...Array(3)].map((__, j) => <div key={j} className="h-5 w-20 bg-gray-100 rounded-full" />)}
              </div>
            </div>
            <div className="space-y-2 sm:w-36">
              <div className="h-10 bg-gray-100 rounded-xl" />
              <div className="h-10 bg-gray-100 rounded-xl" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Spinner({ className = '' }) {
  return (
    <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

function IcoCheck() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function IcoX() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function IcoRefresh({ spinning = false }) {
  return (
    <svg className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
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

function IcoClock({ className = '' }) {
  return (
    <svg className={`text-slate-400 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
