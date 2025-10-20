// Language utility functions for persistence and detection
import { locales, type Locale } from './i18n'

const LANGUAGE_STORAGE_KEY = 'elda-preferred-language'

/**
 * Get the user's preferred language from localStorage
 * Falls back to browser language or default locale
 */
export function getPreferredLanguage(): Locale {
  if (typeof window === 'undefined') {
    return 'en' // Server-side fallback
  }

  try {
    // First, try to get from localStorage
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (stored && locales.includes(stored as Locale)) {
      return stored as Locale
    }

    // Fallback to browser language detection
    const browserLang = navigator.language.split('-')[0] // e.g., 'en' from 'en-US'
    if (locales.includes(browserLang as Locale)) {
      return browserLang as Locale
    }

    // Final fallback to default
    return 'en'
  } catch (error) {
    console.warn('[Language] Error getting preferred language:', error)
    return 'en'
  }
}

/**
 * Save the user's preferred language to localStorage
 */
export function savePreferredLanguage(locale: Locale): void {
  if (typeof window === 'undefined') {
    return // Server-side, do nothing
  }

  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, locale)
  } catch (error) {
    console.warn('[Language] Error saving preferred language:', error)
  }
}

/**
 * Get current locale from pathname
 */
export function getCurrentLocaleFromPath(pathname: string): Locale {
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return locale
    }
  }
  return 'en' // fallback to default
}

/**
 * Remove locale prefix from pathname
 */
export function removeLocaleFromPath(pathname: string): string {
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.substring(`/${locale}`.length)
    } else if (pathname === `/${locale}`) {
      return '/'
    }
  }
  return pathname
}

/**
 * Add locale prefix to pathname
 */
export function addLocaleToPath(pathname: string, locale: Locale): string {
  const cleanPath = removeLocaleFromPath(pathname)
  return `/${locale}${cleanPath === '/' ? '' : cleanPath}`
}
