import { createBrowserRouter } from 'react-router'
import { Home } from '../pages/Home/Home'
import { IntervalQuiz } from '../pages/IntervalQuiz/IntervalQuiz'
import { PerfectPitch } from '../pages/PerfectPitch/PerfectPitch'

export const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/perfect-pitch', element: <PerfectPitch /> },
  { path: '/interval-quiz', element: <IntervalQuiz /> },
])
