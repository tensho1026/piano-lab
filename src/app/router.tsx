import { createBrowserRouter } from 'react-router'
import { RootLayout } from './RootLayout'
import { ChordEar } from '../pages/ChordEar/ChordEar'
import { ChordQuiz } from '../pages/ChordQuiz/ChordQuiz'
import { Home } from '../pages/Home/Home'
import { IntervalQuiz } from '../pages/IntervalQuiz/IntervalQuiz'
import { PerfectPitch } from '../pages/PerfectPitch/PerfectPitch'
import { Progression } from '../pages/Progression/Progression'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <Home /> },
      {
        path: '/sight-reading',
        // 楽譜描画ライブラリ（VexFlow）は初見演奏を開いたときだけ読み込む。
        lazy: async () => ({
          Component: (await import('../pages/SightReading/SightReading')).SightReading,
        }),
      },
      { path: '/chord-quiz', element: <ChordQuiz /> },
      { path: '/interval-quiz', element: <IntervalQuiz /> },
      { path: '/perfect-pitch', element: <PerfectPitch /> },
      { path: '/chord-ear', element: <ChordEar /> },
      { path: '/progression', element: <Progression /> },
    ],
  },
])
