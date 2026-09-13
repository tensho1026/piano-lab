import { createBrowserRouter } from 'react-router'
import { ChordQuiz } from '../pages/ChordQuiz/ChordQuiz'
import { Home } from '../pages/Home/Home'
import { IntervalQuiz } from '../pages/IntervalQuiz/IntervalQuiz'
import { PerfectPitch } from '../pages/PerfectPitch/PerfectPitch'

export const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/perfect-pitch', element: <PerfectPitch /> },
  { path: '/interval-quiz', element: <IntervalQuiz /> },
  { path: '/chord-quiz', element: <ChordQuiz /> },
])
