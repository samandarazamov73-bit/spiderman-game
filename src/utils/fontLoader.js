import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader.js'

/**
 * Loads a user-uploaded font file and returns a parsed three.js Font instance.
 * Supported formats:
 *   - .json (Three.js typeface JSON)
 *   - .ttf  (TrueType, parsed via TTFLoader + opentype.js)
 *   - .otf  (OpenType — only works for fonts that decompose to TTF outlines)
 */
export async function loadFontFromFile(file) {
  const ext = (file.name.split('.').pop() || '').toLowerCase()
  const buffer = await file.arrayBuffer()

  if (ext === 'json' || file.type === 'application/json') {
    const json = JSON.parse(new TextDecoder().decode(buffer))
    return new FontLoader().parse(json)
  }

  if (ext === 'ttf' || ext === 'otf') {
    const ttfLoader = new TTFLoader()
    const json = ttfLoader.parse(buffer)
    return new FontLoader().parse(json)
  }

  throw new Error(`Unsupported font format: .${ext}`)
}
