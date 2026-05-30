import { RotateCw } from 'lucide-react'
import { Section } from '../ui/Section'
import { Toggle } from '../ui/Toggle'
import { Slider } from '../ui/Slider'
import { useStore } from '../../store/useStore'

export function AnimationPanel() {
  const autoRotate = useStore((s) => s.autoRotate)
  const autoRotateSpeed = useStore((s) => s.autoRotateSpeed)
  const set = useStore((s) => s.set)
  return (
    <Section title="Animation" icon={RotateCw}>
      <Toggle
        label="Auto Rotate"
        value={autoRotate}
        onChange={(v) => set({ autoRotate: v })}
        hint="Spin on Y-axis"
      />
      {autoRotate && (
        <Slider
          label="Speed"
          value={autoRotateSpeed}
          onChange={(v) => set({ autoRotateSpeed: v })}
          min={0.1}
          max={5}
          step={0.1}
        />
      )}
    </Section>
  )
}
