# ARCHITECTURE_SPEC.md — IntegraJobs

> **Versión:** 3.0.0 | **Fecha:** 2026-05-17
> **Autor:** Arquitectura de Software / Full-Stack Lead
> **Estado:** Especificación vigente — única fuente de verdad arquitectónica para el equipo

---

## 0. Cambios respecto a la v2.0.0

La v2.0.0 describía un frontend en **HTML Vanilla + JS modular (ES Modules)** servido directamente por Express. La v3.0.0 inicia la migración del frontend a **Vite + React 18 (SPA)** usando el patrón **Strangler Fig**: el frontend React reemplaza progresivamente las vistas actuales, módulo a módulo, sin interrumpir el funcionamiento del sistema.

**Lo que no cambia:** el backend Node.js/Express 5, PostgreSQL, la capa de autenticación JWT, los contratos de API, y la estructura de `backend/` y `prisma/`. El backend no es objeto de esta fase.

---

## 1. Stack Tecnológico

### 1.1 Backend (sin cambios respecto a v2.0.0)

| Capa | Tecnología |
|---|---|
| **Servidor HTTP** | Node.js 20 LTS + Express 5 |
| **Esquema de datos** | Prisma 5 (schema + seed) |
| **Acceso a BD (runtime)** | `pg` (Pool) con SQL parametrizado |
| **Base de Datos** | PostgreSQL 16 (Docker) |
| **Autenticación** | JWT manual (`jsonwebtoken`) + `bcryptjs` |
| **Validación** | `express-validator` |
| **Contenedorización** | Docker + Docker Compose |
| **Testing** | Jest + Supertest |

### 1.2 Frontend (v3.0.0 — nuevo)

| Capa | Tecnología | Justificación |
|---|---|---|
| **Framework** | Vite + React 18 (SPA) | Build ultrarrápido con HMR, componentes reutilizables, gestión de estado declarativa. Reemplaza el HTML Vanilla progresivamente. |
| **Estilos** | Tailwind CSS v3 | Utility-first. El `tailwind.config.js` consume las mismas variables CSS de `theme.css` (ver §1.3) para garantizar paridad visual durante la transición. |
| **Routing** | React Router v6 | Routing declarativo en cliente con rutas anidadas y protección por rol. |
| **Estado global** | React Context + custom hooks (`useAuth`) | Suficiente para el alcance del sistema. Sin dependencias externas de estado. |
| **HTTP** | Cliente centralizado (`src/api/client.js`) | Intercepta todas las peticiones e inyecta el JWT en `Authorization: Bearer` automáticamente. |
| **Tipografía** | Inter (Google Fonts) | Heredada de la v2.0.0, importada una sola vez en `index.html`. |

### 1.3 Paleta UX — Variables CSS Globales (continuidad de `theme.css`)

Definidas originalmente en `frontend/css/theme.css`. Durante la migración, estas variables se preservan **sin modificar** en `theme.css` y se referencian explícitamente en `tailwind.config.js` del proyecto React para garantizar que ambos frontends compartan exactamente los mismos tokens visuales.

```css
/* frontend/css/theme.css — fuente original, no modificar */
:root {
  --color-primary:    #1A56DB; /* Azul Corporativo — botones primarios, enlaces */
  --color-secondary:  #10B981; /* Verde Éxito — "Aplicar", confirmaciones */
  --color-background: #F9FAFB; /* Gris Claro — fondo general */
  --color-text:       #111827; /* Gris Oscuro — texto principal */
  --color-danger:     #EF4444; /* Rojo Suave — errores, destructivo */
}
```

```js
// frontend-react/tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary:    'var(--color-primary)',
        secondary:  'var(--color-secondary)',
        background: 'var(--color-background)',
        text:       'var(--color-text)',
        danger:     'var(--color-danger)',
      },
    },
  },
};
```

Esto garantiza que `bg-primary`, `text-secondary`, etc., en Tailwind resuelven exactamente al mismo color que las páginas Vanilla durante la coexistencia de ambos frontends.

