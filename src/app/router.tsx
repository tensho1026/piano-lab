import { createBrowserRouter } from 'react-router'
import { ChordEar } from '../pages/ChordEar/ChordEar'
import { ChordQuiz } from '../pages/ChordQuiz/ChordQuiz'
import { Home } from '../pages/Home/Home'
import { IntervalQuiz } from '../pages/IntervalQuiz/IntervalQuiz'
import { PerfectPitch } from '../pages/PerfectPitch/PerfectPitch'
import { Progression } from '../pages/Progression/Progression'

export const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/perfect-pitch', element: <PerfectPitch /> },
  { path: '/interval-quiz', element: <IntervalQuiz /> },
  { path: '/chord-quiz', element: <ChordQuiz /> },
  { path: '/chord-ear', element: <ChordEar /> },
  { path: '/progression', element: <Progression /> },
])
