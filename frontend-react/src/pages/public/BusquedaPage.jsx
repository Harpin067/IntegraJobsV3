import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useBusquedaVacantes } from '../../hooks/useBusquedaVacantes';
import VacanteCard from '../../components/shared/VacanteCard';

/* ─── Valores de enums tal como están en el schema de Prisma ─────────── */

const TIPO_TRABAJO_OPTS = [
  { value: '',           label: 'Todas las modalidades' },
  { value: 'presencial', label: 'Presencial'            },
  { value: 'remoto',     label: 'Remoto'                },
  { value: 'hibrido',    label: 'Híbrido'               },
];

const TIPO_CONTRATO_OPTS = [
  { value: '',          label: 'Todos los contratos' },
  { value: 'completo',  label: 'Tiempo completo'     },
  { value: 'medio',     label: 'Medio tiempo'        },
  { value: 'temporal',  label: 'Temporal'            },
  { value: 'freelance', label: 'Freelance'           },
];

const EXPERIENCIA_OPTS = [
  { value: '',       label: 'Cualquier nivel' },
  { value: 'junior', label: 'Junior'          },
  { value: 'mid',    label: 'Semi senior'     },
  { value: 'senior', label: 'Senior'          },
  { value: 'lead',   label: 'Lead / Principal'},
];

const TIPO_LABELS     = { presencial: 'Presencial', remoto: 'Remoto', hibrido: 'Híbrido' };
const CONTRATO_LABELS = { completo: 'Tiempo completo', medio: 'Medio tiempo', temporal: 'Temporal', freelance: 'Freelance' };
const EXP_LABELS      = { junior: 'Junior', mid: 'Semi senior', senior: 'Senior', lead: 'Lead' };

/* ─── Componente principal ───────────────────────────────────────────── */

