import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmpresaVacantes } from '../../hooks/useEmpresaVacantes';

const TIPO_TRABAJO  = ['presencial', 'remoto', 'hibrido'];
const TIPO_CONTRATO = ['completo', 'medio', 'temporal', 'freelance'];
const EXPERIENCIA   = ['junior', 'mid', 'senior', 'lead'];

const LABELS = {
  presencial: 'Presencial',
  remoto:     'Remoto',
  hibrido:    'Híbrido',
  completo:   'Tiempo completo',
  medio:      'Medio tiempo',
  temporal:   'Temporal',
  freelance:  'Freelance',
  junior:     'Junior (0–2 años)',
  mid:        'Mid-level (3–4 años)',
  senior:     'Senior (5+ años)',
  lead:       'Lead / Principal',
};

const INITIAL = {
  titulo:       '',
  descripcion:  '',
  requisitos:   '',
  ubicacion:    '',
  tipoTrabajo:  '',
  tipoContrato: '',
  experiencia:  '',
  contacto:     '',
  salarioMin:   '',
  salarioMax:   '',
};

export default function CrearVacantePage() {
  const { crearVacante } = useEmpresaVacantes();
  const navigate = useNavigate();

  const [form,    setForm]    = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [exito,   setExito]   = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!form.titulo.trim())       return setError('El título del puesto es obligatorio.');
    if (!form.descripcion.trim())  return setError('La descripción es obligatoria.');
    if (!form.requisitos.trim())   return setError('Los requisitos son obligatorios.');
    if (!form.ubicacion.trim())    return setError('La ubicación es obligatoria.');
    if (!form.tipoTrabajo)         return setError('Selecciona la modalidad de trabajo.');
    if (!form.tipoContrato)        return setError('Selecciona el tipo de contrato.');
    if (!form.experiencia)         return setError('Selecciona el nivel de experiencia.');
    if (!form.contacto.trim())     return setError('El contacto es obligatorio.');

    setLoading(true);
    try {
      await crearVacante({
        titulo:       form.titulo.trim(),
        descripcion:  form.descripcion.trim(),
        requisitos:   form.requisitos.trim(),
        ubicacion:    form.ubicacion.trim(),
        tipoTrabajo:  form.tipoTrabajo,
        tipoContrato: form.tipoContrato,
        experiencia:  form.experiencia,
        contacto:     form.contacto.trim(),
        ...(form.salarioMin && { salarioMin: Number(form.salarioMin) }),
        ...(form.salarioMax && { salarioMax: Number(form.salarioMax) }),
      });
      setExito(true);
      setTimeout(() => navigate('/empresa/dashboard', { replace: true }), 1200);
    } catch (err) {
      setError(err.message ?? 'No se pudo publicar la vacante');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-8">

      {/* Encabezado */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Publicar Vacante</h2>
        <p className="text-sm text-slate-500 mt-1">
          Completa la información de la oferta. Quedará pendiente de aprobación.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">

        {/* ── Información general ── */}
        <Card title="Información general">
          <Field
            label="Título del puesto"
            id="titulo" name="titulo" required
            value={form.titulo} onChange={handleChange}
            placeholder="Ej. Desarrollador Full Stack"
          />
          <Textarea
            label="Descripción del puesto"
            id="descripcion" name="descripcion" required rows={4}
            value={form.descripcion} onChange={handleChange}
            placeholder="Describe las responsabilidades y el día a día del puesto…"
          />
        </Card>

        {/* ── Requisitos ── */}
        <Card title="Requisitos">
          <Textarea
            label="Requisitos del candidato"
            id="requisitos" name="requisitos" required rows={3}
            value={form.requisitos} onChange={handleChange}
            placeholder="Ej. 2 años de experiencia en React, inglés intermedio…"
          />
          <SelectField
            label="Nivel de experiencia"
            id="experiencia" name="experiencia" required
            value={form.experiencia} onChange={handleChange}
            options={EXPERIENCIA}
          />
        </Card>

        {/* ── Condiciones laborales ── */}
        <Card title="Condiciones laborales">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label="Modalidad"
              id="tipoTrabajo" name="tipoTrabajo" required
              value={form.tipoTrabajo} onChange={handleChange}
              options={TIPO_TRABAJO}
            />
            <SelectField
              label="Tipo de contrato"
              id="tipoContrato" name="tipoContrato" required
              value={form.tipoContrato} onChange={handleChange}
              options={TIPO_CONTRATO}
            />
          </div>
          <Field
            label="Ubicación"
            id="ubicacion" name="ubicacion" required
            value={form.ubicacion} onChange={handleChange}
            placeholder="San Salvador, El Salvador"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Salario mínimo (USD)"
              id="salarioMin" name="salarioMin" type="number" min="0"
              value={form.salarioMin} onChange={handleChange}
              placeholder="600"
            />
            <Field
              label="Salario máximo (USD)"
              id="salarioMax" name="salarioMax" type="number" min="0"
              value={form.salarioMax} onChange={handleChange}
              placeholder="1200"
            />
          </div>
          <p className="text-xs text-slate-400">El rango salarial es opcional pero aumenta el interés de los candidatos.</p>
        </Card>

        {/* ── Contacto ── */}
        <Card title="Contacto">
          <Field
            label="Email o referencia de contacto"
            id="contacto" name="contacto" required
            value={form.contacto} onChange={handleChange}
            placeholder="rrhh@empresa.com"
          />
        </Card>

        {/* Feedback */}
        {error && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            <IcoAlert />
            {error}
          </div>
        )}
        {exito && (
          <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">
            <IcoCheck />
            Vacante publicada. Redirigiendo…
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || exito}
            className="inline-flex items-center gap-2 bg-[#1A56DB] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading && <Spinner className="w-4 h-4 text-white" />}
            {loading ? 'Publicando…' : 'Publicar vacante'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm text-slate-500 px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Sub-componentes ─────────────────────────────────────────────────────── */

function Card({ title, children }) {
  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
      <h3 className="text-sm font-semibold text-slate-800 pb-3 border-b border-gray-100">{title}</h3>
      {children}
    </section>
  );
}

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

function Textarea({ label, id, required, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor={id}>
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <textarea
        id={id}
        required={required}
        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB] focus:border-transparent transition resize-none placeholder:text-gray-400"
        {...props}
      />
    </div>
  );
}

function SelectField({ label, id, required, options, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor={id}>
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <select
        id={id}
        required={required}
        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB] focus:border-transparent transition"
        {...props}
      >
        <option value="" disabled>Selecciona…</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{LABELS[opt] ?? opt}</option>
        ))}
      </select>
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

function IcoAlert() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  );
}

function IcoCheck() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
