import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAllSlugs, getArticle } from '@/lib/content'
import { ChronikLayout } from '@/components/ChronikLayout'
import { AnalyseLayout } from '@/components/AnalyseLayout'
import { GrundlageLayout } from '@/components/GrundlageLayout'

export async function generateStaticParams() {
  return getAllSlugs().map(slug => ({ slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const article = getArticle(slug)
  if (!article) return {}

  const { frontmatter } = article
  const url = `https://9min.ch/${slug}`
  const ogImage = frontmatter.image?.og
    ? `https://9min.ch${frontmatter.image.og}`
    : `https://9min.ch/og-default.png`

  return {
    title: frontmatter.title,
    description: frontmatter.seo?.description,
    alternates: {
      canonical: frontmatter.seo?.canonical ?? url,
    },
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.seo?.description,
      url,
      siteName: '9min',
      locale: 'de_CH',
      type: 'article',
      publishedTime: frontmatter.date,
      modifiedTime: frontmatter.updated,
      authors: ['Henry Barrows'],
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: frontmatter.title,
      description: frontmatter.seo?.description,
      images: [ogImage],
    },
  }
}

export default async function ArticlePage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const article = getArticle(slug)

  if (!article || article.frontmatter.status !== 'published') {
    notFound()
  }

  switch (article.type) {
    case 'chronik':
      return <ChronikLayout article={article} />
    case 'analyse':
      return <AnalyseLayout article={article} />
    case 'grundlage':
      return <GrundlageLayout article={article} />
    default:
      notFound()
  }
}
