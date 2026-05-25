"use client";

import { use } from "react";
import { trpc } from "~/trpc/client";
import { MembersTab } from "~/components/workspaces/members-tab";
import { Spinner } from "~/components/ui/spinner";

interface MembersPageProps {
  params: Promise<{ workspaceSlug: string }>;
}

export default function MembersPage({ params }: MembersPageProps) {
  const { workspaceSlug } = use(params);

  const { data: userData, isLoading: userLoading } = trpc.auth.me.useQuery();
  const userId = userData?.user?.id;

  const { data: workspace, isLoading: workspaceLoading } = trpc.workspace.getWorkspaceBySlug.useQuery(
    { slug: workspaceSlug },
    { enabled: !!workspaceSlug }
  );

  const workspaceId = workspace?.id;

  const { data: members, isLoading: membersLoading } = trpc.workspace.getWorkspaceMembers.useQuery(
    { workspaceId: workspaceId || "" },
    { enabled: !!workspaceId }
  );

  if (userLoading || workspaceLoading || membersLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!userData?.user || !workspace || !workspaceId) {
    return null;
  }

  const currentUserMember = members?.find((m) => m.userId === userId);
  const userRole = currentUserMember?.role;
  const isAdminOrOwner = userRole ? ["owner", "admin"].includes(userRole) : false;

  return (
    <div className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <main className="mt-4">
          <MembersTab workspaceId={workspaceId} isAdminOrOwner={isAdminOrOwner} workspaceSlug={workspaceSlug} />
        </main>
      </div>
    </div>
  );
}
