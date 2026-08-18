// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  modules: [
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt',
    '@vercel/analytics'
  ],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'Nuxt Bearer Auth — Secure Bearer Authentication for Nuxt',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Server-side bearer authentication for Nuxt with Redis-backed sessions, HTTP-only cookies, SSR support, token refresh, route protection and configurable API adapters.',
        },
        { name: 'author', content: 'Enoch Tetteh' },
        { property: 'og:title', content: 'Nuxt Bearer Auth — Secure Bearer Authentication for Nuxt' },
        {
          property: 'og:description',
          content: 'Server-side bearer authentication for Nuxt with Redis-backed sessions, HTTP-only cookies, SSR support, token refresh, route protection and configurable API adapters.',
        },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Nuxt Bearer Auth' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Nuxt Bearer Auth' },
        {
          name: 'twitter:description',
          content: 'Keep API tokens on the server. Secure, SSR-aware bearer authentication for Nuxt.',
        },
        { name: 'theme-color', content: '#090a0f' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap',
        },
      ],
    },
  },

  typescript: {
    strict: true,
  },

  nitro: {
    prerender: {
      routes: ['/', '/architecture', '/playground', '/examples', '/sitemap.xml'],
    },
  },
})
