import { useEffect } from 'react'
import { Link, useRouteError } from 'react-router'

function isStaleChunkError(error: unknown): boolean {
  const message =
    error instanceof Error ? error.message : typeof error === 'string' ? error : ''
  return /Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk [\dA-Za-z-]+ failed/i.test(
    message,
  )
}

/**
 * ルート全体のエラー画面。デプロイ直後に古い JS が古いチャンクを取りに行って
 * 失敗したときは、一度だけ自動で再読み込みする。
 */
export function RouteErrorPage() {
  const error = useRouteError()
  const staleChunk = isStaleChunkError(error)

  useEffect(() => {
    if (!staleChunk) return
    const key = 'piano-lab:reloaded-stale-chunk'
    if (sessionStorage.getItem(key) === '1') return
    sessionStorage.setItem(key, '1')
    window.location.reload()
  }, [staleChunk])

  const detail =
    error instanceof Error ? error.message : staleChunk ? 'モジュールの読み込みに失敗しました' : '予期しないエラーが起きました'

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-center">
        <p className="text-sm font-medium tracking-widest text-indigo-300 uppercase">Error</p>
        <h1 className="mt-3 text-xl font-bold">画面を読み込めませんでした</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          {staleChunk
            ? '新しいバージョンが公開されたため、古いファイルを読みにいって失敗した可能性があります。再読み込みすると直ることが多いです。'
            : '一時的な問題のことがあります。再読み込みするか、ホームに戻ってください。'}
        </p>
        <p className="mt-2 break-all text-xs text-slate-600">{detail}</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg bg-indigo-500 px-5 py-2.5 font-medium text-white transition-colors hover:bg-indigo-400"
          >
            再読み込み
          </button>
          <Link
            to="/"
            className="rounded-lg border border-slate-700 px-5 py-2.5 font-medium text-slate-200 transition-colors hover:bg-slate-800"
          >
            ホーム
          </Link>
        </div>
      </div>
    </div>
  )
}
