import { useState, useEffect } from 'react';
import { api } from '../../api/client';

const TIPOS = ['articulo', 'tutorial', 'video'];

const TIPO_LABELS = { articulo: 'Artículo', tutorial: 'Tutorial', video: 'Video' };

const TIPO_COLORS = {
  articulo: 'bg-blue-50 text-blue-700 border-blue-100',
  tutorial: 'bg-amber-50 text-amber-700 border-amber-100',
  video:    'bg-purple-50 text-purple-700 border-purple-100',
};

const INITIAL_FORM = { titulo: '', contenido: '', url: '', tipo: 'articulo', imagenUrl: '', isPublished: false };

export default function AdminRecursosPage() {
  const [recursos,    setRecursos]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [showForm,    setShowForm]    = useState(false);
  const [editingId,   setEditingId]   = useState(null);
  const [form,        setForm]        = useState(INITIAL_FORM);
  const [saving,      setSaving]      = useState(false);
  const [formError,   setFormError]   = useState('');

  useEffect(() => { fetchRecursos(); }, []);

  async function fetchRecursos() {
    setLoading(true);
    try {
      const data = await api.get('/admin/recursos');
      setRecursos(Array.isArray(data) ? data : data?.data ?? []);
    } catch (err) {
      setError(err.message ?? 'Error al cargar recursos');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  function handleNuevo() {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setFormError('');
    setShowForm(true);
  }

  function handleEditar(r) {
    setEditingId(r.id);
    setForm({
      titulo:      r.titulo       ?? '',
      contenido:   r.contenido    ?? '',
      url:         r.url          ?? '',
      tipo:        r.tipo         ?? 'articulo',
      imagenUrl:   r.imagen_url   ?? '',
      isPublished: r.is_published ?? false,
    });
    setFormError('');
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCancelar() {
    setShowForm(false);
    setEditingId(null);
    setForm(INITIAL_FORM);
    setFormError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    if (!form.titulo.trim() || !form.contenido.trim()) {
      setFormError('Título y contenido son obligatorios.');
      return;
    }
    setSaving(true);
    const payload = {
      titulo:      form.titulo.trim(),
      contenido:   form.contenido.trim(),
      url:         form.url.trim() || null,
      tipo:        form.tipo,
      imagenUrl:   form.imagenUrl.trim() || null,
      isPublished: form.isPublished,
    };
    try {
      if (editingId) {
        const updated = await api.put(`/admin/recursos/${editingId}`, payload);
        setRecursos((prev) => prev.map((r) => r.id === editingId ? { ...r, ...updated } : r));
      } else {
        await api.post('/admin/recursos', payload);
        await fetchRecursos();
      }
      handleCancelar();
    } catch (err) {
      setFormError(err.message ?? 'No se pudo guardar el recurso.');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(resourceId) {
    try {
      const updated = await api.patch(`/admin/recursos/${resourceId}/toggle`);
      setRecursos((prev) =>
        prev.map((r) => r.id === resourceId ? { ...r, is_published: updated.is_published ?? !r.is_published } : r)
      );
    } catch {
      setError('No se pudo actualizar el recurso.');
    }
  }

  async function handleEliminar(resourceId) {
    if (!window.confirm('¿Eliminar este recurso permanentemente?')) return;
    try {
      await api.delete(`/admin/recursos/${resourceId}`);
      setRecursos((prev) => prev.filter((r) => r.id !== resourceId));
      if (editingId === resourceId) handleCancelar();
    } catch {
      setError('No se pudo eliminar el recurso.');
    }
  }

  return (
    <div className="space-y-6">

      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Recursos Educativos</h2>
          <p className="text-sm text-gray-500 mt-0.5">Gestiona artículos, tutoriales y videos para candidatos</p>
        </div>
        {!showForm && (
          <button
            onClick={handleNuevo}
            className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nuevo recurso
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Formulario crear / editar */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800">
              {editingId ? 'Editar recurso' : 'Nuevo recurso'}
            </h3>
            {editingId && (
              <span className="text-xs text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full font-medium">
                Editando
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5" htmlFor="titulo">
                  Título *
                </label>
                <input
                  id="titulo"
                  name="titulo"
                  value={form.titulo}
                  onChange={handleChange}
                  placeholder="Nombre del recurso"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5" htmlFor="tipo">
                  Tipo *
                </label>
                <select
                  id="tipo"
                  name="tipo"
                  value={form.tipo}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {TIPOS.map((t) => (
                    <option key={t} value={t}>{TIPO_LABELS[t]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5" htmlFor="contenido">
                Contenido / Descripción *
              </label>
              <textarea
                id="contenido"
                name="contenido"
                rows={4}
                value={form.contenido}
                onChange={handleChange}
                placeholder="Descripción del recurso…"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5" htmlFor="url">
                URL del recurso
              </label>
              <input
                id="url"
                name="url"
                type="url"
                value={form.url}
                onChange={handleChange}
                placeholder="https://youtube.com/watch?v=… o https://curso.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5" htmlFor="imagenUrl">
                URL de imagen (opcional)
              </label>
              <input
                id="imagenUrl"
                name="imagenUrl"
                type="url"
                value={form.imagenUrl}
                onChange={handleChange}
                placeholder="https://…"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer w-fit">
              <input
                type="checkbox"
                name="isPublished"
                checked={form.isPublished}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">Publicar inmediatamente</span>
            </label>

            {formError && (
              <p role="alert" className="text-sm text-red-600">{formError}</p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancelar}
                className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-primary text-white text-sm font-semibold px-5 py-2 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Crear recurso'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="h-5 w-20 bg-gray-100 rounded-full" />
                <div className="h-4 flex-1 bg-gray-100 rounded" />
                <div className="h-5 w-16 bg-gray-100 rounded-full" />
                <div className="h-8 w-24 bg-gray-100 rounded-lg" />
              </div>
            ))}
          </div>
        ) : recursos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg className="w-12 h-12 text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <p className="text-sm font-medium text-gray-400">No hay recursos creados todavía</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th className="text-left px-6 py-3">Tipo</th>
                <th className="text-left px-6 py-3">Título</th>
                <th className="text-left px-6 py-3 hidden md:table-cell">URL</th>
                <th className="text-left px-6 py-3 hidden sm:table-cell">Creado</th>
                <th className="text-center px-6 py-3">Estado</th>
                <th className="text-right px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recursos.map((r) => (
                <tr
                  key={r.id}
                  className={`transition-colors ${editingId === r.id ? 'bg-amber-50' : 'hover:bg-gray-50'}`}
                >
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${TIPO_COLORS[r.tipo] ?? 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                      {TIPO_LABELS[r.tipo] ?? r.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800 max-w-xs truncate">
                    {r.titulo}
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell max-w-[180px]">
                    {r.url ? (
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline truncate block"
                      >
                        {r.url}
                      </a>
                    ) : (
                      <span className="text-xs text-red-400 font-medium">Sin URL</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-400 hidden sm:table-cell">
                    {new Intl.DateTimeFormat('es-SV', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(r.created_at))}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleToggle(r.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                        r.is_published
                          ? 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100'
                          : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${r.is_published ? 'bg-green-500' : 'bg-gray-400'}`} />
                      {r.is_published ? 'Publicado' : 'Oculto'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditar(r)}
                        title="Editar"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-blue-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEliminar(r.id)}
                        title="Eliminar"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
