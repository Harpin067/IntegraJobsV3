import { useState } from 'react';

function StarIcon({ filled, half }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5"
      xmlns="http://www.w3.org/2000/svg"
    >
      {half ? (
        <>
          <defs>
            <linearGradient id="half-fill">
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#D1D5DB" />
            </linearGradient>
          </defs>
          <path
            fill="url(#half-fill)"
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          />
        </>
      ) : (
        <path
          fill={filled ? '#F59E0B' : '#D1D5DB'}
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        />
      )}
    </svg>
  );
}

export default function StarRating({ rating = 0, readOnly = true, onChange }) {
  const [hovered, setHovered] = useState(0);

  const displayed = readOnly ? rating : (hovered || rating);

  if (readOnly) {
    return (
      <div className="flex items-center gap-0.5" aria-label={`${rating} de 5 estrellas`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <StarIcon key={n} filled={n <= Math.round(displayed)} />
        ))}
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-0.5"
      role="radiogroup"
      aria-label="Calificación"
      onMouseLeave={() => setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={rating === n}
          aria-label={`${n} estrella${n !== 1 ? 's' : ''}`}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => setHovered(n)}
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
        >
          <StarIcon filled={n <= displayed} />
        </button>
      ))}
    </div>
  );
}
