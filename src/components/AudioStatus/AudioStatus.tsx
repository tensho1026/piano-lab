import { usePiano } from '../../hooks/usePiano'

/** ピアノ音源の読み込み状況を表示する小さなバッジ。 */
export function AudioStatus() {
  const { status, progress } = usePiano()

  if (status === 'ready') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
        <span className="size-1.5 rounded-full bg-emerald-400" />
        ピアノ音源 準備完了
      </span>
    )
  }

  if (status === 'fallback') {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300"
        title="サンプルを取得できなかったため簡易シンセ音で代替しています"
      >
        <span className="size-1.5 rounded-full bg-amber-400" />
        簡易音源で代替中
      </span>
    )
  }

  const percent = progress.total > 0 ? Math.round((progress.loaded / progress.total) * 100) : 0
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-500/10 px-3 py-1 text-xs font-medium text-slate-300">
      <span className="size-1.5 animate-pulse rounded-full bg-slate-400" />
      音源読み込み中 {percent}%
    </span>
  )
}
