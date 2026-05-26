import { useState, useCallback } from 'react';
import { api } from '../api/client';

export function useEmpresaAplicaciones() {
  const [aplicaciones, setAplicaciones] = useState([]);
  const [vacante,      setVacante]      = useState(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);

  const fetchAplicaciones = useCallback(async (vacancyId) => {
    setLoading(true);
    setError(null);
    try {
      const res     = await api.get(`/empresa/vacantes/${vacancyId}/aplicaciones`);
      const payload = res?.data ?? res;
      const lista   = payload?.aplicantes ?? (Array.isArray(payload) ? payload : []);
      setVacante(payload?.vacante ?? null);
      setAplicaciones(lista);
    } catch (err) {
      setError(err.message ?? 'Error al cargar las aplicaciones');
    } finally {
      setLoading(false);
    }
  }, []);

  const actualizarEstado = useCallback(async (applicationId, nuevoEstado) => {
    setError(null);

    // Captura el estado previo antes de la actualización optimista
    const estadoPrevio = aplicaciones.find((a) => a.id === applicationId)?.status;

    setAplicaciones((prev) =>
      prev.map((a) => (a.id === applicationId ? { ...a, status: nuevoEstado } : a))
    );

    try {
      await api.patch(`/empresa/aplicaciones/${applicationId}/status`, {
        status: nuevoEstado,
      });
    } catch (err) {
      // Revertir al estado anterior si falla
      setAplicaciones((prev) =>
        prev.map((a) =>
          a.id === applicationId ? { ...a, status: estadoPrevio } : a
        )
      );
      setError(err.message ?? 'No se pudo actualizar el estado');
    }
  }, [aplicaciones]);

  return { aplicaciones, vacante, loading, error, fetchAplicaciones, actualizarEstado };
}
