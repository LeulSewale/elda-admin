"use client"

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { getPreferredLanguage, getCurrentLocaleFromPath } from '@/lib/language-utils'

/**
 * LanguageInitializer component that ensures language preference is set
 * This runs on every page load to sync localStorage with cookies
 */
export function LanguageInitializer() {
  const pathname = usePathname()

  useEffect(() => {
    // Get current locale from URL or preferred language
    const currentLocale = getCurrentLocaleFromPath(pathname) || getPreferredLanguage()
    
    // Set the NEXT_LOCALE cookie to match the current locale
    // This ensures middleware respects the user's language choice
    document.cookie = `NEXT_LOCALE=${currentLocale}; path=/; max-age=${60 * 60 * 24 * 365}` // 1 year
    
    // Also save to localStorage for consistency
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('elda-preferred-language', currentLocale)
      } catch (error) {
        console.warn('[LanguageInitializer] Error saving to localStorage:', error)
      }
    }
  }, [pathname])

  // This component doesn't render anything
  return null
}
