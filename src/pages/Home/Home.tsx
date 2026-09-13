import { Link } from 'react-router'
import { AudioStatus } from '../../components/AudioStatus/AudioStatus'
import { Piano } from '../../components/Piano/Piano'
import { FEATURES } from '../../app/features'

export function Home() {
  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:py-16">
        <header className="flex flex-col gap-4">
          <AudioStatus />
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Piano Trainer</h1>
          <p className="text-slate-400 sm:text-lg">耳と演奏を鍛えるピアノトレーニング</p>
        </header>

        <section className="mt-8 grid grid-cols-1 gap-3 sm:mt-12 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Link
              key={feature.path}
              to={feature.path}
              className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition-colors hover:border-indigo-400 hover:bg-slate-800/80"
            >
              <span aria-hidden className="text-2xl">
                {feature.icon}
              </span>
              <h2 className="mt-3 text-lg font-semibold group-hover:text-indigo-200">
                {feature.title}
              </h2>
              <p className="mt-1 text-sm text-slate-400">{feature.description}</p>
            </Link>
          ))}
        </section>

        <section className="mt-10 sm:mt-14">
          <div className="mb-3 flex flex-col gap-1">
            <h2 className="text-xl font-semibold">自由に弾く</h2>
            <p className="text-sm text-slate-400">
              クリック・タッチ・PC キーボード（A W S E D F T G Y H U J K）で C3〜C6 を演奏できます。
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3 sm:p-5">
            <Piano />
          </div>
        </section>
      </div>
    </div>
  )
}
