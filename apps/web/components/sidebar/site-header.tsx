'use client';

import { usePathname } from 'next/navigation';
import { Separator } from '~/components/ui/separator';
import { SidebarTrigger } from '~/components/ui/sidebar';
import { ThemeToggle } from '~/components/layout/theme-toggle';
import Link from 'next/link';
import { Button } from '~/components/ui/button';
import { User } from 'lucide-react';

export function SiteHeader() {
  const pathname = usePathname();

  const title = pathname.split("/").filter(Boolean)[0] ?? "WorkSpace";

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b border-border transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-2 px-4 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-4" />
        <h1
          className="text-sm font-black tracking-tight"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          {title}
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline" size="icon" className="size-8 border-border/40" asChild>
            <Link href='/profile'>
              <User className="size-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}