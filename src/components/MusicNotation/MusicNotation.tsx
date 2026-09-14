import { useEffect, useRef, useState } from 'react'
import { Accidental, Beam, Formatter, Renderer, Stave, StaveNote } from 'vexflow/bravura'
import type { ClefName } from '../../types/music'
import type { SightReadingEvent } from '../../types/game'

export type NoteState = 'done' | 'current' | 'pending'

type MusicNotationProps = {
  notes?: readonly string[]
  events?: readonly SightReadingEvent[]
  clef: ClefName
  /** 次に弾くべき音（休符を除いたノート列）のインデックス。 */
  currentIndex?: number
}

const NOTE_COLORS: Record<NoteState, string> = {
  done: '#059669',
  current: '#4f46e5',
  pending: '#0f172a',
}

const STAVE_HEIGHT = 170
const NOTE_SPACING = 52

/** "C#4" -> "c#/4" のように VexFlow のキー表記へ変換する。 */
function toVexKey(note: string): string {
  const match = /^([A-G])(#{0,2}|b{0,2})(-?\d+)$/.exec(note)
  if (!match) {
    throw new Error(`楽譜に描画できない音名です: ${note}`)
  }
  const [, letter, accidental, octave] = match
  return `${letter.toLowerCase()}${accidental}/${octave}`
}

function accidentalOf(note: string): string | null {
  if (note.includes('##')) return '##'
  if (note.includes('#')) return '#'
  if (note.includes('bb')) return 'bb'
  if (note.length > 1 && note[1] === 'b') return 'b'
  return null
}

function eventsFromNotes(notes: readonly string[]): SightReadingEvent[] {
  return notes.map((pitch) => ({ kind: 'note' as const, pitch, duration: 'q' as const }))
}

function vexDuration(event: SightReadingEvent): string {
  if (event.kind === 'rest') return event.duration === '8' ? '8r' : 'qr'
  return event.duration
}

/** VexFlow で単音の並びを五線譜に描画する。 */
export function MusicNotation({
  notes = [],
  events,
  clef,
  currentIndex = -1,
}: MusicNotationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [fontsReady, setFontsReady] = useState(false)
  const staffEvents = events ?? eventsFromNotes(notes)

  useEffect(() => {
    let cancelled = false
    void document.fonts.ready.then(() => {
      if (!cancelled) setFontsReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container || !fontsReady) return
    container.replaceChildren()

    const staff = events ?? eventsFromNotes(notes)
    const width = Math.max(300, staff.length * NOTE_SPACING + 110)
    const renderer = new Renderer(container, Renderer.Backends.SVG)
    renderer.resize(width, STAVE_HEIGHT)
    const context = renderer.getContext()

    const stave = new Stave(10, 25, width - 25)
    stave.addClef(clef)
    stave.setContext(context).draw()

    const restKey = clef === 'bass' ? 'd/3' : 'b/4'
    let noteIndex = -1
    const staveNotes = staff.map((event) => {
      if (event.kind === 'note') noteIndex += 1
      const thisNoteIndex = noteIndex
      const staveNote = new StaveNote({
        keys: [event.kind === 'rest' ? restKey : toVexKey(event.pitch)],
        duration: vexDuration(event),
        clef,
      })
      if (event.kind === 'note') {
        const accidental = accidentalOf(event.pitch)
        if (accidental) staveNote.addModifier(new Accidental(accidental), 0)
      }
      const state: NoteState =
        event.kind === 'rest' || currentIndex < 0
          ? 'pending'
          : thisNoteIndex < currentIndex
            ? 'done'
            : thisNoteIndex === currentIndex
              ? 'current'
              : 'pending'
      const color = NOTE_COLORS[state]
      staveNote.setStyle({ fillStyle: color, strokeStyle: color })
      return staveNote
    })

    Formatter.FormatAndDraw(context, stave, staveNotes)

    const beamGroups: InstanceType<typeof StaveNote>[][] = []
    let currentGroup: InstanceType<typeof StaveNote>[] = []
    staff.forEach((event, index) => {
      const staveNote = staveNotes[index]
      if (event.kind === 'note' && event.duration === '8') {
        currentGroup.push(staveNote)
        return
      }
      if (currentGroup.length > 1) beamGroups.push(currentGroup)
      currentGroup = []
    })
    if (currentGroup.length > 1) beamGroups.push(currentGroup)
    for (const group of beamGroups) {
      new Beam(group).setContext(context).draw()
    }

    return () => container.replaceChildren()
  }, [notes, events, clef, currentIndex, fontsReady])

  const label = staffEvents
    .map((event) => (event.kind === 'rest' ? '休符' : event.pitch))
    .join(' ')

  return (
    <div
      style={{ minHeight: STAVE_HEIGHT }}
      className="flex w-full items-center justify-center overflow-x-auto rounded-xl bg-white py-2 text-sm text-slate-400"
      role="img"
      aria-label={`${clef === 'treble' ? 'ト音記号' : 'ヘ音記号'}の楽譜: ${label}`}
    >
      {fontsReady ? null : <span>楽譜フォントを読み込み中…</span>}
      <div ref={containerRef} />
    </div>
  )
}
