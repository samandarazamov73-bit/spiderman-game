import { Topbar } from './components/Topbar'
import { LeftRail } from './components/LeftRail'
import { ControlPanel } from './components/ControlPanel'
import { Viewport } from './components/Viewport'

export default function App() {
  return (
    <div className="h-full w-full flex flex-col bg-ink-900 text-ink-50">
      <Topbar />
      <div className="flex-1 flex min-h-0">
        <LeftRail />
        <Viewport />
        <ControlPanel />
      </div>
    </div>
  )
}
