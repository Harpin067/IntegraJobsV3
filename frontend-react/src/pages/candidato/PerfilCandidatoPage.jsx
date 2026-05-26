import { useEffect, useRef, useState } from 'react';
import { useCandidato } from '../../hooks/useCandidato';

const BACKEND_URL =
  (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api').replace(/\/api$/, '');

const MAX_AVATAR_MB = 3;
const MAX_CV_MB     = 8;

export default function PerfilCandidatoPage() {
  const {
    perfil, loading, error,
    fetchPerfil, actualizarPerfil,
    subirAvatar, subirCv,
  } = useCandidato();

  /* ── Estado del formulario de datos ── */
  const [form, setForm]           = useState({ nombre: '', apellidos: '', telefono: '' });
  const [guardando, setGuardando] = useState(false);
  const [formError, setFormError] = useState(null);
  const [exito, setExito]         = useState(false);

  /* ── Estado de upload avatar ── */
  const avatarInputRef             = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [subiendoAvatar, setSubiendoAvatar] = useState(false);
  const [avatarError, setAvatarError]     = useState(null);
  const [avatarOk, setAvatarOk]           = useState(false);

  /* ── Estado de upload CV ── */
  const cvInputRef                = useRef(null);
  const [cvFileName, setCvFileName] = useState(null);
  const [subiendoCv, setSubiendoCv] = useState(false);
  const [cvError, setCvError]       = useState(null);
  const [cvOk, setCvOk]             = useState(false);

  useEffect(() => {
    fetchPerfil().then((data) => {
      if (!data) return;
      setForm({
        nombre:    data.nombre    ?? '',
        apellidos: data.apellidos ?? '',
        telefono:  data.telefono  ?? '',
      });
    });
  }, [fetchPerfil]);

  /* ── Datos del perfil actual ── */
  const rawAvatar = avatarPreview ?? perfil?.avatarUrl ?? perfil?.avatar_url ?? null;
  const avatarUrl = rawAvatar
    ? (rawAvatar.startsWith('http') || rawAvatar.startsWith('data:')
        ? rawAvatar
        : `${BACKEND_URL}${rawAvatar}`)
    : null;
  const rawCv     = perfil?.cvUrl ?? perfil?.cv_url ?? null;
  const cvUrl     = rawCv
    ? (rawCv.startsWith('http') ? rawCv : `${BACKEND_URL}${rawCv}`)
    : null;
  const initiales = [form.nombre, form.apellidos]
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase())
    .join('');

  /* ────────────────────────────────────────────────────────────
     Handlers
  ──────────────────────────────────────────────────────────── */

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setExito(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);
    setExito(false);
    if (!form.nombre.trim() || !form.apellidos.trim()) {
      setFormError('Nombre y apellidos son obligatorios.');
      return;
    }
    setGuardando(true);
    try {
      await actualizarPerfil({
        nombre:    form.nombre.trim(),
        apellidos: form.apellidos.trim(),
        ...(form.telefono.trim() && { telefono: form.telefono.trim() }),
      });
      setExito(true);
      setTimeout(() => setExito(false), 3500);
    } catch (err) {
      setFormError(err.message ?? 'No se pudo guardar el perfil');
    } finally {
      setGuardando(false);
    }
  }

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError(null);
    setAvatarOk(false);

    if (!file.type.startsWith('image/')) {
      setAvatarError('Solo se permiten imágenes (JPG, PNG, WebP).');
      return;
    }
    if (file.size > MAX_AVATAR_MB * 1024 * 1024) {
      setAvatarError(`La imagen no debe superar ${MAX_AVATAR_MB} MB.`);
      return;
    }

    // Vista previa local inmediata
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);

    uploadAvatar(file);
  }

  async function uploadAvatar(file) {
    setSubiendoAvatar(true);
    setAvatarError(null);
    try {
      await subirAvatar(file);
      setAvatarOk(true);
      setTimeout(() => setAvatarOk(false), 3500);
    } catch (err) {
      setAvatarError(err.message ?? 'No se pudo subir la foto');
      setAvatarPreview(null);
    } finally {
      setSubiendoAvatar(false);
    }
  }

  function handleCvChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setCvError(null);
    setCvOk(false);

    if (file.type !== 'application/pdf') {
      setCvError('El CV debe estar en formato PDF.');
      return;
    }
    if (file.size > MAX_CV_MB * 1024 * 1024) {
      setCvError(`El PDF no debe superar ${MAX_CV_MB} MB.`);
      return;
    }

    setCvFileName(file.name);
    uploadCv(file);
  }

  async function uploadCv(file) {
    setSubiendoCv(true);
    setCvError(null);
    try {
      await subirCv(file);
      setCvOk(true);
      setTimeout(() => setCvOk(false), 3500);
    } catch (err) {
      setCvError(err.message ?? 'No se pudo subir el CV');
      setCvFileName(null);
    } finally {
      setSubiendoCv(false);
    }
  }

  /* ──────────────────────────────────────────────────────────── */

  if (loading && !perfil) return <SkeletonPerfil />;

  if (error && !perfil) {
    return <div className="py-24 text-center text-sm text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-2xl space-y-8">

      {/* Encabezado */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Mi Perfil</h2>
        <p className="text-sm text-slate-500 mt-1">
          Mantén tu información actualizada para que las empresas puedan contactarte.
        </p>
      </div>

      {/* ── Sección foto de perfil ─────────────────────────────── */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-5">Foto de perfil</h3>

        <div className="flex items-center gap-6">
          {/* Avatar */}
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            disabled={subiendoAvatar}
            className="relative w-20 h-20 rounded-full shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A56DB]"
            aria-label="Cambiar foto de perfil"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              style={{ display: avatarUrl ? 'none' : 'flex' }}
              className="w-20 h-20 rounded-full bg-[#1A56DB]/10 text-[#1A56DB] text-2xl font-bold flex items-center justify-center border-2 border-dashed border-[#1A56DB]/30"
            >
              {initiales || <IcoUser />}
            </div>

            {/* Overlay de carga */}
            {subiendoAvatar && (
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                <Spinner className="w-5 h-5 text-white" />
              </div>
            )}

            {/* Overlay de edición */}
            {!subiendoAvatar && (
              <div className="absolute inset-0 rounded-full bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center group">
                <svg className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            )}
          </button>

          <input
            ref={avatarInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleAvatarChange}
          />

          <div className="flex-1 min-w-0">
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={subiendoAvatar}
              className="text-sm font-semibold text-[#1A56DB] hover:underline disabled:opacity-50"
            >
              {subiendoAvatar ? 'Subiendo…' : 'Cambiar foto'}
            </button>
            <p className="text-xs text-slate-400 mt-1">
              JPG, PNG o WebP · Máx. {MAX_AVATAR_MB} MB
            </p>

            {avatarOk && (
              <FeedbackLine type="success" msg="Foto actualizada correctamente" />
            )}
            {avatarError && (
              <FeedbackLine type="error" msg={avatarError} />
            )}
          </div>
        </div>
      </section>

      {/* ── Sección CV ─────────────────────────────────────────── */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-1">Curriculum Vitae (PDF)</h3>
        <p className="text-xs text-slate-400 mb-5">
          El CV se adjuntará automáticamente a tus postulaciones.
        </p>

        <div
          className="relative border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center gap-3 hover:border-[#1A56DB]/50 hover:bg-blue-50/30 transition-colors cursor-pointer"
          onClick={() => !subiendoCv && cvInputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && cvInputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Subir CV en PDF"
        >
          <input
            ref={cvInputRef}
            type="file"
            accept="application/pdf"
            className="sr-only"
            onChange={handleCvChange}
          />

          {subiendoCv ? (
            <div className="flex flex-col items-center gap-2">
              <Spinner className="w-8 h-8 text-[#1A56DB]" />
              <p className="text-sm text-slate-500">Subiendo CV…</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                <IcoPdf />
              </div>

              {cvUrl || cvFileName ? (
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-800 truncate max-w-xs">
                    {cvFileName ?? cvUrl?.split('/').pop() ?? 'CV subido'}
                  </p>
                  <p className="text-xs text-[#1A56DB] mt-1">Haz clic para reemplazar</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-700">
                    Arrastra tu CV aquí o{' '}
                    <span className="text-[#1A56DB]">selecciona un archivo</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Solo PDF · Máx. {MAX_CV_MB} MB</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-3 space-y-1.5">
          {cvOk && <FeedbackLine type="success" msg="CV actualizado correctamente" />}
          {cvError && <FeedbackLine type="error" msg={cvError} />}
          {cvUrl && !cvError && !cvOk && (
            <a
              href={cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#1A56DB] hover:underline"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              Ver CV actual
            </a>
          )}
        </div>
      </section>

      {/* ── Datos personales ───────────────────────────────────── */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-5">Datos personales</h3>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Nombre"
              id="nombre"
              name="nombre"
              required
              autoComplete="given-name"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Juan"
            />
            <Field
              label="Apellidos"
              id="apellidos"
              name="apellidos"
              required
              autoComplete="family-name"
              value={form.apellidos}
              onChange={handleChange}
              placeholder="Pérez García"
            />
          </div>

          <Field
            label="Teléfono (opcional)"
            id="telefono"
            name="telefono"
            type="tel"
            autoComplete="tel"
            value={form.telefono}
            onChange={handleChange}
            placeholder="+503 7000-0000"
          />

          {formError && <FeedbackLine type="error" msg={formError} />}

          {exito && (
            <FeedbackLine type="success" msg="Perfil actualizado correctamente" />
          )}

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
            <InfoRow label="Email"    value={perfil.email} />
            <InfoRow label="Rol"      value="Candidato" />
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

function IcoUser() {
  return (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function IcoPdf() {
  return (
    <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function SkeletonPerfil() {
  return (
    <div className="max-w-2xl space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-32 bg-gray-200 rounded-lg" />
        <div className="h-4 w-64 bg-gray-100 rounded" />
      </div>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 h-36" />
      ))}
    </div>
  );
}
