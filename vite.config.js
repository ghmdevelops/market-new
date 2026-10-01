import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Substitui %SITE_URL% no index.html pela URL pública (Netlify define URL no build; local usa VITE_SITE_URL do .env)
const siteUrl = () => ({
  name: 'site-url',
  transformIndexHtml(html) {
    const url = (process.env.URL || process.env.VITE_SITE_URL || 'http://localhost:5173').replace(/\/$/, '')
    return html.replaceAll('%SITE_URL%', url)
  },
})

export default defineConfig({
  plugins: [
    siteUrl(),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'og-image.png', 'robots.txt'],
      manifest: {
        id: '/',
        name: 'Lista de Mercado',
        short_name: 'Mercado',
        description: 'Lista de compras com preços, orçamento e comparação entre compras.',
        lang: 'pt-BR',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
        orientation: 'portrait',
        theme_color: '#059669',
        background_color: '#f1f5f9',
        categories: ['shopping', 'productivity', 'finance'],
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Lista', short_name: 'Lista', url: '/?tab=list', icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }] },
          { name: 'Histórico', short_name: 'Histórico', url: '/?tab=history', icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }] },
          { name: 'Dashboard', short_name: 'Dashboard', url: '/?tab=dash', icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }] },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        navigateFallback: '/index.html',
        // Firebase usa WebSocket/long-polling; nunca deixar o SW interceptar
        navigateFallbackDenylist: [/^\/__/, /firebaseio\.com/, /firebasedatabase\.app/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
})
