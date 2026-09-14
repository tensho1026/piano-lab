import { NOTE_NAMES, WHITE_NOTE_NAMES, fromMidi, toMidi } from './notes'
import {
  chordChoices,
  chordNotes,
  chordPoolFor,
  createVoicedChordEar,
  type ChordEarScope,
  type ChordQuizScope,
  DEFAULT_CHORD_EAR_SCOPE,
} from './chords'
import { INTERVALS, intervalPoolFor, transposeBy } from './intervals'
import { KEY_TONICS, keyProfile, type KeyMode } from './keys'
import { PROGRESSION_PRESETS, resolvePreset } from './progressions'
import { buildChoices, createId, pickRandom, randomInt } from '../utils/random'
import { sortNotes } from '../utils/compareNotes'
import type {
  ChordEarQuestion,
  ChordQuestion,
  Difficulty,
  IntervalQuestion,
  PitchQuestion,
  ProgressionEarQuestion,
  RelativePitchQuestion,
  RhythmDuration,
  SightReadingEvent,
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
    choices: [...pool],
  }
}

/**
 * 音程当てゲームの問題。上の音が鍵盤表示範囲（〜C6）を超えないように下の音を選ぶ。
 */
export function createIntervalQuestion(
  difficulty: Difficulty,
  followUp?: { names: readonly string[]; firstNote?: string },
): IntervalQuestion {
  const pool = intervalPoolFor(difficulty)
  const intervalName = followUp
    ? pickRandom(followUp.names)
    : pickRandom(pool).name
  const interval =
    INTERVALS.find((item) => item.name === intervalName) ?? pickRandom(pool)
  const highestRoot = toMidi('C6') - interval.semitones
  const firstNote =
    followUp?.firstNote && toMidi(followUp.firstNote) <= highestRoot
      ? followUp.firstNote
      : fromMidi(randomInt(toMidi('C3'), Math.min(highestRoot, toMidi('C5'))))

  const choicePool = followUp
    ? [...new Set([...followUp.names, interval.name])]
    : pool.map((candidate) => candidate.name)

  return {
    id: createId(),
    answer: interval.name,
    firstNote,
    secondNote: transposeBy(firstNote, interval.name),
    choices: followUp
      ? buildChoices(interval.name, choicePool, Math.min(4, choicePool.length))
      : buildChoices(interval.name, pool.map((candidate) => candidate.name)),
  }
}

/**
 * コード当てゲームの問題。ルート音は 3 オクターブ目から積み上げる。
 */
export function createChordQuestion(
  scope: ChordQuizScope,
  followUpRoot?: string,
): ChordQuestion {
  const lockedRoot =
    followUpRoot ?? (scope.sameRootChoices ? pickRandom([...CHORD_ROOTS_FOR_QUIZ]) : undefined)
  const pool = chordPoolFor(scope, lockedRoot)
  const answer = pickRandom(pool)
  return {
    id: createId(),
    answer,
    notes: chordNotes(answer),
    choices: chordChoices(answer, pool, Math.min(4, Math.max(2, pool.length))),
  }
}

const CHORD_ROOTS_FOR_QUIZ = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const

/** 和音耳コピゲームの出題範囲。 */
export const CHORD_EAR_RANGE = { from: 'C3', to: 'C6' } as const

/**
 * 和音耳コピゲームの問題。実際のコード種類から構成音を作る。
 */
export function createChordEarQuestion(
  scope: ChordEarScope = DEFAULT_CHORD_EAR_SCOPE,
  followUpSuffix?: string,
): ChordEarQuestion {
  const voiced = createVoicedChordEar(scope, CHORD_EAR_RANGE.from, CHORD_EAR_RANGE.to, followUpSuffix)
  const notes = sortNotes(voiced.notes)
  return {
    id: createId(),
    answer: notes,
    notes,
    chordSymbol: voiced.symbol,
    chordKind: voiced.kind,
    suffix: voiced.suffix,
  }
}

export type SightReadingScope = {
  whiteKeysOnly: boolean
  clef: 'treble' | 'bass' | 'both'
  noteCount: number
  includeRhythm: boolean
}

export const DEFAULT_SIGHT_READING_SCOPE: SightReadingScope = {
  whiteKeysOnly: true,
  clef: 'treble',
  noteCount: 4,
  includeRhythm: false,
}

