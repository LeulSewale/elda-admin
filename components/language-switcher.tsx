"use client"

import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Globe } from 'lucide-react'
import { locales } from '@/lib/i18n'
import { getCurrentLocaleFromPath, removeLocaleFromPath, savePreferredLanguage } from '@/lib/language-utils'
import { useState } from 'react'

const languageNames = {
  en: 'English',
  am: 'አማርኛ'
}

const languageFlags = {
  en: '🇺🇸',
  am: '🇪🇹'
}

export function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const [isChanging, setIsChanging] = useState(false)
  
  // Get current locale from pathname for more reliable updates
  const currentLocale = getCurrentLocaleFromPath(pathname)

  const handleLanguageChange = (newLocale: string) => {
    // Prevent double-clicking and rapid successive clicks
    if (isChanging || newLocale === currentLocale) {
      return
    }
    
    setIsChanging(true)
    
    // Save the language preference to localStorage
    savePreferredLanguage(newLocale as any)
    
    // Set the NEXT_LOCALE cookie for middleware
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}` // 1 year
    
    // Remove locale prefix from current pathname
    const pathWithoutLocale = removeLocaleFromPath(pathname)
    
    // Navigate to the new locale
    router.push(`/${newLocale}${pathWithoutLocale}`)
    
    // Reset the changing state after a short delay
    setTimeout(() => {
      setIsChanging(false)
    }, 500)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2 border-gray-300 hover:border-[#4082ea] hover:text-[#4082ea]"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {languageFlags[currentLocale as keyof typeof languageFlags]} {languageNames[currentLocale as keyof typeof languageNames]}
          </span>
          <span className="sm:hidden">
            {languageFlags[currentLocale as keyof typeof languageFlags]}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLanguageChange(loc)}
            disabled={isChanging}
            className={`flex items-center gap-3 cursor-pointer ${
              currentLocale === loc ? 'bg-[#4082ea]/10 text-[#4082ea]' : ''
            } ${isChanging ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="text-lg">{languageFlags[loc as keyof typeof languageFlags]}</span>
            <span className="font-medium">{languageNames[loc as keyof typeof languageNames]}</span>
            {currentLocale === loc && (
              <span className="ml-auto text-[#4082ea]">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
