import { useState, useCallback } from 'react';
import { api } from '../api/client';

export function useEmpresaPerfil() {
  const [perfil, setPerfil]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetchPerfil = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/empresa/perfil');
      const data = res?.data ?? res;
      setPerfil(data);
      return data;
    } catch (err) {
      setError(err.message ?? 'Error al cargar el perfil');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const actualizarPerfil = useCallback(async (data) => {
    // El loading de guardado lo controla el formulario para no bloquear la vista
    const res = await api.put('/empresa/perfil', data);
    const actualizado = res?.data ?? res;
    setPerfil(actualizado);
    return actualizado;
  }, []);

  const subirLogo = useCallback(async (file) => {
    const fd = new FormData();
    fd.append('logo', file);
    const res  = await api.upload('/empresa/perfil/logo', fd);
    const url  = res?.logo_url ?? res?.data?.logo_url ?? null;
    if (url) setPerfil((prev) => ({ ...prev, logoUrl: url, logo_url: url }));
    return url;
  }, []);

  return { perfil, loading, error, fetchPerfil, actualizarPerfil, subirLogo };
}
