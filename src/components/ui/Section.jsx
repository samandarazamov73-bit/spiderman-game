import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export function Section({
  title,
  icon: Icon,
  defaultOpen = true,
  children,
  meta,
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-ink-400/10 last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-ink-700/40 transition-colors group"
      >
        <div className="flex items-center gap-2">
          {Icon && (
            <Icon
              size={13}
              className="text-ink-200 group-hover:text-ink-50 transition-colors"
            />
          )}
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-100 group-hover:text-ink-50">
            {title}
          </span>
          {meta && (
            <span className="text-[10px] text-ink-200 font-mono">{meta}</span>
          )}
        </div>
        <ChevronDown
          size={13}
          className={`text-ink-200 transition-transform duration-150 ${
            open ? '' : '-rotate-90'
          }`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 space-y-3">{children}</div>
      )}
    </div>
  )
}
