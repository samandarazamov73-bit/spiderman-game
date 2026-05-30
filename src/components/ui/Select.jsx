import { ChevronDown } from 'lucide-react'

export function Select({ label, value, onChange, options }) {
  return (
    <div className="flex items-center justify-between gap-2">
      {label && (
        <span className="text-[11px] text-ink-100 shrink-0 truncate">
          {label}
        </span>
      )}
      <div className="relative flex-1 min-w-0 max-w-[200px]">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none input-base px-2.5 py-1.5 pr-7 truncate cursor-pointer"
        >
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-ink-700 text-ink-50"
            >
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={12}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-200 pointer-events-none"
        />
      </div>
    </div>
  )
}
