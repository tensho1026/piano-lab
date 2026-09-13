import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // 初見演奏の遅延読み込みチャンクには楽譜フォント（Bravura）が埋め込まれるため大きい。
    chunkSizeWarningLimit: 800,
  },
})
