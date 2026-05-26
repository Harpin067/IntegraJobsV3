import { useState, useCallback } from 'react';
import { api } from '../api/client';

export function useAdminUsuarios() {
  const [usuarios, setUsuarios]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [toggling, setToggling]   = useState(null); // id del usuario en proceso

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/usuarios');
      const lista = res?.data ?? res;
      setUsuarios(Array.isArray(lista) ? lista : []);
    } catch (err) {
      setError(err.message ?? 'Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleEstadoUsuario = useCallback(async (userId) => {
    setToggling(userId);
    setError(null);

    // Actualización optimista
    setUsuarios((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, is_active: !u.is_active } : u))
    );

    try {
      await api.patch(`/admin/usuarios/${userId}/toggle`);
    } catch (err) {
      // Revertir si falla
      setUsuarios((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: !u.is_active } : u))
      );
      setError(err.message ?? 'No se pudo cambiar el estado del usuario');
    } finally {
      setToggling(null);
    }
  }, []);

  return { usuarios, loading, error, toggling, fetchUsuarios, toggleEstadoUsuario };
}
