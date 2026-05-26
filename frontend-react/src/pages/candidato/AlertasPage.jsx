import { useState } from 'react';
import useAlertas from '../../hooks/useAlertas';

const TIPOS_TRABAJO = [
  { value: '',           label: 'Cualquier modalidad' },
  { value: 'presencial', label: 'Presencial'           },
  { value: 'remoto',     label: 'Remoto'               },
  { value: 'hibrido',    label: 'Híbrido'              },
];

const MODALIDAD_LABELS = {
  presencial: 'Presencial',
  remoto:     'Remoto',
  hibrido:    'Híbrido',
};

const FORM_INICIAL = { keyword: '', ubicacion: '', tipoTrabajo: '' };

export default function AlertasPage() {
  const { alertas, loading, error, crearAlerta, toggleAlerta, eliminarAlerta } = useAlertas();

  return (
    <div className="max-w-3xl space-y-8">

      {/* Encabezado */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Mis alertas de empleo</h2>
        <p className="text-sm text-slate-500 mt-1">
          Te notificaremos cuando se publiquen ofertas que coincidan con tus criterios.
        </p>
      </div>

      {/* Formulario nueva alerta */}
      <FormNuevaAlerta onCrear={crearAlerta} />

      {/* Lista de alertas */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
          Alertas configuradas
        </h3>

        {loading && (
          <ul className="space-y-3 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <li key={i} className="bg-white border border-gray-200 rounded-2xl p-4">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/5" />
              </li>
            ))}
          </ul>
        )}

        {!loading && error && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            <IcoAlert />
            {error}
          </div>
        )}

        {!loading && !error && alertas.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-200 rounded-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <IcoBell className="w-6 h-6 text-gray-400" />
            </div>
            <p className="font-semibold text-slate-700">Sin alertas configuradas</p>
            <p className="text-sm text-slate-400 mt-1">
              Crea una para que te avisemos cuando aparezcan ofertas relevantes.
            </p>
          </div>
        )}

        {!loading && !error && alertas.length > 0 && (
          <ul className="space-y-3">
            {alertas.map((a) => (
              <TarjetaAlerta
                key={a.id}
                alerta={a}
                onToggle={toggleAlerta}
                onEliminar={eliminarAlerta}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/* ── Formulario nueva alerta ─────────────────────────────────────────────── */

function FormNuevaAlerta({ onCrear }) {
  const [form,    setForm]    = useState(FORM_INICIAL);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [exito,   setExito]   = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
    setExito(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.keyword.trim()) {
      setError('La palabra clave es obligatoria.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onCrear({
        keyword:     form.keyword.trim(),
        ubicacion:   form.ubicacion.trim() || undefined,
        tipoTrabajo: form.tipoTrabajo      || undefined,
      });
      setForm(FORM_INICIAL);
      setExito(true);
      setTimeout(() => setExito(false), 2500);
    } catch (err) {
      setError(err.message ?? 'No se pudo crear la alerta.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-slate-800 mb-5">Nueva alerta</h3>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field
            label="Palabra clave"
            id="keyword" name="keyword" required
            placeholder="ej. desarrollador React"
            value={form.keyword} onChange={handleChange}
          />
          <Field
            label="Ubicación (opcional)"
            id="ubicacion" name="ubicacion"
            placeholder="ej. San Salvador"
            value={form.ubicacion} onChange={handleChange}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="tipoTrabajo">
              Modalidad (opcional)
            </label>
            <select
              id="tipoTrabajo" name="tipoTrabajo"
              value={form.tipoTrabajo} onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB] focus:border-transparent transition"
            >
              {TIPOS_TRABAJO.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            <IcoAlert className="w-3.5 h-3.5 shrink-0" />
            {error}
          </div>
        )}
        {exito && (
          <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg">
            <IcoCheck className="w-3.5 h-3.5 shrink-0" />
            Alerta creada correctamente.
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 bg-[#1A56DB] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading && <Spinner className="w-4 h-4 text-white" />}
            {loading ? 'Creando…' : 'Crear alerta'}
          </button>
        </div>
      </form>
    </section>
  );
}

/* ── Tarjeta de alerta ───────────────────────────────────────────────────── */

function TarjetaAlerta({ alerta, onToggle, onEliminar }) {
  const [loadingToggle,   setLoadingToggle]   = useState(false);
  const [loadingEliminar, setLoadingEliminar] = useState(false);
  const [error,           setError]           = useState('');

  async function handleToggle() {
    setLoadingToggle(true);
    setError('');
    try {
      await onToggle(alerta.id);
    } catch (err) {
      setError(err.message ?? 'Error al cambiar estado.');
    } finally {
      setLoadingToggle(false);
    }
  }

  async function handleEliminar() {
    setLoadingEliminar(true);
    setError('');
    try {
      await onEliminar(alerta.id);
    } catch (err) {
      setError(err.message ?? 'Error al eliminar.');
      setLoadingEliminar(false);
    }
  }

  const activa = alerta.isActive ?? alerta.is_active ?? true;
  const tipoLabel = MODALIDAD_LABELS[alerta.tipoTrabajo ?? alerta.tipo_trabajo] ?? alerta.tipoTrabajo ?? null;

  return (
    <li className={`bg-white border rounded-2xl p-4 transition-all ${activa ? 'border-gray-200' : 'border-gray-100 opacity-70'}`}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-2 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-slate-900 truncate">{alerta.keyword}</p>
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${
              activa ? 'bg-green-100 text-[#10B981]' : 'bg-gray-100 text-gray-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${activa ? 'bg-[#10B981]' : 'bg-gray-300'}`} />
              {activa ? 'Activa' : 'Pausada'}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {alerta.ubicacion && (
              <span className="text-xs bg-gray-100 text-slate-500 px-2.5 py-0.5 rounded-full">
                {alerta.ubicacion}
              </span>
            )}
            {tipoLabel && (
              <span className="text-xs bg-blue-50 text-[#1A56DB] px-2.5 py-0.5 rounded-full">
                {tipoLabel}
              </span>
            )}
          </div>

          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleToggle}
            disabled={loadingToggle}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 text-slate-600"
          >
            {loadingToggle ? '…' : activa ? 'Pausar' : 'Reanudar'}
          </button>
          <button
            onClick={handleEliminar}
            disabled={loadingEliminar}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            {loadingEliminar ? '…' : 'Eliminar'}
          </button>
        </div>
      </div>
    </li>
  );
}

/* ── Helpers de UI ───────────────────────────────────────────────────────── */

function Field({ label, id, required, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor={id}>
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        id={id}
        required={required}
        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB] focus:border-transparent transition placeholder:text-gray-400"
        {...props}
      />
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

function IcoAlert({ className = 'w-4 h-4' }) {
  return (
    <svg className={`shrink-0 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  );
}

function IcoCheck({ className = 'w-4 h-4' }) {
  return (
    <svg className={`shrink-0 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function IcoBell({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  );
}
