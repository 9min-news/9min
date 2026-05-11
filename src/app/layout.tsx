import type { Metadata } from 'next'
import Script from 'next/script'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: {
    default: '9min',
    template: '%s — 9min',
  },
  description: 'Der fehlende Moment🔻 Die fehlende Perspektive — Schweizer Medienkritik. Registrierender Natur. Mit vorsichtiger Würde.',
  metadataBase: new URL('https://9min.ch'),
  icons: {
    icon: [
      { url: '/9min_favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/9min_favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/9min_favicon/apple-touch-icon.png',
    shortcut: '/9min_favicon/favicon.ico',
    other: [
      { rel: 'icon', url: '/9min_favicon/android-chrome-192x192.png', sizes: '192x192' },
      { rel: 'icon', url: '/9min_favicon/android-chrome-512x512.png', sizes: '512x512' },
    ],
  },
  openGraph: {
    siteName: '9min',
    locale: 'de_CH',
    images: [{ url: '/9min-OG.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/9min-OG.jpg'],
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
      <body>
        {children}
        <Script
          src="https://cloud.umami.is/script.js"
          data-website-id="607fd526-62a9-4d97-9a52-b0cb18b21bbf"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
