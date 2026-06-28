import type { MetadataRoute } from 'next'
import { getAllSlugs, getAllArticles } from '@/lib/content'
import { getAllMuster } from '@/lib/muster'

const BASE = 'https://9min.ch'

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllArticles()
  const muster = getAllMuster()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/medienkritik`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/essays`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/muster`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/suche`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/ueber`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ]

  const articleRoutes: MetadataRoute.Sitemap = articles.map(a => ({
    url: `${BASE}/${a.slug}`,
    lastModified: new Date(a.frontmatter.updated ?? a.frontmatter.date),
    changeFrequency: 'monthly',
    priority: a.type === 'medienkritik' ? 0.7 : 0.8,
  }))

  const musterRoutes: MetadataRoute.Sitemap = muster.map(m => ({
    url: `${BASE}/muster/${m.slug}`,
    lastModified: new Date(m.date),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...articleRoutes, ...musterRoutes]
}
