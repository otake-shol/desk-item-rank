/**
 * デバウンスフック
 * 仕様書: specs/08-search-enhancement.md
 */

import { useState, useEffect } from 'react'

/**
 * 値の変更をデバウンスする
 * @param value 監視する値
 * @param delay 遅延時間（ミリ秒）
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
