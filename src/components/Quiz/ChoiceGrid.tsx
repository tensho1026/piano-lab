type ChoiceGridProps = {
  choices: readonly string[]
  /** 選択肢の表示ラベル（省略時は値をそのまま表示）。 */
  labelOf?: (choice: string) => string
  /** 正解の値。回答後に緑で示す。 */
  answer: string
  /** ユーザーが選んだ値。未回答なら null。 */
  selected: string | null
  onSelect: (choice: string) => void
  disabled?: boolean
}

export function ChoiceGrid({
  choices,
  labelOf,
  answer,
  selected,
  onSelect,
  disabled = false,
}: ChoiceGridProps) {
  const answered = selected !== null

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
      {choices.map((choice) => {
        const isAnswer = choice === answer
        const isSelected = choice === selected
        const tone = !answered
          ? 'border-slate-700 bg-slate-800/80 hover:border-indigo-400 hover:bg-slate-700'
          : isAnswer
            ? 'border-emerald-400 bg-emerald-500/20 text-emerald-100'
            : isSelected
              ? 'border-rose-400 bg-rose-500/20 text-rose-100'
              : 'border-slate-800 bg-slate-900/60 text-slate-500'

        return (
          <button
            key={choice}
            type="button"
            disabled={disabled || answered}
            onClick={() => onSelect(choice)}
            className={`rounded-xl border px-3 py-4 text-base font-semibold transition-colors disabled:cursor-default ${tone}`}
          >
            {labelOf ? labelOf(choice) : choice}
          </button>
        )
      })}
    </div>
  )
}
