"use client"

import { useEffect } from "react"

const FONT_SIZE_STORAGE_KEY = 'elda-font-size'
const THEME_STORAGE_KEY = 'elda-theme'

type FontSize = 'small' | 'medium' | 'large' | 'xlarge'
type Theme = 'light' | 'dark' | 'system'

const fontSizeMap: Record<FontSize, number> = {
  small: 14,
  medium: 16,
  large: 18,
  xlarge: 20,
}

const applyFontSize = (size: FontSize) => {
  if (typeof document !== 'undefined') {
    const root = document.documentElement
    root.style.fontSize = `${fontSizeMap[size]}px`
    // Also apply to body for better compatibility
    document.body.style.fontSize = `${fontSizeMap[size]}px`
  }
}

const applyTheme = (theme: Theme) => {
  if (typeof document === 'undefined') return
  
  const root = document.documentElement
  
  if (theme === 'dark') {
    root.classList.add('dark')
  } else if (theme === 'light') {
    root.classList.remove('dark')
  } else {
    // System preference
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (systemPrefersDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }
}

export function ThemeInitializer() {
  useEffect(() => {
    // Apply font size
    const savedFontSize = localStorage.getItem(FONT_SIZE_STORAGE_KEY) as FontSize
    if (savedFontSize && fontSizeMap[savedFontSize]) {
      applyFontSize(savedFontSize)
    } else {
      applyFontSize('medium')
    }

    // Apply theme
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme
    if (savedTheme) {
      applyTheme(savedTheme)
    } else {
      // Default to system preference
      applyTheme('system')
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = () => {
      const currentTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme
      if (currentTheme === 'system' || !currentTheme) {
        applyTheme('system')
      }
    }
    
    mediaQuery.addEventListener('change', handleSystemThemeChange)
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
  }, [])

  return null
}

