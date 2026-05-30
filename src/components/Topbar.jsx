import { Zap, Camera, Github, RotateCcw } from 'lucide-react'
import { useStore } from '../store/useStore'

export function Topbar() {
  return (
    <header className="h-12 shrink-0 bg-ink-800 border-b border-ink-400/15 flex items-center px-3 gap-3 select-none">
      <div className="flex items-center gap-2.5 pr-3">
        <div className="w-7 h-7 rounded-md bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center shadow-glow">
          <Zap size={14} className="text-white" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-xs font-bold text-ink-50">3D Text Studio</span>
          <span className="text-[10px] text-ink-200">by Kiro</span>
        </div>
      </div>

      <div className="h-5 w-px bg-ink-400/30" />

      <nav className="flex items-center gap-0.5 text-[11px]">
        <button className="px-2.5 py-1 text-ink-100 hover:text-ink-50 hover:bg-ink-700 rounded-md transition-colors">
          File
        </button>
        <button className="px-2.5 py-1 text-ink-100 hover:text-ink-50 hover:bg-ink-700 rounded-md transition-colors">
          Edit
        </button>
        <button className="px-2.5 py-1 text-ink-100 hover:text-ink-50 hover:bg-ink-700 rounded-md transition-colors">
          View
        </button>
        <button className="px-2.5 py-1 text-ink-100 hover:text-ink-50 hover:bg-ink-700 rounded-md transition-colors">
          Help
        </button>
      </nav>

      <div className="flex-1 flex items-center justify-center">
        <div className="px-3 py-1 bg-ink-700/60 border border-ink-400/20 rounded-md text-[11px] text-ink-100 font-mono flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Untitled — 3D Text Composition
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => useStore.getState().resetCamera?.()}
          className="btn btn-secondary px-2.5 py-1.5 gap-1.5"
          title="Reset camera"
        >
          <RotateCcw size={12} />
          <span className="hidden lg:inline">Reset Camera</span>
        </button>
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="btn btn-ghost px-2 py-1.5"
          title="View source"
        >
          <Github size={13} />
        </a>
        <button
          onClick={() => useStore.getState().exportPNG?.()}
          className="btn btn-primary px-3 py-1.5 gap-1.5"
        >
          <Camera size={13} />
          Export PNG
        </button>
      </div>
    </header>
  )
}
