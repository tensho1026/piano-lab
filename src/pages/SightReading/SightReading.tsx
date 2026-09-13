import { useCallback, useState } from 'react'
import { DifficultySelector } from '../../components/DifficultySelector/DifficultySelector'
import { GameLayout } from '../../components/GameLayout/GameLayout'
import { GameResult } from '../../components/GameLayout/GameResult'
import { MusicNotation } from '../../components/MusicNotation/MusicNotation'
import { Piano } from '../../components/Piano/Piano'
import { QuizFeedback } from '../../components/Quiz/QuizFeedback'
import { Score } from '../../components/Score/Score'
import { useGame } from '../../hooks/useGame'
import { createSightReadingQuestion } from '../../music/questions'
import { isSameNote } from '../../utils/compareNotes'
import type { Difficulty } from '../../types/game'
import type { PianoNote } from '../../types/music'

type Progress = {
  questionId: string
  index: number
  mistakes: number
  lastWrongNote: string | null
}

const INITIAL_PROGRESS: Omit<Progress, 'questionId'> = {
  index: 0,
  mistakes: 0,
  lastWrongNote: null,
}

export function SightReading() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')

  const createQuestion = useCallback(() => createSightReadingQuestion(difficulty), [difficulty])
  const game = useGame({ createQuestion, resetKey: difficulty })
  const question = game.question

  const [progressState, setProgressState] = useState<Progress>({
    questionId: question.id,
    ...INITIAL_PROGRESS,
  })
  const progress =
    progressState.questionId === question.id
      ? progressState
      : { questionId: question.id, ...INITIAL_PROGRESS }

  const handleNoteOn = (note: PianoNote) => {
    if (game.phase !== 'playing') return
    const expected = question.notes[progress.index]

    if (!isSameNote(note, expected)) {
      setProgressState({
        ...progress,
        mistakes: progress.mistakes + 1,
        lastWrongNote: note,
      })
      return
    }

    const nextIndex = progress.index + 1
    setProgressState({ ...progress, index: nextIndex, lastWrongNote: null })
    if (nextIndex >= question.notes.length) {
      game.answer(progress.mistakes === 0)
    }
  }

  const answered = game.phase === 'answered'

  return (
    <GameLayout
      title="初見演奏トレーナー"
      description="五線譜の音符を左から順に鍵盤で弾きます。ミスなく最後まで弾けたら正解です。"
      toolbar={
        <DifficultySelector
          value={difficulty}
          onChange={setDifficulty}
          options={['easy', 'normal', 'hard']}
          hints={{
            easy: 'ト音記号・C4〜C5 の白鍵・1 音',
            normal: 'ト音記号・C4〜C6・黒鍵あり・4 音',
            hard: 'ト音記号／ヘ音記号・臨時記号あり・8 音',
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
          <section className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <MusicNotation
              notes={question.notes}
              clef={question.clef}
              currentIndex={answered ? question.notes.length : progress.index}
            />
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <p className="text-slate-400">
                Progress{' '}
                <span className="font-semibold text-slate-100">
                  {Math.min(progress.index, question.notes.length)} / {question.notes.length}
                </span>
              </p>
              {progress.lastWrongNote ? (
                <p className="text-rose-300">
                  {progress.lastWrongNote} は違います。もう一度読んでみましょう。
                </p>
              ) : (
                <p className="text-slate-500">
                  {answered ? '' : `${question.clef === 'treble' ? 'ト音記号' : 'ヘ音記号'}`}
                </p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <Piano onNoteOn={handleNoteOn} disabled={answered} showNoteNames={false} />
          </section>

          <QuizFeedback
            result={game.lastResult}
            answerLabel={question.notes.join(' ')}
            onNext={game.next}
            nextLabel={game.questionNumber === game.totalQuestions ? '結果を見る' : '次の問題'}
          />
        </div>
      )}
    </GameLayout>
  )
}
