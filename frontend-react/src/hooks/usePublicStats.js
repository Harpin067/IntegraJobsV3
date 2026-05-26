import { useState, useEffect } from 'react';
import { api } from '../api/client';

function normalizeStats(raw) {
  if (!raw || typeof raw !== 'object') return null;

  // Soporta { data: { totalVacantes, ... } } y { totalVacantes, ... } directamente
  const stats = raw?.data ?? raw;

  return {
    vacantesActivas:
      stats.totalVacantes    ??
      stats.vacantesActivas  ??
      stats.vacantes         ??
      0,
    totalEmpresas:
      stats.totalEmpresas    ??
      stats.empresas         ??
      0,
    totalUsuarios:
      stats.totalUsuarios    ??
      stats.usuarios         ??
      stats.candidatos       ??
      0,
    totalSolicitudes:
      stats.totalSolicitudes ??
      stats.solicitudes      ??
      stats.aplicaciones     ??
      0,
    vacantesRecientes: Array.isArray(stats.vacantesRecientes) ? stats.vacantesRecientes : [],
    topIndustrias:     Array.isArray(stats.topIndustrias)     ? stats.topIndustrias     : [],
  };
}

export function usePublicStats() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;

    api.get('/public/stats')
      .then((raw) => {
        if (!cancelled) setStats(normalizeStats(raw));
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('[usePublicStats] Error:', err);
          setError(err.message ?? 'Error al cargar estadísticas');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return { stats, loading, error };
}
