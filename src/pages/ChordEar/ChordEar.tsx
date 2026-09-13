import { useCallback, useEffect, useState } from 'react'
import { DifficultySelector } from '../../components/DifficultySelector/DifficultySelector'
import { GameLayout } from '../../components/GameLayout/GameLayout'
import { GameResult } from '../../components/GameLayout/GameResult'
import { Piano } from '../../components/Piano/Piano'
import { QuizFeedback } from '../../components/Quiz/QuizFeedback'
import { ReplayButton } from '../../components/Quiz/ReplayButton'
import { Score } from '../../components/Score/Score'
import { useGame } from '../../hooks/useGame'
import { usePiano } from '../../hooks/usePiano'
import { CHORD_EAR_SETTINGS, createChordEarQuestion } from '../../music/questions'
import { isSameNoteSet, sortNotes } from '../../utils/compareNotes'
import type { Difficulty } from '../../types/game'
import type { PianoNote } from '../../types/music'

const CHORD_DURATION = 2.2

export function ChordEar() {
  const { audio, status } = usePiano()
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')

  const createQuestion = useCallback(() => createChordEarQuestion(difficulty), [difficulty])
  const game = useGame({ createQuestion, resetKey: difficulty })
  const question = game.question
  const requiredCount = CHORD_EAR_SETTINGS[difficulty].noteCount

  const [pick, setPick] = useState<{ questionId: string; notes: string[] }>({
    questionId: question.id,
    notes: [],
  })
  const picked = pick.questionId === question.id ? pick.notes : []

  const toggleNote = useCallback(
    (note: PianoNote) => {
      if (game.phase !== 'playing') return
      setPick((current) => {
        const base = current.questionId === question.id ? current.notes : []
        const notes = base.includes(note)
          ? base.filter((candidate) => candidate !== note)
          : [...base, note]
        return { questionId: question.id, notes: sortNotes(notes) }
      })
    },
    [game.phase, question.id],
  )

  const resetPick = () => setPick({ questionId: question.id, notes: [] })

  const playQuestion = useCallback(() => {
    audio.stopAll()
    audio.playNotes(question.notes, { duration: CHORD_DURATION })
  }, [audio, question])

  useEffect(() => {
    if (status === 'idle' || status === 'loading') return
    playQuestion()
  }, [playQuestion, status])

  const handleSubmit = () => {
    if (game.phase !== 'playing') return
    game.answer(isSameNoteSet(picked, question.answer))
  }

  const answered = game.phase === 'answered'

  return (
    <GameLayout
      title="和音耳コピゲーム"
      description="再生された複数の音を、画面のピアノで再現します。押す順番は判定に影響しません。"
      toolbar={
        <DifficultySelector
          value={difficulty}
          onChange={setDifficulty}
          options={['easy', 'normal', 'hard']}
          hints={{
            easy: '2 音（白鍵・C4〜C5）',
            normal: '3 音（白鍵・C4〜C6）',
            hard: '4 音（黒鍵を含む・C3〜C6）',
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
            <p className="text-sm text-slate-400">{requiredCount} 音の和音を再現してください</p>
            <ReplayButton onClick={playQuestion} disabled={status === 'loading'} />
          </section>

          <section className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-mono text-sm text-slate-300">
                Selected:{' '}
                {picked.length > 0 ? (
                  <span className="text-indigo-300">{picked.join(' ')}</span>
                ) : (
                  <span className="text-slate-500">（鍵盤を押して選択）</span>
                )}
                <span className="ml-2 text-slate-500">
                  {picked.length} / {requiredCount}
                </span>
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={resetPick}
                  disabled={answered || picked.length === 0}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  リセット
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={answered || picked.length !== requiredCount}
                  className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                >
                  回答する
                </button>
              </div>
            </div>
            <Piano
              selectedNotes={picked}
              highlightNotes={answered ? question.answer : []}
              onNoteOn={toggleNote}
              disabled={answered}
            />
            {answered ? (
              <p className="text-xs text-slate-400">緑色が正解の音、紫色があなたの回答です。</p>
            ) : null}
          </section>

          <QuizFeedback
            result={game.lastResult}
            answerLabel={question.answer.join(' ')}
            onNext={game.next}
            nextLabel={game.questionNumber === game.totalQuestions ? '結果を見る' : '次の問題'}
          />
        </div>
      )}
    </GameLayout>
  )
}
