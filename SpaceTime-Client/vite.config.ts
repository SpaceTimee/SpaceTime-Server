import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import plugin from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import Sitemap from 'vite-plugin-sitemap'

export default defineConfig({
  plugins: [
    plugin(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'SpaceTime Server',
        short_name: 'SpaceTime Server',
        description: 'Welcome To My Server ~',
        theme_color: '#ff5a00',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    }),
    Sitemap({
      hostname: 'https://server.spacetimee.xyz'
    })
  ],
  css: {
    preprocessorOptions: {
      less: {
        additionalData: "@import url('./src/assets/global');"
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
