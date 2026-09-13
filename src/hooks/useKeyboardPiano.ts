import { useEffect } from 'react'
import type { PianoNote } from '../types/music'

/** PC キーボード → 音名の割り当て（仕様書のマッピング）。 */
export const KEYBOARD_MAP: Record<string, PianoNote> = {
  a: 'C4',
  w: 'C#4',
  s: 'D4',
  e: 'D#4',
  d: 'E4',
  f: 'F4',
  t: 'F#4',
  g: 'G4',
  y: 'G#4',
  h: 'A4',
  u: 'A#4',
  j: 'B4',
  k: 'C5',
}

/** 音名 → キーラベル（鍵盤にキーを表示するため）。 */
export const NOTE_TO_KEY_LABEL: Record<string, string> = Object.fromEntries(
  Object.entries(KEYBOARD_MAP).map(([key, note]) => [note, key.toUpperCase()]),
)

type UseKeyboardPianoOptions = {
  onNoteOn: (note: PianoNote) => void
  onNoteOff: (note: PianoNote) => void
  enabled?: boolean
}

/**
 * PC キーボードでピアノを演奏できるようにする。
 * キーリピートは無視し、押しっぱなしの間だけ発音する。
 */
export function useKeyboardPiano({ onNoteOn, onNoteOff, enabled = true }: UseKeyboardPianoOptions) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return
      const note = KEYBOARD_MAP[event.key.toLowerCase()]
      if (!note) return
      event.preventDefault()
      onNoteOn(note)
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      const note = KEYBOARD_MAP[event.key.toLowerCase()]
      if (!note) return
      onNoteOff(note)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [enabled, onNoteOn, onNoteOff])
}
