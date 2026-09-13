import { useCallback, useEffect, useRef, useState } from 'react'
import type { GamePhase } from '../types/game'

export type AnswerResult = 'correct' | 'wrong'

type GameState<Q> = {
  question: Q
  index: number
  correctCount: number
  phase: GamePhase
  lastResult: AnswerResult | null
}

type UseGameParams<Q> = {
  /** 1 問ぶんの問題を生成する。 */
  createQuestion: () => Q
  /** 1 セットの問題数。既定は 10 問。 */
  totalQuestions?: number
  /** この値が変わるとセットをやり直す（難易度変更など）。 */
  resetKey?: unknown
}

export type UseGameResult<Q> = {
  question: Q
  /** 1 始まりの問題番号。 */
  questionNumber: number
  totalQuestions: number
  correctCount: number
  phase: GamePhase
  lastResult: AnswerResult | null
  accuracy: number
  answer: (isCorrect: boolean) => void
  next: () => void
  restart: () => void
}

function createInitialState<Q>(question: Q): GameState<Q> {
  return { question, index: 0, correctCount: 0, phase: 'playing', lastResult: null }
}

/**
 * 「1 セット 10 問 → 正解数と正答率を表示」というゲーム共通の進行を担う。
 */
export function useGame<Q>({
  createQuestion,
  totalQuestions = 10,
  resetKey,
}: UseGameParams<Q>): UseGameResult<Q> {
  const createQuestionRef = useRef(createQuestion)
  useEffect(() => {
    createQuestionRef.current = createQuestion
  }, [createQuestion])

  const [state, setState] = useState<GameState<Q>>(() => createInitialState(createQuestion()))

  const restart = useCallback(() => {
    setState(createInitialState(createQuestionRef.current()))
  }, [])

  const isFirstRun = useRef(true)
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false
      return
    }
    restart()
  }, [resetKey, restart])

  const answer = useCallback((isCorrect: boolean) => {
    setState((current) => {
      if (current.phase !== 'playing') return current
      return {
        ...current,
        phase: 'answered',
        lastResult: isCorrect ? 'correct' : 'wrong',
        correctCount: current.correctCount + (isCorrect ? 1 : 0),
      }
    })
  }, [])

  const next = useCallback(() => {
    setState((current) => {
      const nextIndex = current.index + 1
      if (nextIndex >= totalQuestions) {
        return { ...current, phase: 'finished' }
      }
      return {
        ...current,
        index: nextIndex,
        question: createQuestionRef.current(),
        phase: 'playing',
        lastResult: null,
      }
    })
  }, [totalQuestions])

  const answeredCount = state.phase === 'finished' ? totalQuestions : state.index

  return {
    question: state.question,
    questionNumber: Math.min(state.index + 1, totalQuestions),
    totalQuestions,
    correctCount: state.correctCount,
    phase: state.phase,
    lastResult: state.lastResult,
    accuracy: answeredCount === 0 ? 0 : Math.round((state.correctCount / totalQuestions) * 100),
    answer,
    next,
    restart,
  }
}
