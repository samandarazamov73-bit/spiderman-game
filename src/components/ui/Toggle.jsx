export function Toggle({ label, value, onChange, hint }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-col min-w-0">
        <span className="text-[11px] text-ink-100 truncate">{label}</span>
        {hint && (
          <span className="text-[10px] text-ink-200 truncate">{hint}</span>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative shrink-0 rounded-full transition-colors duration-150 ${
          value ? 'bg-accent' : 'bg-ink-500'
        }`}
        style={{ width: 30, height: 17 }}
      >
        <span
          className="absolute top-[2px] left-[2px] bg-white rounded-full transition-transform duration-150"
          style={{
            width: 13,
            height: 13,
            transform: value ? 'translateX(13px)' : 'translateX(0)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.4)',
          }}
        />
      </button>
    </div>
  )
}
