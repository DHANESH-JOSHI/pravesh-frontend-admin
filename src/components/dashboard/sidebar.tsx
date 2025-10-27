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
import { Newspaper, Image as ImageIcon, Building2, Users, HelpCircle, Star } from "lucide-react"
import { NavUser } from "./nav-user"
import { Link } from "next-view-transitions"
import { User } from "@/types"
const items = [
  {
    title: "Blogs",
    url: "/blogs",
    icon: Newspaper,
  },
  {
    title: "Banners",
    url: "/banners",
    icon: HelpCircle,
  },
  {
    title: "Brands",
    url: "/brands",
    icon: Building2,
  },
  {
    title: "Categories",
    url: "/categories",
    icon: ImageIcon,
  },
  {
    title: "Orders",
    url: "/orders",
    icon: Star,
  },
  {
    title: "Products",
    url: "/products",
    icon: ImageIcon,
  },
  {
    title: "Reviews",
    url: "/reviews",
    icon: Star,
  },
  {
    title: "Users",
    url: "/users",
    icon: Users,
  }
]
export const AppSidebar = ({ user }: { user: User }) => {
  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" className="data-[slot=sidebar-menu-button]:p-3!">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Building2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-base">Pravesh</span>
                  <span className="truncate text-xs opacity-70">Admin Dashboard</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  className="h-10 px-3 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground transition-colors"
                >
                  <Link href={item.url} className="flex items-center gap-3">
                    <item.icon className="size-4" />
                    <span className="font-medium text-base">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <NavUser
          user={{
            name: user?.name!,
            email: user?.email!,
            avatar: "https://i.pravatar.cc/150?img=3",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  )
}