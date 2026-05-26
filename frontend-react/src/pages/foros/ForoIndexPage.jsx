import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCategorias, useHilos } from '../../hooks/useForos';
import Button from '../../components/ui/Button';
import Input  from '../../components/ui/Input';

const fmt = new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' });

function NuevoHiloModal({ categorias, onClose, onCrear }) {
  const [form,    setForm]    = useState({ titulo: '', contenido: '', categoriaId: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.titulo.trim() || !form.contenido.trim()) {
      setError('El título y el contenido son obligatorios.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onCrear(form);
      onClose();
    } catch (err) {
      setError(err.message ?? 'No se pudo crear el hilo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-lg font-semibold text-text mb-4">Nuevo hilo</h2>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="categoriaId" className="text-sm font-medium text-text">
              Categoría
            </label>
            <select
              id="categoriaId"
              name="categoriaId"
              value={form.categoriaId}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Sin categoría</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          <Input
            id="titulo"
            name="titulo"
            label="Título"
            placeholder="¿De qué quieres hablar?"
            value={form.titulo}
            onChange={handleChange}
            required
          />

          <div className="flex flex-col gap-1">
            <label htmlFor="contenido" className="text-sm font-medium text-text">
              Contenido
            </label>
            <textarea
              id="contenido"
              name="contenido"
              rows={5}
              value={form.contenido}
              onChange={handleChange}
              placeholder="Desarrolla tu idea aquí…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {error && <p role="alert" className="text-sm text-danger">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={loading}>
              Publicar hilo
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ForoIndexPage() {
  const { isAuthenticated }       = useAuth();
  const navigate                  = useNavigate();
  const { categorias }            = useCategorias();
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const { hilos, loading, error, crearHilo }  = useHilos(categoriaActiva);
  const [modalAbierto, setModalAbierto]       = useState(false);

  function handleNuevoHilo() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/foros' } } });
      return;
    }
    setModalAbierto(true);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-text">Comunidad</h1>
            <p className="text-sm text-gray-500">Foros de IntegraJobs</p>
          </div>
          <Button onClick={handleNuevoHilo}>+ Crear hilo</Button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
        {/* Sidebar de categorías */}
        <aside className="w-full md:w-52 shrink-0">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
            Categorías
          </h2>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => setCategoriaActiva(null)}
                className={[
                  'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                  categoriaActiva === null
                    ? 'bg-primary text-white'
                    : 'text-text hover:bg-gray-100',
                ].join(' ')}
              >
                Todos los hilos
              </button>
            </li>
            {categorias.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => setCategoriaActiva(c.id)}
                  className={[
                    'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                    categoriaActiva === c.id
                      ? 'bg-primary text-white'
                      : 'text-text hover:bg-gray-100',
                  ].join(' ')}
                >
                  {c.nombre}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Lista de hilos */}
        <main className="flex-1 min-w-0">
          {loading && (
            <ul className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <li key={i} className="bg-white rounded-xl p-4 animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </li>
              ))}
            </ul>
          )}

          {!loading && error && (
            <p className="text-sm text-danger">{error}</p>
          )}

          {!loading && !error && hilos.length === 0 && (
            <p className="text-sm text-gray-500">
              No hay hilos en esta categoría todavía. ¡Sé el primero en crear uno!
            </p>
          )}

          {!loading && !error && (
            <ul className="space-y-3">
              {hilos.map((h) => (
                <li key={h.id} className="bg-white rounded-xl border border-gray-100 hover:border-primary/40 transition-colors">
                  <Link to={`/foros/hilos/${h.id}`} className="block p-4">
                    <p className="font-medium text-text leading-snug">{h.titulo}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                      <span>{h.autor?.nombre ?? 'Anónimo'}</span>
                      <span>·</span>
                      <span>{fmt.format(new Date(h.creadoEn))}</span>
                      {h.categoria && (
                        <>
                          <span>·</span>
                          <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                            {h.categoria.nombre}
                          </span>
                        </>
                      )}
                      <span>·</span>
                      <span>{h._count?.respuestas ?? 0} respuestas</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>

      {modalAbierto && (
        <NuevoHiloModal
          categorias={categorias}
          onClose={() => setModalAbierto(false)}
          onCrear={crearHilo}
        />
      )}
    </div>
  );
}
