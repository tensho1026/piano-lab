type ReplayButtonProps = {
  onClick: () => void
  label?: string
  disabled?: boolean
}

/** 問題の音をもう一度鳴らすボタン。再生回数は無制限。 */
export function ReplayButton({ onClick, label = 'もう一度聴く', disabled }: ReplayButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
    >
      <span aria-hidden className="text-lg leading-none">
        ▶
      </span>
      {label}
    </button>
  )
}
