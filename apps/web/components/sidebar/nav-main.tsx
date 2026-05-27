import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react"
import { Archive, Building2, LayoutDashboard, LayoutTemplate, MessageSquareText, Globe, FileCheck } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { trpc } from "~/trpc/client"
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
  {title:"Submissions",url:'/submissions',icon:FileCheck},
  { title: 'Community', url: '/community', icon: MessageSquareText },
  { title: 'Explore', url: '/explore', icon: Globe },
  { title: 'Archived', url: '/archived', icon: Archive },
  { title: 'Templates', url: '/templates', icon: LayoutTemplate },
];

export function NavMain() {
  const pathname = usePathname();
  const { data: invites } = trpc.workspace.getPendingInvites.useQuery();

  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent className="flex flex-col gap-2">
          <SidebarMenu>
            <SidebarMenuItem className="flex items-center gap-2">
              <Link href="?quick-create=true" scroll={false} className="flex-1">
                <SidebarMenuButton
                  tooltip="Quick Create"
                  className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground cursor-pointer w-full"
                >
                  <IconCirclePlusFilled />
                  <span>Quick Create</span>
                </SidebarMenuButton>
              </Link>
              <Link href="?notifications=true">
                <Button
                  size="sm"
                  className="h-8 group-data-[collapsible=icon]:opacity-0 cursor-pointer gap-1.5 px-2"
                  variant="outline"
                >
                  <IconMail className="size-4" />
                  {invites && invites.length > 0 && (
                    <span className="rounded-full bg-red-500 text-white font-bold text-[10px] px-1.5 py-0.5">
                      {invites.length}
                    </span>
                  )}
                  <span className="sr-only">Inbox</span>
                </Button>
              </Link>
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
    </>
  )
}
