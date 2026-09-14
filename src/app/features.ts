export type Feature = {
  path: string
  title: string
  description: string
  /** カードに表示する絵文字アイコン。 */
  icon: string
}

/** ホーム画面に並べる機能。 */
export const FEATURES: readonly Feature[] = [
  {
    path: '/sight-reading',
    title: '初見演奏',
    description: '楽譜を読んで演奏',
    icon: '🎼',
  },
  {
    path: '/chord-quiz',
    title: 'コード当て',
    description: '和音を聴き分ける',
    icon: '🎹',
  },
  {
    path: '/interval-quiz',
    title: '音程当て',
    description: '音の距離を聴く',
    icon: '📐',
  },
  {
    path: '/perfect-pitch',
    title: '絶対音感',
    description: '音名を当てる',
    icon: '👂',
  },
  {
    path: '/relative-pitch',
    title: '相対音感',
    description: '調の中での度数を当てる',
    icon: '🎯',
  },
  {
    path: '/chord-ear',
    title: '和音耳コピ',
    description: '聴いた和音を再現',
    icon: '🎧',
  },
  {
    path: '/progression',
    title: 'コード進行',
    description: 'コードを組み合わせる',
    icon: '🎛️',
  },
  {
    path: '/progression-ear',
    title: '進行耳コピ',
    description: '進行をディグリーで当てる',
    icon: '🔁',
  },
]
