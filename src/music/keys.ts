import { Chord, Key, Note } from 'tonal'

export type KeyMode = 'major' | 'minor'
export type ChordQuality = 'major' | 'minor' | 'diminished'
export type ChordFunction = 'T' | 'SD' | 'D'

/** Key 選択に出す 12 のトニック（五度圏の順）。 */
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

export const MAJOR_GRADES = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] as const
export const MINOR_GRADES = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'] as const

const MAJOR_FUNCTIONS: ChordFunction[] = ['T', 'SD', 'T', 'SD', 'D', 'T', 'D']
const MINOR_FUNCTIONS: ChordFunction[] = ['T', 'SD', 'T', 'SD', 'D', 'SD', 'SD']

const LETTER_SOLFEGE: Record<string, string> = {
  C: 'ド',
  D: 'レ',
  E: 'ミ',
  F: 'ファ',
  G: 'ソ',
  A: 'ラ',
  B: 'シ',
}

const SHARP_ORDER = ['F♯', 'C♯', 'G♯', 'D♯', 'A♯', 'E♯', 'B♯']
const FLAT_ORDER = ['B♭', 'E♭', 'A♭', 'D♭', 'G♭', 'C♭', 'F♭']

export const CHORD_FUNCTION_LABELS: Record<ChordFunction, string> = {
  T: 'トニック（安定・家）',
  SD: 'サブドミナント（動き出し）',
  D: 'ドミナント（緊張・帰りたくなる）',
}

export const CHORD_QUALITY_LABELS: Record<ChordQuality, string> = {
  major: 'メジャー（明るい三和音）',
  minor: 'マイナー（少し暗い三和音）',
  diminished: 'ディミニッシュ（不安定な減三和音）',
}

/** 音階の各音の役割。短調の第7音は導音ではなく下主音。 */
export const MAJOR_SCALE_DEGREE_ROLES = [
  '第1音・主音（トニック）',
  '第2音・上主音（スーパートニック）',
  '第3音・中音（メディアント）',
  '第4音・下属音（サブドミナント）',
  '第5音・属音（ドミナント）',
  '第6音・下中音（サブメディアント）',
  '第7音・導音（リーディングトーン）',
] as const

export const MINOR_SCALE_DEGREE_ROLES = [
  '第1音・主音（トニック）',
  '第2音・上主音（スーパートニック）',
  '第3音・中音（メディアント）',
  '第4音・下属音（サブドミナント）',
  '第5音・属音（ドミナント）',
  '第6音・下中音（サブメディアント）',
  '第7音・下主音（サブトニック）',
] as const

export type DiatonicChord = {
  symbol: string
  /** ディグリーネーム（例: "IV"）。 */
  grade: string
  function: ChordFunction
  quality: ChordQuality
  notes: string[]
}

export type KeyProfile = {
  tonic: string
  mode: KeyMode
  label: string
  tonicJa: string
  scale: readonly string[]
  scaleJa: readonly string[]
  scaleRoles: readonly string[]
  keySignature: string
  keySignatureLabel: string
  relativeLabel: string
  parallelLabel: string
  triads: DiatonicChord[]
}

/** 固定ド（C=ド）の日本語音名。フラット調もそのまま読む。 */
export function solfegeOf(note: string): string {
  const parsed = Note.get(note)
  if (parsed.empty || !parsed.letter) return note
  const base = LETTER_SOLFEGE[parsed.letter] ?? parsed.letter
  if (parsed.acc === '#') return `${base}♯`
  if (parsed.acc === 'b') return `${base}♭`
  if (parsed.acc === '##') return `${base}♯♯`
  if (parsed.acc === 'bb') return `${base}♭♭`
  return base
}

export function formatKeySignature(keySignature: string): string {
  if (!keySignature) return '調号なし（♯も♭も付かない。ピアノの白鍵だけ）'
  const isFlat = keySignature.includes('b')
  const count = keySignature.length
  const names = (isFlat ? FLAT_ORDER : SHARP_ORDER).slice(0, count)
  const kind = isFlat ? 'フラット（♭）' : 'シャープ（♯）'
  return `${kind} が ${count} 個：${names.join('、')}`
}

function chordQualityOf(symbol: string): ChordQuality {
  const type = Chord.get(symbol).type
  if (type === 'diminished' || type.includes('dim')) return 'diminished'
  if (type === 'minor') return 'minor'
  return 'major'
}

function buildTriads(
  symbols: readonly string[],
  grades: readonly string[],
  functions: ChordFunction[],
): DiatonicChord[] {
  return symbols.map((symbol, index) => ({
    symbol,
    grade: grades[index],
    function: functions[index],
    quality: chordQualityOf(symbol),
    notes: Chord.get(symbol).notes,
  }))
}

/** 選んだ Key のダイアトニック・トライアドを並べる。 */
export function diatonicTriads(tonic: string, mode: KeyMode): DiatonicChord[] {
  return keyProfile(tonic, mode).triads
}

export function keyLabel(tonic: string, mode: KeyMode): string {
  return `${tonic} ${mode === 'major' ? 'Major' : 'Minor'}`
}

/** 画面の教材・パレット用に、1つの調の情報をまとめる。 */
export function keyProfile(tonic: string, mode: KeyMode): KeyProfile {
  if (mode === 'major') {
    const key = Key.majorKey(tonic)
    return {
      tonic: key.tonic,
      mode,
      label: keyLabel(key.tonic, mode),
      tonicJa: solfegeOf(key.tonic),
      scale: key.scale,
      scaleJa: key.scale.map(solfegeOf),
      scaleRoles: MAJOR_SCALE_DEGREE_ROLES,
      keySignature: key.keySignature,
      keySignatureLabel: formatKeySignature(key.keySignature),
      relativeLabel: `${key.minorRelative} Minor（同じ音階・主音だけが違う）`,
      parallelLabel: `${key.tonic} Minor（主音は同じ・音階が違う）`,
      triads: buildTriads(key.triads, MAJOR_GRADES, MAJOR_FUNCTIONS),
    }
  }

  const key = Key.minorKey(tonic)
  const natural = key.natural
  return {
    tonic: key.tonic,
    mode,
    label: keyLabel(key.tonic, mode),
    tonicJa: solfegeOf(key.tonic),
    scale: natural.scale,
    scaleJa: natural.scale.map(solfegeOf),
    scaleRoles: MINOR_SCALE_DEGREE_ROLES,
    keySignature: key.keySignature,
    keySignatureLabel: formatKeySignature(key.keySignature),
    relativeLabel: `${key.relativeMajor} Major（同じ音階・主音だけが違う）`,
    parallelLabel: `${key.tonic} Major（主音は同じ・音階が違う）`,
    triads: buildTriads(natural.triads, MINOR_GRADES, MINOR_FUNCTIONS),
  }
}

export function allKeyProfiles(mode: KeyMode): KeyProfile[] {
  return KEY_TONICS.map((tonic) => keyProfile(tonic, mode))
}

export function relativeMinorTonic(majorTonic: string): string {
  return Key.majorKey(majorTonic).minorRelative
}
