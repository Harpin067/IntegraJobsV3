import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/layout/PrivateRoute';
import AdminLayout from './components/layout/AdminLayout';
import EmpresaLayout from './components/layout/EmpresaLayout';
import CandidatoLayout from './components/layout/CandidatoLayout';

import LoginPage from './pages/public/LoginPage';
import SeleccionRegistroPage from './pages/auth/SeleccionRegistroPage';
import RegistroCandidatoPage from './pages/public/RegistroCandidatoPage';
import RegistroEmpresaPage from './pages/public/RegistroEmpresaPage';
import BusquedaPage from './pages/public/BusquedaPage';
import VacanteDetallePage from './pages/public/VacanteDetallePage';
import AdminDashboardPage from './pages/admin/DashboardPage';
import AdminUsuariosPage from './pages/admin/UsuariosPage';
import EmpresasPendientesPage from './pages/admin/EmpresasPendientesPage';
import AdminRecursosPage from './pages/admin/RecursosPage';
import RecursosPage from './pages/public/RecursosPage';
import EmpresaDashboardPage from './pages/empresa/EmpresaDashboardPage';
import CrearVacantePage from './pages/empresa/CrearVacantePage';
import AplicacionesVacantePage from './pages/empresa/AplicacionesVacantePage';
import PerfilEmpresaPage from './pages/empresa/PerfilEmpresaPage';
import LandingPage from './pages/public/LandingPage';
import ForoIndexPage from './pages/foros/ForoIndexPage';
import HiloDetallePage from './pages/foros/HiloDetallePage';
import DashboardCandidatoPage from './pages/candidato/DashboardCandidatoPage';
import AlertasPage from './pages/candidato/AlertasPage';
import PerfilCandidatoPage from './pages/candidato/PerfilCandidatoPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Públicas */}
          <Route path="/"                    element={<LandingPage />} />
          <Route path="/login"               element={<LoginPage />} />
          <Route path="/registro"            element={<SeleccionRegistroPage />} />
          <Route path="/registro/candidato"  element={<RegistroCandidatoPage />} />
          <Route path="/registro/empresa"    element={<RegistroEmpresaPage />} />
          <Route path="/busqueda"            element={<BusquedaPage />} />
          <Route path="/vacante/:id"         element={<VacanteDetallePage />} />
          <Route path="/recursos"            element={<RecursosPage />} />
          <Route path="/foros"               element={<ForoIndexPage />} />
          <Route path="/foros/hilos/:id"     element={<HiloDetallePage />} />

          {/* Admin — requiere rol SUPERADMIN */}
          <Route element={<PrivateRoute role="SUPERADMIN" />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="usuarios"  element={<AdminUsuariosPage />} />
              <Route path="empresas"  element={<EmpresasPendientesPage />} />
              <Route path="recursos"  element={<AdminRecursosPage />} />
            </Route>
          </Route>

          {/* Empresa — requiere rol EMPRESA */}
          <Route element={<PrivateRoute role="EMPRESA" />}>
            <Route path="/empresa" element={<EmpresaLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard"     element={<EmpresaDashboardPage />} />
              <Route path="perfil"                            element={<PerfilEmpresaPage />} />
              <Route path="crear-vacante"                    element={<CrearVacantePage />} />
              <Route path="vacantes/:vacancyId/aplicaciones" element={<AplicacionesVacantePage />} />
            </Route>
          </Route>

          {/* Candidato — requiere rol CANDIDATO */}
          <Route element={<PrivateRoute role="CANDIDATO" />}>
            <Route path="/candidato" element={<CandidatoLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashboardCandidatoPage />} />
              <Route path="alertas"   element={<AlertasPage />} />
              <Route path="perfil"    element={<PerfilCandidatoPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