### 1.4 Principios de diseño (v3.0.0)

1. **El backend es inmutable en esta fase.** Cero cambios a rutas, servicios o esquema de base de datos. La API REST es el contrato estable que conecta ambos mundos.
2. **Paridad visual garantizada.** Los tokens de color de `theme.css` son la única fuente de verdad para el color. Tailwind los hereda; no se definen colores fuera de esas variables.
3. **Strangler Fig progresivo.** El HTML Vanilla y el SPA React coexisten. Express enruta al cliente correcto según el módulo.
4. **Ownership vertical por módulo.** Cada integrante migra su módulo de extremo a extremo: HTML → componentes React → hooks → pruebas visuales.
5. **Stateless.** El servidor no guarda sesión. El JWT viaja en `Authorization: Bearer` desde `client.js`.

---

## 2. Estructura de Directorios

```
IntegraJobs/
│
├── prisma/                            # [CARLOS] Sin cambios
│   ├── schema.prisma
│   └── seed.ts
│
├── backend/                           # Sin cambios en esta fase
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── server.js                  # [CARLOS]
│       ├── app.js                     # [CARLOS] — ver §3.3 para enrutamiento de transición
│       ├── config/
│       │   └── env.js                 # [CARLOS]
│       ├── db/
│       │   └── db.js                  # [CARLOS]
│       ├── middleware/
│       │   ├── auth.middleware.js     # [BRIAN]
│       │   └── validate.middleware.js # [CARLOS]
│       ├── routes/
│       │   ├── auth.routes.js         # [BRIAN]
│       │   ├── public.routes.js       # [CARLOS]
│       │   ├── vacantes.routes.js     # [WALTER]
│       │   ├── candidato.routes.js    # [WILBER]
│       │   ├── empresa.routes.js      # [WALTER]
│       │   └── admin.routes.js        # [CARLOS]
│       ├── controllers/
│       │   ├── auth.controller.js     # [BRIAN]
│       │   ├── vacantes.controller.js # [WALTER]
│       │   ├── candidato.controller.js# [WILBER]
│       │   ├── empresa.controller.js  # [WALTER]
│       │   └── admin.controller.js    # [CARLOS]
│       ├── services/
│       │   ├── auth.service.js        # [BRIAN]
│       │   ├── public.service.js      # [CARLOS]
│       │   ├── vacantes.service.js    # [WALTER]
│       │   ├── candidato.service.js   # [WILBER]
│       │   ├── empresa.service.js     # [WALTER]
│       │   └── admin.service.js       # [CARLOS]
│       └── tests/
│           ├── setup.js
│           ├── helpers.js
│           ├── auth.test.js           # [BRIAN]
│           ├── vacantes.test.js       # [WALTER]
│           ├── candidato.test.js      # [WILBER]
│           ├── empresa.test.js        # [WALTER]
│           ├── admin.test.js          # [CARLOS]
│           └── public.test.js         # [CARLOS]
│
├── frontend/                          # ⚠ LEGADO — convive temporalmente durante la migración
│   ├── index.html                     # [CARLOS]
│   ├── busqueda.html                  # [WILBER]
│   ├── vacante.html                   # [WILBER]
│   ├── css/
│   │   └── theme.css                  # [CARLOS] — fuente de tokens visuales, NO modificar
│   ├── img/
│   ├── js/
│   │   ├── api.js                     # [CARLOS]
│   │   ├── auth.js                    # [BRIAN]
│   │   ├── shell.js                   # [CARLOS]
│   │   ├── icons.js                   # [CARLOS]
│   │   ├── helpers.js                 # [CARLOS]
│   │   ├── index.js                   # [CARLOS]
│   │   ├── busqueda.js                # [WILBER]
│   │   ├── vacante.js                 # [WILBER]
│   │   └── pages/
│   └── pages/
│       ├── login.html                 # [BRIAN]
│       ├── registro*.html             # [BRIAN]
│       ├── candidato/                 # [WILBER]
│       ├── empresa/                   # [WALTER]
│       └── admin/                     # [CARLOS]
│
├── frontend-react/                    # ✅ NUEVO — SPA React (v3.0.0)
│   ├── index.html                     # Punto de entrada HTML de Vite
│   ├── vite.config.js                 # [CARLOS]
│   ├── tailwind.config.js             # [CARLOS] — consume variables de theme.css
│   ├── postcss.config.js              # [CARLOS]
│   ├── package.json
│   └── src/
│       ├── main.jsx                   # Monta <App /> en el DOM
│       ├── App.jsx                    # [CARLOS] Router raíz + AuthProvider
│       │
│       ├── context/
│       │   └── AuthContext.jsx        # [BRIAN]  useAuth() — gestión de sesión y JWT
│       │
│       ├── api/
│       │   └── client.js              # [CARLOS] Cliente fetch centralizado con interceptor JWT
│       │
│       ├── hooks/                     # Custom hooks por dominio
│       │   ├── useVacantes.js         # [WALTER]
│       │   ├── useCandidato.js        # [WILBER]
│       │   ├── useEmpresa.js          # [WALTER]
│       │   └── useAdmin.js            # [CARLOS]
│       │
│       ├── components/
│       │   ├── ui/                    # [CARLOS] Átomos: Button, Badge, Modal, Input, Spinner
│       │   ├── layout/                # [CARLOS] Shell, Navbar, Sidebar, PrivateRoute
│       │   └── shared/                # Componentes compartidos entre roles
│       │       ├── VacanteCard.jsx    # [WALTER/WILBER]
│       │       ├── ForoPost.jsx       # [WILBER]
│       │       └── AlertaBanner.jsx   # [WILBER]
│       │
│       └── pages/
│           ├── public/                # [CARLOS] Landing, Login, Registro, Búsqueda, Vacante
│           │   ├── HomePage.jsx
│           │   ├── LoginPage.jsx
│           │   ├── RegistroCandidatoPage.jsx
│           │   ├── RegistroEmpresaPage.jsx
│           │   ├── BusquedaPage.jsx
│           │   └── VacantePage.jsx
│           │
│           ├── candidato/             # [WILBER]
│           │   ├── DashboardPage.jsx
│           │   ├── PerfilPage.jsx
│           │   ├── BusquedaPage.jsx
│           │   ├── VacantePage.jsx
│           │   ├── AlertasPage.jsx
│           │   ├── ForosPage.jsx
│           │   └── ValoracionesPage.jsx
│           │
│           ├── empresa/               # [WALTER]
│           │   ├── DashboardPage.jsx
│           │   ├── VacantesPage.jsx
│           │   ├── CrearVacantePage.jsx
│           │   ├── AplicacionesPage.jsx
│           │   └── PerfilPage.jsx
│           │
│           └── admin/                 # [CARLOS]
│               ├── DashboardPage.jsx
│               ├── UsuariosPage.jsx
│               ├── EmpresasPage.jsx
│               ├── VacantesPage.jsx
│               ├── ForosPage.jsx
│               ├── RecursosPage.jsx
│               └── ValoracionesPage.jsx
│
├── docker-compose.yml                 # [CARLOS]
├── .env.example                       # [CARLOS]
├── DEPLOY.md                          # [CARLOS]
└── ARCHITECTURE_SPEC.md               # [CARLOS] (este archivo)
```

