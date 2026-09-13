import { Link } from 'react-router'

type GameResultProps = {
  correctCount: number
  totalQuestions: number
  accuracy: number
  onRetry: () => void
}

/** 1 セット終了後の結果画面。 */
export function GameResult({
  correctCount,
  totalQuestions,
  accuracy,
  onRetry,
}: GameResultProps) {
  return (
    <section className="mx-auto max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-center">
      <p className="text-sm font-medium tracking-widest text-indigo-300 uppercase">Result</p>
      <p className="mt-4 text-5xl font-bold">
        {correctCount} <span className="text-slate-500">/ {totalQuestions}</span>
      </p>
      <p className="mt-2 text-slate-400">正答率 {accuracy}%</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-indigo-500 px-5 py-2.5 font-medium text-white transition-colors hover:bg-indigo-400"
        >
          もう一度
        </button>
        <Link
          to="/"
          className="rounded-lg border border-slate-700 px-5 py-2.5 font-medium text-slate-200 transition-colors hover:bg-slate-800"
        >
          ホーム
        </Link>
      </div>
    </section>
  )
}
