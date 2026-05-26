import { useState, useCallback } from 'react';
import { api } from '../api/client';

export function useAdminEmpresas() {
  const [empresasPendientes, setEmpresasPendientes] = useState([]);
  const [loading, setLoading]                       = useState(false);
  const [error, setError]                           = useState(null);
  const [verificando, setVerificando]               = useState(null); // id en proceso

  const fetchEmpresasPendientes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/empresas/pendientes');
      const lista = res?.data ?? res;
      setEmpresasPendientes(Array.isArray(lista) ? lista : []);
    } catch (err) {
      setError(err.message ?? 'Error al cargar las empresas pendientes');
    } finally {
      setLoading(false);
    }
  }, []);

  const verificarEmpresa = useCallback(async (companyId) => {
    setVerificando(companyId);
    setError(null);

    // Actualización optimista: sacar la empresa de la lista inmediatamente
    const snapshot = empresasPendientes;
    setEmpresasPendientes((prev) => prev.filter((e) => e.id !== companyId));

    try {
      await api.patch(`/admin/empresas/${companyId}/verificar`, { verificar: true });
    } catch (err) {
      // Revertir si falla
      setEmpresasPendientes(snapshot);
      setError(err.message ?? 'No se pudo verificar la empresa');
    } finally {
      setVerificando(null);
    }
  }, [empresasPendientes]);

  return {
    empresasPendientes,
    loading,
    error,
    verificando,
    fetchEmpresasPendientes,
    verificarEmpresa,
  };
}
