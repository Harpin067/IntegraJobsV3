export default function Input({
  label,
  id,
  error,
  className = '',
  ...props
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-text">
          {label}
        </label>
      )}
      <input
        id={id}
        className={[
          'w-full border rounded-lg px-3 py-2 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-primary',
          error ? 'border-danger' : 'border-gray-300',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
