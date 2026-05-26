import { useState } from 'react';
import { Link } from 'react-router-dom';

const BACKEND_URL =
  (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api').replace(/\/api$/, '');

const TIPO_LABELS     = { presencial: 'Presencial', remoto: 'Remoto', hibrido: 'Híbrido' };
const CONTRATO_LABELS = { completo: 'Tiempo completo', medio: 'Medio tiempo', temporal: 'Temporal', freelance: 'Freelance' };
const EXP_LABELS      = { junior: 'Junior', mid: 'Semi senior', senior: 'Senior', lead: 'Lead' };

function buildLogoUrl(ruta) {
  if (!ruta) return null;
  if (ruta.startsWith('http')) return ruta;
  return `${BACKEND_URL}${ruta}`;
}

function formatFecha(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const diff = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  if (diff < 7)   return `Hace ${diff} días`;
  return d.toLocaleDateString('es-SV', { month: 'short', day: 'numeric' });
}

function formatSalario(min, max) {
  if (!min && !max) return null;
  const fmt = (n) =>
    Number(n).toLocaleString('es-SV', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min)        return `Desde ${fmt(min)}`;
  return          `Hasta ${fmt(max)}`;
}

function Chip({ children, color = 'gray' }) {
  const cls = {
    blue:  'bg-blue-50 text-[#1A56DB] border-blue-100',
    green: 'bg-green-50 text-[#10B981] border-green-100',
    gray:  'bg-gray-100 text-gray-600 border-gray-200',
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls[color] ?? cls.gray}`}>
      {children}
    </span>
  );
}

function EmpresaAvatar({ logoRuta, empresa }) {
  const [imgError, setImgError] = useState(false);
  const src = buildLogoUrl(logoRuta);

  const initials = (empresa ?? '')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase() || '?';

  if (src && !imgError) {
    return (
      <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 mt-0.5 bg-white">
        <img
          src={src}
          alt={empresa}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1A56DB] to-blue-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
      {initials}
    </div>
  );
}

export default function VacanteCard({ vacante }) {
  const empresa  = vacante.company?.nombre  ?? vacante.empresa_nombre ?? '—';
  const logoRuta = vacante.company?.logoUrl ?? vacante.empresa_logo   ?? null;
  const salario  = formatSalario(
    vacante.salarioMin  ?? vacante.salario_min,
    vacante.salarioMax  ?? vacante.salario_max,
  );
  const tipo     = vacante.tipoTrabajo  ?? vacante.tipo_trabajo  ?? '';
  const contrato = vacante.tipoContrato ?? vacante.tipo_contrato ?? '';
  const exp      = vacante.experiencia  ?? '';
  const fecha    = vacante.createdAt    ?? vacante.created_at    ?? null;

  return (
    <Link
      to={`/vacante/${vacante.id}`}
      className="group flex items-start gap-4 bg-white border border-gray-200 rounded-2xl px-5 py-4 hover:border-[#1A56DB]/40 hover:shadow-md transition-all duration-200"
    >
      <EmpresaAvatar logoRuta={logoRuta} empresa={empresa} />

      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
          <div className="min-w-0">
            <h2 className="font-semibold text-[#111827] text-base group-hover:text-[#1A56DB] transition-colors leading-snug truncate">
              {vacante.titulo}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5 truncate">{empresa}</p>
          </div>
          <span className="text-xs text-gray-400 shrink-0 sm:mt-0.5 whitespace-nowrap">
            {formatFecha(fecha)}
          </span>
        </div>

        {vacante.ubicacion && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0z" />
            </svg>
            <span className="truncate">{vacante.ubicacion}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-3">
          {tipo     && <Chip color="blue">{TIPO_LABELS[tipo]         ?? tipo}</Chip>}
          {contrato && <Chip color="gray">{CONTRATO_LABELS[contrato] ?? contrato}</Chip>}
          {exp      && <Chip color="gray">{EXP_LABELS[exp]           ?? exp}</Chip>}
          {salario  && <Chip color="green">{salario}</Chip>}
        </div>
      </div>

      <svg className="w-5 h-5 text-gray-300 group-hover:text-[#1A56DB] transition-colors shrink-0 mt-1 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </Link>
  );
}
