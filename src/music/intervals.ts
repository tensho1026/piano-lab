import { fromMidi, toMidi } from './notes'
import type { Difficulty } from '../types/game'

export type IntervalDef = {
  /** Tonal の音程名（例: "3m"）。 */
  name: string
  /** 表示用の日本語名。 */
  label: string
  semitones: number
}

/** 仕様書で対象としている 12 種類の音程。 */
export const INTERVALS: readonly IntervalDef[] = [
  { name: '2m', label: '短2度', semitones: 1 },
  { name: '2M', label: '長2度', semitones: 2 },
  { name: '3m', label: '短3度', semitones: 3 },
  { name: '3M', label: '長3度', semitones: 4 },
  { name: '4P', label: '完全4度', semitones: 5 },
  { name: '4A', label: '増4度', semitones: 6 },
  { name: '5P', label: '完全5度', semitones: 7 },
  { name: '6m', label: '短6度', semitones: 8 },
  { name: '6M', label: '長6度', semitones: 9 },
  { name: '7m', label: '短7度', semitones: 10 },
  { name: '7M', label: '長7度', semitones: 11 },
  { name: '8P', label: '完全8度', semitones: 12 },
]

/** かんたんは聴き分けやすい 7 種、ふつうは 12 種すべて。 */
const EASY_INTERVAL_NAMES = ['2M', '3m', '3M', '4P', '5P', '6M', '8P']

export function intervalPoolFor(difficulty: Difficulty): readonly IntervalDef[] {
  if (difficulty === 'easy') {
    return INTERVALS.filter((interval) => EASY_INTERVAL_NAMES.includes(interval.name))
  }
  return INTERVALS
}

export function intervalLabel(name: string): string {
  return INTERVALS.find((interval) => interval.name === name)?.label ?? name
}

/** 下の音から音程ぶん上げた音を返す（表記は常にシャープ）。 */
export function transposeBy(note: string, intervalName: string): string {
  const interval = INTERVALS.find((candidate) => candidate.name === intervalName)
  if (!interval) {
    throw new Error(`未対応の音程です: ${intervalName}`)
  }
  return fromMidi(toMidi(note) + interval.semitones)
}
