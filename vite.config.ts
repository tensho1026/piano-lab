import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // 楽譜フォント（Bravura）を初見演奏と同じ本体に含めるため、チャンク警告のしきい値を上げる。
    chunkSizeWarningLimit: 1200,
  },
})
