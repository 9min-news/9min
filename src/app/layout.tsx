import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: {
    default: '9min',
    template: '%s — 9min',
  },
  description: 'Schweizer Medienkritik. Registrierender Natur. Mit vorsichtiger Würde.',
  metadataBase: new URL('https://9min.ch'),
  openGraph: {
    siteName: '9min',
    locale: 'de_CH',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de-CH">
      <head>
        {/* Preload fonts — font files added separately */}
        <link
          rel="preload"
          href="/fonts/GTSectra-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/GTSectraDisplay-Medium.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
