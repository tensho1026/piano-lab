import { NOTE_NAMES, WHITE_NOTE_NAMES, fromMidi, toMidi } from './notes'
import { chordChoices, chordNotes, chordPoolFor } from './chords'
import { intervalPoolFor, transposeBy } from './intervals'
import { buildChoices, createId, pickRandom, randomInt, sampleUnique } from '../utils/random'
import { sortNotes } from '../utils/compareNotes'
import type {
  ChordEarQuestion,
  ChordQuestion,
  Difficulty,
  IntervalQuestion,
  PitchQuestion,
} from '../types/game'
import type { NoteName } from '../types/music'

/** 絶対音感ゲームで使う音名の候補。 */
export function pitchPoolFor(difficulty: Difficulty): readonly NoteName[] {
  return difficulty === 'easy' ? WHITE_NOTE_NAMES : NOTE_NAMES
}

/**
 * 絶対音感ゲームの問題。オクターブはランダムに選ぶが、判定は音名のみで行う。
 */
export function createPitchQuestion(difficulty: Difficulty): PitchQuestion {
  const pool = pitchPoolFor(difficulty)
  const answer = pickRandom(pool)
  const octave = randomInt(3, 5)
  return {
    id: createId(),
    answer,
    note: `${answer}${octave}`,
    // 選択肢は半音順で固定し、毎問ボタンの位置が動かないようにする。
    choices: [...pool],
  }
}

/**
 * 音程当てゲームの問題。上の音が鍵盤表示範囲（〜C6）を超えないように下の音を選ぶ。
 */
export function createIntervalQuestion(difficulty: Difficulty): IntervalQuestion {
  const pool = intervalPoolFor(difficulty)
  const interval = pickRandom(pool)
  const highestRoot = toMidi('C6') - interval.semitones
  const firstNote = fromMidi(randomInt(toMidi('C3'), Math.min(highestRoot, toMidi('C5'))))

  return {
    id: createId(),
    answer: interval.name,
    firstNote,
    secondNote: transposeBy(firstNote, interval.name),
    choices: buildChoices(
      interval.name,
      pool.map((candidate) => candidate.name),
    ),
  }
}

/**
 * コード当てゲームの問題。ルート音は 3 オクターブ目から積み上げる。
 */
export function createChordQuestion(difficulty: Difficulty): ChordQuestion {
  const pool = chordPoolFor(difficulty)
  const answer = pickRandom(pool)
  return {
    id: createId(),
    answer,
    notes: chordNotes(answer),
    choices: chordChoices(answer, pool),
  }
}

/** 和音耳コピゲームの音数と出題範囲。 */
export const CHORD_EAR_SETTINGS: Record<
  Difficulty,
  { noteCount: number; from: string; to: string; whiteKeysOnly: boolean }
> = {
  easy: { noteCount: 2, from: 'C4', to: 'C5', whiteKeysOnly: true },
  normal: { noteCount: 3, from: 'C4', to: 'C6', whiteKeysOnly: true },
  hard: { noteCount: 4, from: 'C3', to: 'C6', whiteKeysOnly: false },
}

/**
 * 和音耳コピゲームの問題。判定は順番を無視するため、
 * 出題側も低い音から順に並べておく。
 */
export function createChordEarQuestion(difficulty: Difficulty): ChordEarQuestion {
  const { noteCount, from, to, whiteKeysOnly } = CHORD_EAR_SETTINGS[difficulty]
  const candidates: string[] = []
  for (let midi = toMidi(from); midi <= toMidi(to); midi += 1) {
    const note = fromMidi(midi)
    if (whiteKeysOnly && note.includes('#')) continue
    candidates.push(note)
  }

  const notes = sortNotes(sampleUnique(candidates, noteCount))
  return { id: createId(), answer: notes, notes }
}
