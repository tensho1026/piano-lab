import { Key } from 'tonal'

export type KeyMode = 'major' | 'minor'

/** Key 選択に出す 12 のトニック。 */
export const KEY_TONICS = [
  'C',
  'G',
  'D',
  'A',
  'E',
  'B',
  'F#',
  'Db',
  'Ab',
  'Eb',
  'Bb',
  'F',
] as const

const MAJOR_GRADES = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']
const MINOR_GRADES = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII']

export type DiatonicChord = {
  symbol: string
  /** ディグリーネーム（例: "IV"）。 */
  grade: string
}

/** 選んだ Key のダイアトニック・トライアドを並べる。 */
export function diatonicTriads(tonic: string, mode: KeyMode): DiatonicChord[] {
  const triads =
    mode === 'major' ? Key.majorKey(tonic).triads : Key.minorKey(tonic).natural.triads
  const grades = mode === 'major' ? MAJOR_GRADES : MINOR_GRADES
  return triads.map((symbol, index) => ({ symbol, grade: grades[index] }))
}

export function keyLabel(tonic: string, mode: KeyMode): string {
  return `${tonic} ${mode === 'major' ? 'Major' : 'Minor'}`
}
