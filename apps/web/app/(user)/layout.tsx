"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { trpc } from "~/trpc/client";
import Logo from "~/components/layout/logo";
import { IconUserCircle, IconNotification, IconCreditCard, IconChevronLeft } from "@tabler/icons-react";
import { Badge } from "~/components/ui/badge";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: invites } = trpc.workspace.getPendingInvites.useQuery();

  const links = [
    { href: "/profile", label: "Profile", icon: IconUserCircle },
    { href: "/notification", label: "Notifications", icon: IconNotification, badge: invites && invites.length > 0 ? invites.length : undefined },
    { href: "/billings", label: "Billings", icon: IconCreditCard },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="w-64 border-r border-border p-6 flex flex-col gap-6 bg-card shrink-0">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="text-base font-bold tracking-tight">Chai Form</span>
        </div>
        
        <Link href="/dashboard" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-1">
          <IconChevronLeft className="size-3.5" />
          <span>Back to Dashboard</span>
        </Link>
        
        <nav className="flex flex-col gap-1.5 flex-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="size-4" />
                  <span>{link.label}</span>
                </div>
                {link.badge !== undefined && (
                  <Badge variant={isActive ? "secondary" : "default"} className="h-5 px-1.5 text-[9px] font-bold">
                    {link.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 p-8 bg-background">
        {children}
      </main>
    </div>
  );
}
