export const metadata = {
  title: "Tenders | Tele Tender Admin",
  description: "Browse, create, and manage tenders in the Tele Tender Admin system.",
  keywords: ["tenders", "manage", "admin", "bids"],
}

import { TendersPageClient } from "./TendersPageClient"

export default function TendersPage() {
  return <TendersPageClient />
}
