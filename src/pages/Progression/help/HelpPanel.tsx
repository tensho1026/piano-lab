import { useId, useState, type ReactNode } from 'react'

type HelpPanelProps = {
  title: string
  children: ReactNode
}

export function HelpPanel({ title, children }: HelpPanelProps) {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  return (
    <div className="rounded-xl border border-slate-700/80 bg-slate-950/40">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800/70"
      >
        <span>{title}</span>
        <span
          aria-hidden
          className={[
            'inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-slate-600 text-xs text-slate-300 transition-transform',
            open ? 'rotate-180' : '',
          ].join(' ')}
        >
          ▾
        </span>
      </button>
      {open ? (
        <div
          id={panelId}
          className="space-y-3 border-t border-slate-800 px-3 py-3 text-sm leading-relaxed text-slate-300"
        >
          {children}
        </div>
      ) : null}
    </div>
  )
}

export function Term({ children }: { children: ReactNode }) {
  return <span className="font-semibold text-slate-100">{children}</span>
}
