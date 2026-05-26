import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePublicStats } from '../../hooks/usePublicStats';
import { useBusquedaVacantes } from '../../hooks/useBusquedaVacantes';
import VacanteCard from '../../components/shared/VacanteCard';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <StatsSection />
        <FeaturedVacanciesSection />
        <FeaturesSection />
        <NosotrosSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}

/* ─── Header ─────────────────────────────────────────────────────────── */

function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/80 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src="/logo.png" alt="IntegraJobs" className="h-9 w-auto object-contain" />
        </Link>
        <nav className="hidden sm:flex items-center gap-1">
          <Link to="/busqueda" className="text-sm text-gray-600 hover:text-[#1A56DB] hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors">
            Ver empleos
          </Link>
          <Link to="/recursos" className="text-sm text-gray-600 hover:text-[#1A56DB] hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors">
            Recursos
          </Link>
          <Link to="/login" className="text-sm text-gray-600 hover:text-[#1A56DB] hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors">
            Ingresar
          </Link>
          <Link
            to="/registro"
            className="ml-2 bg-[#1A56DB] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Crear cuenta
          </Link>
        </nav>
        <Link to="/registro" className="sm:hidden bg-[#1A56DB] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Registro
        </Link>
      </div>
    </header>
  );
}

/* ─── Hero ────────────────────────────────────────────────────────────── */