---

## 3. Arquitectura Lógica

### 3.1 Diagrama general (estado de transición)

```
┌────────────────────────────────────────────────────────────────────┐
│              Navegador                                             │
│                                                                    │
│  [React SPA]  src/api/client.js ──▶ fetch("/api/...", Bearer JWT) │
│       ▲                                                            │
│       │  (módulos migrados)                                        │
│  [HTML Vanilla]  js/api.js     ──▶ fetch("/api/...", Bearer JWT)  │
│       ▲                                                            │
│       │  (módulos pendientes de migración)                         │
└───────┼────────────────────────────────────────────────────────────┘
        │ HTTP
        ▼
┌────────────────────────────────────────────────────────────────────┐
│                     Express 5 (backend/src/app.js)                 │
│                                                                    │
│  express.static("frontend-react/dist/")  ← módulos migrados       │
│  express.static("frontend/")             ← módulos legados        │
│                                                                    │
│  /api/public    → public.routes  → public.service                  │
│  /api/auth      → auth.routes    → auth.controller → service       │
│  /api/vacantes  → vacantes.*     (requireAuth + EMPRESA)           │
│  /api/candidato → candidato.*    (requireAuth + CANDIDATO)         │
│  /api/empresa   → empresa.*      (requireAuth + EMPRESA)           │
│  /api/admin     → admin.*        (requireAuth + SUPERADMIN)        │
│  404 handler /api                                                  │
│  error handler global (statusCode → JSON uniforme)                 │
└────────────────────────────────────────────────────────────────────┘
        │ pg.Pool (SQL parametrizado)
        ▼
┌────────────────────────────────────────────────────────────────────┐
│        PostgreSQL 16 (Docker, volumen persistente)                 │
│        Esquema gobernado por prisma/schema.prisma                  │
└────────────────────────────────────────────────────────────────────┘
```

