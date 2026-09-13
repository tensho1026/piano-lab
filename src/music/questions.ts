import { NOTE_NAMES, WHITE_NOTE_NAMES, fromMidi, toMidi } from './notes'
import { chordChoices, chordNotes, chordPoolFor } from './chords'
import { intervalPoolFor, transposeBy } from './intervals'
import { buildChoices, createId, pickRandom, randomInt } from '../utils/random'
import type { ChordQuestion, Difficulty, IntervalQuestion, PitchQuestion } from '../types/game'
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
