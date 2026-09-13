import { createBrowserRouter } from 'react-router'
import { RootLayout } from './RootLayout'
import { RouteErrorPage } from './RouteErrorPage'
import { ChordEar } from '../pages/ChordEar/ChordEar'
import { ChordQuiz } from '../pages/ChordQuiz/ChordQuiz'
import { Home } from '../pages/Home/Home'
import { IntervalQuiz } from '../pages/IntervalQuiz/IntervalQuiz'
import { PerfectPitch } from '../pages/PerfectPitch/PerfectPitch'
import { Progression } from '../pages/Progression/Progression'
import { SightReading } from '../pages/SightReading/SightReading'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/sight-reading', element: <SightReading /> },
      { path: '/chord-quiz', element: <ChordQuiz /> },
      { path: '/interval-quiz', element: <IntervalQuiz /> },
      { path: '/perfect-pitch', element: <PerfectPitch /> },
      { path: '/chord-ear', element: <ChordEar /> },
      { path: '/progression', element: <Progression /> },
    ],
  },
])
