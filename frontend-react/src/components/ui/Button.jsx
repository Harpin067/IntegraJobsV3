import Spinner from './Spinner';

const VARIANTS = {
  primary:   'bg-primary   text-white hover:opacity-90',
  secondary: 'bg-secondary text-white hover:opacity-90',
  danger:    'bg-danger    text-white hover:opacity-90',
  outline:   'border border-gray-300 text-text hover:bg-gray-50',
  ghost:     'text-primary hover:underline',
};

const SIZES = {
  sm: 'px-3   py-1.5 text-xs',
  md: 'px-5   py-2   text-sm',
  lg: 'px-8   py-2.5 text-sm',
};

export default function Button({
  variant   = 'primary',
  size      = 'md',
  isLoading = false,
  disabled  = false,
  fullWidth = false,
  children,
  className = '',
  ...props
}) {
  return (
    <button
      disabled={disabled || isLoading}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium',
        'transition-opacity disabled:opacity-50',
        VARIANTS[variant] ?? VARIANTS.primary,
        SIZES[size]       ?? SIZES.md,
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {isLoading && <Spinner size="sm" />}
      {children}
    </button>
  );
}
