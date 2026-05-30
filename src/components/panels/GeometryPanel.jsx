import { Box } from 'lucide-react'
import { Section } from '../ui/Section'
import { Slider } from '../ui/Slider'
import { Toggle } from '../ui/Toggle'
import { useStore } from '../../store/useStore'

export function GeometryPanel() {
  const depth = useStore((s) => s.depth)
  const curveSegments = useStore((s) => s.curveSegments)
  const bevelEnabled = useStore((s) => s.bevelEnabled)
  const bevelThickness = useStore((s) => s.bevelThickness)
  const bevelSize = useStore((s) => s.bevelSize)
  const bevelSegments = useStore((s) => s.bevelSegments)
  const set = useStore((s) => s.set)

  return (
    <Section title="Geometry" icon={Box}>
      <Slider
        label="Depth"
        value={depth}
        onChange={(v) => set({ depth: v })}
        min={0.01}
        max={2}
        step={0.01}
      />
      <Slider
        label="Curve Segments"
        value={curveSegments}
        onChange={(v) => set({ curveSegments: Math.round(v) })}
        min={2}
        max={32}
        step={1}
        format={(v) => Math.round(v).toString()}
      />

      <div className="pt-2 border-t border-ink-400/10" />

      <Toggle
        label="Bevel"
        value={bevelEnabled}
        onChange={(v) => set({ bevelEnabled: v })}
        hint="Rounded edges"
      />
      {bevelEnabled && (
        <>
          <Slider
            label="Bevel Thickness"
            value={bevelThickness}
            onChange={(v) => set({ bevelThickness: v })}
            min={0}
            max={0.3}
            step={0.005}
          />
          <Slider
            label="Bevel Size"
            value={bevelSize}
            onChange={(v) => set({ bevelSize: v })}
            min={0}
            max={0.2}
            step={0.005}
          />
          <Slider
            label="Bevel Segments"
            value={bevelSegments}
            onChange={(v) => set({ bevelSegments: Math.round(v) })}
            min={1}
            max={16}
            step={1}
            format={(v) => Math.round(v).toString()}
          />
        </>
      )}
    </Section>
  )
}
