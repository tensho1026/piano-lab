import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePiano } from '../../hooks/usePiano'
import { NOTE_TO_KEY_LABEL, useKeyboardPiano } from '../../hooks/useKeyboardPiano'
import { KEYBOARD_HIGHEST, KEYBOARD_LOWEST, buildPianoKeys } from '../../music/notes'
import type { PianoNote } from '../../types/music'

export type PianoProps = {
  from?: string
  to?: string
  /** 回答として選択中の音（和音耳コピなどで押した状態を保持する）。 */
  selectedNotes?: readonly string[]
  /** 正解提示などで強調表示する音。 */
  highlightNotes?: readonly string[]
  onNoteOn?: (note: PianoNote) => void
  onNoteOff?: (note: PianoNote) => void
  /** 鍵盤を押したときに自分で発音するか。 */
  playSound?: boolean
  disabled?: boolean
  /** PC キーボードでの演奏を有効にするか。 */
  keyboardEnabled?: boolean
  /** 白鍵に PC キーボードの割り当てを表示するか。 */
  showKeyLabels?: boolean
  /** 白鍵に音名を表示するか（初見演奏では答えになるので隠す）。 */
  showNoteNames?: boolean
}

/** ハイライトを最低これだけ表示する（ミリ秒）。 */
const MIN_HIGHLIGHT_MS = 160

