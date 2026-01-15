'use client'

/**
 * 検索ボックスコンポーネント
 * 仕様書: specs/07-search.md
 */

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface SearchBoxProps {
  placeholder?: string
  className?: string
}

export function SearchBox({
  placeholder = 'アイテムを検索...',
  className = '',
}: SearchBoxProps) {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      }
    },
    [query, router]
  )

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pl-10 text-sm text-gray-900 placeholder-gray-500 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
        aria-label="検索"
      />
      <svg
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
      </svg>
    </form>
  )
}
