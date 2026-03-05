import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/36Chambers-Barbershop/',
  server: {
    host: true, // expose on all network interfaces so mobile devices can connect
  },
  preview: {
    host: true, // same for `vite preview`
  },
})
