import { useEffect, useRef, useState } from 'react'
// Bravura のみを含むエントリを使い、未使用フォントをバンドルから外す。
import { Accidental, Formatter, Renderer, Stave, StaveNote } from 'vexflow/bravura'
import type { ClefName } from '../../types/music'

export type NoteState = 'done' | 'current' | 'pending'

type MusicNotationProps = {
  notes: readonly string[]
  clef: ClefName
  /** 次に弾くべき音のインデックス。 */
  currentIndex?: number
}

const NOTE_COLORS: Record<NoteState, string> = {
  done: '#059669',
  current: '#4f46e5',
  pending: '#0f172a',
}

const STAVE_HEIGHT = 170
const NOTE_SPACING = 58

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

/** VexFlow で単音の並びを五線譜に描画する。 */
export function MusicNotation({ notes, clef, currentIndex = -1 }: MusicNotationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [fontsReady, setFontsReady] = useState(false)

  // 楽譜フォント（Bravura）の読み込み前に描画すると音符が欠けるので待つ。
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

    const width = Math.max(300, notes.length * NOTE_SPACING + 110)
    const renderer = new Renderer(container, Renderer.Backends.SVG)
    renderer.resize(width, STAVE_HEIGHT)
    const context = renderer.getContext()

    const stave = new Stave(10, 25, width - 25)
    stave.addClef(clef)
    stave.setContext(context).draw()

    const staveNotes = notes.map((note, index) => {
      const staveNote = new StaveNote({ keys: [toVexKey(note)], duration: 'q', clef })
      const accidental = accidentalOf(note)
      if (accidental) {
        staveNote.addModifier(new Accidental(accidental), 0)
      }
      const state: NoteState =
        currentIndex < 0
          ? 'pending'
          : index < currentIndex
            ? 'done'
            : index === currentIndex
              ? 'current'
              : 'pending'
      const color = NOTE_COLORS[state]
      staveNote.setStyle({ fillStyle: color, strokeStyle: color })
      return staveNote
    })

    Formatter.FormatAndDraw(context, stave, staveNotes)

    return () => container.replaceChildren()
  }, [notes, clef, currentIndex, fontsReady])

  return (
    <div
      style={{ minHeight: STAVE_HEIGHT }}
      className="flex w-full items-center justify-center overflow-x-auto rounded-xl bg-white py-2 text-sm text-slate-400"
      role="img"
      aria-label={`${clef === 'treble' ? 'ト音記号' : 'ヘ音記号'}の楽譜: ${notes.join(' ')}`}
    >
      {fontsReady ? null : <span>楽譜フォントを読み込み中…</span>}
      <div ref={containerRef} />
    </div>
  )
}
