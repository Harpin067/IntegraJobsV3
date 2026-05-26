import { useState, useCallback } from 'react';
import { api } from '../api/client';

export function useDashboardEmpresa() {
  const [dashboard, setDashboard] = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await api.get('/empresa/dashboard');
      const data = res?.data ?? res;
      setDashboard(data);
    } catch (err) {
      setError(err.message ?? 'Error al cargar el dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  return { dashboard, loading, error, fetchDashboard };
}
