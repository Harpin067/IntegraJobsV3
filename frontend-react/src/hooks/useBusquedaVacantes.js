import { useState, useCallback } from 'react';
import { api } from '../api/client';

export function useBusquedaVacantes() {
  const [vacantes, setVacantes] = useState([]);
  const [vacante,  setVacante]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);

  const fetchVacantes = useCallback(async (filtros = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filtros.q)            params.set('q',            filtros.q);
      if (filtros.ubicacion)    params.set('ubicacion',    filtros.ubicacion);
      if (filtros.tipoTrabajo)  params.set('tipoTrabajo',  filtros.tipoTrabajo);
      if (filtros.tipoContrato) params.set('tipoContrato', filtros.tipoContrato);
      if (filtros.experiencia)  params.set('experiencia',  filtros.experiencia);
      if (filtros.salarioMin)   params.set('salarioMin',   filtros.salarioMin);
      if (filtros.salarioMax)   params.set('salarioMax',   filtros.salarioMax);
      if (filtros.page)         params.set('page',         filtros.page);
      if (filtros.limit)        params.set('limit',        filtros.limit);

      const qs  = params.toString();
      const res = await api.get(`/public/vacantes${qs ? `?${qs}` : ''}`);

      // Desestructuración defensiva: cubre { data: [...] }, { vacantes: [...] } o array directo
      const lista = res?.data?.data ?? res?.data?.vacantes ?? res?.data ?? res?.vacantes ?? (Array.isArray(res) ? res : []);
      const count = res?.data?.total ?? res?.total ?? (Array.isArray(lista) ? lista.length : 0);

      console.log('[useBusquedaVacantes] Datos recibidos:', lista);

      setVacantes(Array.isArray(lista) ? lista : []);
      setTotal(count);
      setPage(Number(res?.data?.page ?? res?.page ?? filtros.page ?? 1));
    } catch (err) {
      console.error('[useBusquedaVacantes] Error:', err);
      setError(err.message ?? 'Error al buscar vacantes');
      setVacantes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchVacantePorId = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    setVacante(null);
    try {
      const res  = await api.get(`/public/vacantes/${id}`);
      const data = res?.data ?? res;
      console.log('[useBusquedaVacantes] Datos de la vacante:', data);
      setVacante(data);
      return data;
    } catch (err) {
      setError(err.message ?? 'Vacante no encontrada');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const postularse = useCallback(async (vacancyId, mensaje = '') => {
    const body = mensaje ? { mensaje } : {};
    await api.post(`/candidato/postulaciones/${vacancyId}`, body);
  }, []);

  return { vacantes, vacante, loading, error, total, page, fetchVacantes, fetchVacantePorId, postularse };
}
