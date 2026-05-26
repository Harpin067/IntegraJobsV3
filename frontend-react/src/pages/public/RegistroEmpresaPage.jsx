import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegistro } from '../../hooks/useRegistro';

const INDUSTRIAS = [
  'Tecnología',
  'Manufactura',
  'Salud',
  'Educación',
  'Comercio',
  'Construcción',
  'Transporte',
  'Finanzas',
  'Turismo',
  'Agricultura',
  'Otro',
];

const INITIAL = {
  nombre:        '',
  empresaNombre: '',
  ubicacion:     '',
  industria:     '',
  email:         '',
  password:      '',
  confirmar:     '',
  descripcion:   '',
  sitioWeb:      '',
};

const PERKS = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    title: 'Encuentra talento verificado',
    body:  'Accede a candidatos reales con perfiles completos y CVs actualizados.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Publica en minutos',
    body:  'Crea y publica vacantes detalladas en menos de 5 minutos desde tu panel.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: 'Perfil de empresa confiable',
    body:  'Tu empresa pasa por verificación. Los candidatos confían en las marcas verificadas.',
  },
];

export default function RegistroEmpresaPage() {
  const { loading, error, registrarEmpresa } = useRegistro();
  const navigate = useNavigate();

  const [form, setForm]             = useState(INITIAL);
  const [localError, setLocalError] = useState('');

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLocalError('');

    if (form.password !== form.confirmar) {
      setLocalError('Las contraseñas no coinciden');
      return;
    }

    try {
      await registrarEmpresa({
        nombre:        form.nombre,
        empresaNombre: form.empresaNombre,
        ubicacion:     form.ubicacion,
        industria:     form.industria,
        email:         form.email,
        password:      form.password,
        ...(form.descripcion && { descripcion: form.descripcion }),
        ...(form.sitioWeb    && { sitioWeb:    form.sitioWeb    }),
      });
      navigate('/login', {
        state: { mensaje: 'Empresa registrada. Ingresa mientras verificamos tu cuenta.' },
        replace: true,
      });
    } catch {
      // el hook expone el error
    }
  }

  const errorMsg = localError || error;

  return (
    <div className="min-h-screen flex">

      {/* ── Columna visual (solo lg+) ── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-[42%] flex-col justify-between bg-gradient-to-br from-[#0f4abf] via-primary to-blue-700 px-12 py-10 relative overflow-hidden">

        {/* Patrón geométrico de fondo */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
          <div className="absolute top-2/3 -left-16 w-64 h-64 rounded-full bg-white/5" />
          <div className="absolute bottom-0 right-1/3 w-48 h-48 rounded-full bg-white/5" />
          <svg className="absolute top-16 right-8 w-32 h-32 text-white/5" fill="currentColor" viewBox="0 0 100 100">
            <rect x="10" y="10" width="35" height="35" rx="4" />
            <rect x="55" y="10" width="35" height="35" rx="4" />
            <rect x="10" y="55" width="35" height="35" rx="4" />
            <rect x="55" y="55" width="35" height="35" rx="4" />
          </svg>
        </div>

        {/* Logo */}
        <Link to="/" className="relative z-10">
          <img src="/logo.png" alt="IntegraJobs" className="h-8 w-auto object-contain brightness-0 invert" />
        </Link>

        {/* Contenido central */}
        <div className="relative z-10 space-y-8">
          <div>
            <span className="inline-block text-xs font-semibold text-blue-200 bg-white/10 px-3 py-1 rounded-full uppercase tracking-wide mb-4">
              Para empresas
            </span>
            <h2 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight">
              El talento que buscas,{' '}
              <span className="text-blue-200">más cerca de lo que crees</span>
            </h2>
            <p className="mt-3 text-blue-100 text-sm leading-relaxed max-w-xs">
              Publica vacantes, gestiona postulaciones y construye tu equipo ideal desde un solo lugar.
            </p>
          </div>

          <ul className="space-y-5">
            {PERKS.map(({ icon, title, body }) => (
              <li key={title} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-white">
                  {icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-blue-200 leading-relaxed mt-0.5">{body}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* Badge de confianza */}
          <div className="flex items-center gap-3 bg-white/10 rounded-2xl px-4 py-3 max-w-xs">
            <svg className="w-8 h-8 text-blue-200 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
            <div>
              <p className="text-xs font-semibold text-white">Verificación gratuita</p>
              <p className="text-xs text-blue-200">Tu empresa verificada genera más confianza en candidatos.</p>
            </div>
          </div>
        </div>

        {/* Pie de columna */}
        <p className="relative z-10 text-xs text-blue-300">
          © {new Date().getFullYear()} IntegraJobs · El Salvador
        </p>
      </div>

      {/* ── Columna del formulario ── */}
      <div className="flex-1 flex flex-col justify-center items-center bg-background px-6 py-10 sm:px-10 overflow-y-auto">

        {/* Logo mobile */}
        <Link to="/" className="mb-8 lg:hidden">
          <img src="/logo.png" alt="IntegraJobs" className="h-8 w-auto object-contain" />
        </Link>

        <div className="w-full max-w-lg">

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-text">Registra tu empresa</h1>
            <p className="text-sm text-gray-500 mt-1">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Inicia sesión
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-6">

            {/* Datos de acceso */}
            <Section title="Datos de acceso">
              <Field
                label="Tu nombre (responsable)"
                id="nombre"
                name="nombre"
                autoComplete="name"
                required
                value={form.nombre}
                onChange={handleChange}
                placeholder="María García"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field
                  label="Correo electrónico"
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="rrhh@empresa.com"
                />
                <Field
                  label="Contraseña"
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Mínimo 8 caracteres"
                />
              </div>

              <Field
                label="Confirmar contraseña"
                id="confirmar"
                name="confirmar"
                type="password"
                autoComplete="new-password"
                required
                value={form.confirmar}
                onChange={handleChange}
                placeholder="Repite tu contraseña"
              />
            </Section>

            {/* Datos de la empresa */}
            <Section title="Datos de la empresa">
              <Field
                label="Nombre de la empresa"
                id="empresaNombre"
                name="empresaNombre"
                required
                value={form.empresaNombre}
                onChange={handleChange}
                placeholder="Acme S.A. de C.V."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide" htmlFor="industria">
                    Industria <span className="text-danger">*</span>
                  </label>
                  <select
                    id="industria"
                    name="industria"
                    required
                    value={form.industria}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow hover:border-gray-300"
                  >
                    <option value="" disabled>Selecciona…</option>
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
                autoComplete="url"
                value={form.sitioWeb}
                onChange={handleChange}
                placeholder="https://www.empresa.com"
              />

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide" htmlFor="descripcion">
                  Descripción (opcional)
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  rows={3}
                  value={form.descripcion}
                  onChange={handleChange}
                  placeholder="Cuéntanos a qué se dedica tu empresa…"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow hover:border-gray-300 resize-none"
                />
              </div>
            </Section>

            {errorMsg && (
              <div role="alert" className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white rounded-xl py-3 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm shadow-primary/30"
            >
              {loading ? 'Registrando…' : 'Crear cuenta de empresa'}
            </button>

            <p className="text-center text-xs text-gray-400">
              Al registrarte aceptas nuestros{' '}
              <span className="text-gray-500 font-medium">Términos de uso</span>{' '}
              y{' '}
              <span className="text-gray-500 font-medium">Política de privacidad</span>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <fieldset className="space-y-4">
      <legend className="flex items-center gap-2 w-full">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</span>
        <span className="flex-1 h-px bg-gray-100" />
      </legend>
      {children}
    </fieldset>
  );
}

function Field({ label, id, required, ...props }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide" htmlFor={id}>
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </label>
      <input
        id={id}
        required={required}
        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow hover:border-gray-300"
        {...props}
      />
    </div>
  );
}
