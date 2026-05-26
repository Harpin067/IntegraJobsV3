import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';

const TIPOS = [
  { value: '',          label: 'Todos'     },
  { value: 'articulo',  label: 'Artículos' },
  { value: 'tutorial',  label: 'Tutoriales'},
  { value: 'video',     label: 'Videos'    },
];

const TIPO_META = {
  articulo: {
    label:  'Artículo',
    color:  'bg-blue-50 text-blue-700 border-blue-100',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  tutorial: {
    label:  'Tutorial',
    color:  'bg-amber-50 text-amber-700 border-amber-100',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
  },
  video: {
    label:  'Video',
    color:  'bg-purple-50 text-purple-700 border-purple-100',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
      </svg>
    ),
  },
};

export default function RecursosPage() {
  const [recursos,  setRecursos]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [filtro,    setFiltro]    = useState('');

  useEffect(() => {
    setLoading(true);
    const params = filtro ? `?tipo=${filtro}` : '';
    api.get(`/public/recursos${params}`)
      .then((res) => setRecursos(Array.isArray(res) ? res : res?.data ?? []))
      .catch((err) => setError(err.message ?? 'Error al cargar recursos'))
      .finally(() => setLoading(false));
  }, [filtro]);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">

      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/80 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="IntegraJobs" className="h-9 w-auto object-contain" />
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            <Link to="/busqueda" className="text-sm text-gray-600 hover:text-[#1A56DB] hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors">
              Ver empleos
            </Link>
            <Link to="/recursos" className="text-sm font-semibold text-[#1A56DB] bg-blue-50 px-3 py-2 rounded-lg">
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
        </div>
      </header>

      {/* Hero */}
      <section className="bg-white border-b border-gray-200 px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <span className="inline-block text-xs font-semibold text-[#1A56DB] bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wide mb-4 border border-blue-100">
            Aprende y crece
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] mb-3">
            Recursos para tu carrera
          </h1>
          <p className="text-gray-500 text-base max-w-xl">
            Artículos, tutoriales y videos seleccionados para ayudarte a destacar en el mercado laboral salvadoreño.
          </p>

          {/* Filtros de tipo */}
          <div className="flex flex-wrap gap-2 mt-6">
            {TIPOS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFiltro(value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  filtro === value
                    ? 'bg-[#1A56DB] text-white border-[#1A56DB]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#1A56DB] hover:text-[#1A56DB]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Contenido */}
      <main className="max-w-6xl mx-auto px-6 py-10">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden animate-pulse">
                <div className="h-40 bg-gray-100" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-20 bg-gray-100 rounded-full" />
                  <div className="h-5 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded" />
                  <div className="h-3 bg-gray-100 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : recursos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[#1A56DB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <p className="text-base font-semibold text-gray-700">No hay recursos disponibles</p>
            <p className="text-sm text-gray-400 mt-1">Vuelve pronto, estamos preparando contenido para ti.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recursos.map((r) => (
              <RecursoCard key={r.id} recurso={r} />
            ))}
          </div>
        )}
      </main>

      {/* Footer mínimo */}
      <footer className="border-t border-gray-200 bg-white py-6 px-6 mt-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <img src="/logo.png" alt="IntegraJobs" className="h-6 w-auto object-contain opacity-50" />
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} IntegraJobs · El Salvador</p>
        </div>
      </footer>
    </div>
  );
}

function formatExternalUrl(url) {
  if (!url) return '#';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
}

function RecursoCard({ recurso }) {
  const meta = TIPO_META[recurso.tipo] ?? TIPO_META.articulo;
  const href = formatExternalUrl(recurso.url);

  return (
    <a
      href={href}
      target={href === '#' ? undefined : '_blank'}
      rel="noopener noreferrer"
      className="block cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-lg bg-white border border-gray-200 rounded-2xl overflow-hidden group flex flex-col"
    >

      {/* Imagen o placeholder */}
      {recurso.imagen_url ? (
        <div className="h-44 overflow-hidden bg-gray-100">
          <img
            src={recurso.imagen_url}
            alt={recurso.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="h-44 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <span className="text-[#1A56DB] opacity-30">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </span>
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">

        {/* Badge de tipo */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.color}`}>
            {meta.icon}
            {meta.label}
          </span>
          <span className="text-xs text-gray-400">
            {new Intl.DateTimeFormat('es-SV', { day: '2-digit', month: 'short' }).format(new Date(recurso.created_at))}
          </span>
        </div>

        <h3 className="text-base font-bold text-[#111827] leading-snug mb-2 line-clamp-2 group-hover:text-[#1A56DB] transition-colors">
          {recurso.titulo}
        </h3>

        <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 flex-1">
          {recurso.contenido}
        </p>

        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">IntegraJobs</span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1A56DB] group-hover:gap-2 transition-all">
            Abrir recurso
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </span>
        </div>
      </div>
    </a>
  );
}
