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
import { KEY_TONICS, keyLabel, type KeyMode } from '../../music/keys'
import { createRelativePitchQuestion, relativeDegreeLabel } from '../../music/questions'
import type { Difficulty } from '../../types/game'

const TONIC_DURATION = 1.1
const NOTE_DURATION = 1.4
const NOTE_DELAY = 1.25

export function RelativePitch() {
  const { audio, status } = usePiano()
  const [tonic, setTonic] = useState('C')
  const [mode, setMode] = useState<KeyMode>('major')
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')

  const createQuestion = useCallback(
    () => createRelativePitchQuestion(tonic, mode, difficulty),
    [tonic, mode, difficulty],
  )
  const game = useGame({ createQuestion, resetKey: `${tonic}-${mode}-${difficulty}` })
  const question = game.question
  const [selected, select] = useQuestionSelection<number>(question.id)

  const playQuestion = useCallback(() => {
    audio.stopAll()
    audio.playNote(question.tonicNote, { duration: TONIC_DURATION })
    audio.playNote(question.note, { delay: NOTE_DELAY, duration: NOTE_DURATION })
  }, [audio, question])

  const playTonic = useCallback(() => {
    audio.stopAll()
    audio.playNote(question.tonicNote, { duration: TONIC_DURATION })
  }, [audio, question])

  useEffect(() => {
    if (status === 'idle' || status === 'loading') return
    playQuestion()
  }, [playQuestion, status])

  const handleSelect = (choice: number) => {
    if (selected !== null) return
    select(choice)
    game.answer(choice === question.answer)
  }

  return (
    <GameLayout
      title="相対音感ゲーム"
      description="先に主音を聴いてから、次の音が音階の何番目かを当てます。絶対的な音名ではなく、その調の中での位置です。"
      toolbar={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-6">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-slate-400">Key</span>
            <div className="flex gap-2">
              <select
                value={tonic}
                onChange={(event) => setTonic(event.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100"
              >
                {KEY_TONICS.map((candidate) => (
                  <option key={candidate} value={candidate}>
                    {candidate}
                  </option>
                ))}
              </select>
              <select
                value={mode}
                onChange={(event) => setMode(event.target.value as KeyMode)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100"
              >
                <option value="major">Major</option>
                <option value="minor">Minor</option>
              </select>
            </div>
          </label>
          <DifficultySelector
            value={difficulty}
            onChange={setDifficulty}
            options={['easy', 'normal', 'hard']}
            hints={{
              easy: '主音・3度・5度',
              normal: '第1〜5音',
              hard: '音階の7音すべて',
            }}
          />
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
              {keyLabel(question.tonic, question.mode)} の主音のあと、2 つ目の音は何度？
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <ReplayButton onClick={playQuestion} disabled={status === 'loading'} />
              <button
                type="button"
                onClick={playTonic}
                disabled={status === 'loading'}
                className="rounded-full border border-slate-600 px-5 py-3 text-sm font-medium text-slate-200 hover:bg-slate-800 disabled:opacity-40"
              >
                主音だけ聴く
              </button>
            </div>
          </section>

          <ChoiceGrid
            choices={question.choices.map(String)}
            answer={String(question.answer)}
            selected={selected === null ? null : String(selected)}
            onSelect={(choice) => handleSelect(Number(choice))}
            labelOf={(value) => relativeDegreeLabel(Number(value))}
          />

          <QuizFeedback
            result={game.lastResult}
            answerLabel={relativeDegreeLabel(question.answer)}
            lesson={
              selected !== null && selected !== question.answer
                ? `主音は ${question.tonicNote}、問題の音は ${question.note} でした。音階の ${question.answer} 番目です。`
                : `主音 ${question.tonicNote} から数えます。`
            }
            onNext={game.next}
            nextLabel={game.questionNumber === game.totalQuestions ? '結果を見る' : '次の問題'}
          />
        </div>
      )}
    </GameLayout>
  )
}
