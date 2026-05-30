import { Globe } from 'lucide-react'
import { Section } from '../ui/Section'
import { Select } from '../ui/Select'
import { Slider } from '../ui/Slider'
import { ColorInput } from '../ui/ColorInput'
import { Toggle } from '../ui/Toggle'
import { useStore, ENV_PRESETS } from '../../store/useStore'

const BG_PRESETS = [
  '#0a0a0d',
  '#0e1014',
  '#1a1f2e',
  '#2c1b3a',
  '#f4f4f5',
  '#e8e6e3',
  '#5b21b6',
  '#0ea5e9',
]

export function EnvironmentPanel() {
  const background = useStore((s) => s.background)
  const envPreset = useStore((s) => s.envPreset)
  const envIntensity = useStore((s) => s.envIntensity)
  const showShadows = useStore((s) => s.showShadows)
  const set = useStore((s) => s.set)

  return (
    <Section title="Environment" icon={Globe}>
      <ColorInput
        label="Background"
        value={background}
        onChange={(v) => set({ background: v })}
      />
      <div className="flex items-center gap-1">
        {BG_PRESETS.map((c) => (
          <button
            key={c}
            onClick={() => set({ background: c })}
            className={`w-5 h-5 rounded-md border transition-transform hover:scale-110 ${
              background.toLowerCase() === c.toLowerCase()
                ? 'border-accent ring-1 ring-accent/40'
                : 'border-white/10'
            }`}
            style={{ background: c }}
            aria-label={`Background ${c}`}
          />
        ))}
      </div>

      <Select
        label="HDRI"
        value={envPreset}
        onChange={(v) => set({ envPreset: v })}
        options={ENV_PRESETS.map((p) => ({
          value: p,
          label: p[0].toUpperCase() + p.slice(1),
        }))}
      />
      <Slider
        label="Env Intensity"
        value={envIntensity}
        onChange={(v) => set({ envIntensity: v })}
        min={0}
        max={3}
        step={0.05}
      />
      <Toggle
        label="Contact Shadows"
        value={showShadows}
        onChange={(v) => set({ showShadows: v })}
        hint="Soft ground shadow under text"
      />
    </Section>
  )
}
