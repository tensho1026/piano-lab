import { Note } from 'tonal'

/** オクターブまで含めて同じ音か（異名同音は同一とみなす）。 */
export function isSameNote(a: string, b: string): boolean {
  const midiA = Note.midi(a)
  const midiB = Note.midi(b)
  return midiA !== null && midiA === midiB
}

/** オクターブを無視して音名だけ一致するか。 */
export function isSamePitchClass(a: string, b: string): boolean {
  const chromaA = Note.chroma(a)
  const chromaB = Note.chroma(b)
  return chromaA !== undefined && chromaA === chromaB
}

/** 低い音から高い音の順に並べ替える。 */
export function sortNotes(notes: readonly string[]): string[] {
  return [...notes].sort((a, b) => (Note.midi(a) ?? 0) - (Note.midi(b) ?? 0))
}

/** 順番を無視して、音の集合が完全に一致するか。 */
export function isSameNoteSet(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false
  const sortedA = sortNotes(a)
  const sortedB = sortNotes(b)
  return sortedA.every((note, index) => isSameNote(note, sortedB[index]))
}
