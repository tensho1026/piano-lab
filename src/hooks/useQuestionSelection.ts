import { useCallback, useState } from 'react'

/**
 * 「今の問題に対してユーザーが選んだ選択肢」を問題 ID とセットで保持する。
 * 問題が切り替わると自動的に未選択に戻るため、リセット用の effect が要らない。
 */
export function useQuestionSelection<T>(questionId: string) {
  const [selection, setSelection] = useState<{ id: string; value: T } | null>(null)
  const selected = selection && selection.id === questionId ? selection.value : null

  const select = useCallback(
    (value: T) => {
      setSelection({ id: questionId, value })
    },
    [questionId],
  )

  return [selected, select] as const
}
