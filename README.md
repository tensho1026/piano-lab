# Piano Lab — Piano Trainer

耳と演奏を鍛えるピアノトレーニング Web アプリ（MVP）です。ブラウザだけで動き、ログインもサーバーも必要ありません。

リアルなピアノ音（[smplr](https://github.com/danigb/smplr) の SplendidGrandPiano）、音楽理論（[Tonal](https://github.com/tonaljs/tonal)）、楽譜描画（[VexFlow](https://www.vexflow.com/)）を組み合わせた 6 種類のトレーニングが入っています。

## 機能一覧

| 画面 | パス | 内容 |
| --- | --- | --- |
| ホーム | `/` | 6 機能のカード一覧と、自由に弾ける Web ピアノ |
| 初見演奏トレーナー | `/sight-reading` | 五線譜に表示された音符を左から順に鍵盤で弾く |
| コード当てゲーム | `/chord-quiz` | 再生されたコードのコードネームを 4 択で当てる |
| 音程当てゲーム | `/interval-quiz` | 2 音の距離（短 2 度〜完全 8 度）を 4 択で当てる |
| 絶対音感ゲーム | `/perfect-pitch` | 1 音を聴いて音名を当てる（オクターブは判定に含めない） |
| 和音耳コピゲーム | `/chord-ear` | 聴いた複数音を画面のピアノで再現する（順番は無視） |
| コード進行メーカー | `/progression` | Key のダイアトニックコードを並べて 1 コード 4 拍で再生する |

### 共通の仕組み

- **Web ピアノ（C3〜C6）**: マウスクリック・タッチ・PC キーボードで演奏できます。押している鍵盤はハイライトされます。
  - キー割り当て: `A`→C4 `W`→C#4 `S`→D4 `E`→D#4 `D`→E4 `F`→F4 `T`→F#4 `G`→G4 `Y`→G#4 `H`→A4 `U`→A#4 `J`→B4 `K`→C5
- **難易度**: 各ゲームで「かんたん / ふつう（/ むずかしい）」を切り替えられます。
- **スコア**: 1 セット 10 問。終了後に「正解数 / 10」と正答率を表示します。
- **スマートフォン対応**: 幅 375px でも操作できます。鍵盤は横スクロールします。

## セットアップ

必要環境: Node.js 20 以上（開発は v22 で確認）。

```bash
# 依存関係をインストール
npm install

# 開発サーバーを起動（http://localhost:5173）
npm run dev
```

### そのほかのコマンド

```bash
npm run typecheck   # 型チェック（tsc -b）
npm run lint        # oxlint
npm run build       # 本番ビルド（tsc -b && vite build）
npm run preview     # ビルド結果をローカルで確認
```

## 音が鳴らないときは

- ブラウザの自動再生制限のため、**最初に画面のどこかをクリック（タップ）するまで音は鳴りません**。画面上部のバッジで音源の状態を確認できます。
  - `音源読み込み中 NN%` … ピアノのサンプルを CDN から取得しています。
  - `ピアノ音源 準備完了` … リアルなピアノ音で再生できます。
  - `簡易音源で代替中` … サンプルを取得できなかったため、Web Audio の簡易シンセ音に自動で切り替わっています（オフライン環境や CDN がブロックされている場合）。
- サンプルは [smpldsnds.github.io](https://smpldsnds.github.io/sfzinstruments-splendid-grand-piano/) から取得するため、初回はネットワーク接続が必要です。

## 技術構成

- React 19 + TypeScript + Vite + React Router v7 + Tailwind CSS v4
- 音: `smplr`（SplendidGrandPiano）
- 音楽理論: `tonal`（コード構成音・音程・移調・ダイアトニックコード）
- 楽譜: `vexflow`（ト音記号 / ヘ音記号・音符・臨時記号）

責務は「smplr = 音 / Tonal = 理論 / VexFlow = 楽譜 / React = UI とゲームロジック」で分離しています。

## ディレクトリ構成

```text
src/
├── app/            router.tsx（ルーティング）, features.ts（ホームのカード定義）
├── pages/          Home, SightReading, ChordQuiz, IntervalQuiz, PerfectPitch, ChordEar, Progression
├── components/     Piano, GameLayout, Score, DifficultySelector, MusicNotation, Quiz, AudioStatus
├── audio/          piano.ts（PianoService）, AudioProvider.tsx, audioContext.ts
├── music/          chords.ts, intervals.ts, keys.ts, notes.ts, questions.ts
├── hooks/          usePiano.ts, useGame.ts, useKeyboardPiano.ts, useQuestionSelection.ts
├── types/          music.ts, game.ts
└── utils/          random.ts, compareNotes.ts
```

各画面は `smplr` を直接触らず、`AudioProvider` が配る `PianoAudio`（`playNote` / `stopNote` / `playNotes` / `stopAll`）だけを使います。将来 Web MIDI や別音源に差し替える場合も、この境界の内側を置き換えるだけで済みます。

## MVP で実装していないもの

ログイン、DB、ランキング、SNS 連携、録音、マイク認識、88 鍵の完全表示、MIDI キーボード入力、MusicXML / PDF の読み込み。
