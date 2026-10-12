import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // 使用相对路径，兼容性最好，解决 GitHub Pages 子目录白屏问题
  base: './', 
  plugins: [react()]
})