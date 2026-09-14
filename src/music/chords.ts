import { Chord } from 'tonal'
import { fromMidi, toMidi } from './notes'
import { pickRandom, randomInt, sampleUnique, shuffle } from '../utils/random'
import type { Difficulty } from '../types/game'

/** コード当てゲームで使うルート音。 */
export const CHORD_ROOTS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const

/** 和音耳コピで使う 12 音のルート。 */
export const CHORD_EAR_ROOTS = [
  'C',
  'C#',
  'D',
  'Eb',
  'E',
  'F',
  'F#',
  'G',
  'Ab',
  'A',
  'Bb',
  'B',
] as const

/** かんたん: メジャー / マイナー。 */
const EASY_SUFFIXES = ['', 'm'] as const

/** ふつう: 7th 系を追加。 */
const NORMAL_SUFFIXES = ['', 'm', '7', 'maj7', 'm7'] as const

export type ChordEarKind = {
  /** tonal に渡す接尾辞（ルートの直後）。 */
  suffix: string
  label: string
}

/** 和音耳コピのかんたん: 2〜3 音の基本形。 */
export const CHORD_EAR_KINDS_EASY: readonly ChordEarKind[] = [
  { suffix: '5', label: 'パワーコード（根音と5度）' },
  { suffix: '', label: 'メジャー三和音' },
  { suffix: 'm', label: 'マイナー三和音' },
]

/** ふつう: 三和音の仲間とサスペンデッド・6th。 */
export const CHORD_EAR_KINDS_NORMAL: readonly ChordEarKind[] = [
  { suffix: '', label: 'メジャー三和音' },
  { suffix: 'm', label: 'マイナー三和音' },
  { suffix: 'dim', label: 'ディミニッシュ（減三和音）' },
  { suffix: 'aug', label: 'オーギュメント（増三和音）' },
  { suffix: 'sus2', label: 'サスツー' },
  { suffix: 'sus4', label: 'サスフォー' },
  { suffix: '6', label: 'シックス' },
  { suffix: 'm6', label: 'マイナーシックス' },
  { suffix: 'add9', label: 'アドナインス' },
]

/** むずかしい: 7th・テンション・転回。 */
export const CHORD_EAR_KINDS_HARD: readonly ChordEarKind[] = [
  { suffix: '7', label: 'ドミナントセブンス' },
  { suffix: 'maj7', label: 'メジャーセブンス' },
  { suffix: 'm7', label: 'マイナーセブンス' },
  { suffix: 'm7b5', label: 'ハーフディミニッシュ' },
  { suffix: 'dim7', label: 'ディミニッシュセブンス' },
  { suffix: '7sus4', label: 'セブンスサスフォー' },
  { suffix: 'm/ma7', label: 'マイナーメジャーセブンス' },
  { suffix: '9', label: 'ナインス' },
  { suffix: 'm9', label: 'マイナーナインス' },
  { suffix: 'maj9', label: 'メジャーナインス' },
  { suffix: '7#5', label: 'セブンス・シャープファイブ' },
  { suffix: '7b5', label: 'セブンス・フラットファイブ' },
  { suffix: '7b9', label: 'セブンス・フラットナインス' },
  { suffix: '7#9', label: 'セブンス・シャープナインス' },
  { suffix: '11', label: 'イレブンス' },
  { suffix: 'aug', label: 'オーギュメント' },
  { suffix: 'dim', label: 'ディミニッシュ' },
]

export function chordEarKindsFor(difficulty: Difficulty): readonly ChordEarKind[] {
  if (difficulty === 'easy') return CHORD_EAR_KINDS_EASY
  if (difficulty === 'normal') return CHORD_EAR_KINDS_NORMAL
  return CHORD_EAR_KINDS_HARD
}

export function chordPoolFor(difficulty: Difficulty): string[] {
  const suffixes = difficulty === 'easy' ? EASY_SUFFIXES : NORMAL_SUFFIXES
  return CHORD_ROOTS.flatMap((root) => suffixes.map((suffix) => `${root}${suffix}`))
}

