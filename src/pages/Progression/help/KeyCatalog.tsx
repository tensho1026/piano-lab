import {
  CHORD_FUNCTION_LABELS,
  CHORD_QUALITY_LABELS,
  allKeyProfiles,
  type KeyProfile,
} from '../../../music/keys'
import { OctaveKeyboard } from './HelpDiagrams'

function KeyCard({ profile, active }: { profile: KeyProfile; active: boolean }) {
  return (
    <article
      className={[
        'rounded-xl border p-3',
        active ? 'border-indigo-400 bg-indigo-500/10' : 'border-slate-700 bg-slate-900/60',
      ].join(' ')}
    >
      <header className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-base font-semibold text-slate-100">{profile.label}</h3>
        {active ? (
          <span className="rounded-full bg-indigo-500/30 px-2 py-0.5 text-[10px] font-medium text-indigo-200">
            いま選択中
          </span>
        ) : null}
      </header>
      <dl className="grid grid-cols-1 gap-1 text-xs sm:grid-cols-2">
        <div>
          <dt className="text-slate-500">主音</dt>
          <dd className="font-medium text-slate-200">
            {profile.tonic}（{profile.tonicJa}）
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">調号</dt>
          <dd className="text-slate-200">{profile.keySignatureLabel}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-slate-500">音階</dt>
          <dd className="font-mono text-slate-100">{profile.scale.join('  ')}</dd>
          <dd className="text-slate-400">{profile.scaleJa.join('  ')}</dd>
        </div>
        <div>
          <dt className="text-slate-500">相対調</dt>
          <dd className="text-slate-200">{profile.relativeLabel}</dd>
        </div>
        <div>
          <dt className="text-slate-500">同主調</dt>
          <dd className="text-slate-200">{profile.parallelLabel}</dd>
        </div>
      </dl>
      <OctaveKeyboard
        highlighted={profile.scale}
        tonic={profile.tonic}
        caption={`${profile.label} の音階。濃い色が主音、明るい色が音階に含まれる音です。`}
      />
      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[28rem] text-left text-[11px]">
          <caption className="mb-1 text-left text-xs text-slate-400">
            ダイアトニックコード（構成音 = 根音・3度・5度）
          </caption>
          <thead className="text-slate-500">
            <tr>
              <th className="py-1 pr-2 font-medium">ディグリー</th>
              <th className="py-1 pr-2 font-medium">コード</th>
              <th className="py-1 pr-2 font-medium">種類</th>
              <th className="py-1 pr-2 font-medium">役割</th>
              <th className="py-1 font-medium">構成音</th>
            </tr>
          </thead>
          <tbody>
            {profile.triads.map((chord) => (
              <tr key={chord.grade} className="border-t border-slate-800">
                <td className="py-1 pr-2 font-mono text-slate-100">{chord.grade}</td>
                <td className="py-1 pr-2 font-semibold text-indigo-200">{chord.symbol}</td>
                <td className="py-1 pr-2 text-slate-300">{CHORD_QUALITY_LABELS[chord.quality]}</td>
                <td className="py-1 pr-2 text-slate-300">{CHORD_FUNCTION_LABELS[chord.function]}</td>
                <td className="py-1 font-mono text-slate-200">{chord.notes.join(' ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  )
}

export function KeyCatalog({
  mode,
  activeTonic,
}: {
  mode: 'major' | 'minor'
  activeTonic: string
}) {
  const profiles = allKeyProfiles(mode)
  return (
    <div className="grid grid-cols-1 gap-3">
      {profiles.map((profile) => (
        <KeyCard
          key={profile.label}
          profile={profile}
          active={profile.tonic === activeTonic && profile.mode === mode}
        />
      ))}
    </div>
  )
}

export function CurrentKeyDetail({ profile }: { profile: KeyProfile }) {
  return (
    <div className="space-y-3">
      <KeyCard profile={profile} active />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-xs">
          <caption className="mb-1 text-left text-slate-400">
            音階の各音の名前。メロディもコードも、この7音が材料です。
          </caption>
          <thead className="text-slate-500">
            <tr>
              <th className="py-1 pr-2 font-medium">順番</th>
              <th className="py-1 pr-2 font-medium">音名</th>
              <th className="py-1 pr-2 font-medium">ドレミ</th>
              <th className="py-1 font-medium">役割</th>
            </tr>
          </thead>
          <tbody>
            {profile.scale.map((note, index) => (
              <tr key={note} className="border-t border-slate-800">
                <td className="py-1 pr-2 text-slate-400">{index + 1}</td>
                <td className="py-1 pr-2 font-mono font-semibold text-slate-100">{note}</td>
                <td className="py-1 pr-2 text-slate-200">{profile.scaleJa[index]}</td>
                <td className="py-1 text-slate-300">{profile.scaleRoles[index]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
