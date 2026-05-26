import { useEffect } from 'react';
import { useAdminEmpresas } from '../../hooks/useAdminEmpresas';

export default function EmpresasPendientesPage() {
  const {
    empresasPendientes,
    loading,
    error,
    verificando,
    fetchEmpresasPendientes,
    verificarEmpresa,
  } = useAdminEmpresas();

  useEffect(() => { fetchEmpresasPendientes(); }, [fetchEmpresasPendientes]);

  return (
    <div className="space-y-6">

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Empresas Pendientes</h2>
          <p className="text-sm text-slate-500 mt-1">
            {loading
              ? 'Cargando…'
              : empresasPendientes.length > 0
                ? `${empresasPendientes.length} empresa${empresasPendientes.length !== 1 ? 's' : ''} pendiente${empresasPendientes.length !== 1 ? 's' : ''} de verificación`
                : 'Ninguna empresa pendiente de verificación'}
          </p>
        </div>
        <button
          onClick={fetchEmpresasPendientes}
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
      {loading && empresasPendientes.length === 0 ? (
        <SkeletonGrid />
      ) : empresasPendientes.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {empresasPendientes.map((empresa) => (
            <EmpresaCard
              key={empresa.id}
              empresa={empresa}
              verificando={verificando === empresa.id}
              onVerificar={() => verificarEmpresa(empresa.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Tarjeta de empresa ──────────────────────────────────────────────────── */

function EmpresaCard({ empresa, verificando, onVerificar }) {
  const fechaRegistro = (empresa.createdAt ?? empresa.created_at)
    ? new Intl.DateTimeFormat('es-SV', { day: 'numeric', month: 'short', year: 'numeric' })
        .format(new Date(empresa.createdAt ?? empresa.created_at))
    : '—';

  const inicial = (empresa.nombre ?? '?').charAt(0).toUpperCase();

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col">
      {/* Banda superior ámbar */}
      <div className="h-[3px] bg-amber-400" />

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Cabecera */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 font-bold text-base flex items-center justify-center shrink-0">
            {inicial}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900 truncate">{empresa.nombre}</h3>
            <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
              Pendiente
            </span>
          </div>
        </div>

        {/* Detalles */}
        <dl className="space-y-2 text-sm flex-1">
          <InfoRow label="Industria" value={empresa.industria ?? '—'} />
          <InfoRow label="Ubicación" value={empresa.ubicacion   ?? '—'} />
          <InfoRow label="Registro"  value={fechaRegistro}              />
          {(empresa.sitioWeb ?? empresa.sitio_web) && (
            <InfoRow
              label="Web"
              value={
                <a
                  href={empresa.sitioWeb ?? empresa.sitio_web}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1A56DB] hover:underline truncate"
                >
                  {(empresa.sitioWeb ?? empresa.sitio_web).replace(/^https?:\/\//, '')}
                </a>
              }
            />
          )}
          {empresa.descripcion && (
            <div className="pt-1">
              <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">
                {empresa.descripcion}
              </p>
            </div>
          )}
        </dl>

        {/* Botón verificar */}
        <button
          onClick={onVerificar}
          disabled={verificando}
          className="mt-auto w-full bg-[#10B981] text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {verificando ? (
            <>
              <Spinner className="w-4 h-4 text-white" />
              Verificando…
            </>
          ) : (
            <>
              <IcoCheck />
              Verificar empresa
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ── Sub-componentes ─────────────────────────────────────────────────────── */

function InfoRow({ label, value }) {
  return (
    <div className="flex gap-2">
      <dt className="text-slate-400 shrink-0 w-20 text-xs font-medium uppercase tracking-wide">{label}</dt>
      <dd className="text-slate-700 font-medium truncate">{value}</dd>
    </div>
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
      <p className="font-semibold text-slate-700">Todo al día</p>
      <p className="text-sm text-slate-400 mt-1">No hay empresas pendientes de verificación</p>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="h-[3px] bg-gray-200" />
          <div className="p-5 space-y-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-200 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-4 w-16 bg-gray-100 rounded-full" />
              </div>
            </div>
            <div className="space-y-2">
              {[...Array(3)].map((__, j) => <div key={j} className="h-3 bg-gray-100 rounded" />)}
            </div>
            <div className="h-10 bg-gray-100 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
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
