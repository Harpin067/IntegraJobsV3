import { Link } from 'react-router-dom';

export default function SeleccionRegistroPage() {
  return (
    <main className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center px-4 py-16">

      {/* Logo */}
      <Link to="/" className="mb-10">
        <img src="/logo.png" alt="IntegraJobs" className="h-9 w-auto object-contain" />
      </Link>

      {/* Encabezado */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          ¿Cómo quieres unirte a{' '}
          <span className="text-[#1A56DB]">IntegraJobs</span>?
        </h1>
        <p className="text-slate-500 mt-3 text-base max-w-md mx-auto">
          Elige el tipo de cuenta que mejor describe tu perfil.
        </p>
      </div>

      {/* Tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl">
        <RegistroCard
          to="/registro/candidato"
          icon={<IconCandidato />}
          title="Soy Candidato"
          description="Busco mi próximo desafío profesional"
          accentColor="blue"
          cta="Crear cuenta de candidato"
        />
        <RegistroCard
          to="/registro/empresa"
          icon={<IconEmpresa />}
          title="Soy Empresa"
          description="Busco talento para hacer crecer mi equipo"
          accentColor="green"
          cta="Registrar mi empresa"
        />
      </div>

      {/* Footer de la tarjeta */}
      <p className="mt-10 text-sm text-slate-400">
        ¿Ya tienes una cuenta?{' '}
        <Link to="/login" className="text-[#1A56DB] font-medium hover:underline">
          Inicia sesión
        </Link>
      </p>
    </main>
  );
}

function RegistroCard({ to, icon, title, description, accentColor, cta }) {
  const accentMap = {
    blue: {
      ring:    'hover:border-[#1A56DB]',
      iconBg:  'bg-blue-50 text-[#1A56DB]',
      btn:     'bg-[#1A56DB] hover:bg-blue-700',
      glow:    'hover:shadow-blue-100',
    },
    green: {
      ring:    'hover:border-[#10B981]',
      iconBg:  'bg-emerald-50 text-[#10B981]',
      btn:     'bg-[#10B981] hover:bg-emerald-600',
      glow:    'hover:shadow-emerald-100',
    },
  };

  const s = accentMap[accentColor];

  return (
    <Link
      to={to}
      className={[
        'group flex flex-col items-center text-center gap-5 bg-white',
        'border-2 border-gray-200 rounded-2xl px-8 py-10',
        'transition-all duration-200 ease-in-out',
        'hover:shadow-xl hover:-translate-y-1',
        s.ring,
        s.glow,
      ].join(' ')}
    >
      {/* Ícono */}
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${s.iconBg} transition-transform duration-200 group-hover:scale-110`}>
        {icon}
      </div>

      {/* Texto */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{description}</p>
      </div>

      {/* Botón */}
      <span
        className={[
          'w-full text-white text-sm font-semibold py-3 px-5 rounded-xl',
          'transition-all duration-150',
          s.btn,
        ].join(' ')}
      >
        {cta}
      </span>
    </Link>
  );
}

function IconCandidato() {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function IconEmpresa() {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  );
}