function sightReadingCandidates(scope: SightReadingScope, clef: ClefName): string[] {
  const [from, to] =
    clef === 'bass' ? (['C3', 'C4'] as const) : (['C4', 'C5'] as const)
  const candidates: string[] = []
  for (let midi = toMidi(from); midi <= toMidi(to); midi += 1) {
    const note = fromMidi(midi)
    if (scope.whiteKeysOnly && note.includes('#')) continue
    candidates.push(note)
  }
  return candidates
}

function pickDuration(): RhythmDuration {
  return Math.random() < 0.4 ? '8' : 'q'
}

/**
 * 初見演奏トレーナーの問題。リズムありのときは 4 分・8 分・休符を混ぜる。
 */
export function createSightReadingQuestion(scope: SightReadingScope): SightReadingQuestion {
  const clef: ClefName =
    scope.clef === 'both' ? (Math.random() < 0.5 ? 'bass' : 'treble') : scope.clef
  const candidates = sightReadingCandidates(scope, clef)
  const samePitch = scope.includeRhythm && scope.whiteKeysOnly
  const fixedPitch = samePitch ? pickRandom(candidates) : null

  const events: SightReadingEvent[] = []
  const notes: string[] = []

  while (notes.length < scope.noteCount) {
    if (scope.includeRhythm && notes.length > 0 && Math.random() < 0.16) {
      events.push({ kind: 'rest', duration: 'q' })
      continue
    }

    const nextCandidates = candidates.filter((note) => note !== notes.at(-1))
    const pitch =
      fixedPitch ?? pickRandom(nextCandidates.length > 0 ? nextCandidates : candidates)
    const duration = scope.includeRhythm ? pickDuration() : 'q'

    if (duration === '8' && notes.length + 1 < scope.noteCount) {
      events.push({ kind: 'note', pitch, duration: '8' })
      notes.push(pitch)
      const second = fixedPitch ?? pickRandom(candidates.filter((note) => note !== pitch))
      events.push({ kind: 'note', pitch: second, duration: '8' })
      notes.push(second)
    } else {
      events.push({ kind: 'note', pitch, duration: duration === '8' ? 'q' : duration })
      notes.push(pitch)
    }
  }

  return { id: createId(), answer: notes, notes, events, clef }
}

const RELATIVE_DEGREE_LABELS = ['主音', '2', '3', '4', '5', '6', '7'] as const

export function relativeDegreeLabel(degree: number): string {
  return `${degree}（${RELATIVE_DEGREE_LABELS[degree - 1] ?? degree}）`
}

export function createRelativePitchQuestion(
  tonic: string,
  mode: KeyMode,
  difficulty: Difficulty,
): RelativePitchQuestion {
  const profile = keyProfile(tonic, mode)
  const degrees =
    difficulty === 'easy' ? [1, 3, 5] : difficulty === 'normal' ? [1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, 6, 7]
  const degree = pickRandom(degrees)
  const pitchClass = profile.scale[degree - 1]
  const octave = randomInt(3, 4)
  let midi = toMidi(`${pitchClass}${octave}`)
  const tonicMidi = toMidi(`${profile.tonic}4`)
  if (midi < tonicMidi && degree !== 1) midi += 12
  const note = fromMidi(Math.min(midi, toMidi('C6')))
  const tonicNote = fromMidi(Math.min(toMidi(`${profile.tonic}4`), toMidi('B5')))

  return {
    id: createId(),
    answer: degree,
    tonic: profile.tonic,
    mode,
    degree,
    tonicNote,
    note,
    choices: [...degrees],
  }
}

export function createProgressionEarQuestion(difficulty: Difficulty): ProgressionEarQuestion {
  const majorPresets = PROGRESSION_PRESETS.filter((preset) => preset.mode === 'major')
  const preset =
    difficulty === 'hard' ? pickRandom(PROGRESSION_PRESETS) : pickRandom(majorPresets)
  const tonic = difficulty === 'easy' ? 'C' : pickRandom(KEY_TONICS)
  const resolved = resolvePreset(preset, tonic)
  const triads = keyProfile(tonic, preset.mode).triads
  const availableGrades =
    difficulty === 'easy'
      ? [...new Set([...preset.grades, 'I', 'IV', 'V', 'vi'])]
      : triads.map((chord) => chord.grade)

  return {
    id: createId(),
    answer: [...preset.grades],
    tonic,
    mode: preset.mode,
    grades: [...preset.grades],
    symbols: resolved.symbols,
    presetName: preset.name,
    availableGrades,
  }
}
