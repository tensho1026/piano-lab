import { Note } from 'tonal'
import type { NoteName, PianoKeyInfo, PianoNote } from '../types/music'

export const NOTE_NAMES: readonly NoteName[] = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
]

export const WHITE_NOTE_NAMES: readonly NoteName[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

export const BLACK_NOTE_NAMES: readonly NoteName[] = ['C#', 'D#', 'F#', 'G#', 'A#']

/** MVP の鍵盤表示範囲。将来 88 鍵に広げる場合はここだけ変える。 */
export const KEYBOARD_LOWEST: PianoNote = 'C3'
export const KEYBOARD_HIGHEST: PianoNote = 'C6'

export function toMidi(note: string): number {
  const midi = Note.midi(note)
  if (midi === null) {
    throw new Error(`音名として解釈できません: ${note}`)
  }
  return midi
}

/** MIDI 番号を シャープ表記の音名に変換する（例: 61 -> "C#4"）。 */
export function fromMidi(midi: number): PianoNote {
  return Note.fromMidiSharps(midi) as PianoNote
}

export function isBlackKey(note: string): boolean {
  return fromMidi(toMidi(note)).includes('#')
}

/** オクターブを除いた音名（常にシャープ表記）。 */
export function pitchClassOf(note: string): NoteName {
  const chroma = Note.chroma(note)
  if (chroma === undefined) {
    throw new Error(`音名として解釈できません: ${note}`)
  }
  return NOTE_NAMES[chroma]
}

export function octaveOf(note: string): number {
  return Math.floor(toMidi(note) / 12) - 1
}

/** from から to までの音名を半音刻みで並べる。 */
export function noteRange(from: string, to: string): PianoNote[] {
  const start = toMidi(from)
  const end = toMidi(to)
  const notes: PianoNote[] = []
  for (let midi = start; midi <= end; midi += 1) {
    notes.push(fromMidi(midi))
  }
  return notes
}

/** 鍵盤描画用のキー一覧を作る。 */
export function buildPianoKeys(from: string, to: string): PianoKeyInfo[] {
  let whiteIndex = -1
  return noteRange(from, to).map((note) => {
    const black = note.includes('#')
    if (!black) whiteIndex += 1
    return {
      note,
      name: pitchClassOf(note),
      octave: octaveOf(note),
      isBlack: black,
      whiteIndex: black ? whiteIndex + 1 : whiteIndex,
    }
  })
}

/** 白鍵のみに絞った音名一覧。 */
export function whiteNotesInRange(from: string, to: string): PianoNote[] {
  return noteRange(from, to).filter((note) => !note.includes('#'))
}

/** 表示用の日本語音名（ドレミ）。 */
export const SOLFEGE_LABELS: Record<NoteName, string> = {
  C: 'ド',
  'C#': 'ド♯',
  D: 'レ',
  'D#': 'レ♯',
  E: 'ミ',
  F: 'ファ',
  'F#': 'ファ♯',
  G: 'ソ',
  'G#': 'ソ♯',
  A: 'ラ',
  'A#': 'ラ♯',
  B: 'シ',
}
