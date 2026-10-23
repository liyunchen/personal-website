import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // 开发期把 API 与上传目录代理到本地后端；
    // 生产环境由 Nginx 做同样的转发，无需改动前端代码。
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8101',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://127.0.0.1:8101',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
})