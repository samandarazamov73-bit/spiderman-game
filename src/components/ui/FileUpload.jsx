import { useRef } from 'react'
import { Upload } from 'lucide-react'

export function FileUpload({
  label,
  accept,
  onFile,
  currentFileName,
  hint,
  loading = false,
}) {
  const ref = useRef(null)
  return (
    <div className="space-y-1.5">
      {label && <span className="text-[11px] text-ink-100">{label}</span>}
      <button
        type="button"
        onClick={() => ref.current?.click()}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-ink-400/40 rounded-md text-[11px] text-ink-100 hover:border-accent/60 hover:text-ink-50 hover:bg-accent-subtle transition-colors disabled:opacity-50"
      >
        <Upload size={12} />
        <span className="truncate">
          {loading
            ? 'Loading…'
            : currentFileName || 'Click to upload font'}
        </span>
      </button>
      {hint && <p className="text-[10px] text-ink-200/80">{hint}</p>}
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFile(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
