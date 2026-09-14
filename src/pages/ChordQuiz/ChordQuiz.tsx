import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { OptionToggle } from '../../components/PracticeOptions/OptionToggle'
import { GameLayout } from '../../components/GameLayout/GameLayout'
import { GameResult } from '../../components/GameLayout/GameResult'
import { Piano } from '../../components/Piano/Piano'
import { ChoiceGrid } from '../../components/Quiz/ChoiceGrid'
import { QuizFeedback } from '../../components/Quiz/QuizFeedback'
import { ReplayButton } from '../../components/Quiz/ReplayButton'
import { Score } from '../../components/Score/Score'
import { useGame } from '../../hooks/useGame'
import { usePiano } from '../../hooks/usePiano'
import { useQuestionSelection } from '../../hooks/useQuestionSelection'
import { chordNotes, chordNotesLabel, chordRootOf, type ChordQuizScope } from '../../music/chords'
import { explainChordGuess } from '../../music/lessons'
import { createChordQuestion } from '../../music/questions'
import { isSameNote } from '../../utils/compareNotes'

const CHORD_DURATION = 2.2

export function ChordQuiz() {
  const { audio, status } = usePiano()
  const [includeSevenths, setIncludeSevenths] = useState(false)
  const [sameRootChoices, setSameRootChoices] = useState(true)
  const scope: ChordQuizScope = useMemo(
    () => ({ includeSevenths, sameRootChoices }),
    [includeSevenths, sameRootChoices],
  )
  const followUpRoot = useRef<string | undefined>(undefined)

  const createQuestion = useCallback(() => {
    const root = followUpRoot.current
    followUpRoot.current = undefined
    return createChordQuestion(scope, root)
  }, [scope])
  const game = useGame({ createQuestion, resetKey: scope })
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
    const correct = choice === question.answer
    if (!correct) followUpRoot.current = chordRootOf(question.answer)
    game.answer(correct)
  }

  const guessedNotes = selected ? chordNotes(selected) : []
  const extraNotes = guessedNotes.filter(
    (note) => !question.notes.some((candidate) => isSameNote(candidate, note)),
  )

  return (
    <GameLayout
      title="コード当てゲーム"
      description="再生されたコードのコードネームを当てます。間違えると、同じ根音でもう一度出ます。"
      toolbar={
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <OptionToggle
              label="7th を含める"
              checked={includeSevenths}
              onChange={setIncludeSevenths}
            />
            <OptionToggle
              label="ルート固定で種類だけ当てる"
              checked={sameRootChoices}
              onChange={setSameRootChoices}
            />
          </div>
          <p className="text-xs text-slate-400">
            {sameRootChoices
              ? '選択肢は同じ根音のコードだけになります。'
              : '根音も種類も変わります。'}
            {includeSevenths ? ' 7・maj7・m7 も出ます。' : ' メジャーとマイナーが中心です。'}
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

          {selected !== null ? (
            <Piano
              selectedNotes={guessedNotes}
              highlightNotes={question.notes}
              missNotes={extraNotes}
              disabled
              keyboardEnabled={false}
            />
          ) : null}

          <QuizFeedback
            result={game.lastResult}
            answerLabel={`${question.answer}（${chordNotesLabel(question.answer)}）`}
            lesson={
              selected && selected !== question.answer
                ? explainChordGuess(question.answer, selected)
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
