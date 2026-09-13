import type { Difficulty } from '../../types/game'
import { DIFFICULTY_LABELS } from './difficultyLabels'

type DifficultySelectorProps = {
  value: Difficulty
  onChange: (value: Difficulty) => void
  options?: readonly Difficulty[]
  /** 難易度ごとの補足説明。 */
  hints?: Partial<Record<Difficulty, string>>
}

export function DifficultySelector({
  value,
  onChange,
  options = ['easy', 'normal'],
  hints,
}: DifficultySelectorProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="inline-flex w-fit rounded-lg bg-slate-800 p-1"
        role="group"
        aria-label="難易度"
      >
        {options.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
            className={[
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              value === option
                ? 'bg-indigo-500 text-white'
                : 'text-slate-300 hover:bg-slate-700 hover:text-white',
            ].join(' ')}
          >
            {DIFFICULTY_LABELS[option]}
          </button>
        ))}
      </div>
      {hints?.[value] ? <p className="text-xs text-slate-400">{hints[value]}</p> : null}
    </div>
  )
}
