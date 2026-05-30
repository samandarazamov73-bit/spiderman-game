import { Type } from 'lucide-react'
import { Section } from '../ui/Section'
import { TextArea } from '../ui/TextArea'
import { useStore } from '../../store/useStore'

export function TextPanel() {
  const text = useStore((s) => s.text)
  const set = useStore((s) => s.set)
  return (
    <Section title="Text" icon={Type}>
      <TextArea
        value={text}
        onChange={(v) => set({ text: v })}
        placeholder="Type to sculpt…"
        rows={3}
      />
      <div className="flex items-center justify-between text-[10px] text-ink-200">
        <span className="font-mono">{text.length} chars</span>
        <span className="flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-emerald-400" />
          Live update
        </span>
      </div>
    </Section>
  )
}
