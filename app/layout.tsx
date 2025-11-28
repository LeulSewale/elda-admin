import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

// Use system fonts as fallback to avoid Google Fonts timeout issues
const fontFamily = [
  "system-ui",
  "-apple-system",
  "BlinkMacSystemFont",
  "Segoe UI",
  "Roboto",
  "Helvetica Neue",
  "Arial",
  "sans-serif"
].join(", ")

export const metadata: Metadata = {
  title: "ELDA - Admin Panel",
  description: "Professional document and ticket management system",
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ 
  children
}: { 
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <title>ELDA Admin</title>
        <link rel="icon" href="/favicon.ico" type="image/png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('elda-theme');
                  const fontSize = localStorage.getItem('elda-font-size');
                  const root = document.documentElement;
                  
                  // Apply font size
                  const fontSizeMap = { small: 14, medium: 16, large: 18, xlarge: 20 };
                  if (fontSize && fontSizeMap[fontSize]) {
                    root.style.fontSize = fontSizeMap[fontSize] + 'px';
                    document.body.style.fontSize = fontSizeMap[fontSize] + 'px';
                  } else {
                    root.style.fontSize = '16px';
                    document.body.style.fontSize = '16px';
                  }
                  
                  // Apply theme
                  if (theme === 'dark') {
                    root.classList.add('dark');
                  } else if (theme === 'light') {
                    root.classList.remove('dark');
                  } else {
                    // System preference
                    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    if (systemPrefersDark) {
                      root.classList.add('dark');
                    } else {
                      root.classList.remove('dark');
                    }
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased bg-background text-foreground" style={{ fontFamily }}>
        {children}
      </body>
    </html>
  )
}
