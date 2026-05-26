import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

export function useCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  useEffect(() => {
    let cancelled = false;

    api.get('/public/foros')
      .then((res) => { if (!cancelled) setCategorias(res?.data ?? res ?? []); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  return { categorias, loading, error };
}

export function useHilos(categoriaId) {
  const [hilos,   setHilos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchHilos = useCallback(() => {
    if (!categoriaId) return;
    setLoading(true);
    setError(null);

    api.get(`/public/foros/${categoriaId}/threads`)
      .then((res) => setHilos(res?.data ?? res ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [categoriaId]);

  useEffect(() => { fetchHilos(); }, [fetchHilos]);

  async function crearHilo({ titulo, contenido, categoriaId: catId }) {
    const res = await api.post('/candidato/foros/threads', { titulo, contenido, categoriaId: catId });
    const nuevo = res?.data ?? res;
    setHilos((prev) => [nuevo, ...prev]);
    return nuevo;
  }

  return { hilos, loading, error, crearHilo };
}

export function useHiloDetalle(hiloId) {
  const [hilo,    setHilo]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchHilo = useCallback(() => {
    if (!hiloId) return;
    setLoading(true);
    setError(null);

    api.get(`/public/foros/threads/${hiloId}`)
      .then((res) => setHilo(res?.data ?? res))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [hiloId]);

  useEffect(() => { fetchHilo(); }, [fetchHilo]);

  async function crearRespuesta(contenido) {
    const tempId    = `temp-${Date.now()}`;
    const optimista = { id: tempId, contenido, createdAt: new Date().toISOString(), _pending: true };

    setHilo((prev) => ({
      ...prev,
      replies: [...(prev?.replies ?? []), optimista],
    }));

    try {
      const res  = await api.post(`/candidato/foros/threads/${hiloId}/replies`, { contenido });
      const real = res?.data ?? res;
      setHilo((prev) => ({
        ...prev,
        replies: prev.replies.map((r) => (r.id === tempId ? real : r)),
      }));
      return real;
    } catch (err) {
      setHilo((prev) => ({
        ...prev,
        replies: prev.replies.filter((r) => r.id !== tempId),
      }));
      throw err;
    }
  }

  return { hilo, loading, error, crearRespuesta };
}