/** コードネームのルート音（例: "Cm7" -> "C"）。 */
export function chordRootOf(symbol: string): string {
  return Chord.get(symbol).tonic ?? symbol.slice(0, 1)
}

/**
 * コードネームを構成音（オクターブ付き）に変換する。
 * 下から順に積み上げるので、転回せずに素直な和音になる。
 */
export function voiceChord(pitchClasses: readonly string[], startOctave = 3): string[] {
  let previous = -1
  return pitchClasses.map((pitchClass) => {
    let midi = toMidi(`${pitchClass}${startOctave}`)
    while (midi <= previous) midi += 12
    previous = midi
    return fromMidi(midi)
  })
}

/** コードネームから鳴らすべき音を得る（例: "Am" -> ["A3","C4","E4"]）。 */
export function chordNotes(symbol: string, startOctave = 3): string[] {
  const chord = Chord.get(symbol)
  if (chord.empty || chord.notes.length === 0) {
    throw new Error(`コードとして解釈できません: ${symbol}`)
  }
  return voiceChord(chord.notes, startOctave)
}

/** 構成音を「A C E」のように並べた表示用文字列。 */
export function chordNotesLabel(symbol: string): string {
  return Chord.get(symbol).notes.join(' ')
}

/**
 * 4 択の選択肢を作る。ルートだけで答えられないよう、
 * 同じルートで種類が違うコードを優先して混ぜる。
 */
export function chordChoices(answer: string, pool: readonly string[], count = 4): string[] {
  const answerRoot = chordRootOf(answer)
  const sameRoot = pool.filter(
    (symbol) => symbol !== answer && chordRootOf(symbol) === answerRoot,
  )
  const otherRoots = pool.filter(
    (symbol) => symbol !== answer && chordRootOf(symbol) !== answerRoot,
  )

  const picked = sampleUnique(sameRoot, Math.min(2, count - 1))
  const rest = sampleUnique(otherRoots, count - 1 - picked.length)
  return shuffle([answer, ...picked, ...rest])
}

function invertPitchClasses(pitchClasses: readonly string[], inversion: number): string[] {
  const notes = [...pitchClasses]
  const steps = ((inversion % notes.length) + notes.length) % notes.length
  return [...notes.slice(steps), ...notes.slice(0, steps)]
}

function notesInRange(notes: readonly string[], from: string, to: string): boolean {
  const low = toMidi(from)
  const high = toMidi(to)
  return notes.every((note) => {
    const midi = toMidi(note)
    return midi >= low && midi <= high
  })
}

/**
 * 和音耳コピ用に、コード種類・ルート・（必要なら）転回を選んで鳴らす音を作る。
 * 鍵盤の表示範囲に収まるまで loc をずらして試す。
 */
export function createVoicedChordEar(difficulty: Difficulty, from: string, to: string): {
  symbol: string
  kind: string
  notes: string[]
} {
  const kinds = chordEarKindsFor(difficulty)
  const allowInversions = difficulty !== 'easy'

  for (let attempt = 0; attempt < 80; attempt += 1) {
    const kind = pickRandom(kinds)
    const root = pickRandom(CHORD_EAR_ROOTS)
    const symbol = `${root}${kind.suffix}`
    const chord = Chord.get(symbol)
    if (chord.empty || chord.notes.length === 0) continue

    const inversion = allowInversions ? randomInt(0, chord.notes.length - 1) : 0
    const pitchClasses = invertPitchClasses(chord.notes, inversion)
    const startOctave = randomInt(3, 5)
    const notes = voiceChord(pitchClasses, startOctave)
    if (!notesInRange(notes, from, to)) continue

    const inversionLabel = inversion === 0 ? '' : `（第${inversion}転回）`
    return { symbol, kind: `${kind.label}${inversionLabel}`, notes }
  }

  const fallback = voiceChord(Chord.get('C').notes, 4)
  return { symbol: 'C', kind: 'メジャー三和音', notes: fallback }
}
