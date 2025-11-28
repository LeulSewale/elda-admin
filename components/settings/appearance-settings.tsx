"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Moon, Sun, Type, Settings } from "lucide-react"
import { useTranslations } from 'next-intl'

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

const fontSizeLabels: Record<FontSize, string> = {
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
  xlarge: 'Extra Large',
}

export function AppearanceSettings() {
  const [fontSize, setFontSize] = useState<FontSize>('medium')
  const [theme, setTheme] = useState<Theme>('system')
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const tCommon = useTranslations('common')

  useEffect(() => {
    setMounted(true)
    // Load saved preferences
    if (typeof window !== 'undefined') {
      const savedFontSize = localStorage.getItem(FONT_SIZE_STORAGE_KEY) as FontSize
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme
      
      if (savedFontSize && fontSizeMap[savedFontSize]) {
        setFontSize(savedFontSize)
        applyFontSize(savedFontSize)
      } else {
        applyFontSize('medium')
      }
      
      if (savedTheme) {
        setTheme(savedTheme)
        applyTheme(savedTheme)
      } else {
        // Check system preference
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        applyTheme(systemPrefersDark ? 'dark' : 'light')
      }
    }
  }, [])

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system')
      }
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const applyFontSize = (size: FontSize) => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      root.style.fontSize = `${fontSizeMap[size]}px`
      // Also apply to body for better compatibility
      document.body.style.fontSize = `${fontSizeMap[size]}px`
    }
  }

  const applyTheme = (newTheme: Theme) => {
    if (typeof document === 'undefined') return
    
    const root = document.documentElement
    
    if (newTheme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (systemPrefersDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    } else if (newTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }

  const handleFontSizeChange = (newSize: FontSize) => {
    setFontSize(newSize)
    applyFontSize(newSize)
    if (typeof window !== 'undefined') {
      localStorage.setItem(FONT_SIZE_STORAGE_KEY, newSize)
    }
  }

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
    applyTheme(newTheme)
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          title="Appearance Settings"
          className="hover:bg-gray-100 dark:hover:bg-gray-800"
          disabled={!mounted}
        >
          <Settings className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Appearance Settings
          </DialogTitle>
          <DialogDescription>
            Customize font size and theme preferences
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Font Size Settings */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base">
              <Type className="h-4 w-4" />
              Font Size
            </Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Current: {fontSizeLabels[fontSize]}</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {(['small', 'medium', 'large', 'xlarge'] as FontSize[]).map((size) => (
                  <Button
                    key={size}
                    variant={fontSize === size ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFontSizeChange(size)}
                    className="w-full"
                  >
                    {fontSizeLabels[size]}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Theme Settings */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base">
              {theme === 'dark' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
              Theme
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleThemeChange('light')}
                className="w-full flex items-center gap-2"
              >
                <Sun className="h-4 w-4" />
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleThemeChange('dark')}
                className="w-full flex items-center gap-2"
              >
                <Moon className="h-4 w-4" />
                Dark
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleThemeChange('system')}
                className="w-full"
              >
                System
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

