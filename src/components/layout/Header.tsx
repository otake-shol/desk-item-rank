'use client'

/**
 * ヘッダーコンポーネント（ガジェット系デザイン）
 * 仕様書: specs/01-top-page.md
 */

import { useState, useEffect, useRef, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getAllCategories } from '@/data'

// カテゴリ別のアイコン
const categoryIcons: Record<string, ReactNode> = {
  device: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
    </svg>
  ),
  furniture: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  ),
  lighting: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
    </svg>
  ),
  audio: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
    </svg>
  ),
  accessory: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
  ),
}

// カテゴリ別のアクセントカラー
const categoryColors: Record<string, string> = {
  device: 'text-[#00d4ff]',
  furniture: 'text-[#00ff88]',
  lighting: 'text-[#ffaa00]',
  audio: 'text-[#a855f7]',
  accessory: 'text-[#f472b6]',
}

export function Header() {
  const pathname = usePathname()
  const categories = getAllCategories()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleLogoClick = (e: React.MouseEvent) => {
    if (pathname === '/') {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  /**
   * カテゴリクリック時の処理
   * トップページ: 該当セクションへスムーズスクロール
   * 他のページ: カテゴリページへ遷移
   */
  const handleCategoryClick = (e: React.MouseEvent, categoryId: string) => {
    setIsMenuOpen(false)

    if (pathname === '/') {
      e.preventDefault()
      const element = document.getElementById(`category-${categoryId}`)
      if (element) {
        const headerHeight = 64 // ヘッダーの高さ（h-16 = 64px）
        const elementPosition = element.getBoundingClientRect().top + window.scrollY
        window.scrollTo({
          top: elementPosition - headerHeight - 16,
          behavior: 'smooth',
        })
      }
    }
  }

  // メニュー外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* ロゴ */}
          <Link href="/" onClick={handleLogoClick} className="flex items-center gap-2.5 shrink-0 group">
            <div className="relative h-8 w-8">
              <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8">
                {/* モニター */}
                <rect x="2" y="4" width="22" height="16" rx="2" fill="#1a1a24" stroke="#00d4ff" strokeWidth="1.5" className="group-hover:stroke-white transition-colors"/>
                <rect x="4" y="6" width="18" height="12" rx="1" fill="#12121a"/>
                {/* スタンド */}
                <path d="M10 20v3h6v-3" stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round" className="group-hover:stroke-white transition-colors"/>
                <path d="M8 23h10" stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round" className="group-hover:stroke-white transition-colors"/>
                {/* 星 */}
                <path d="M26 6l1.2 2.4 2.6.4-1.9 1.8.4 2.6-2.3-1.2-2.3 1.2.4-2.6-1.9-1.8 2.6-.4L26 6z" fill="#ffd700"/>
              </svg>
            </div>
            <span className="text-base font-semibold text-white tracking-tight">
              デスクグッズランキング
            </span>
          </Link>

          {/* デスクトップナビゲーション */}
          <nav className="hidden md:flex md:items-center md:gap-1 shrink-0">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.id}`}
                className="rounded-lg px-4 py-2 text-sm font-medium text-[#8888a0] transition-colors hover:bg-white/5 hover:text-white"
              >
                {category.name}
              </Link>
            ))}
          </nav>

          {/* モバイル用カテゴリメニューボタン */}
          <div className="relative md:hidden" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-[#8888a0] transition-colors hover:bg-white/5 hover:text-white"
              aria-label="カテゴリメニュー"
              aria-expanded={isMenuOpen}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            </button>

            {/* ドロップダウンメニュー */}
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-xl border border-white/10 bg-[#1a1a24]/95 backdrop-blur-xl shadow-xl">
                <div className="py-2">
                  <div className="px-4 py-2 text-xs font-medium text-[#8888a0]">
                    カテゴリ
                  </div>
                  {categories.map((category) => {
                    const icon = categoryIcons[category.id]
                    const colorClass = categoryColors[category.id] || 'text-[#00d4ff]'
                    return (
                      <Link
                        key={category.id}
                        href={pathname === '/' ? `#category-${category.id}` : `/category/${category.id}`}
                        onClick={(e) => handleCategoryClick(e, category.id)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-white transition-colors hover:bg-white/5"
                      >
                        <span className={`flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 ${colorClass}`}>
                          {icon}
                        </span>
                        {category.name}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
