import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { usePiano } from '../hooks/usePiano'

/**
 * 画面を離れたときに予約済みの発音も含めて止める。
 * コード進行の Play 中にホームへ戻っても音が残らないようにする。
 */
export function StopAudioOnNavigate() {
  const { pathname } = useLocation()
  const { audio } = usePiano()

  useEffect(() => {
    return () => {
      audio.stopAll()
    }
  }, [pathname, audio])

  return null
}
