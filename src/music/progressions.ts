import { diatonicTriads, type KeyMode } from './keys'

export type ProgressionPreset = {
  id: string
  name: string
  /** ローマ数字。その調のダイアトニックに存在する記号と一致させる。 */
  grades: readonly string[]
  mode: KeyMode
}

export const PROGRESSION_PRESETS: readonly ProgressionPreset[] = [
  { id: 'pop', name: 'ポップス進行', grades: ['I', 'V', 'vi', 'IV'], mode: 'major' },
  { id: 'canon', name: 'カノン進行', grades: ['I', 'vi', 'IV', 'V'], mode: 'major' },
  { id: 'one-four-five', name: 'I–IV–V', grades: ['I', 'IV', 'V', 'I'], mode: 'major' },
  { id: 'two-five-one', name: 'ツーファイブ', grades: ['ii', 'V', 'I'], mode: 'major' },
  { id: 'vi-start', name: 'サビ進行', grades: ['vi', 'IV', 'I', 'V'], mode: 'major' },
  { id: 'minor-loop', name: '短調ループ', grades: ['i', 'VI', 'III', 'VII'], mode: 'minor' },
  { id: 'minor-i-iv-v', name: '短調 i–iv–v', grades: ['i', 'iv', 'v', 'i'], mode: 'minor' },
]

export type ResolvedProgression = {
  preset: ProgressionPreset
  symbols: string[]
}

export function resolvePreset(preset: ProgressionPreset, tonic: string): ResolvedProgression {
  const triads = diatonicTriads(tonic, preset.mode)
  const symbols = preset.grades.map((grade) => {
    const chord = triads.find((candidate) => candidate.grade === grade)
    if (!chord) {
      throw new Error(`${preset.mode} ${tonic} にディグリー ${grade} がありません`)
    }
    return chord.symbol
  })
  return { preset, symbols }
}

export function gradesLabel(grades: readonly string[]): string {
  return grades.join('–')
}
