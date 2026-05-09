import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/dashboard/'] },
      { userAgent: 'Googlebot', allow: '/' },
    ],
    sitemap: 'https://base88.app/sitemap.xml',
    host: 'https://base88.app',
  }
}