export default function BusquedaPage() {
  const { vacantes, loading, error, total, fetchVacantes } = useBusquedaVacantes();
  const [searchParams, setSearchParams] = useSearchParams();

  const [q,            setQ]            = useState(searchParams.get('q')            ?? '');
  const [ubicacion,    setUbicacion]    = useState(searchParams.get('ubicacion')    ?? '');
  const [tipoTrabajo,  setTipoTrabajo]  = useState(searchParams.get('tipoTrabajo')  ?? '');
  const [tipoContrato, setTipoContrato] = useState(searchParams.get('tipoContrato') ?? '');
  const [experiencia,  setExperiencia]  = useState(searchParams.get('experiencia')  ?? '');
  const [sidebarOpen,  setSidebarOpen]  = useState(false);

  const activeFiltersCount = [tipoTrabajo, tipoContrato, experiencia, ubicacion].filter(Boolean).length;

  const runSearch = useCallback((overrides = {}) => {
    const params = {
      q:            'q'            in overrides ? overrides.q            : q,
      ubicacion:    'ubicacion'    in overrides ? overrides.ubicacion    : ubicacion,
      tipoTrabajo:  'tipoTrabajo'  in overrides ? overrides.tipoTrabajo  : tipoTrabajo,
      tipoContrato: 'tipoContrato' in overrides ? overrides.tipoContrato : tipoContrato,
      experiencia:  'experiencia'  in overrides ? overrides.experiencia  : experiencia,
    };
    const urlParams = {};
    Object.entries(params).forEach(([k, v]) => { if (v) urlParams[k] = v; });
    setSearchParams(urlParams);
    fetchVacantes(params);
  }, [q, ubicacion, tipoTrabajo, tipoContrato, experiencia, fetchVacantes, setSearchParams]);

  useEffect(() => {
    fetchVacantes({
      q:            searchParams.get('q')            ?? '',
      ubicacion:    searchParams.get('ubicacion')    ?? '',
      tipoTrabajo:  searchParams.get('tipoTrabajo')  ?? '',
      tipoContrato: searchParams.get('tipoContrato') ?? '',
      experiencia:  searchParams.get('experiencia')  ?? '',
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSubmit(e) {
    e.preventDefault();
    runSearch();
  }

  function applyFilter(setter, field, value) {
    setter(value);
    runSearch({ [field]: value });
  }

  function clearFilters() {
    setUbicacion('');
    setTipoTrabajo('');
    setTipoContrato('');
    setExperiencia('');
    runSearch({ ubicacion: '', tipoTrabajo: '', tipoContrato: '', experiencia: '' });
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">

      {/* ── Topbar ── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link to="/" className="shrink-0">
            <img src="/logo.png" alt="IntegraJobs" className="h-8 w-auto object-contain" />
          </Link>

          <form
            onSubmit={handleSubmit}
            className="flex flex-1 items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-[#1A56DB] focus-within:ring-2 focus-within:ring-[#1A56DB]/20 transition-all"
          >
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Puesto, empresa o habilidad…"
              className="flex-1 text-sm bg-transparent outline-none text-[#111827] placeholder-gray-400 min-w-0"
            />
            {q && (
              <button
                type="button"
                onClick={() => { setQ(''); runSearch({ q: '' }); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <button
              type="submit"
              className="shrink-0 bg-[#1A56DB] text-white text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Buscar
            </button>
          </form>

          {/* Botón filtros móvil */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden relative flex items-center gap-1.5 bg-white border border-gray-200 text-sm font-medium text-gray-700 px-3 py-2 rounded-xl hover:border-gray-300 transition-colors shrink-0"
          >
            <FilterIcon />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#1A56DB] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Layout principal ── */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex gap-6">

        {/* Sidebar desktop */}
        <aside className="hidden lg:block w-64 shrink-0">
          <FilterPanel
            ubicacion={ubicacion}
            tipoTrabajo={tipoTrabajo}
            tipoContrato={tipoContrato}
            experiencia={experiencia}
            activeCount={activeFiltersCount}
            onUbicacion={(v) => applyFilter(setUbicacion, 'ubicacion', v)}
            onTipoTrabajo={(v) => applyFilter(setTipoTrabajo, 'tipoTrabajo', v)}
            onTipoContrato={(v) => applyFilter(setTipoContrato, 'tipoContrato', v)}
            onExperiencia={(v) => applyFilter(setExperiencia, 'experiencia', v)}
            onClear={clearFilters}
          />
        </aside>

        {/* Drawer filtros móvil */}
        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-72 bg-white z-50 overflow-y-auto shadow-xl lg:hidden p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-[#111827]">Filtros</h2>
                <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <FilterPanel
                ubicacion={ubicacion}
                tipoTrabajo={tipoTrabajo}
                tipoContrato={tipoContrato}
                experiencia={experiencia}
                activeCount={activeFiltersCount}
                onUbicacion={(v)    => { applyFilter(setUbicacion,    'ubicacion',    v); setSidebarOpen(false); }}
                onTipoTrabajo={(v)  => { applyFilter(setTipoTrabajo,  'tipoTrabajo',  v); setSidebarOpen(false); }}
                onTipoContrato={(v) => { applyFilter(setTipoContrato, 'tipoContrato', v); setSidebarOpen(false); }}
                onExperiencia={(v)  => { applyFilter(setExperiencia,  'experiencia',  v); setSidebarOpen(false); }}
                onClear={() => { clearFilters(); setSidebarOpen(false); }}
              />
            </div>
          </>
        )}

        {/* Área de resultados */}
        <main className="flex-1 min-w-0">
          {/* Encabezado resultados */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              {loading ? (
                <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
              ) : (
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-[#111827]">
                    {total.toLocaleString('es-SV')}
                  </span>{' '}
                  {total === 1 ? 'vacante encontrada' : 'vacantes encontradas'}
                  {q && (
                    <span>
                      {' '}para{' '}
                      <span className="font-medium text-[#1A56DB]">"{q}"</span>
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Tags filtros activos */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {tipoTrabajo  && (
                  <FilterTag
                    label={TIPO_LABELS[tipoTrabajo] ?? tipoTrabajo}
                    onRemove={() => applyFilter(setTipoTrabajo, 'tipoTrabajo', '')}
                  />
                )}
                {tipoContrato && (
                  <FilterTag
                    label={CONTRATO_LABELS[tipoContrato] ?? tipoContrato}
                    onRemove={() => applyFilter(setTipoContrato, 'tipoContrato', '')}
                  />
                )}
                {experiencia  && (
                  <FilterTag
                    label={EXP_LABELS[experiencia] ?? experiencia}
                    onRemove={() => applyFilter(setExperiencia, 'experiencia', '')}
                  />
                )}
                {ubicacion    && (
                  <FilterTag
                    label={ubicacion}
                    onRemove={() => applyFilter(setUbicacion, 'ubicacion', '')}
                  />
                )}
                <button
                  onClick={clearFilters}
                  className="text-xs text-gray-400 hover:text-[#EF4444] transition-colors"
                >
                  Limpiar todo
                </button>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-[#EF4444] flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              {error}
            </div>
          )}

          {/* Contenido */}
          {loading ? (
            <SkeletonList />
          ) : vacantes.length === 0 ? (
            <EmptyState hasFilters={!!(q || activeFiltersCount)} onClear={clearFilters} />
          ) : (
            <div className="space-y-3">
              {vacantes.map((v) => (
                <VacanteCard key={v.id} vacante={v} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/* ─── Panel de filtros ────────────────────────────────────────────────── */

function FilterPanel({
  ubicacion, tipoTrabajo, tipoContrato, experiencia, activeCount,
  onUbicacion, onTipoTrabajo, onTipoContrato, onExperiencia, onClear,
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-6 sticky top-24">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#111827]">Filtros</h2>
        {activeCount > 0 && (
          <button onClick={onClear} className="text-xs text-[#1A56DB] hover:underline font-medium">
            Limpiar ({activeCount})
          </button>
        )}
      </div>

      {/* Ubicación */}
      <FilterGroup label="Ubicación">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0z" />
          </svg>
          <input
            type="text"
            value={ubicacion}
            onChange={(e) => onUbicacion(e.target.value)}
            placeholder="Ciudad o departamento"
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]/30 focus:border-[#1A56DB] transition-all"
          />
        </div>
      </FilterGroup>

      {/* Modalidad */}
      <FilterGroup label="Modalidad">
        <div className="space-y-2">
          {TIPO_TRABAJO_OPTS.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="tipoTrabajo"
                value={value}
                checked={tipoTrabajo === value}
                onChange={() => onTipoTrabajo(value)}
                className="w-4 h-4 accent-[#1A56DB]"
              />
              <span className={`text-sm transition-colors ${tipoTrabajo === value ? 'text-[#1A56DB] font-medium' : 'text-gray-600 group-hover:text-[#111827]'}`}>
                {label}
              </span>
            </label>
          ))}
        </div>
      </FilterGroup>

      {/* Tipo de contrato */}
      <FilterGroup label="Tipo de contrato">
        <div className="space-y-2">
          {TIPO_CONTRATO_OPTS.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="tipoContrato"
                value={value}
                checked={tipoContrato === value}
                onChange={() => onTipoContrato(value)}
                className="w-4 h-4 accent-[#1A56DB]"
              />
              <span className={`text-sm transition-colors ${tipoContrato === value ? 'text-[#1A56DB] font-medium' : 'text-gray-600 group-hover:text-[#111827]'}`}>
                {label}
              </span>
            </label>
          ))}
        </div>
      </FilterGroup>

      {/* Experiencia */}
      <FilterGroup label="Experiencia">
        <div className="space-y-2">
          {EXPERIENCIA_OPTS.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="experiencia"
                value={value}
                checked={experiencia === value}
                onChange={() => onExperiencia(value)}
                className="w-4 h-4 accent-[#1A56DB]"
              />
              <span className={`text-sm transition-colors ${experiencia === value ? 'text-[#1A56DB] font-medium' : 'text-gray-600 group-hover:text-[#111827]'}`}>
                {label}
              </span>
            </label>
          ))}
        </div>
      </FilterGroup>
    </div>
  );
}

function FilterGroup({ label, children }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{label}</p>
      {children}
    </div>
  );
}

function FilterTag({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 bg-blue-50 text-[#1A56DB] border border-blue-100 text-xs font-medium px-2.5 py-1 rounded-full">
      {label}
      <button onClick={onRemove} className="hover:text-blue-800 ml-0.5">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}

/* ─── VacanteCard: importada desde components/shared/VacanteCard.jsx ─── */

/* ─── Skeleton ────────────────────────────────────────────────────────── */

function SkeletonCard() {
  return (
    <div className="flex items-start gap-4 bg-white border border-gray-200 rounded-2xl px-5 py-4 animate-pulse">
      <div className="w-12 h-12 rounded-xl bg-gray-200 shrink-0" />
      <div className="flex-1 space-y-2.5">
        <div className="h-4 w-3/5 bg-gray-200 rounded" />
        <div className="h-3 w-2/5 bg-gray-200 rounded" />
        <div className="h-3 w-1/4 bg-gray-200 rounded" />
        <div className="flex gap-2 mt-1">
          <div className="h-5 w-16 bg-gray-200 rounded-full" />
          <div className="h-5 w-20 bg-gray-200 rounded-full" />
          <div className="h-5 w-24 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}

/* ─── Empty state ─────────────────────────────────────────────────────── */

function EmptyState({ hasFilters, onClear }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center bg-white border border-gray-200 rounded-2xl">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z" />
        </svg>
      </div>
      <p className="font-semibold text-[#111827] text-lg">
        {hasFilters ? 'Sin resultados' : 'No hay vacantes disponibles'}
      </p>
      <p className="text-sm text-gray-400 mt-1 max-w-xs leading-relaxed">
        {hasFilters
          ? 'Prueba con otros términos o elimina los filtros aplicados'
          : 'Vuelve pronto, nuevas ofertas se publican a diario'}
      </p>
      {hasFilters && (
        <button
          onClick={onClear}
          className="mt-5 bg-[#1A56DB] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}

/* ─── Iconos ──────────────────────────────────────────────────────────── */

function FilterIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
    </svg>
  );
}
