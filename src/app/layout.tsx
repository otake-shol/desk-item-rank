import type { Metadata } from 'next'
import './globals.css'
import { WebSiteJsonLd, OrganizationJsonLd } from '@/components/seo/JsonLd'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://desk-goods-rank.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'デスクグッズランキング | デスク環境アイテム人気ランキング',
    template: '%s | デスクグッズランキング',
  },
  description:
    'デスクグッズランキングは、SNS・YouTube・Amazonのデータをもとにデスク環境アイテムの人気ランキングをお届け。モニター、キーボード、チェアなど、本当に人気のデスクグッズが見つかります。',
  keywords: [
    'デスクグッズランキング',
    'デスクグッズランク',
    'デスク環境',
    'デスクアイテム',
    'ランキング',
    'モニター',
    'キーボード',
    'マウス',
    'デスクチェア',
    'ガジェット',
  ],
  authors: [{ name: 'デスクグッズランキング' }],
  creator: 'デスクグッズランキング',
  publisher: 'デスクグッズランキング',
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    siteName: 'デスクグッズランキング',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    google: 'yNTuqPmWjThhuTRaF_0MlPIR5WNU2Nou5GnSHWKFmt8',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <head>
        <WebSiteJsonLd />
        <OrganizationJsonLd />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
