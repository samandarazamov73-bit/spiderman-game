import { Type, Pilcrow, Box, Sparkles, Globe, RotateCw, Download } from 'lucide-react'

const ITEMS = [
  { id: 'text', label: 'Text', icon: Type },
  { id: 'typography', label: 'Typography', icon: Pilcrow },
  { id: 'geometry', label: 'Geometry', icon: Box },
  { id: 'material', label: 'Material', icon: Sparkles },
  { id: 'environment', label: 'Environment', icon: Globe },
  { id: 'animation', label: 'Animation', icon: RotateCw },
  { id: 'export', label: 'Export', icon: Download },
]

/**
 * Decorative left tool rail — gives the app a Figma/Spline-style feel and
 * acts as a quick visual index of the property sections on the right.
 */
export function LeftRail() {
  return (
    <aside className="w-12 shrink-0 bg-ink-800 border-r border-ink-400/15 flex flex-col items-center py-2 gap-1">
      {ITEMS.map((it) => (
        <button
          key={it.id}
          title={it.label}
          className="w-9 h-9 rounded-md flex items-center justify-center text-ink-200 hover:text-ink-50 hover:bg-ink-700 transition-colors"
        >
          <it.icon size={15} />
        </button>
      ))}
      <div className="flex-1" />
      <div className="w-6 h-px bg-ink-400/30 my-1" />
      <div className="text-[9px] font-mono text-ink-200 -rotate-90 my-2 tracking-wider">
        v0.1
      </div>
    </aside>
  )
}
