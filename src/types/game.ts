export type Difficulty = 'easy' | 'normal' | 'hard'

export type GamePhase = 'playing' | 'answered' | 'finished'

export type Question<T> = {
  id: string
  answer: T
}

export type ChordQuestion = Question<string> & {
  notes: string[]
  choices: string[]
}

export type IntervalQuestion = Question<string> & {
  firstNote: string
  secondNote: string
  choices: string[]
}

export type PitchQuestion = Question<string> & {
  note: string
  choices: string[]
}

export type ChordEarQuestion = Question<string[]> & {
  notes: string[]
  /** 出題したコードの表示名（例: "Cmaj7"）。 */
  chordSymbol: string
  /** 和音の種類の説明（例: "メジャーセブンス"）。 */
  chordKind: string
  suffix: string
}

export type RhythmDuration = 'q' | '8'

export type SightReadingEvent =
  | { kind: 'note'; pitch: string; duration: RhythmDuration }
  | { kind: 'rest'; duration: RhythmDuration }

export type SightReadingQuestion = Question<string[]> & {
  notes: string[]
  events: SightReadingEvent[]
  clef: 'treble' | 'bass'
}

export type RelativePitchQuestion = Question<number> & {
  tonic: string
  mode: 'major' | 'minor'
  degree: number
  tonicNote: string
  note: string
  choices: number[]
}

export type ProgressionEarQuestion = Question<string[]> & {
  tonic: string
  mode: 'major' | 'minor'
  grades: string[]
  symbols: string[]
  presetName: string
  availableGrades: string[]
}
