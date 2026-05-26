import { useState, useCallback } from 'react';
import { api } from '../api/client';

export function useDashboardAdmin() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [publicRes, chartRes] = await Promise.all([
        api.get('/public/stats'),
        api.get('/admin/stats'),
      ]);
      const base   = publicRes?.data  ?? publicRes;
      const charts = chartRes?.data   ?? chartRes;
      setStats({ ...base, ...charts });
    } catch (err) {
      setError(err.message ?? 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  }, []);

  return { stats, loading, error, fetchStats };
}
