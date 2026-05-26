import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useHiloDetalle } from '../../hooks/useForos';
import Button from '../../components/ui/Button';

const fmtFecha = new Intl.DateTimeFormat('es', { dateStyle: 'long', timeStyle: 'short' });

function Prose({ texto }) {
  return (
    <div className="text-sm text-text leading-relaxed space-y-2">
      {texto.split('\n').map((linea, i) => (
        <p key={i}>{linea}</p>
      ))}
    </div>
  );
}

function TarjetaAutor({ nombre, fecha, pending }) {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-400">
      <span className="font-medium text-gray-600">{nombre ?? 'Anónimo'}</span>
      <span>·</span>
      <span>{fmtFecha.format(new Date(fecha))}</span>
      {pending && <span className="text-primary italic">enviando…</span>}
    </div>
  );
}

export default function HiloDetallePage() {
  const { id }                               = useParams();
  const { isAuthenticated, user }            = useAuth();
  const { hilo, loading, error, crearRespuesta } = useHiloDetalle(id);

  const [contenido, setContenido] = useState('');
  const [errReply,  setErrReply]  = useState('');
  const [sending,   setSending]   = useState(false);

  async function handleRespuesta(e) {
    e.preventDefault();
    if (!contenido.trim()) {
      setErrReply('La respuesta no puede estar vacía.');
      return;
    }
    setErrReply('');
    setSending(true);
    try {
      await crearRespuesta(contenido.trim());
      setContenido('');
    } catch (err) {
      setErrReply(err.message ?? 'No se pudo enviar la respuesta.');
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-100 rounded w-1/4" />
        <div className="h-24 bg-gray-100 rounded" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-danger text-sm">{error}</p>
        <Link to="/foros" className="text-primary text-sm hover:underline mt-2 inline-block">
          ← Volver al foro
        </Link>
      </div>
    );
  }

  if (!hilo) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Navegación */}
        <Link to="/foros" className="text-sm text-primary hover:underline">
          ← Volver al foro
        </Link>

        {/* Hilo principal */}
        <article className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
          {hilo.categoria && (
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              {hilo.categoria.nombre}
            </span>
          )}
          <h1 className="text-xl font-semibold text-text">{hilo.titulo}</h1>
          <TarjetaAutor nombre={hilo.autor?.nombre} fecha={hilo.creadoEn} />
          <Prose texto={hilo.contenido} />
        </article>

        {/* Respuestas */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            {(hilo.respuestas?.length ?? 0) === 0
              ? 'Sin respuestas todavía'
              : `${hilo.respuestas.length} respuesta${hilo.respuestas.length !== 1 ? 's' : ''}`}
          </h2>

          <ul className="space-y-3">
            {(hilo.respuestas ?? []).map((r) => (
              <li
                key={r.id}
                className={[
                  'bg-white rounded-xl border p-4 space-y-2',
                  r._pending ? 'border-primary/30 opacity-70' : 'border-gray-100',
                ].join(' ')}
              >
                <TarjetaAutor
                  nombre={r.autor?.nombre ?? user?.nombre}
                  fecha={r.creadoEn}
                  pending={r._pending}
                />
                <Prose texto={r.contenido} />
              </li>
            ))}
          </ul>
        </section>

        {/* Formulario de respuesta */}
        {isAuthenticated ? (
          <section className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-text mb-3">Tu respuesta</h3>
            <form onSubmit={handleRespuesta} noValidate className="space-y-3">
              <textarea
                rows={4}
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                placeholder="Escribe tu respuesta…"
                className={[
                  'w-full border rounded-lg px-3 py-2 text-sm resize-none',
                  'focus:outline-none focus:ring-2 focus:ring-primary',
                  errReply ? 'border-danger' : 'border-gray-300',
                ].join(' ')}
              />
              {errReply && (
                <p role="alert" className="text-xs text-danger">{errReply}</p>
              )}
              <div className="flex justify-end">
                <Button type="submit" isLoading={sending}>
                  Publicar respuesta
                </Button>
              </div>
            </form>
          </section>
        ) : (
          <p className="text-sm text-gray-500 text-center">
            <Link to="/login" className="text-primary font-medium hover:underline">
              Inicia sesión
            </Link>{' '}
            para dejar una respuesta.
          </p>
        )}
      </div>
    </div>
  );
}
