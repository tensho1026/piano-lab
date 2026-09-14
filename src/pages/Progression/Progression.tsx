import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GameLayout } from '../../components/GameLayout/GameLayout'
import { usePiano } from '../../hooks/usePiano'
import { chordNotes } from '../../music/chords'
import { KEY_TONICS, diatonicTriads } from '../../music/keys'
import type { KeyMode } from '../../music/keys'
import { createId } from '../../utils/random'
import { ProgressionHelp } from './ProgressionHelp'
import { PROGRESSION_PRESETS, resolvePreset } from '../../music/progressions'

type ProgressionItem = { id: string; symbol: string }

const BEATS_PER_CHORD = 4
const MIN_BPM = 40
const MAX_BPM = 200

export function Progression() {
  const { audio, status } = usePiano()
  const [tonic, setTonic] = useState<string>('C')
  const [mode, setMode] = useState<KeyMode>('major')
  const [bpm, setBpm] = useState(120)
  const [items, setItems] = useState<ProgressionItem[]>([])
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)

  const timersRef = useRef<number[]>([])
  const palette = useMemo(() => diatonicTriads(tonic, mode), [tonic, mode])

  const clearTimers = useCallback(() => {
    for (const timer of timersRef.current) window.clearTimeout(timer)
    timersRef.current = []
  }, [])

  const stop = useCallback(() => {
    clearTimers()
    audio.stopAll()
    setPlayingIndex(null)
  }, [audio, clearTimers])

  useEffect(
    () => () => {
      clearTimers()
      audio.stopAll()
    },
    [audio, clearTimers],
  )

  const play = useCallback(() => {
    if (items.length === 0) return
    clearTimers()
    audio.stopAll()

    const secondsPerChord = (BEATS_PER_CHORD * 60) / bpm
    items.forEach((item, index) => {
      const delay = index * secondsPerChord
      audio.playNotes(chordNotes(item.symbol), {
        delay,
        duration: secondsPerChord * 0.95,
      })
      timersRef.current.push(
        window.setTimeout(() => setPlayingIndex(index), delay * 1000),
      )
    })
    timersRef.current.push(
      window.setTimeout(
        () => setPlayingIndex(null),
        items.length * secondsPerChord * 1000,
      ),
    )
  }, [audio, bpm, clearTimers, items])

  const applyPreset = (presetId: string) => {
    const preset = PROGRESSION_PRESETS.find((candidate) => candidate.id === presetId)
    if (!preset) return
    if (preset.mode !== mode) setMode(preset.mode)
    const resolved = resolvePreset(preset, tonic)
    setItems(resolved.symbols.map((symbol) => ({ id: createId(), symbol })))
  }

  const addChord = (symbol: string) => {
    setItems((current) => [...current, { id: createId(), symbol }])
    audio.playNotes(chordNotes(symbol), { duration: 1.2 })
  }

  const removeChord = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id))
  }

  const moveChord = (index: number, direction: -1 | 1) => {
    setItems((current) => {
      const target = index + direction
      if (target < 0 || target >= current.length) return current
      const next = [...current]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const isPlaying = playingIndex !== null

  return (
    <GameLayout
      title="コード進行メーカー"
      description="Key のダイアトニックコードを並べて、1 コード 4 拍で再生します。"
    >
      <div className="flex flex-col gap-6">
        <ProgressionHelp tonic={tonic} mode={mode} />

        <section className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-8">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-slate-400">Key</span>
              <div className="flex gap-2">
                <select
                  value={tonic}
                  onChange={(event) => setTonic(event.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100"
                >
                  {KEY_TONICS.map((candidate) => (
                    <option key={candidate} value={candidate}>
                      {candidate}
                    </option>
                  ))}
                </select>
                <select
                  value={mode}
                  onChange={(event) => setMode(event.target.value as KeyMode)}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100"
                >
                  <option value="major">Major</option>
                  <option value="minor">Minor</option>
                </select>
              </div>
            </label>

            <label className="flex flex-1 flex-col gap-1.5 text-sm">
              <span className="text-slate-400">
                BPM <span className="font-semibold text-slate-100">{bpm}</span>
              </span>
              <input
                type="range"
                min={MIN_BPM}
                max={MAX_BPM}
                value={bpm}
                onChange={(event) => setBpm(Number(event.target.value))}
                className="w-full accent-indigo-400"
              />
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm text-slate-400">定番進行</p>
            <div className="flex flex-wrap gap-2">
              {PROGRESSION_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset.id)}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:border-indigo-400"
                >
                  {preset.name}
                  <span className="ml-1 text-slate-500">{preset.grades.join('–')}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm text-slate-400">コードを追加</p>
            <div className="flex flex-wrap gap-2">
              {palette.map((chord) => (
                <button
                  key={chord.symbol}
                  type="button"
                  onClick={() => addChord(chord.symbol)}
                  className="flex flex-col items-center rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 transition-colors hover:border-indigo-400 hover:bg-slate-700"
                >
                  <span className="font-semibold">{chord.symbol}</span>
                  <span className="text-[10px] text-slate-400">{chord.grade}</span>
                  <span className="font-mono text-[10px] text-slate-500">{chord.notes.join(' ')}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-400">
              進行（{items.length} コード / 1 コード {BEATS_PER_CHORD} 拍）
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={play}
                disabled={items.length === 0 || status === 'loading'}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
              >
                <span aria-hidden>▶</span> Play
              </button>
              <button
                type="button"
                onClick={stop}
                disabled={!isPlaying}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-5 py-2.5 font-semibold text-slate-200 transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span aria-hidden>■</span> Stop
              </button>
            </div>
          </div>

          {items.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-700 px-4 py-10 text-center text-sm text-slate-500">
              上のボタンからコードを追加してください
            </p>
          ) : (
            <ol className="flex flex-wrap gap-2">
              {items.map((item, index) => (
                <li
                  key={item.id}
                  className={[
                    'flex flex-col gap-1 rounded-xl border px-3 py-2 transition-colors',
                    playingIndex === index
                      ? 'border-indigo-400 bg-indigo-500/20'
                      : 'border-slate-700 bg-slate-800',
                  ].join(' ')}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">{item.symbol}</span>
                    <button
                      type="button"
                      aria-label={`${item.symbol} を削除`}
                      onClick={() => removeChord(item.id)}
                      className="rounded px-1 text-slate-400 transition-colors hover:bg-slate-700 hover:text-rose-300"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      aria-label={`${item.symbol} を左へ`}
                      onClick={() => moveChord(index, -1)}
                      disabled={index === 0}
                      className="rounded bg-slate-700 px-2 text-xs text-slate-200 transition-colors hover:bg-slate-600 disabled:opacity-30"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      aria-label={`${item.symbol} を右へ`}
                      onClick={() => moveChord(index, 1)}
                      disabled={index === items.length - 1}
                      className="rounded bg-slate-700 px-2 text-xs text-slate-200 transition-colors hover:bg-slate-600 disabled:opacity-30"
                    >
                      →
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </GameLayout>
  )
}
