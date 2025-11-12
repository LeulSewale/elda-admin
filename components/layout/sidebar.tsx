"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard ,
  Ticket ,
  FileText,
  BookText ,
  Menu,
  Users, 
  LogOut,
  User ,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState, createContext, useContext } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/hooks/use-auth"
import { Logo } from "@/components/ui/logo"
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from '@/components/language-switcher'
import { getCurrentLocaleFromPath } from '@/lib/language-utils'

const navigation = [
  {
    name: "MAIN_MENU",
    items: [
      { name: "dashboard", href: "/dashboard", icon: LayoutDashboard , roles: ["admin", "user","lawyer"] },
      { name: "requestManagement", href: "/requests", icon: FileText, roles: ["admin","user","lawyer"] },
      { name: "ticketManagement", href: "/tickets", icon: Ticket , roles: ["admin","user"] },  
      { name: "documentManagement", href: "/documents", icon: BookText , roles: ["admin","user","lawyer"] },   
    ],
  },
  {
    name: "ADMINISTRATION",
    items: [
      { name: "userManagement", href: "/users", icon: User, roles: ["admin"] },
      { name: "employeeManagement", href: "/employees", icon: Users , roles: ["admin", "HR-manager"] },
    ],
  },
  {
    name: "HR_MENU",
    items: [
      { name: "employeeManagement", href: "/employees", icon: Users , roles: ["HR-manager"] },
    ],
  },
 
]

const SidebarContext = createContext<{
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}>({
  collapsed: false,
  setCollapsed: () => {},
})

export const useSidebar = () => useContext(SidebarContext)

function SidebarContent({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname()
  const { role, isLoading, logout } = useAuth();
  const t = useTranslations('navigation');
  const tCommon = useTranslations('common');
  
  // Get current locale to construct proper links
  const currentLocale = getCurrentLocaleFromPath(pathname)
  
  if (isLoading) return null;

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-white border-r border-gray-200 transition-all duration-300 shadow-sm",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className={cn("p-6 border-b border-gray-200", collapsed && "p-4")}> 
        <Link href={`/${currentLocale}/dashboard`} className="flex items-center space-x-2">
          <Logo 
            width={40}
            height={40}
            className="drop-shadow-md"
            fallbackText="E"
          />
          {!collapsed && <span className="text-xl font-bold text-gray-900">ELDA</span>}
        </Link>
      </div>

      <nav className="flex-1 space-y-8 px-4 py-6 overflow-y-auto">
        <TooltipProvider>
          {navigation
            .map((section) => (
              <div key={section.name}>
                {(() => {
                  // Filter items first to see if section has any visible items
                  const visibleItems = section.items.filter(item => {
                    // For HR-manager: only show items from HR_MENU section
                    if (role === "HR-manager") {
                      return section.name === "HR_MENU" && (!item.roles || item.roles.includes(role))
                    }
                    // For others: filter by role as normal
                    return !item.roles || !role || item.roles.includes(role)
                  })
                  
                  // Only show section if it has visible items
                  if (visibleItems.length === 0) return null
                  
                  // Show section header
                  return (
                    <>
                      {!collapsed && (
                        <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 border-b border-gray-100 pb-2">
                          {t(section.name.toLowerCase())}
                        </h3>
                      )}
                      <div className="space-y-1">
                        {visibleItems.map((item) => {
                      const computedHref = item.name === "ticketManagement" ? (role === "admin" ? "/tickets/admin" : "/tickets") : item.href
                      // Add locale prefix to href
                      const localizedHref = `/${currentLocale}${computedHref}`
                      // Enhanced active state detection - check if current pathname starts with the item's href
                      const isActive = pathname === localizedHref || pathname.startsWith(localizedHref + "/")
                      const linkContent = (
                        <Link
                          href={localizedHref}
                          className={cn(
                            "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 border",
                            collapsed ? "justify-center" : "",
                            isActive
                              ? "bg-[#4082ea] text-white border-[#4082ea] shadow-md font-semibold"
                              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 border-transparent hover:border-gray-200",
                          )}
                        >
                          <item.icon
                            className={cn(
                              "h-5 w-5 flex-shrink-0 transition-colors",
                              collapsed ? "mr-0" : "mr-3",
                              isActive ? "text-white" : "text-gray-500 group-hover:text-gray-700",
                            )}
                          />
                          {!collapsed && t(item.name)}
                        </Link>
                      )

                      if (collapsed) {
                        return (
                          <Tooltip key={item.name}>
                            <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                            <TooltipContent side="right">
                              <p>{t(item.name)}</p>
                            </TooltipContent>
                          </Tooltip>
                        )
                      }

                      return <div key={item.name}>{linkContent}</div>
                        })}
                      </div>
                    </>
                  )
                })()}
              </div>
            ))}
        </TooltipProvider>
      </nav>
      
      {/* Language Switcher */}
      <div className={cn("px-4 pb-2", collapsed && "px-2")}>
        <LanguageSwitcher />
      </div>
      
      {/* Log Out at the bottom */}
      <div className={cn("px-4 pb-6", collapsed && "px-2")}
           style={{ marginTop: "auto" }}>
       <TooltipProvider>
         <Tooltip>
           <TooltipTrigger asChild>
             <Button
               variant="destructive"
               className={cn("flex items-center gap-2 w-full justify-start bg-red-500 hover:bg-red-600 text-white border-0", collapsed && "justify-center px-0")}
               onClick={() => logout()}
             >
               <LogOut className="w-5 h-5" />
               {!collapsed && <span>{tCommon('logout')}</span>}
             </Button>
           </TooltipTrigger>
           {collapsed && <TooltipContent side="right">{tCommon('logout')}</TooltipContent>}
         </Tooltip>
       </TooltipProvider>
      </div>
    </div>
  )
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  return <SidebarContext.Provider value={{ collapsed, setCollapsed }}>{children}</SidebarContext.Provider>
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { collapsed } = useSidebar()

  return (
    <>
      {/* Desktop Sidebar - Fixed positioning */}
      <div
        className={cn(
          "hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:overflow-y-auto transition-all duration-300",
          collapsed ? "lg:w-16" : "lg:w-72",
        )}
      >
        <SidebarContent collapsed={collapsed} />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open sidebar</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72">
          <SidebarContent collapsed={false} />
        </SheetContent>
      </Sheet>
    </>
  )
}

export function SidebarToggle() {
  const { collapsed, setCollapsed } = useSidebar()

  return (
    <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="hidden lg:flex">
      <Menu className="h-5 w-5" />
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  )
}