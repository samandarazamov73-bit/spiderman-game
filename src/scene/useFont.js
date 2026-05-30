import { useEffect, useState } from 'react'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'

const cache = new Map()

/**
 * Hook that resolves a font source to a three.js Font instance.
 * `source` may be:
 *   - a URL string (will be fetched + parsed, with simple in-memory caching)
 *   - an already-parsed Font instance (returned as-is)
 *   - null/undefined (resolves to null)
 */
export function useFont(source) {
  const [font, setFont] = useState(() => {
    if (!source) return null
    if (typeof source !== 'string') return source
    return cache.get(source) || null
  })

  useEffect(() => {
    if (!source) {
      setFont(null)
      return
    }
    if (typeof source !== 'string') {
      setFont(source)
      return
    }
    if (cache.has(source)) {
      setFont(cache.get(source))
      return
    }

    let cancelled = false
    new FontLoader().load(
      source,
      (f) => {
        cache.set(source, f)
        if (!cancelled) setFont(f)
      },
      undefined,
      (err) => {
        // eslint-disable-next-line no-console
        console.error('Failed to load font:', source, err)
      },
    )
    return () => {
      cancelled = true
    }
  }, [source])

  return font
}
