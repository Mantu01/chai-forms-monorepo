"use client"

import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { trpc } from "~/trpc/client"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
    isSubscribed: boolean
  }
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      router.push("/auth")
    },
  })

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className={user.isSubscribed ? "p-[2px] rounded-full flex items-center justify-center bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 animate-pulse" : "p-[2px] rounded-full flex items-center justify-center border"}>
                <Avatar className="h-7 w-7 rounded-full">
                  <AvatarImage src={user.avatar} alt={user.name} className="rounded-full" />
                  <AvatarFallback className="rounded-full">CN</AvatarFallback>
                </Avatar>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <div className={user.isSubscribed ? "p-[2px] rounded-full flex items-center justify-center bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600" : "p-[2px] rounded-full flex items-center justify-center border"}>
                  <Avatar className="h-7 w-7 rounded-full">
                    <AvatarImage src={user.avatar} alt={user.name} className="rounded-full" />
                    <AvatarFallback className="rounded-full">CN</AvatarFallback>
                  </Avatar>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2 w-full cursor-pointer">
                  <IconUserCircle className="size-4" />
                  <span>Account</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/billings" className="flex items-center gap-2 w-full cursor-pointer">
                  <IconCreditCard className="size-4" />
                  <span>Billing</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/notification" className="flex items-center gap-2 w-full cursor-pointer">
                  <IconNotification className="size-4" />
                  <span>Notifications</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => logoutMutation.mutate()} 
              disabled={logoutMutation.isPending}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <IconLogout className="size-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
