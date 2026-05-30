import { Download, Camera, RotateCcw } from 'lucide-react'
import { Section } from '../ui/Section'
import { Button } from '../ui/Button'
import { useStore } from '../../store/useStore'

export function ExportPanel() {
  return (
    <Section title="Export & Reset" icon={Download}>
      <p className="text-[11px] text-ink-200 leading-relaxed">
        Capture the current viewport as a PNG image. The exported file matches
        the on-screen resolution (DPR-aware).
      </p>
      <div className="grid grid-cols-1 gap-1.5">
        <Button
          variant="primary"
          icon={Camera}
          onClick={() => useStore.getState().exportPNG?.()}
        >
          Export PNG
        </Button>
        <Button
          variant="secondary"
          icon={RotateCcw}
          onClick={() => {
            useStore.getState().resetCamera?.()
            useStore.getState().reset()
          }}
        >
          Reset All
        </Button>
      </div>
    </Section>
  )
}
