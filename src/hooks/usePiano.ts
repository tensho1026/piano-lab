import { useContext } from 'react'
import { PianoContext } from '../audio/pianoContext'
import type { PianoContextValue } from '../audio/pianoContext'

export function usePiano(): PianoContextValue {
  const value = useContext(PianoContext)
  if (!value) {
    throw new Error('usePiano は AudioProvider の内側で使ってください')
  }
  return value
}
