import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],

  // 👇 Add this block
server: {
  host: '0.0.0.0',
  port: 5000,
  strictPort: true,
  allowedHosts: ['localhost', 'pdf.rongtonu.com']
}

})
