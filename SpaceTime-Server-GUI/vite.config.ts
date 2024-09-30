import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { env } from 'process';
import vue from '@vitejs/plugin-vue';
import fs from 'fs';

export default defineConfig({
  plugins: [
    vue(),
    viteStaticCopy({
      targets: [{
        src: ['cert.pem', 'key.pem'],
        dest: '.'
      }]
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
  },
  server: {
    port: 443,
    host: true,
    https: {
      key: fs.readFileSync('./key.pem'),
      cert: fs.readFileSync('./cert.pem'),
    },
    proxy: {
      '^(^/api)|(^/files)|(^/private/.+)': {
        target: env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}` : env.ASPNETCORE_URLS ? env.ASPNETCORE_URLS.split(';')[0] : 'https://localhost:5001',
        secure: false
      }
    }
  }
})