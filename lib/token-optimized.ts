// 📁 lib/token-optimized.ts
// Optimized token and cookie management system with environment variables

import { config } from "./config"

type Tokens = {
  accessToken: string
  refreshToken?: string
}

const ACCESS_TOKEN_KEY = "access_token"
const REFRESH_TOKEN_KEY = "refresh_token"

/**
 * Check if running in the browser (avoids SSR errors)
 */
const isBrowser = typeof window !== "undefined"

/**
 * Enhanced cookie management with better error handling and security
 */
class CookieManager {
  private static instance: CookieManager
  
  static getInstance(): CookieManager {
    if (!CookieManager.instance) {
      CookieManager.instance = new CookieManager()
    }
    return CookieManager.instance
  }

  /**
   * Get cookie value by name with enhanced parsing
   */
  getCookie(name: string): string | null {
    if (!isBrowser) return null
    try {
      const cookies = document.cookie.split(';')
      for (let cookie of cookies) {
        const [key, value] = cookie.trim().split('=')
        if (key === name) {
          return decodeURIComponent(value || '')
        }
      }
      return null
    } catch (error) {
      console.error(`Failed to get cookie ${name}:`, error)
      return null
    }
  }

  /**
   * Set cookie with enhanced security options from environment variables
   */
  setCookie(name: string, value: string, options: {
    days?: number
    secure?: boolean
    sameSite?: 'strict' | 'lax' | 'none'
    path?: string
  } = {}): void {
    if (!isBrowser) return
    
    const {
      days = 7,
      secure = config.security.cookie.secure,
      sameSite = config.security.cookie.sameSite,
      path = '/'
    } = options

    try {
      const expires = new Date()
      expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000))
      
      const cookieString = [
        `${name}=${encodeURIComponent(value)}`,
        `expires=${expires.toUTCString()}`,
        `path=${path}`,
        secure ? 'secure' : '',
        `samesite=${sameSite}`
      ].filter(Boolean).join('; ')

      document.cookie = cookieString
    } catch (error) {
      console.error(`Failed to set cookie ${name}:`, error)
    }
  }

  /**
   * Delete cookie with proper cleanup
   */
  deleteCookie(name: string, path: string = '/'): void {
    if (!isBrowser) return
    try {
      // Delete with multiple path variations to ensure cleanup
      const paths = [path, '/']
      paths.forEach(p => {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=${p};secure;samesite=strict`
      })
    } catch (error) {
      console.error(`Failed to delete cookie ${name}:`, error)
    }
  }

  /**
   * Check if cookie exists and is not expired
   */
  hasCookie(name: string): boolean {
    return this.getCookie(name) !== null
  }

  /**
   * Get all cookies as an object
   */
  getAllCookies(): Record<string, string> {
    if (!isBrowser) return {}
    
    const cookies: Record<string, string> = {}
    try {
      document.cookie.split(';').forEach(cookie => {
        const [key, value] = cookie.trim().split('=')
        if (key && value) {
          cookies[key] = decodeURIComponent(value)
        }
      })
    } catch (error) {
      console.error('Failed to get all cookies:', error)
    }
    return cookies
  }
}

const cookieManager = CookieManager.getInstance()

/**
 * Enhanced token management with automatic refresh logic
 */
class TokenManager {
  private static instance: TokenManager
  private refreshPromise: Promise<string | null> | null = null

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager()
    }
    return TokenManager.instance
  }

  /**
   * Get access token with automatic refresh if needed
   */
  async getAccessToken(): Promise<string | null> {
    const token = cookieManager.getCookie(ACCESS_TOKEN_KEY)
    
    if (token && this.isTokenValid(token)) {
      return token
    }

    // Token is invalid or expired, try to refresh
    return await this.refreshAccessToken()
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return cookieManager.getCookie(REFRESH_TOKEN_KEY)
  }

  /**
   * Set tokens with optimized cookie settings from environment variables
   */
  setTokens({ accessToken, refreshToken }: Tokens): void {
    if (!isBrowser) return

    try {
      // Set access token with configurable expiry
      cookieManager.setCookie(ACCESS_TOKEN_KEY, accessToken, {
        days: config.security.token.accessTokenExpiryDays,
        secure: config.security.cookie.secure,
        sameSite: config.security.cookie.sameSite
      })

      // Set refresh token with configurable expiry
      if (refreshToken) {
        cookieManager.setCookie(REFRESH_TOKEN_KEY, refreshToken, {
          days: config.security.token.refreshTokenExpiryDays,
          secure: config.security.cookie.secure,
          sameSite: config.security.cookie.sameSite
        })
      }

      // Also store in localStorage for backward compatibility
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
      if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
      }
    } catch (error) {
      console.error('Failed to set tokens:', error)
    }
  }

  /**
   * Clear all tokens
   */
  clearTokens(): void {
    if (!isBrowser) return

    try {
      // Clear cookies
      cookieManager.deleteCookie(ACCESS_TOKEN_KEY)
      cookieManager.deleteCookie(REFRESH_TOKEN_KEY)

      // Clear localStorage
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
    } catch (error) {
      console.error('Failed to clear tokens:', error)
    }
  }

  /**
   * Check if token is valid (basic JWT validation)
   */
  private isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const now = Math.floor(Date.now() / 1000)
      return payload.exp > now
    } catch {
      return false
    }
  }

  /**
   * Refresh access token with promise deduplication
   */
  private async refreshAccessToken(): Promise<string | null> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    this.refreshPromise = this.performRefresh()
    
    try {
      const result = await this.refreshPromise
      return result
    } finally {
      this.refreshPromise = null
    }
  }

  /**
   * Perform the actual refresh request
   */
  private async performRefresh(): Promise<string | null> {
    const refreshToken = this.getRefreshToken()
    
    if (!refreshToken) {
      console.warn('[TokenManager] No refresh token available')
      return null
    }

    try {
      const refreshUrl = `${config.api.baseUrl}${config.api.endpoints.auth.refresh}`
      const response = await fetch(refreshUrl, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Refresh failed with status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.accessToken) {
        this.setTokens({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken || refreshToken
        })
        
        console.debug('[TokenManager] Token refreshed successfully')
        return data.accessToken
      }

      throw new Error('No access token in refresh response')
    } catch (error) {
      console.error('[TokenManager] Token refresh failed:', error)
      this.clearTokens()
      return null
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return cookieManager.hasCookie(ACCESS_TOKEN_KEY) || cookieManager.hasCookie(REFRESH_TOKEN_KEY)
  }
}

const tokenManager = TokenManager.getInstance()

// Export the enhanced functions
export const getAccessToken = () => tokenManager.getAccessToken()
export const getRefreshToken = () => tokenManager.getRefreshToken()
export const setTokens = (tokens: Tokens) => tokenManager.setTokens(tokens)
export const clearTokens = () => tokenManager.clearTokens()
export const isAuthenticated = () => tokenManager.isAuthenticated()

// Legacy exports for backward compatibility
export { cookieManager, tokenManager }