### 3.2 Routing en el SPA React

React Router v6 define el árbol de rutas en `App.jsx`. Las rutas privadas están envueltas en `<PrivateRoute role="...">`, que lee `useAuth()` y redirige a `/login` si no hay sesión o el rol no coincide.

```
/                          → público (HomePage)
/login                     → público (LoginPage)
/registro/candidato        → público
/registro/empresa          → público
/busqueda                  → público
/vacante/:id               → público

/candidato/*               → PrivateRoute(role="CANDIDATO")
  /candidato/dashboard
  /candidato/perfil
  /candidato/busqueda
  /candidato/alertas
  /candidato/foros
  /candidato/valoraciones

/empresa/*                 → PrivateRoute(role="EMPRESA")
  /empresa/dashboard
  /empresa/vacantes
  /empresa/vacantes/crear
  /empresa/aplicaciones
  /empresa/perfil

/admin/*                   → PrivateRoute(role="SUPERADMIN")
  /admin/dashboard
  /admin/usuarios
  /admin/empresas
  /admin/vacantes
  /admin/foros
  /admin/recursos
  /admin/valoraciones
```

### 3.3 Enrutamiento de transición en Express (`app.js`)

Durante la migración, `app.js` sirve estáticos de ambos frontends. Los módulos ya compilados en React tienen prioridad; el resto recae en el HTML Vanilla:

```js
// Sirve el build de React para los módulos migrados
app.use('/admin', express.static(path.join(__dirname, '../../frontend-react/dist')));
// ... se añaden rutas a medida que se migran módulos

// Fallback: HTML Vanilla para módulos aún no migrados
app.use(express.static(path.join(__dirname, '../../frontend')));

// Catch-all para el SPA React (client-side routing)
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend-react/dist/index.html'));
});
```

Este bloque se actualiza con cada módulo que finaliza su migración.

### 3.4 Cliente HTTP centralizado (`src/api/client.js`)

```js
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error(body.error ?? res.statusText), { status: res.status });
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  get:    (path)         => request(path),
  post:   (path, body)   => request(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (path, body)   => request(path, { method: 'PUT',    body: JSON.stringify(body) }),
  patch:  (path, body)   => request(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: (path)         => request(path, { method: 'DELETE' }),
};
```

### 3.5 AuthContext (`src/context/AuthContext.jsx`)

