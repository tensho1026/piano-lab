import { Outlet } from 'react-router'
import { StopAudioOnNavigate } from './StopAudioOnNavigate'

export function RootLayout() {
  return (
    <>
      <StopAudioOnNavigate />
      <Outlet />
    </>
  )
}
