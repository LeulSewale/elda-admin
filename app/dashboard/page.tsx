export const metadata = {
  title: "Dashboard | ELDA Admin",
  description: "View analytics, manage requests, and track tickets in the ELDA Admin Dashboard.",
  keywords: ["documents", "admin", "dashboard", "requests", "tickets", "analytics"],
  openGraph: {
    title: "Dashboard | ELDA Admin",
    description: "View analytics, manage requests, and track tickets in the ELDA Admin Dashboard.",
    url: "https://yourdomain.com/dashboard",
    siteName: "ELDA Admin",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dashboard | ELDA Admin",
    description: "View analytics, manage requests, and track tickets in the ELDA Admin Dashboard.",
  },
}

import  DashboardPageClient  from "./DashboardPageClient"

export default function DashboardPage() {
  return  <DashboardPageClient />
}
