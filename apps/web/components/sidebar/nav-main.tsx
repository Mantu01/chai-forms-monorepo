"use client"

import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react"
import { Archive, Briefcase, Building, Building2, Compass, FileStack, FileText, GraduationCap, Group, LayoutDashboard, LayoutTemplate, MessageSquareText, OrigamiIcon, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Button } from "~/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar"

const MAIN_NAV = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Workspaces', url: '/workspaces', icon: Building2 },
  { title: 'Analytics', url: '/analytics', icon: Compass },
  { title: 'Submissions', url: '/submissions', icon: FileStack },
  { title: 'Community', url: '/community', icon: MessageSquareText },
  { title: 'Archived', url: '/archived', icon: Archive },
  { title: 'Templates', url: '/templates', icon: LayoutTemplate },
];

export function NavMain() {
  
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Quick Create"
              className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
            >
              <IconCirclePlusFilled />
              <span>Quick Create</span>
            </SidebarMenuButton>
            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
            >
              <IconMail />
              <span className="sr-only">Inbox</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {MAIN_NAV.map((item) => {
          const Icon = item.icon;
         const isActive = pathname === item.url || pathname.startsWith(`${item.url}/`);
            return (
               <SidebarMenuItem key={item.title}>
                <SidebarMenuButton tooltip={item.title} isActive={isActive} asChild>
                  <Link href={item.url}>
                    <Icon className="size-4" />
                    <span className="text-xs">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )})}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
