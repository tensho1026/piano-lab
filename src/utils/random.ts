export function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

export function pickRandom<T>(items: readonly T[]): T {
  if (items.length === 0) {
    throw new Error('pickRandom: 空の配列からは選べません')
  }
  return items[randomInt(0, items.length - 1)]
}

export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/** 重複なしで n 件選ぶ。候補が足りない場合は候補数まで。 */
export function sampleUnique<T>(items: readonly T[], n: number): T[] {
  return shuffle(items).slice(0, Math.min(n, items.length))
}

/**
 * 正解 1 件と、それ以外からランダムに選んだ不正解で選択肢を作りシャッフルする。
 */
export function buildChoices<T>(answer: T, pool: readonly T[], count = 4): T[] {
  const distractors = sampleUnique(
    pool.filter((item) => item !== answer),
    Math.max(0, count - 1),
  )
  return shuffle([answer, ...distractors])
}

export function createId(): string {
  return Math.random().toString(36).slice(2, 10)
}
