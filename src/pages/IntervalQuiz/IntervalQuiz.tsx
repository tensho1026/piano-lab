import { useCallback, useEffect, useRef, useState } from 'react'
import { DifficultySelector } from '../../components/DifficultySelector/DifficultySelector'
import { GameLayout } from '../../components/GameLayout/GameLayout'
import { GameResult } from '../../components/GameLayout/GameResult'
import { ChoiceGrid } from '../../components/Quiz/ChoiceGrid'
import { QuizFeedback } from '../../components/Quiz/QuizFeedback'
import { ReplayButton } from '../../components/Quiz/ReplayButton'
import { Score } from '../../components/Score/Score'
import { useGame } from '../../hooks/useGame'
import { usePiano } from '../../hooks/usePiano'
import { useQuestionSelection } from '../../hooks/useQuestionSelection'
import { intervalLabel } from '../../music/intervals'
import { explainIntervalGuess, nearbyIntervalName } from '../../music/lessons'
import { createIntervalQuestion } from '../../music/questions'
import type { Difficulty } from '../../types/game'

type PlayMode = 'melodic' | 'harmonic'

const NOTE_DURATION = 0.9
const MELODIC_GAP = 0.7

export function IntervalQuiz() {
  const { audio, status } = usePiano()
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [playMode, setPlayMode] = useState<PlayMode>('melodic')

  const followUp = useRef<{ names: string[]; firstNote: string } | undefined>(undefined)

  const createQuestion = useCallback(() => {
    const pending = followUp.current
    followUp.current = undefined
    return createIntervalQuestion(difficulty, pending)
  }, [difficulty])
  const game = useGame({ createQuestion, resetKey: difficulty })
  const question = game.question
  const [selected, select] = useQuestionSelection<string>(question.id)

  const playQuestion = useCallback(() => {
    audio.stopAll()
    if (playMode === 'harmonic') {
      audio.playNotes([question.firstNote, question.secondNote], { duration: NOTE_DURATION * 1.6 })
      return
    }
    audio.playNote(question.firstNote, { duration: NOTE_DURATION })
    audio.playNote(question.secondNote, { delay: MELODIC_GAP, duration: NOTE_DURATION })
  }, [audio, playMode, question])

  useEffect(() => {
    if (status === 'idle' || status === 'loading') return
    playQuestion()
  }, [playQuestion, status])

  const handleSelect = (choice: string) => {
    if (selected !== null) return
    select(choice)
    const correct = choice === question.answer
    if (!correct) {
      const neighbor = nearbyIntervalName(question.answer)
      followUp.current = {
        names: [...new Set([question.answer, choice, neighbor].filter(Boolean) as string[])],
        firstNote: question.firstNote,
      }
    }
    game.answer(correct)
  }

  return (
    <GameLayout
      title="音程当てゲーム"
      description="2 つの音の距離（音程）を当てます。"
      toolbar={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-6">
          <DifficultySelector
            value={difficulty}
            onChange={setDifficulty}
            hints={{
              easy: '長2度・短3度・長3度・完全4度・完全5度・長6度・完全8度',
              normal: '短2度〜完全8度の 12 種類すべて',
            }}
          />
          <div className="flex flex-col gap-1.5">
            <div
              className="inline-flex w-fit rounded-lg bg-slate-800 p-1"
              role="group"
              aria-label="再生方式"
            >
              {(['melodic', 'harmonic'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={playMode === mode}
                  onClick={() => setPlayMode(mode)}
                  className={[
                    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    playMode === mode
                      ? 'bg-indigo-500 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white',
                  ].join(' ')}
                >
                  {mode === 'melodic' ? '順番に' : '同時に'}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              {playMode === 'melodic' ? '2 音を順番に鳴らします' : '2 音を同時に鳴らします'}
            </p>
          </div>
        </div>
      }
      score={
        game.phase === 'finished' ? null : (
          <Score
            correctCount={game.correctCount}
            totalQuestions={game.totalQuestions}
            questionNumber={game.questionNumber}
          />
        )
      }
    >
      {game.phase === 'finished' ? (
        <GameResult
          correctCount={game.correctCount}
          totalQuestions={game.totalQuestions}
          accuracy={game.accuracy}
          onRetry={game.restart}
        />
      ) : (
        <div className="flex flex-col gap-6">
          <section className="flex flex-col items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-8">
            <p className="text-sm text-slate-400">
              <span aria-hidden className="mr-1">
                ♪
              </span>
              この音程は？
            </p>
            <ReplayButton onClick={playQuestion} disabled={status === 'loading'} label="再生" />
            {selected !== null ? (
              <p className="text-sm text-slate-400">
                {question.firstNote} → {question.secondNote}
              </p>
            ) : null}
          </section>

          <ChoiceGrid
            choices={question.choices}
            answer={question.answer}
            selected={selected}
            onSelect={handleSelect}
            labelOf={intervalLabel}
          />

          <QuizFeedback
            result={game.lastResult}
            answerLabel={intervalLabel(question.answer)}
            lesson={
              selected && selected !== question.answer
                ? explainIntervalGuess(question.answer, selected)
                : null
            }
            onNext={game.next}
            nextLabel={game.questionNumber === game.totalQuestions ? '結果を見る' : '次の問題'}
          />
        </div>
      )}
    </GameLayout>
  )
}
