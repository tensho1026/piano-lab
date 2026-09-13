import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import { PianoService } from './piano'
import { PianoContext } from './pianoContext'

type AudioProviderProps = { children: ReactNode }

/**
 * アプリ全体で 1 つの PianoService を共有し、読み込み状態を配信する。
 * AudioContext は最初のユーザー操作で有効化する（自動再生制限対策）。
 */
export function AudioProvider({ children }: AudioProviderProps) {
  const [service] = useState(() => new PianoService())

  const subscribe = useCallback((listener: () => void) => service.subscribe(listener), [service])
  const status = useSyncExternalStore(subscribe, () => service.status)
  const progress = useSyncExternalStore(subscribe, () => service.progress)

  useEffect(() => {
    void service.load()
  }, [service])

  useEffect(() => {
    const unlock = () => void service.unlock()
    const events: (keyof WindowEventMap)[] = ['pointerdown', 'keydown', 'touchstart']
    for (const event of events) {
      window.addEventListener(event, unlock, { once: true, passive: true })
    }
    return () => {
      for (const event of events) window.removeEventListener(event, unlock)
    }
  }, [service])

  const value = useMemo(
    () => ({
      audio: service,
      status,
      progress,
      unlock: () => void service.unlock(),
    }),
    [service, status, progress],
  )

  return <PianoContext.Provider value={value}>{children}</PianoContext.Provider>
}
