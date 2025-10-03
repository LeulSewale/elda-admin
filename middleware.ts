// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ✅ Allow these public routes without auth
  const publicPaths = ["/", "/login", "/signup", "/about", "/contact"]

  const isPublic = publicPaths.some((path) => pathname.startsWith(path))

  const token = request.cookies.get("access_token")?.value

  if (!token && !isPublic) {
    console.log(`[Middleware] No access_token cookie found for ${pathname}, but allowing request for debugging`)
    // Temporarily disabled for debugging - let frontend handle auth
    // const loginUrl = new URL("/login", request.url)
    // loginUrl.searchParams.set("from", pathname) // Preserve original route for redirect after login
    // return NextResponse.redirect(loginUrl)
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
