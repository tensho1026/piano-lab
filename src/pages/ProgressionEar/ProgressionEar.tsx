import { useCallback, useEffect, useState } from 'react'
import { DifficultySelector } from '../../components/DifficultySelector/DifficultySelector'
import { GameLayout } from '../../components/GameLayout/GameLayout'
import { GameResult } from '../../components/GameLayout/GameResult'
import { QuizFeedback } from '../../components/Quiz/QuizFeedback'
import { ReplayButton } from '../../components/Quiz/ReplayButton'
import { Score } from '../../components/Score/Score'
import { useGame } from '../../hooks/useGame'
import { usePiano } from '../../hooks/usePiano'
import { chordNotes } from '../../music/chords'
import { keyLabel } from '../../music/keys'
import { gradesLabel } from '../../music/progressions'
import { createProgressionEarQuestion } from '../../music/questions'
import type { Difficulty } from '../../types/game'

const BEATS_PER_CHORD = 4
const BPM = 100

export function ProgressionEar() {
  const { audio, status } = usePiano()
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')

  const createQuestion = useCallback(() => createProgressionEarQuestion(difficulty), [difficulty])
  const game = useGame({ createQuestion, resetKey: difficulty })
  const question = game.question

  const [pick, setPick] = useState<{ questionId: string; grades: string[] }>({
    questionId: question.id,
    grades: [],
  })
  const picked = pick.questionId === question.id ? pick.grades : []

  const playQuestion = useCallback(() => {
    audio.stopAll()
    const seconds = (BEATS_PER_CHORD * 60) / BPM
    question.symbols.forEach((symbol, index) => {
      audio.playNotes(chordNotes(symbol), {
        delay: index * seconds,
        duration: seconds * 0.92,
      })
    })
  }, [audio, question.symbols])

  useEffect(() => {
    if (status === 'idle' || status === 'loading') return
    playQuestion()
    return () => {
      audio.stopAll()
    }
  }, [audio, playQuestion, status])

  const answered = game.phase === 'answered'
  const required = question.answer.length

  const addGrade = (grade: string) => {
    if (answered || picked.length >= required) return
    setPick({ questionId: question.id, grades: [...picked, grade] })
  }

  const resetPick = () => setPick({ questionId: question.id, grades: [] })

  const handleSubmit = () => {
    if (game.phase !== 'playing' || picked.length !== required) return
    game.answer(picked.join() === question.answer.join())
  }

  return (
    <GameLayout
      title="進行耳コピ"
      description="4 小節（または 3 小節）のコード進行を聴いて、ディグリー（I, V, vi…）の順番を当てます。"
      toolbar={
        <DifficultySelector
          value={difficulty}
          onChange={setDifficulty}
          options={['easy', 'normal', 'hard']}
          hints={{
            easy: 'C Major・定番進行・選択肢は I IV V vi が中心',
            normal: '長調 12 キー・7 つのダイアトニック',
            hard: '長調と短調を混ぜる',
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
          <section className="flex flex-col items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-6">
            <p className="text-sm text-slate-400">
              Key は {keyLabel(question.tonic, question.mode)}。{required} つのコードを聴いてディグリーを並べてください。
            </p>
            <ReplayButton onClick={playQuestion} disabled={status === 'loading'} />
          </section>

          <section className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="font-mono text-sm text-slate-300">
              回答:{' '}
              {picked.length > 0 ? (
                <span className="text-indigo-300">{gradesLabel(picked)}</span>
              ) : (
                <span className="text-slate-500">（下のボタンで順番に追加）</span>
              )}
              <span className="ml-2 text-slate-500">
                {picked.length} / {required}
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              {question.availableGrades.map((grade) => (
                <button
                  key={grade}
                  type="button"
                  disabled={answered || picked.length >= required}
                  onClick={() => addGrade(grade)}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 font-semibold text-slate-100 hover:border-indigo-400 disabled:opacity-40"
                >
                  {grade}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetPick}
                disabled={answered || picked.length === 0}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-40"
              >
                リセット
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={answered || picked.length !== required}
                className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:bg-slate-700 disabled:text-slate-400"
              >
                回答する
              </button>
            </div>
          </section>

          <QuizFeedback
            result={game.lastResult}
            answerLabel={`${question.presetName} ${gradesLabel(question.answer)}（${question.symbols.join('–')}）`}
            lesson={
              game.lastResult === 'wrong'
                ? `聞こえたコードは ${question.symbols.join(' → ')} です。ローマ数字に直すと ${gradesLabel(question.answer)} になります。`
                : `定番進行「${question.presetName}」です。別の Key でも同じローマ数字になります。`
            }
            onNext={game.next}
            nextLabel={game.questionNumber === game.totalQuestions ? '結果を見る' : '次の問題'}
          />
        </div>
      )}
    </GameLayout>
  )
}
