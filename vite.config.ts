import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' gör att sidan fungerar på GitHub Pages oavsett vad repot heter.
export default defineConfig({
  plugins: [react()],
  base: './',
})
