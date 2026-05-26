import { useState, useCallback } from 'react';
import { api } from '../api/client';

export function useCandidato() {
  const [postulaciones, setPostulaciones] = useState([]);
  const [perfil, setPerfil]               = useState(null);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState(null);

  const fetchPostulaciones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/candidato/postulaciones');
      const lista = res?.data ?? res;
      setPostulaciones(Array.isArray(lista) ? lista : []);
    } catch (err) {
      setError(err.message ?? 'Error al cargar las postulaciones');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPerfil = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/candidato/perfil');
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
    const res = await api.put('/candidato/perfil', data);
    const actualizado = res?.data ?? res;
    setPerfil(actualizado);
    return actualizado;
  }, []);

  const subirAvatar = useCallback(async (file) => {
    const fd = new FormData();
    fd.append('avatar', file);
    const res  = await api.upload('/candidato/perfil/avatar', fd);
    const url  = res?.avatar_url ?? res?.data?.avatar_url ?? null;
    if (url) setPerfil((prev) => ({ ...prev, avatarUrl: url, avatar_url: url }));
    return url;
  }, []);

  const subirCv = useCallback(async (file) => {
    const fd = new FormData();
    fd.append('cv', file);
    const res = await api.upload('/candidato/perfil/cv', fd);
    const url = res?.cv_url ?? res?.data?.cv_url ?? null;
    if (url) setPerfil((prev) => ({ ...prev, cvUrl: url, cv_url: url }));
    return url;
  }, []);

  return {
    postulaciones,
    perfil,
    loading,
    error,
    fetchPostulaciones,
    fetchPerfil,
    actualizarPerfil,
    subirAvatar,
    subirCv,
  };
}
