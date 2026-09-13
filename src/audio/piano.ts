import { SplendidGrandPiano } from 'smplr'
import { Note } from 'tonal'
import { getAudioContext, resumeAudioContext } from './audioContext'

export type PlayOptions = {
  /** 呼び出し時点から何秒後に鳴らすか。省略時は即時。 */
  delay?: number
  /** 秒。省略時は stopNote / stopAll が呼ばれるまで鳴り続ける。 */
  duration?: number
  /** 0〜127。省略時は既定値。 */
  velocity?: number
}

/**
 * ゲーム側に公開する音声 API。
 * 各画面は smplr を直接触らず、必ずこの境界を経由する。
 */
export type PianoAudio = {
  playNote(note: string, options?: PlayOptions): void
  stopNote(note: string): void
  playNotes(notes: string[], options?: PlayOptions): void
  stopAll(): void
}

export type PianoStatus =
  /** 未ロード */
  | 'idle'
  /** サンプル読み込み中 */
  | 'loading'
  /** ピアノ音源で再生できる */
  | 'ready'
  /** サンプルを取得できず、簡易シンセ音で代替中 */
  | 'fallback'

export type PianoLoadProgress = { loaded: number; total: number }

const SAMPLE_LOAD_TIMEOUT_MS = 25_000

/** 鍵盤表示範囲（C3〜C6）＋余裕を持たせた MIDI 範囲。 */
const NOTES_TO_LOAD = Array.from({ length: 52 }, (_, index) => 43 + index)

/**
 * サンプルが取得できない環境（オフライン等）でも操作を確認できるようにする
 * 簡易フォールバック音源。倍音を重ねた減衰音で鍵盤の反応だけは返す。
 */
class FallbackSynth {
  #context: AudioContext
  #master: GainNode
  #voices = new Map<string, { gain: GainNode; oscillators: OscillatorNode[] }>()

  constructor(context: AudioContext) {
    this.#context = context
    this.#master = context.createGain()
    this.#master.gain.value = 0.28
    this.#master.connect(context.destination)
  }

  start(note: string, options: PlayOptions = {}): void {
    const frequency = Note.freq(note)
    if (!frequency) return

    const startAt = this.#context.currentTime + (options.delay ?? 0)
    const gain = this.#context.createGain()
    gain.connect(this.#master)

    const peak = ((options.velocity ?? 100) / 127) * 0.9
    gain.gain.setValueAtTime(0, startAt)
    gain.gain.linearRampToValueAtTime(peak, startAt + 0.01)
    gain.gain.exponentialRampToValueAtTime(peak * 0.3, startAt + 0.6)

    const oscillators = [
      { type: 'triangle' as OscillatorType, ratio: 1, level: 1 },
      { type: 'sine' as OscillatorType, ratio: 2, level: 0.35 },
      { type: 'sine' as OscillatorType, ratio: 3, level: 0.12 },
    ].map(({ type, ratio, level }) => {
      const oscillator = this.#context.createOscillator()
      oscillator.type = type
      oscillator.frequency.value = frequency * ratio
      const partial = this.#context.createGain()
      partial.gain.value = level
      oscillator.connect(partial)
      partial.connect(gain)
      oscillator.start(startAt)
      return oscillator
    })

    this.#release(note)
    this.#voices.set(note, { gain, oscillators })

    const duration = options.duration
    if (duration !== undefined) {
      this.#scheduleStop(note, startAt + duration)
    }
  }

  stop(note: string): void {
    this.#scheduleStop(note, this.#context.currentTime)
  }

  stopAll(): void {
    for (const note of [...this.#voices.keys()]) {
      this.stop(note)
    }
  }

  #scheduleStop(note: string, at: number): void {
    const voice = this.#voices.get(note)
    if (!voice) return
    this.#voices.delete(note)
    const releaseEnd = at + 0.35
    voice.gain.gain.cancelScheduledValues(at)
    voice.gain.gain.setValueAtTime(Math.max(voice.gain.gain.value, 0.0001), at)
    voice.gain.gain.exponentialRampToValueAtTime(0.0001, releaseEnd)
    for (const oscillator of voice.oscillators) {
      oscillator.stop(releaseEnd + 0.05)
    }
  }

  #release(note: string): void {
    const voice = this.#voices.get(note)
    if (!voice) return
    this.#voices.delete(note)
    const now = this.#context.currentTime
    voice.gain.gain.cancelScheduledValues(now)
    voice.gain.gain.setValueAtTime(0.0001, now)
    for (const oscillator of voice.oscillators) {
      oscillator.stop(now + 0.05)
    }
  }
}

