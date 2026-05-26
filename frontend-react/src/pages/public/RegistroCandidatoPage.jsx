import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegistro } from '../../hooks/useRegistro';

const INITIAL = { nombre: '', apellidos: '', email: '', password: '', confirmar: '' };

const PERKS = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Conecta con empresas top',
    body:  'Accede a vacantes verificadas de las mejores empresas de El Salvador.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
    title: 'Aplica con un clic',
    body:  'Sube tu CV una vez y postúlate a múltiples ofertas en segundos.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
    title: 'Alertas personalizadas',
    body:  'Recibe notificaciones de nuevas vacantes que coinciden con tu perfil.',
  },
];

export default function RegistroCandidatoPage() {
  const { loading, error, registrarCandidato } = useRegistro();
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
      await registrarCandidato({
        nombre:    form.nombre,
        apellidos: form.apellidos,
        email:     form.email,
        password:  form.password,
      });
      navigate('/login', {
        state: { mensaje: 'Cuenta creada. Ingresa con tus credenciales.' },
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
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between bg-gradient-to-br from-primary to-blue-800 px-12 py-10 relative overflow-hidden">

        {/* Patrón geométrico de fondo */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5" />
          <div className="absolute top-1/3 -right-20 w-72 h-72 rounded-full bg-white/5" />
          <div className="absolute -bottom-16 left-1/4 w-64 h-64 rounded-full bg-white/5" />
          <svg className="absolute bottom-10 right-10 w-48 h-48 text-white/5" fill="currentColor" viewBox="0 0 200 200">
            <polygon points="100,0 200,50 200,150 100,200 0,150 0,50" />
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
              Para candidatos
            </span>
            <h2 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight">
              Tu próxima oportunidad{' '}
              <span className="text-blue-200">te está esperando</span>
            </h2>
            <p className="mt-3 text-blue-100 text-sm leading-relaxed max-w-xs">
              Únete a miles de profesionales salvadoreños que encontraron su trabajo ideal en IntegraJobs.
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
        </div>

        {/* Pie de columna */}
        <p className="relative z-10 text-xs text-blue-300">
          © {new Date().getFullYear()} IntegraJobs · El Salvador
        </p>
      </div>

      {/* ── Columna del formulario ── */}
      <div className="flex-1 flex flex-col justify-center items-center bg-background px-6 py-10 sm:px-10">

        {/* Logo mobile */}
        <Link to="/" className="mb-8 lg:hidden">
          <img src="/logo.png" alt="IntegraJobs" className="h-8 w-auto object-contain" />
        </Link>

        <div className="w-full max-w-md">

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-text">Crea tu cuenta gratis</h1>
            <p className="text-sm text-gray-500 mt-1">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Inicia sesión
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Nombre"
                id="nombre"
                name="nombre"
                autoComplete="given-name"
                required
                value={form.nombre}
                onChange={handleChange}
                placeholder="Juan"
              />
              <Field
                label="Apellidos"
                id="apellidos"
                name="apellidos"
                autoComplete="family-name"
                required
                value={form.apellidos}
                onChange={handleChange}
                placeholder="Pérez"
              />
            </div>

            <Field
              label="Correo electrónico"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
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
              {loading ? 'Creando cuenta…' : 'Crear cuenta'}
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
