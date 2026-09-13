type ScoreProps = {
  correctCount: number
  totalQuestions: number
  questionNumber: number
}

/** 「第 3 問 / 正解 2 / 10」のような進行とスコアの表示。 */
export function Score({ correctCount, totalQuestions, questionNumber }: ScoreProps) {
  const progress = Math.round(((questionNumber - 1) / totalQuestions) * 100)

  return (
    <div className="w-full sm:w-64">
      <div className="mb-1 flex items-baseline justify-between text-sm">
        <span className="text-slate-400">
          第 <span className="font-semibold text-slate-100">{questionNumber}</span> 問
        </span>
        <span className="text-slate-400">
          正解{' '}
          <span className="font-semibold text-indigo-300">
            {correctCount} / {totalQuestions}
          </span>
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
        <div
          className="h-full rounded-full bg-indigo-400 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
