'use client'

/**
 * 検索サジェストコンポーネント
 * 仕様書: specs/08-search-enhancement.md
 */

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDebounce } from '@/hooks/useDebounce'
import { SuggestionItem } from '@/data/search'

interface SearchSuggestionsProps {
  query: string
  isOpen: boolean
  onClose: () => void
  selectedIndex: number
  onSelectIndex: (index: number) => void
}

export function SearchSuggestions({
  query,
  isOpen,
  onClose,
  selectedIndex,
  onSelectIndex,
}: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const debouncedQuery = useDebounce(query, 300)
  const router = useRouter()

  // サジェストを取得
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.length < 2) {
        setSuggestions([])
        return
      }

      setIsLoading(true)
      try {
        // クライアントサイドでインポート
        const { getSuggestions } = await import('@/data/search')
        const results = getSuggestions(debouncedQuery, 5)
        setSuggestions(results)
      } catch (error) {
        console.error('Failed to fetch suggestions:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSuggestions()
  }, [debouncedQuery])

  // アイテム選択
  const handleSelect = useCallback(
    (suggestion: SuggestionItem) => {
      router.push(`/item/${suggestion.id}`)
      onClose()
    },
    [router, onClose]
  )

  // キーボードでEnterが押された時
  useEffect(() => {
    if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
      // 選択されたアイテムがある場合は何もしない（親コンポーネントで処理）
    }
  }, [selectedIndex, suggestions])

  if (!isOpen || suggestions.length === 0) {
    return null
  }

  return (
    <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-gray-200 bg-white shadow-lg">
      {isLoading ? (
        <div className="p-3 text-center text-sm text-gray-500">
          読み込み中...
        </div>
      ) : (
        <ul role="listbox">
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.id}
              role="option"
              aria-selected={index === selectedIndex}
              className={`cursor-pointer px-4 py-3 ${
                index === selectedIndex
                  ? 'bg-gray-100'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleSelect(suggestion)}
              onMouseEnter={() => onSelectIndex(index)}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">
                  {suggestion.name}
                </span>
                <span className="text-xs text-gray-500">
                  {suggestion.category}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// 現在選択されているサジェストを取得するためのヘルパー
export function getSelectedSuggestion(
  suggestions: SuggestionItem[],
  selectedIndex: number
): SuggestionItem | null {
  if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
    return suggestions[selectedIndex]
  }
  return null
}
