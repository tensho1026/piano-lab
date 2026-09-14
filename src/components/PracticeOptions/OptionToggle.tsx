type OptionToggleProps = {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export function OptionToggle({ label, checked, onChange, disabled }: OptionToggleProps) {
  return (
    <label
      className={[
        'inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors',
        checked
          ? 'border-indigo-400 bg-indigo-500/15 text-slate-100'
          : 'border-slate-700 bg-slate-800 text-slate-300',
        disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:border-indigo-400',
      ].join(' ')}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="accent-indigo-400"
      />
      {label}
    </label>
  )
}
