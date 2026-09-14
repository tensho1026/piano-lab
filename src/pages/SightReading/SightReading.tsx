import { useCallback, useMemo, useState } from 'react'
import { OptionToggle } from '../../components/PracticeOptions/OptionToggle'
import { GameLayout } from '../../components/GameLayout/GameLayout'
import { GameResult } from '../../components/GameLayout/GameResult'
import { MusicNotation } from '../../components/MusicNotation/MusicNotation'
import { Piano } from '../../components/Piano/Piano'
import { QuizFeedback } from '../../components/Quiz/QuizFeedback'
import { ReplayButton } from '../../components/Quiz/ReplayButton'
import { Score } from '../../components/Score/Score'
import { useGame } from '../../hooks/useGame'
import { usePiano } from '../../hooks/usePiano'
import {
  DEFAULT_SIGHT_READING_SCOPE,
  createSightReadingQuestion,
  type SightReadingScope,
} from '../../music/questions'
import { isSameNote } from '../../utils/compareNotes'
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

const PHRASE_BPM = 90

export function SightReading() {
  const { audio, status } = usePiano()
  const [scope, setScope] = useState<SightReadingScope>(DEFAULT_SIGHT_READING_SCOPE)

  const createQuestion = useCallback(() => createSightReadingQuestion(scope), [scope])
  const game = useGame({ createQuestion, resetKey: scope })
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

  const playPhrase = useCallback(() => {
    audio.stopAll()
    const beat = 60 / PHRASE_BPM
    let delay = 0
    for (const event of question.events) {
      const duration = event.duration === '8' ? beat / 2 : beat
      if (event.kind === 'note') {
        audio.playNote(event.pitch, { delay, duration: duration * 0.9 })
      }
      delay += duration
    }
  }, [audio, question.events])

  const answered = game.phase === 'answered'
  const restCount = useMemo(
    () => question.events.filter((event) => event.kind === 'rest').length,
    [question.events],
  )

  return (
    <GameLayout
      title="初見演奏トレーナー"
      description="五線譜の音符を左から順に鍵盤で弾きます。リズムを入れると 4 分・8 分・休符が混ざります。"
      toolbar={
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <OptionToggle
              label="白鍵のみ"
              checked={scope.whiteKeysOnly}
              onChange={(checked) => setScope((current) => ({ ...current, whiteKeysOnly: checked }))}
            />
            <OptionToggle
              label="リズム（4分・8分・休符）"
              checked={scope.includeRhythm}
              onChange={(checked) => setScope((current) => ({ ...current, includeRhythm: checked }))}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(['treble', 'bass', 'both'] as const).map((clef) => (
              <button
                key={clef}
                type="button"
                aria-pressed={scope.clef === clef}
                onClick={() => setScope((current) => ({ ...current, clef }))}
                className={[
                  'rounded-lg border px-3 py-1.5 text-sm',
                  scope.clef === clef
                    ? 'border-indigo-400 bg-indigo-500/20 text-slate-100'
                    : 'border-slate-700 bg-slate-800 text-slate-300',
                ].join(' ')}
              >
                {clef === 'treble' ? 'ト音のみ' : clef === 'bass' ? 'ヘ音のみ' : 'ト音とヘ音'}
              </button>
            ))}
            {[1, 4, 8].map((count) => (
              <button
                key={count}
                type="button"
                aria-pressed={scope.noteCount === count}
                onClick={() => setScope((current) => ({ ...current, noteCount: count }))}
                className={[
                  'rounded-lg border px-3 py-1.5 text-sm',
                  scope.noteCount === count
                    ? 'border-indigo-400 bg-indigo-500/20 text-slate-100'
                    : 'border-slate-700 bg-slate-800 text-slate-300',
                ].join(' ')}
              >
                {count} 音
              </button>
            ))}
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
          <section className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <MusicNotation
              notes={question.notes}
              events={question.events}
              clef={question.clef}
              currentIndex={answered ? question.notes.length : progress.index}
            />
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <p className="text-slate-400">
                Progress{' '}
                <span className="font-semibold text-slate-100">
                  {Math.min(progress.index, question.notes.length)} / {question.notes.length}
                </span>
                {restCount > 0 ? (
                  <span className="ml-2 text-slate-500">休符 {restCount}</span>
                ) : null}
              </p>
              <ReplayButton
                onClick={playPhrase}
                disabled={status === 'loading'}
                label="お手本を聴く"
              />
            </div>
            {progress.lastWrongNote ? (
              <p className="text-sm text-rose-300">
                {progress.lastWrongNote} は違います。もう一度読んでみましょう。
              </p>
            ) : (
              <p className="text-sm text-slate-500">
                {answered ? '' : `${question.clef === 'treble' ? 'ト音記号' : 'ヘ音記号'}`}
                {scope.includeRhythm
                  ? '　休符は弾かず、黒い音符だけを左から順に弾きます。'
                  : ''}
              </p>
            )}
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