```jsx
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem('user') ?? 'null')
  );

  const login = async (email, password, loginType) => {
    const { token, user } = await api.post('/auth/login', { email, password, loginType });
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

### 3.6 Flujo de una request autenticada (React → API)

1. El componente llama a un custom hook (ej. `useVacantes()`).
2. El hook invoca `api.get('/vacantes')` en `client.js`.
3. `client.js` lee `localStorage.getItem('token')` e inyecta el header `Authorization: Bearer <jwt>`.
4. Express enruta a `vacantes.routes.js`.
5. `requireAuth` valida firma/expiración del JWT y popula `req.user = { sub, role, email }`.
6. `requireRole` aplica autorización por rol.
7. El controlador delega al service, que ejecuta `pool.query(SQL, [params])`.
8. Cualquier `throw` sube al error handler global → `{ error: "..." }` con el código HTTP correspondiente.

---

## 4. Estrategia de Migración — Patrón Strangler Fig

La migración es **incremental por módulo**. En ningún momento el sistema queda inoperativo. Cada módulo migrado pasa por: implementación React → integración en Express → validación manual → desactivación del HTML Vanilla equivalente.

### 4.1 Orden de ejecución

| Fase | Módulo | Owner | Justificación |
|---|---|---|---|
| **1** | Setup base (Vite, Tailwind, Router, AuthContext, `client.js`) | Carlos | Andamiaje compartido. Sin esto, ninguna fase puede avanzar. |
| **2** | **Admin** | Carlos | Módulo de uso interno. Sirve como sandbox real para validar el stack antes de exponer a usuarios finales. Riesgo controlado. |
| **3** | **Candidato** | Wilber | Mayor volumen de usuarios. Una vez Admin valida el patrón, Wilber aplica la misma estructura. |
| **4** | **Empresa** | Walter | Dependencia leve con Candidato (comparten `VacanteCard`). Se migra después para reutilizar componentes. |
| **5** | **Público** (Landing, Búsqueda, Vacante, Login, Registro) | Carlos + Brian | Última fase: mayor exposición. Se migra cuando el resto del sistema ya opera en React. |

### 4.2 Criterios para marcar un módulo como migrado

- Todas las rutas del módulo renderizan desde `frontend-react/dist/`.
- El JWT se inyecta correctamente vía `client.js` en todas las llamadas del módulo.
- Las vistas pasan validación manual contra el HTML Vanilla equivalente (paridad funcional).
- Express retira el `express.static("frontend/")` correspondiente para esas rutas.

### 4.3 Criterio de retiro del frontend legado

La carpeta `frontend/` se elimina cuando **todos los módulos** han completado la migración y validación. Hasta entonces, el directorio permanece intacto y funcional.

---

## 5. Contratos de API (REST, prefijo `/api`)

El backend no cambia. Esta sección se reproduce íntegra desde v2.0.0 como referencia para los desarrolladores React.

### 5.1 Público (sin token)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/public/stats`        | KPIs de la landing (usuarios, vacantes activas, empresas) |
| `GET` | `/api/public/vacantes`     | Búsqueda pública (`q`, `ubicacion`, `page`, `limit`) |
| `GET` | `/api/public/vacantes/:id` | Detalle público de una vacante |

### 5.2 Autenticación — `/api/auth` (owner: **Brian**)

| Método | Ruta | Body | Descripción |
|---|---|---|---|
| `POST` | `/api/auth/login`              | `email`, `password`, `loginType` | Retorna `{ token, user }` |
| `POST` | `/api/auth/registro/candidato` | `email`, `password`, `nombre`, `apellidos` | Crea `User` con rol `CANDIDATO` |
| `POST` | `/api/auth/registro/empresa`   | `email`, `password`, `nombre`, `empresaNombre`, `ubicacion`, `industria`, `descripcion?`, `sitioWeb?` | Crea `User` (rol `EMPRESA`) + `Company` |

