export const metadata = {
  title: "Users | ELDA System Admin",
  description: "View and manage users in the ELDA System Admin Dashboard.",
  keywords: ["users", "dashboard", "ELDA", "admin"],
}

import { UsersPageClient } from "./UsersPageClient"

export default function UsersPage() {
  return <UsersPageClient />
}
