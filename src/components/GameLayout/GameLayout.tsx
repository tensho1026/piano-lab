import { Link } from 'react-router'
import type { ReactNode } from 'react'
import { AudioStatus } from '../AudioStatus/AudioStatus'

type GameLayoutProps = {
  title: string
  description?: string
  /** 難易度切り替えなどの操作。 */
  toolbar?: ReactNode
  /** スコア表示。 */
  score?: ReactNode
  children: ReactNode
}

export function GameLayout({ title, description, toolbar, score, children }: GameLayoutProps) {
  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-300 transition-colors hover:text-white"
          >
            <span aria-hidden>←</span> ホーム
          </Link>
          <AudioStatus />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
            {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
          </div>
          {toolbar || score ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              {toolbar}
              {score}
            </div>
          ) : null}
        </div>
        {children}
      </main>
    </div>
  )
}
