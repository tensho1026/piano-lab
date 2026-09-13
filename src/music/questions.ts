import { NOTE_NAMES, WHITE_NOTE_NAMES } from './notes'
import { createId, pickRandom, randomInt } from '../utils/random'
import type { Difficulty, PitchQuestion } from '../types/game'
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
