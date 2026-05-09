import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://base88.app', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: 'https://base88.app/auth/signup', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: 'https://base88.app/auth/login', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://base88.app/dashboard', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  ]
}
