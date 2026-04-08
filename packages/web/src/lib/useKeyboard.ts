import { useEffect } from 'react'

type KeyHandler = (e: KeyboardEvent) => void

export function useKeyboard(handlers: Record<string, KeyHandler>) {
  useEffect(() => {
    let gBuffer = ''

    const handle = (e: KeyboardEvent) => {
      // Skip when typing in inputs
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      const key = [e.metaKey && 'Meta', e.ctrlKey && 'Ctrl', e.key]
        .filter(Boolean)
        .join('+')

      const handler = handlers[key]
      if (handler) {
        e.preventDefault()
        handler(e)
        gBuffer = ''
        return
      }

      // G-prefix chords (e.g. "G I" = go to issues)
      if (gBuffer === 'g' && e.key !== 'g') {
        const chord = `g+${e.key.toLowerCase()}`
        const chordHandler = handlers[chord]
        if (chordHandler) {
          e.preventDefault()
          chordHandler(e)
        }
        gBuffer = ''
        return
      }

      if (e.key === 'g') {
        gBuffer = 'g'
        setTimeout(() => { gBuffer = '' }, 1000)
      } else {
        gBuffer = ''
      }
    }

    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [handlers])
}
