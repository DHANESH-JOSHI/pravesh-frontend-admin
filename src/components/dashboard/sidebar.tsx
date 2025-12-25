"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  FileText,
  Image,
  Building2,
  Users,
  FolderOpen,
  Box,
  Star,
  MapPin,
  Receipt,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Ruler,
  History,
  ScrollText,
} from "lucide-react"
import { NavUser } from "./nav-user"
import { Link } from "next-view-transitions"
import { usePathname } from "next/navigation"
import { User } from "@/types"

const allItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, roles: ["admin"] },
  { title: "Activities", url: "/activities", icon: History, roles: ["admin"] },
  { title: "Logs", url: "/logs", icon: ScrollText, roles: ["admin"] },
  { title: "Categories", url: "/categories", icon: FolderOpen, roles: ["admin"] },
  { title: "Brands", url: "/brands", icon: Building2, roles: ["admin"] },
  { title: "Units", url: "/units", icon: Ruler, roles: ["admin"] },
  { title: "Products", url: "/products", icon: Box, roles: ["admin"] },
  { title: "Banners", url: "/banners", icon: Image, roles: ["admin"] },
  { title: "Blogs", url: "/blogs", icon: FileText, roles: ["admin"] },
  { title: "Orders", url: "/orders", icon: Receipt, roles: ["admin", "staff"] },
  { title: "Reviews", url: "/reviews", icon: Star, roles: ["admin"] },
  { title: "Users", url: "/users", icon: Users, roles: ["admin"] },
  { title: "Addresses", url: "/addresses", icon: MapPin, roles: ["admin"] },
  { title: "Messages", url: "/messages", icon: MessageSquare, roles: ["admin"] },
  { title: "Settings", url: "/settings", icon: Settings, roles: ["admin"] },
]

export const AppSidebar = ({ user }: { user: User }) => {
  const pathname = usePathname()

  const items = allItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(user.role || "user");
  });

  return (
    <Sidebar className="border-r border-sidebar-border bg-background/90">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-4">
        <Link href={user.role === "staff" ? "/orders" : "/"} className="flex items-center gap-3">
          <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <LayoutDashboard className="size-5" />
          </div>
          <div className="grid flex-1 text-left leading-tight">
            <span className="truncate font-semibold text-[17px]">Pravesh</span>
            <span className="truncate text-xs opacity-60">
              {user.role === "staff" ? "Orders Dashboard" : "Admin Dashboard"}
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 py-5">
        <SidebarGroup>
          <SidebarMenu className="gap-1.5">
            {items.map((item) => {
              const isActive =
                pathname === item.url || pathname.startsWith(item.url + "/")

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    data-active={isActive}
                    className={`relative h-10 px-3 flex items-center gap-3 font-medium text-sm transition-all
                    hover:bg-slate-200
                    data-[active=true]:bg-primary/10 data-[active=true]:text-primary`}
                  >
                    <Link href={item.url}>
                      <div className="flex items-center gap-3">
                        <item.icon className={`size-5 ${isActive ? "scale-[1.15]" : "opacity-80"}`} />
                        <span className="text-[14px] tracking-wide">{item.title}</span>
                      </div>

                      {/* {isActive && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-primary-foreground/80" />
                      )} */}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <NavUser
          user={{
            name: user.name,
            email: user.email || "",
            avatar: user.img || "https://i.pravatar.cc/150?img=3",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
