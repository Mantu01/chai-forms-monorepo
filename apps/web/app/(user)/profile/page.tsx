"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";
import { ProfileInfo } from "~/components/user/profile-info";

export default function UserProfilePage() {
  const router = useRouter();
  const { data: userData, isLoading: userLoading } = trpc.auth.me.useQuery();
  const user = userData?.user;

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      router.push("/login");
    },
  });

  if (userLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center border-b border-border pb-4">
        <div className="space-y-0.5">
          <h1 className="text-lg font-bold tracking-tight">Account Profile</h1>
          <p className="text-xs text-muted-foreground">Manage your identity details</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/workspaces">
            <Button variant="outline" size="sm" className="h-8 text-xs px-3">
              Go to Workspaces
            </Button>
          </Link>
          <Button
            variant="destructive"
            size="sm"
            className="h-8 text-xs px-3 cursor-pointer"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            Logout
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <ProfileInfo user={user} />
        </div>
      </div>
    </div>
  );
}
