import { useState, useCallback } from 'react';
import { api } from '../api/client';

export function useEmpresaVacantes() {
  const [misVacantes, setMisVacantes] = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);

  const fetchMisVacantes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/empresa/vacantes');
      const lista = res?.data ?? res;
      setMisVacantes(Array.isArray(lista) ? lista : []);
    } catch (err) {
      setError(err.message ?? 'Error al cargar las vacantes');
    } finally {
      setLoading(false);
    }
  }, []);

  const crearVacante = useCallback(async (vacanteData) => {
    const res = await api.post('/empresa/vacantes', vacanteData);
    const nueva = res?.data ?? res;
    setMisVacantes((prev) => [nueva, ...prev]);
    return nueva;
  }, []);

  return { misVacantes, loading, error, fetchMisVacantes, crearVacante };
}
