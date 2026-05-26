import { useState, useCallback } from 'react';
import { api } from '../api/client';

export default function useReviews() {
  const [reviews,  setReviews]  = useState([]);
  const [promedio, setPromedio] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const fetchReviews = useCallback((companyId) => {
    if (!companyId) return;
    setLoading(true);
    setError(null);

    api.get(`/public/empresas/${companyId}/reviews`)
      .then((res) => {
        const payload = res?.data ?? res;
        setReviews(payload?.reviews ?? (Array.isArray(payload) ? payload : []));
        setPromedio(payload?.promedio ?? null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function crearReview(companyId, { rating, comentario }) {
    try {
      const res   = await api.post(`/candidato/reviews/${companyId}`, {
        rating,
        comentario,
      });
      return res?.data ?? res;
    } catch (err) {
      if (err.status === 409 || err.status === 422) {
        const mensajeClaro = new Error(
          'Ya enviaste una reseña para esta empresa. Solo se permite una por empresa.'
        );
        mensajeClaro.status = err.status;
        throw mensajeClaro;
      }
      throw err;
    }
  }

  return { reviews, promedio, loading, error, fetchReviews, crearReview };
}
