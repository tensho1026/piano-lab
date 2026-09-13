import { Chord } from 'tonal'
import { fromMidi, toMidi } from './notes'
import { sampleUnique, shuffle } from '../utils/random'
import type { Difficulty } from '../types/game'

/** コード当てゲームで使うルート音。 */
export const CHORD_ROOTS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const

/** かんたん: メジャー / マイナー。 */
const EASY_SUFFIXES = ['', 'm'] as const

/** ふつう: 7th 系を追加。 */
const NORMAL_SUFFIXES = ['', 'm', '7', 'maj7', 'm7'] as const

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
