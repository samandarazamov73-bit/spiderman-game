import { useState } from 'react'
import { Pilcrow } from 'lucide-react'
import { Section } from '../ui/Section'
import { Select } from '../ui/Select'
import { Slider } from '../ui/Slider'
import { FileUpload } from '../ui/FileUpload'
import { useStore, DEFAULT_FONTS } from '../../store/useStore'
import { loadFontFromFile } from '../../utils/fontLoader'

export function TypographyPanel() {
  const fontId = useStore((s) => s.fontId)
  const customFontName = useStore((s) => s.customFontName)
  const size = useStore((s) => s.size)
  const set = useStore((s) => s.set)

  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleFile = async (file) => {
    setError(null)
    setLoading(true)
    try {
      const font = await loadFontFromFile(file)
      set({
        fontId: 'custom',
        customFontSource: font,
        customFontName: file.name,
      })
    } catch (e) {
      setError(e.message || 'Failed to load font')
    } finally {
      setLoading(false)
    }
  }

  const fontOptions = [
    ...DEFAULT_FONTS.map((f) => ({ value: f.id, label: f.name })),
    ...(customFontName
      ? [{ value: 'custom', label: `${customFontName} (Custom)` }]
      : []),
  ]

  return (
    <Section title="Typography" icon={Pilcrow}>
      <Select
        label="Font"
        value={fontId}
        onChange={(v) => set({ fontId: v })}
        options={fontOptions}
      />
      <FileUpload
        label="Custom Font"
        accept=".ttf,.otf,.json"
        onFile={handleFile}
        currentFileName={customFontName}
        loading={loading}
        hint="Supports .ttf, .otf, or three.js .json typeface"
      />
      {error && (
        <p className="text-[10px] text-red-400 leading-snug">
          {error}
        </p>
      )}
      <Slider
        label="Size"
        value={size}
        onChange={(v) => set({ size: v })}
        min={0.1}
        max={3}
        step={0.05}
      />
    </Section>
  )
}
