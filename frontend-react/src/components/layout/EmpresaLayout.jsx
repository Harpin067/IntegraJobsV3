import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/empresa/dashboard',     label: 'Dashboard'      },
  { to: '/empresa/crear-vacante', label: 'Crear Vacante'  },
  { to: '/empresa/perfil',        label: 'Perfil'         },
];

export default function EmpresaLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-gray-200">
          <img src="/logo.png" alt="IntegraJobs" className="h-8 w-auto object-contain mb-1" />
          <p className="text-xs text-gray-400 mt-0.5">Portal Empresa</p>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 truncate mb-2">
            {user?.nombre ?? user?.email}
          </p>
          <button
            onClick={handleLogout}
            className="text-xs text-danger hover:underline"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shrink-0">
          <h1 className="text-base font-semibold text-text">Portal Empresa</h1>
          <span className="text-xs text-gray-400">{user?.email}</span>
        </header>

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
