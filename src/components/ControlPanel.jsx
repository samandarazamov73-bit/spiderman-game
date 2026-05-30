import { TextPanel } from './panels/TextPanel'
import { TypographyPanel } from './panels/TypographyPanel'
import { GeometryPanel } from './panels/GeometryPanel'
import { MaterialPanel } from './panels/MaterialPanel'
import { EnvironmentPanel } from './panels/EnvironmentPanel'
import { AnimationPanel } from './panels/AnimationPanel'
import { ExportPanel } from './panels/ExportPanel'
import { Sliders } from 'lucide-react'

export function ControlPanel() {
  return (
    <aside className="w-[320px] shrink-0 bg-ink-800 border-l border-ink-400/15 flex flex-col">
      <div className="px-4 py-3 border-b border-ink-400/15 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders size={13} className="text-accent" />
          <h2 className="text-xs font-semibold text-ink-50 tracking-wide">
            Properties
          </h2>
        </div>
        <span className="text-[10px] text-ink-200 font-mono">v0.1</span>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <TextPanel />
        <TypographyPanel />
        <GeometryPanel />
        <MaterialPanel />
        <EnvironmentPanel />
        <AnimationPanel />
        <ExportPanel />
      </div>
      <div className="px-4 py-2 border-t border-ink-400/15 text-[10px] text-ink-200 font-mono flex items-center justify-between">
        <span>WebGL · PBR</span>
        <span className="flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-emerald-400" /> Connected
        </span>
      </div>
    </aside>
  )
}
