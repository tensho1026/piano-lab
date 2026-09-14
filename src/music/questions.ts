import { NOTE_NAMES, WHITE_NOTE_NAMES, fromMidi, toMidi } from './notes'
import { chordChoices, chordNotes, chordPoolFor, createVoicedChordEar } from './chords'
import { intervalPoolFor, transposeBy } from './intervals'
import { buildChoices, createId, pickRandom, randomInt } from '../utils/random'
import { sortNotes } from '../utils/compareNotes'
import type {
  ChordEarQuestion,
  ChordQuestion,
  Difficulty,
  IntervalQuestion,
  PitchQuestion,
  SightReadingQuestion,
} from '../types/game'
import type { ClefName, NoteName } from '../types/music'

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

/** 和音耳コピゲームの出題範囲。種類は chordEarKindsFor を参照。 */
export const CHORD_EAR_SETTINGS: Record<Difficulty, { from: string; to: string }> = {
  easy: { from: 'C3', to: 'C5' },
  normal: { from: 'C3', to: 'C6' },
  hard: { from: 'C3', to: 'C6' },
}

/**
 * 和音耳コピゲームの問題。実際のコード種類から構成音を作る。
 * 判定は順番を無視するため、出題側も低い音から順に並べておく。
 */
export function createChordEarQuestion(difficulty: Difficulty): ChordEarQuestion {
  const { from, to } = CHORD_EAR_SETTINGS[difficulty]
  const voiced = createVoicedChordEar(difficulty, from, to)
  const notes = sortNotes(voiced.notes)
  return {
    id: createId(),
    answer: notes,
    notes,
    chordSymbol: voiced.symbol,
    chordKind: voiced.kind,
  }
}

/** 初見演奏トレーナーの 1 問あたりの音数。 */
export const SIGHT_READING_NOTE_COUNTS: Record<Difficulty, number> = {
  easy: 1,
  normal: 4,
  hard: 8,
}

function sightReadingCandidates(difficulty: Difficulty, clef: ClefName): string[] {
  const [from, to] =
    difficulty === 'easy'
      ? (['C4', 'C5'] as const)
      : clef === 'bass'
        ? (['C3', 'C4'] as const)
        : (['C4', 'C6'] as const)

  const candidates: string[] = []
  for (let midi = toMidi(from); midi <= toMidi(to); midi += 1) {
    const note = fromMidi(midi)
    if (difficulty === 'easy' && note.includes('#')) continue
    candidates.push(note)
  }
  return candidates
}

/**
 * 初見演奏トレーナーの問題。同じ音が続かないように並べる。
 */
export function createSightReadingQuestion(difficulty: Difficulty): SightReadingQuestion {
  const clef: ClefName = difficulty === 'hard' && Math.random() < 0.5 ? 'bass' : 'treble'
  const candidates = sightReadingCandidates(difficulty, clef)
  const noteCount = SIGHT_READING_NOTE_COUNTS[difficulty]

  const notes: string[] = []
  while (notes.length < noteCount) {
    const note = pickRandom(candidates)
    if (note === notes.at(-1)) continue
    notes.push(note)
  }

  return { id: createId(), answer: notes, notes, clef }
}
