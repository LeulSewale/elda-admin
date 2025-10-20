import { HomePageClient } from "../HomePageClient"

export const metadata = {
  title: "ELDA Management System",
  description: "Professional ELDA management system for admins and companies.",
  keywords: ["employees","tickets", "admin", "dashboard", "requests", "documents"],
}

export default function HomePage() {
  return <HomePageClient />
}
