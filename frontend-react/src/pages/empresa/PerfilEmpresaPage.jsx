import { useEffect, useRef, useState } from 'react';
import { useEmpresaPerfil } from '../../hooks/useEmpresaPerfil';

const MAX_LOGO_MB = 3;

const INDUSTRIAS = [
  'Tecnología', 'Manufactura', 'Salud', 'Educación', 'Comercio',
  'Construcción', 'Transporte', 'Finanzas', 'Turismo', 'Agricultura', 'Otro',
];

const INITIAL = { nombre: '', descripcion: '', sitioWeb: '', ubicacion: '', industria: '' };

export default function PerfilEmpresaPage() {
  const {
    perfil, loading, error,
    fetchPerfil, actualizarPerfil, subirLogo,
  } = useEmpresaPerfil();

  /* ── Estado formulario ── */
  const [form, setForm]           = useState(INITIAL);
  const [guardando, setGuardando] = useState(false);
  const [formError, setFormError] = useState(null);
  const [exito, setExito]         = useState(false);

  /* ── Estado upload logo ── */
  const logoInputRef                    = useRef(null);
  const [logoPreview, setLogoPreview]   = useState(null);
  const [subiendoLogo, setSubiendoLogo] = useState(false);
  const [logoError, setLogoError]       = useState(null);
  const [logoOk, setLogoOk]             = useState(false);

  useEffect(() => {
    fetchPerfil().then((data) => {
      if (!data) return;
      setForm({
        nombre:      data.nombre      ?? '',
        descripcion: data.descripcion ?? '',
        sitioWeb:    data.sitio_web   ?? data.sitioWeb   ?? '',
        ubicacion:   data.ubicacion   ?? '',
        industria:   data.industria   ?? '',
      });
    });
  }, [fetchPerfil]);

  const logoUrl    = logoPreview ?? perfil?.logoUrl ?? perfil?.logo_url ?? null;
  const nombreInit = (perfil?.nombre ?? form.nombre ?? '').charAt(0).toUpperCase();

  /* ──────────────────────────────────────────────────────────── */

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setExito(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);
    setExito(false);
    if (!form.nombre.trim() || !form.ubicacion.trim() || !form.industria) {
      setFormError('Nombre, ubicación e industria son obligatorios.');
      return;
    }
    setGuardando(true);
    try {
      await actualizarPerfil({
        nombre:    form.nombre.trim(),
        ubicacion: form.ubicacion.trim(),
        industria: form.industria,
        ...(form.descripcion.trim() && { descripcion: form.descripcion.trim() }),
        ...(form.sitioWeb.trim()    && { sitioWeb:    form.sitioWeb.trim()    }),
      });
      setExito(true);
      setTimeout(() => setExito(false), 3500);
    } catch (err) {
      setFormError(err.message ?? 'No se pudo guardar el perfil');
    } finally {
      setGuardando(false);
    }
  }

  function handleLogoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoError(null);
    setLogoOk(false);

    if (!file.type.startsWith('image/')) {
      setLogoError('Solo se permiten imágenes (JPG, PNG, WebP).');
      return;
    }
    if (file.size > MAX_LOGO_MB * 1024 * 1024) {
      setLogoError(`La imagen no debe superar ${MAX_LOGO_MB} MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target.result);
    reader.readAsDataURL(file);

    uploadLogo(file);
  }

  async function uploadLogo(file) {
    setSubiendoLogo(true);
    setLogoError(null);
    try {
      await subirLogo(file);
      setLogoOk(true);
      setTimeout(() => setLogoOk(false), 3500);
    } catch (err) {
      setLogoError(err.message ?? 'No se pudo subir el logo');
      setLogoPreview(null);
    } finally {
      setSubiendoLogo(false);
    }
  }

  /* ──────────────────────────────────────────────────────────── */

  if (loading && !perfil) return <SkeletonPerfil />;
  if (error && !perfil)   return <div className="py-24 text-center text-sm text-red-500">{error}</div>;

  return (
    <div className="max-w-2xl space-y-8">

      {/* Encabezado */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Perfil de la Empresa</h2>
        <p className="text-sm text-slate-500 mt-1">
          Esta información aparecerá en las vacantes que publiques.
        </p>
      </div>

      {/* ── Logo corporativo ──────────────────────────────────── */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-5">Logo corporativo</h3>

        <div className="flex items-center gap-6">
          {/* Logo actual / placeholder */}
          <button
            type="button"
            onClick={() => logoInputRef.current?.click()}
            disabled={subiendoLogo}
            className="relative w-20 h-20 rounded-2xl border-2 border-gray-200 bg-white flex items-center justify-center overflow-hidden shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A56DB]"
            aria-label="Cambiar logo"
          >
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
            ) : (
              <span className="text-2xl font-bold text-[#1A56DB]/40">
                {nombreInit || <IcoEmpresa />}
              </span>
            )}

            {subiendoLogo && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Spinner className="w-5 h-5 text-white" />
              </div>
            )}

            {!subiendoLogo && (
              <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center group">
                <svg className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            )}
          </button>

          <input
            ref={logoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleLogoChange}
          />

          <div className="flex-1 min-w-0">
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              disabled={subiendoLogo}
              className="text-sm font-semibold text-[#1A56DB] hover:underline disabled:opacity-50"
            >
              {subiendoLogo ? 'Subiendo…' : 'Cambiar logo'}
            </button>
            <p className="text-xs text-slate-400 mt-1">
              JPG, PNG o WebP · Máx. {MAX_LOGO_MB} MB · Recomendado cuadrado
            </p>
            {logoOk   && <FeedbackLine type="success" msg="Logo actualizado correctamente" />}
            {logoError && <FeedbackLine type="error"   msg={logoError} />}
          </div>
        </div>
      </section>

      {/* ── Datos de la empresa ───────────────────────────────── */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-5">Información de la empresa</h3>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <Field
            label="Nombre de la empresa"
            id="nombre"
            name="nombre"
            required
            value={form.nombre}
            onChange={handleChange}
            placeholder="Acme S.A. de C.V."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Ubicación"
              id="ubicacion"
              name="ubicacion"
              required
              value={form.ubicacion}
              onChange={handleChange}
              placeholder="San Salvador, El Salvador"
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="industria">
                Industria <span className="text-red-500">*</span>
              </label>
              <select
                id="industria"
                name="industria"
                required
                value={form.industria}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB] focus:border-transparent transition"
              >
                <option value="" disabled>Selecciona una industria…</option>
                {INDUSTRIAS.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
          </div>

          <Field
            label="Sitio web (opcional)"
            id="sitioWeb"
            name="sitioWeb"
            type="url"
            value={form.sitioWeb}
            onChange={handleChange}
            placeholder="https://www.empresa.com"
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="descripcion">
              Descripción (opcional)
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              rows={4}
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Cuéntale a los candidatos a qué se dedica tu empresa…"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB] focus:border-transparent transition resize-none placeholder:text-gray-400"
            />
          </div>

          {formError && <FeedbackLine type="error"   msg={formError} />}
          {exito     && <FeedbackLine type="success" msg="Perfil actualizado correctamente" />}

          <button
            type="submit"
            disabled={guardando}
            className="bg-[#1A56DB] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {guardando && <Spinner className="w-4 h-4 text-white" />}
            {guardando ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </form>
      </section>

      {/* ── Datos de cuenta (solo lectura) ─────────────────────── */}
      {perfil?.email && (
        <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
            Datos de cuenta
          </p>
          <dl className="space-y-2.5 text-sm">
            <InfoRow label="Email"  value={perfil.email} />
            <InfoRow label="Estado" value={
              <span className={`font-medium ${perfil.is_verified || perfil.isVerified ? 'text-[#10B981]' : 'text-amber-600'}`}>
                {perfil.is_verified || perfil.isVerified ? 'Verificada ✓' : 'Pendiente de verificación'}
              </span>
            } />
          </dl>
        </section>
      )}
    </div>
  );
}

/* ── Sub-componentes ─────────────────────────────────────────────────────── */

function Field({ label, id, required, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
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

function InfoRow({ label, value }) {
  return (
    <div className="flex gap-3">
      <dt className="text-slate-400 shrink-0 w-16">{label}</dt>
      <dd className="text-slate-700 font-medium">{value}</dd>
    </div>
  );
}

function FeedbackLine({ type, msg }) {
  const isOk = type === 'success';
  return (
    <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${isOk ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
      {isOk ? (
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      )}
      {msg}
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

function IcoEmpresa() {
  return (
    <svg className="w-7 h-7 text-[#1A56DB]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  );
}

function SkeletonPerfil() {
  return (
    <div className="max-w-2xl space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-48 bg-gray-200 rounded-lg" />
        <div className="h-4 w-64 bg-gray-100 rounded" />
      </div>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 h-40" />
      ))}
    </div>
  );
}
