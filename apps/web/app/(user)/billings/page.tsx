"use client";

import { trpc } from "~/trpc/client";
import { Spinner } from "~/components/ui/spinner";
import { BillingStatus } from "~/components/user/billing-status";
import { BillingPlans } from "~/components/user/billing-plans";

export default function UserBillingsPage() {
  const { data: userData, isLoading } = trpc.auth.me.useQuery();
  const user = userData?.user;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-10 text-xs text-muted-foreground bg-card rounded-xl border border-border">
        Please sign in to view billing details.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-4">
        <h1 className="text-lg font-bold tracking-tight">Billing Settings</h1>
        <p className="text-xs text-muted-foreground">Monitor plan levels, cycles, and upgrade subscriptions</p>
      </header>

      <div className="space-y-6 max-w-3xl">
        <BillingStatus isSubscribed={!!user.isSubscribed} />
        
        <div className="space-y-1.5">
          <h2 className="text-sm font-semibold">Available Plans</h2>
          <p className="text-2xs text-muted-foreground">Select a pricing model that fits your team size and usage limits</p>
        </div>
        
        <BillingPlans isSubscribed={!!user.isSubscribed} />
      </div>
    </div>
  );
}
