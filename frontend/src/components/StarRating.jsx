export default function StarRating({ value = 0, onChange, readonly = false, size }) {
  return (
    <span className="stars" style={size ? { fontSize: size } : undefined}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`star ${n <= value ? 'filled' : ''} ${readonly ? 'readonly' : ''}`}
          onClick={() => !readonly && onChange && onChange(n)}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </span>
  );
}
