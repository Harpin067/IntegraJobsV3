import StarRating from './StarRating';

const fmt = new Intl.DateTimeFormat('es', { dateStyle: 'medium' });

function Iniciales({ nombre }) {
  const partes  = (nombre ?? 'A').trim().split(' ');
  const letras  = partes.length >= 2
    ? partes[0][0] + partes[1][0]
    : partes[0].slice(0, 2);

  return (
    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 uppercase">
      {letras}
    </div>
  );
}

export default function ReviewList({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return (
      <p className="text-sm text-gray-400">
        Esta empresa aún no tiene reseñas aprobadas.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {reviews.map((r) => (
        <li key={r.id} className="flex gap-3">
          <Iniciales nombre={r.candidato?.nombre ?? r.autor?.nombre} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <span className="text-sm font-medium text-text">
                {r.candidato?.nombre ?? r.autor?.nombre ?? 'Anónimo'}
              </span>
              <span className="text-xs text-gray-400">
                {fmt.format(new Date(r.creadoEn ?? r.createdAt))}
              </span>
            </div>

            <StarRating rating={r.rating} readOnly />

            {r.comentario && (
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                {r.comentario}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