### 5.3 Vacantes — `/api/vacantes` (owner: **Walter**)

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| `GET`   | `/api/vacantes`                      | público | Listar vacantes activas con filtros |
| `GET`   | `/api/vacantes/:id`                  | público | Detalle de una vacante |
| `GET`   | `/api/vacantes/empresa/mis-vacantes` | EMPRESA | Vacantes de la empresa autenticada |
| `POST`  | `/api/vacantes`                      | EMPRESA | Crear vacante |
| `PUT`   | `/api/vacantes/:id`                  | EMPRESA | Actualizar vacante |
| `PATCH` | `/api/vacantes/:id/status`           | EMPRESA | `status ∈ {activa, pausada, cerrada}` |

### 5.4 Candidato — `/api/candidato` (owner: **Wilber**)

| Método | Ruta | Descripción |
|---|---|---|
| `GET`  | `/api/candidato/perfil`               | Perfil del candidato autenticado |
| `PUT`  | `/api/candidato/perfil`               | Actualizar nombre, apellidos, teléfono, `cvUrl` |
| `POST` | `/api/candidato/postulaciones/:id`    | Postularse a una vacante |
| `GET`  | `/api/candidato/postulaciones`        | Listar postulaciones propias |

### 5.5 Empresa — `/api/empresa` (owner: **Walter**)

| Método | Ruta | Descripción |
|---|---|---|
| `GET`   | `/api/empresa/perfil`                              | Perfil de la empresa |
| `PUT`   | `/api/empresa/perfil`                              | Actualizar datos de empresa |
| `GET`   | `/api/empresa/vacantes`                            | Vacantes propias |
| `GET`   | `/api/empresa/vacantes/:id/aplicaciones`           | Aplicantes por vacante |
| `PATCH` | `/api/empresa/aplicaciones/:id/status`             | `status ∈ {nuevo, en_proceso, rechazado, contratado}` |

### 5.6 Admin — `/api/admin` (owner: **Carlos**)

| Método | Ruta | Descripción |
|---|---|---|
| `GET`   | `/api/admin/usuarios`                    | Listar usuarios |
| `PATCH` | `/api/admin/usuarios/:id/toggle`         | Activar/desactivar usuario |
| `GET`   | `/api/admin/empresas/pendientes`         | Empresas sin verificar |
| `PATCH` | `/api/admin/empresas/:id/verificar`      | `{ verificar: boolean }` |
| `GET`   | `/api/admin/vacantes/pendientes`         | Vacantes sin aprobar |
| `PATCH` | `/api/admin/vacantes/:id/aprobar`        | `{ aprobar: boolean }` |

### 5.7 Formato uniforme de errores

```json
{ "error": "Descripción humana del error" }
```

| Código | Caso típico |
|---|---|
| `400` | Body malformado |
| `401` | Token requerido / Token inválido o expirado |
| `403` | Acceso denegado (rol incorrecto) |
| `404` | Ruta no encontrada (bajo `/api`) |
| `422` | Validación de `express-validator` |
| `500` | Error interno |

---

## 6. División de Trabajo (Ownership v3.0.0)

Cada integrante es dueño de su módulo **de extremo a extremo**: HTML Vanilla de referencia → componentes React → custom hooks → validación manual. Los cambios fuera del módulo propio requieren PR con revisión del owner.

### Brian — Autenticación y Sesiones

- **Backend (sin cambios):** `auth.routes.js`, `auth.controller.js`, `auth.service.js`, `auth.middleware.js`
- **React (nuevo):** `context/AuthContext.jsx`, `pages/public/LoginPage.jsx`, `pages/public/RegistroCandidatoPage.jsx`, `pages/public/RegistroEmpresaPage.jsx`
- **Tests backend:** `tests/auth.test.js`
- **Responsable de:** `useAuth()` hook, lógica de login/logout, almacenamiento del JWT en `localStorage`, formularios de acceso y registro.

### Wilber — Módulo Candidato

