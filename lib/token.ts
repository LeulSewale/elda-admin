type Tokens = {
  accessToken: string
  refreshToken?: string
}

const ACCESS_TOKEN_KEY = "accessToken"
const REFRESH_TOKEN_KEY = "refreshToken"

/**
 * Check if running in the browser (avoids SSR errors)
 */
const isBrowser = typeof window !== "undefined"

/**
 * Get cookie value by name
 */
function getCookie(name: string): string | null {
  if (!isBrowser) return null
  try {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null
    }
    return null
  } catch (error) {
    console.error("Failed to get cookie:", error)
    return null
  }
}

/**
 * Set cookie value
 */
function setCookie(name: string, value: string, days: number = 7): void {
  if (!isBrowser) return
  try {
    const expires = new Date()
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000))
    
    // Use secure flag only in production
    const isProduction = process.env.NODE_ENV === 'production'
    const secureFlag = isProduction ? 'secure;' : ''
    
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;${secureFlag}samesite=strict`
  } catch (error) {
    console.error("Failed to set cookie:", error)
  }
}

/**
 * Delete cookie
 */
function deleteCookie(name: string): void {
  if (!isBrowser) return
  try {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
  } catch (error) {
    console.error("Failed to delete cookie:", error)
  }
}

/**
 * Get the access token from cookies (fallback to localStorage for backward compatibility)
 */
export function getAccessToken(): string | null {
  if (!isBrowser) return null
  try {
    // First try cookies
    const cookieToken = getCookie("access_token")
    if (cookieToken) return cookieToken
    
    // Fallback to localStorage for backward compatibility
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  } catch (error) {
    console.error("Failed to get access token:", error)
    return null
  }
}

/**
 * Get the refresh token from cookies (fallback to localStorage for backward compatibility)
 */
export function getRefreshToken(): string | null {
  if (!isBrowser) return null
  try {
    // First try cookies
    const cookieToken = getCookie("refresh_token")
    if (cookieToken) return cookieToken
    
    // Fallback to localStorage for backward compatibility
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  } catch (error) {
    console.error("Failed to get refresh token:", error)
    return null
  }
}

/**
 * Save access and optionally refresh token to cookies and localStorage (for backward compatibility)
 */
export function setTokens({ accessToken, refreshToken }: Tokens): void {
  if (!isBrowser) return
  try {
    // Set cookies (primary storage)
    setCookie("access_token", accessToken, 1) // 1 day expiry for access token
    if (refreshToken) {
      setCookie("refresh_token", refreshToken, 7) // 7 days expiry for refresh token
    }
    
    // Also set localStorage for backward compatibility
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    }
  } catch (error) {
    console.error("Failed to set tokens:", error)
  }
}

/**
 * Clear all tokens from cookies and localStorage
 */
export function clearTokens(): void {
  if (!isBrowser) return
  try {
    // Clear cookies
    deleteCookie("access_token")
    deleteCookie("refresh_token")
    
    // Clear localStorage
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  } catch (error) {
    console.error("Failed to clear tokens:", error)
  }
}
