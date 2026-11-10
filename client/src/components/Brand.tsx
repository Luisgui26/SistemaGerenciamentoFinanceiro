export function Brand() {
  return (
    <div className="brand" aria-label="Finanças em família">
      <span className="brand-mark" aria-hidden="true">
        <svg
          width="23"
          height="23"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 10.5 12 4l8 6.5V20H4z" />
          <path d="M9 20v-7h6v7M8 9h.01M16 9h.01" />
        </svg>
      </span>
      <span>
        finanças<small>em família</small>
      </span>
    </div>
  );
}
