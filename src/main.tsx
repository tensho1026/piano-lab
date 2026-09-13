import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { AudioProvider } from './audio/AudioProvider'
import { router } from './app/router'
import './index.css'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('#root が見つかりません')
}

createRoot(rootElement).render(
  <StrictMode>
    <AudioProvider>
      <RouterProvider router={router} />
    </AudioProvider>
  </StrictMode>,
)
