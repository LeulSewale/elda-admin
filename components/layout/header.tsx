"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, LogOut, User } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import type { User as UserType } from "@/lib/types"
import { Sidebar, SidebarToggle } from "./sidebar"
import { ProfileModal } from "@/components/modals/profile-modal"
import { NotificationsDropdown } from "@/components/modals/notifications-modal"
import { useNotifications } from "@/hooks/use-notifications"
import { useState } from "react"

interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  const { user, logout } = useAuth() as { user: UserType | null, logout: () => void }
  const { unreadCount } = useNotifications()
  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Sidebar />
            <SidebarToggle />
            <h1 className="text-xl font-semibold text-gray-900 ml-2">{title}</h1>
          </div>

          <div className="flex items-center space-x-4">
          <NotificationsDropdown open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Button>
          </NotificationsDropdown>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={user?.profileImage?.url || "/placeholder-user.jpg"} 
                      alt={user?.fullName || "User"} 
                    />
                    <AvatarFallback className="bg-blue-500 text-white">
                      {typeof user?.fullName === "string" && user.fullName
                        ? user.fullName.charAt(0).toUpperCase()
                        : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.fullName || "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email || "user@example.com"}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setProfileOpen(true)}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Modals */}
      <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  )
}
