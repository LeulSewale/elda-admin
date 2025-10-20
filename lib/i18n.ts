// lib/i18n.ts
import { getRequestConfig } from 'next-intl/server'
import en from '../messages/en.json'
import am from '../messages/am.json'

// Can be imported from a shared config
export const locales = ['en', 'am'] as const
export type Locale = (typeof locales)[number]

const MESSAGES_BY_LOCALE: Record<string, any> = {
  en,
  am,
}

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  let validLocale: string = 'en' // Default fallback

  if (locale && locales.includes(locale as any)) {
    validLocale = locale
  }

  return {
    locale: validLocale,
    messages: MESSAGES_BY_LOCALE[validLocale] ?? en,
  }
})
