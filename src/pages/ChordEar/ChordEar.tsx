import { useCallback, useEffect, useRef, useState } from 'react'
import { OptionToggle } from '../../components/PracticeOptions/OptionToggle'
import { GameLayout } from '../../components/GameLayout/GameLayout'
import { GameResult } from '../../components/GameLayout/GameResult'
import { Piano } from '../../components/Piano/Piano'
import { QuizFeedback } from '../../components/Quiz/QuizFeedback'
import { ReplayButton } from '../../components/Quiz/ReplayButton'
import { Score } from '../../components/Score/Score'
import { useGame } from '../../hooks/useGame'
import { usePiano } from '../../hooks/usePiano'
import { DEFAULT_CHORD_EAR_SCOPE, type ChordEarScope } from '../../music/chords'
import { explainNoteSetGuess } from '../../music/lessons'
import { createChordEarQuestion } from '../../music/questions'
import { isSameNote, isSameNoteSet, sortNotes } from '../../utils/compareNotes'
import type { PianoNote } from '../../types/music'

const CHORD_DURATION = 2.2

export function ChordEar() {
  const { audio, status } = usePiano()
  const [scope, setScope] = useState<ChordEarScope>(DEFAULT_CHORD_EAR_SCOPE)
  const followUpSuffix = useRef<string | undefined>(undefined)

  const createQuestion = useCallback(() => {
    const suffix = followUpSuffix.current
    followUpSuffix.current = undefined
    return createChordEarQuestion(scope, suffix)
  }, [scope])
  const game = useGame({ createQuestion, resetKey: scope })
  const question = game.question
  const requiredCount = question.notes.length

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
    const correct = isSameNoteSet(picked, question.answer)
    if (!correct) followUpSuffix.current = question.suffix
    game.answer(correct)
  }

  const answered = game.phase === 'answered'
  const extraNotes = picked.filter(
    (note) => !question.answer.some((candidate) => isSameNote(candidate, note)),
  )

  const updateScope = (patch: Partial<ChordEarScope>) => {
    setScope((current) => {
      const next = { ...current, ...patch }
      if (!next.includeTriads && !next.includeSevenths && !next.includeTensions) {
        return { ...next, includeTriads: true }
      }
      return next
    })
  }

  return (
    <GameLayout
      title="和音耳コピゲーム"
      description="再生された和音の構成音をピアノで再現します。出題する和音の種類は下で選べます。"
      toolbar={
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <OptionToggle
              label="三和音"
              checked={scope.includeTriads}
              onChange={(checked) => updateScope({ includeTriads: checked })}
            />
            <OptionToggle
              label="転回あり"
              checked={scope.allowInversions}
              onChange={(checked) => updateScope({ allowInversions: checked })}
            />
            <OptionToggle
              label="7th"
              checked={scope.includeSevenths}
              onChange={(checked) => updateScope({ includeSevenths: checked })}
            />
            <OptionToggle
              label="テンション"
              checked={scope.includeTensions}
              onChange={(checked) => updateScope({ includeTensions: checked })}
            />
          </div>
          <p className="text-xs text-slate-400">
            三和音・7th・テンションから出題します。転回を入れると一番下の音が根音とは限りません。
          </p>
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
              missNotes={answered ? extraNotes : []}
              onNoteOn={toggleNote}
              disabled={answered}
            />
            {answered ? (
              <p className="text-xs text-slate-400">緑色が正解の音、赤色が余分に選んだ音です。</p>
            ) : null}
          </section>

          <QuizFeedback
            result={game.lastResult}
            answerLabel={`${question.chordSymbol}（${question.chordKind}） ${question.answer.join(' ')}`}
            lesson={
              game.lastResult === 'wrong' ? explainNoteSetGuess(question.answer, picked) : null
            }
            onNext={game.next}
            nextLabel={game.questionNumber === game.totalQuestions ? '結果を見る' : '次の問題'}
          />
        </div>
      )}
    </GameLayout>
  )
}
