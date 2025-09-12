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
 * Get the access token from localStorage
 */
export function getAccessToken(): string | null {
  if (!isBrowser) return null
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  } catch (error) {
    console.error("Failed to get access token:", error)
    return null
  }
}

/**
 * Get the refresh token from localStorage
 */
export function getRefreshToken(): string | null {
  if (!isBrowser) return null
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  } catch (error) {
    console.error("Failed to get refresh token:", error)
    return null
  }
}

/**
 * Save access and optionally refresh token to localStorage
 */
export function setTokens({ accessToken, refreshToken }: Tokens): void {
  if (!isBrowser) return
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    }
  } catch (error) {
    console.error("Failed to set tokens:", error)
  }
}

/**
 * Clear all tokens from localStorage
 */
export function clearTokens(): void {
  if (!isBrowser) return
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  } catch (error) {
    console.error("Failed to clear tokens:", error)
  }
}
