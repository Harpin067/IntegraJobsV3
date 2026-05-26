import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

export default function useAlertas() {
  const [alertas,  setAlertas]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const fetchAlertas = useCallback(() => {
    setLoading(true);
    setError(null);

    api.get('/candidato/alertas')
      .then((res) => setAlertas(res?.data ?? res ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAlertas(); }, [fetchAlertas]);

  async function crearAlerta(data) {
    const res = await api.post('/candidato/alertas', data);
    const nueva = res?.data ?? res;
    setAlertas((prev) => [nueva, ...prev]);
  }

  async function toggleAlerta(id) {
    const snapshot = alertas;
    setAlertas((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a))
    );
    try {
      const res         = await api.patch(`/candidato/alertas/${id}/toggle`);
      const actualizada = res?.data ?? res;
      setAlertas((prev) =>
        prev.map((a) => (a.id === id ? actualizada : a))
      );
    } catch (err) {
      setAlertas(snapshot);
      throw err;
    }
  }

  async function eliminarAlerta(id) {
    const snapshot = alertas;
    setAlertas((prev) => prev.filter((a) => a.id !== id));
    try {
      await api.delete(`/candidato/alertas/${id}`);
    } catch (err) {
      setAlertas(snapshot);
      throw err;
    }
  }

  return { alertas, loading, error, fetchAlertas, crearAlerta, toggleAlerta, eliminarAlerta };
}
