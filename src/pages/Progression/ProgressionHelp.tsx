import { useId, useState, type ReactNode } from 'react'

type HelpPanelProps = {
  title: string
  children: ReactNode
}

function HelpPanel({ title, children }: HelpPanelProps) {
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
            'inline-flex size-6 items-center justify-center rounded-full border border-slate-600 text-xs text-slate-300 transition-transform',
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

function Term({ children }: { children: ReactNode }) {
  return <span className="font-semibold text-slate-100">{children}</span>
}

/** 調とコード進行の解説。初期状態では閉じておき、ボタンで開く。 */
export function ProgressionHelp() {
  return (
    <section className="flex flex-col gap-2">
      <p className="text-xs text-slate-500">わからない言葉があれば、下のボタンから説明を開けます。</p>
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        <HelpPanel title="調（キー）とは？">
          <p>
            <Term>調（キー）</Term>
            は、その曲がどの音を中心にして、どの音階で進むかを決める枠組みです。画面上の{' '}
            <Term>Key</Term> がこれにあたります。
          </p>
          <p>
            中心になる音を <Term>主音（トニック）</Term> と呼びます。たとえば Key を{' '}
            <Term>C Major</Term> にすると、主音は C（ド）で、使う音階は「ドレミファソラシド」です。
            <Term>A Minor</Term> なら主音は A（ラ）で、音階は「ラシドレミファソラ」になります。同じ 7
            音でも、どこを起点にするかで響きの性格が変わります。
          </p>
          <p>
            <Term>Major（長調）</Term> は明るく安定した響き、<Term>Minor（短調）</Term>{' '}
            は少し暗く切ない響きになりやすい、と覚えるとよいです。厳密には曲の雰囲気はメロディやリズムでも決まりますが、調はその土台です。
          </p>
          <p>
            ある調の音階に含まれる音だけで作った和音を <Term>ダイアトニックコード</Term> と呼びます。C
            Major なら白鍵の音（C D E F G A B）から作るので、パレットは{' '}
            <Term>C / Dm / Em / F / G / Am / Bdim</Term> になります。Key を変えると、同じ役割の和音が別の音名に移調されます（例: G Major なら G / Am / Bm / C / D / Em / F#dim）。
          </p>
          <p>
            コードの下に小さく書いてある <Term>I, ii, iii, IV, V, vi, vii°</Term> は{' '}
            <Term>ディグリーネーム</Term>
            です。主音からの何番目の和音かをローマ数字で表します。大文字はメジャー、小文字はマイナー、°
            はディミニッシュ（減三和音）です。
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <Term>I（トニック）</Term> … その調の「家」。落ち着いて終わる音。
            </li>
            <li>
              <Term>IV（サブドミナント）</Term> … 少し動き出した感じ。I や V へ進みやすい。
            </li>
            <li>
              <Term>V（ドミナント）</Term> … 緊張感が強く、I に戻りたくなる和音。
            </li>
            <li>
              <Term>vi（サブメディアント）</Term> … 長調では相対短調の主和音。少し寂しさが出る。
            </li>
            <li>
              <Term>ii / iii / vii°</Term> … つなぎや、ツーファイブ（ii → V → I）などで使う。
            </li>
          </ul>
          <p>
            短調のパレットは <Term>i / ii° / III / iv / v / VI / VII</Term>{' '}
            です。自然短音階ベースなので、ポップスでよく出る「V をメジャーにする（和声的短音階）」まではこの画面では出していません。まずはこの 7 つで、調の中でどのコードが安定して、どれが動きやすいかを耳で確かめてください。
          </p>
        </HelpPanel>

        <HelpPanel title="コード進行とは？">
          <p>
            <Term>コード進行</Term>
            は、和音を時間の順番に並べた設計図です。メロディが「横」に流れるのに対し、コード進行は曲の「土台」として何小節かに一度、響きを切り替えます。
          </p>
          <p>
            この画面では <Term>1 コード = 4 拍</Term>（4/4 拍子の 1 小節）で鳴らします。
            <Term>BPM</Term> は 1 分間の拍の数です。BPM 120 なら 1 拍が 0.5 秒、1
            コードは 2 秒続きます。遅くすると和音の移り変わりが聴き取りやすくなります。
          </p>
          <p>
            進行の良し悪しは「次にどれへ行きたくなるか」で決まります。よく使う流れは次のとおりです。
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <Term>I → V → vi → IV</Term>（C なら C–G–Am–F）… ポップスで非常によく出る進行。明るい主和音から始まり、V
              で少し張り、vi で影が差し、IV でまた動き出す。
            </li>
            <li>
              <Term>I → vi → IV → V</Term>（C–Am–F–G）… 50〜60 年代の「カノン進行」に近い定番。最後の V
              が I に戻りたくなるので、ループしやすい。
            </li>
            <li>
              <Term>ii → V → I</Term>（C なら Dm–G–C）… ジャズの基本。緊張（ii→V）から解決（I）へ。
            </li>
            <li>
              <Term>I → IV → V → I</Term> … ブルースやフォークの骨格。行きと帰りがはっきりしている。
            </li>
          </ul>
          <p>
            終わり方（カデンツ）もポイントです。<Term>V → I</Term> は「完全に着地した」感じ、
            <Term>IV → I</Term> はやわらかく終わる感じ、<Term>V → vi</Term>{' '}
            は終わると思わせて短調へそらす「偽終止」です。再生しながら、どのつながりが落ち着くか／モヤっとするかを聴き比べてみてください。
          </p>
          <p>
            使い方は、上のパレットでコードを追加し、カードの <Term>×</Term> で削除、
            <Term>← →</Term> で順番を入れ替えます。<Term>Play</Term> で並べた順に 4
            拍ずつ鳴り、<Term>Stop</Term> で止まります。別の画面へ移ると音は自動で止まります。
          </p>
        </HelpPanel>
      </div>
    </section>
  )
}