function HeroSection() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  function handleSearch(e) {
    e.preventDefault();
    const params = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : '';
    navigate(`/busqueda${params}`);
  }

  return (
    <section className="relative bg-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,_#dbeafe_0%,_transparent_70%)] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-16 lg:pt-28 lg:pb-24 text-center">
        <span className="inline-flex items-center gap-2 bg-blue-50 text-[#1A56DB] text-xs font-semibold px-4 py-1.5 rounded-full mb-8 tracking-wide uppercase border border-blue-100">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1A56DB] animate-pulse" />
          Portal de empleo · El Salvador
        </span>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#111827] leading-[1.1] mb-6 tracking-tight">
          Tu próxima{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1A56DB] to-[#10B981]">
            oportunidad
          </span>
          <br className="hidden sm:block" />
          {' '}te está esperando
        </h1>

        <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Conectamos el mejor talento salvadoreño con las empresas que impulsan el país.
          Busca, aplica y construye la carrera que mereces.
        </p>

        {/* Buscador inline en Hero */}
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row items-stretch gap-2 max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-2"
        >
          <div className="flex flex-1 items-center gap-3 px-3">
            <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Puesto, empresa o habilidad…"
              className="flex-1 py-2.5 text-sm text-[#111827] placeholder-gray-400 bg-transparent outline-none"
            />
          </div>
          <button
            type="submit"
            className="bg-[#1A56DB] text-white font-semibold px-7 py-2.5 rounded-xl hover:bg-blue-700 transition-colors text-sm whitespace-nowrap"
          >
            Buscar empleo
          </button>
        </form>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {['Desarrollador', 'Diseñador', 'Ventas', 'Marketing', 'Remoto'].map((tag) => (
            <button
              key={tag}
              onClick={() => navigate(`/busqueda?q=${encodeURIComponent(tag)}`)}
              className="text-xs text-gray-500 bg-gray-100 hover:bg-blue-50 hover:text-[#1A56DB] px-3 py-1.5 rounded-full transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Stats / KPIs ─────────────────────────────────────────────────────── */

const KPI_DEFS = [
  {
    key:    'vacantesActivas',
    label:  'Vacantes activas',
    desc:   'Oportunidades disponibles hoy',
    icon:   <BriefcaseIcon />,
    accent: 'text-[#1A56DB]',
    ring:   'ring-blue-100',
    bg:     'bg-blue-50',
  },
  {
    key:    'totalEmpresas',
    label:  'Empresas registradas',
    desc:   'Compañías que confían en nosotros',
    icon:   <BuildingIcon />,
    accent: 'text-[#10B981]',
    ring:   'ring-green-100',
    bg:     'bg-green-50',
  },
  {
    key:    'totalUsuarios',
    label:  'Candidatos activos',
    desc:   'Profesionales en la red',
    icon:   <UsersIcon />,
    accent: 'text-amber-600',
    ring:   'ring-amber-100',
    bg:     'bg-amber-50',
  },
  {
    key:    'totalSolicitudes',
    label:  'Aplicaciones enviadas',
    desc:   'Conexiones generadas',
    icon:   <CheckBadgeIcon />,
    accent: 'text-violet-600',
    ring:   'ring-violet-100',
    bg:     'bg-violet-50',
  },
];

function StatCard({ kpi, value, loading, degraded = false }) {
  const { label, desc, icon, accent, ring, bg } = kpi;
  const formatted = (value != null && !degraded)
    ? `+${Number(value).toLocaleString('es-SV')}`
    : degraded ? '—' : '—';

  return (
    <div className={`bg-white border rounded-2xl p-6 flex flex-col items-center text-center shadow-sm transition-shadow duration-200 group
      ${degraded ? 'border-gray-100 opacity-60' : 'border-gray-200 hover:shadow-md'}`}
    >
      <div className={`w-14 h-14 ${bg} ring-2 ${ring} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200`}>
        <span className={accent}>{icon}</span>
      </div>
      {loading ? (
        <>
          <div className="h-9 w-24 bg-gray-100 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-32 bg-gray-100 rounded animate-pulse mb-1" />
          <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
        </>
      ) : (
        <>
          <p className={`text-4xl font-extrabold ${degraded ? 'text-gray-300' : accent} mb-1 tabular-nums`}>
            {formatted}
          </p>
          <p className="text-sm font-semibold text-[#111827]">{label}</p>
          <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
        </>
      )}
    </div>
  );
}

function StatsSection() {
  const { stats, loading, error } = usePublicStats();

  return (
    <section className="py-20 px-6 bg-[#F9FAFB]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#111827] mb-3">
            La plataforma que{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1A56DB] to-[#10B981]">
              impulsa el empleo
            </span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
            Números reales, conexiones reales. Cada día más empresas y candidatos eligen IntegraJobs.
          </p>
        </div>

        {/* Banner sutil cuando el backend no responde — no bloquea la sección */}
        {error && !loading && (
          <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs px-4 py-2.5 rounded-xl mb-6 max-w-md mx-auto">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            No pudimos cargar las estadísticas en vivo. Mostrando valores de referencia.
          </div>
        )}

        {/* Las tarjetas se renderizan siempre — con 0 si hay error */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {KPI_DEFS.map((kpi) => (
            <StatCard
              key={kpi.key}
              kpi={kpi}
              value={error ? 0 : stats?.[kpi.key]}
              loading={loading}
              degraded={!!error}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Vacantes Destacadas ───────────────────────────────────────────────── */

const TIPO_LABELS     = { presencial: 'Presencial', remoto: 'Remoto', hibrido: 'Híbrido' };
const CONTRATO_LABELS = { completo: 'Tiempo completo', medio: 'Medio tiempo', temporal: 'Temporal', freelance: 'Freelance' };
const EXP_LABELS      = { junior: 'Junior', mid: 'Semi senior', senior: 'Senior', lead: 'Lead' };

function FeaturedVacanciesSection() {
  const { vacantes, loading, error, fetchVacantes } = useBusquedaVacantes();

  useEffect(() => {
    fetchVacantes();
  }, [fetchVacantes]);

  // Ocultar la sección completamente si el backend falló
  if (error && !loading) return null;

  // Ocultar si cargó exitosamente pero no hay vacantes
  if (!loading && !error && vacantes.length === 0) return null;

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="inline-block text-xs font-semibold text-[#10B981] bg-green-50 px-3 py-1 rounded-full uppercase tracking-wide mb-3 border border-green-100">
              Recién publicadas
            </span>
            <h2 className="text-3xl font-bold text-[#111827]">Vacantes destacadas</h2>
            <p className="text-gray-500 text-sm mt-1">Las últimas oportunidades activas en la plataforma</p>
          </div>
          <Link
            to="/busqueda"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#1A56DB] hover:underline shrink-0"
          >
            Ver todas las vacantes
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-3 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gray-200 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-gray-200 rounded" />
                    <div className="h-3 w-1/2 bg-gray-200 rounded" />
                  </div>
                </div>
                <div className="h-3 w-2/3 bg-gray-200 rounded" />
                <div className="flex gap-2">
                  <div className="h-5 w-16 bg-gray-200 rounded-full" />
                  <div className="h-5 w-20 bg-gray-200 rounded-full" />
                </div>
                <div className="h-px bg-gray-200 mt-2" />
                <div className="h-3 w-1/3 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {vacantes.map((v) => (
              <VacanteCard key={v.id} vacante={v} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ─── Features ─────────────────────────────────────────────────────────── */

const FEATURES = [
  {
    icon:   <SparklesIcon />,
    title:  'Conexiones directas',
    body:   'Sin intermediarios. Tu solicitud llega directamente al área de RRHH. Proceso simple, respuesta rápida.',
    accent: 'text-[#1A56DB]',
    bg:     'bg-blue-50',
    ring:   'ring-blue-100',
  },
  {
    icon:   <ShieldCheckIcon />,
    title:  'Perfiles verificados',
    body:   'Todas las empresas pasan por verificación. Postúlate con confianza, sin fraudes ni falsas ofertas.',
    accent: 'text-[#10B981]',
    bg:     'bg-green-50',
    ring:   'ring-green-100',
  },
  {
    icon:   <ChatBubbleIcon />,
    title:  'Comunidad activa',
    body:   'Foros, recursos y consejos de carrera compartidos por profesionales. Aprende y crece junto a tu comunidad.',
    accent: 'text-amber-600',
    bg:     'bg-amber-50',
    ring:   'ring-amber-100',
  },
];

function FeaturesSection() {
  return (
    <section className="py-20 px-6 bg-[#F9FAFB]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold text-[#1A56DB] bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wide mb-3 border border-blue-100">
            ¿Por qué IntegraJobs?
          </span>
          <h2 className="text-3xl font-bold text-[#111827]">Todo lo que necesitas, en un solo lugar</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map(({ icon, title, body, accent, bg, ring }) => (
            <div
              key={title}
              className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-200 group"
            >
              <div className={`w-12 h-12 ${bg} ring-2 ${ring} rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-200`}>
                <span className={accent}>{icon}</span>
              </div>
              <h3 className="text-base font-bold text-[#111827] mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Nosotros ────────────────────────────────────────────────────────── */

const BACKEND_URL =
  (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api').replace(/\/api$/, '');

const EQUIPO = [
  {
    nombre:    'Ana Martínez',
    cargo:     'Co-Fundadora & CEO',
    bio:       'Más de 10 años conectando talento salvadoreño con oportunidades de crecimiento real.',
    avatarUrl: null,
  },
  {
    nombre:    'Carlos Rivas',
    cargo:     'Co-Fundador & CTO',
    bio:       'Ingeniero apasionado por crear tecnología que elimina barreras en el mercado laboral.',
    avatarUrl: null,
  },
  {
    nombre:    'Sofía González',
    cargo:     'Head of Partnerships',
    bio:       'Construye relaciones sólidas con las empresas más importantes del país para generar más oportunidades.',
    avatarUrl: null,
  },
];

const TESTIMONIOS = [
  {
    nombre:    'Roberto Hernández',
    cargo:     'Desarrollador Full Stack',
    empresa:   'Contratado en TechSV',
    texto:     'Encontré trabajo en menos de 3 semanas. El proceso fue rápido, transparente y sin complicaciones. IntegraJobs cambió mi carrera.',
    avatarUrl: null,
    rating:    5,
  },
  {
    nombre:    'Valeria Cruz',
    cargo:     'Diseñadora UX/UI',
    empresa:   'Contratada en CreativaCo',
    texto:     'La plataforma me permitió mostrar mi portafolio directamente. La empresa me contactó al día siguiente de postularme.',
    avatarUrl: null,
    rating:    5,
  },
  {
    nombre:    'Marcos Salinas',
    cargo:     'Gerente de RRHH',
    empresa:   'Empresa verificada',
    texto:     'Publicamos vacantes y en 48 horas ya teníamos candidatos de alta calidad. El mejor ROI que hemos tenido en reclutamiento.',
    avatarUrl: null,
    rating:    5,
  },
];

function AvatarCircle({ nombre, apellidos, avatarRuta, size = 'md' }) {
  const dim = size === 'lg' ? 'w-20 h-20 text-xl' : 'w-16 h-16 text-base';

  const ini1 = nombre?.trim()?.charAt(0)?.toUpperCase()   ?? '';
  const ini2 = apellidos?.trim()?.charAt(0)?.toUpperCase() ?? '';
  const iniciales = (ini1 + ini2) || nombre?.trim()?.charAt(0)?.toUpperCase() || '?';

  let avatarSrc = null;
  if (avatarRuta) {
    avatarSrc = avatarRuta.startsWith('http')
      ? avatarRuta
      : `${BACKEND_URL}${avatarRuta}`;
  }

  return (
    <div
      className={`${dim} flex-shrink-0 rounded-full overflow-hidden flex items-center justify-center bg-slate-100 text-slate-500 font-bold border-2 border-white shadow-md`}
    >
      {avatarSrc ? (
        <img
          src={avatarSrc}
          alt={iniciales}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      <span
        style={{ display: avatarSrc ? 'none' : 'flex' }}
        className="w-full h-full items-center justify-center bg-gradient-to-br from-[#1A56DB] to-blue-400 text-white"
      >
        {iniciales}
      </span>
    </div>
  );
}

function StarRow({ count = 5 }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-4 h-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function NosotrosSection() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto space-y-20">

        {/* ── Misión ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block text-xs font-semibold text-[#1A56DB] bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wide mb-4 border border-blue-100">
              Quiénes somos
            </span>
            <h2 className="text-3xl font-bold text-[#111827] mb-4 leading-snug">
              Nacimos para transformar el{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1A56DB] to-[#10B981]">
                empleo en El Salvador
              </span>
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              IntegraJobs es una plataforma 100% salvadoreña creada con un propósito claro:
              eliminar las barreras entre el talento local y las empresas que lo necesitan.
              Creemos que cada persona merece acceso a oportunidades dignas y cada empresa
              merece encontrar al candidato ideal sin procesos interminables.
            </p>
            <p className="text-gray-500 text-sm leading-relaxed">
              Verificamos cada empresa. Protegemos cada candidato. Conectamos cada oportunidad.
            </p>
          </div>

          {/* Tarjetas de métricas de misión */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { valor: '2024',  etiqueta: 'Año de fundación',     color: 'bg-blue-50 text-[#1A56DB]'    },
              { valor: '100%',  etiqueta: 'Equipo salvadoreño',   color: 'bg-green-50 text-[#10B981]'   },
              { valor: '0',     etiqueta: 'Cobros a candidatos',  color: 'bg-amber-50 text-amber-600'   },
              { valor: '24/7',  etiqueta: 'Plataforma disponible',color: 'bg-purple-50 text-purple-600' },
            ].map(({ valor, etiqueta, color }) => (
              <div
                key={etiqueta}
                className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow"
              >
                <p className={`text-3xl font-extrabold mb-1 ${color.split(' ')[1]}`}>{valor}</p>
                <p className="text-xs text-slate-500 font-medium leading-snug">{etiqueta}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Equipo ── */}
        <div>
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-semibold text-[#10B981] bg-green-50 px-3 py-1 rounded-full uppercase tracking-wide mb-3 border border-green-100">
              El equipo
            </span>
            <h2 className="text-3xl font-bold text-[#111827]">Las personas detrás de IntegraJobs</h2>
            <p className="text-gray-500 text-sm mt-2 max-w-xl mx-auto leading-relaxed">
              Un equipo comprometido con mejorar el mercado laboral salvadoreño, un candidato y una empresa a la vez.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {EQUIPO.map(({ nombre, cargo, bio, avatarUrl }) => {
              const partes    = nombre.split(' ');
              const primerNombre = partes[0]  ?? '';
              const apellido     = partes[1]  ?? '';
              return (
                <div
                  key={nombre}
                  className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center gap-4"
                >
                  <AvatarCircle
                    nombre={primerNombre}
                    apellidos={apellido}
                    avatarRuta={avatarUrl}
                    size="lg"
                  />
                  <div className="min-w-0 w-full">
                    <h3 className="text-base font-bold text-[#111827] leading-snug">{nombre}</h3>
                    <p className="text-xs font-semibold text-[#1A56DB] mt-0.5">{cargo}</p>
                    <p className="text-sm text-gray-500 leading-relaxed mt-2">{bio}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Testimonios ── */}
        <div>
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wide mb-3 border border-amber-100">
              Historias reales
            </span>
            <h2 className="text-3xl font-bold text-[#111827]">Lo que dicen nuestros usuarios</h2>
            <p className="text-gray-500 text-sm mt-2 max-w-xl mx-auto leading-relaxed">
              Candidatos que encontraron su próximo paso y empresas que encontraron su próximo gran empleado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {TESTIMONIOS.map(({ nombre, cargo, empresa, texto, avatarUrl, rating }) => {
              const partes       = nombre.split(' ');
              const primerNombre = partes[0] ?? '';
              const apellido     = partes[1] ?? '';
              return (
                <div
                  key={nombre}
                  className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4"
                >
                  {/* Cita */}
                  <div className="flex-1">
                    <svg className="w-8 h-8 text-[#1A56DB]/20 mb-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                    <p className="text-sm text-gray-600 leading-relaxed">{texto}</p>
                  </div>

                  {/* Calificación */}
                  <StarRow count={rating} />

                  {/* Autor */}
                  <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                    <AvatarCircle
                      nombre={primerNombre}
                      apellidos={apellido}
                      avatarRuta={avatarUrl}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#111827] truncate">{nombre}</p>
                      <p className="text-xs text-slate-400 truncate leading-snug">{cargo}</p>
                      <p className="text-xs font-medium text-[#10B981] truncate">{empresa}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}

/* ─── CTA Dual ────────────────────────────────────────────────────────── */

function CtaSection() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="relative bg-gradient-to-br from-[#1A56DB] to-blue-700 rounded-2xl p-8 overflow-hidden text-white shadow-lg">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full transform translate-x-10 -translate-y-10 pointer-events-none" />
          <div className="relative">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-5">
              <UsersIcon />
            </div>
            <h3 className="text-xl font-bold mb-2">¿Buscas empleo?</h3>
            <p className="text-blue-100 text-sm mb-6 leading-relaxed">
              Crea tu perfil en minutos, sube tu CV y aplica a cientos de vacantes verificadas.
            </p>
            <Link
              to="/registro/candidato"
              className="inline-flex items-center gap-2 bg-white text-[#1A56DB] text-sm font-bold px-5 py-2.5 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Registrarme como candidato
              <ArrowRightIcon />
            </Link>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-[#10B981] to-emerald-700 rounded-2xl p-8 overflow-hidden text-white shadow-lg">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full transform translate-x-10 -translate-y-10 pointer-events-none" />
          <div className="relative">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-5">
              <BuildingIcon />
            </div>
            <h3 className="text-xl font-bold mb-2">¿Buscas talento?</h3>
            <p className="text-green-100 text-sm mb-6 leading-relaxed">
              Publica vacantes, filtra candidatos y gestiona todo tu proceso de selección.
            </p>
            <Link
              to="/registro/empresa"
              className="inline-flex items-center gap-2 bg-white text-[#10B981] text-sm font-bold px-5 py-2.5 rounded-lg hover:bg-green-50 transition-colors"
            >
              Registrar mi empresa
              <ArrowRightIcon />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────────────────── */

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-gray-200 bg-white py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="IntegraJobs" className="h-6 w-auto object-contain opacity-60" />
          <span className="text-xs text-gray-400">© {year} IntegraJobs. Todos los derechos reservados.</span>
        </div>
        <div className="flex gap-5 text-xs text-gray-400">
          <Link to="/busqueda"           className="hover:text-[#1A56DB] transition-colors">Empleos</Link>
          <Link to="/recursos"           className="hover:text-[#1A56DB] transition-colors">Recursos</Link>
          <Link to="/registro/candidato" className="hover:text-[#1A56DB] transition-colors">Candidatos</Link>
          <Link to="/registro/empresa"   className="hover:text-[#1A56DB] transition-colors">Empresas</Link>
        </div>
      </div>
    </footer>
  );
}

/* ─── Iconos ──────────────────────────────────────────────────────────── */

function BriefcaseIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.073a2.25 2.25 0 01-2.25 2.25h-12a2.25 2.25 0 01-2.25-2.25V6a2.25 2.25 0 012.25-2.25h4.5M18.75 3v6m3-3h-6M9 12h6M9 15h6M9 18h4.5" />
    </svg>
  );
}
function BuildingIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}
function CheckBadgeIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
    </svg>
  );
}
function SparklesIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}
function ShieldCheckIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}
function ChatBubbleIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
    </svg>
  );
}
function ArrowRightIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}