- **Backend (sin cambios):** `candidato.routes.js`, `candidato.controller.js`, `candidato.service.js`
- **React (nuevo):** `pages/candidato/*`, `hooks/useCandidato.js`, `components/shared/ForoPost.jsx`, `components/shared/AlertaBanner.jsx`
- **Tests backend:** `tests/candidato.test.js`
- **Responsable de:** perfil del candidato, búsqueda de vacantes, flujo de postulación, alertas, foros (vista candidato), valoraciones.

### Walter — Módulo Empresa y Vacantes

- **Backend (sin cambios):** `empresa.routes.js`, `vacantes.routes.js`, controladores y servicios asociados
- **React (nuevo):** `pages/empresa/*`, `hooks/useEmpresa.js`, `hooks/useVacantes.js`, `components/shared/VacanteCard.jsx`
- **Tests backend:** `tests/empresa.test.js`, `tests/vacantes.test.js`
- **Responsable de:** CRUD de vacantes, revisión de aplicantes, cambio de estado de aplicación y vacante, perfil de empresa.

### Carlos — Admin + Plataforma + Setup React

- **Backend (sin cambios):** `app.js`, `server.js`, `config/`, `db/`, `middleware/validate.*`, `admin.routes.js`, `public.routes.js`, servicios correspondientes
- **Infra:** `prisma/`, `docker-compose.yml`, `.env.example`, `DEPLOY.md`, `ARCHITECTURE_SPEC.md`
- **React (nuevo):** Setup base completo (`vite.config.js`, `tailwind.config.js`, `App.jsx`, `src/api/client.js`, `components/ui/*`, `components/layout/*`), `pages/admin/*`, `pages/public/HomePage.jsx`, `pages/public/BusquedaPage.jsx`, `pages/public/VacantePage.jsx`, `hooks/useAdmin.js`
- **Tests backend:** `tests/admin.test.js`, `tests/public.test.js`
- **Responsable de:** andamiaje React compartido, enrutamiento Express de transición, aprobación de vacantes/empresas, gestión de usuarios, tokens visuales Tailwind.

### 6.1 Matriz de propiedad — resumen

| Carpeta / archivo | Owner |
|---|---|
| `backend/src/app.js`, `server.js`, `config/`, `db/`, `middleware/validate.*` | Carlos |
| `backend/src/middleware/auth.middleware.js` | Brian |
| `backend/src/{routes,controllers,services}/auth.*` | Brian |
| `backend/src/{routes,controllers,services}/candidato.*` | Wilber |
| `backend/src/{routes,controllers,services}/{empresa,vacantes}.*` | Walter |
| `backend/src/{routes,controllers,services}/{admin,public}.*` | Carlos |
| `prisma/`, `docker-compose.yml`, `.env.example`, docs raíz | Carlos |
| `frontend-react/vite.config.js`, `tailwind.config.js`, `src/api/`, `src/components/ui/`, `src/components/layout/`, `src/App.jsx` | Carlos |
| `frontend-react/src/context/AuthContext.jsx` | Brian |
| `frontend-react/src/pages/public/Login*.jsx`, `Registro*.jsx` | Brian |
| `frontend-react/src/pages/public/Home*.jsx`, `Busqueda*.jsx`, `Vacante*.jsx` | Carlos |
| `frontend-react/src/pages/candidato/*`, `hooks/useCandidato.js` | Wilber |
| `frontend-react/src/pages/empresa/*`, `hooks/useEmpresa.js`, `hooks/useVacantes.js` | Walter |
| `frontend-react/src/pages/admin/*`, `hooks/useAdmin.js` | Carlos |
| `frontend/` (legado) | Cada owner en su subcarpeta, sin nuevas funcionalidades |

---

## 7. Entornos y Variables

| Variable | Backend en host (`.env`) | Backend en contenedor (`docker-compose`) | Frontend React (`.env`) |
|---|---|---|---|
| `DATABASE_URL` | `postgresql://portal:portal_secret@localhost:5434/portal_db` | `postgresql://portal:portal_secret@db:5432/portal_db` | — |
| `JWT_SECRET` | definido en `.env` | definido en `environment:` | — |
| `PORT` | `3000` | `3000` | — |
| `NODE_ENV` | `development` | `development` | — |
| `VITE_API_URL` | — | — | `/api` (o URL completa en producción) |

