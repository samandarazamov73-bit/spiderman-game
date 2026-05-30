export function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  format,
}) {
  const pct = ((value - min) / (max - min)) * 100
  const formatted = format ? format(value) : Number(value).toFixed(2)
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-ink-100 truncate">{label}</span>
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const v = parseFloat(e.target.value)
            if (!Number.isNaN(v)) onChange(v)
          }}
          className="w-16 px-2 py-0.5 text-[11px] tabular-nums text-right input-base"
          aria-label={label}
        />
      </div>
      <input
        type="range"
        className="range-pro"
        style={{ '--val': `${pct}%` }}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      <div className="flex justify-between text-[9px] text-ink-200/70 font-mono -mt-1">
        <span>{Number(min).toFixed(2)}</span>
        <span>{formatted}</span>
        <span>{Number(max).toFixed(2)}</span>
      </div>
    </div>
  )
}
