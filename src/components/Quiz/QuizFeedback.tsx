import type { ReactNode } from 'react'
import type { AnswerResult } from '../../hooks/useGame'

type QuizFeedbackProps = {
  result: AnswerResult | null
  /** 正解の内容（例: 「Cm（C E♭ G）」）。 */
  answerLabel?: string
  lesson?: ReactNode
  onNext: () => void
  nextLabel?: string
}

export function QuizFeedback({
  result,
  answerLabel,
  lesson,
  onNext,
  nextLabel = '次の問題',
}: QuizFeedbackProps) {
  if (!result) return null

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-lg font-semibold">
          {result === 'correct' ? (
            <span className="text-emerald-300">正解！</span>
          ) : (
            <span className="text-rose-300">不正解</span>
          )}
          {answerLabel ? (
            <span className="ml-2 text-sm font-normal text-slate-400">正解は {answerLabel}</span>
          ) : null}
        </p>
        <button
          type="button"
          onClick={onNext}
          className="w-full rounded-lg bg-indigo-500 px-5 py-2.5 font-medium text-white transition-colors hover:bg-indigo-400 sm:w-auto"
        >
          {nextLabel}
        </button>
      </div>
      {lesson ? <div className="text-sm leading-relaxed text-slate-300">{lesson}</div> : null}
    </div>
  )
}
