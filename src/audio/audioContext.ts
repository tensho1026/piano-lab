let sharedContext: AudioContext | null = null

/** アプリ全体で 1 つの AudioContext を共有する。 */
export function getAudioContext(): AudioContext {
  if (!sharedContext) {
    sharedContext = new AudioContext()
  }
  return sharedContext
}

/**
 * ブラウザの自動再生制限で suspended になった AudioContext を復帰させる。
 * ユーザー操作のハンドラ内から呼ぶ必要がある。
 */
export async function resumeAudioContext(): Promise<AudioContext> {
  const context = getAudioContext()
  if (context.state === 'suspended') {
    await context.resume()
  }
  return context
}
