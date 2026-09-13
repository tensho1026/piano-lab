import { useCallback, useEffect, useState } from 'react'
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
import { chordNotesLabel } from '../../music/chords'
import { createChordQuestion } from '../../music/questions'
import type { Difficulty } from '../../types/game'

const CHORD_DURATION = 2.2

export function ChordQuiz() {
  const { audio, status } = usePiano()
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')

  const createQuestion = useCallback(() => createChordQuestion(difficulty), [difficulty])
  const game = useGame({ createQuestion, resetKey: difficulty })
  const question = game.question
  const [selected, select] = useQuestionSelection<string>(question.id)

  const playQuestion = useCallback(() => {
    audio.stopAll()
    audio.playNotes(question.notes, { duration: CHORD_DURATION })
  }, [audio, question])

  useEffect(() => {
    if (status === 'idle' || status === 'loading') return
    playQuestion()
  }, [playQuestion, status])

  const handleSelect = (choice: string) => {
    if (selected !== null) return
    select(choice)
    game.answer(choice === question.answer)
  }

  return (
    <GameLayout
      title="コード当てゲーム"
      description="再生されたコードのコードネームを 4 択で当てます。"
      toolbar={
        <DifficultySelector
          value={difficulty}
          onChange={setDifficulty}
          hints={{
            easy: 'ルート C D E F G A B のメジャー / マイナー',
            normal: 'メジャー / マイナーに 7・maj7・m7 を追加',
          }}
        />
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
            <p className="text-sm text-slate-400">このコードは？</p>
            <ReplayButton onClick={playQuestion} disabled={status === 'loading'} />
            {selected !== null ? (
              <p className="text-sm text-slate-400">構成音 {question.notes.join(' ')}</p>
            ) : null}
          </section>

          <ChoiceGrid
            choices={question.choices}
            answer={question.answer}
            selected={selected}
            onSelect={handleSelect}
          />

          <QuizFeedback
            result={game.lastResult}
            answerLabel={`${question.answer}（${chordNotesLabel(question.answer)}）`}
            onNext={game.next}
            nextLabel={game.questionNumber === game.totalQuestions ? '結果を見る' : '次の問題'}
          />
        </div>
      )}
    </GameLayout>
  )
}
