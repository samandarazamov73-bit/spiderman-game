import { Sparkles } from 'lucide-react'
import { Section } from '../ui/Section'
import { Slider } from '../ui/Slider'
import { ColorInput } from '../ui/ColorInput'
import { useStore } from '../../store/useStore'

const PRESETS = [
  {
    name: 'Matte Clay',
    swatch: '#d6c8b8',
    vals: {
      color: '#d6c8b8',
      roughness: 0.85,
      metalness: 0.0,
      clearcoat: 0.0,
      clearcoatRoughness: 0.5,
      reflectivity: 0.2,
    },
  },
  {
    name: 'Glossy Plastic',
    swatch: '#e74c3c',
    vals: {
      color: '#e74c3c',
      roughness: 0.25,
      metalness: 0.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      reflectivity: 0.55,
    },
  },
  {
    name: 'Polished Metal',
    swatch: '#c8c8c8',
    vals: {
      color: '#c8c8c8',
      roughness: 0.12,
      metalness: 1.0,
      clearcoat: 0.4,
      clearcoatRoughness: 0.1,
      reflectivity: 1.0,
    },
  },
  {
    name: 'Liquid Gold',
    swatch: '#ffb740',
    vals: {
      color: '#ffb740',
      roughness: 0.18,
      metalness: 1.0,
      clearcoat: 0.6,
      clearcoatRoughness: 0.08,
      reflectivity: 1.0,
    },
  },
  {
    name: 'Soft Velvet',
    swatch: '#6e3bb3',
    vals: {
      color: '#6e3bb3',
      roughness: 0.95,
      metalness: 0.0,
      clearcoat: 0.0,
      clearcoatRoughness: 0.5,
      reflectivity: 0.15,
    },
  },
  {
    name: 'Glass Candy',
    swatch: '#7dd3fc',
    vals: {
      color: '#7dd3fc',
      roughness: 0.05,
      metalness: 0.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      reflectivity: 0.9,
    },
  },
]

export function MaterialPanel() {
  const color = useStore((s) => s.color)
  const roughness = useStore((s) => s.roughness)
  const metalness = useStore((s) => s.metalness)
  const clearcoat = useStore((s) => s.clearcoat)
  const clearcoatRoughness = useStore((s) => s.clearcoatRoughness)
  const reflectivity = useStore((s) => s.reflectivity)
  const set = useStore((s) => s.set)

  return (
    <Section title="Material" icon={Sparkles}>
      <ColorInput
        label="Color"
        value={color}
        onChange={(v) => set({ color: v })}
      />
      <Slider
        label="Roughness"
        value={roughness}
        onChange={(v) => set({ roughness: v })}
        min={0}
        max={1}
        step={0.01}
      />
      <Slider
        label="Metalness"
        value={metalness}
        onChange={(v) => set({ metalness: v })}
        min={0}
        max={1}
        step={0.01}
      />
      <Slider
        label="Clearcoat"
        value={clearcoat}
        onChange={(v) => set({ clearcoat: v })}
        min={0}
        max={1}
        step={0.01}
      />
      <Slider
        label="Clearcoat Rough."
        value={clearcoatRoughness}
        onChange={(v) => set({ clearcoatRoughness: v })}
        min={0}
        max={1}
        step={0.01}
      />
      <Slider
        label="Reflectivity"
        value={reflectivity}
        onChange={(v) => set({ reflectivity: v })}
        min={0}
        max={1}
        step={0.01}
      />

      <div className="pt-2 border-t border-ink-400/10 space-y-2">
        <span className="text-[10px] text-ink-200 uppercase tracking-wider">
          Material Presets
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => set(p.vals)}
              className="group flex items-center gap-2 px-2 py-1.5 text-[10px] text-ink-100 bg-ink-700 hover:bg-ink-600 hover:text-ink-50 border border-ink-400/20 rounded-md transition-colors text-left"
            >
              <span
                className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                style={{ background: p.swatch }}
              />
              <span className="truncate">{p.name}</span>
            </button>
          ))}
        </div>
      </div>
    </Section>
  )
}
