import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        // 抑制 Dart Sass 的弃用警告
        api: 'modern-compiler',
        silenceDeprecations: ['legacy-js-api']
      }
    }
  },
  server: {
    port: 5100,
    proxy: {
      '/api': {
        target: 'http://localhost:3015',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          ui: ['element-plus', '@element-plus/icons-vue']
        }
      }
    }
  }
}) 
