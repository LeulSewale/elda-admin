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
    // 🔁 Redirect unauthenticated user to login
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("from", pathname) // Optional: preserve original route
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
