import { Note } from 'tonal'
import { KEY_TONICS, relativeMinorTonic, solfegeOf } from '../../../music/keys'

const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const
const BLACK_KEYS: { pc: string; leftPercent: number }[] = [
  { pc: 'C#', leftPercent: 10.5 },
  { pc: 'D#', leftPercent: 25.0 },
  { pc: 'F#', leftPercent: 53.8 },
  { pc: 'G#', leftPercent: 68.2 },
  { pc: 'A#', leftPercent: 82.6 },
]

function chromaSet(notes: readonly string[]): Set<number> {
  return new Set(notes.map((note) => Note.chroma(note) ?? -1).filter((chroma) => chroma >= 0))
}

type OctaveKeyboardProps = {
  highlighted: readonly string[]
  tonic?: string
  caption: string
}

/** 1オクターブの鍵盤図。音階や構成音を色で示す。 */
export function OctaveKeyboard({ highlighted, tonic, caption }: OctaveKeyboardProps) {
  const chromas = chromaSet(highlighted)
  const tonicChroma = tonic ? Note.chroma(tonic) : null

  return (
    <figure className="space-y-2">
      <div className="relative mx-auto h-28 max-w-md" aria-hidden>
        <div className="absolute inset-0 flex">
          {WHITE_KEYS.map((pc) => {
            const chroma = Note.chroma(pc) ?? 0
            const on = chromas.has(chroma)
            const isTonic = tonicChroma === chroma
            return (
              <div
                key={pc}
                className={[
                  'flex flex-1 flex-col justify-end border border-slate-700 pb-1 text-center text-[10px] font-semibold',
                  isTonic
                    ? 'bg-indigo-300 text-indigo-950'
                    : on
                      ? 'bg-sky-200 text-slate-900'
                      : 'bg-slate-100 text-slate-500',
                ].join(' ')}
              >
                {pc}
              </div>
            )
          })}
        </div>
        {BLACK_KEYS.map((key) => {
          const chroma = Note.chroma(key.pc) ?? 0
          const on = chromas.has(chroma)
          const isTonic = tonicChroma === chroma
          return (
            <div
              key={key.pc}
              style={{ left: `${key.leftPercent}%` }}
              className={[
                'absolute top-0 z-10 h-[62%] w-[8.5%] rounded-b border border-slate-950 text-center text-[9px] font-semibold leading-[2.2rem]',
                isTonic
                  ? 'bg-indigo-400 text-indigo-950'
                  : on
                    ? 'bg-sky-400 text-slate-950'
                    : 'bg-slate-900 text-slate-400',
              ].join(' ')}
            >
              {key.pc}
            </div>
          )
        })}
      </div>
      <figcaption className="text-xs text-slate-400">{caption}</figcaption>
    </figure>
  )
}

type StackedThirdsProps = {
  notes: readonly string[]
  labels: readonly string[]
  title: string
}

/** 三和音が「3度ずつ積む」ことを示す図。 */
export function StackedThirds({ notes, labels, title }: StackedThirdsProps) {
  return (
    <figure className="space-y-2">
      <p className="text-xs font-medium text-slate-200">{title}</p>
      <div className="flex items-end gap-3">
        <div className="flex flex-col-reverse gap-1">
          {notes.map((note, index) => (
            <div
              key={`${note}-${index}`}
              className="flex w-40 items-center justify-between rounded-lg border border-indigo-400/50 bg-indigo-500/15 px-3 py-1.5"
            >
              <span className="text-xs text-slate-400">{labels[index]}</span>
              <span className="font-mono font-semibold text-indigo-100">
                {note}（{solfegeOf(note)}）
              </span>
            </div>
          ))}
        </div>
        <p className="max-w-[14rem] text-xs text-slate-400">
          下から根音 → 3度 → 5度。隣どうしは「1音飛ばし」（3度）です。
        </p>
      </div>
    </figure>
  )
}

type FunctionFlowProps = {
  items: { grade: string; symbol: string; role: string }[]
}

/** I → IV → V → I のような役割の流れ。 */
export function FunctionFlow({ items }: FunctionFlowProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((item, index) => (
        <div key={`${item.grade}-${index}`} className="flex items-center gap-2">
          <div className="rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-center">
            <p className="font-mono text-base font-semibold text-slate-100">{item.grade}</p>
            <p className="text-xs text-indigo-200">{item.symbol}</p>
            <p className="text-[10px] text-slate-400">{item.role}</p>
          </div>
          {index < items.length - 1 ? (
            <span aria-hidden className="text-lg text-slate-500">
              →
            </span>
          ) : null}
        </div>
      ))}
    </div>
  )
}

/** 五度圏。外側が長調、内側が相対短調。 */
export function CircleOfFifths({
  activeTonic,
  activeMode,
}: {
  activeTonic: string
  activeMode: 'major' | 'minor'
}) {
  const size = 340
  const cx = size / 2
  const cy = size / 2
  const outerR = 132
  const innerR = 86

  return (
    <figure className="space-y-2">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="mx-auto h-auto w-full max-w-sm text-slate-200"
        role="img"
        aria-label="五度圏。時計回りに完全5度ずつ進むと、シャープが1つずつ増える。"
      >
        <circle cx={cx} cy={cy} r={outerR + 28} fill="#0f172a" stroke="#334155" />
        <circle cx={cx} cy={cy} r={(outerR + innerR) / 2} fill="none" stroke="#1e293b" strokeWidth="44" />
        <circle cx={cx} cy={cy} r={innerR - 28} fill="#020617" stroke="#334155" />
        <text x={cx} y={cy - 6} textAnchor="middle" className="fill-slate-400" fontSize="11">
          五度圏
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" className="fill-slate-500" fontSize="9">
          時計回り = ♯が増える
        </text>
        {KEY_TONICS.map((tonic, index) => {
          const angle = ((index * 30 - 90) * Math.PI) / 180
          const ox = cx + Math.cos(angle) * outerR
          const oy = cy + Math.sin(angle) * outerR
          const ix = cx + Math.cos(angle) * innerR
          const iy = cy + Math.sin(angle) * innerR
          const relative = relativeMinorTonic(tonic)
          const majorOn = activeMode === 'major' && activeTonic === tonic
          const minorOn = activeMode === 'minor' && activeTonic === relative
          const parallelOn = activeMode === 'minor' && activeTonic === tonic
          return (
            <g key={tonic}>
              <text
                x={ox}
                y={oy + 4}
                textAnchor="middle"
                fontSize="13"
                fontWeight={majorOn ? 700 : 600}
                className={majorOn || parallelOn ? 'fill-indigo-300' : 'fill-slate-200'}
              >
                {tonic}
              </text>
              <text
                x={ix}
                y={iy + 4}
                textAnchor="middle"
                fontSize="11"
                fontWeight={minorOn ? 700 : 500}
                className={minorOn ? 'fill-indigo-300' : 'fill-slate-400'}
              >
                {relative}m
              </text>
            </g>
          )
        })}
      </svg>
      <figcaption className="text-xs text-slate-400">
        外側が長調の主音、内側が同じ調号を持つ相対短調です。隣どうしは完全5度（ピアノで7半音）離れています。今選んでいる調は明るい色です。
      </figcaption>
    </figure>
  )
}
