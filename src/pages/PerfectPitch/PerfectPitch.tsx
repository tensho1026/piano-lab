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
import { SOLFEGE_LABELS } from '../../music/notes'
import { createPitchQuestion } from '../../music/questions'
import type { Difficulty } from '../../types/game'
import type { NoteName } from '../../types/music'

const NOTE_DURATION = 1.6

function noteLabel(name: string): string {
  return `${name}（${SOLFEGE_LABELS[name as NoteName]}）`
}

export function PerfectPitch() {
  const { audio, status } = usePiano()
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')

  const createQuestion = useCallback(() => createPitchQuestion(difficulty), [difficulty])
  const game = useGame({ createQuestion, resetKey: difficulty })
  const question = game.question
  const [selected, select] = useQuestionSelection<string>(question.id)

  const playQuestion = useCallback(() => {
    audio.stopAll()
    audio.playNote(question.note, { duration: NOTE_DURATION })
  }, [audio, question])

  // 出題時（および音源の準備が整った直後）に自動で 1 回鳴らす。
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
      title="絶対音感ゲーム"
      description="1 つの音を聴いて音名を当てます。オクターブは判定に含めません（C3 でも C5 でも「C」で正解）。"
      toolbar={
        <DifficultySelector
          value={difficulty}
          onChange={setDifficulty}
          hints={{
            easy: '白鍵のみ（C D E F G A B）',
            normal: '黒鍵を含む 12 音',
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
            <p className="text-sm text-slate-400">この音の音名は？</p>
            <ReplayButton onClick={playQuestion} disabled={status === 'loading'} />
          </section>

          <ChoiceGrid
            choices={question.choices}
            answer={question.answer}
            selected={selected}
            onSelect={handleSelect}
            labelOf={noteLabel}
          />

          <QuizFeedback
            result={game.lastResult}
            answerLabel={noteLabel(question.answer)}
            onNext={game.next}
            nextLabel={game.questionNumber === game.totalQuestions ? '結果を見る' : '次の問題'}
          />
        </div>
      )}
    </GameLayout>
  )
}
