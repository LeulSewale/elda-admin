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
  Settings,
  LogOut,
  Flag,
  User ,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState, createContext, useContext } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/hooks/use-auth"
import Image from "next/image"
import logo from "../../public/tele_tender.png"
import { SettingsModal } from "@/components/modals/settings-modal"

const navigation = [
  {
    name: "MAIN MENU",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard , roles: ["admin", "user","lawyer"] },
      { name: "Request Management", href: "/requests", icon: FileText, roles: ["admin","user","lawyer"] },
      { name: "Ticket Management", href: "/tickets", icon: Ticket , roles: ["admin","user"] },  
      { name: "Document Management", href: "/documents", icon: BookText , roles: ["admin","user"] },   
    ],
  },
  {
    name: "ADMINISTRATION",
    items: [
      { name: "User Management", href: "/users", icon: User, roles: ["admin"] },
      { name: "Employee Management", href: "/employees", icon: Users , roles: ["admin"] },
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  if (isLoading) return null;

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-white border-r border-gray-200 transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className={cn("p-6 border-b border-gray-200", collapsed && "p-4")}> 
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="flex items-center justify-center flex-shrink-0">
            <Image
              src={logo}
              alt="Tele Tender Logo"
              width={32}
              height={32}
              className="object-contain drop-shadow"
              style={{ background: 'white', borderRadius: '0.5rem', border: '2px solid #A4D65E', padding: '0.2rem' }}
            />
          </div>
          {!collapsed && <span className="text-xl font-bold text-gray-900">ELDA</span>}
        </Link>
      </div>

      <nav className="flex-1 space-y-8 px-4 py-6 overflow-y-auto">
        <TooltipProvider>
          {navigation
            .map((section) => (
              <div key={section.name}>
                {!collapsed && (role === "admin" || section.name !== "ADMINISTRATION") && (
                  <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    {section.name}
                  </h3>
                )}
                <div className="space-y-1">
                  {section.items
                    .filter(item => !item.roles || !role || item.roles.includes(role))
                    .map((item) => {
                      const computedHref = item.name === "Tickets" || item.name === "Ticket Management" ? (role === "admin" ? "/tickets/admin" : "/tickets") : item.href
                      const isActive = pathname === computedHref
                      const linkContent = (
                        <Link
                          href={computedHref}
                          className={cn(
                            "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                            collapsed ? "justify-center" : "",
                            isActive
                              ? "bg-[#e7eeff] text-[#4082ea] shadow-sm"
                              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                          )}
                        >
                          <item.icon
                            className={cn(
                              "h-5 w-5 flex-shrink-0 transition-colors",
                              collapsed ? "mr-0" : "mr-3",
                              isActive ? "text-[#4082ea]" : "text-gray-500 group-hover:text-gray-700",
                            )}
                          />
                          {!collapsed && item.name}
                        </Link>
                      )

                      if (collapsed) {
                        return (
                          <Tooltip key={item.name}>
                            <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                            <TooltipContent side="right">
                              <p>{item.name}</p>
                            </TooltipContent>
                          </Tooltip>
                        )
                      }

                      return <div key={item.name}>{linkContent}</div>
                    })}
                </div>
              </div>
            ))}
        </TooltipProvider>
      </nav>
      {/* Settings and Log Out at the bottom */}
      <div className={cn("px-4 pb-6 flex flex-col gap-2", collapsed && "px-2")}
           style={{ marginTop: "auto" }}>
       <TooltipProvider>
         <Tooltip>
           <TooltipTrigger asChild>
             <Button
               variant="outline"
               className={cn("flex items-center gap-2 w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-100", collapsed && "justify-center px-0")}
               onClick={() => setSettingsOpen(true)}
             >
               <Settings className="w-5 h-5" />
               {!collapsed && (
                 <div className="flex items-center gap-2 flex-1">
                   <span>Settings</span>
                   <div className="ml-auto flex items-center gap-1">
                     <Flag className="w-3 h-3 text-blue-600" />
                     <span className="text-xs text-blue-600">Coming Soon</span>
                   </div>
                 </div>
               )}
             </Button>
            
           </TooltipTrigger>
           {collapsed && <TooltipContent side="right">Settings</TooltipContent>}
         </Tooltip>
         <Tooltip>
           <TooltipTrigger asChild>
             <Button
               variant="destructive"
               className={cn("flex items-center gap-2 w-full justify-start bg-red-500 hover:bg-red-600 text-white border-0", collapsed && "justify-center px-0")}
               onClick={() => logout()}
             >
               <LogOut className="w-5 h-5" />
               {!collapsed && <span>Log Out</span>}
             </Button>
           </TooltipTrigger>
           {collapsed && <TooltipContent side="right">Log Out</TooltipContent>}
         </Tooltip>
       </TooltipProvider>
       <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
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
