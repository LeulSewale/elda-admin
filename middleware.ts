// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import createMiddleware from 'next-intl/middleware'
import { locales } from './lib/i18n'

const DEBUG = process.env.NEXT_PUBLIC_ENABLE_DEBUG_LOGGING === 'true'

// Create the intl middleware with locale detection
const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales: locales,
  
  // Used when no locale matches
  defaultLocale: 'en',
  
  // Always use locale prefixes for consistency
  localePrefix: 'always',
  
  // Custom locale detection that respects stored preference
  localeDetection: true
})

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle internationalization first
  const intlResponse = intlMiddleware(request)
  
  // If intl middleware redirects, return that response
  if (intlResponse.status === 307 || intlResponse.status === 308) {
    return intlResponse
  }

  // ✅ Allow these public routes without auth (with locale prefixes)
  const publicPaths = [
    "/", 
    "/en/login", "/am/login",
    "/en/signup", "/am/signup", 
    "/en/about", "/am/about", 
    "/en/contact", "/am/contact"
  ]

  const isPublic = publicPaths.some((path) => pathname.startsWith(path))

  const token = request.cookies.get("access_token")?.value

  // Handle authentication
  if (!token && !isPublic) {
    if (DEBUG) {
      console.log(`[Middleware] No access_token cookie found for ${pathname}, redirecting to login`)
    }
    
    // Get preferred language from cookie or default to 'en'
    const preferredLang = request.cookies.get('NEXT_LOCALE')?.value || 'en'
    const validLang = locales.includes(preferredLang as any) ? preferredLang : 'en'
    
    // Redirect to login with user's preferred language
    const loginUrl = new URL(`/${validLang}/login`, request.url)
    loginUrl.searchParams.set("from", pathname) // Preserve original route for redirect after login
    return NextResponse.redirect(loginUrl)
  }

  // ✅ Allow request if authenticated or public
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all routes except Next.js internals and static assets
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
}