import { Move3d, RotateCw, Maximize2 } from 'lucide-react'
import { Scene } from '../scene/Scene'
import { useStore } from '../store/useStore'

export function Viewport() {
  const autoRotate = useStore((s) => s.autoRotate)
  const set = useStore((s) => s.set)
  const text = useStore((s) => s.text)
  const fontId = useStore((s) => s.fontId)
  const customFontName = useStore((s) => s.customFontName)
  const envPreset = useStore((s) => s.envPreset)

  const fontLabel = fontId === 'custom' ? customFontName || 'Custom' : fontId
  const truncated = text.length > 24 ? text.slice(0, 24) + '…' : text

  return (
    <div className="relative flex-1 min-w-0 bg-ink-900 overflow-hidden viewport-grid-bg">
      <Scene />

      {/* Top HUD: view info chips */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 pointer-events-none">
        <Chip>Perspective · 32mm</Chip>
        <Chip>{fontLabel}</Chip>
        <Chip>HDRI: {envPreset}</Chip>
      </div>

      <div className="absolute top-3 right-3 flex items-center gap-1.5 pointer-events-none">
        <Chip mono>"{truncated || ' '}"</Chip>
      </div>

      {/* Bottom-left controls */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
        <button
          onClick={() => set({ autoRotate: !autoRotate })}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 backdrop-blur border rounded-md text-[10px] font-medium transition-colors ${
            autoRotate
              ? 'bg-accent/20 border-accent/50 text-accent'
              : 'bg-ink-800/80 border-ink-400/20 text-ink-100 hover:text-ink-50 hover:bg-ink-700/80'
          }`}
          title="Toggle auto-rotate"
        >
          <RotateCw
            size={12}
            className={autoRotate ? 'animate-spin' : ''}
            style={{ animationDuration: '3s' }}
          />
          Auto-rotate
        </button>
        <button
          onClick={() => useStore.getState().resetCamera?.()}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-ink-800/80 backdrop-blur border border-ink-400/20 text-ink-100 hover:text-ink-50 hover:bg-ink-700/80 rounded-md text-[10px] font-medium transition-colors"
        >
          <Maximize2 size={12} />
          Frame
        </button>
      </div>

      {/* Bottom-right help */}
      <div className="absolute bottom-3 right-3 flex items-center gap-2 text-[10px] text-ink-200 font-mono pointer-events-none">
        <Move3d size={12} />
        <span className="hidden md:inline">
          Drag to orbit · Scroll to zoom · Right-click to pan
        </span>
        <span className="md:hidden">Drag · Zoom · Pan</span>
      </div>

      {/* Subtle vignette overlay for depth */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.45)_100%)]" />
    </div>
  )
}

function Chip({ children, mono = false }) {
  return (
    <div
      className={`px-2.5 py-1 bg-ink-800/80 backdrop-blur border border-ink-400/20 rounded-md text-[10px] text-ink-100 ${
        mono ? 'font-mono' : 'uppercase tracking-wider'
      }`}
    >
      {children}
    </div>
  )
}
