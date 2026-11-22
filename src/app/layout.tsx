import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Base88 — Build, Launch, and Run AI Businesses',
    template: '%s | Base88',
  },
  description: "Base88 is building an independent AI business-operator platform. Try a downloadable starter business site and follow the verified November 28 beta launch.",
  keywords: [
    'AI app builder Singapore',
    'no-code platform Singapore',
    'build apps without coding',
    'AI web app builder',
    'no-code Singapore',
    'app builder Singapore',
    'build web app AI',
    'no code app builder',
    'Singapore SaaS platform',
    'AI business app',
    'app without code',
    'Base88',
    'base88.app',
  ],
  authors: [{ name: 'Base88', url: 'https://base88.app' }],
  creator: 'Base88',
  publisher: 'Base88',
  metadataBase: new URL('https://base88.app'),
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_SG',
    url: 'https://base88.app',
    siteName: 'Base88',
    title: 'Base88 — Build, Launch, and Run AI Businesses',
    description: "Explore a real downloadable starter project with Surprise Me and track the verified November 28 Base88 beta.",
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Base88 — AI App Builder Singapore' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Base88 — AI App Builder Singapore',
    description: 'Explore independent Base88 business-building tools, with a verifiable beta launch on November 28.',
    images: ['/og-image.png'],
    creator: '@base88app',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  verification: { google: 'x_IwINXQs-1Xo-LC7uRK-0XUEkbKO0aH7cEn9_hGsQs' },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Base88",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "url": "https://base88.app",
  "description": "An independent AI business operator in development, with starter projects you can download and test.",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "SGD", "description": "Free plan available" },
  "publisher": { "@type": "Organization", "name": "Base88", "url": "https://base88.app", "address": { "@type": "PostalAddress", "addressCountry": "SG", "addressLocality": "Singapore" } }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-SG">
      <head>
        <link rel="canonical" href="https://base88.app" />
        <meta name="geo.region" content="SG" />
        <meta name="geo.placename" content="Singapore" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
