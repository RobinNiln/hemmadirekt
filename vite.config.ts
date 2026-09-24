import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' gör att sidan fungerar på GitHub Pages oavsett vad repot heter.
//
// Filnamnen hålls fasta (index.js i stället för index-A1b2C3.js). GitHub Pages
// sparar sidan i upp till 10 minuter. Med föränderliga filnamn kunde en gammal,
// sparad sida då peka på en fil som inte längre finns – och sidan blev helt vit.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/index.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
})
