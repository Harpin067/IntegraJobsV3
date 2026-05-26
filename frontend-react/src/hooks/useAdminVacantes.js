import { useState, useCallback } from 'react';
import { api } from '../api/client';

export function useAdminVacantes() {
  const [vacantesPendientes, setVacantesPendientes] = useState([]);
  const [loading, setLoading]                       = useState(false);
  const [error, setError]                           = useState(null);
  const [procesando, setProcesando]                 = useState(null); // id en proceso

  const fetchVacantesPendientes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/vacantes/pendientes');
      const lista = res?.data ?? res;
      setVacantesPendientes(Array.isArray(lista) ? lista : []);
    } catch (err) {
      setError(err.message ?? 'Error al cargar las vacantes pendientes');
    } finally {
      setLoading(false);
    }
  }, []);

  const gestionarVacante = useCallback(async (vacancyId, aprobar = true) => {
    setProcesando(vacancyId);
    setError(null);

    const snapshot = vacantesPendientes;
    setVacantesPendientes((prev) => prev.filter((v) => v.id !== vacancyId));

    try {
      await api.patch(`/admin/vacantes/${vacancyId}/aprobar`, { aprobar });
    } catch (err) {
      setVacantesPendientes(snapshot);
      setError(err.message ?? 'No se pudo procesar la vacante');
    } finally {
      setProcesando(null);
    }
  }, [vacantesPendientes]);

  return {
    vacantesPendientes,
    loading,
    error,
    procesando,
    fetchVacantesPendientes,
    gestionarVacante,
  };
}
