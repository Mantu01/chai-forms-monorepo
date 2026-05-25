import { Suspense } from "react"
import { AppSidebar } from "~/components/sidebar/app-sidebar"
import { SiteHeader } from "~/components/sidebar/site-header"
import {SidebarInset,SidebarProvider,} from "~/components/ui/sidebar"

import { ReactNode } from "react"

export default function Page({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <Suspense fallback={<div className="w-[var(--sidebar-width)] h-full bg-sidebar border-r" />}>
        <AppSidebar variant="inset" />
      </Suspense>
      <SidebarInset>
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
