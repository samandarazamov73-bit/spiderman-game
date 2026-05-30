export function TextArea({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div className="space-y-1.5">
      {label && <span className="text-[11px] text-ink-100">{label}</span>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 input-base resize-none font-mono leading-relaxed"
        spellCheck={false}
      />
    </div>
  )
}
