import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// 获取仓库名称，用于GitHub Pages部署
const repoName = 'vqa-platform'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3000
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    assetsInlineLimit: 409600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          let extType = info[info.length - 1]
          if (/\.(png|jpe?g|gif|svg|webp|ico)(\?.*)?$/.test(assetInfo.name)) {
            extType = 'img'
          } else if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/.test(assetInfo.name)) {
            extType = 'fonts'
          } else if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/.test(assetInfo.name)) {
            extType = 'media'
          }
          return `assets/${extType}/[name]-[hash][extname]`
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js'
      }
    },
    chunkSizeWarningLimit: 2000
  }
})
