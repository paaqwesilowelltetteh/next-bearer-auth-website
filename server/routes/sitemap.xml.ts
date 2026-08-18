import { docPages } from '~/data/docs'

export default defineEventHandler((event) => {
  const host = 'https://nuxt-bearer-auth.pages.dev'
  const staticRoutes = [
    '',
    '/architecture',
    '/examples',
    '/playground',
    '/docs/getting-started',
  ]

  const docRoutes = Object.keys(docPages).map((slug) => `/docs/${slug}`)
  const allRoutes = Array.from(new Set([...staticRoutes, ...docRoutes]))

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map(
    (route) => `  <url>
    <loc>${host}${route}</loc>
    <changefreq>weekly</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`

  setResponseHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return xml
})