export function Piano({
  from = KEYBOARD_LOWEST,
  to = KEYBOARD_HIGHEST,
  selectedNotes = [],
  highlightNotes = [],
  onNoteOn,
  onNoteOff,
  playSound = true,
  disabled = false,
  keyboardEnabled = true,
  showKeyLabels = true,
  showNoteNames = true,
}: PianoProps) {
  const { audio, unlock } = usePiano()
  const keys = useMemo(() => buildPianoKeys(from, to), [from, to])
  const whiteCount = useMemo(() => keys.filter((key) => !key.isBlack).length, [keys])

  const [pressed, setPressed] = useState<readonly string[]>([])
  /** 発音中の鍵盤と、その押下開始時刻。 */
  const pressedRef = useRef<Map<string, number>>(new Map())
  /** ハイライト表示中の鍵盤。短い打鍵でも見えるよう発音より長く残る。 */
  const highlightedRef = useRef<Set<string>>(new Set())
  const fadeTimersRef = useRef<Map<string, number>>(new Map())
  const pointerActive = useRef(false)

  const syncHighlight = useCallback(() => {
    setPressed([...highlightedRef.current])
  }, [])

  const press = useCallback(
    (note: PianoNote) => {
      if (disabled || pressedRef.current.has(note)) return
      pressedRef.current.set(note, performance.now())

      const fadeTimer = fadeTimersRef.current.get(note)
      if (fadeTimer !== undefined) {
        window.clearTimeout(fadeTimer)
        fadeTimersRef.current.delete(note)
      }
      highlightedRef.current.add(note)
      syncHighlight()

      unlock()
      if (playSound) audio.playNote(note)
      onNoteOn?.(note)
    },
    [audio, disabled, onNoteOn, playSound, syncHighlight, unlock],
  )

  const release = useCallback(
    (note: PianoNote) => {
      const pressedAt = pressedRef.current.get(note)
      if (pressedAt === undefined) return
      pressedRef.current.delete(note)
      if (playSound) audio.stopNote(note)
      onNoteOff?.(note)

      // キーを叩くように一瞬押しただけでもハイライトが見えるようにする。
      const remaining = MIN_HIGHLIGHT_MS - (performance.now() - pressedAt)
      if (remaining <= 0) {
        highlightedRef.current.delete(note)
        syncHighlight()
        return
      }
      fadeTimersRef.current.set(
        note,
        window.setTimeout(() => {
          fadeTimersRef.current.delete(note)
          if (pressedRef.current.has(note)) return
          highlightedRef.current.delete(note)
          syncHighlight()
        }, remaining),
      )
    },
    [audio, onNoteOff, playSound, syncHighlight],
  )

  const releaseAll = useCallback(() => {
    for (const note of [...pressedRef.current.keys()]) release(note as PianoNote)
  }, [release])

  useKeyboardPiano({ onNoteOn: press, onNoteOff: release, enabled: keyboardEnabled && !disabled })

  useEffect(() => {
    const handleUp = () => {
      pointerActive.current = false
      releaseAll()
    }
    window.addEventListener('pointerup', handleUp)
    window.addEventListener('pointercancel', handleUp)
    return () => {
      window.removeEventListener('pointerup', handleUp)
      window.removeEventListener('pointercancel', handleUp)
    }
  }, [releaseAll])

  useEffect(() => {
    const fadeTimers = fadeTimersRef.current
    return () => {
      for (const timer of fadeTimers.values()) window.clearTimeout(timer)
      fadeTimers.clear()
    }
  }, [])

  const whiteWidth = 100 / whiteCount
  const blackWidth = whiteWidth * 0.62

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div
        className="relative h-40 min-w-[700px] touch-none select-none sm:h-48"
        role="group"
        aria-label="ピアノ鍵盤"
      >
        <div className="flex h-full w-full">
          {keys
            .filter((key) => !key.isBlack)
            .map((key) => {
              const isPressed = pressed.includes(key.note)
              const isSelected = selectedNotes.includes(key.note)
              const isHighlighted = highlightNotes.includes(key.note)
              return (
                <button
                  key={key.note}
                  type="button"
                  aria-label={key.note}
                  aria-pressed={isSelected || isPressed}
                  disabled={disabled}
                  onPointerDown={(event) => {
                    event.preventDefault()
                    pointerActive.current = true
                    press(key.note)
                  }}
                  onPointerEnter={() => {
                    if (pointerActive.current) press(key.note)
                  }}
                  onPointerLeave={() => release(key.note)}
                  className={[
                    'relative flex flex-1 items-end justify-center rounded-b-md border border-slate-400/70 pb-2 text-[10px] font-medium transition-colors',
                    isPressed
                      ? 'bg-indigo-300 text-indigo-950'
                      : isHighlighted
                        ? 'bg-emerald-200 text-emerald-950'
                        : isSelected
                          ? 'bg-indigo-200 text-indigo-950'
                          : 'bg-white text-slate-400 hover:bg-slate-100',
                    disabled ? 'cursor-not-allowed' : 'cursor-pointer',
                  ].join(' ')}
                >
                  <span className="pointer-events-none flex flex-col items-center gap-0.5">
                    {showKeyLabels && NOTE_TO_KEY_LABEL[key.note] ? (
                      <span className="rounded border border-slate-300 px-1 text-[9px] text-slate-500">
                        {NOTE_TO_KEY_LABEL[key.note]}
                      </span>
                    ) : null}
                    {showNoteNames ? <span>{key.note}</span> : null}
                  </span>
                </button>
              )
            })}
        </div>

        {keys
          .filter((key) => key.isBlack)
          .map((key) => {
            const isPressed = pressed.includes(key.note)
            const isSelected = selectedNotes.includes(key.note)
            const isHighlighted = highlightNotes.includes(key.note)
            return (
              <button
                key={key.note}
                type="button"
                aria-label={key.note}
                aria-pressed={isSelected || isPressed}
                disabled={disabled}
                onPointerDown={(event) => {
                  event.preventDefault()
                  pointerActive.current = true
                  press(key.note)
                }}
                onPointerEnter={() => {
                  if (pointerActive.current) press(key.note)
                }}
                onPointerLeave={() => release(key.note)}
                style={{
                  left: `calc(${key.whiteIndex * whiteWidth}% - ${blackWidth / 2}%)`,
                  width: `${blackWidth}%`,
                }}
                className={[
                  'absolute top-0 z-10 flex h-[62%] items-end justify-center rounded-b-md border border-slate-900 pb-1 text-[9px] font-medium transition-colors',
                  isPressed
                    ? 'bg-indigo-500 text-white'
                    : isHighlighted
                      ? 'bg-emerald-500 text-white'
                      : isSelected
                        ? 'bg-indigo-400 text-white'
                        : 'bg-slate-900 text-slate-500 hover:bg-slate-800',
                  disabled ? 'cursor-not-allowed' : 'cursor-pointer',
                ].join(' ')}
              >
                <span className="pointer-events-none flex flex-col items-center gap-0.5">
                  {showKeyLabels && NOTE_TO_KEY_LABEL[key.note] ? (
                    <span className="rounded border border-slate-600 px-1 text-[9px]">
                      {NOTE_TO_KEY_LABEL[key.note]}
                    </span>
                  ) : null}
                </span>
              </button>
            )
          })}
      </div>
    </div>
  )
}
