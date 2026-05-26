import { useEffect } from 'react';
import { useAdminUsuarios } from '../../hooks/useAdminUsuarios';

const ROL_CFG = {
  SUPERADMIN: { label: 'Admin',     chip: 'bg-purple-100 text-purple-700' },
  CANDIDATO:  { label: 'Candidato', chip: 'bg-blue-100 text-blue-700'     },
  EMPRESA:    { label: 'Empresa',   chip: 'bg-amber-100 text-amber-700'   },
};

export default function UsuariosPage() {
  const { usuarios, loading, error, toggling, fetchUsuarios, toggleEstadoUsuario } =
    useAdminUsuarios();

  useEffect(() => { fetchUsuarios(); }, [fetchUsuarios]);

  return (
    <div className="space-y-6">

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestión de Usuarios</h2>
          <p className="text-sm text-slate-500 mt-1">
            {loading
              ? 'Cargando usuarios…'
              : `${usuarios.length} usuario${usuarios.length !== 1 ? 's' : ''} registrado${usuarios.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={fetchUsuarios}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-2 text-sm font-medium text-[#1A56DB] bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
        >
          <IcoRefresh spinning={loading} />
          {loading ? 'Actualizando…' : 'Actualizar'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          <IcoAlert />
          {error}
        </div>
      )}

      {/* Tabla */}
      {loading && usuarios.length === 0 ? (
        <SkeletonTabla />
      ) : usuarios.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                <th className="px-5 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide">Usuario</th>
                <th className="px-5 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide">Email</th>
                <th className="px-5 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide">Rol</th>
                <th className="px-5 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide">Estado</th>
                <th className="px-5 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {usuarios.map((u) => {
                const nombre = u.nombre
                  ? `${u.nombre} ${u.apellidos ?? ''}`.trim()
                  : '—';
                const inicial = nombre.charAt(0).toUpperCase();
                const activo  = u.is_active ?? u.isActive ?? true;

                return (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1A56DB]/10 text-[#1A56DB] font-bold text-xs flex items-center justify-center shrink-0">
                          {inicial}
                        </div>
                        <span className="font-medium text-slate-800 whitespace-nowrap">{nombre}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${(ROL_CFG[u.role] ?? { chip: 'bg-gray-100 text-gray-600' }).chip}`}>
                        {(ROL_CFG[u.role] ?? { label: u.role }).label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${activo ? 'text-[#10B981]' : 'text-slate-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${activo ? 'bg-[#10B981]' : 'bg-gray-300'}`} />
                        {activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => toggleEstadoUsuario(u.id)}
                        disabled={toggling === u.id}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 ${
                          activo
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-green-50 text-[#10B981] hover:bg-green-100'
                        }`}
                      >
                        {toggling === u.id ? '…' : activo ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Sub-componentes ─────────────────────────────────────────────────────── */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      </div>
      <p className="font-semibold text-slate-700">No hay usuarios registrados</p>
    </div>
  );
}

function SkeletonTabla() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="h-12 bg-gray-50 border-b border-gray-100" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 last:border-0">
          <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-36 bg-gray-200 rounded" />
          </div>
          <div className="h-3 w-48 bg-gray-100 rounded" />
          <div className="h-5 w-16 bg-gray-100 rounded-full" />
          <div className="h-5 w-14 bg-gray-100 rounded" />
          <div className="h-7 w-20 bg-gray-100 rounded-xl ml-auto" />
        </div>
      ))}
    </div>
  );
}

function IcoRefresh({ spinning = false }) {
  return (
    <svg className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

function IcoAlert() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  );
}
