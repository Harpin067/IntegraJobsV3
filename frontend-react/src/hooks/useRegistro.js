import { useState } from 'react';
import { api } from '../api/client';

export function useRegistro() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  async function registrarCandidato(data) {
    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/registro/candidato', data);
    } catch (err) {
      setError(err.message ?? 'Error al crear la cuenta');
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function registrarEmpresa(data) {
    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/registro/empresa', data);
    } catch (err) {
      setError(err.message ?? 'Error al crear la cuenta');
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, registrarCandidato, registrarEmpresa };
}
