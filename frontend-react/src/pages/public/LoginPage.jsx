import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ROLE_REDIRECTS = {
  SUPERADMIN: '/admin/dashboard',
  CANDIDATO:  '/candidato/dashboard',
  EMPRESA:    '/empresa/dashboard',
};

const TABS = [
  { id: 'candidato', label: 'Soy Candidato' },
  { id: 'empresa',   label: 'Soy Empresa'   },
];

const TAB_COPY = {
  candidato: {
    heading:     'Bienvenido de nuevo',
    subheading:  'Ingresa para ver tus postulaciones y alertas.',
    emailLabel:  'Correo del candidato',
    passLabel:   'Contraseña',
  },
  empresa: {
    heading:     'Accede a tu panel de empresa',
    subheading:  'Gestiona tus vacantes y candidatos desde aquí.',
    emailLabel:  'Correo corporativo',
    passLabel:   'Contraseña',
  },
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [tab,      setTab]      = useState('candidato');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const copy = TAB_COPY[tab];

  function handleTabChange(nextTab) {
    setTab(nextTab);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Completa todos los campos.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const user = await login(email.trim(), password, tab);

      // Validación de rol cruzado
      if (user.role !== 'SUPERADMIN') {
        const expectedRole = tab === 'candidato' ? 'CANDIDATO' : 'EMPRESA';

        if (user.role !== expectedRole) {
          const hint =
            tab === 'empresa'
              ? 'Credenciales válidas, pero este es el portal de empresas. Por favor ingresa en la pestaña "Soy Candidato".'
              : 'Credenciales válidas, pero este es el portal de candidatos. Por favor ingresa en la pestaña "Soy Empresa".';
          setError(hint);
          setLoading(false);
          return;
        }
      }

      const destination = location.state?.from?.pathname ?? ROLE_REDIRECTS[user.role] ?? '/';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message ?? 'Credenciales inválidas. Revisa tu correo y contraseña.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center px-4 py-12">

      {/* Logo */}
      <Link to="/" className="mb-8">
        <img src="/logo.png" alt="IntegraJobs" className="h-9 w-auto object-contain" />
      </Link>

      <div className="w-full max-w-md">

        {/* Tabs pill */}
        <div className="flex bg-white border border-gray-200 rounded-xl p-1 mb-6 shadow-sm">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleTabChange(t.id)}
              className={[
                'flex-1 text-sm font-semibold py-2.5 rounded-lg transition-all duration-150',
                tab === t.id
                  ? 'bg-[#1A56DB] text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-gray-50',
              ].join(' ')}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-8 py-8">

          <h1 className="text-2xl font-bold text-slate-900">{copy.heading}</h1>
          <p className="text-sm text-slate-500 mt-1 mb-7">{copy.subheading}</p>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                {copy.emailLabel}
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB] focus:border-transparent transition placeholder:text-gray-400"
              />
            </div>

            {/* Contraseña */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                {copy.passLabel}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB] focus:border-transparent transition placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPass ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div role="alert" className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A56DB] text-white text-sm font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
            >
              {loading && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              {loading ? 'Ingresando…' : 'Ingresar'}
            </button>
          </form>

          {/* Links secundarios */}
          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <p className="text-sm text-slate-500">
              ¿No tienes cuenta?{' '}
              <Link to="/registro" className="text-[#1A56DB] font-semibold hover:underline">
                Créala gratis
              </Link>
            </p>
          </div>
        </div>

        {/* Acceso admin discreto */}
        <p className="mt-5 text-center text-xs text-slate-400">
          ¿Eres administrador?{' '}
          <button
            type="button"
            onClick={() => {
              handleTabChange('candidato');
              // El backend acepta SUPERADMIN desde cualquier pestaña
            }}
            className="hover:text-slate-600 underline underline-offset-2 transition-colors"
          >
            Ingresa con tus credenciales normales
          </button>
        </p>
      </div>
    </main>
  );
}

function IconEye() {
  return (
    <svg className="w-4.5 h-4.5 w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function IconEyeOff() {
  return (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );
}
