import { keyProfile, type KeyMode } from '../../music/keys'
import { CircleOfFifths, FunctionFlow, OctaveKeyboard, StackedThirds } from './help/HelpDiagrams'
import { HelpPanel, Term } from './help/HelpPanel'
import { CurrentKeyDetail, KeyCatalog } from './help/KeyCatalog'

type ProgressionHelpProps = {
  tonic: string
  mode: KeyMode
}

/** 調とコード進行の解説。初期状態では閉じておき、ボタンで開く。 */
export function ProgressionHelp({ tonic, mode }: ProgressionHelpProps) {
  const current = keyProfile(tonic, mode)
  const tonicChord = current.triads[0]
  const subdominant = current.triads[3]
  const dominant = current.triads[4]

  return (
    <section className="flex flex-col gap-2">
      <p className="text-xs text-slate-500">
        音楽を初めて学ぶ人向けの説明です。上から順に開くと、音の名前 → 調 → 和音 →
        進行、の順で読めます。いま画面で選んでいる Key は{' '}
        <span className="font-medium text-slate-300">{current.label}</span> です。
      </p>
      <div className="flex flex-col gap-2">
        <HelpPanel title="1. 音の名前（ド・レ・ミ と C・D・E）">
          <p>
            ピアノの鍵盤には、それぞれ <Term>音名</Term> が付いています。日本語の学校では「ドレミファソラシ」、英語圏やコードネームでは{' '}
            <Term>C D E F G A B</Term> を使います。このアプリもコードは英語音名です。
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[22rem] text-left text-xs">
              <thead className="text-slate-500">
                <tr>
                  <th className="py-1 pr-3 font-medium">英語</th>
                  <th className="py-1 pr-3 font-medium">C</th>
                  <th className="py-1 pr-3 font-medium">D</th>
                  <th className="py-1 pr-3 font-medium">E</th>
                  <th className="py-1 pr-3 font-medium">F</th>
                  <th className="py-1 pr-3 font-medium">G</th>
                  <th className="py-1 pr-3 font-medium">A</th>
                  <th className="py-1 font-medium">B</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-800 text-slate-100">
                  <th className="py-1 pr-3 font-medium text-slate-500">ドレミ</th>
                  <td className="py-1 pr-3">ド</td>
                  <td className="py-1 pr-3">レ</td>
                  <td className="py-1 pr-3">ミ</td>
                  <td className="py-1 pr-3">ファ</td>
                  <td className="py-1 pr-3">ソ</td>
                  <td className="py-1 pr-3">ラ</td>
                  <td className="py-1">シ</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            白い鍵盤のあいだにある黒い鍵盤は、半音高い <Term>シャープ（♯）</Term> か、半音低い{' '}
            <Term>フラット（♭）</Term> です。同じ黒い鍵盤でも呼び方が 2 通りあります（例: C♯ と D♭
            は同じ高さ）。これを <Term>異名同音</Term> と呼びます。
          </p>
        </HelpPanel>

        <HelpPanel title="2. 半音・全音・オクターブ">
          <p>
            となりの鍵盤（黒鍵も含む）へ 1 つ動く距離が <Term>半音</Term> です。半音 2 つ分が{' '}
            <Term>全音</Term> です。C→C♯ は半音、C→D は全音です。
          </p>
          <p>
            同じ音名がもう一度出てくるまでの距離（半音 12 個）が <Term>オクターブ</Term>{' '}
            です。C4 の次の C は C5 で、高さは違いますが「ド」という名前は同じです。コードの話では、まずオクターブを除いた{' '}
            <Term>音の名前（ピッチクラス）</Term> だけを見ます。
          </p>
        </HelpPanel>

        <HelpPanel title="3. 調（キー）と主音とは？">
          <p>
            <Term>調（キー）</Term> は、「この曲はどの音をセンターにして、どの 7
            音を主に使うか」というルールです。画面上の <Term>Key</Term> がこれです。
          </p>
          <p>
            センターになる音を <Term>主音（トニック）</Term> と呼びます。家の住所のようなもので、曲が終わるとたいていこの音（またはこの音の上に乗った和音）に戻って安心します。
          </p>
          <p>
            いまの Key は <Term>{current.label}</Term> なので、主音は{' '}
            <Term>
              {current.tonic}（{current.tonicJa}）
            </Term>{' '}
            です。鍵盤図では主音だけ色を濃くしています。
          </p>
          <OctaveKeyboard
            highlighted={current.scale}
            tonic={current.tonic}
            caption={`${current.label} で使う音。濃い色が主音、明るい色が音階の音、暗い色は基本的に使わない音です。`}
          />
          <p>
            <Term>Major（長調）</Term> は「明るい・安定した」響きになりやすく、
            <Term>Minor（短調）</Term> は「少し暗い・切ない」響きになりやすい、とまず覚えるとよいです。雰囲気はメロディやリズムでも変わりますが、調はその土台です。
          </p>
        </HelpPanel>

        <HelpPanel title="4. 長音階と短音階の並び">
          <p>
            音階は「全音と半音を決まった順に並べたもの」です。長音階（メジャー・スケール）の並びは次のとおりです。
          </p>
          <p className="font-mono text-slate-100">全・全・半・全・全・全・半</p>
          <p>
            C Major なら白鍵だけ（C D E F G A B）になります。E と F、B と C
            のあいだだけがもともと半音なので、黒鍵を使わずにこの並びが作れます。
          </p>
          <p>
            自然短音階（ナチュラル・マイナー）の並びは次のとおりです。第 3 音が長音階より半音低く、ここが「短調らしさ」の中心です。
          </p>
          <p className="font-mono text-slate-100">全・半・全・全・半・全・全</p>
          <p>
            A Minor は C Major とまったく同じ 7 音です。違うのは「どこを主音にするか」だけです。これを{' '}
            <Term>相対調</Term> と呼びます。いっぽう C Major と C Minor は主音が同じで音階が違います。これを{' '}
            <Term>同主調</Term> と呼びます。
          </p>
          <p>
            この画面の短調パレットは <Term>自然短音階</Term>{' '}
            です。クラシックやポップスでよく出る「和声的短音階」（第 7 音を半音上げて V をメジャーにする）は、まずは出していません。
          </p>
        </HelpPanel>

        <HelpPanel title="5. いま選んでいる調の詳細">
          <p>
            主音・調号・音階の各音の役割・ダイアトニックコードの構成音を、選中の Key について全部示します。
          </p>
          <CurrentKeyDetail profile={current} />
        </HelpPanel>

        <HelpPanel title="6. 五度圏（12 の調の地図）">
          <p>
            ピアノには高さの種類が 12 個（白鍵 7 + 黒鍵 5）しかないので、長調も短調も主音の候補は 12
            個です。それを円に並べた図が <Term>五度圏</Term> です。
          </p>
          <p>
            時計回りに 1 つ進むと、主音が <Term>完全 5 度</Term>（半音 7 個）上がり、調号のシャープが 1
            つ増えます。反時計回りだとフラットが 1 つ増えます。隣の調は音が 1 つしか違わないので、曲の途中で移調しやすい関係です。
          </p>
          <CircleOfFifths activeTonic={tonic} activeMode={mode} />
          <p>
            内側の「Am」などは、外側の長調と <Term>同じ調号</Term> を持つ相対短調です。画面の Minor
            は「同じ文字の短調（同主短調）」なので、C Major のとなりは円の内側の Am であり、セレクトの C
            Minor ではありません。両方の関係を知っておくと、Key を切り替えたときに何が変わるか分かります。
          </p>
        </HelpPanel>

        <HelpPanel title="7. 長調 12 キーの一覧（主音・音階・構成音）">
          <p>
            この画面で選べる長調を、1 つずつすべて載せています。表の「構成音」は、そのコードを下から積んだ 3
            音（根音・3 度・5 度）です。
          </p>
          <KeyCatalog mode="major" activeTonic={tonic} />
        </HelpPanel>

        <HelpPanel title="8. 短調 12 キーの一覧（主音・音階・構成音）">
          <p>
            自然短音階ベースの短調 12 キーです。長調と比べると、同じ番号のコードでもメジャー／マイナーが入れ替わります（例: 1
            番目が i のマイナー、3 番目が III のメジャー）。
          </p>
          <KeyCatalog mode="minor" activeTonic={tonic} />
        </HelpPanel>

        <HelpPanel title="9. 和音（コード）の作り方">
          <p>
            <Term>和音（コード）</Term> は、高さの違う音を同時に鳴らした塊です。いちばん基本の 3
            音の和音を <Term>三和音（トライアド）</Term> と呼びます。作り方は「音階を 1 音飛ばしで 3 つ取る」です。
          </p>
          <p>
            いちばん下の音を <Term>根音（ルート）</Term>、その上を <Term>第 3 音（3 度）</Term>、さらに上を{' '}
            <Term>第 5 音（5 度）</Term> と呼びます。C メジャーなら根音 C、3 度 E、5 度 G です。
          </p>
          <StackedThirds
            notes={['C', 'E', 'G']}
            labels={['根音（ルート）', '第3音（3度）', '第5音（5度）']}
            title="C メジャー三和音の積み方"
          />
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <Term>メジャー</Term> … 根音から 4 半音（長 3 度）+ さらに 3 半音（短 3 度）。明るい。記号は C や Cmaj。
            </li>
            <li>
              <Term>マイナー</Term> … 根音から 3 半音（短 3 度）+ さらに 4 半音。少し暗い。記号は Cm。
            </li>
            <li>
              <Term>ディミニッシュ</Term> … 短 3 度 + 短 3 度。不安定。記号は Bdim や B°。
            </li>
            <li>
              <Term>オーギュメント</Term> … 長 3 度 + 長 3 度。ふわっと浮く。この画面のダイアトニックには出ません。
            </li>
          </ul>
          <p>
            コードネームの読み方は「根音 + 種類」です。<Term>Am</Term> は「ラを根音にしたマイナー」、
            <Term>G</Term> は「ソを根音にしたメジャー」（メジャーは種類を省略します）。パレットのボタンを押すと、その 3
            音が実際に鳴ります。
          </p>
        </HelpPanel>

        <HelpPanel title="10. ダイアトニックコードとローマ数字">
          <p>
            ある調の音階の音だけで作った和音を <Term>ダイアトニックコード</Term> と呼びます。音階の 7
            音それぞれを根音にして三和音を積むと、その調の「使える和音セット」が 7 個できます。
          </p>
          <p>
            コードの下に小さく書いてある <Term>I, ii, iii, IV, V, vi, vii°</Term> は{' '}
            <Term>ディグリーネーム</Term>
            です。主音から数えて何番目の和音かをローマ数字で表します。調が変わっても「I は主和音、V
            は属和音」という役割は同じです。だから進行はローマ数字で覚えると、どの Key にも使いまわせます。
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <Term>大文字</Term>（I, IV, V）… メジャー三和音
            </li>
            <li>
              <Term>小文字</Term>（ii, iii, vi）… マイナー三和音
            </li>
            <li>
              <Term>° が付くもの</Term>（vii°）… ディミニッシュ
            </li>
          </ul>
          <p>
            いまの {current.label} なら、7 つのダイアトニックコードは次のとおりです。
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-xs">
              <thead className="text-slate-500">
                <tr>
                  <th className="py-1 pr-2 font-medium">ディグリー</th>
                  <th className="py-1 pr-2 font-medium">コード</th>
                  <th className="py-1 font-medium">構成音（根音・3度・5度）</th>
                </tr>
              </thead>
              <tbody>
                {current.triads.map((chord) => (
                  <tr key={chord.grade} className="border-t border-slate-800">
                    <td className="py-1 pr-2 font-mono text-slate-100">{chord.grade}</td>
                    <td className="py-1 pr-2 font-semibold text-indigo-200">{chord.symbol}</td>
                    <td className="py-1 font-mono text-slate-200">{chord.notes.join(' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </HelpPanel>

        <HelpPanel title="11. コードの 3 つの役割（T / SD / D）">
          <p>
            7 つのコードは、響きの性格で大きく 3 グループに分かれます。進行を作るときは、この役割の行き来を意識すると「次に行きたくなる」流れが作れます。
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <Term>トニック（T）</Term> … その調の「家」。落ち着いて終わる。長調では I / iii / vi。いまの調では{' '}
              {current.triads
                .filter((chord) => chord.function === 'T')
                .map((chord) => `${chord.grade}（${chord.symbol}）`)
                .join('、')}
              。
            </li>
            <li>
              <Term>サブドミナント（SD）</Term> … 家を出て、少し動き出した感じ。I や V へ進みやすい。長調では ii / IV。
            </li>
            <li>
              <Term>ドミナント（D）</Term> … 緊張が強く、トニックに戻りたくなる。長調では V / vii°。
            </li>
          </ul>
          <FunctionFlow
            items={[
              { grade: tonicChord.grade, symbol: tonicChord.symbol, role: '家（安定）' },
              { grade: subdominant.grade, symbol: subdominant.symbol, role: '外出' },
              { grade: dominant.grade, symbol: dominant.symbol, role: '緊張' },
              { grade: tonicChord.grade, symbol: tonicChord.symbol, role: '帰宅' },
            ]}
          />
        </HelpPanel>

        <HelpPanel title="12. コード進行とは？">
          <p>
            <Term>コード進行</Term>
            は、和音を時間の順番に並べた設計図です。メロディが「横」に流れるのに対し、コード進行は曲の「床」として、何小節かに一度、響きを切り替えます。同じメロディでも床の和音が変わると、明るさや切なさが変わります。
          </p>
          <p>
            この画面では <Term>1 コード = 4 拍</Term>（4/4 拍子の 1 小節）で鳴らします。
            <Term>BPM</Term> は 1 分間の拍の数です。BPM 120 なら 1 拍が 0.5 秒、1 コードは 2
            秒続きます。遅くすると和音の移り変わりが聴き取りやすくなります。
          </p>
          <p>
            進行の良し悪しは「理論の正解」より「次にどれへ行きたくなるか」で決まります。まずは定番を耳でコピーし、そのあと自分で 1
            つだけコードを入れ替えて聴き比べると上達します。
          </p>
        </HelpPanel>

        <HelpPanel title="13. 定番の進行（どの Key でも同じ型）">
          <p>
            ローマ数字は移調しても同じです。括弧内は C Major の例です。上の Key を変えて同じ番号を並べると、別の調で同じ進行が鳴ります。
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <Term>I → V → vi → IV</Term>（C–G–Am–F）… ポップスで非常によく出る進行。明るい主和音から始まり、V
              で少し張り、vi で影が差し、IV でまた動き出す。
            </li>
            <li>
              <Term>I → vi → IV → V</Term>（C–Am–F–G）… 50〜60 年代の定番に近い型。最後の V が I
              に戻りたくなるので、ループしやすい。いわゆるカノン進行に近い流れです。
            </li>
            <li>
              <Term>ii → V → I</Term>（Dm–G–C）… ジャズの基本。サブドミナント（ii）からドミナント（V）へ緊張を高め、トニック（I）で解決します。
            </li>
            <li>
              <Term>I → IV → V → I</Term>（C–F–G–C）… ブルースやフォークの骨格。行きと帰りがはっきりしています。
            </li>
            <li>
              <Term>vi → IV → I → V</Term>（Am–F–C–G）… I–V–vi–IV を vi から始めた形。短調っぽい入りで、サビでよく使われます。
            </li>
            <li>
              短調なら <Term>i → VI → III → VII</Term>（Am–F–C–G。A Minor のとき）がよく出ます。自然短音階のダイアトニックだけで組めます。
            </li>
          </ul>
        </HelpPanel>

        <HelpPanel title="14. カデンツ（終わり方）">
          <p>
            フレーズの終わりで和音が着地する型を <Term>カデンツ（終止形）</Term> と呼びます。進行の「句読点」です。
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <Term>V → I</Term> … 完全に着地した感じ（終止感が強い）。ドミナントからトニックへ。
            </li>
            <li>
              <Term>IV → I</Term> … やわらかく終わる感じ（アーメン終止とも呼ばれます）。
            </li>
            <li>
              <Term>V → vi</Term> … 終わると思わせて短調の和音へそらす <Term>偽終止</Term>。
            </li>
            <li>
              <Term>I → V</Term> で止めると、次のフレーズへ続く半終止の感じになります。
            </li>
          </ul>
          <p>再生しながら、どのつながりが落ち着くか／モヤっとするかを聴き比べてみてください。</p>
        </HelpPanel>

        <HelpPanel title="15. この画面の使い方">
          <p>
            上のパレットでコードを追加し、カードの <Term>×</Term> で削除、<Term>← →</Term>{' '}
            で順番を入れ替えます。ボタンの下にはディグリーと構成音が出ます。
          </p>
          <p>
            <Term>Play</Term> で並べた順に 4 拍ずつ鳴り、<Term>Stop</Term>{' '}
            で止まります。別の画面へ移ると音は自動で止まります。Key
            を変えても並び順（ディグリーの役割）は頭の中で同じなので、「C で作った進行を G に移す」練習ができます。
          </p>
        </HelpPanel>
      </div>
    </section>
  )
}
