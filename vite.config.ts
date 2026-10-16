import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// 数字花园 · Vite 配置
// Tailwind v4 通过官方 Vite 插件接入，无需 postcss 配置文件
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // 拆出体积较大的 Markdown 依赖，改善首屏加载
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (/marked|dompurify|highlight\.js/.test(id)) return 'markdown'
            if (/react|react-dom|react-router/.test(id)) return 'vendor'
          }
          return undefined
        },
      },
    },
    chunkSizeWarningLimit: 700,
  },
})
