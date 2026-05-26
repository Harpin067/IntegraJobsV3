import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBusquedaVacantes } from '../../hooks/useBusquedaVacantes';
import { useAuth } from '../../context/AuthContext';
import useReviews from '../../hooks/useReviews';
import StarRating from '../../components/shared/StarRating';
import ReviewList from '../../components/shared/ReviewList';

const BACKEND_URL =
  (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api').replace(/\/api$/, '');

function buildLogoUrl(ruta) {
  if (!ruta) return null;
  if (ruta.startsWith('http')) return ruta;
  return `${BACKEND_URL}${ruta}`;
}

const MODALIDAD_LABELS = {
  presencial: 'Presencial',
  remoto:     'Remoto',
  hibrido:    'Híbrido',
};

const CONTRATO_LABELS = {
  completo:  'Tiempo completo',
  medio:     'Medio tiempo',
  temporal:  'Temporal',
  freelance: 'Freelance',
};

const EXPERIENCIA_LABELS = {
  junior: 'Junior (1–2 años)',
  mid:    'Semi-Senior (3–4 años)',
  senior: 'Senior (5+ años)',
  lead:   'Lead / Principal',
};

export default function VacanteDetallePage() {
  const { id }                            = useParams();
  const { user, isAuthenticated }         = useAuth();
  const { vacante, loading, error,
          fetchVacantePorId, postularse } = useBusquedaVacantes();
  const navigate                          = useNavigate();

  const [postulado,        setPostulado]        = useState(false);
  const [postulando,       setPostulando]        = useState(false);
  const [postulacionError, setPostulacionError] = useState(null);
  const [sinCvAlerta,      setSinCvAlerta]      = useState(false);
  const [logoError,        setLogoError]        = useState(false);

  const { reviews, promedio, loading: loadingReviews, fetchReviews, crearReview } = useReviews();
  const [reviewForm,    setReviewForm]    = useState({ rating: 0, comentario: '' });
  const [reviewError,   setReviewError]   = useState('');
  const [reviewSending, setReviewSending] = useState(false);
  const [reviewEnviada, setReviewEnviada] = useState(false);

  const companyId = vacante?.companyId ?? vacante?.company?.id;

  useEffect(() => { fetchVacantePorId(id); }, [id, fetchVacantePorId]);
  useEffect(() => { if (companyId) fetchReviews(companyId); }, [companyId, fetchReviews]);

  async function handlePostularse() {
    // Bloquear postulación si el candidato no tiene CV
    if (!user?.cvUrl && !user?.cv_url) {
      setSinCvAlerta(true);
      return;
    }
    setSinCvAlerta(false);
    setPostulando(true);
    setPostulacionError(null);
    try {
      await postularse(id);
      setPostulado(true);
    } catch (err) {
      setPostulacionError(err.message ?? 'No se pudo completar la postulación');
    } finally {
      setPostulando(false);
    }
  }

  async function handleSubmitReview(e) {
    e.preventDefault();
    if (reviewForm.rating === 0) {
      setReviewError('Selecciona una calificación de 1 a 5 estrellas.');
      return;
    }
    setReviewError('');
    setReviewSending(true);
    try {
      await crearReview(companyId, reviewForm);
      setReviewEnviada(true);
    } catch (err) {
      setReviewError(err.message ?? 'No se pudo enviar la reseña.');
    } finally {
      setReviewSending(false);
    }
  }

  if (loading) return <SkeletonDetalle />;

  if (error || !vacante) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
          <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-700">{error ?? 'Vacante no encontrada'}</p>
        <Link to="/busqueda" className="text-sm text-[#1A56DB] hover:underline">
          Volver a la búsqueda
        </Link>
      </div>
    );
  }

  const empresa   = vacante?.company?.nombre  ?? '—';
  const logoRuta  = vacante?.company?.logoUrl ?? vacante?.company?.logo_url ?? null;
  const logoSrc   = buildLogoUrl(logoRuta);
  const salario  = formatSalario(vacante?.salarioMin ?? vacante?.salario_min, vacante?.salarioMax ?? vacante?.salario_max);
  const modalidad = vacante.tipoTrabajo  ?? vacante.tipo_trabajo;
  const contrato  = vacante.tipoContrato ?? vacante.tipo_contrato;
  const exp       = vacante.experiencia;
  const fechaPublicacion = vacante.createdAt ?? vacante.created_at;

  return (
    <div className="min-h-screen bg-[#F9FAFB]">

      {/* Top nav */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <Link to="/" className="shrink-0">
            <img src="/logo.png" alt="IntegraJobs" className="h-7 w-auto object-contain" />
          </Link>
          <span className="text-gray-300 text-lg">/</span>
          <Link
            to="/busqueda"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1A56DB] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Resultados de búsqueda
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">

          {/* ── Columna principal (70%) ── */}
          <div className="min-w-0 space-y-6">

            {/* Cabecera de la vacante */}
            <div className="bg-white border border-gray-200 rounded-2xl px-6 py-6">
              <div className="flex items-start gap-4">
                {/* Logo / Iniciales */}
                {logoSrc && !logoError ? (
                  <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-100 bg-white shrink-0">
                    <img
                      src={logoSrc}
                      alt={empresa}
                      className="w-full h-full object-contain"
                      onError={() => setLogoError(true)}
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1A56DB] to-[#1048c8] flex items-center justify-center shrink-0">
                    <span className="text-white text-lg font-bold leading-none">
                      {empresa.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                    {vacante.titulo}
                  </h1>
                  <p className="text-base text-slate-500 mt-1 font-medium">{empresa}</p>
                </div>
              </div>

              {/* Pills de metadatos */}
              <div className="flex flex-wrap gap-2 mt-5">
                {vacante.ubicacion && (
                  <Pill icon={<IconUbicacion />}>{vacante.ubicacion}</Pill>
                )}
                {modalidad && (
                  <Pill icon={<IconModalidad />}>
                    {MODALIDAD_LABELS[modalidad] ?? modalidad}
                  </Pill>
                )}
                {contrato && (
                  <Pill icon={<IconContrato />}>
                    {CONTRATO_LABELS[contrato] ?? contrato}
                  </Pill>
                )}
                {exp && (
                  <Pill icon={<IconExp />}>
                    {EXPERIENCIA_LABELS[exp] ?? exp}
                  </Pill>
                )}
                {salario && (
                  <Pill icon={<IconSalario />} highlight>{salario}</Pill>
                )}
              </div>
            </div>

            {/* Descripción */}
            {vacante.descripcion && (
              <ContentCard title="Descripción del puesto">
                <Prose text={vacante.descripcion} />
              </ContentCard>
            )}

            {/* Requisitos */}
            {vacante.requisitos && (
              <ContentCard title="Requisitos">
                <Prose text={vacante.requisitos} />
              </ContentCard>
            )}

            {/* Reseñas */}
            <ContentCard
              title={
                promedio
                  ? `Reseñas de la empresa · ${Number(promedio).toFixed(1)} ★`
                  : 'Reseñas de la empresa'
              }
            >
              {loadingReviews ? (
                <div className="space-y-3 animate-pulse">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-1/3" />
                        <div className="h-3 bg-gray-100 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <ReviewList reviews={reviews} />
              )}

              {isAuthenticated && user?.role === 'CANDIDATO' && companyId && (
                <div className="mt-6 pt-5 border-t border-gray-100">
                  {reviewEnviada ? (
                    <div className="flex items-center gap-2 text-sm text-[#10B981] bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Tu reseña fue enviada y está pendiente de moderación.
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitReview} noValidate className="space-y-3">
                      <h3 className="text-sm font-semibold text-slate-800">Deja tu valoración</h3>
                      <div className="flex items-center gap-3">
                        <StarRating
                          rating={reviewForm.rating}
                          readOnly={false}
                          onChange={(n) => setReviewForm((prev) => ({ ...prev, rating: n }))}
                        />
                        {reviewForm.rating > 0 && (
                          <span className="text-xs text-gray-400">{reviewForm.rating} / 5</span>
                        )}
                      </div>
                      <textarea
                        rows={3}
                        placeholder="Comparte tu experiencia con esta empresa (opcional)…"
                        value={reviewForm.comentario}
                        onChange={(e) => setReviewForm((p) => ({ ...p, comentario: e.target.value }))}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB] resize-none"
                      />
                      {reviewError && <p role="alert" className="text-xs text-red-500">{reviewError}</p>}
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={reviewSending}
                          className="bg-[#1A56DB] text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          {reviewSending ? 'Enviando…' : 'Enviar reseña'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </ContentCard>
          </div>

          {/* ── Columna lateral (30%) — CTA sticky ── */}
          <aside>
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sticky top-20 space-y-5">

              {/* Fecha */}
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">
                  Fecha de publicación
                </p>
                <p className="text-sm font-semibold text-slate-800">
                  {formatFecha(fechaPublicacion)}
                </p>
              </div>

              {/* Empresa resumida */}
              <div className="pb-4 border-b border-gray-100">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">
                  Empresa
                </p>
                <p className="text-sm font-semibold text-slate-800">{empresa}</p>
                {vacante.company?.ubicacion && (
                  <p className="text-xs text-gray-500 mt-0.5">{vacante.company.ubicacion}</p>
                )}
                {vacante.company?.industria && (
                  <p className="text-xs text-gray-500">{vacante.company.industria}</p>
                )}
              </div>

              {/* Título */}
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">¿Te interesa esta oferta?</p>
                <p className="text-xs text-gray-400">
                  Postúlate y la empresa recibirá tu perfil directamente.
                </p>
              </div>

              {/* Botón CTA */}
              <PostulacionButton
                isAuthenticated={isAuthenticated}
                role={user?.role}
                tieneCv={!!(user?.cvUrl ?? user?.cv_url)}
                postulado={postulado}
                postulando={postulando}
                sinCvAlerta={sinCvAlerta}
                onPostularse={handlePostularse}
                onLogin={() =>
                  navigate('/login', { state: { from: { pathname: `/vacante/${id}` } } })
                }
              />

              {sinCvAlerta && (
                <div role="alert" className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2.5 rounded-xl">
                  <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <span>
                    Debes subir tu CV en tu perfil antes de postularte a esta vacante.
                  </span>
                </div>
              )}

              {postulacionError && !sinCvAlerta && (
                <p role="alert" className="text-xs text-red-500 text-center">
                  {postulacionError}
                </p>
              )}

              {/* Compartir */}
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(window.location.href)}
                className="w-full flex items-center justify-center gap-2 text-xs text-gray-500 border border-gray-200 rounded-lg py-2 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Copiar enlace
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Subcomponentes
────────────────────────────────────────────── */

function PostulacionButton({
  isAuthenticated, role, tieneCv, postulado, postulando,
  sinCvAlerta, onPostularse, onLogin,
}) {
  if (!isAuthenticated) {
    return (
      <button
        onClick={onLogin}
        className="w-full bg-[#1A56DB] text-white text-sm font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity"
      >
        Inicia sesión para postularte
      </button>
    );
  }

  if (role !== 'CANDIDATO') {
    return (
      <p className="text-xs text-gray-400 text-center py-2 bg-gray-50 rounded-lg">
        Solo candidatos pueden postularse
      </p>
    );
  }

  if (postulado) {
    return (
      <button
        disabled
        className="w-full bg-[#10B981] text-white text-sm font-semibold py-3 rounded-xl opacity-90 cursor-default flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Ya te has postulado
      </button>
    );
  }

  // Sin CV: mostrar botón rojo que lleva al perfil
  if (!tieneCv || sinCvAlerta) {
    return (
      <Link
        to="/candidato/perfil"
        className="w-full bg-amber-500 text-white text-sm font-semibold py-3 rounded-xl hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        Sube tu CV para postularte
      </Link>
    );
  }

  return (
    <button
      onClick={onPostularse}
      disabled={postulando}
      className="w-full bg-[#1A56DB] text-white text-sm font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
    >
      {postulando && (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {postulando ? 'Enviando postulación…' : 'Postularme ahora'}
    </button>
  );
}

function ContentCard({ title, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl px-6 py-5">
      <h2 className="text-base font-semibold text-slate-900 mb-4 pb-3 border-b border-gray-100">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Pill({ children, icon, highlight = false }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
        highlight
          ? 'bg-blue-50 text-[#1A56DB] border border-blue-100'
          : 'bg-gray-100 text-gray-600'
      }`}
    >
      {icon && <span className="opacity-70">{icon}</span>}
      {children}
    </span>
  );
}

function Prose({ text }) {
  return (
    <div className="space-y-2">
      {text.split('\n').map((line, i) =>
        line.trim() ? (
          <p key={i} className="text-sm text-slate-700 leading-relaxed">{line}</p>
        ) : (
          <br key={i} />
        )
      )}
    </div>
  );
}

function SkeletonDetalle() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="bg-white border-b border-gray-200 h-12" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 animate-pulse">
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl px-6 py-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-7 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
              <div className="flex gap-2 mt-5">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-6 w-24 bg-gray-100 rounded-full" />
                ))}
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl px-6 py-5 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-3 bg-gray-100 rounded" />
              <div className="h-3 bg-gray-100 rounded w-5/6" />
              <div className="h-3 bg-gray-100 rounded w-4/6" />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 h-56" />
        </div>
      </div>
    </div>
  );
}

/* ── Iconos inline ── */
function IconUbicacion() {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
function IconModalidad() {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}
function IconContrato() {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
function IconExp() {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}
function IconSalario() {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

/* ── Helpers ── */
function formatFecha(iso) {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('es-SV', {
    year: 'numeric', month: 'long', day: 'numeric',
  }).format(new Date(iso));
}

function formatSalario(min, max) {
  if (!min && !max) return null;
  const fmt = (n) =>
    new Intl.NumberFormat('es-SV', {
      style: 'currency', currency: 'USD', maximumFractionDigits: 0,
    }).format(Number(n));
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min)        return `Desde ${fmt(min)}`;
  return          `Hasta ${fmt(max)}`;
}
