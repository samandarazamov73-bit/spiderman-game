export function ColorInput({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[11px] text-ink-100 truncate">{label}</span>
      <div className="flex items-center gap-1.5 bg-ink-700 border border-ink-400/30 rounded-md pl-1 pr-2 py-1">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-5 h-5 rounded-sm overflow-hidden"
          aria-label={`${label} color picker`}
        />
        <input
          type="text"
          value={value.toUpperCase()}
          onChange={(e) => {
            const v = e.target.value
            // accept any input as user types; only commit valid hex on blur
            onChange(v)
          }}
          onBlur={(e) => {
            if (!/^#([0-9a-f]{3}){1,2}$/i.test(e.target.value)) {
              onChange('#ffffff')
            }
          }}
          className="w-[68px] bg-transparent text-[11px] font-mono text-ink-50 focus:outline-none uppercase tracking-tight"
          spellCheck={false}
        />
      </div>
    </div>
  )
}