- **Prisma CLI** se ejecuta siempre **desde el host** contra `localhost:5434`.
- El build de React se genera con `npm run build` en `frontend-react/` y Express sirve `dist/` como estático.
- En desarrollo, Vite corre en su propio puerto (`5173`) con proxy configurado hacia el backend (`localhost:3000`).

Consulta `DEPLOY.md` para el procedimiento completo de bootstrap.

---

## 8. Decisiones arquitectónicas clave (ADR resumido)

| # | Decisión | Alternativa descartada | Motivo |
|---|---|---|---|
| ADR-01 | Express 5 + HTML Vanilla (v2.0.0) | Next.js 14 | Reducir complejidad: sin bundler, sin SSR. Decisión anterior que se mantiene para el backend. |
| ADR-02 | JWT manual | NextAuth.js | Stateless, portable, sin acoplamiento a frontend. Control total sobre claims y expiración. |
| ADR-03 | `pg` en runtime, Prisma solo para schema | Prisma Client en runtime | SQL explícito para reportes/agregaciones. Evita sorpresas del query planner. |
| ADR-04 | Estructura por módulo (routes/controllers/services) | Feature folders | Ownership claro por integrante. |
| ADR-05 | React Context para estado global | Redux Toolkit / Zustand | Alcance del sistema no justifica dependencias externas de estado. |
| ADR-06 | Strangler Fig incremental | Rewrite total | Garantiza que el sistema permanece funcional durante toda la migración. |
| ADR-07 | Tailwind consuma variables CSS de `theme.css` | Redefinir colores en Tailwind | Paridad visual garantizada durante la coexistencia de ambos frontends. Sin riesgo de drift de color. |
| ADR-08 | Admin se migra primero | Módulo público primero | Admin es de uso interno, permite validar el stack en producción con riesgo controlado antes de exponer cambios a usuarios finales. |

---

## 9. Convenciones de código

### Backend (sin cambios)
- ES Modules (`"type": "module"`). Todos los imports con extensión `.js`.
- Naming: `modulo.routes.js`, `modulo.controller.js`, `modulo.service.js`.
- SQL siempre parametrizado (`$1, $2, ...`), nunca interpolado.
- `async/await` en controladores. `throw` sube al error handler global.

### Frontend React (nuevo)
- **Componentes:** PascalCase, un componente por archivo, extensión `.jsx`.
- **Hooks:** prefijo `use`, camelCase, extensión `.js` (ej. `useCandidato.js`).
- **Páginas:** sufijo `Page` (ej. `DashboardPage.jsx`).
- **API:** todo acceso al backend va por `src/api/client.js`. Prohibido usar `fetch` directamente en componentes.
- **Estado local:** `useState`/`useReducer`. Estado global solo vía `AuthContext`.
- **Estilos:** clases Tailwind. Los colores se referencian por su alias (`bg-primary`, `text-danger`), nunca con valores hexadecimales directos.

---

## 10. Roadmap técnico

### Pendiente en v3.0.0 (migración React)
1. Completar las fases de migración definidas en §4 en el orden declarado.
2. Retirar la carpeta `frontend/` al finalizar la última fase.
3. Actualizar `DEPLOY.md` con el proceso de build React y servicio de estáticos.

### Post-migración (fuera del alcance v3.0.0)
1. Mover el hashing de contraseñas a `argon2id` cuando `bcryptjs` quede obsoleto.
2. Añadir índices a `vacancies(status, is_approved, created_at)` cuando el volumen lo justifique.
3. Introducir rate-limit (`express-rate-limit`) en `/api/auth/login`.
4. Integrar CDN para los estáticos del build de Vite en producción.
5. Evaluar `PgBouncer` si escala la concurrencia sobre `pg.Pool`.