type Listener = () => void

/**
 * smplr の SplendidGrandPiano を包んだ音声サービス。
 * 将来 Web MIDI や別音源に差し替える場合もこのクラスだけを置き換える。
 */
export class PianoService implements PianoAudio {
  #context: AudioContext
  #piano: ReturnType<typeof SplendidGrandPiano> | null = null
  #fallback: FallbackSynth | null = null
  #status: PianoStatus = 'idle'
  #progress: PianoLoadProgress = { loaded: 0, total: 0 }
  #listeners = new Set<Listener>()
  #loading: Promise<void> | null = null
  /** start() が返す停止関数。予約済みの未来の発音もまとめてキャンセルする。 */
  #stops = new Set<() => void>()

  constructor(context: AudioContext = getAudioContext()) {
    this.#context = context
  }

  get status(): PianoStatus {
    return this.#status
  }

  get progress(): PianoLoadProgress {
    return this.#progress
  }

  get isPlayable(): boolean {
    return this.#status === 'ready' || this.#status === 'fallback'
  }

  subscribe(listener: Listener): () => void {
    this.#listeners.add(listener)
    return () => this.#listeners.delete(listener)
  }

  /** サンプルの読み込みを開始する。二重呼び出しは同じ Promise を返す。 */
  load(): Promise<void> {
    if (this.#loading) return this.#loading
    this.#setStatus('loading')

    const piano = SplendidGrandPiano(this.#context, {
      notesToLoad: { notes: NOTES_TO_LOAD, velocityRange: [85, 100] },
      onLoadProgress: (progress) => {
        this.#progress = { loaded: progress.loaded, total: progress.total }
        this.#emit()
      },
    })

    this.#loading = Promise.race([
      piano.ready,
      new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error('ピアノ音源の読み込みがタイムアウトしました')),
          SAMPLE_LOAD_TIMEOUT_MS,
        )
      }),
    ])
      .then(() => {
        this.#piano = piano
        this.#setStatus('ready')
      })
      .catch((error: unknown) => {
        console.warn('[piano] サンプル読み込みに失敗したため簡易音源に切り替えます', error)
        this.#fallback = new FallbackSynth(this.#context)
        this.#setStatus('fallback')
      })

    return this.#loading
  }

  /** ユーザー操作のタイミングで AudioContext を有効化する。 */
  async unlock(): Promise<void> {
    await resumeAudioContext()
  }

  playNote(note: string, options: PlayOptions = {}): void {
    void this.unlock()
    if (this.#piano) {
      const stop = this.#piano.start({
        note,
        stopId: note,
        time: this.#context.currentTime + (options.delay ?? 0),
        duration: options.duration,
        velocity: options.velocity,
      })
      this.#stops.add(stop)
      return
    }
    this.#fallback?.start(note, options)
  }

  stopNote(note: string): void {
    if (this.#piano) {
      this.#piano.stop({ stopId: note })
      return
    }
    this.#fallback?.stop(note)
  }

  playNotes(notes: string[], options: PlayOptions = {}): void {
    for (const note of notes) {
      this.playNote(note, options)
    }
  }

  stopAll(): void {
    for (const stop of this.#stops) stop()
    this.#stops.clear()
    if (this.#piano) {
      // 鳴っている声に加え、まだ始まっていない予約ノートも取り消す。
      this.#piano.scheduler.stop()
      this.#piano.stop()
    }
    this.#fallback?.stopAll()
  }

  #setStatus(status: PianoStatus): void {
    this.#status = status
    this.#emit()
  }

  #emit(): void {
    for (const listener of this.#listeners) listener()
  }
}
