import { Chord, Note } from 'tonal'
import { chordNotesLabel, chordRootOf } from './chords'
import { INTERVALS, intervalLabel } from './intervals'
import { isSameNote } from '../utils/compareNotes'

export function explainChordGuess(answer: string, guess: string): string {
  if (guess === answer) return ''
  const answerChord = Chord.get(answer)
  const guessChord = Chord.get(guess)
  const answerRoot = chordRootOf(answer)
  const guessRoot = chordRootOf(guess)
  const answerThird = answerChord.notes[1]
  const guessThird = guessChord.notes[1]
  const sameRoot =
    Note.chroma(answerRoot) !== undefined && Note.chroma(answerRoot) === Note.chroma(guessRoot)

  if (sameRoot && answerThird && guessThird && answerThird !== guessThird) {
    const answerMajor = answerChord.type === 'major' || answerChord.type === 'dominant seventh'
    const guessMajor = guessChord.type === 'major' || guessChord.type === 'dominant seventh'
    const thirdHint =
      answerMajor !== guessMajor
        ? 'メジャーとマイナーの違いは、根音から数えた第3音が長3度か短3度か（半音1つ）です。'
        : '同じ根音でも、積み方（3度や7度）が違うと別のコードになります。'
    return `根音はどちらも ${answerRoot} です。正解の構成音は ${chordNotesLabel(answer)}、選んだ ${guess} は ${chordNotesLabel(guess)}。${thirdHint}`
  }

  if (!sameRoot) {
    return `選んだ ${guess} の根音は ${guessRoot}、正解 ${answer} の根音は ${answerRoot} です。構成音は ${chordNotesLabel(answer)}（正解）と ${chordNotesLabel(guess)}（回答）です。`
  }

  return `正解は ${answer}（${chordNotesLabel(answer)}）、選んだのは ${guess}（${chordNotesLabel(guess)}）です。`
}

export function explainIntervalGuess(answer: string, guess: string): string {
  if (guess === answer) return ''
  const answerInterval = INTERVALS.find((item) => item.name === answer)
  const guessInterval = INTERVALS.find((item) => item.name === guess)
  if (!answerInterval || !guessInterval) {
    return `正解は ${intervalLabel(answer)} です。`
  }
  const diff = Math.abs(answerInterval.semitones - guessInterval.semitones)
  const wider = guessInterval.semitones > answerInterval.semitones ? '広い' : '狭い'
  return `${intervalLabel(guess)} は ${guessInterval.semitones} 半音、正解の ${intervalLabel(answer)} は ${answerInterval.semitones} 半音です。回答の方が ${diff} 半音${wider}ので、近い音程をもう一度聴き比べます。`
}

export function explainNoteSetGuess(answer: readonly string[], guess: readonly string[]): string {
  const missing = answer.filter((note) => !guess.some((candidate) => isSameNote(candidate, note)))
  const extra = guess.filter((note) => !answer.some((candidate) => isSameNote(candidate, note)))
  const parts: string[] = []
  if (missing.length > 0) {
    parts.push(`足りない音: ${missing.join(' ')}`)
  }
  if (extra.length > 0) {
    parts.push(`余分な音: ${extra.join(' ')}`)
  }
  if (parts.length === 0) return ''
  parts.push('緑色が正解、赤い印が余分に選んだ音です。もう一度、同じ種類の和音を出します。')
  return parts.join('。')
}

export function nearbyIntervalName(answer: string): string | null {
  const answerInterval = INTERVALS.find((item) => item.name === answer)
  if (!answerInterval) return null
  const neighbors = INTERVALS.filter(
    (item) => item.name !== answer && Math.abs(item.semitones - answerInterval.semitones) === 1,
  )
  return neighbors[0]?.name ?? null
}
