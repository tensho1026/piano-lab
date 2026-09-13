export type NoteName =
  | 'C'
  | 'C#'
  | 'D'
  | 'D#'
  | 'E'
  | 'F'
  | 'F#'
  | 'G'
  | 'G#'
  | 'A'
  | 'A#'
  | 'B'

export type PianoNote = `${NoteName}${number}`

/** 1鍵盤ぶんの描画情報。 */
export type PianoKeyInfo = {
  note: PianoNote
  name: NoteName
  octave: number
  isBlack: boolean
  /** 白鍵のみに振られる通し番号。黒鍵の位置決めに使う。 */
  whiteIndex: number
}

export type ClefName = 'treble' | 'bass'
