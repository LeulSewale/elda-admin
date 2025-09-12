export const metadata = {
  title: "Dashboard | Tele Tender Admin",
  description: "View analytics, recent bids, and manage tenders in the Tele Tender Admin Dashboard.",
  keywords: ["tender", "admin", "dashboard", "bids", "companies", "analytics"],
  openGraph: {
    title: "Dashboard | Tele Tender Admin",
    description: "View analytics, recent bids, and manage tenders in the Tele Tender Admin Dashboard.",
    url: "https://yourdomain.com/dashboard",
    siteName: "Tele Tender Admin",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dashboard | Tele Tender Admin",
    description: "View analytics, recent bids, and manage tenders in the Tele Tender Admin Dashboard.",
  },
}

import  DashboardPageClient  from "./DashboardPageClient"

export default function DashboardPage() {
  return  <DashboardPageClient />
}
