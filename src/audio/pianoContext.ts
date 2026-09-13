import { createContext } from 'react'
import type { PianoAudio, PianoLoadProgress, PianoStatus } from './piano'

export type PianoContextValue = {
  audio: PianoAudio
  status: PianoStatus
  progress: PianoLoadProgress
  /** ユーザー操作の中から呼ぶと AudioContext を有効化する。 */
  unlock: () => void
}

export const PianoContext = createContext<PianoContextValue | null>(null)
