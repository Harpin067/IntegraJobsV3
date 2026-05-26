const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

// Evento global que AuthProvider escucha para limpiar la sesión sin
// acoplar el cliente HTTP al árbol de React.
export const AUTH_EXPIRED_EVENT = 'ij:auth:expired';

function dispatchAuthExpired() {
  window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
}

async function request(path, options = {}) {
  const token = localStorage.getItem('token');

  const { headers: extraHeaders, ...restOptions } = options;

  // Si se pasa Content-Type: null, se omite (usado para multipart/form-data).
  const baseHeaders = {
    ...((extraHeaders?.['Content-Type'] !== null) && { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...extraHeaders,
  };
  // Elimina la clave null que usamos como señal para omitir Content-Type
  if (baseHeaders['Content-Type'] === null) delete baseHeaders['Content-Type'];

  const headers = baseHeaders;

  const res = await fetch(`${BASE_URL}${path}`, { ...restOptions, headers });

  // Sesión expirada o token inválido: purgar y redirigir globalmente.
  // Excluimos /auth/login para no disparar el evento en un intento fallido de login.
  if ((res.status === 401 || res.status === 403) && !path.startsWith('/auth/')) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatchAuthExpired();

    const err = new Error('Sesión expirada. Por favor, inicia sesión de nuevo.');
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return null;

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(body.error ?? res.statusText);
    err.status = res.status;
    throw err;
  }

  return body;
}

export const api = {
  get:    (path)       => request(path),
  post:   (path, data) => request(path, { method: 'POST',   body: JSON.stringify(data) }),
  put:    (path, data) => request(path, { method: 'PUT',    body: JSON.stringify(data) }),
  patch:  (path, data) => request(path, { method: 'PATCH',  body: JSON.stringify(data) }),
  delete: (path)       => request(path, { method: 'DELETE' }),

  // Para subir archivos con FormData — pasa Content-Type: null como señal
  // para que request() omita el header y el browser lo establezca automáticamente
  // con el boundary correcto para multipart/form-data.
  upload: (path, formData) => request(path, {
    method:  'POST',
    body:    formData,
    headers: { 'Content-Type': null },
  }),
};
